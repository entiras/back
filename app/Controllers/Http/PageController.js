'use strict'

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit();

class PageController {
  async home({ response }) {
    //return view.render('home');
    return response.json({
      data: await octokit.repos.listForOrg({
        org: "entiras",
        type: "public"
      })
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
