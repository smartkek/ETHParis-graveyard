var erc20abi = JSON.parse('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"name","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"totalSupply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"decimals","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"symbol","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]');
var crematoriumAbi = JSON.parse('[{"constant": false,"inputs": [{"name": "token","type": "address"},{"name": "message","type": "string"}],"name": "burn","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"}]');
var deadTokensAbi = JSON.parse('[{"constant": false,"inputs": [{"name": "token","type": "address"}],"name": "bury","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "token","type": "address"}],"name": "buried","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"}]');
var crematorium = '0x06b064a92ebbc593e2632e7e5822018ec46a83ca';
var deadTokensAddress = '0x56d26e79435dcd148a1e202af02ee1372364c417';


$(document).ready(function() {
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }


    tokenAddr = findGetParameter('tokenAddr');
    if (tokenAddr !== null) {
        $('#inputTokenAddress').val(tokenAddr);
        setTimeout(function(){setUserTokensText(tokenAddr)}, 500);
    }

    $('#btn-burn').click(function() {
        var tokenAddr = $('#inputTokenAddress').val().toLowerCase();
        var tokenAmount = $('#inputTokenAmount').val();
        var message = $('#inputMessage').val();
        if (!web3js.isAddress(tokenAddr)) {
            alert(`${tokenAddr} is not a valid token address`);
        } else if (tokenAmount === "") {
            alert(`${tokenAmount} is not a number`);
        } else {
            checkIfBuried(
                crematorium, tokenAddr, tokenAmount, message,
                function(res) {
                    if (res) {
                        approveAndBurn(crematorium, tokenAddr, tokenAmount, message);
                    } else {
                        showShouldBuryMessage();
                    }
                }
            );
        }
    });

    $('#btn-bury').click(function() {
        var tokenAddr = $('#inputTokenAddress').val().toLowerCase();
        var tokenAmount = $('#inputTokenAmount').val();
        var message = $('#inputMessage').val();
        if (!web3js.isAddress(tokenAddr)) {
            alert(`${tokenAddr} is not a valid token address`);
        } else if (tokenAmount === "") {
            alert(`${tokenAmount} is not a number`);
        } else {
            checkIfBuried(
                crematorium, tokenAddr, tokenAmount, message,
                function(res) {
                    if (res) {
                        showMayBurnMessage();
                    } else {
                        bury(crematorium, tokenAddr, tokenAmount, message);
                    }
                }
            );
        }
    });
});


function showMayBurnMessage() {
    alert('Someone already used our service for your token address. You can burn tokens by clicking burn button.');
}

function showBuryApologiesMessage() {
    alert('We are using oracle to use only REAL-valued tokens. You should send request to our oracle to approve token for burial by pressing bury button');
}

function showShouldBuryMessage() {
    alert('We are using oracle to use only REAL-valued tokens. You should send request to our oracle to approve token by pressing bury button.');
}



function bury(crematorium, tokenAddr, tokenAmount, message) {
    deadTokens = web3js.eth.contract(deadTokensAbi);
    instance = deadTokens.at(deadTokensAddress);
    instance.bury.sendTransaction(tokenAddr, function(err, res) {
    });
}


function checkIfBuried(crematorium, tokenAddr, tokenAmount, message, cb) {
    deadTokens = web3js.eth.contract(deadTokensAbi);
    instance = deadTokens.at(deadTokensAddress);
    instance.buried.call(tokenAddr, function(err, res) {
        cb(res);
    });
}


function approveAndBurn(crematorium, tokenAddr, tokenAmount, message) {
    var token = web3js.eth.contract(erc20abi);
    var instance = token.at(tokenAddr);

    instance.approve.sendTransaction(crematorium, tokenAmount, function(err, res) {
        var crematoriumInstance = web3js.eth.contract(crematoriumAbi).at(crematorium);
        crematoriumInstance.burn.sendTransaction(tokenAddr, message, function(err, res) {
            if (err) {
                console.log(err);
            }
        });

    });
}


function setUserTokensText(tokenAddr) {
    var token = web3js.eth.contract(erc20abi);
    var instance = token.at(tokenAddr);
    instance.balanceOf.call(web3.eth.accounts[0], function(err, res) {
        if (err === null && $('#inputTokenAmount').val() === "") {
            $('#inputTokenAmount').val(res);
        }
    });
}


function getTokenInfo(tokenAddr, cb) {
    var token = web3.eth.contract(erc20abi);
    var instance = token.at(tokenAddr);
    var name = instance.name.call(function(err, name) {
        instance.symbol.call(function(err, symbol) {
            instance.totalSupply.call(function(err, totalSupply) {
                cb(name, symbol, totalSupply);
            });
        });
    });
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}