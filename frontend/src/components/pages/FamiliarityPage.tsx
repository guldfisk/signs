import React from 'react';

import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {connect} from "react-redux";

import SignsView from "../views/SignsView";
import {FullSignWithFamiliarity} from "../models/models";
import {Loading} from '../utils/utils';
import {Settings} from "../state/reducers";
import {updateSettings} from "../state/settings";


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
    const complete = this.state.signs && this.state.signs.every(
      sign => sign.familiarity >= this.props.settings.repetitionThreshold
    );

    return <Container
      fluid
    >
      {
        complete ? <Alert
          variant='primary'
        >
          All repetition above threshold
        </Alert> : null
      }
      <Row>
        <label>Repetition threshold</label>
        <input
          type={'number'}
          defaultValue={this.props.settings.repetitionThreshold.toString()}
          onChange={
            (event) => {
              if (event.target.value) {
                this.props.updateSettings({repetitionThreshold: event.target.value})
              }
            }
          }
        />
      </Row>
      <Row>
        {
          this.state.signs === null ?
            <Loading/> :
            <SignsView
              signs={this.state.signs}
              familiarityThreshold={this.props.settings.repetitionThreshold}
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
