'use strict'

const { validate } = use('Validator');
const User = use('App/Models/User');
const PasswordReset = use('App/Models/PasswordReset');
const Env = use('Env');
const Mail = use('Mail');
const Hash = use('Hash');
const jwt = use('jsonwebtoken');

class AuthController {
  async reset({ response, request }) {
    const token = (request.input('token') || '').replace(/\s+/g, '');
    var payload;
    try {
      payload = await jwt.verify(token, Env.get('SECRET'));
    } catch (err) {
      return response.json({
        type: 'danger',
        message: 'invalid'
      });
    }
    const validation = await validate(
      request.all(), {
      password: 'required|min:4'
    });
    if (validation.fails()) {
      return response.json({
        type: 'danger',
        message: validation._errorMessages[0].validation
      });
    }
    const user = await User.findBy('email', payload.e);
    if (!user) {
      return response.json({
        type: 'success',
        message: 'changed'
      });
    }
    const passwordReset = await PasswordReset.query()
      .where('email', payload.e)
      .where('token', token)
      .first();
    if (!passwordReset) {
      return response.json({
        type: 'success',
        message: 'changed'
      });
    }
    user.password = request.input('password');
    await user.save();
    await passwordReset.delete();
    return response.json({
      type: 'success',
      message: 'changed'
    });
  }
}

module.exports = AuthController;
