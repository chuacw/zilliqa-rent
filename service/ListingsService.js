const { BN, Long, bytes, units } = require('@zilliqa-js/util')
const { Zilliqa } = require('@zilliqa-js/zilliqa')

const {
  toBech32Address,
  getAddressFromPrivateKey
} = require('@zilliqa-js/crypto')

const zilliqa = new Zilliqa('https://dev-api.zilliqa.com')

// These are set by the core protocol, and may vary per-chain.
// You can manually pack the bytes according to chain id and msg version.
// For more information: https://apidocs.zilliqa.com/?shell#getnetworkid

const chainId = 333 // chainId of the developer testnet
const msgVersion = 1 // current msgVersion
const VERSION = bytes.pack(chainId, msgVersion)

// Populate the wallet with an account
const privateKey =
  '4a7feddddcf0e12966bdf17a94b7193b9ccd09e403b7793c0fcdc5f68b8fccd9'

zilliqa.wallet.addByPrivateKey(privateKey)

const address = getAddressFromPrivateKey(privateKey)
console.log(`ListingService: address = ${address}`)
console.log(`ListingService: bech32 address = ${toBech32Address(address)}`)

var myGasPrice = null

const contractAirBnB = zilliqa.contracts.at(
  'zil104fxvcen4psk5lhywg68sp86jph8d0mazxg3gd'
)

async function initMyGasPrice () {
  try {
    // Get Balance
    const balance = await zilliqa.blockchain.getBalance(address)

    // Get Minimum Gas Price from blockchain
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()

    console.log(
      `ListingService: account balance = ${balance.result.balance}, nonce = ${balance.result.nonce}`
    )
    console.log(
      `ListingService: current minimum gas price: ${minGasPrice.result}`
    )

    myGasPrice = units.toQa('2000', units.Units.Li) // Gas Price that will be used by all transactions

    console.log(`ListingService: my gas price ${myGasPrice.toString()}`)

    const isGasSufficient = myGasPrice.gte(new BN(minGasPrice.result)) // Checks if your gas price is less than the minimum gas price
    console.log(`ListingService: gas price sufficient? ${isGasSufficient}`)
  } catch (err) {
    console.log(err)
  }
}

async function getAll () {
  try {
    const callTx = await contractAirBnB.callWithoutConfirm(
      'getHouses',
      [],
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: VERSION,
        amount: new BN(0),
        gasPrice: myGasPrice,
        gasLimit: Long.fromNumber(8000)
      },
      false
    )

    console.log(callTx.bytes)
    // check the pending status
    const pendingStatus = await zilliqa.blockchain.getPendingTxn(callTx.id)
    console.log(`Pending status is: `)
    console.log(pendingStatus)

    // process confirm
    console.log(`The transaction id is:`, callTx.id)
    console.log(`Waiting transaction be confirmed`)
    const confirmedTxn = await callTx.confirm(callTx.id)

    console.log(`The transaction status is:`)
    console.log(confirmedTxn.receipt)

    if (confirmedTxn.receipt.success === true) {
      console.log(confirmedTxn.receipt.transitions[0].msg.params)
    }
  } catch (err) {
    console.log(err)
  }
}

initMyGasPrice()

module.exports = {
  getAll
}
