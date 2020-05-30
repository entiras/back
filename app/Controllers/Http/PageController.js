'use strict'

const Env = use('Env');
const { Octokit } = use("@octokit/rest");
const octokit = new Octokit({
  auth: Env.get('GITHUB_TOKEN', '')
});
const MongoClient = use('mongodb').MongoClient;
const fs = use('fs').promises;
const svgCaptcha = use('svg-captcha');
const minify = use('@node-minify/core');
const uglifyJS = use('@node-minify/uglify-js');

class PageController {
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
      token: view.render('content/token').replace('\n', '')
    });
  }
  captcha({ response }) {
    var captcha = svgCaptcha.create();
    response.cookie('captcha', captcha.text, { path: '/' });
    response.type('image/svg+xml');
    return response.send(captcha.data);
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
    var file;
    while (file = await iterator.next()) {
      // delete old files
      const del = await octokit.repos.deleteFile({
        owner: 'entiras',
        repo: 'front',
        path: file.path,
        message: 'auto',
        sha: file.sha
      });
      if (del) {
        col.deleteMany({
          type: 'base',
          path: file.path
        });
      }
    }
    // create new files
    const names = [
      'auth.js',
      '_redirects',
      'style.css'
    ];
    for (var i = 0; i < names.length; i++) {
      var buff;
      if (i === 0) {
        const min = await minify({
          compressor: uglifyJS,
          input: './resources/views/' + names[i],
          output: '_temp'
        });
        buff = new Buffer(min);
      } else {
        const txt = await fs.readFile('./resources/views/' + names[i]);
        buff = new Buffer(txt);
      }
      const save = await octokit.repos.createOrUpdateFile({
        owner: 'entiras',
        repo: 'front',
        path: names[i],
        message: 'auto',
        content: buff.toString('base64')
      });
      await col.insertOne({
        type: 'base',
        path: save.data.content.path,
        sha: save.data.content.sha
      });
    }
    // render views
    view.share({
      date: new Date().toISOString()
    });
    const info = [
      ['index.html', 'content.home'],
      ['signup/index.html', 'content.signup'],
      ['login/index.html', 'content.login'],
      ['obscure.html', 'content.obscure'],
      ['signup/confirm/index.html', 'content.confirm'],
      ['signup/resend/index.html', 'content.resend'],
      ['login/forgot/index.html', 'content.forgot'],
      ['login/reset/index.html', 'content.reset']
    ];
    for (var i = 0; i < info.length; i++) {
      const buff = new Buffer(view.render(info[i][1]));
      const save = await octokit.repos.createOrUpdateFile({
        owner: 'entiras',
        repo: 'front',
        path: info[i][0],
        message: 'auto',
        content: buff.toString('base64')
      });
      col.insertOne({
        type: 'base',
        path: save.data.content.path,
        sha: save.data.content.sha
      });
    }
    // finish
    return response.json({
      status: '✔️'
    });
  }
}

module.exports = PageController
