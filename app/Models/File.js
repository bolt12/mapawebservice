'use strict'

const Model = use('Model')

class File extends Model {

  jobs () {

    return this.hasMany('App/Models/Job');
    
  }
}

module.exports = File
