import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from './partials/header';
import Auth from '../../modules/Auth';

class Edit extends Component {
	constructor(props, context) {
		super(props, context);
    this.state = {
      errors: {},
    	user: {}
    };
    this.processForm = this.processForm.bind(this);
    this.changeUser = this.changeUser.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
  }

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
          errors: {},
          user: xhr.response
        });

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : {};
        errors.summary = xhr.response.message;

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
  }

  changeUser(event) {
    const field = event.target.name;
    const user = this.state.user;
    user[field] = event.target.value;
  
    this.setState({
      user
    });
  }

  processForm(event) {
    event.preventDefault();

    const userId = encodeURIComponent(Auth.getId());
    const email = encodeURIComponent(this.state.user.email);
    const firstname = encodeURIComponent(this.state.user.firstname);
    const lastname = encodeURIComponent(this.state.user.lastname);
    const addr1 = encodeURIComponent(this.state.user.addr1);
    const addr2 = encodeURIComponent(this.state.user.addr2);
    const formData = `userId=${userId}&email=${email}&firstname=${firstname}&lastname=${lastname}&addr1=${addr1}&addr2=${addr2}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/api/users/update');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success

        // change the component-container state
        this.setState({
          errors: {}
        });

        // make a redirect
        this.props.history.push('/profile');

      } else {
        // failure

        const errors = xhr.response.errors ? xhr.response.errors : {};
        errors.summary = xhr.response.message;

        this.setState({
          errors
        });
      }
    });
    xhr.send(formData);
  }

  componentDidMount() {
    this.getUserInfo();
  }

  render() {
    return (
      <div>
        <Header />
        <div id="edit">

          <div id="logged-in-title-div">
            <h1 id="logged-in-title">Edit Profile</h1>
          </div>

          <div id="edit-body">
            <form action="/" onSubmit={this.processForm}>

              {this.state.errors.summary && <p className="error-bar">{this.state.errors.summary}</p>}

              <div className="form-group">
                <label htmlFor="firstname">First Name</label>
                <input className="form-control" type="text" name="firstname" onChange={this.changeUser} value={this.state.user.firstname} />
                {this.state.errors.firstname && <p className="error-bar">{this.state.errors.firstname}</p>}
              </div>
            

              <div className="form-group">
                <label htmlFor="lastname">Last Name</label>
                <input className="form-control" type="text" name="lastname" onChange={this.changeUser} value={this.state.user.lastname} />
                {this.state.errors.lastname && <p className="error-bar">{this.state.errors.lastname}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input className="form-control" type="text" name="email" onChange={this.changeUser} value={this.state.user.email} />
                {this.state.errors.email && <p className="error-bar">{this.state.errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="addr1">Address Line 1</label>
                <input className="form-control" type="text" name="addr1" onChange={this.changeUser} value={this.state.user.addr1} />
                {this.state.errors.addr1 && <p className="error-bar">{this.state.errors.addr1}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="addr2">Address Line 2</label>
                <input className="form-control" type="text" name="addr2" onChange={this.changeUser} value={this.state.user.addr2} />
                {this.state.errors.addr2 && <p className="error-bar">{this.state.errors.addr2}</p>}
              </div>

              <button className="btn btn-success edit-submit" type="submit">Submit</button>
              <Link to='/profile'><button className="btn btn-danger" type='button'>Cancel</button></Link>

            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Edit;