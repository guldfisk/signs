import {signingIn, authFailed, signInSuccess, reSignInSuccess, signOutSuccess} from "./actions";


const initialState: {
 token: string,
 authenticated: boolean,
 errorMessage: string | null,
 loading: boolean,
 user: any,
} = {
  token: localStorage.getItem("token"),
  authenticated: null,
  errorMessage: null,
  loading: true,
  user: null,
};


export default function authReducer(state=initialState, action: any): {[key: string]: any} {

  switch (action.type) {

    case signingIn:
      return {...state, loading: true};

    case signInSuccess:
      localStorage.setItem("token", action.data.token);
      return {
        ...state,
        token: action.data.token,
        user: action.data.user,
        authenticated: true,
        loading: false,
        errorMessage: null,
      };

    case reSignInSuccess:
      return {...state, user: action.data, authenticated: true, loading: false, errorMessage: null};

    case signOutSuccess:
      localStorage.removeItem("token");
      return {...state, authenticated: false, loading: false, user: null, token: null, errorMessage: null};

    case authFailed:
      return {...state, loading: false, errorMessage: action.errorMessage};

    default:
      return state;
  }
}