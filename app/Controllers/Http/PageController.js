'use strict'

class PageController {
  home({view}) {
    return view.render('home');
  }
  signup({view}) {
    return view.render('signup');
  }
  login({view}) {
    return view.render('login');
  }
  resend({view}) {
    return view.render('resend');
  }
  dash({view}) {
    return view.render('dash');
  }
  forgot({view}) {
    return view.render('forgot');
  }
  reset({view, params}) {
    return view.render('reset',{
      token: params.token
    });
  }
}

module.exports = PageController
