'use strict'

const Schema = use('Schema')

class JobSchema extends Schema {
  up () {
    this.create('jobs', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('device_id').unsigned().references('id').inTable('devices')
      table.integer('file_id').unsigned().references('id').inTable('files').onDelete('cascade');
      table.timestamps()
    })
  }

  down () {
    this.drop('jobs')
  }
}

module.exports = JobSchema
