'use strict';

var PaymentView = React.createClass({
    displayName: 'PaymentView',

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
        setTimeout(function () {
            _this.setState({
                buttonText: 'Send Money'
            });
        }, 1000);
    },
    render: function render() {
        if (this.state.currentHost === 'twitter.com') {
            return React.createElement(
                'div',
                { style: { paddingTop: '10px' } },
                React.createElement(
                    'button',
                    { onClick: this.onClick, className: 'u-sizeFull btn primary-btn tweet-action tweet-btn' },
                    React.createElement(
                        'span',
                        { className: 'button-text' },
                        React.createElement(
                            'span',
                            null,
                            this.state.buttonText
                        )
                    )
                )
            );
        } else {
            return React.createElement('div', null);
        }
    }
});

var mainElement = document.createElement('div');
mainElement.id = 'zing-main';
document.getElementsByClassName('ProfileMessagingActions')[0].appendChild(mainElement);

var appData = {};
React.render(React.createElement(PaymentView, appData), document.getElementById('zing-main'));