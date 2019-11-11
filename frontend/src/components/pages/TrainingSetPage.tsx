import React from 'react';

import Alert from "react-bootstrap/Alert";

import {Loading} from '../utils/utils';
import {TrainingSet} from "../models/models";
import Container from "react-bootstrap/Container";
import TrainingSetView from "../views/TrainingSet";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";


interface CreateTrainingSetFormProps {
  handleSubmit: (size: number, familiarityThreshold: number) => void
}


class CreateTrainingSetForm extends React.Component<CreateTrainingSetFormProps> {

  handleSubmit = (event: any) => {
    this.props.handleSubmit(
      event.target.elements.size.value,
      event.target.elements.familiarityThreshold.value,
    );
    event.preventDefault();
    event.stopPropagation();
  };

  render() {
    return <Form
      onSubmit={this.handleSubmit}
      style={
        {
          margin: "20px"
        }
      }
    >
      <Form.Row>
        <Form.Group controlId="size">
          <Form.Label>Size</Form.Label>
          <Form.Control type="number" defaultValue="50"/>
        </Form.Group>
        <Form.Group controlId="familiarityThreshold">
          <Form.Label>Familiarity Threshold</Form.Label>
          <Form.Control type="number" defaultValue="3"/>
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Button type="submit">New training set</Button>
      </Form.Row>
    </Form>
  }

}


interface TrainingSetPageProps {
}


interface TrainingSetPageState {
  trainingSet: null | TrainingSet
  loading: boolean
  error: string
}


export default class TrainingSetPage extends React.Component<TrainingSetPageProps, TrainingSetPageState> {

  constructor(props: TrainingSetPageProps) {
    super(props);
    this.state = {
      trainingSet: null,
      loading: true,
      error: "",
    };
  }

  componentDidMount() {
    TrainingSet.get().then(
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
            error: error.response.status === 400 ? "No trainingset, generate one" : "Network error",
          }
        )
      }
    );
  }

  handleNewTrainingSet = (size: number, familiarityThreshold: number): void => {
    this.setState(
      {
        loading: true
      },
      () => {
        TrainingSet.new(size, familiarityThreshold).then(
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
                error: "Could not generate training set :((",
              }
            )
          }
        );
      }
    )
  };

  render() {

    return <Container
      fluid
    >
      <Row>
        <CreateTrainingSetForm
          handleSubmit={this.handleNewTrainingSet}
        />
      </Row>
      <Row>
        {
          this.state.trainingSet === null ?
            this.state.loading ?
              <Loading/> :
              <Alert
                variant="danger"
              >
                {this.state.error}
              </Alert> :
            <TrainingSetView
              trainingSet={this.state.trainingSet}
            />
        }
      </Row>
    </Container>
  }

}