const FilestorageClient = require('@skalenetwork/filestorage-js/src/index.js');

const express = require('express')
const app = express()
const port = 3000
let filestorage = new FilestorageClient(host = "http://104.248.242.35:8014/");

app.get('/index.js', async function(req, res)    {
    let file = await filestorage.downloadFileIntoBuffer("cF8578fc60Ee09f508b07A1e65FcA22c07627464/index.js", true)
    res.writeHead(200, {'Content-Type': 'application/javascript' });
    res.end(file, 'binary');
});

app.get('/info.js', async function(req, res)    {
    let file = await filestorage.downloadFileIntoBuffer("cF8578fc60Ee09f508b07A1e65FcA22c07627464/info.js", true)
    res.writeHead(200, {'Content-Type': 'application/javascript' });
    res.end(file, 'binary');
});

app.get('/burn.js', async function(req, res)    {
    let file = await filestorage.downloadFileIntoBuffer("cF8578fc60Ee09f508b07A1e65FcA22c07627464/burn.js", true)
    res.writeHead(200, {'Content-Type': 'application/javascript' });
    res.end(file, 'binary');
});

app.get('/scriptjs.js', async function(req, res)    {
    let file = await filestorage.downloadFileIntoBuffer("cF8578fc60Ee09f508b07A1e65FcA22c07627464/scriptjs.js", true)
    res.writeHead(200, {'Content-Type': 'application/javascript' });
    res.end(file, 'binary');
});

app.get('/styles.css', async function(req, res)    {
    let file = await filestorage.downloadFileIntoBuffer("cF8578fc60Ee09f508b07A1e65FcA22c07627464/styles.css", true)
    res.writeHead(200, {'Content-Type': 'text/css' });
    res.end(file, 'binary');
});

app.get('/index.html', async function(req, res)    {
    let file = await filestorage.downloadFileIntoBuffer("cF8578fc60Ee09f508b07A1e65FcA22c07627464/index.html", true)
    res.writeHead(200, {'Content-Type': 'text/html' });
    res.end(file, 'binary');
});

app.get('/info.html', async function(req, res)    {
    let file = await filestorage.downloadFileIntoBuffer("cF8578fc60Ee09f508b07A1e65FcA22c07627464/info.html", true)
    res.writeHead(200, {'Content-Type': 'text/html' });
    res.end(file, 'binary');
});


app.get('/', async function(req, res)    {
    let file = await filestorage.downloadFileIntoBuffer("cF8578fc60Ee09f508b07A1e65FcA22c07627464/index.html", true)
    res.writeHead(200, {'Content-Type': 'text/html' });
    res.end(file, 'binary');
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))