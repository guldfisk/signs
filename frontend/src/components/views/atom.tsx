import React from "react";

import {Atom} from "../models/models";
import Row from "react-bootstrap/Row";
import {SignVideo} from "./video";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";


interface AtomViewProps {
  atom: Atom;
}


export default class AtomView extends React.Component<AtomViewProps> {

  render() {
    return <Container
      fluid
    >
      <Row>
        <h4>{this.props.atom.meaning}</h4>
      </Row>
      <Row>
        {
          this.props.atom.signs.map(
            sign => <Col>
              <SignVideo sign={sign}/>
            </Col>
          )
        }
      </Row>
    </Container>
  }

}
