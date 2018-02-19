import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../../modules/Auth';

class Register extends Component {
	constructor(props, context) {
		super(props, context);
    this.state = {
      errors: {},
    	user: {
        email: '',
        username: '',
        firstname: '',
        lastname: '',
        passone: '',
        passtwo: '',
        addr1: '',
        addr2: ''
      }
    };
    this.processForm = this.processForm.bind(this);
    this.changeUser = this.changeUser.bind(this);
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

    const username = encodeURIComponent(this.state.user.username);
    const email = encodeURIComponent(this.state.user.email);
    const passone = encodeURIComponent(this.state.user.passone);
    const passtwo = encodeURIComponent(this.state.user.passtwo);
    const firstname = encodeURIComponent(this.state.user.firstname);
    const lastname = encodeURIComponent(this.state.user.lastname);
    const addr1 = encodeURIComponent(this.state.user.addr1);
    const addr2 = encodeURIComponent(this.state.user.addr2);
    const formData = `username=${username}&email=${email}&passone=${passone}
    &passtwo=${passtwo}&firstname=${firstname}&lastname=${lastname}&addr1=${addr1}&addr2=${addr2}`;

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/auth/register');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success

        // change the component-container state
        this.setState({
          errors: {}
        });

        // save the token
        Auth.authenticateUser(xhr.response.token);

        // make a redirect to /
        this.props.history.push('/');

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

  render() {
    return (
      <div id="register">

        <div id="header-bar">
          <span className="left-btn">
            <Link to={'/'}><button id="header-button" className="btn btn-info" type='button'>Home</button></Link>
          </span>
          <span id="header-title">BookSwap</span>
          <span className="right-btn">
            <button id="header-button-right-invisible" type='button'>hi there</button>
          </span>
        </div>

        <div id="login-title-div">
          <div id="login-title"><h1>Register</h1></div>
        </div>

        <div style={{"width":"500px", "margin":"0 auto"}}>
          <form action="/" onSubmit={this.processForm}>

            {this.state.errors.summary && <p className="error-bar">{this.state.errors.summary}</p>}

            <div className="form-group">
              <label htmlFor="firstname">First Name</label>
              <input className="form-control" type="text" name="firstname" placeholder="Enter first name" onChange={this.changeUser} value={this.state.user.firstname} />
              {this.state.errors.firstname && <p className="error-bar">{this.state.errors.firstname}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Last Name</label>
              <input className="form-control" type="text" name="lastname" placeholder="Enter last name" onChange={this.changeUser} value={this.state.user.lastname} />
              {this.state.errors.lastname && <p className="error-bar">{this.state.errors.lastname}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input className="form-control" type="text" name="username" placeholder="Enter username" onChange={this.changeUser} value={this.state.user.username} />
              {this.state.errors.username && <p className="error-bar">{this.state.errors.username}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input className="form-control" type="text" name="email" placeholder="Enter email" onChange={this.changeUser} value={this.state.user.email} />
              {this.state.errors.email && <p className="error-bar">{this.state.errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="addr1">Address Line 1</label>
              <input className="form-control" type="text" name="addr1" placeholder="Enter address line 1" onChange={this.changeUser} value={this.state.user.addr1} />
              {this.state.errors.addr1 && <p className="error-bar">{this.state.errors.addr1}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="addr2">Address Line 2</label>
              <input className="form-control" type="text" name="addr2" placeholder="Enter address line 2" onChange={this.changeUser} value={this.state.user.addr2} />
              {this.state.errors.addr2 && <p className="error-bar">{this.state.errors.addr2}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="passone">Password</label>
              <input className="form-control" type="password" name="passone" placeholder="Enter password" onChange={this.changeUser} value={this.state.user.passone} />
              {this.state.errors.passone && <p className="error-bar">{this.state.errors.passone}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="passtwo">Confirm Password</label>
              <input className="form-control" type="password" name="passtwo" placeholder="Confirm password" onChange={this.changeUser} value={this.state.user.passtwo} />
              {this.state.errors.passtwo && <p className="error-bar">{this.state.errors.passtwo}</p>}
            </div>

            <button className="btn btn-success" type="submit">Submit</button>

          </form>

          <div className="other-login-option">
            Have an account?
            <br/>
            <Link to={'/login'}><button className="btn btn-info btn-sm" type='button'>Log In</button></Link>
          </div>

        </div>
      </div>
    );
  }
}

export default Register;