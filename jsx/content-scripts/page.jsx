'use strict'

var PaymentView = React.createClass({
    getInitialState: function() {
        return {
            currentHost: window.location.hostname,
            buttonText: 'Send Money'
        }
    },
    onClick: function() {
        var _this = this
        _this.setState({
            buttonText: 'Sending Money...'
        })
        setTimeout(function() {
            _this.setState({
                buttonText: 'Send Money'
            })
        }, 1000)
    },
    render: function() {
        if (this.state.currentHost === 'twitter.com') {
            return (
                <div style={{paddingTop: '10px'}}>
                    <button onClick={this.onClick} className="u-sizeFull btn primary-btn tweet-action tweet-btn">
                        <span className="button-text">
                            <span>
                                {this.state.buttonText}
                            </span>
                        </span>
                    </button>
                </div>
            )
        } else {
            return (
                <div>
                </div>
            )
        }
    }
})

var mainElement = document.createElement('div')
mainElement.id = 'zing-main'
document.getElementsByClassName('ProfileMessagingActions')[0].appendChild(mainElement)

var appData = {}
React.render(React.createElement(PaymentView, appData), document.getElementById('zing-main'))
