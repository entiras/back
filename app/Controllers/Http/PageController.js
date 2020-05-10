'use strict'

const Env = use('Env');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: Env.get('GITHUB_TOKEN', '')
});
const MongoClient = require('mongodb').MongoClient;
const mongo = new MongoClient(Env.get('MONGO_URI', ''), { useNewUrlParser: true });
mongo.connect();

class PageController {
  async home({ response }) {
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
      token: view.render('token').replace('\n', '')
    });
  }
  async script({ response, view }) {
    // render a view and send to repo
    var buff = new Buffer(view.render('script'));
    var file = await octokit.repos.createOrUpdateFile({
      owner: 'entiras',
      repo: 'front',
      path: 'script.js',
      message: 'auto',
      content: buff.toString('base64')
    });
    // save the file data to mongo
    const db = mongo.db('entiras');
    await db.collection('files').insertOne(file);
    // all ok
    return response.json({
      status: '✔️'
    });
    /*var cont = await octokit.repos.getContents({
  owner: 'entiras',
  repo: 'front',
  path: 'hola2',
});
var cont2 = await octokit.repos.getContents({
  owner: 'entiras',
  repo: 'front',
  path: 'hola',
});
var d = await octokit.repos.createOrUpdateFile({
  owner: 'entiras',
  repo: 'front',
  path: 'hola',
  message: 'hola',
  content: 'SG9sYQ==',
  sha: 'af5a0623e0771a314019824ae5786545e4813652'
});*/
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
