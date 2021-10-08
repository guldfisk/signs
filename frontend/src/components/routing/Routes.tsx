import React from "react";

import NotFoundPage from '../pages/NotFoundPage';
import SignInPage from '../pages/authentication/SignInPage';
import SignOutPage from '../pages/authentication/SignOutPage';
import SignUpPage from "../pages/authentication/SignUpPage";
import SignPage from "../pages/SignPage";
import TrainingPage from "../pages/TrainingPage";
import TrainingSetPage from "../pages/TrainingSetPage";
import HomePage from '../pages/HomePage';
import FamiliarityPage from "../pages/FamiliarityPage";
import SearchPage from "../pages/SearchPage";
import TrainingSetsPage from "../pages/TrainingSetsPage";
import CurrentTrainingSetPage from "../pages/CurrentTrainingSetPage";


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
  ['/training-sets/', TrainingSetsPage, false, {}],
  ['/training-set/:id(\\d+)/', TrainingSetPage, false, {}],
  ['/training-set', CurrentTrainingSetPage, true, {}],
  ['/train', TrainingPage, true, {}],
  ['/familiarities', FamiliarityPage, true, {}],
  ['/sign/:id(\\d+)', SignPage, false, {}],
  [
    '/sign/search',
    SearchPage,
    false,
    {
      render: (
        (props: any) => <SearchPage {...props} key={props.location.search}/>
      )
    },
  ],
  [undefined, NotFoundPage, false, {}],
];
