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

    var crematorium = '0x6faecc30bec9420a8e4a71e6b4c248186ca77d9a';

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
    setInterval(updateTopList, 5000);

    $('#list-top-tokens').on("click", "button.btn-comments", function() {
        var tokenAddr = $(this).attr('id').slice(5);
        window.location.href = "info.html?tokenAddr=" + tokenAddr;
        return false;
    });

    function disableScroll ()
    {
        $('html, body').on('mousewheel',function(){
            return false;
        });
    }

    function enableScroll()
    {
        $('html, body').off('mousewheel');
    }

    $('#list-top-tokens').on("click", "button.btn-my-burn", function() {
        var tokenAddr = $(this).attr('id').slice(4);
        $('#inputTokenAddress').val(tokenAddr);
        setTimeout(function(){setUserTokensText(tokenAddr)}, 500);
        $('.popup-container').fadeIn(400, disableScroll);
            $('.popup').animate(400);
            $('body').addClass('stop-scrolling');
            $('body').bind('touchmove', function(e){e.preventDefault()});
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
        feedItem = feedItem.replace(/TOKEN_ADDR/gi, eventData.token);
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
<div class="story">
  <a href="info.html?tokenAddr=TOKEN_ADDR" class="story-project-name">TOKEN_NAME</a>
  <p class="author-comm">BURNER_ADDR</p>
  <p class="message">BURNER_MSG</p>
  <p>Burnt TOKEN_AMOUNT</p>
</div>
`

var topItemTemplate = `
<div class="project" id="TOKEN_ADDR">
    <div class="project-header">
      <a href="info.html?tokenAddr=TOKEN_ADDR" class="token-name">TOKEN_NAME</a>
      <div class="btn-burn"><button class="btn-burn-project click btn-my-burn" id="btn-TOKEN_ADDR">Burn</button></div>
    </div>
  <div class="project-body">
  <div class="short-name">TOKEN_SYMBOL</div>
 <p>Total tokens TOTAL_TOKENS burnt TOKEN_AMOUNT PERCENT% </p>
  </div>
</div>
`
