import React from 'react';

import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";

import SearchView from "../views/SearchView";
import TrainingSetView from "../views/TrainingSetView";
import {TrainingSet} from "../models/models";


interface TrainingSetEditViewProps {
  trainingSet: TrainingSet
  onTrainingSetChanged: (trainingSet: TrainingSet) => void
}


interface TrainingSetEditViewState {
  adding: boolean
}


export default class TrainingSetEditView extends React.Component<TrainingSetEditViewProps, TrainingSetEditViewState> {

  constructor(props: TrainingSetEditViewProps) {
    super(props);
    this.state = {
      adding: false,
    };
  }

  render() {
    return <>
      <Row>
        <Button onClick={() => this.setState({adding: !this.state.adding})}>Add Signs</Button>
        <Button onClick={() => this.props.trainingSet.reset().then(this.props.onTrainingSetChanged)}>Reset Familiarity</Button>
      </Row>
      {
        this.state.adding && <Row>
          <SearchView
            handleSignClicked={
              (sign) => (
                this.props.trainingSet.contains(sign) ?
                  this.props.trainingSet.removeSign(sign) :
                  this.props.trainingSet.addSign(sign)
              ).then(this.props.onTrainingSetChanged)
            }
            actionText={(sign) => this.props.trainingSet.contains(sign) ? 'Remove' : 'Add'}
          />
        </Row>
      }
      <Row>
        <TrainingSetView
          trainingSet={this.props.trainingSet}
          actionText='Remove'
          action={
            (sign) => this.props.trainingSet.removeSign(sign).then(this.props.onTrainingSetChanged)
          }
        />
      </Row>
    </>
  }

}
