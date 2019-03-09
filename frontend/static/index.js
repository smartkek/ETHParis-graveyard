$('document').ready(function() {
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    var graveyardAddress = '0x897354ebe940d137c4040f62a793f39b2388f236'


    var filter = web3js.eth.filter({
        fromBlock: '5168309',
        toBlock: 'latest',
        topics: ['0x0abb2f72a2e4d8a5c05e1e4595e9b78e5b8189d2188ad3f5457706a1061e0a9f'],
        address: graveyardAddress
    });
    filter.watch(function(err, res) {
        if (!err) {
            addToBurnFeed(res);
            console.log(res);
        } else {
            console.log(err);
        }
    });
});


function addToBurnFeed(feedObj) {
    // parse data
    var rawData = feedObj.data.slice(2);
    var amount = web3js.toDecimal('0x' + rawData.slice(0, 64));
    var message = web3js.toAscii('0x' + rawData.slice(64*3));
    var token = '0x' + feedObj.topics[1].slice(-40);
    var burner = '0x' + feedObj.topics[2].slice(-40);
    // add to list
    $('#list-burn-feed').append(`<li><span>${burner} has burned ${amount} of ${token} tokens with message: ${message}</span></li>`);
}