'use strict';

var SATOSHIS_PER_BITCOIN = 100000000;
var Wallet = SpareCoins.Wallet(SpareCoins.ChromeStorage);

function sendMoney(recipientAddress, amount, callback) {
    Wallet.loadData(function () {
        SpareCoins.ChromeStorage.get("security", function (data) {
            console.log(data);

            var transactionOutputs = [{
                addr: recipientAddress,
                value: BigInteger.valueOf(amount * SATOSHIS_PER_BITCOIN)
            }];

            Wallet.buildPendingTransaction(transactionOutputs, data["passwordDigest"], function (pendingTransaction) {
                var txSerialized = pendingTransaction.serialize(),
                    txHash = pendingTransaction.txHash();

                console.log("txSerialized", txSerialized);
                console.log(transactionOutputs);

                chrome.runtime.sendMessage({
                    method: "pushTransaction",
                    txSerialized: txSerialized,
                    txHash: txHash,
                    txValue: transactionOutputs[0].value
                }, function (transactionSuccessful) {
                    console.log("transaction sent!");
                    callback(transactionSuccessful);
                });
            });
        });
    });
}

var PaymentButton = React.createClass({
    displayName: "PaymentButton",

    getInitialState: function getInitialState() {
        return {
            currentHost: window.location.hostname,
            buttonText: 'Send Money'
        };
    },
    onClick: function onClick() {
        var _this = this;
        _this.setState({
            buttonText: 'Sending Money...'
        });
        this.submitSendForm();
    },
    submitSendForm: function submitSendForm() {
        var _this = this;
        var recipientAddress = '1DyVgc6L2kXnv96R4FCzNaMQ8iWPzHQX3T',
            amount = 0.0001;
        sendMoney(recipientAddress, amount, function () {
            _this.setState({
                buttonText: 'Money Sent!'
            });
            setTimeout(function () {
                _this.setState({
                    buttonText: 'Send Money'
                });
            }, 2000);
        });
    },
    render: function render() {
        if (this.state.currentHost === 'twitter.com') {
            return React.createElement(
                "div",
                { style: { paddingTop: '10px' } },
                React.createElement(
                    "button",
                    { onClick: this.onClick, className: "u-sizeFull btn primary-btn tweet-action tweet-btn" },
                    React.createElement(
                        "span",
                        { className: "button-text" },
                        React.createElement(
                            "span",
                            null,
                            this.state.buttonText
                        )
                    )
                )
            );
        } else {
            return React.createElement("div", null);
        }
    }
});

var PaymentModal = React.createClass({
    displayName: "PaymentModal",

    render: function render() {
        return React.createElement("div", null);
    }
});

var PageAddition = React.createClass({
    displayName: "PageAddition",

    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(PaymentButton, null),
            React.createElement(PaymentModal, null)
        );
    }
});

var mainElement = document.createElement('div');
mainElement.id = 'zing-main';
document.getElementsByClassName('ProfileMessagingActions')[0].appendChild(mainElement);

var appData = {};
React.render(React.createElement(PageAddition, appData), document.getElementById('zing-main'));