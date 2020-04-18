'use strict'

const { validate } = use('Validator')
const User = use('App/Models/User')
const PasswordReset = use('App/Models/PasswordReset')
const Env = use('Env')
const Mail = use('Mail')
const Hash = use('Hash')
const jwt = require('jsonwebtoken')

class AuthController {
  async reset({response, request, session}) {
    const validation = await validate(
      request.all(), {
        token: 'required',
        password: 'required|min:4'
    })
    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept('password')
      return response.redirect('back')
    }
    var payload
    try {
      payload = await jwt.verify(request.input('token'), Env.get('SECRET'))
    } catch(err) {
      session.flash({
        notification: {
          type: 'danger',
          message: 'Invalid or expired link'
        }
      })
      return response.redirect('back')
    }
    const user = await User.findBy('email', payload.email);
    if (!user){
      session.flash({
        notification: {
          type: 'danger',
          message: 'User not found'
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
          message: 'No reset request'
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
        message: 'Password changed'
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
      return response.redirect('back')
    }
    const user = await User.findBy('email', request.input('email'));
    if (!user){
      session.flash({
        notification: {
          type: 'success',
          message: 'Email sent'
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
      token: token,
      appUrl: Env.get('APP_URL')
    }, (message) => {
      message.to(user.email).from(Env.get('FROM_EMAIL'))
      .subject('Reset Password')
    })
    session.flash({
      notification: {
        type: 'success',
        message: 'Email sent'
      }
    })
    return response.redirect('back')
  }
  async logout({auth, response}) {
    await auth.logout()
    return response.redirect('/')
  }
  async login({session, request, response, auth}) {
    const validation = await validate(
      request.all(), {
      username: 'required',
      password: 'required|min:4'
    })
    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept('password')
      return response.redirect('back')
    }
    const user = await User.findBy('username', request.input('username'));
    if (!user){
      session.flash({
        notification: {
          type: 'danger',
          message: 'Incorrect credentials'
        }
      })
      return response.redirect('back')
    }
    if (!user.verified) {
      session.flash({
        notification: {
          type: 'danger',
          message: 'Not verified'
        }
      })
      return response.redirect('back')
    }
    const correct = await Hash.verify(request.input('password'), user.password)
    if (!correct) {
      session.flash({
        notification: {
          type: 'danger',
          message: 'Incorrect credentials'
        }
      })
      return response.redirect('back')
    }
    await auth.login(user)
    return response.redirect('/dash')
  }
  async resend({request, response, session}) {
    const validation = await validate(
      request.all(), {
      email: 'required|email'
    })
    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept('password')
      return response.redirect('back')
    }
    const user = await User.findBy('email', request.input('email'));
    if (!user){
      session.flash({
        notification: {
          type: 'success',
          message: 'Email sent'
        }
      })
      return response.redirect('back')
    }
    if(user.verified) {
      session.flash({
        notification: {
          type: 'danger',
          message: 'Already verified'
        }
      })
      return response.redirect('back')
    }
    const token = jwt.sign({email: user.email}, Env.get('SECRET'), {
      expiresIn: 60 * 60 * 24 * 3
    })
    await Mail.send('emails.confirm', {
      token: token,
      appUrl: Env.get('APP_URL')
    }, (message) => {
      message.to(user.email).from(Env.get('FROM_EMAIL'))
      .subject('Confim Email')
    })
    session.flash({
      notification: {
        type: 'success',
        message: 'Email sent'
      }
    })
    return response.redirect('back')
  }
  async confirm({response, params, session}) {
    const { token } = params
    var payload
    try {
      payload = await jwt.verify(token, Env.get('SECRET'))
    } catch(err) {
      session.flash({
        notification: {
          type: 'danger',
          message: 'Invalid or expired link'
        }
      })
      return response.redirect('/login')
    }
    const user = await User.findBy('email', payload.email)
    if (!user) {
      session.flash({
        notification: {
          type: 'danger',
          message: 'User not found'
        }
      })
      return response.redirect('/login')
    }
    if (user.verified) {
      return response.redirect('/login')
    }
    user.verified = true
    await user.save()
    session.flash({
      notification: {
        type: 'success',
        message: 'Email confirmed'
      }
    })
    return response.redirect('/login')
  }
  async signup({session, request, response}) {
    const validation = await validate(
      request.all(), {
      email: 'required|email',
      username: 'required',
      password: 'required|min:4'
    })
    if (validation.fails()) {
      session.withErrors(validation.messages()).flashExcept('password')
      return response.redirect('back')
    }
    const clone = await User.findBy('email', request.input('email'));
    if (clone){
      session.flash({
        notification: {
          type: 'danger',
          message: 'Used email'
        }
      })
      return response.redirect('back')
    }
    const user = await User.create({
      email: request.input('email'),
      username: request.input('username'),
      password: request.input('password'),
      verified: false
    })
    const token = jwt.sign({email: user.email}, Env.get('SECRET'), {
      expiresIn: 60 * 60 * 24 * 3
    })
    await Mail.send('emails.confirm', {
      token: token,
      appUrl: Env.get('APP_URL')
    }, (message) => {
      message.to(user.email).from(Env.get('FROM_EMAIL'))
      .subject('Confim Email')
    })
    session.flash({
      notification: {
        type: 'success',
        message: 'Waiting email confirmation'
      }
    })
    return response.redirect('/login')
  }
}

module.exports = AuthController;
