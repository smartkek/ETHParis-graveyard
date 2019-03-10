var erc20abi = JSON.parse('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"name","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"totalSupply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"decimals","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"symbol","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]');
var totalBurnt = 0;

$('document').ready(function() {
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    var crematorium = '0x6faecc30bec9420a8e4a71e6b4c248186ca77d9a';
    var tokenAddr = findGetParameter('tokenAddr');

    var feedFilter = web3js.eth.filter({
        fromBlock: '1',
        toBlock: 'latest',
        topics: [
            '0x0abb2f72a2e4d8a5c05e1e4595e9b78e5b8189d2188ad3f5457706a1061e0a9f',
            '0x000000000000000000000000' + tokenAddr.slice(2)
        ],
        address: crematorium
    });
    feedFilter.watch(function(err, res) {
        if (!err) {
            var eventData = parseEventData(res);
            console.log('sas');
            addComment(eventData);
            totalBurnt += eventData.amount;
        } else {
            console.log(err);
        }
    });
    setTimeout(function(){updateTokenInfo(tokenAddr)}, 500);
    $('#inputTokenAddress').val(tokenAddr);
    setTimeout(function(){setUserTokensText(tokenAddr)}, 500);

    $('#btn-0x').click(function() {
        zeroExInstant.render(
            {
                orderSource: 'https://api.radarrelay.com/0x/v2/',
                availableAssetDatas: ['0xf47261b0000000000000000000000000' + tokenAddr.slice(2)]
            },
            'body',
        );
    });
});


function updateTokenInfo(tokenAddr) {
    getTokenInfo(tokenAddr, function(name, symbol, totalSupply) {
        $('#title-token-name').text(name);
        $('#title-token-symbol').text(symbol);
        $('#title-token-addr').text(tokenAddr);
        $('#title-total-supply').text(`Total tokens ${totalSupply}`);
        $('#title-total-burnt').text(`Burnt ${totalBurnt} (${totalBurnt / totalSupply * 100}%)`);
/*
        $('#title-token-name').text(titleTokenNameText.replace('TOKEN_NAME', name).replace('TOKEN_SYMBOL', symbol));
        $('#title-token-addr').text(titleTokenAddrText.replace('TOKEN_ADDR', tokenAddr));
        $('#title-total-burnt').text(titleTotalBurntText.replace('TOKEN_AMOUNT', totalBurnt).replace('PERCENT', totalBurnt / totalSupply * 100));*/
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

function addComment(eventData) {
    // create feed item
    getTokenInfo(eventData.token, function(name, symbol, totalSupply) {
        var commentItem = commentItemTemplate.replace("TOKEN_AMOUNT", eventData.amount);
        commentItem = commentItem.replace("BURNER_ADDR", eventData.burner);
        commentItem = commentItem.replace("BURNER_MSG", eventData.message);
        commentItem = commentItem.replace("PERCENT", eventData.amount / totalSupply * 100)
        $('#list-comments').append(commentItem);
    });
}


function parseEventData(obj) {
    var rawData = obj.data.slice(2);
    var amount = web3js.toDecimal('0x' + rawData.slice(0, 64));
    var message = web3js.toAscii('0x' + rawData.slice(64*3));
    var token = '0x' + obj.topics[1].slice(-40);
    var burner = '0x' + obj.topics[2].slice(-40);
    return {
        amount: amount,
        message: message,
        token: token,
        burner: burner
    }
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


var commentItemTemplate = `
<div class="info-message">
  <p class="adress">BURNER_ADDR</p>
  <p class="author-comm">pkondr.eth</p>
  <p class="text-message">BURNER_MSG</p>
  <p class="all-t">Burnt TOKEN_AMOUNT (PERCENT%)</p>
</div>
`