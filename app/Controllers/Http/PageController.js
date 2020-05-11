'use strict'

const Env = use('Env');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: Env.get('GITHUB_TOKEN', '')
});
const MongoClient = require('mongodb').MongoClient;
const mongo = new MongoClient(Env.get('MONGO_URI', ''), {
  useNewUrlParser: true
});

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
    // list files
    await mongo.connect();
    const files = await mongo.db('entiras').collection('files').find({});
    const arr = [];
    var f = null;
    while (f = await files.next()) {
      arr.push(f);
    }
    await mongo.close();
    return response.json({
      files: arr
    });
  }
}

module.exports = PageController
