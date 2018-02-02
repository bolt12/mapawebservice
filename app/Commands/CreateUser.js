'use strict'

const { Command } = require('@adonisjs/ace')
const User = use('App/Models/User')

class CreateUser extends Command {
  static get signature () {
    return 'create:user {username} {email} {password}'
  }

  static get description () {
    return 'Creates a new User'
  }

  async handle (args, options) {
    const user = new User();

    user.username = args.username;
    user.email = args.email;
    user.password = args.password;
    user.active = true;

    try {
      const success = await user.save();
      this.info(`User ${args.username} created`);
    } catch (e) {
      this.info(`Error creating User: ${e}`);
    }
  }
}

module.exports = CreateUser
