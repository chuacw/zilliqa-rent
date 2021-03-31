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

        let parameters = confirmedTxn.receipt.transitions[0].msg.params

        code = parameters[0]
        arrAddresses = parameters[1].value
        arrRents = parameters[2].value
        arrStatuses = parameters[3].value

        console.log(arrAddresses)

        let arrHouses = []

        arrAddresses.forEach(objAddr => {
            
            let houseId = objAddr.arguments[0]
            let address = objAddr.arguments[1]

            let rent = arrRents.find(objRent => objRent.arguments[0] === houseId).arguments[1]
            let status = arrStatuses.find(objStatus => objStatus.arguments[0] === houseId).arguments[1]

            let house = {
                "id": houseId,
                "address": address, 
                "rent": rent,
                "status": status
            }

            console.log(JSON.stringify(house))

            arrHouses.push(house)
        });

        return arrHouses
    }
  } 
  catch (err) {
    console.log(err)
  }
}


async function addHouse (address, rent) {

    try {

        const callTx = await contractAirBnB.callWithoutConfirm(
          'addHouse',
          [
            {
                vname: 'address',
                type: 'String',
                value: address,
            },
            {
                vname: 'rent',
                type: 'Uint128',
                value: rent,
            }
          ],
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
            return confirmedTxn.receipt.transitions[0].msg
        }
    }
    catch (err) {
        console.log(err)
    }
}


async function rentHouse (id, amount) {

    try {

        const callTx = await contractAirBnB.callWithoutConfirm(
          'rentHouse',
          [
            {
                vname: 'houseId',
                type: 'Uint32',
                value: id
            }
          ],
          {
            // amount, gasPrice and gasLimit must be explicitly provided
            version: VERSION,
            amount: new BN(amount),
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
            return confirmedTxn.receipt.transitions[0].msg
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function getState () {

    try {

        const contractState = await contractAirBnB.getState()

        let objAddresses = contractState.houseAddresses
        let objRents = contractState.houseRents
        let objStatuses = contractState.houseStatus

        let ids = Object.keys(objAddresses)

        let arrHouses = []

        ids.forEach(id => {

            let address = objAddresses[id]
            let rent = objRents[id]
            let status = objStatuses[id]

            let house = {
                "id": id,
                "address": address,
                "rent": rent,
                "status": status
            }

            arrHouses.push(house)
        })

        return arrHouses
    }
    catch (err) {
        console.log(err)
    }
}

initMyGasPrice()

module.exports = {
  getAll, addHouse, rentHouse,getState
}
