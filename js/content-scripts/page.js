'use strict';

var SATOSHIS_PER_BITCOIN = 100000000;
var Wallet = SpareCoins.Wallet(SpareCoins.ChromeStorage);

var styles = {
    modal: {
        position: 'fixed',
        width: '50%',
        left: '25%',
        zIndex: '999999',
        overflow: 'hidden'
    },
    modalDialog: {},
    modalContent: {
        position: 'relative',
        backgroundColor: 'rgba(46,113,242,1)',
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
    closeButton: {
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
};

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

function lookupUserProfile(service, username, callback) {
    var directory = {
        'twitter:ryaneshea': {
            profile: {
                bitcoin: {
                    address: '1LFS37yRSibwbf8CnXeCn5t1GKeTEZMmu9'
                }
            }
        },
        'github:shea256': {
            profile: {
                bitcoin: {
                    address: '1LFS37yRSibwbf8CnXeCn5t1GKeTEZMmu9'
                }
            }
        },
        'twitter:muneeb': {
            profile: {
                bitcoin: {
                    address: '1LNLCwtigWAvLkNakUK4jnmmvdVvmULeES'
                }
            }
        },
        'github:muneeb-ali': {
            profile: {
                bitcoin: {
                    address: '1LNLCwtigWAvLkNakUK4jnmmvdVvmULeES'
                }
            }
        }
    };

    var lookupValue = service + ':' + username;
    if (lookupValue in directory) {
        callback(null, directory[lookupValue].profile);
    } else {
        callback('no record found', null);
    }
}

var PaymentModal = React.createClass({
    displayName: 'PaymentModal',

    getInitialState: function getInitialState() {
        var username = '';
        if (this.props.service === 'twitter') {
            username = window.location.pathname.split('/')[1];
        } else if (this.props.service === 'github') {
            username = window.location.pathname.split('/')[1];
        }

        return {
            username: username,
            recipientAddress: null,
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
        lookupUserProfile(this.props.service, this.state.username, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                _this.setState({
                    recipientAddress: data.bitcoin.address
                });
            }
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
        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { className: 'modal zing-modal', style: styles.modal },
                React.createElement(
                    'div',
                    { className: 'modal-dialog', style: styles.modalDialog },
                    React.createElement(
                        'div',
                        { className: 'modal-content', style: styles.modalContent },
                        React.createElement(
                            'div',
                            { className: 'modal-body', style: styles.modalBody },
                            React.createElement(
                                'button',
                                { type: 'button', className: 'close', style: styles.closeButton, onClick: this.props.hide },
                                React.createElement(
                                    'span',
                                    null,
                                    '×'
                                )
                            ),
                            React.createElement(
                                'h3',
                                null,
                                'zing!'
                            ),
                            this.state.recipientAddress ? React.createElement(
                                'div',
                                null,
                                React.createElement(
                                    'p',
                                    null,
                                    'Send money to:'
                                ),
                                React.createElement(
                                    'div',
                                    null,
                                    React.createElement(
                                        'h4',
                                        null,
                                        '@',
                                        this.state.username
                                    ),
                                    React.createElement(
                                        'p',
                                        null,
                                        this.state.recipientAddress
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'input-group' },
                                    React.createElement(
                                        'span',
                                        { className: 'input-group-addon' },
                                        '$ '
                                    ),
                                    React.createElement('input', { type: 'text', className: 'form-control', style: styles.formControl,
                                        placeholder: 'Amount', value: this.state.paymentAmount,
                                        onChange: this.updateValue })
                                )
                            ) : React.createElement(
                                'div',
                                null,
                                React.createElement(
                                    'p',
                                    null,
                                    'Could not find any payment info for this user.'
                                ),
                                React.createElement(
                                    'p',
                                    null,
                                    'To send them money, make sure they have a blockchain ID with a Bitcoin address and a ',
                                    this.props.service,
                                    ' verification.'
                                )
                            )
                        ),
                        this.state.recipientAddress ? React.createElement(
                            'div',
                            { className: 'modal-footer', style: styles.modalFooter },
                            React.createElement(
                                'button',
                                { type: 'button', className: 'btn', onClick: this.submitSendForm },
                                'Send'
                            )
                        ) : null
                    )
                )
            )
        );
    }
});

var TwitterPaymentButton = React.createClass({
    displayName: 'TwitterPaymentButton',

    render: function render() {
        return React.createElement(
            'div',
            { style: { paddingTop: '10px' } },
            React.createElement(
                'button',
                { onClick: this.props.onClick, className: 'u-sizeFull btn primary-btn tweet-action tweet-btn' },
                React.createElement(
                    'span',
                    { className: 'button-text' },
                    React.createElement(
                        'span',
                        null,
                        'Send Money'
                    )
                )
            )
        );
    }
});

var GithubPaymentButton = React.createClass({
    displayName: 'GithubPaymentButton',

    render: function render() {
        return React.createElement(
            'div',
            { style: { paddingRight: '5px' } },
            React.createElement(
                'button',
                { onClick: this.props.onClick, className: 'btn btn-sm' },
                'Send Money'
            )
        );
    }
});

var GithubPageAddition = React.createClass({
    displayName: 'GithubPageAddition',

    getInitialState: function getInitialState() {
        return {
            showPaymentModal: false
        };
    },
    showPaymentModal: function showPaymentModal() {
        this.setState({
            showPaymentModal: true
        });
        $('.zing-modal').show();
    },
    hidePaymentModal: function hidePaymentModal() {
        this.setState({
            showPaymentModal: false
        });
    },
    render: function render() {
        return React.createElement(
            'div',
            null,
            React.createElement(GithubPaymentButton, { onClick: this.showPaymentModal }),
            this.state.showPaymentModal ? React.createElement(PaymentModal, { hide: this.hidePaymentModal, service: 'github' }) : null
        );
    }
});

var TwitterPageAddition = React.createClass({
    displayName: 'TwitterPageAddition',

    getInitialState: function getInitialState() {
        return {
            showPaymentModal: false
        };
    },
    showPaymentModal: function showPaymentModal() {
        this.setState({
            showPaymentModal: true
        });
        $('.zing-modal').show();
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
            'div',
            null,
            React.createElement(TwitterPaymentButton, { onClick: this.showPaymentModal }),
            this.state.showPaymentModal ? React.createElement(PaymentModal, { hide: this.hidePaymentModal, service: 'twitter' }) : null
        );
    }
});

if (window.location.hostname === 'twitter.com') {
    // Add the payment button to the Twitter page
    var buttonElement = document.createElement('div');
    buttonElement.id = 'zing-button';

    var container = document.getElementsByClassName('ProfileMessagingActions')[0];
    container.appendChild(buttonElement);
    React.render(React.createElement(TwitterPageAddition, {}), document.getElementById('zing-button'));
} else if (window.location.hostname === 'github.com') {
    // Add the payment button to the GitHub page
    var buttonElement = document.createElement('div');
    buttonElement.id = 'zing-button';
    buttonElement.style.display = 'inline-block';

    var container = document.getElementsByClassName('tabnav')[0].children[0];
    container.insertBefore(buttonElement, container.firstChild);
    React.render(React.createElement(GithubPageAddition, {}), document.getElementById('zing-button'));
} else {
    // Do nothing
}

$(document).mouseup(function (e) {
    var container = $('.zing-modal');

    if (!container.is(e.target) // if the target of the click isn't the container...
     && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            container.hide();
            if (window.location.hostname === 'twitter.com') {
                $('body').removeClass('modal-enabled');
            }
        }
});