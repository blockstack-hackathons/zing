'use strict'

var SATOSHIS_PER_BITCOIN = 100000000
var Wallet = SpareCoins.Wallet(SpareCoins.ChromeStorage)

function sendMoney(recipientAddress, amount, callback) {
    Wallet.loadData(function() {
        SpareCoins.ChromeStorage.get("security", function(data) {
            var transactionOutputs = [{
                addr: recipientAddress,
                value: BigInteger.valueOf(amount*SATOSHIS_PER_BITCOIN)
            }]

            Wallet.buildPendingTransaction(transactionOutputs, data["passwordDigest"], function(pendingTransaction) {
                var txSerialized = pendingTransaction.serialize(),
                    txHash = pendingTransaction.txHash()

                chrome.runtime.sendMessage({
                    method: "pushTransaction",
                    txSerialized: txSerialized,
                    txHash: txHash,
                    txValue: transactionOutputs[0].value
                }, function(transactionSuccessful) {
                    callback(transactionSuccessful)
                })
            })
        })
    })
}

var PaymentModal = React.createClass({
    getInitialState: function() {
        return {
            twitterHandle: window.location.pathname.split('/')[1],
            recipientAddress: '1DyVgc6L2kXnv96R4FCzNaMQ8iWPzHQX3T',
            paymentAmount: 0.0001
        }
    },
    submitSendForm: function() {
        var _this = this
        sendMoney(this.state.recipientAddress, this.state.paymentAmount, function() {
            _this.props.hide()
        })
    },
    updateValue: function(event) {
        console.log(event)
        this.setState({
            paymentAmount: event.target.value
        })
    },
    render: function() {
        var modalStyle = {
            position: 'fixed',
            width: '50%',
            left: '25%',
            zIndex: '999999',
            overflow: 'hidden'
        }
        var modalDialogStyle = {
            display: 'block',
            position: 'relative'
        }

        return (
            <div>
                <div className="modal" style={modalStyle}>
                  <div className="modal-dialog" style={modalDialogStyle}>
                    <div className="modal-content">
                        <div className="modal-body">
                            <button type="button" className="close" onClick={this.props.hide}>
                                <span>&times;</span>
                            </button>

                            <h3>zing!</h3>
                            
                            <p>Send money to:</p>

                            <div>
                                <h4>@{this.state.twitterHandle}</h4>
                                <p>{this.state.recipientAddress}</p>
                            </div>

                            <div className="input-group">
                                <span className="input-group-addon">BTC </span>
                                <input type="text" className="form-control"
                                    placeholder="Amount" value={this.state.paymentAmount}
                                    onChange={this.updateValue} />
                            </div>
                        </div>
                        <div className="">
                            <button type="button" className="btn" onClick={this.submitSendForm}>Send</button>
                        </div>
                    </div>
                  </div>
                </div>
            </div>
        )
    }
})

var TwitterPaymentButton = React.createClass({
    render: function() {
        return (
            <div style={{paddingTop: '10px'}}>
                <button onClick={this.props.onClick} className="u-sizeFull btn primary-btn tweet-action tweet-btn">
                    <span className="button-text">
                        <span>
                            Send Money
                        </span>
                    </span>
                </button>
            </div>
        )
    }
})

var TwitterPageAddition = React.createClass({
    getInitialState: function() {
        return {
            showPaymentModal: false
        }
    },
    showPaymentModal: function() {
        this.setState({
            showPaymentModal: true
        })
        $('body').addClass('modal-enabled')
    },
    hidePaymentModal: function() {
        this.setState({
            showPaymentModal: false
        })
        $('body').removeClass('modal-enabled')
    },
    render: function() {
        return (
            <div>
                <TwitterPaymentButton onClick={this.showPaymentModal} />
                { this.state.showPaymentModal ?
                <PaymentModal hide={this.hidePaymentModal} />
                : null }
            </div>
        )
    }
})

if (window.location.hostname === 'twitter.com') {
    var buttonElement = document.createElement('div')
    buttonElement.id = 'zing-button'
    
    document.getElementsByClassName('ProfileMessagingActions')[0].appendChild(buttonElement)
    React.render(React.createElement(TwitterPageAddition, {}), document.getElementById('zing-button'))

    /*
    var modalElement = document.createElement('div')
    modalElement.id = 'zing-modal'

    document.body.appendChild(modalElement)
    React.render(React.createElement(PaymentModal, {}), document.getElementById('zing-modal'))
    */
} else {
}