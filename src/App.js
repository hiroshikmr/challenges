import React, { Component } from 'react';
import { connect } from 'react-redux';
import fetch from 'isomorphic-fetch';

import { summaryDonations } from './helpers';

export default connect((state) => state)(

  class App extends Component {
    constructor(props) {
      super();

      this.state = {
        charities: [],
        selectedAmount: 10,
      };
    }

    componentDidMount() {
      const self = this;
      fetch('http://localhost:3001/charities')
        .then(function(resp) { return resp.json(); })
        .then(function(data) {
          data.map((item) => (item.cardId = 'card-' + item.id, item.paymentId = 'payment-' + item.id));
          self.setState({ charities:data }) });

      fetch('http://localhost:3001/payments')
        .then(function(resp) { return resp.json() })
        .then(function(data) {
          self.props.dispatch({
            type: 'UPDATE_TOTAL_DONATE',
            amount: summaryDonations(data.map((item) => (item.amount != undefined ? item.amount : 0))),
          });
        })
    }


    render() {
      const self = this;
      const cards = this.state.charities.map(function(item, i) {
        const payments = [10, 20, 50, 100, 500].map((amount, j) => (
          <label key={j}>
            <input
              type="radio"
              name={item.paymentId}
              onClick={function() {
                self.setState({ selectedAmount: amount })
              }} /> {amount}
          </label>
        ));

        const divStyle = {
          backgroundImage: 'url(images/' + item.image + ')',
        };

        return (
          <div className="col" key={i}>
            <div className="card" id={item.cardId}>
              <a href="javascript:;" aria-label="Close" className="close" onClick={handleCardDonate.call(self, item.cardId, false)}>&times;</a>
              <div className="card__view card__front">
                  <div className="card__img" style={divStyle} ></div>
                  <div className="card__foot">
                      <span className="name">{item.name}</span>
                      <button className="btn btn-default" onClick={handleCardDonate.call(self, item.cardId, true)}>Donate</button>
                  </div>
              </div>
              <div className="card__view card__back">
                  <p className="instruct">Select the amount to donate ({item.currency})</p>
                  <div className="payments">
                    {payments}
                  </div>
                  <button className="btn btn-default" onClick={handlePay.call(self, item.id, self.state.selectedAmount, item.currency, item.paymentId)}>Pay</button>
              </div>
            </div>
          </div>
        );
      });

      const donate = this.props.donate;
      const message = this.props.message;
      const messageType = this.props.messageType;

      return (
        <section>
          <div className="header">
            <div className="container">
              <h1>Tamboon React</h1>
              <div className="summary">
                <span className="total">All donations: <strong>{donate}</strong></span>
                <span className={"message " + messageType}>{message}</span>
              </div>
            </div>
          </div>
          <div className="main-content">
            <div className="container">
              <div className="row row-cpr-1 row-cpr-md-2">
                {cards}
              </div>
            </div>
          </div>
        </section>
      );
    }
  }
);

function handleCardDonate(cardId, active) {
    return function () {
      const _el = document.getElementById(cardId);
      const _current = document.getElementsByClassName('card--active');

        if (active) {
            if (_current.length > 0) {
                _current[0].classList.remove('card--active');
            }
            _el.classList.add('card--active');
        } else {
            _el.classList.remove('card--active');
        }
    }
}

function handlePay(id, amount, currency, paymentId) {
  const self = this;
  return function() {

    // inform user if not yet choose payment amount
    const _selectedAmount = document.querySelector('input[name="' + paymentId + '"]:checked');
    if (_selectedAmount == null) {
        self.props.dispatch({
            type: 'UPDATE_MESSAGE',
            message: `Please choose the amount!`,
            messageType: 'error'
        });

        setTimeout(function() {
          self.props.dispatch({
            type: 'UPDATE_MESSAGE',
            message: '',
            messageType: ''
          });
        }, 1000);

        return;
    }

    // update database
    fetch('http://localhost:3001/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: `{ "charitiesId": ${id}, "amount": ${amount}, "currency": "${currency}" }`,
    })
      .then(function(resp) { return resp.json(); })
      .then(function() {
        self.props.dispatch({
          type: 'UPDATE_TOTAL_DONATE',
          amount,
        });
        self.props.dispatch({
          type: 'UPDATE_MESSAGE',
          message: `Thanks for donate ${amount} (${currency})!`,
          messageType: 'success'
        });

        setTimeout(function() {
          self.props.dispatch({
            type: 'UPDATE_MESSAGE',
            message: '',
            messageType: ''
          });
        }, 2000);
      });
  }
}
