'use strict'

const Schema = use('Schema')

class FileSchema extends Schema {
  up () {
    this.create('files', (table) => {
      table.increments()
      table.string('name', 80).notNullable()
      table.string('folder', 20).index()
      table.string('path', 190).unique().notNullable()
      table.string('type', 40).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('files')
  }
}

module.exports = FileSchema
