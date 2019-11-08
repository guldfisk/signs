import React from "react";

import NotFoundPage from '../pages/NotFoundPage';
import SignInPage from '../pages/authentication/SignInPage';
import SignOutPage from '../pages/authentication/SignOutPage';
import SignUpPage from "../pages/authentication/SignUpPage";
import SignPage from "../pages/SignPage";
import AtomPage from "../pages/AtomPage";


export const routes: [
  string | undefined,
  (typeof React.Component) | React.FunctionComponent,
  boolean,
  { [key: string]: any }
  ][] = [
  ['/', SignPage, false, {}],
  ['/login', SignInPage, false, {}],
  ['/logout', SignOutPage, false, {}],
  ['/sign-up', SignUpPage, false, {}],
  ['/atom/:id(\\d+)', AtomPage, false, {}],
  [undefined, NotFoundPage, false, {}],
];
