import React, { Component } from 'react';
import Auth from '../../modules/Auth';
import Header from './partials/header';

const imageMissingUrl = "http://en.immostreet.com/Content/img/icon/icon_missing_photo_detail.png";

class Tradeboard extends Component {
	constructor(props, context) {
		super(props, context);

    this.state = {
      errors: '',
      otherbooks: [],
      userbooks: [],
      otherselected: -1,
      userselected: -1
    };
    this.handleOtherBookClick = this.handleOtherBookClick.bind(this);
    this.handleUserBookClick = this.handleUserBookClick.bind(this);
    this.getUserBooks = this.getUserBooks.bind(this);
    this.handleTradeRequest = this.handleTradeRequest.bind(this);
  }

  handleOtherBookClick(event) {
    const ind = Number(event.currentTarget.dataset.id);
    if (this.state.otherselected !== ind) {
      const arr = this.state.otherbooks.concat([]);

      for (let i = 0; i < this.state.otherbooks.length; i++) {
        if (i === ind) {
          arr[i].selected = true;
        } else {
          arr[i].selected = false;
        }
      }

      this.setState({
        otherbooks: arr,
        otherselected: ind
      })
    }
  }

  handleUserBookClick(event) {
    const ind = Number(event.currentTarget.dataset.id);
    if (this.state.userselected !== ind) {
      const arr = this.state.userbooks.concat([]);

      for (let i = 0; i < this.state.userbooks.length; i++) {
        if (i === ind) {
          arr[i].selected = true;
        } else {
          arr[i].selected = false;
        }
      }

      this.setState({
        userbooks: arr,
        userselected: ind
      })
    }
  }

  getUserBooks() {
    const userId = Auth.getId();
    const formData = `userId=${userId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/books/tradeableuserbooks');
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
          userbooks: xhr.response
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

  getOtherBooks() {
    const userId = Auth.getId();
    const formData = `userId=${userId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/books/nonuserbooks');
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
          otherbooks: xhr.response
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

  handleTradeRequest() {
    const sourceUserId = Auth.getId();
    const sourceBookId = this.state.userbooks[this.state.userselected]._id;
    const targetUserId = this.state.otherbooks[this.state.otherselected].userId;
    const targetBookId = this.state.otherbooks[this.state.otherselected]._id;

    const formData = `sourceUserId=${sourceUserId}&sourceBookId=${sourceBookId}&targetUserId=${targetUserId}&targetBookId=${targetBookId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/trades/add');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success
        //console.log(xhr.response)

        // change the component-container state
        this.setState({
          errors: ''
        });

        // make a redirect
        this.props.history.push('/trades');

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
    this.getUserBooks();
    this.getOtherBooks();
  }

  render() {
    return (
      <div>
        <Header />
        <div id="tradeboard">

          <div id="logged-in-title-div">
            <h1 id="logged-in-title">Trade Board</h1>
          </div>

          {(this.state.errors !== '') ? 
          <div style={{"width":"80%", "margin":"0 auto"}}>
            <p className="error-bar">{this.state.errors}</p>
          </div> : <div/>}
          
          <div id="tradeboard-body">

            <table id="trade-table">
              <thead>
                <tr>
                  <th className="trade-table-th">Up For Trade</th>
                  <th className="trade-table-th" colspan="2">
                    <button className="btn btn-success request-btn" onClick={this.handleTradeRequest} 
                      disabled={(this.state.otherselected === -1) || (this.state.userselected === -1)}>Request trade!</button>
                  </th>
                  <th className="trade-table-th">Your Books</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td className="tradeboard-books" colspan="2"> 
                    <div className="book-div">
                    {this.state.otherbooks.map((d,i) => 
                        <img data-id={i} onClick={this.handleOtherBookClick} className={d.selected ? 
                          'trade-book-selected' : 'trade-book-unselected'} src={(d.imageurl === "") ? 
                          imageMissingUrl : d.imageurl} alt={d.title} title={d.title} />)}
                    </div>
                  </td>

                  <td className="tradeboard-books" colspan="2">
                    <div className="book-div">
                    {this.state.userbooks.map((d,i) => 
                        <img data-id={i} onClick={this.handleUserBookClick} className={d.selected ? 
                          'trade-book-selected' : 'trade-book-unselected'} src={(d.imageurl === "") ? 
                          imageMissingUrl : d.imageurl} title={d.title} alt={d.title} />)}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="book-select" colspan="2">
                    <div className="book-select-div">
                      {(this.state.otherselected !== -1) ? this.state.otherbooks[this.state.otherselected].title : "Select a book!"}
                      {(this.state.otherselected !== -1) ? <hr/> : <div/>}
                      {(this.state.otherselected !== -1) ?
                        (this.state.otherbooks[this.state.otherselected].author ? 
                          this.state.otherbooks[this.state.otherselected].author : "Unknown Author") : "" }
                      {(this.state.otherselected !== -1) ? <hr/> : <div/>}
                      {(this.state.otherselected !== -1) ?
                        ((this.state.otherbooks[this.state.otherselected].description !== '') ? 
                          this.state.otherbooks[this.state.otherselected].description : "No description found") : "" }
                    </div>
                  </td>

                  <td className="book-select" colspan="2">
                    <div className="book-select-div">
                      {(this.state.userselected !== -1) ? this.state.userbooks[this.state.userselected].title : "Select a book!"}
                      {(this.state.userselected !== -1) ? <hr/> : <div/>}
                      {(this.state.userselected !== -1) ?
                        (this.state.userbooks[this.state.userselected].author ? 
                          this.state.userbooks[this.state.userselected].author : "Unknown Author") : "" }
                      {(this.state.userselected !== -1) ? <hr/> : <div/>}
                      {(this.state.userselected !== -1) ?
                        ((this.state.userbooks[this.state.userselected].description !== '') ? 
                          this.state.userbooks[this.state.userselected].description : "No description found") : "" }
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default Tradeboard;