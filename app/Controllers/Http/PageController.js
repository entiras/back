'use strict'

const Env = use('Env');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: Env.get('GITHUB_TOKEN', '')
});

class PageController {
  async home({ response }) {
    var d = await octokit.repos.createOrUpdateFile({
      owner: 'entiras',
      repo: 'front',
      path: 'hola',
      message: 'hola',
      content: 'SG9sYQ=='
    });
    return response.json({
      status: '✔️',
      data: d
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
