import React from 'react';

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

import history from "../routing/history";
import {Loading} from '../utils/utils';
import {TrainingSet} from "../models/models";
import TrainingSetEditView from "../views/TrainingSetEditView";


interface TrainingSetPageProps {
  match: any
}


interface TrainingSetPageState {
  trainingSet: null | TrainingSet
  adding: boolean
  loading: boolean
  error: string
}


export default class TrainingSetPage extends React.Component<TrainingSetPageProps, TrainingSetPageState> {

  constructor(props: TrainingSetPageProps) {
    super(props);
    this.state = {
      trainingSet: null,
      adding: false,
      loading: true,
      error: "",
    };
  }

  componentDidMount() {
    TrainingSet.get(this.props.match.params.id).then(
      trainingSet => {
        this.setState(
          {
            trainingSet: trainingSet,
            loading: false,
          }
        )
      }
    ).catch(
      error => {
        this.setState(
          {
            loading: false,
            error: error.response && error.response.status === 403 ? "Not allowed" : "Network error",
          }
        )
      }
    );
  }

  render() {
    return <Container
      fluid
    >
      {
        !this.state.trainingSet ?
          this.state.loading ?
            <Loading/> :
            <Alert variant="danger">
              {this.state.error}
            </Alert> :
          <>
            <Button
              onClick={
                () => this.state.trainingSet.train().then(
                  () => history.push('/training-set')
                )
              }
            >
              Train this set
            </Button>
            <TrainingSetEditView
              trainingSet={this.state.trainingSet}
              onTrainingSetChanged={(trainingSet) => this.setState({trainingSet})}
            />
          </>
      }
    </Container>
  }

}
