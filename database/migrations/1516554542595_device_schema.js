'use strict'

const Schema = use('Schema')

class DeviceSchema extends Schema {
  up () {
    this.create('devices', (table) => {
      table.increments()
      table.string('name', 40)
      table.string('mac_address', 100).notNullable().unique()
      table.string('type', 40)
      table.string('ip', 200)
      table.integer('port')
      table.boolean('active').notNullable()
      table.boolean('on_off').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('devices')
  }
}

module.exports = DeviceSchema
