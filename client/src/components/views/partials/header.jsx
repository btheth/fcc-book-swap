import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Auth from '../../../modules/Auth';

class Header extends Component {
	constructor(props, context) {
		super(props, context);

    	this.state = {
    	  errors: {},
    	  trades: "..."
    	};
    	this.getTrades = this.getTrades.bind(this);
	}

	getTrades() {
		//method to get number to display in trade button
		const userId = Auth.getId();
    	const formData = `userId=${userId}`;

    	const xhr = new XMLHttpRequest();
    	xhr.open('post', '/api/trades/getnumbertrades');
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
        		  trades: xhr.response.numtrades
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

	componentDidMount() {
		//only run if user is authenticated
		if (Auth.isUserAuthenticated()) {
			this.getTrades();
		}
	}

	render() {
    return (
  		<div id='Header'>
  			{Auth.isUserAuthenticated() ?
 			<div id="header-bar">
 				<span className="left-btn">
 					<Link to='/tradeboard'><button id="header-button" className="btn btn-info" type='button'>Trade Board</button></Link>
 					<Link to='/trades'><button id="header-button" className="btn btn-info" type='button'>My Trades ({this.state.trades})</button></Link>
 				</span>
 				<span id="header-title">BookSwap</span>
 				<span className="right-btn">
 					<Link to='/profile'><button id="header-button" className="btn btn-info" type='button'>Profile</button></Link>
 					<Link to='/' onClick={() => {Auth.deauthenticateUser();}}><button id="header-button-right" className="btn btn-info" type='button'>Log Out</button></Link>
 				</span>
 			</div> :
  			<div/>}
  		</div>
    )}
}



export default Header;