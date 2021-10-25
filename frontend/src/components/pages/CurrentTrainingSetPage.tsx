import React from 'react';

import Alert from "react-bootstrap/Alert";

import {Loading} from '../utils/utils';
import {TrainingSet} from "../models/models";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {connect} from "react-redux";
import {Settings} from "../state/reducers";
import {updateSettings} from "../state/settings";
import TrainingSetEditView from "../views/TrainingSetEditView";


interface CreateTrainingSetFormProps {
  settings: Settings
  handleSubmit: (name: string, size: number, isPublic: boolean) => void
}


class CreateTrainingSetForm extends React.Component<CreateTrainingSetFormProps> {

  handleSubmit = (event: any) => {
    this.props.handleSubmit(
      event.target.elements.name.value,
      parseInt(event.target.elements.size.value),
      event.target.elements.public.checked,
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
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
          />
        </Form.Group>
        <Form.Group controlId="size">
          <Form.Label>Size</Form.Label>
          <Form.Control
            type="number"
            defaultValue={this.props.settings.defaultTrainingSetSize.toString()}
          />
        </Form.Group>
        <Form.Group controlId="public">
          <Form.Label>Public</Form.Label>
          <Form.Control
            type="checkbox"
            defaultChecked={false}
          />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Button type="submit">New training set</Button>
      </Form.Row>
    </Form>
  }

}


interface TrainingSetPageProps {
  settings: Settings
  updateSettings: (settings: { [key: string]: string }) => void
}


interface TrainingSetPageState {
  trainingSet: null | TrainingSet
  loading: boolean
  error: string
  currentIndex: number
}


class CurrentTrainingSetPage extends React.Component<TrainingSetPageProps, TrainingSetPageState> {

  constructor(props: TrainingSetPageProps) {
    super(props);
    this.state = {
      trainingSet: null,
      loading: true,
      error: "",
      currentIndex: 0,
    };
  }

  componentDidMount() {
    TrainingSet.getCurrent().then(
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

  handleNewTrainingSet = (name: string, size: number, isPublic: boolean): void => {
    this.props.updateSettings(
      {
        defaultTrainingSetSize: size.toString(),
      }
    );
    this.setState(
      {
        loading: true
      },
      () => {
        TrainingSet.new(name, size, this.props.settings.trainingSetThreshold, isPublic).then(
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
    const complete = this.state.trainingSet && this.state.trainingSet.signs.every(
      sign => sign.familiarity >= this.props.settings.trainingSetThreshold
    );

    return <Container
      fluid
    >
      {
        complete ? <Alert
          variant='primary'
        >
          Set complete
        </Alert> : null
      }
      <Row>
        <CreateTrainingSetForm
          handleSubmit={this.handleNewTrainingSet}
          settings={this.props.settings}
        />
      </Row>
      {
        this.state.trainingSet === null ?
          this.state.loading ?
            <Loading/> :
            <Alert
              variant="danger"
            >
              {this.state.error}
            </Alert> : <TrainingSetEditView
            trainingSet={this.state.trainingSet}
            onTrainingSetChanged={(trainingSet) => this.setState({trainingSet})}
            // key={this.state.trainingSet.id}
          />
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

export default connect(mapStateToProps, mapDispatchToProps)(CurrentTrainingSetPage);
