import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../../modules/Auth';
import Header from './partials/header';

//image for missing cover photo
const imageMissingUrl = "http://en.immostreet.com/Content/img/icon/icon_missing_photo_detail.png";

class Profile extends Component {
	constructor(props, context) {
		super(props, context);

    this.state = {
      errors: '',
      user: {},
      books: [],
      history: []
    };
    this.getUserInfo = this.getUserInfo.bind(this);
    this.getUserBooks = this.getUserBooks.bind(this);
    this.getUserHistory = this.getUserHistory.bind(this);
    this.handleRemoveBook = this.handleRemoveBook.bind(this);
    this.handleFlipTradeStatus = this.handleFlipTradeStatus.bind(this);
  }

  //post request for user info from server
  getUserInfo() {
    const userId = Auth.getId();
    const formData = `userId=${userId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/users/userinfo');
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
          user: xhr.response
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

  //post request for user's book collection from server
  getUserBooks() {
    const userId = Auth.getId();
    const formData = `userId=${userId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/books/alluserbooks');
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
          books: xhr.response
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

  //post request to remove a book from the user's collection
  handleRemoveBook(event) {
    const bookId = this.state.books[event.currentTarget.dataset.id]._id;
    const userId = Auth.getId();

    const formData = `bookId=${bookId}&userId=${userId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/books/removebook');
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
          books: xhr.response
        });

        this.getUserHistory();

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : '';

        this.setState({
          errors
        });
        window.scrollTo(0, 0);
      }
    });
    xhr.send(formData);
  }

  //post request for user's trade history
  getUserHistory() {
    const userId = Auth.getId();

    const formData = `userId=${userId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/history/userhistory');
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
          history: xhr.response
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

  //post request to flip the tradeable status of a book
  handleFlipTradeStatus(event) {
    const bookId = this.state.books[event.currentTarget.dataset.id]._id;

    const formData = `bookId=${bookId}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/books/fliptradestatus');
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
          books: xhr.response
        });

        this.getUserHistory();

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : '';

        this.setState({
          errors
        });
        window.scrollTo(0, 0);
      }
    });
    xhr.send(formData);
  }

  //do some api calls when component mounts
  componentDidMount() {
    this.getUserInfo();
    this.getUserBooks();
    this.getUserHistory();
  }

  render() {
    return (
      <div>
      <Header />
      <div id="profile">

        <div id="logged-in-title-div">
          <h1 id="logged-in-title">Profile</h1>
        </div>

        <div id="profile-body">

          {(this.state.errors !== '') ? <p className="error-bar">{this.state.errors}</p> : <div/>}

            <div id="user-info">
              <h3>Your Info <Link to='/edit'><button className="btn btn-info btn-sm" type='button'>Edit</button></Link></h3>
              {this.state.user.firstname} {this.state.user.lastname}
              <br/>
              {this.state.user.addr1}
               <br/>
              {this.state.user.addr2}
            </div>

            <hr style={{"margin":"10px"}}/>

            <div id="user-books">
              <h3 style={{"text-align":"center"}}>Your Books <Link to='/addbook'><button className="btn btn-info btn-sm" type='button'>Add Book</button></Link></h3>
              {this.state.books.map((d,i) => 
              <table id="search-table">
                <tbody>
                  <tr>
                    <td rowSpan="2" className="cover-cell"><img alt={d.title} className='trade-book-unselected' src={(d.imageurl === "") ? imageMissingUrl : d.imageurl} /></td>
                    <td className="title-cell">{d.title}</td>
                    <td className="profile-description-cell" rowSpan="3">
                      <div className="profile-description">
                        {(d.description !== "") ? d.description : "No description available"}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="title-cell">
                      {(d.author !== "") ? d.author : "Unknown Author"}
                    </td>
                  </tr>
                  <tr>
                    <td className="cover-cell" style={{"text-align":"center"}}><button className="btn btn-danger btn-sm" data-id={i} type="text" onClick={this.handleRemoveBook} >Remove</button></td>
                    <td style={{"text-align":"center"}} className="title-cell"><input readOnly checked={(d.tradeable) ? true : false} type="checkbox" data-id={i} onClick={this.handleFlipTradeStatus} /> Tradeable</td>
                  </tr>
                </tbody>
              </table>)}
            </div>

            <hr style={{"margin":"10px"}}/>

            <div id="user-history">
              <h3 style={{"text-align":"center"}}>Your history:</h3>
              <table className="user-hist-table">
                <thead>
                  <tr>
                    <th className="date-cell hist-header">Date</th>
                    <th className="action-cell hist-header">Action</th>
                    <th className="book-cell hist-header">Your book</th>
                    <th className="book-cell hist-header">Their book</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.history.map((d) => 
                    <tr>
                      <td className="date-cell">{d.time.toString().substring(0,10) + ' ' + d.time.toString().substring(11,19)}</td>
                      <td className="action-cell">{d.action}</td>
                      <td className="book-cell">{d.userbook}</td>
                      <td className="book-cell">{d.otherbook}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;