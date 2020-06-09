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
const mongo = new MongoClient(Env.get('MONGO_URI', ''), {
    useNewUrlParser: true
});

class GenerationController {
    async script({ response, view }) {
        const name = 'script.js';
        const mongo = new MongoClient(Env.get('MONGO_URI', ''), {
            useNewUrlParser: true
        });
        await mongo.connect();
        const col = await mongo.db('entiras').collection('files');
        const iterator = await col.find({
            type: 'base',
            path: name
        });
        var file;
        while (file = await iterator.next()) {
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
        const min = await minify({
            compressor: gcc,
            input: './resources/static/' + name,
            output: '_temp'
        });
        const buff = new Buffer(min);
        const save = await octokit.repos.createOrUpdateFile({
            owner: 'entiras',
            repo: 'front',
            path: name,
            message: 'auto',
            content: buff.toString('base64')
        });
        await col.insertOne({
            type: 'base',
            path: save.data.content.path,
            sha: save.data.content.sha
        });
        await mongo.close();
        return response.json({
            status: '✔️'
        });
    }
}

module.exports = GenerationController