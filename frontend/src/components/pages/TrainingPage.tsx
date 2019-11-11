import React from 'react';

import {FullSign, Sign, SignFeedback} from "../models/models";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import {SignVideo} from "../views/video";
import Row from "react-bootstrap/Row";
import {Redirect} from "react-router";
import Col from "react-bootstrap/Col";


interface TrainingPageProps {
}

interface TrainingPageState {
  sign: FullSign | null
  showMeaning: boolean
  redirect: boolean
}

export default class TrainingPage extends React.Component<TrainingPageProps, TrainingPageState> {

  constructor(props: TrainingPageProps) {
    super(props);
    this.state = {
      sign: null,
      showMeaning: false,
      redirect: false,
    };
  }

  componentDidMount(): void {
    this.handleGetSign();
  }

  handleGetSign = (success: boolean | null = null): void => {
    Sign.nextTrainingSign(
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
          }
        )
      }
    ).catch(
      error => {
        this.setState({redirect: true})
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
      {
        this.state.sign ? <Col>
          <Row>
            <SignVideo sign={this.state.sign}/>
          </Row>
          <Row>
            {
              this.state.showMeaning ?
                this.state.sign.atom.meaning :
                <Button
                  onClick={() => this.setState({showMeaning: true})}
                >
                  Show sign
                </Button>
            }
          </Row>
        </Col> : null
      }
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
    </Container>
  }

}