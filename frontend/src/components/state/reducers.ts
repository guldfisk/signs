import {signingIn, authFailed, signInSuccess, reSignInSuccess, signOutSuccess, settingsUpdated} from "./actions";
import {keys} from "ts-transformer-keys";


export interface Settings {
  defaultTrainingSetSize: number
  trainingSetThreshold: number
  repetitionThreshold: number
  trainingMode: string
  includeReverse: string
}


const settingsDefaults: Settings = {
  defaultTrainingSetSize: 20,
  trainingSetThreshold: 3,
  repetitionThreshold: 6,
  trainingMode: 'set',
  includeReverse: '',
};


interface StoreState {
  token: string
  authenticated: boolean
  errorMessage: string | null
  loading: boolean
  user: any
  settings: Settings
}


const initialState: StoreState = {
  token: localStorage.getItem("token"),
  authenticated: null,
  errorMessage: null,
  loading: true,
  user: null,
  settings: (
    Object.fromEntries(
      keys<Settings>().map(
        key => {
          const fromStorage = localStorage.getItem(key);
          return [key, fromStorage === null ? settingsDefaults[key] : fromStorage]
        }
      )
    ) as any as Settings
  ),
};


export default function authReducer(state = initialState, action: any): StoreState {

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

    case settingsUpdated:
      Object.entries(action.settings).map(
        ([key, value]) => {
          localStorage.setItem(key, value.toString());
        }
      );
      return {...state, settings: {...state.settings, ...action.settings}};

    default:
      return state;
  }

}