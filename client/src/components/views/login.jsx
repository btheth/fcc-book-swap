import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../../modules/Auth';

class Login extends Component {
	constructor(props, context) {
		super(props, context);

    const storedMessage = localStorage.getItem('successMessage');
    let successMessage = '';

    if (storedMessage) {
      successMessage = storedMessage;
      localStorage.removeItem('successMessage');
    }

    this.state = {
      errors: {},
      successMessage,
      user: {
        username: '',
        password: ''
      }
    };
    this.processForm = this.processForm.bind(this);
    this.changeUser = this.changeUser.bind(this);
  }

  processForm(event) {
    event.preventDefault();

    const username = encodeURIComponent(this.state.user.username);
    const password = encodeURIComponent(this.state.user.password);
    const formData = `username=${username}&password=${password}`;

    //console.log('username:', this.state.user.username);
    //console.log('password:', this.state.user.password);

    const xhr = new XMLHttpRequest();
    xhr.open('post', '/auth/login');
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

        // change the current URL to /
        this.props.history.push('/');
      } else {
        // failure

        // change the error message
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

  render() {
    return (
      <div id="login">

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
          <div id="login-title"><h1>Login</h1></div>
        </div>

        <div style={{"width":"500px", "margin":"0 auto"}}>
          <form action="/" onSubmit={this.processForm}>

            {this.state.errors.summary && <p className="error-bar">{this.state.errors.summary}</p>}
        
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input className="form-control" type="text" name="username" placeholder="Enter username" onChange={this.changeUser} value={this.state.user.username} />
            </div>
          
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input className="form-control" type="password" name="password" placeholder="Enter password" onChange={this.changeUser} value={this.state.user.password} />
            </div>

            <button className="btn btn-success" type="submit">Submit</button>

          </form>

          <div className="other-login-option">
            Need an account?
            <br/>
            <Link to={'/register'}><button className="btn btn-info btn-sm" type='button'>Register</button></Link>
          </div>

        </div>
      </div>
    );
  }
}

export default Login;