import axios from 'axios';

import {signingIn, authFailed, signInSuccess, reSignInSuccess, signOutSuccess} from '../state/actions';


export const signUp = ({username, email, password}: {username: string, email: string, password: string}) => {
  return (dispatch: any, getState: any) => {
    return axios.post(
      '/api/auth/signup/',
      {
        username,
        email,
        password,
      }
    ).then(
      response => {
        dispatch({type: signInSuccess, data: response.data});
      }
    ).catch(
      error => {
        dispatch(
          {
            type: authFailed,
            errorMessage: typeof(error.response.data) === 'string' ?
              error.response.data
              : Object.entries(error.response.data).map(
              ([key, value]) => key.toString() + ': ' + value.toString()
            ).join(', '),
          }
        )
      }
    )
  }
};


export const loadUser = () => {
  return (dispatch: any, getState: any) => {
    const token = getState().token;
    if (!token) {
      dispatch({type: authFailed});
      return;
    }

    dispatch({type: signingIn});

    axios.get(
      "/api/auth/user/",
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        }
      },
    ).then(
      response => {
        dispatch({type: reSignInSuccess, data: response.data});
      }
    ).catch(
      exception => {
        dispatch({type: authFailed});
      }
    )
  }
};


export const signIn = (username: string, password: string) => {
  return (dispatch: any, getState: any) => {
    return axios.post(
      '/api/auth/login/',
      {username, password},
    ).then(
      result => {
        dispatch({type: signInSuccess, data: result.data});
      }
    ).catch(
      error => {
        dispatch({type: authFailed, errorMessage: "Invalid username or password"});
      }
    )
  }
};


export const signOut = (token: string) => {
  return (dispatch: any, getState: any) => {

    return axios.post(
      '/api/auth/logout/',
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        }
      },
    ).then(
      result => {
        dispatch({type: signOutSuccess});
      }
    ).catch(
      exception => {
        dispatch({type: authFailed});
      }
    )
  }
};