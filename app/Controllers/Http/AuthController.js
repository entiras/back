'use strict'

const { validate } = use('Validator')
const User = use('App/Models/User')
const PasswordReset = use('App/Models/PasswordReset')
const Env = use('Env')
const Mail = use('Mail')
const Hash = use('Hash')
const jwt = require('jsonwebtoken')

//response.clearCookie('test');

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
    const token = request.input('token').replace(/\s+/g, "");;
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
    if (request.cookie('captcha') !== request.input('captcha')) {
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
        type: 'danger',
        message: 'late'
      });
    }
    const token = jwt.sign({ e: user.email }, Env.get('SECRET'), {
      expiresIn: '3d'
    });
    const data = {
      username: user.username,
      token: token
    };
    if (user.sent < 5) {
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
  async login({ session, request, response, auth }) {
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
    if (!user.verified) {
      return response.json({
        type: 'danger',
        message: 'unconfirmed'
      });
    }
    const correct = await Hash.verify(request.input('password'), user.password);
    if (!correct) {
      return response.json({
        type: 'danger',
        message: 'credentials'
      });
    }
    await auth.login(user);
    response.plainCookie('user', user.username, { path: '/' });
    return response.json({
      type: 'success',
      message: 'logged'
    });
  }
  /*async reset({response, request, session}) {
    const validation = await validate(
      request.all(), {
        token: 'required',
        password: 'required|min:4'
    })
    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept('password')
      session.flash({
        notification: {
          type: 'danger',
          message: 'Corrija los campos indicados'
        }
      })
      return response.redirect('back')
    }
    const payload
    try {
      payload = await jwt.verify(request.input('token'), Env.get('SECRET'))
    } catch(err) {
      session.flash({
        notification: {
          type: 'danger',
          message: 'El enlace es inv\u00e1lido o ha caducado'
        }
      })
      return response.redirect('back')
    }
    const user = await User.findBy('email', payload.email);
    if (!user){
      session.flash({
        notification: {
          type: 'danger',
          message: 'El usuario no existe'
        }
      })
      return response.redirect('back')
    }
    const passwordReset = await PasswordReset.query()
      .where('email', payload.email)
      .where('token', request.input('token'))
      .first()
    if (!passwordReset){
      session.flash({
        notification: {
          type: 'danger',
          message: 'No se ha solicitado cambiar la contrase\u00f1a'
        }
      })
      return response.redirect('back')
    }
    user.password = request.input('password');
    await user.save()
    await passwordReset.delete()
    session.flash({
      notification: {
        type: 'success',
        message: 'Contrase\u00f1a actualizada'
      }
    })
    return response.redirect('back')
  }
  async forgot({request, response, session}) {
    const validation = await validate(
      request.all(), {
      email: 'required|email'
    })
    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept('password')
      session.flash({
        notification: {
          type: 'danger',
          message: 'Corrija los campos indicados'
        }
      })
      return response.redirect('back')
    }
    const user = await User.findBy('email', request.input('email'))
    if (!user){
      session.flash({
        notification: {
          type: 'success',
          message: 'Correo enviado'
        }
      })
      return response.redirect('back')
    }
    await PasswordReset.query().where('email', user.email).delete()
    const token = jwt.sign({email: user.email}, Env.get('SECRET'), {
      expiresIn: 60 * 60 * 24 * 3
    })
    await PasswordReset.create({
      email: user.email,
      token: token
    })
    await Mail.send('emails.reset', {
      username: user.username,
      token: token,
      appUrl: Env.get('APP_URL')
    }, (message) => {
      message.to(user.email).from(Env.get('FROM_EMAIL'))
      .subject('Puedes cambiar tu contrase\u00f1a')
    })
    session.flash({
      notification: {
        type: 'success',
        message: 'Correo enviado'
      }
    })
    return response.redirect('back')
  }
  async logout({auth, response}) {
    await auth.logout()
    return response.redirect('/')
  }*/
}

module.exports = AuthController;
