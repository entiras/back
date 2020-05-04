'use strict'

class PageController {
  home({ response }) {
    return response.json({
      message: 'API working'
    });
  }
  login({ view }) {
    return view.render('login');
  }
  resend({ view }) {
    return view.render('resend');
  }
  dash({ view }) {
    return view.render('dash');
  }
  forgot({ view }) {
    return view.render('forgot');
  }
  reset({ view, params }) {
    return view.render('reset', {
      token: params.token
    });
  }
  obscure({ view, params }) {
    return view.render('obscure', {
      all: params.all
    });
  }
}

module.exports = PageController
