// TODO: Wallet should be global?
var Wallet = SpareCoins.Wallet(SpareCoins.ChromeStorage)

function pushTransaction(txSerialized, txHash, txValue, callback) {
	BitcoinNodeAPI.pushTx(txSerialized, txHash, function(err, data) {
		if (err) {
			console.log(txSerialized)
			console.log(txHash)
			console.log(err)
			callback(false)
			throw new Error("Transaction Failed")
		}

		if (data) {
			// Call the callback function
			callback(true)
		}
	})
}

function beep() {
	var file = "beep.wav"
	return (new Audio(file)).play()
}

function backupPrivateKeys() {
	Wallet.loadData( function() {
		var timestamp = (new Date()).getTime(),
			addresses = Wallet.getAddresses(),
			encryptedKeysURL = "data:text/csv;charset=utf-8,"

		encryptedKeysURL += escape("Encrypted Privated Keys (AES)" + "\n")
		encryptedKeysURL += escape("Use a SHA256 digest of your password as the encryption key" + "\n")

		for (var i = 0; i < addresses.length; i++) {
			encryptedKeysURL += escape(addresses[i].getfCryptPrivateKey() + "\n")
		}

		window.open(encryptedKeysURL)
	})
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.method === 'pushTransaction') {
		pushTransaction(message.txSerialized, message.txHash, null, function() {
		})
		sendResponse(true)
	}
})
