'use strict'

var PaymentInterface = React.createClass({
    getInitialState: function() {
        return {
            appName: 'Zing!'
        }
    },
    render: function() {
        var divStyle = {
            position: 'absolute',
            left: '0',
            top: '0'
        }
        return (
            <div style={divStyle}>
                <p>App: {this.state.appName}</p>
            </div>
        )
    }
})

var mainElement = document.createElement('div')
mainElement.id = 'zing-main'
document.body.appendChild(mainElement)

var appData = {}
var paymentInterface = React.render(
    React.createElement(PaymentInterface, appData),
    document.getElementById('zing-main')
)
