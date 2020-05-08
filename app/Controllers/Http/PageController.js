'use strict'

const Env = use('Env')
const { Octokit, App, Action } = require("octokit");
const octokit = new Octokit({
  auth: Env.get('GITHUB_TOKEN', '')
});

class PageController {
  async home({ response }) {
    var data = await octokit.repos
      .listForOrg({
        org: "octokit",
        type: "private"
      });
    return response.json({
      status: '✔️',
      data: data
    });
  }
  obscure({ response }) {
    return response.json({
      route: '❌'
    });
  }
  csrf({ response, view }) {
    return response.json({
      token: view.render('token').replace('\n', '')
    });
  }
  /*login({ view }) {
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
  }*/
}

module.exports = PageController
