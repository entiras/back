'use strict'

const { validate } = use('Validator');
const User = use('App/Models/User');
const Env = use('Env');
const Mail = use('Mail');
const jwt = use('jsonwebtoken');

class SignupController {
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
                message: validation._errorMessages[0].validation,
                field: validation._errorMessages[0].field
            });
        }
        const url = new URL('https://domain.top');
        url.username = request.input('username');
        if (url.username !== request.input('username')) {
            // url unsafe
            return response.json({
                type: 'danger',
                message: 'url',
                field: 'username'
            });
        }
        const clone = await User.findBy('email', request.input('email'))
            || await User.findBy('username', request.input('username'))
        if (clone) {
            return response.json({
                type: 'danger',
                message: 'clone',
                field: 'form'
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
            message: 'sent',
            field: 'form'
        });
    }
}

module.exports = SignupController