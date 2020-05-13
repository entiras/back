'use strict'

const Env = use('Env');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: Env.get('GITHUB_TOKEN', '')
});
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs').promises;

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
      token: view.render('content/token').replace('\n', '')
    });
  }
  async base({ response, view }) {
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
    /*var names = [
      'auth.js',
      'signup.js',
      '_redirects',
      'style.css'
    ];
    for (var i = 0; i < names.length; i++) {
      var buff = new Buffer(await fs.readFile('./resources/views/' + names[i]));
      var save = await octokit.repos.createOrUpdateFile({
        owner: 'entiras',
        repo: 'front',
        path: names[i],
        message: 'auto',
        content: buff.toString('base64')
      });
      await mongo.db('entiras').collection('files').insertOne({
        type: 'base',
        path: save.data.content.path,
        sha: save.data.content.sha
      });
    }
    // render views
    view.share({
      date: new Date().toISOString()
    });
    var info = [
      ['index.html', 'content/home'],
      ['signup/index.html', 'content/signup'],
      ['login/index.html', 'content/login'],
      ['obscure.html', 'content/obscure'],
    ];
    for (var i = 0; i < names.length; i++) {
      var buff = new Buffer(view.render(info[i][1]));
      var save = await octokit.repos.createOrUpdateFile({
        owner: 'entiras',
        repo: 'front',
        path: info[i][0],
        message: 'auto',
        content: buff.toString('base64')
      });
      await mongo.db('entiras').collection('files').insertOne({
        type: 'base',
        path: save.data.content.path,
        sha: save.data.content.sha
      });
    }*/
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
