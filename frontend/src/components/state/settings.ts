import {settingsUpdated} from "./actions";


export const updateSettings = (settings: {[key: string]: string}) => {
  return (dispatch: any, getState: any) => {
    dispatch({type: settingsUpdated, settings: settings});
  }
};