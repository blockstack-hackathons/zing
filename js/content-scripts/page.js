'use strict';

var PaymentInterface = React.createClass({
    displayName: 'PaymentInterface',

    getInitialState: function getInitialState() {
        return {
            appName: 'Zing!'
        };
    },
    render: function render() {
        var divStyle = {
            position: 'absolute',
            left: '0',
            top: '0'
        };
        return React.createElement(
            'div',
            { style: divStyle },
            React.createElement(
                'p',
                null,
                'App: ',
                this.state.appName
            )
        );
    }
});

var mainElement = document.createElement('div');
mainElement.id = 'zing-main';
document.body.appendChild(mainElement);

var appData = {};
var paymentInterface = React.render(React.createElement(PaymentInterface, appData), document.getElementById('zing-main'));