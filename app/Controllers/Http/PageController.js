'use strict'

const Env = use('Env');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: Env.get('GITHUB_TOKEN', '')
});
const MongoClient = require('mongodb').MongoClient;

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
    const mongo = new MongoClient(Env.get('MONGO_URI', ''), {
      useNewUrlParser: true
    });
    await mongo.connect();
    const col = await mongo.db('entiras').collection('files');
    const iterator = await col.find({
      type: 'base'
    });
    var file = null;
    while (file = await iterator.next()) {
      // delete old files
      await octokit.repos.deleteFile({
        owner: 'entiras',
        repo: 'front',
        path: file.path,
        message: 'auto',
        sha: file.sha
      });
    }
    col.deleteMany({
      type: 'base'
    });
    // create new files
    for (var i = 0; i < Math.floor(Math.random() * 5) + 10; i++) {
      var buff = new Buffer(view.render('script'));
      var data = await octokit.repos.createOrUpdateFile({
        owner: 'entiras',
        repo: 'front',
        path: 'script' + i + '.js',
        message: 'auto',
        content: buff.toString('base64')
      });
      await mongo.db('entiras').collection('files').insertOne({
        type: 'base',
        path: 'script' + i + '.js',
        sha: data.data.content.sha
      });
    }
    // finish
    return response.json({
      status: '✔️'
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
