'use strict'

const svgCaptcha = use('svg-captcha');

class MainController {
    home({ response }) {
        return response.json({
            status: '✔️'
        });
    }
    obscure({ response }) {
        return response.json({
            route: '❌'
        });
    }
    csrf({ response, view }) {
        return response.json({
            token: view.render('basic/token').replace('\n', '')
        });
    }
    captcha({ response }) {
        var captcha = svgCaptcha.create();
        response.cookie('captcha', captcha.text, { path: '/' });
        response.type('image/svg+xml');
        return response.send(captcha.data);
    }
}

module.exports = MainController