import React from 'react';

import {Loading} from '../utils/utils';
import {FullSignWithFamiliarity} from "../models/models";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {connect} from "react-redux";
import {Settings} from "../state/reducers";
import {updateSettings} from "../state/settings";
import SignsView from "../views/signs";


interface FamiliarityPageProps {
  settings: Settings
  updateSettings: (settings: { [key: string]: string }) => void
}


interface FamiliarityPageState {
  signs: FullSignWithFamiliarity[] | null;
}


class FamiliarityPage extends React.Component<FamiliarityPageProps, FamiliarityPageState> {

  constructor(props: FamiliarityPageProps) {
    super(props);
    this.state = {
      signs: null,
    };
  }

  componentDidMount() {
    FullSignWithFamiliarity.familiar().then(
      signs => {
        this.setState({signs})
      }
    );
  }

  render() {

    return <Container
      fluid
    >
      <Row>
        {
          this.state.signs === null ?
            <Loading/> :
            <SignsView
              signs={this.state.signs}
              familiarityThreshold={255}
            />
        }
      </Row>
    </Container>
  }

}

const mapStateToProps = (state: any) => {
  return {
    settings: state.settings,
  };
};


const mapDispatchToProps = (dispatch: any) => {
  return {
    updateSettings: (settings: { [key: string]: string }) => {
      return dispatch(updateSettings(settings))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FamiliarityPage);
