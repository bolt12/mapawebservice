'use strict'

const Model = use('Model')

class Device extends Model {

  files () {
    return this.hasMany('App/Models/File');
  }

  jobs () {
    return this.hasMany('App/Models/Job');
  }
}

module.exports = Device
