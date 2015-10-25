'use strict';

var SATOSHIS_PER_BITCOIN = 100000000;
var Wallet = SpareCoins.Wallet(SpareCoins.ChromeStorage);

function sendMoney(recipientAddress, amount, callback) {
    Wallet.loadData(function () {
        SpareCoins.ChromeStorage.get("security", function (data) {
            var transactionOutputs = [{
                addr: recipientAddress,
                value: BigInteger.valueOf(amount * SATOSHIS_PER_BITCOIN)
            }];

            Wallet.buildPendingTransaction(transactionOutputs, data["passwordDigest"], function (pendingTransaction) {
                var txSerialized = pendingTransaction.serialize(),
                    txHash = pendingTransaction.txHash();

                chrome.runtime.sendMessage({
                    method: "pushTransaction",
                    txSerialized: txSerialized,
                    txHash: txHash,
                    txValue: transactionOutputs[0].value
                }, function (transactionSuccessful) {
                    callback(transactionSuccessful);
                });
            });
        });
    });
}

function getTicker(callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: 'https://blockchain.info/ticker',
        crossDomain: true,
        success: function success(results) {
            callback(null, results);
        },
        error: function error(err) {
            jsonError = JSON.stringify(err);
            callback(jsonError, null);
        }
    });
}

var PaymentModal = React.createClass({
    displayName: "PaymentModal",

    getInitialState: function getInitialState() {
        return {
            twitterHandle: window.location.pathname.split('/')[1],
            recipientAddress: '1DyVgc6L2kXnv96R4FCzNaMQ8iWPzHQX3T',
            paymentAmount: "0.10",
            dollarsPerBtc: null
        };
    },
    componentDidMount: function componentDidMount() {
        var _this = this;
        getTicker(function (err, data) {
            _this.setState({
                dollarsPerBtc: data['USD']['last']
            });
        });
    },
    submitSendForm: function submitSendForm() {
        var _this = this;
        if (this.state.dollarsPerBtc) {
            var btcAmount = (this.state.paymentAmount / this.state.dollarsPerBtc).toFixed(8);
            sendMoney(this.state.recipientAddress, btcAmount, function () {
                _this.props.hide();
            });
        }
    },
    updateValue: function updateValue(event) {
        this.setState({
            paymentAmount: event.target.value
        });
    },
    render: function render() {
        var modalStyle = {
            position: 'fixed',
            width: '50%',
            left: '25%',
            zIndex: '999999',
            overflow: 'hidden'
        };

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "modal", style: modalStyle },
                React.createElement(
                    "div",
                    { className: "modal-dialog" },
                    React.createElement(
                        "div",
                        { className: "modal-content" },
                        React.createElement(
                            "div",
                            { className: "modal-body" },
                            React.createElement(
                                "button",
                                { type: "button", className: "close", onClick: this.props.hide },
                                React.createElement(
                                    "span",
                                    null,
                                    "×"
                                )
                            ),
                            React.createElement(
                                "h3",
                                null,
                                "zing!"
                            ),
                            React.createElement(
                                "p",
                                null,
                                "Send money to:"
                            ),
                            React.createElement(
                                "div",
                                null,
                                React.createElement(
                                    "h4",
                                    null,
                                    "@",
                                    this.state.twitterHandle
                                ),
                                React.createElement(
                                    "p",
                                    null,
                                    this.state.recipientAddress
                                )
                            ),
                            React.createElement(
                                "div",
                                { className: "input-group" },
                                React.createElement(
                                    "span",
                                    { className: "input-group-addon" },
                                    "$ "
                                ),
                                React.createElement("input", { type: "text", className: "form-control",
                                    placeholder: "Amount", value: this.state.paymentAmount,
                                    onChange: this.updateValue })
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "" },
                            React.createElement(
                                "button",
                                { type: "button", className: "btn", onClick: this.submitSendForm },
                                "Send"
                            )
                        )
                    )
                )
            )
        );
    }
});

var TwitterPaymentButton = React.createClass({
    displayName: "TwitterPaymentButton",

    render: function render() {
        return React.createElement(
            "div",
            { style: { paddingTop: '10px' } },
            React.createElement(
                "button",
                { onClick: this.props.onClick, className: "u-sizeFull btn primary-btn tweet-action tweet-btn" },
                React.createElement(
                    "span",
                    { className: "button-text" },
                    React.createElement(
                        "span",
                        null,
                        "Send Money"
                    )
                )
            )
        );
    }
});

var TwitterPageAddition = React.createClass({
    displayName: "TwitterPageAddition",

    getInitialState: function getInitialState() {
        return {
            showPaymentModal: false
        };
    },
    showPaymentModal: function showPaymentModal() {
        this.setState({
            showPaymentModal: true
        });
        $('body').addClass('modal-enabled');
    },
    hidePaymentModal: function hidePaymentModal() {
        this.setState({
            showPaymentModal: false
        });
        $('body').removeClass('modal-enabled');
    },
    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(TwitterPaymentButton, { onClick: this.showPaymentModal }),
            this.state.showPaymentModal ? React.createElement(PaymentModal, { hide: this.hidePaymentModal }) : null
        );
    }
});

if (window.location.hostname === 'twitter.com') {
    var buttonElement = document.createElement('div');
    buttonElement.id = 'zing-button';

    document.getElementsByClassName('ProfileMessagingActions')[0].appendChild(buttonElement);
    React.render(React.createElement(TwitterPageAddition, {}), document.getElementById('zing-button'));

    /*
    var modalElement = document.createElement('div')
    modalElement.id = 'zing-modal'
     document.body.appendChild(modalElement)
    React.render(React.createElement(PaymentModal, {}), document.getElementById('zing-modal'))
    */
} else {}