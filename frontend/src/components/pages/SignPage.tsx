import React from 'react';

import {connect} from "react-redux";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

import {Loading} from '../utils/utils';
import {FullSign} from "../models/models";
import {SignVideo} from "../views/video";


interface SignPageProps {
  match: any
  authenticated: boolean
}

interface SignPageState {
  sign: null | FullSign
}

class SignPage extends React.Component<SignPageProps, SignPageState> {

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

  handleSetFamiliarity = (value: number): void => {
    this.state.sign.setFamiliarity(value);
  };

  render() {
    let atom = <Loading/>;
    if (this.state.sign !== null) {
      atom = <div>
        {
          <a
            href={this.state.sign.atom.getExternalLink()}
          >
            {this.state.sign.atom.meaning}
          </a>
        }
        <SignVideo
          sign={this.state.sign}
        />
        {
          this.props.authenticated && this.state.sign ? [
            <Button
              onClick={() => this.handleSetFamiliarity(255)}
            >
              I know this one
            </Button>,
            <Button
              onClick={() => this.handleSetFamiliarity(0)}
            >
              Don't know this one
            </Button>,
          ] : null
        }
      </div>
    }

    return <Container
      fluid
    >
      {atom}
    </Container>
  }

}

const mapStateToProps = (state: any) => {
  return {
    authenticated: state.authenticated,
  };
};


const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(SignPage);
