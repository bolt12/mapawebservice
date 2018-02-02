'use strict'

const net = require('net')

class TorrentController {

  async add ( {request, response} ) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work
    const { magnetURI } = request.all();

    let sourceIface = '127.0.0.1',
        sourcePort = 2121,
        socket;

    function sendCommand(torrentId) {
      let query;

      query = `Add ${torrentId}`;

      /* Send query on each socket */
      socket.write(query);
    }

    /* Connects to the light bulb server and issues command */
    function createConnection() {
      socket = net.connect(sourcePort, sourceIface, () => {
        console.log('Adding torrent to be downloaded...');
        sendCommand(magnetURI);
      });

      socket.on('data', (chunk, info) => {
        const message = chunk.toString();
        const res = JSON.parse(message);
        socket.destroy();
        response.json(res);
      });

      socket.on('close', function() {
        console.log('Connection closed');
      });

    }

    createConnection();

  }

  async all ( {request, response} ) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work
    let sourceIface = '127.0.0.1',
        sourcePort = 2121,
        socket;

    function sendCommand() {
      let query;

      query = "All";

      /* Send query on each socket */
      socket.write(query);
    }

    /* Connects to the light bulb server and issues command */
    function createConnection() {
      socket = net.connect(sourcePort, sourceIface, () => {
        console.log('Checking torrent...');
        sendCommand();
      });

      socket.on('data', (chunk, info) => {
        const message = chunk.toString();
        const res = JSON.parse(message);
        socket.destroy();
        response.json(res);
      });

      socket.on('close', function() {
        console.log('Connection closed');
      });
    }

    createConnection();

  }

  async check ( {request, response} ) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work
    const { magnetURI, property } = request.all();

    let sourceIface = '127.0.0.1',
        sourcePort = 2121,
        socket;

    function sendCommand(torrentId, property) {
      let query;

      query = `Check ${property} ${torrentId}`;

      /* Send query on each socket */
      socket.write(query);
    }

    /* Connects to the light bulb server and issues command */
    function createConnection() {
      socket = net.connect(sourcePort, sourceIface, () => {
        console.log('Checking torrent...');
        sendCommand(magnetURI, property);
      });

      socket.on('data', (chunk, info) => {
        const message = chunk.toString();
        const res = JSON.parse(message);
        socket.destroy();
        response.json(res);
      });

      socket.on('close', function() {
        console.log('Connection closed');
      });
    }

    createConnection();

  }

  async pause ( {request, response} ) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work
    const { magnetURI } = request.all();

    let sourceIface = '127.0.0.1',
        sourcePort = 2121,
        socket;

    function sendCommand(torrentId) {
      let query;

      query = `Pause ${torrentId}`;

      /* Send query on each socket */
      socket.write(query);
    }

    /* Connects to the light bulb server and issues command */
    function createConnection() {
      socket = net.connect(sourcePort, sourceIface, () => {
        console.log('Adding torrent to be downloaded...');
        sendCommand(magnetURI);
      });

      socket.on('data', (chunk, info) => {
        const message = chunk.toString();
        const res = JSON.parse(message);
        socket.destroy();
        response.json(res);
      });

      socket.on('close', function() {
        console.log('Connection closed');
      });
    }

    createConnection();

  }

  async resume ( {request, response} ) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work
    const { magnetURI } = request.all();

    let sourceIface = '127.0.0.1',
        sourcePort = 2121,
        socket;

    function sendCommand(torrentId) {
      let query;

      query = `Resume ${torrentId}`;

      /* Send query on each socket */
      socket.write(query);
    }

    /* Connects to the light bulb server and issues command */
    function createConnection() {
      socket = net.connect(sourcePort, sourceIface, () => {
        console.log('Adding torrent to be downloaded...');
        sendCommand(magnetURI);
      });

      socket.on('data', (chunk, info) => {
        const message = chunk.toString();
        const res = JSON.parse(message);
        socket.destroy();
        response.json(res);
      });

      socket.on('close', function() {
        console.log('Connection closed');
      });
    }

    createConnection();

  }

}

module.exports = TorrentController
