'use strict'

const { validate } = use('Validator');
const User = use('App/Models/User');
const PasswordReset = use('App/Models/PasswordReset');
const Env = use('Env');
const Mail = use('Mail');
const Hash = use('Hash');
const jwt = use('jsonwebtoken');

class AuthController {
  async signup({ request, response, view }) {
    const validation = await validate(
      request.all(), {
      email: 'required|email',
      username: 'required',
      password: 'required|min:4'
    });
    if (validation.fails()) {
      return response.json({
        type: 'danger',
        message: 'validation',
        error: validation._errorMessages[0]
      });
    }
    const url = new URL('https://domain.top');
    url.username = request.input('username');
    if (url.username !== request.input('username')) {
      // url unsafe
      return response.json({
        type: 'danger',
        message: 'url'
      });
    }
    const clone = await User.findBy('email', request.input('email'))
      || await User.findBy('username', request.input('username'))
    if (clone) {
      return response.json({
        type: 'danger',
        message: 'clone'
      });
    }
    const user = await User.create({
      email: request.input('email'),
      username: request.input('username'),
      password: request.input('password'),
      verified: false
    });
    const token = jwt.sign({ e: user.email }, Env.get('SECRET'), {
      expiresIn: '3d'
    });
    const data = {
      username: user.username,
      token: token
    };
    await Mail.raw(view.render('emails.confirm.text', data), (message) => {
      message.to(user.email);
      message.from(Env.get('FROM_EMAIL'));
      message.subject(view.render('emails.confirm.subject'));
    });
    return response.json({
      type: 'success',
      message: 'sent'
    });
  }
  async confirm({ response, request }) {
    const token = (request.input('token') || '').replace(/\s+/g, "");
    var payload;
    try {
      payload = await jwt.verify(token, Env.get('SECRET'));
    } catch (err) {
      return response.json({
        type: 'danger',
        message: 'invalid'
      });
    }
    const user = await User.findBy('email', payload.e);
    if (!user) {
      return response.json({
        type: 'danger',
        message: 'user'
      });
    }
    if (user.verified) {
      return response.json({
        type: 'danger',
        message: 'late'
      });
    }
    user.verified = true;
    await user.save();
    return response.json({
      type: 'success',
      message: 'confirmed'
    });
  }
  async resend({ request, response, view }) {
    const captcha = request.cookie('captcha', '');
    response.clearCookie('captcha');
    if (captcha !== request.input('captcha') || captcha === '') {
      return response.json({
        type: 'danger',
        message: 'captcha'
      });
    }
    const validation = await validate(
      request.all(), {
      email: 'required|email'
    });
    if (validation.fails()) {
      return response.json({
        type: 'danger',
        message: validation._errorMessages[0].validation
      });
    }
    const user = await User.findBy('email', request.input('email'));
    if (!user) {
      return response.json({
        type: 'success',
        message: 'sent'
      });
    }
    if (user.verified) {
      return response.json({
        type: 'success',
        message: 'sent'
      });
    }
    const token = jwt.sign({ e: user.email }, Env.get('SECRET'), {
      expiresIn: '3d'
    });
    const data = {
      username: user.username,
      token: token
    };
    if (user.sent < 10) {
      await Mail.raw(view.render('emails.confirm.text', data), (message) => {
        message.to(user.email);
        message.from(Env.get('FROM_EMAIL'));
        message.subject(view.render('emails.confirm.subject'));
      });
      user.sent++;
      await user.save();
    }
    return response.json({
      type: 'success',
      message: 'sent'
    });
  }
  async login({ request, response, auth }) {
    var logged;
    try {
      logged = await auth.getUser();
    } catch (error) {
      logged = null;
    }
    if (logged) {
      response.status(403);
      return response.json({
        type: 'danger',
        message: 'late'
      });
    }
    const validation = await validate(
      request.all(), {
      username: 'required',
      password: 'required|min:4'
    });
    if (validation.fails()) {
      return response.json({
        type: 'danger',
        message: 'validation',
        error: validation._errorMessages[0]
      });
    }
    const user = await User.findBy('username', request.input('username'));
    if (!user) {
      return response.json({
        type: 'danger',
        message: 'credentials'
      });
    }
    const correct = await Hash.verify(request.input('password'), user.password);
    if (!correct) {
      return response.json({
        type: 'danger',
        message: 'credentials'
      });
    }
    if (!user.verified) {
      return response.json({
        type: 'danger',
        message: 'unconfirmed'
      });
    }
    await auth.remember(true).login(user);
    response.plainCookie('user', user.username, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 5 + 108000
    });
    return response.json({
      type: 'success',
      message: 'logged'
    });
  }
  async logout({ auth, response }) {
    await auth.logout();
    return response.clearCookie('user');
  }
  async forgot({ request, response, view }) {
    const captcha = request.cookie('captcha', '');
    response.clearCookie('captcha');
    if (captcha !== request.input('captcha') || captcha === '') {
      return response.json({
        type: 'danger',
        message: 'captcha'
      });
    }
    const validation = await validate(
      request.all(), {
      email: 'required|email'
    });
    if (validation.fails()) {
      return response.json({
        type: 'danger',
        message: validation._errorMessages[0].validation
      });
    }
    const user = await User.findBy('email', request.input('email'));
    if (!user) {
      return response.json({
        type: 'success',
        message: 'sent'
      });
    }
    await PasswordReset.query().where('email', user.email).delete();
    const token = jwt.sign({ e: user.email }, Env.get('SECRET'), {
      expiresIn: '2h'
    });
    await PasswordReset.create({
      email: user.email,
      token: token
    });
    const data = {
      username: user.username,
      token: token
    };
    await Mail.raw(view.render('emails.reset.text', data), (message) => {
      message.to(user.email);
      message.from(Env.get('FROM_EMAIL'));
      message.subject(view.render('emails.reset.subject'));
    });
    return response.json({
      type: 'success',
      message: 'sent'
    });
  }
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
