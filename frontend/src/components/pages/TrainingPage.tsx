import React from 'react';

import {FullSign, Sign, SignFeedback} from "../models/models";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import {SignVideo} from "../views/video";
import Row from "react-bootstrap/Row";
import {Redirect} from "react-router";
import Col from "react-bootstrap/Col";
import {Settings} from "../state/reducers";
import {updateSettings} from "../state/settings";
import {connect} from "react-redux";


interface TrainingPageProps {
  settings: Settings
  updateSettings: (settings: { [key: string]: string }) => void
}

interface TrainingPageState {
  sign: FullSign | null
  showMeaning: boolean
  redirect: boolean
  showVideoFirst: boolean
  loading: boolean
}

class TrainingPage extends React.Component<TrainingPageProps, TrainingPageState> {

  constructor(props: TrainingPageProps) {
    super(props);
    this.state = {
      sign: null,
      showMeaning: false,
      redirect: false,
      showVideoFirst: true,
      loading: false,
    };
  }

  componentDidMount(): void {
    this.handleGetSign();
  }

  handleGetSign = (success: boolean | null = null): void => {
    console.log(this.props);
    console.log(this.props.settings);
    console.log(this.props.settings.includeReverse);
    this.setState(
      {loading: true},
      () => {
        (
          this.props.settings.trainingMode === 'set' ? Sign.nextTrainingSign : Sign.repetitionSign
        )(
          success === null ? null : new SignFeedback(
            this.state.sign,
            success,
          )
        ).then(
          sign => {
            this.setState(
              {
                sign,
                showMeaning: false,
                loading: false,
                showVideoFirst: !this.props.settings.includeReverse || Math.random() > .5,
              }
            )
          }
        ).catch(
          error => {
            this.setState(
              {
                redirect: true,
              }
            )
          }
        )
      }
    )

  };

  render() {
    if (this.state.redirect) {
      return <Redirect to='/training-set'/>
    }

    return <Container
      fluid
    >
      <Row>
        <Button
          onClick={
            () => {
              this.props.updateSettings(
                {
                  trainingMode: this.props.settings.trainingMode === 'set' ? 'repetition' : 'set'
                }
              );
              this.handleGetSign();
            }
          }
        >
          {'mode: ' + this.props.settings.trainingMode}
        </Button>
        <Button
          onClick={
            () => this.props.updateSettings(
              {
                includeReverse: this.props.settings.includeReverse ? '' : 'true',
              }
            )
          }
        >
          {this.props.settings.includeReverse ? 'including meaning first' : 'excluding meaning first'}
        </Button>
      </Row>
      {
        this.state.showMeaning ? <>
          <Row>
            Did you got that?
          </Row>
          <Row>
            <Button
              onClick={() => this.handleGetSign(true)}
            >
              yes
            </Button>
            <Button
              onClick={() => this.handleGetSign(false)}
            >
              no
            </Button>
          </Row>
        </> : null
      }
      {
        this.state.sign ? <Col>
          <Row>
            {
              this.state.showMeaning ?
                !this.state.showVideoFirst ?
                  <SignVideo sign={this.state.sign}/> :
                  <h3>{this.state.sign.atom.meaning}</h3> :
                <Button
                  onClick={() => this.setState({showMeaning: true})}
                >
                  Show sign
                </Button>
            }
          </Row>
          <Row>
            {
              this.state.showVideoFirst ?
                <SignVideo sign={this.state.sign}/> :
                <h3>{this.state.sign.atom.meaning}</h3>
            }
          </Row>
        </Col> : null
      }
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

export default connect(mapStateToProps, mapDispatchToProps)(TrainingPage);
