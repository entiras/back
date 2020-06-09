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
    async delete(path) {
        await mongo.connect(();
        const col = await mongo.db('entiras').collection('files');
        const iterator = await col.find({
            type: 'base',
            path: path
        });
        const file = await iterator.next();
        if (file) {
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
    }
    async create(path, content) {
        await mongo.connect();
        const col = await mongo.db('entiras').collection('files');
        const save = await octokit.repos.createOrUpdateFile({
            owner: 'entiras',
            repo: 'front',
            path: path,
            message: 'auto',
            content: content
        });
        await col.insertOne({
            type: 'base',
            path: save.data.content.path,
            sha: save.data.content.sha
        });
    }
    async script({ response, view }) {
        const file = 'script.js';
        try {
            await this.delete(file);
            const min = await minify({
                compressor: gcc,
                input: './resources/static/' + file,
                output: '_temp'
            });
            buff = new Buffer(min);
            await this.create(file, buff.toString('base64'));
        } catch (e) {
            return response.json({
                status: '❌',
                error: e
            });
        }
        return response.json({
            status: '✔️'
        });
    }
}

module.exports = GenerationController