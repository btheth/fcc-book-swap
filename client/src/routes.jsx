import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Home from './components//views/home';
import Tradeboard from './components//views/tradeboard';
import Mytrades from './components//views/mytrades';
import Profile from './components//views/profile';
import Addbook from './components//views/addbook';
import Edit from './components//views/edit';
import Login from './components//views/login';
import Register from './components//views/register';

import Auth from './modules/Auth';

const NotLoggedInRoute = ({ component: Component, ...rest}) => (
  <Route {...rest}  render={(props) => {
    return Auth.isUserAuthenticated() ? (
        <Component {...props} />
      ):(
        <Redirect to={{
          pathname: '/'
        }} />
      )
    }
  } />
)

const LoggedInRoute = ({ component: Component, ...rest}) => (
  <Route {...rest}  render={(props) => {
    return !Auth.isUserAuthenticated() ? (
        <Component {...props} />
      ):(
        <Redirect to={{
          pathname: '/tradeboard'
        }} />
      )
    }
  } />
)


const Routes = () => (
  <Switch>
    <Route exact path='/' component={Auth.isUserAuthenticated() ? Tradeboard: Home} />
    <NotLoggedInRoute path='/trades' component={Mytrades} />
    <NotLoggedInRoute path='/tradeboard' component={Tradeboard} />
    <NotLoggedInRoute path='/profile' component={Profile} />
    <NotLoggedInRoute path='/addbook' component={Addbook} />
    <NotLoggedInRoute path='/edit' component={Edit} />
    <LoggedInRoute path='/login' component={Login} />
    <LoggedInRoute path='/register' component={Register} />
    <Route path='*' render={() => <Redirect to='/' />} />
  </Switch>
);

export default Routes;