'use strict'

const Env = use('Env');
const { Octokit } = use("@octokit/rest");
const octokit = new Octokit({
    auth: Env.get('GITHUB_TOKEN', '')
});
const MongoClient = use('mongodb').MongoClient;
const fs = use('fs').promises;
const minify = use('@node-minify/core');
const babelMinify = require('@node-minify/babel-minify');
const cleanCSS = use('@node-minify/clean-css');
const htmlMinifier = use('@node-minify/html-minifier');
const drop = async (name) => {
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
    await mongo.close();
};
const raise = async (name, buff) => {
    const mongo = new MongoClient(Env.get('MONGO_URI', ''), {
        useNewUrlParser: true
    });
    await mongo.connect();
    const col = await mongo.db('entiras').collection('files');
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
}
class GenerationController {
    async script({ response }) {
        const name = 'script.js';
        await drop(name);
        const min = await minify({
            compressor: babelMinify,
            input: './resources/static/' + name,
            output: '_temp'
        });
        const buff = new Buffer(min);
        await raise(name, buff)
        return response.json({
            status: '✔️'
        });
    }
    async style({ response }) {
        const name = 'style.css';
        await drop(name);
        const min = await minify({
            compressor: cleanCSS,
            input: './resources/static/' + name,
            output: '_temp'
        });
        const buff = new Buffer(min);
        await raise(name, buff)
        return response.json({
            status: '✔️'
        });
    }
    async redirects({ response }) {
        const name = '_redirects';
        await drop(name);
        const txt = await fs.readFile('./resources/views/' + name);
        const buff = new Buffer(TextMetrics);
        await raise(name, buff)
        return response.json({
            status: '✔️'
        });
    }
    async home({ response, view }) {
        const name = 'index.html'
        const edge = 'content.home';
        await drop(name);
        const txt = view.render(edge);
        await fs.writeFile('_temp', txt, 'utf8');
        const min = await minify({
            compressor: htmlMinifier,
            input: '_temp',
            output: '_temp'
        });
        const buff = new Buffer(min);
        await raise(name, buff)
        return response.json({
            status: '✔️'
        });
    }
    async login({ response, view }) {
        const name = 'login/index.html'
        const edge = 'content.login';
        await drop(name);
        const txt = view.render(edge);
        await fs.writeFile('_temp', txt, 'utf8');
        const min = await minify({
            compressor: htmlMinifier,
            input: '_temp',
            output: '__temp'
        });
        const buff = new Buffer(min);
        await raise(name, buff)
        return response.json({
            status: '✔️'
        });
    }
    async signup({ response, view }) {
        const name = 'signup/index.html'
        const edge = 'content.signup';
        await drop(name);
        const txt = view.render(edge);
        await fs.writeFile('_temp', txt, 'utf8');
        const min = await minify({
            compressor: htmlMinifier,
            input: '_temp',
            output: '__temp'
        });
        const buff = new Buffer(min);
        await raise(name, buff)
        return response.json({
            status: '✔️'
        });
    }
}

module.exports = GenerationController