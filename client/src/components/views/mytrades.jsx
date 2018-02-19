import React, { Component } from 'react';
import Auth from '../../modules/Auth';
import Header from './partials/header';

const arrow = "http://pngimages.net/sites/default/files/left-right-double-arrow-png-image-72393.png";
const imageMissingUrl = "http://en.immostreet.com/Content/img/icon/icon_missing_photo_detail.png";

class Mytrades extends Component {
	constructor(props, context) {
		super(props, context);

    this.state = {
      errors: '',
      myrequests: [],
      traderequests: [],
      myLoaded: false,
      otherLoaded: false
    };
    this.getMyRequests = this.getMyRequests.bind(this);
    this.getTradeRequests = this.getTradeRequests.bind(this);
    this.handleAcceptTrade = this.handleAcceptTrade.bind(this);
    this.handleRejectTrade = this.handleRejectTrade.bind(this);
    this.handleCancelTrade = this.handleCancelTrade.bind(this);
  }

  getMyRequests() {
    const userId = Auth.getId();

    const formData = `userId=${userId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/trades/usertrades');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        //console.log("my requests: ", xhr.response)

        // change the component-container state
        this.setState({
          errors: '',
          myrequests: xhr.response,
          myLoaded: true
        });

      } else {
        // failure
        const errors = xhr.response.errors ? xhr.response.errors : {};

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
  }

  getTradeRequests() {
    const userId = Auth.getId();

    const formData = `userId=${userId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/trades/tradesforuser');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        //console.log("trade requests: ", xhr.response)

        // change the component-container state
        this.setState({
          errors: '',
          traderequests: xhr.response,
          otherLoaded: true
        });

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : '';

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
  }

  componentDidMount() {
    this.getMyRequests();
    this.getTradeRequests();
  }

  handleAcceptTrade(event) {
    const ind = Number(event.currentTarget.dataset.id);
    const tradeId = this.state.traderequests[ind].tradeId;

    const formData = `tradeId=${tradeId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/trades/acceptrade');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        //console.log(xhr.response)

        // change the component-container state
        this.setState({
          errors: '',
          otherLoaded: false
        });

        this.getMyRequests();
        this.getTradeRequests();
        // make a redirect
        this.props.history.push('/profile');

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : '';

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
  }

  handleRejectTrade(event) {
    const ind = Number(event.currentTarget.dataset.id);
    const tradeId = this.state.traderequests[ind].tradeId;

    const formData = `tradeId=${tradeId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/trades/rejecttrade');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        //console.log(xhr.response)

        // change the component-container state
        this.setState({
          errors: '',
          otherLoaded: false
        });

        this.getTradeRequests();

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : '';

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
  }

  handleCancelTrade(event) {
    const ind = Number(event.currentTarget.dataset.id);
    const tradeId = this.state.myrequests[ind].tradeId;

    const formData = `tradeId=${tradeId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/trades/canceltrade');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        //console.log(xhr.response)

        // change the component-container state
        this.setState({
          errors: '',
          myLoaded: false
        });

        this.getMyRequests();

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : '';

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
  }

  render() {
    return (
      <div>
        <Header />
        <div id="mytrades">

          <div id="logged-in-title-div">
            <h1 id="logged-in-title">My Trades</h1>
          </div>

          <div id="trades-body">
            {(this.state.errors !== '') ? <p className="error-bar">{this.state.errors}</p> : <div/>}

            <div id="requested-trades">
              <h3>Trade Requests</h3>
              {this.state.traderequests.map((d,i) => 
              <table className="my-trade-table">
                <tbody>
                    <tr>
                      <td className="trades-cover-cell">
                        <img className="my-trade-book" alt={d.mybook.title} src={(d.mybook.imageurl !== "") ? d.mybook.imageurl : imageMissingUrl}/>
                        <img className="my-trade-arrow" alt="arrow" src={arrow}/>
                        <img className="my-trade-book" alt={d.sourcebook.title} src={(d.sourcebook.imageurl !== "") ? d.sourcebook.imageurl : imageMissingUrl}/>
                      </td>
                      <td className="trades-request-cell">
                        {d.sourceuser} wants to trade their copy of &#39;{d.sourcebook.title}&#39; for your copy of &#39;{d.mybook.title}&#39;
                      </td>
                      <td className="trade-button-cell">
                        <button className="btn btn-success btn-sm" style={{"margin-right":"5px"}} data-id={i} type="text" onClick={this.handleAcceptTrade}>Accept</button>
                        <button className="btn btn-danger btn-sm" data-id={i} type="text" onClick={this.handleRejectTrade}>Reject</button>
                      </td>
                    </tr>
                </tbody>
              </table>)}
              {((this.state.otherLoaded && this.state.traderequests.length === 0) ? <p>No trade requests found for you</p> : <div/>)}
            </div>

            <div id="my-requests">
              <h3>Your Outstanding Trade Requests</h3>
              {this.state.myrequests.map((d,i) => 
              <table className="my-trade-table">
                <tbody>
                    <tr>
                      <td className="trades-cover-cell">
                        <img className="my-trade-book" alt={d.mybook.title} src={(d.mybook.imageurl !== "") ? d.mybook.imageurl : imageMissingUrl}/>
                        <img className="my-trade-arrow" alt="arrow" src={arrow}/>
                        <img className="my-trade-book" alt={d.targetbook.title} src={(d.targetbook.imageurl !== "") ? d.targetbook.imageurl : imageMissingUrl}/>
                      </td>
                      <td className="trades-request-cell">
                        You requested to trade {d.otheruser} your copy of &#39;{d.mybook.title}&#39; for their copy of &#39;{d.targetbook.title}&#39;
                      </td>
                      <td className="trade-button-cell">
                        <button className="btn btn-danger btn-sm" data-id={i} type="text" onClick={this.handleCancelTrade}>Cancel</button>
                      </td>
                    </tr>
                </tbody>
              </table>)}
              {((this.state.myLoaded && this.state.myrequests.length === 0) ? <p>No outstanding trade requests found</p> : <div/>)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Mytrades;