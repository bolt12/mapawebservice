const { hooks } = require('@adonisjs/ignitor')

hooks.after.httpServer(() => {

  const Helpers = use('Helpers')
  const WebTorrent = require('webtorrent')
  const Device = use('App/Models/Device');
  const File = use('App/Models/File');
  const execSync = require('child_process').execSync;
  const dgram = require('dgram');
  const net = require('net');

  let ssdpAddress = '239.255.255.250'
    , ssdpPort1 = 1900
    , ssdpPort2 = 1982
    , sourceIface = '0.0.0.0'
    , sourcePort = 1235
    , searchTarget1 = 'upnp:rootdevice'
    , searchTarget2 = 'wifi_bulb'
    , socket;

  function broadcastSsdp() {
    let query1, query2;

    /* Searches for all devices */
    query1 = new Buffer(
      'M-SEARCH * HTTP/1.1\r\n'
      + 'HOST: ' + ssdpAddress + ':' + ssdpPort1 + '\r\n'
      + 'MAN: "ssdp:discover"\r\n'
      + 'MX: 1\r\n'
      + 'ST: ' + searchTarget1 + '\r\n'
      + '\r\n'
    );

    /* Searches for all Yeelight LED Bulbs */
    query2 = new Buffer(
      'M-SEARCH * HTTP/1.1\r\n'
      + 'HOST: ' + ssdpAddress + ':' + ssdpPort2 + '\r\n'
      + 'MAN: "ssdp:discover"\r\n'
      + 'MX: 1\r\n'
      + 'ST: ' + searchTarget2 + '\r\n'
      + '\r\n'
    );
    // Send query for any device in the network
    socket.send(query1, 0, query1.length, ssdpPort1, ssdpAddress);
    // Send query for Yeelight LED Bulbs
    socket.send(query2, 0, query2.length, ssdpPort2, ssdpAddress);
  }

  function createDiscoveryServer() {
    socket = dgram.createSocket('udp4');
    socket.on('listening', function () {
      console.log('Discovery server starting...');

      /* Gets all devices that are on */
      let today = new Date();
      today = today.toISOString();
      const devices = Device.query().where('on_off', 1).fetch();

      /* Sets all devices to off */
      devices.then((dev) => {
        if (dev != null) {
          dev.rows.forEach((dev) => {
            dev.on_off = false;
            dev.save();
          });
        }
        broadcastSsdp();
        setInterval(broadcastSsdp, 300000);
      });
    });

    socket.on('message', async (chunk, info) => {
      var message = chunk.toString();
      let msg = message.toString().trim().split('\r\n');

      let ip = info.address;
      const stdout = execSync("arp -a " + ip).toString();
      const mac_address = stdout.split(" ")[3];
      const device = Device.findBy('mac_address', mac_address);
      device.then((device) => {
        if (device == null) {
          device = new Device();
          device.mac_address = mac_address;
          device.ip = ip;
          device.active = true;
          device.on_off = true;

          msg.forEach(line => {

            const [key, value] = line.split(": ");
            if (value != undefined && value.includes("yeelight")) {
              let aux = value.split("yeelight://")[1].split(":");
              device.port = parseInt(aux[1]);
              device.type = 'led';
            }
            if (key != undefined && key == "name") {
              device.name = value;
            }
          });

          console.log("New device found: " + mac_address + " at " + ip);
        }
        else {
          device.ip = ip;
          device.on_off = true;
          console.log("Device " + device.name + " is on at " + ip);
        }

        device.save().catch((err) => { });
      }).catch((err) => { });
    });

    socket.on('close', function () {
      console.log('Connection closed');
    });

    socket.bind(sourcePort, sourceIface);
  }

  function broadcast(message, sender, clients) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      client.write(message);
    });
  }

  function createChatServer() {
    const clients = new Map();

    const server = net.createServer((client) => {
      let name = "";

      /* Set the events */
      client.on('data', (message) => {
        const msg = message.toString().trim();

        // Exit protocol
        if (msg == "/exit") client.destroy();
        else {
          /*
          When a connection is established the client shall ask for the client
          desired name.
          The first message string is the answer to that question.
          After the name is set the client is added to the clients list.

          TODO: 
          - Add more user interaction protocols. For example:
            - Change username.
            - Whisper to someone.
            - Etc...
          */
          if (name == "") {
            if (!clients.has(msg)) {
              name = msg;
              clients.set(name, client);
              client.write("Server_User_Accepted\n")
            }
            else {
              client.write("Server_User_Unaccepted\n")
            }
          }
          else {
            broadcast(name + " : " + msg + "\n", client, clients);
          }
        }
      });
      client.on('end', () => {
        console.log('Client disconnected');
        clients.delete(name);
      });
      client.on('close', () => {
        console.log('Client disconnected');
        clients.delete(name);
      });


    });

    server.on('connection', () => {
      console.log("New chat server connection");
    });
    server.on('listening', () => {
      console.log("Chat server starting...");
    });

    server.listen(1212, '127.0.0.1');
  }

  function createTorrentServer() {

    const client = new WebTorrent();

    const server = net.createServer((connection) => {

      connection.on('data', (message) => {
        const msg = message.toString().trim().split(" ");
        let torrentId = "",
          torrent = null,
          response = null;

        const opts = {
          path: Helpers.publicPath('torrents')
        }

        client.on('error', function (err) {
          console.log(err.toString());
        });

        switch (msg[0]) {
          /* Add torrent protocol string, "Add <torrentId>" */
          case 'Add':
            torrentId = msg[1];

            /* Check if already downloaded torrent */
            if (client.get(torrentId) == null) {

              /* New file instance */
              const file = new File();

              /* Downloads torrent */
              torrent = client.add(torrentId, opts, (torr) => {

                /* Gets main file */
                const mainFile = torr.files.find((file) => {
                  return file.name.endsWith('.mp4') || file.name.endsWith('.avi') || file.name.endsWith('.mkv');
                });

                file.name = mainFile.name;
                file.folder = "torrents";
                file.path = opts.path + "/" + mainFile.path;
                file.type = mainFile.name.split('.')[1];

                /* Upon torrent download completed save file to db */
                torr.on('done', () => {
                  file.save().catch((err) => { });
                });

                connection.write(JSON.stringify(file));

              });
            }
            else {
              connection.write(JSON.stringify({
                error: "Duplicate torrent"
              }));
            }
            break;
          case "All":
            connection.write(JSON.stringify(client.torrents.map((t) => {
              const torrent = {};
              torrent.name = t.name;
              torrent.magnetURI = t.magnetURI;
              torrent.timeRemaining = t.timeRemaining;
              torrent.downloadSpeed = t.downloadSpeed;
              torrent.progress = t.progress;
              return torrent;
            })));
            break;
          /* 
          Checks information about a certain torrent.
          Supports all the properties that torrent object has.
          Protocol: Check <property> <torrentId>
          */
          case 'Check':
            torrentId = msg[2];
            torrent = client.get(torrentId);
            const response = {};
            response[msg[1]] = torrent[msg[1]];
            connection.write(JSON.stringify(response));
            break;
          /* Pause torrent protocol string, Pause <torrentId> */
          case 'Pause':
            torrentId = msg[1];
            torrent = client.get(torrentId);
            response = {};
            response.progress = torrent.progress;
            torrent.pause();
            connection.write(JSON.stringify(response));
            break;
          /* Resume torrent protocol string, Resume <torrentId> */
          case 'Resume':
            torrentId = msg[1];
            torrent = client.get(torrentId);
            response = {};
            response.progress = torrent.progress;
            torrent.resume();
            connection.write(JSON.stringify(response));
            break;
          default:
            response = {};
            response.error = "Invalid method";
            connection.write(JSON.stringify(response));
            break;
        }
      });

      connection.on('end', () => {
        console.log('Client disconnected');
      });

    });

    server.on('connection', () => {
      console.log("New torrent server connection");
    });
    server.on('listening', () => {
      console.log("WebTorrent server starting...");
    });

    server.listen(2121, '127.0.0.1');
  }

  createTorrentServer();
  createChatServer();
  createDiscoveryServer();

})
