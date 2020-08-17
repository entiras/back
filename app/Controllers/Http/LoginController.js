'use strict'

const { validate } = use('Validator');
const User = use('App/Models/User');
const Hash = use('Hash');

class LoginController {
    async login_forgot({ request, response, view }) {
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
                message: 'late',
                field: 'form'
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
                message: validation._errorMessages[0].validation,
                field: validation._errorMessages[0].field
            });
        }
        const user = await User.findBy('username', request.input('username'));
        if (!user) {
            return response.json({
                type: 'danger',
                message: 'credentials',
                field: 'form'
            });
        }
        const correct = await Hash.verify(request.input('password'), user.password);
        if (!correct) {
            return response.json({
                type: 'danger',
                message: 'credentials',
                field: 'form'
            });
        }
        if (!user.verified) {
            return response.json({
                type: 'danger',
                message: 'unconfirmed',
                field: 'form'
            });
        }
        await auth.remember(true).login(user);
        response.plainCookie('user', user.username, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365 * 5 + 108000
        });
        return response.json({
            type: 'success',
            message: 'logged',
            field: 'form'
        });
    }
    async logout({ auth, response }) {
        await auth.logout();
        return response.clearCookie('user');
    }
}

module.exports = LoginController