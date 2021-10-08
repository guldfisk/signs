import React from 'react';

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import SignsView from "../views/SignsView";

import {SignVideo} from "./video";
import {Sign, TrainingSet} from "../models/models";


interface TrainingSetViewProps {
  trainingSet: TrainingSet
  actionText?: string
  action?: (sign: Sign) => void
}


interface TrainingSetViewState {
  currentIndex: number
}


export default class TrainingSetView extends React.Component<TrainingSetViewProps, TrainingSetViewState> {

  constructor(props: TrainingSetViewProps) {
    super(props);
    this.state = {
      currentIndex: 0,
    };
  }

  render() {
    return <Container
      fluid
    >
      <Row>
        <h3>{this.props.trainingSet.name}</h3>
      </Row>
      {
        !!this.props.trainingSet.signs.length && <>
          <Row>
            <Col>
              <Button
                onClick={() => {
                  this.setState({currentIndex: this.state.currentIndex - 1})
                }}
                disabled={this.state.currentIndex < 1}
              >
                Previous
              </Button>
            </Col>
            <Col>
              <Row>
                {this.props.trainingSet.signs[this.state.currentIndex].atom.meaning}
              </Row>
              <Row>
                <SignVideo
                  sign={this.props.trainingSet.signs[this.state.currentIndex]}
                />
              </Row>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  this.setState({currentIndex: this.state.currentIndex + 1})
                }}
                disabled={this.state.currentIndex >= this.props.trainingSet.signs.length - 1}
              >
                Next
              </Button>
            </Col>
          </Row></>
      }
      <Row>
        <SignsView
          signs={this.props.trainingSet.signs}
          familiarityThreshold={this.props.trainingSet.threshold}
          actionText={this.props.actionText}
          action={this.props.action}
        />
      </Row>
    </Container>
  }

}
