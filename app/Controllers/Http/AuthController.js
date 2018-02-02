'use strict'

const User = use("App/Models/User")
const Encryption = use('Encryption');

class AuthController {

  async login( {request, response, auth} ){
    const credentials = request.except(['csrf_token', 'submit']);

    const token = await auth.attempt(credentials.username, credentials.password);

    response.json(token);
  }

  async logout ( {response, auth} ) {

    const user = auth.current.user;

    const token = auth.getAuthHeader();

    await user
            .tokens()
            .where('token', Encryption.decrypt(token))
            .update({ is_revoked: true });

    response.json(user);
  }

}

module.exports = AuthController
