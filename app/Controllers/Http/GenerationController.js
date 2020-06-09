'use strict'

const Env = use('Env');
const { Octokit } = use("@octokit/rest");
const octokit = new Octokit({
    auth: Env.get('GITHUB_TOKEN', '')
});
const MongoClient = use('mongodb').MongoClient;
const fs = use('fs').promises;
const minify = use('@node-minify/core');
const gcc = use('@node-minify/google-closure-compiler');
const cleanCSS = use('@node-minify/clean-css');
const htmlMinifier = use('@node-minify/html-minifier');

class GenerationController {
    async delete(path) {
        const mongo = new MongoClient(Env.get('MONGO_URI', ''), {
            useNewUrlParser: true
        });
        await mongo.connect();
        const col = await mongo.db('entiras').collection('files');
        const iterator = await col.find({
            type: 'base',
            path: path
        });
        const file = await iterator.next();
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
        await mongo.close();
    }
    async script({ response, view }) {
        const file = 'auth.js';
        await this.delete(file);
    }
}

module.exports = GenerationController