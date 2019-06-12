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
          self.setState({ charities: data}) });

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
              name="payment"
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
            <div className="card">
              <a href="#" aria-label="Close" className="close">&times;</a>
              <div className="card__view card__front">
                  <div className="card__img" style={divStyle} ></div>
                  <div className="card__foot">
                      <span className="name">{item.name}</span>
                      <button className="btn btn-default">Donate</button>
                  </div>
              </div>
              <div className="card__view card__back">
                  <p className="instruct">Select the amount to donate ({item.currency})</p>
                  <div className="payments">
                    {payments}
                  </div>
                  <button className="btn btn-default" onClick={handlePay.call(self, item.id, self.state.selectedAmount, item.currency)}>Pay</button>
              </div>
            </div>
          </div>
        );
      });

      const donate = this.props.donate;
      const message = this.props.message;

      return (
        <div className="container">
          <h1>Tamboon React</h1>
          <p>All donations: {donate}</p>
          <p className="message">{message}</p>

          <div className="row row-cpr-1 row-cpr-md-2">
            {cards}
          </div>
        </div>
      );
    }
  }
);

function handlePay(id, amount, currency) {
  const self = this;
  return function() {
    fetch('http://localhost:3001/payments', {
      method: 'POST',
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
          message: `Thanks for donate ${amount}!`,
        });

        setTimeout(function() {
          self.props.dispatch({
            type: 'UPDATE_MESSAGE',
            message: '',
          });
        }, 2000);
      });
  }
}
