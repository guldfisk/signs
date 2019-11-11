import React from 'react';


import {Link} from "react-router-dom";


export default class HomePage extends React.Component {

  render() {
    return <div>
      <p>
        Ye idk, tengsprog. <Link to='/sign-up/'
      >
        Make an account
      </Link>, <Link
        to='/training-set/'
      >
        generate a training set
      </Link>, <Link
        to='/train/'
      >
        train the set, its like memory cards
      </Link>.
      </p>
    </div>
  }

}