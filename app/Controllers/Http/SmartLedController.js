'use strict'

const Device = use('App/Models/Device')

class SmartLedController {

  async handleCommand ( {request, response, auth} ) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work
    const user_id = auth.current.user.id;
    const net = require('net')
    const { id, method, params } = request.all();

    const device = await Device.findOrFail(id); // If there's no device in db abort

    let socket;

    /* Sends a command message to the specified host through socket */
    function sendCommand(id, method, params) {
      let query;

      query = `{ "id": ${id}, "method": ${method}, "params": ${params} }\r\n`;

      /* Send query on each socket */
      socket.write(query);
    }

    /* Connects to the light bulb server and issues command */
    function createConnection() {
      socket = net.connect(device.port, device.ip, () => {
        console.log('Sending command...');
        sendCommand(user_id, method, params);
      });

      socket.on('data', (chunk, info) => {
        const message = chunk.toString();
        socket.destroy();
        response.json(message);
      });

      socket.on('close', function() {
        console.log('Connection closed');
      });
    }

    createConnection();

  }

}

module.exports = SmartLedController
