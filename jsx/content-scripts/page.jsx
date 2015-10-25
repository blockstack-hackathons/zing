'use strict'

var SATOSHIS_PER_BITCOIN = 100000000
var Wallet = SpareCoins.Wallet(SpareCoins.ChromeStorage)

var styles = {
    modal: {
        position: 'fixed',
        width: '50%',
        left: '25%',
        zIndex: '999999',
        overflow: 'hidden'
    },
    modalDialog: {
    },
    modalContent: {
        position: 'relative',
        backgroundColor: '#fff',
        backgroundClip: 'padding-box',
        border: '1px solid rgba(0,0,0,0.2)',
        borderRadius: '6px'
    },
    modalBody: {
        position: 'relative',
        padding: '15px'
    },
    modalFooter: {
        padding: '15px',
        textAlign: 'right',
        borderTop: '1px solid #e5e5e5'
    },
    closeButton:  {
        marginTop: '-2px',
        cursor: 'pointer',
        background: 0,
        border: 0,
        float: 'right',
        fontSize: '21px',
        fontWeight: '700',
        lineHeight: 1,
        color: '#000',
        textShadow: '0 1px 0 #fff',
        opacity: '0.2'
    },
    formControl: {
        height: '34px',
        padding: '6px 12px',
        fontSize: '14px',
        lineHeight: '1.42857143',
        color: '#555',
        backgroundColor: '#fff',
        backgroundImage: 'none',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: 'inset 0 1pd 1pd rgba(0,0,0,.075)'
    }
}

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

function getTicker(callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: 'https://blockchain.info/ticker',
        crossDomain: true,
        success: function(results) {
            callback(null, results)
        },
        error: function(err) {
            jsonError = JSON.stringify(err)
            callback(jsonError, null)
        }
    })
}

var PaymentModal = React.createClass({
    getInitialState: function() {
        return {
            twitterHandle: window.location.pathname.split('/')[1],
            recipientAddress: '1DyVgc6L2kXnv96R4FCzNaMQ8iWPzHQX3T',
            paymentAmount: "0.10",
            dollarsPerBtc: null
        }
    },
    componentDidMount: function() {
        var _this = this
        getTicker(function(err, data) {
            _this.setState({
                dollarsPerBtc: data['USD']['last']
            })
        })
    },
    submitSendForm: function() {
        var _this = this
        if (this.state.dollarsPerBtc) {
            var btcAmount = (this.state.paymentAmount / this.state.dollarsPerBtc).toFixed(8)
            sendMoney(this.state.recipientAddress, btcAmount, function() {
                _this.props.hide()
            })
        }
    },
    updateValue: function(event) {
        this.setState({
            paymentAmount: event.target.value
        })
    },
    render: function() {
        return (
            <div>
                <div className="modal" style={styles.modal}>
                  <div className="modal-dialog" style={styles.modalDialog}>
                    <div className="modal-content" style={styles.modalContent}>
                        <div className="modal-body" style={styles.modalBody}>
                            <button type="button" className="close" style={styles.closeButton} onClick={this.props.hide}>
                                <span>&times;</span>
                            </button>

                            <h3>zing!</h3>
                            
                            <p>Send money to:</p>

                            <div>
                                <h4>@{this.state.twitterHandle}</h4>
                                <p>{this.state.recipientAddress}</p>
                            </div>

                            <div className="input-group">
                                <span className="input-group-addon">$ </span>
                                <input type="text" className="form-control" style={styles.formControl}
                                    placeholder="Amount" value={this.state.paymentAmount}
                                    onChange={this.updateValue} />
                            </div>
                        </div>
                        <div className="modal-footer" style={styles.modalFooter}>
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

var GithubPaymentButton = React.createClass({
    render: function() {
        return (
            <div style={{paddingRight: '5px'}}>
                <button onClick={this.props.onClick} className="btn btn-sm">
                    Send Money
                </button>
            </div>
        )
    }
})

var GithubPageAddition = React.createClass({
    getInitialState: function() {
        return {
            showPaymentModal: false
        }
    },
    showPaymentModal: function() {
        this.setState({
            showPaymentModal: true
        })
    },
    hidePaymentModal: function() {
        this.setState({
            showPaymentModal: false
        })
    },
    render: function() {
        return (
            <div>
                <GithubPaymentButton onClick={this.showPaymentModal} />
                { this.state.showPaymentModal ?
                <PaymentModal hide={this.hidePaymentModal} />
                : null }
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
        $('.modal').show()
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
    
    var container = document.getElementsByClassName('ProfileMessagingActions')[0]
    container.appendChild(buttonElement)
    React.render(React.createElement(TwitterPageAddition, {}), document.getElementById('zing-button'))

    /*
    var modalElement = document.createElement('div')
    modalElement.id = 'zing-modal'

    document.body.appendChild(modalElement)
    React.render(React.createElement(PaymentModal, {}), document.getElementById('zing-modal'))
    */
} else if (window.location.hostname === 'github.com') {
    var buttonElement = document.createElement('div')
    buttonElement.id = 'zing-button'
    buttonElement.style.display = 'inline-block'
    
    var container = document.getElementsByClassName('tabnav')[0].children[0]
    container.insertBefore(buttonElement, container.firstChild)
    React.render(React.createElement(GithubPageAddition, {}), document.getElementById('zing-button'))
} else {
}

$(document).mouseup(function (e) {
    var container = $('.modal')

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        container.hide()
    }
});
