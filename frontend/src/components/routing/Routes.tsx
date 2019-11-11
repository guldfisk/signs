import React from "react";

import NotFoundPage from '../pages/NotFoundPage';
import SignInPage from '../pages/authentication/SignInPage';
import SignOutPage from '../pages/authentication/SignOutPage';
import SignUpPage from "../pages/authentication/SignUpPage";
import SignPage from "../pages/SignPage";
import AtomPage from "../pages/AtomPage";
import TrainingPage from "../pages/TrainingPage";
import TrainingSetPage from "../pages/TrainingSetPage";
import HomePage from '../pages/HomePage';


export const routes: [
  string | undefined,
  (typeof React.Component) | React.FunctionComponent,
  boolean,
  { [key: string]: any }
  ][] = [
  ['/', HomePage, false, {}],
  ['/login', SignInPage, false, {}],
  ['/logout', SignOutPage, false, {}],
  ['/sign-up', SignUpPage, false, {}],
  ['/training-set', TrainingSetPage, true, {}],
  ['/train', TrainingPage, true, {}],
  ['/atom/:id(\\d+)', AtomPage, false, {}],
  ['/sign/:id(\\d+)', SignPage, false, {}],
  [undefined, NotFoundPage, false, {}],
];
