var erc20abi = JSON.parse('[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"name","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"totalSupply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"decimals","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"symbol","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]');
var allTokens = new Array();
var allTokenAddresses = new Array();
var addedToTop = new Array()

$('document').ready(function() {
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    var crematorium = '0x06b064a92ebbc593e2632e7e5822018ec46a83ca';

    var feedFilter = web3js.eth.filter({
        fromBlock: '1',
        toBlock: 'latest',
        topics: ['0x0abb2f72a2e4d8a5c05e1e4595e9b78e5b8189d2188ad3f5457706a1061e0a9f'],
        address: crematorium
    });
    feedFilter.watch(function(err, res) {
        if (!err) {
            var eventData = parseEventData(res);
            addToBurnFeed(eventData);
            console.log(res);
            if (allTokens[eventData.token] === undefined) {
                allTokens[eventData.token] = 0;
                allTokenAddresses.push(eventData.token);
            }
            allTokens[eventData.token] += eventData.amount;
        } else {
            console.log(err);
        }
    });
    setTimeout(updateTopList, 3000);

    $('#list-top-tokens').on("click", "button.btn-comments", function() {
        var tokenAddr = $(this).attr('id').slice(5);
        window.location.href = "/info?tokenAddr=" + tokenAddr;
        return false;
    });

    $('#list-top-tokens').on("click", "button.btn-burn", function() {
        var tokenAddr = $(this).attr('id').slice(5);
        window.location.href = "/burn?tokenAddr=" + tokenAddr;
        return false;
    });
});

async function updateTopList() {
    await allTokens.sort(function(a, b) {
        return b - a;
    });

    for (i = 0; i < allTokenAddresses.length; i++) {
        tokenAddr = allTokenAddresses[i];
        updateTopListItem(tokenAddr, i);
    }
}

function updateTopListItem(tokenAddr, i) {
    getTokenInfo(tokenAddr, function(name, symbol, totalSupply) {
        var topItem = topItemTemplate.replace("TOKEN_NAME", name);
        topItem = topItem.replace("TOKEN_SYMBOL", symbol);
        topItem = topItem.replace("TOKEN_AMOUNT", allTokens[tokenAddr]);
        topItem = topItem.replace("INDEX", i+1);
        topItem = topItem.replace("PERCENT", allTokens[tokenAddr] / totalSupply * 100);
        topItem = topItem.replace("COMMENTS_NUM", 20);
        topItem = topItem.replace(/TOKEN_ADDR/gi, tokenAddr);
        if (addedToTop[tokenAddr] !== true) {
            $('#list-top-tokens').append(topItem);
            addedToTop[tokenAddr] = true;
        } else {
            $('#' + tokenAddr).replaceWith(topItem);
        }
    });
}

async function addToBurnFeed(eventData) {
    // create feed item
    var feedItem = feedItemTemplate.replace("TOKEN_AMOUNT", eventData.amount);
    feedItem = feedItem.replace("BURNER_ADDR", eventData.burner);
    feedItem = feedItem.replace("BURNER_MSG", eventData.message);

    // get token info and add feedItem to page
    getTokenInfo(eventData.token, function(name, symbol) {
        feedItem = feedItem.replace("TOKEN_NAME", name);
        feedItem = feedItem.replace("TOKEN_SYMBOL", symbol);
        $('#list-burn-feed').append(feedItem);
    })
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


var feedItemTemplate = `
<div class="row">
  <div class="card">
    <div class="card-header">TOKEN_NAME (TOKEN_SYMBOL)</div>
    <div class="card-body">
      <h5 class="card-title"> TOKEN_AMOUNT tokens</h5>
      <h6 class="card-subtitle mb-2 text-muted">BURNER_ADDR</h6>

      <p class="card-text">BURNER_MSG</p>
    </div>
  </div>
</div>
<br>
`

var topItemTemplate = `
<li class="list-group-item flex-column align-items-start" id="TOKEN_ADDR">
    <div class="row">
      <div class="col-md-1">
        <h1>INDEX</h1>
      </div>
      <div class="col-md-11">
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">TOKEN_NAME (TOKEN_SYMBOL)</h5>
          <small>PERCENT%</small>
        </div>
        <div class="row">
          <div class="col-md-8">
            TOKEN_AMOUNT total burned
          </div>
          <div class="col-md-4">
          <button type="button" class="btn btn-secondary btn-comments" id="info-TOKEN_ADDR">comments</button>
          <button type="button" class="btn btn-danger btn-burn" id="burn-TOKEN_ADDR">Burn</button>
          </div>
        </div>
      </div>
    </div>
</li>
`
