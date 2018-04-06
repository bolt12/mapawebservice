'use strict'

const User = use("App/Models/User")
const Encryption = use('Encryption');

class AuthController {

  async login( {request, response, auth} ){
    const credentials = request.except(['csrf_token', 'submit']);

    const token = await auth.attempt(credentials.username, credentials.password);

    const user = await User.findBy('username', credentials.username);

    response.json({type: token.type, token: token.token, username: user.username, user_id: user.id});
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
