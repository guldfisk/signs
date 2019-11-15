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
import SignsView from "../views/signs";
import Col from "react-bootstrap/Col";
import {SignVideo} from "../views/video";


interface CreateTrainingSetFormProps {
  settings: Settings
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
          <Form.Control
            type="number"
            defaultValue={this.props.settings.defaultTrainingSetSize.toString()}
          />
        </Form.Group>
        <Form.Group controlId="familiarityThreshold">
          <Form.Label>Familiarity Threshold</Form.Label>
          <Form.Control
            type="number"
            defaultValue={this.props.settings.defaultTrainingSetThreshold.toString()}
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


class TrainingSetPage extends React.Component<TrainingSetPageProps, TrainingSetPageState> {

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
    this.props.updateSettings(
      {
        defaultTrainingSetSize: size.toString(),
        defaultTrainingSetThreshold: familiarityThreshold.toString(),
      }
    );
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
    const complete = this.state.trainingSet && this.state.trainingSet.signs.every(
      sign => sign.familiarity >= this.state.trainingSet.threshold
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
            </Alert> :
          [
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
                  {this.state.trainingSet.signs[this.state.currentIndex].atom.meaning}
                </Row>
                <Row>
                  <SignVideo
                    sign={this.state.trainingSet.signs[this.state.currentIndex]}
                  />
                </Row>
              </Col>
              <Col>
                <Button
                  onClick={() => {this.setState({currentIndex: this.state.currentIndex + 1})}}
                  disabled={this.state.currentIndex >= this.state.trainingSet.signs.length - 1}
                >
                  Next
                </Button>
              </Col>
            </Row>,
            <Row>
              <SignsView
                signs={this.state.trainingSet.signs}
                familiarityThreshold={this.state.trainingSet.threshold}
              />
            </Row>
          ]
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

export default connect(mapStateToProps, mapDispatchToProps)(TrainingSetPage);
