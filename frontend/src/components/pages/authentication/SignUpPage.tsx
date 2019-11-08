import React from 'react';

import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card"
import Container from "react-bootstrap/Container"

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {signUp} from "../../auth/controller";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import Alert from "react-bootstrap/Alert";


interface SignUpFormProps {
  handleSubmit: (
    {username, password, email}:
      { username: string, password: string, email: string }
  ) => void
}


class SignUpForm extends React.Component<SignUpFormProps> {

  handleSubmit = (event: any) => {
    this.props.handleSubmit(
      {
        username: event.target.elements.username.value,
        email: event.target.elements.email.value,
        password: event.target.elements.password.value,
      }
    );
    event.preventDefault();
    event.stopPropagation();
  };

  render() {
    return <Form
      onSubmit={this.handleSubmit}
    >
      <Form.Group controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text"/>
      </Form.Group>
      <Form.Group controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password"/>
      </Form.Group>
      <Form.Group controlId="email">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email"/>
      </Form.Group>
      <Button type="submit">Sign Up</Button>
    </Form>
  }

}


interface SignUpPageProps {
  authenticated: boolean
  errorMessage: string | null
  signUp: (
    {username, password, email}:
      { username: string, password: string, email: string }
  ) => void
  match: any
  location: any
}


class SignUpPage extends React.Component<SignUpPageProps> {

  handleSubmit = (
    {username, password, email}:
      { username: string, password: string, email: string }
  ) => {
    this.props.signUp({username, password, email});
  };

  render() {
    if (this.props.authenticated) {
      return <Redirect to="/"/>
    }

    return <Container>
      <Col>
        {
          !this.props.errorMessage ? undefined : <Alert
            variant="danger"
          >
            {this.props.errorMessage}
          </Alert>
        }
        <Card>
          <Card.Header>
            Sign up
          </Card.Header>
          <Card.Body>
            <SignUpForm
              handleSubmit={this.handleSubmit}
            />
          </Card.Body>
        </Card>
      </Col>
    </Container>
  }

}


const mapStateToProps = (state: any) => {
  return {
    authenticated: state.authenticated,
    errorMessage: state.errorMessage,
  };
};


const mapDispatchToProps = (dispatch: any) => {
  return {
    signUp: (
      {username, password, email}:
        { username: string, password: string, email: string }
    ) => {
      return dispatch(signUp({username, password, email}));
    }
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(SignUpPage);
