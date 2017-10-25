const threewords = require('threewords')
const Web3 = require('web3')
let lastKing;

var abi = [{"constant":true,"inputs":[],"name":"numberOfPreviousEntries","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"seed","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"previousEntries","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"timeLimit","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastKing","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"currentKing","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"newKing","type":"address"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"NewKing","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"winner","type":"address"},{"indexed":false,"name":"winnings","type":"uint256"}],"name":"Winner","type":"event"}]

var contractAddress = "0x14e2aC9B6Ca7baDE21AfDfA31b63708FC0b08D8f"
window.addEventListener('load', function() {
  if (typeof web3 == 'undefined') {
    web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/XK1wLa9Qe4yFtT25eG9l'))
    setupModal()
  } else {
    setupParticipate()
  }
  
  let contract = web3.eth.contract(abi).at(contractAddress)
  refresh(contract)
  setInterval(function() {
    refresh(contract)
  }, 1000)
})

function refresh (contract) {
  contract.numberOfPreviousEntries.call(function(e, res) {
    // get the addresses of the past winners and populate the html
    let numberOfPreviousEntries = res.toNumber()
    let j = 0
    if (numberOfPreviousEntries - 6 < 0) numberOfPreviousEntries = 6
    for (var i = numberOfPreviousEntries - 6; i < numberOfPreviousEntries; i++) {
      j++
      fillPreviousEntries(contract, i, j)
    } 
  })
  
  contract.currentKing.call(function(e, res) {
    // get the current king and put them in the king div
    let currentKing = res
    fillCurrentKing(currentKing)
  })
  
  contract.lastKing.call(function(e, res) {
    // get the time of the last king and map it to the current time to get the countdown to liftoff
    let lastKing = res.toNumber() // unix timestamp (seconds)
    fillMinutes(lastKing)
  })
  
  web3.eth.getBalance(contractAddress, function(e, res) {
    fillBalance(res.toNumber())
  })
}

function fillPreviousEntries(contract, i, j) {
  contract.previousEntries.call(i, function(e, res) {
    if (res == '0x') return
    $(".entry-" + j).text(getReadableName(res))
    $(".ethaddress-" + j).text(res)
  })
}

function fillCurrentKing (currentKing) {
  if (currentKing == lastKing) return
  lastKing = currentKing
  $(".currentking").text(getReadableName(currentKing))
  
  let chars = currentKing
  let numberOfChars = chars.length;
  let waveSpan = ''
  for (let i = 1; i <= numberOfChars; i++) {
    waveSpan += "<span class='char" + i + "'>" + chars[i-1] + "</span>"
  }
  $(".currentkingaddress").html(waveSpan)
}

function getReadableName(name) {
  let readableName = threewords(name)
  readableName = readableName.split('-').join(' ')
  return readableName
}

function fillBalance (contractBalanceInWei) {
  let ethBalance = web3.fromWei(contractBalanceInWei, 'ether')
  $(".ethamount").text(ethBalance)
}

function fillMinutes (lastKing) {
  let now = Date.now() // unix timestamp (milliseconds)
  let timeDifference = now - (lastKing * 1000) // difference in milliseconds
  let minuteDifference = (timeDifference / 1000) / 60
  let minutesLeft = Math.floor(60 - minuteDifference)
  if (minutesLeft <= 1) minutesLeft = "< 1"
  $(".minutecount").text(minutesLeft)
}

function setupParticipate() {
  $(".participate").on('click', function() {
    web3.eth.sendTransaction({
      from: web3.eth.accounts[0],
      to: contractAddress,
      gas: 100000, // Just to make sure it goes through
      gasPrice: 1000000000, // 1GWei
      value: web3.toWei(0.1, 'ether')
    }, function (e, res) {
      console.log(e, res)
    })
  })
}

function setupModal() {
  var modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Close",
  });
  
  // set content
  modal.setContent('<h2>You need Metamask to play.</h2><p><a href="https://metamask.io">Get it here.</a></p>');
  
  $(".participate").on('click', function() {
    modal.open()
  })
}