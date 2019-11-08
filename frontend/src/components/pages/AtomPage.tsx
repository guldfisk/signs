import React from 'react';

import {Loading} from '../utils/utils';
import {Atom} from "../models/models";
import AtomView from "../views/atom";
import Container from "react-bootstrap/Container";


interface AtomPageProps {
  match: any
}

interface AtomPageState {
  atom: null | Atom
}

export default class AtomPage extends React.Component<AtomPageProps, AtomPageState> {

  constructor(props: AtomPageProps) {
    super(props);
    this.state = {
      atom: null,
    };
  }

  componentDidMount() {
    Atom.get(this.props.match.params.id).then(
      atom => {
        this.setState({atom: atom})
      }
    );
  }

  render() {
    let atom = <Loading/>;
    if (this.state.atom !== null) {
      atom = <AtomView
        atom={this.state.atom}
      />
    }

    return <Container
      fluid
    >
      {atom}
    </Container>
  }

}