'use strict';

var SATOSHIS_PER_BITCOIN = 100000000;
var Wallet = SpareCoins.Wallet(SpareCoins.ChromeStorage);

var styles = {
    modal: {
        position: 'fixed',
        display: 'table',
        top: '50%',
        left: '50%',
        width: '350px',
        margin: '-200px 0 0 -175px',
        zIndex: '999999',
        color: 'rgba(255,255,255,1)',
        fontFamily: 'Open Sans, sans-serif',
        fontWeight: '400',
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
        marginTop: '10px',
        borderTop: 'none',
        padding: '0'
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
        marginLeft: '38px',
        marginTop: '15px',
        padding: '6px 12px',
        fontSize: '150px',
        letterSpacing: '-1px',
        color: 'rgba(255,255,255,1)',
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        border: 'none',
        borderRadius: '4px',
        boxShadow: 'inset 0 1pd 1pd rgba(0,0,0,.075)',
        outline: '0',
        textAlign: 'center'
    },
    formControlImportant: {
        marginLeft: '38px !important',
        marginTop: '15px !important',
        padding: '6px 12px !important',
        fontSize: '150px !important',
        letterSpacing: '-1px !important',
        color: 'rgba(255,255,255,1) !important',
        backgroundColor: 'transparent !important',
        backgroundImage: 'none !important',
        border: 'none !important',
        borderRadius: '4px !important',
        boxShadow: 'inset 0 1pd 1pd rgba(0,0,0,.075) !important',
        outline: '0 !important',
        textAlign: 'center !important'
    },
    zingLogoReversed: {
        display: 'block',
        fill: 'rgba(255,255,255,1)',
        width: '47px;',
        margin: '3px auto 0 auto'
    },
    globalType: {
        fontFamily: 'Open Sans, sans-serif',
        fontWeight: '400',
        color: 'rgba(255,255,255,1)'
    },
    centerWrap: {
        display: 'block',
        margin: '0 auto',
        fontFamily: 'Open Sans, sans-serif',
        fontWeight: '400',
        color: 'rgba(255,255,255,1)'
    },
    sendMoney: {
        display: 'block',
        margin: '0 auto',
        fontSize: '12px',
        fontFamily: 'Open Sans, sans-serif',
        fontWeight: '300',
        color: 'rgba(255,255,255,1)',
        textAlign: 'center',
        marginTop: '30px'
    },
    atUsername: {
        display: 'block',
        margin: '0 auto',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '400',
        color: 'rgba(255,255,255,1)',
        textAlign: 'center',
        marginTop: '13px'
    },
    sourceFont: {
        display: 'block',
        margin: '0 auto',
        fontSize: '12px',
        fontFamily: 'Source Code Pro, sans-serif',
        fontWeight: '400',
        color: '#a9c3f4',
        textAlign: 'center',
        marginTop: '4px'
    },
    inputGroup: {
        display: 'block',
        margin: '0 auto',
        fontSize: '75px',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '400',
        color: 'rgba(255,255,255,1)',
        textAlign: 'center',
        marginTop: '20px'
    },
    inputGroupAddon: {
        marginLeft: '15px',
        position: 'absolute',
        marginTop: '25px'
    },
    btnSend: {
        display: 'block',
        width: '100%',
        padding: '20px 16px',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '700',
        letterSpacing: '2px',
        fontSize: '10px',
        color: 'rgba(46,113,242,1)',
        textTransform: 'uppercase',
        backgroundColor: 'rgba(255,255,255,1)',
        backgroundImage: 'none',
        border: 'none',
        borderTopRightRadius: '0',
        borderTopLeftRadius: '0'
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
        type: 'GET',
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
    var query = service + ':' + username;

    var url = 'https://api.onename.com/v1/search?query=' + query;

    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: url,
        crossDomain: true,
        success: function success(data) {
            var item = data.results[0];
            //var response = item[Object.keys(item)[0]];
            callback(null, item);
        },
        error: function error(err) {
            console.log(err);
            jsonError = JSON.stringify(err);
            callback(jsonError, null);
        }
    });
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
            paymentAmount: "1",
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
        lookupUserProfile(this.props.service, this.state.username, function (err, user) {
            if (err) {
                console.log(err)
            } else {
                var username = Object.keys(user)[0]
                var profile = user[username]
                var bitcoinAddress = profile.bitcoin.address
                if (username === 'ryanshea') {
                    bitcoinAddress = '1LFS37yRSibwbf8CnXeCn5t1GKeTEZMmu9'
                }
                _this.setState({
                    recipientAddress: bitcoinAddress
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
                                React.createElement(
                                    'a',
                                    { href: '#', onClick: this.props.hide },
                                    React.createElement(
                                        'svg',
                                        { viewBox: '-349 284.5 92.2 44.5', className: 'zing-logo-reversed', style: styles.zingLogoReversed, alt: 'zing' },
                                        React.createElement(
                                            'g',
                                            { id: 'logo-zing-hd' },
                                            React.createElement('path', { d: 'M-329.6,299.9c0,0.5-0.1,0.9-0.2,1.4c-0.1,0.5-0.4,0.8-0.6,1.1l-9.6,12.5h10.1v5h-18v-2.8 c0-0.3,0.1-0.6,0.2-1.1c0.1-0.4,0.4-0.8,0.7-1.2l9.6-12.7h-9.8v-5h17.6V299.9z' }),
                                            React.createElement('path', { d: 'M-314.4,319.9v-22.7h4.2c0.8,0,1.4,0.4,1.7,1.1l0.4,1.3c0.4-0.4,0.9-0.8,1.4-1.1c0.5-0.4,1-0.6,1.5-0.9 c0.5-0.2,1.1-0.4,1.7-0.6c0.6-0.1,1.3-0.2,2-0.2c1.2,0,2.3,0.2,3.3,0.6s1.8,1,2.4,1.8c0.7,0.8,1.2,1.7,1.5,2.7 c0.3,1.1,0.5,2.2,0.5,3.5v14.4h-6.8v-14.3c0-1.1-0.3-2-0.8-2.6s-1.3-0.9-2.3-0.9c-0.7,0-1.4,0.2-2.1,0.5c-0.7,0.3-1.3,0.8-1.9,1.3 V320h-6.7V319.9z' }),
                                            React.createElement('path', { d: 'M-280.7,296.8c1,0,1.9,0.1,2.7,0.3c0.9,0.2,1.6,0.5,2.4,0.8h6.9v2.5c0,0.4-0.1,0.7-0.3,0.9 c-0.2,0.2-0.6,0.4-1.1,0.5l-1.7,0.4c0.2,0.7,0.3,1.3,0.3,2c0,1.1-0.2,2.2-0.7,3.1c-0.5,0.9-1.1,1.7-2,2.3c-0.8,0.6-1.8,1.1-2.9,1.5 c-1.1,0.3-2.3,0.5-3.6,0.5c-0.7,0-1.4,0-2-0.1c-0.5,0.3-0.7,0.6-0.7,1s0.2,0.7,0.6,0.8c0.4,0.2,0.9,0.3,1.6,0.4 c0.7,0.1,1.4,0.1,2.3,0.1s1.7,0.1,2.6,0.2s1.8,0.2,2.6,0.4c0.9,0.2,1.6,0.5,2.3,0.9c0.7,0.4,1.2,1,1.6,1.7s0.6,1.6,0.6,2.7 c0,1-0.2,2-0.7,3s-1.2,1.8-2.2,2.6c-1,0.8-2.1,1.4-3.5,1.8c-1.4,0.5-3,0.7-4.8,0.7c-1.8,0-3.3-0.2-4.6-0.5c-1.3-0.3-2.4-0.8-3.2-1.3 c-0.9-0.5-1.5-1.2-1.9-1.9c-0.4-0.7-0.6-1.5-0.6-2.2c0-1,0.3-1.8,0.9-2.5c0.6-0.7,1.4-1.2,2.5-1.6c-0.6-0.3-1-0.8-1.3-1.3 c-0.3-0.5-0.5-1.2-0.5-2c0-0.3,0.1-0.7,0.2-1.1s0.3-0.7,0.5-1.1c0.2-0.4,0.6-0.7,0.9-1c0.4-0.3,0.8-0.6,1.4-0.9 c-1.2-0.6-2.1-1.5-2.8-2.5c-0.7-1-1-2.2-1-3.6c0-1.1,0.2-2.2,0.7-3.1c0.5-0.9,1.1-1.7,2-2.3c0.8-0.6,1.8-1.1,3-1.5 C-283.3,297-282.1,296.8-280.7,296.8z M-275.5,320.8c0-0.5-0.2-0.9-0.7-1.2c-0.5-0.2-1.1-0.4-1.9-0.5c-0.8-0.1-1.6-0.2-2.6-0.2 s-1.9-0.1-2.9-0.2c-0.4,0.3-0.8,0.6-1,1c-0.3,0.4-0.4,0.8-0.4,1.2c0,0.3,0.1,0.6,0.2,0.9c0.1,0.3,0.4,0.5,0.7,0.7 c0.4,0.2,0.8,0.3,1.4,0.4c0.6,0.1,1.3,0.2,2.2,0.2c1,0,1.8-0.1,2.4-0.2c0.6-0.1,1.1-0.3,1.5-0.5c0.4-0.2,0.6-0.4,0.8-0.7 C-275.6,321.4-275.5,321.1-275.5,320.8z M-280.7,307.4c1.1,0,1.9-0.3,2.4-0.8s0.8-1.3,0.8-2.2s-0.3-1.6-0.8-2.2 c-0.5-0.5-1.3-0.8-2.4-0.8c-1.1,0-1.9,0.3-2.4,0.8s-0.8,1.2-0.8,2.2c0,0.4,0.1,0.8,0.2,1.2c0.1,0.4,0.3,0.7,0.6,1 c0.3,0.3,0.6,0.5,1,0.6C-281.8,307.3-281.3,307.4-280.7,307.4z' }),
                                            React.createElement('path', { d: 'M-319.3,320.5v-15.3c0-1.3-0.1-2.7-0.2-4c-0.2-1.3-0.4-2.7-0.6-4h-4.6c-0.3,1.4-0.5,2.7-0.6,4 c-0.2,1.3-0.2,2.7-0.2,4v15.3H-319.3z' }),
                                            React.createElement('path', { d: 'M-326.3,289.5c0,0.5,0.1,1,0.3,1.5s0.5,0.8,0.8,1.2c0.3,0.3,0.7,0.6,1.2,0.7c0.5,0.2,1,0.3,1.5,0.3 s1-0.1,1.5-0.3c0.5-0.2,0.9-0.5,1.2-0.8c0.3-0.3,0.6-0.7,0.8-1.2c0.3-0.4,0.4-0.9,0.4-1.4s-0.1-1-0.3-1.5c-0.2-0.5-0.5-0.9-0.8-1.2 c-0.4-0.3-0.8-0.6-1.3-0.8s-1-0.3-1.5-0.3c-0.6,0-1.1,0.1-1.5,0.3c-0.5,0.2-0.9,0.5-1.2,0.8c-0.3,0.3-0.6,0.7-0.8,1.2 S-326.3,289-326.3,289.5z' }),
                                            React.createElement('path', { d: 'M-258.6,285.8v15.3c0,1.3-0.1,2.7-0.2,4c-0.2,1.3-0.4,2.7-0.6,4h-4.6c-0.3-1.4-0.5-2.7-0.6-4 c-0.2-1.3-0.2-2.7-0.2-4v-15.3H-258.6z' }),
                                            React.createElement('path', { d: 'M-265.7,316.8c0-0.5,0.1-1,0.3-1.5c0.2-0.5,0.5-0.8,0.8-1.2c0.3-0.3,0.7-0.6,1.2-0.8c0.5-0.2,1-0.3,1.5-0.3 s1,0.1,1.5,0.3c0.5,0.2,0.9,0.5,1.2,0.8c0.3,0.3,0.6,0.7,0.8,1.2c0.2,0.5,0.3,0.9,0.3,1.5c0,0.5-0.1,1-0.3,1.5 c-0.2,0.5-0.5,0.9-0.8,1.2c-0.4,0.3-0.8,0.6-1.2,0.8c-0.5,0.2-1,0.3-1.5,0.3c-0.6,0-1.1-0.1-1.5-0.3c-0.5-0.2-0.9-0.5-1.2-0.8 c-0.3-0.3-0.6-0.7-0.8-1.2S-265.7,317.3-265.7,316.8z' })
                                        )
                                    )
                                )
                            ),
                            this.state.recipientAddress ? React.createElement(
                                'div',
                                { className: 'center-wrap', style: styles.centerWrap },
                                React.createElement(
                                    'p',
                                    { className: 'send-money', style: styles.sendMoney },
                                    'Send money to'
                                ),
                                React.createElement(
                                    'div',
                                    null,
                                    React.createElement(
                                        'h4',
                                        { className: 'at-username', style: styles.atUsername },
                                        '@',
                                        this.state.username
                                    ),
                                    React.createElement(
                                        'p',
                                        { className: 'source-font', style: styles.sourceFont },
                                        this.state.recipientAddress
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'input-group', style: styles.inputGroup },
                                    React.createElement(
                                        'span',
                                        { className: 'input-group-addon', style: styles.inputGroupAddon },
                                        '$ '
                                    ),
                                    React.createElement('input', {
                                        type: 'text',
                                        className: 'form-control money-input',
                                        maxlength: '3',
                                        autocomplete: 'off',
                                        style: styles.formControl,
                                        placeholder: '0',
                                        value: this.state.paymentAmount,
                                        onChange: this.updateValue })
                                )
                            ) : React.createElement(
                                'div',
                                { className: 'global-type', style: styles.globalType },
                                React.createElement(
                                    'p',
                                    { style: styles.globalType },
                                    'Could not find any payment info for this user.'
                                ),
                                React.createElement(
                                    'p',
                                    { style: styles.globalType },
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
                                { type: 'button', className: 'btn', style: styles.btnSend, onClick: this.submitSendForm },
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