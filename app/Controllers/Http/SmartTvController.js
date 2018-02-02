'use strict'

const Device = use('App/Models/Device')
const fetch = require('node-fetch')
const request = require('request')
const parseString = require('xml2js').parseString;

class SmartTvController {

  async displayKey({ request, response }) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work

    const { id } = request.all();

    const smartTv = await Device.findOrFail(id);

    const reqKey = "<?xml version=\"1.0\" encoding=\"utf-8\"?><auth><type>AuthKeyReq</type></auth>";

    fetch(`http://${smartTv.ip}:8080/roap/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/atom+xml"
      },
      body: reqKey
    }).then(response => response.text()).then(txt => {

      parseString(txt, function (err, result) {
        response.json(result.envelope);

      })
    }).catch(err => {console.log(err)});
  }

  async getSessionId( {request, response} ) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work

    const { id, pairingKey } = request.all();

    const smartTv = await Device.findOrFail(id);

    const pairCmd = "<?xml version=\"1.0\" encoding=\"utf-8\"?><auth><type>AuthReq</type><value>" + pairingKey + "</value></auth>";

    fetch(`http://${smartTv.ip}:8080/roap/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/atom+xml"
      },
      body: pairCmd
    }).then(response => response.text()).then(txt => {
      parseString(txt, function (err, result) {
        response.json(result.envelope);

      })
    }).catch(err => {console.log(err)});
  }

  async handleCommand ( {request, response} ) {

    response.implicitEnd = false; // Enable response to be called in a callback. Otherwise won't work

    const { id, cmdCode } = request.all();

    const smartTv = await Device.findOrFail(id);

    const cmdText = "<?xml version=\"1.0\" encoding=\"utf-8\"?><command>" +
                    "<name>HandleKeyInput</name><value>" +
                    cmdCode +
                    "</value></command>";

    fetch(`http://${smartTv.ip}:8080/roap/api/command`, {
      method: "POST",
      headers: {
        "Content-Type": "application/atom+xml"
      },
      body: cmdText
    }).then(response => response.text()).then(txt => {

      parseString(txt, function (err, result) {
        response.json(result.envelope);
      })
    }).catch(err => {console.log(err)});
  }

}

module.exports = SmartTvController
