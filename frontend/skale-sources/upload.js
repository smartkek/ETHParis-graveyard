const FilestorageClient = require('@skalenetwork/filestorage-js/src/index.js');
const Web3 = require('web3');
const fs = require('fs');

const web3Provider = new Web3.providers.HttpProvider(
    "SKALE_SCHAIN"
  );
let web3 = new Web3(web3Provider);

let filestorage = new FilestorageClient(host = "SKALE_SCHAIN");

let privateKey = 'PK';
let account = 'ACCOUNT';

var run = async function(fileName) {
    data = fs.readFileSync(fileName);
    console.log(data);
    var link = await filestorage.uploadFile(
        account,
        fileName,
        data.length,
        data,
        true,
        privateKey
    );
    console.log(link);
}

var runDelete = async function(fileName) {
    await filestorage.deleteFile(
        account,
        fileName,
        true,
        privateKey
    );
}

async function downloadFileToDesktop(link) {
  let file = await filestorage.downloadFileIntoBuffer(link, true);
  console.log(file);
}

async function runAll() {
    try {await runDelete('index.html')} catch {};
    try {await runDelete('info.html')} catch {};
    try {await runDelete('burn.js')} catch {};
    try {await runDelete('index.js')} catch {};
    try {await runDelete('info.js')} catch {};
    try {await runDelete('scriptjs.js')} catch {};
    try {await runDelete('styles.css')} catch {};

    await run('index.html');
    await run('info.html');
    await run('burn.js');
    await run('index.js');
    await run('info.js');
    await run('scriptjs.js');
    await run('styles.css');
}

runAll();