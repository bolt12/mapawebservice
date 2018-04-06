'use strict'

const Device = use('App/Models/Device')
const File = use('App/Models/File')
const User = use('App/Models/User')
const Job = use('App/Models/Job')
const Helpers = use('Helpers')

class DeviceController {
  async index({ request, response }) {

    const devices = await Device.query().where('active', 1).fetch();

    response.json(devices);
  }

  async create() {
  }

  async store({ request, response }) {

    const body = request.except('_method', '_csrf', 'submit');

    const device = new Device();

    device.fill(body);

    await device.save();

    response.json(device);
  }

  async show({ request, response, params }) {

    const id = params.id;

    const device = await Device.findOrFail(id);

    response.json(device);
  }

  async edit() {
  }

  async update({ request, response, params }) {

    const id = params.id;

    const device = await Device.findOrFail(id);

    const body = request.except('_method', '_csrf', 'submit');

    device.name = body.name;
    device.type = body.type;

    await device.save();

    response.json(device);
  }

  async destroy({ request, response, params }) {

    const id = params.id;

    const device = await Device.findOrFail(id);

    device.active = false;
    await device.save();

    response.json(device);
  }

  async scan({ request, response }) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work
    const dgram = require('dgram');
    const { id } = request.all();

    const device = await Device.findOrFail(id); // If there's no device in db abort

    let ssdpAddress = '239.255.255.250',
        ssdpPort = device.type === 'led' ? 1982 : 1900,
        sourceIface = '0.0.0.0',
        sourcePort = 1234,
        searchTarget = device.type === 'led' ? 'wifi_bulb' : 'upnp:rootdevice',
        active = false,
        socket;

    /* Sends a M-SEARCH message to the specified host through socket */
    function broadcastSsdp() {
      let query;

      query = new Buffer(
        'M-SEARCH * HTTP/1.1\r\n'
        + 'HOST: ' + ssdpAddress + ':' + ssdpPort + '\r\n'
        + 'MAN: "ssdp:discover"\r\n'
        + 'MX: 1\r\n'
        + 'ST: ' + searchTarget + '\r\n'
        + '\r\n'
      );

      /* Send query on each socket */
      socket.send(query, 0, query.length, ssdpPort, ssdpAddress);
      /* After a timeout closes socket and sends a response with the info about the device */
      setTimeout(() => {
        socket.close();
        device.on_off = active;
        device.save();
        response.json({ ip: device.ip, active: active });
      }, 1000);
    }

    /* Creates a udp socket server to scan for the device */
    function createSocket() {
      socket = dgram.createSocket('udp4');
      socket.on('listening', function () {
        console.log('scanning...');

        broadcastSsdp();
      });

      /* If a message is received, get its info */
      socket.on('message', function (chunk, info) {
        var message = chunk.toString();
        let msg = message.toString().trim().split('\r\n');
        msg.forEach(line => {
          if(info.address == device.ip) {
            active = true;
          }
        });
      });

      socket.on('close', function() {
        console.log('Connection closed');
      });

      console.log('binding to', sourceIface + ':' + sourcePort);
      socket.bind(sourcePort, sourceIface);
    }

    createSocket();
  }
}

module.exports = DeviceController
