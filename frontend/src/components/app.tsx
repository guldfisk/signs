import React from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';

import {Router, Route, Switch} from "react-router-dom";

import {connect, Provider} from 'react-redux';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import {LinkContainer} from 'react-router-bootstrap';

import history from './routing/history';
import {routes} from './routing/Routes';
import {loadUser} from "./auth/controller";
import {Loading} from "./utils/utils";
import SignInPage from './pages/authentication/SignInPage';
import store from './state/store';

import "../styling/global.css";


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";


interface RootProps {
  auth: {
    token: string,
    authenticated: boolean,
    loading: symbol,
    user: any,
  }
  loadUser: () => any
}


class RootComponent extends React.Component<RootProps> {

  componentDidMount() {
    this.props.loadUser()
  }

  PrivateRoute = ({component: ChildComponent, ...rest}: any) => {
    return <Route {...rest} render={
      props => {
        if (this.props.auth.loading) {
          return <Loading/>;
        } else if (!this.props.auth.authenticated) {
          return <SignInPage/>;
        } else {
          return <ChildComponent {...props} />
        }
      }
    }/>
  };

  createRoutes = (
    routes: [string | undefined, (typeof React.Component) | React.FunctionComponent, boolean, { [key: string]: any }][]
  ) => {
    return <Switch>
      {
        routes.map(
          ([path, component, isPrivate, args]) => {
            return (
              isPrivate ?
                <this.PrivateRoute
                  path={path}
                  key={path}
                  exact
                  component={component}
                  {...args}
                /> :
                <Route
                  path={path}
                  key={path}
                  exact
                  component={args.render ? undefined : component}
                  {...args}
                />
            )
          }
        )
      }
    </Switch>
  };


  render() {
    return <Router
      history={history}
    >
      <Navbar bg='light' expand='lg' collapseOnSelect>

        <Navbar.Collapse id='basic-navbar nav'>
          <Nav className='mr-auto'>

            <LinkContainer to='/'>
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>

            <LinkContainer to='/training-set'>
              <Nav.Link>Training Set</Nav.Link>
            </LinkContainer>

            <LinkContainer to='/train'>
              <Nav.Link>Train</Nav.Link>
            </LinkContainer>

            <LinkContainer to='/familiarities'>
              <Nav.Link>Familiar Signs</Nav.Link>
            </LinkContainer>

            <LinkContainer to='/sign/search'>
              <Nav.Link>Search</Nav.Link>
            </LinkContainer>

            <LinkContainer to='/training-sets/'>
              <Nav.Link>All Sets</Nav.Link>
            </LinkContainer>

          </Nav>
          <Nav className="justify-content-end">
            {
              this.props.auth.user ?
                <Nav.Link>
                  {this.props.auth.user.username}
                </Nav.Link> : null
            }
            {
              this.props.auth.authenticated ?
                <LinkContainer to='/logout/'>
                  <Nav.Link>Sign Out</Nav.Link>
                </LinkContainer>
                : [
                  <LinkContainer to='/login/'>
                    <Nav.Link>Sign In</Nav.Link>
                  </LinkContainer>,
                  < LinkContainer to='/sign-up/'>
                    <Nav.Link>Sign up</Nav.Link>
                  </LinkContainer>
                ]
            }

          </Nav>
        </Navbar.Collapse>

      </Navbar>

      {
        this.createRoutes(routes)
      }

    </Router>
  }
}


const mapStateToProps = (state: any) => {
  return {
    auth: {
      token: state.token,
      authenticated: state.authenticated,
      loading: state.loading,
      user: state.user,
    }
  }
};


const mapDispatchToProps = (dispatch: any) => {
  return {
    loadUser: () => dispatch(loadUser())
  }
};


const RootContainer = connect(mapStateToProps, mapDispatchToProps)(RootComponent);


class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <RootContainer/>
      </Provider>
    )
  }
}

const dom = document.getElementById("app");
dom ? ReactDOM.render(<App/>, dom) : null;
