'use strict'

const User = use('App/Models/User');
const Token = use('App/Models/Token');
const AuthController = use('App/Controllers/Http/AuthController');
const Encryption = use('Encryption');

class UserController {
  async index ({ request, response, auth }) {
    const users = await User.query().where('active', 1).fetch();

    response.json(users);
  }

  async create () {
  }

  async store ( {request, response} ) {
    const user = new User();

    const body = request.except('_method', '_csrf', 'submit');
    user.fill(body);

    await user.save();

    response.json(user);
  }

  async show ( {request, response, params} ) {

    const id = params.id;
    
    const user = await User.findOrFail(id);

    response.json(user);
  }

  async edit () {
  }

  async update ( {request, response, params} ) {

    const id = params.id;
    const user = await User.findOrFail(id);
    const body = request.except('_method', '_csrf', 'submit');

    user.fill(body);
    await user.save();

    response.json(user);
  }

  async destroy ( {request, response, params, auth} ) {

    const id = params.id;
    const user = await User.findOrFail(id);

    user.active = false;

    const token = auth.getAuthHeader();

    await user
            .tokens()
            .where('token', Encryption.decrypt(token))
            .update({ is_revoked: true });

    await user.save();

    response.json(user);
  }
}

module.exports = UserController
