import React from 'react';

import {Loading} from '../utils/utils';
import {FullSign} from "../models/models";
import Container from "react-bootstrap/Container";
import {SignVideo} from "../views/video";
import {Link} from "react-router-dom";


interface SignPageProps {
  match: any
}

interface SignPageState {
  sign: null | FullSign
}

export default class SignPage extends React.Component<SignPageProps, SignPageState> {

  constructor(props: SignPageProps) {
    super(props);
    this.state = {
      sign: null,
    };
  }

  componentDidMount() {
    FullSign.get(this.props.match.params.id).then(
      sign => {
        this.setState({sign})
      }
    );
  }

  render() {
    let atom = <Loading/>;
    if (this.state.sign !== null) {
      atom = <div>
        {
          <Link
            to={'/atom/' + this.state.sign.atom.id}
          >
            {this.state.sign.atom.meaning}
          </Link>
        }
        <SignVideo
          sign={this.state.sign}
        />
      </div>
    }

    return <Container
      fluid
    >
      {atom}
    </Container>
  }

}