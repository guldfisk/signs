import React from 'react';

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";

import PaginationBar from '../utils/PaginationBar';
import Alert from "react-bootstrap/Alert";
import {FullSign} from "../models/models";
import SignThumbnail from "../utils/SignThumbnail";
import Button from "react-bootstrap/Button";


interface SearchViewProps {
  handleSignClicked?: (sign: FullSign) => void
  handleSearchRequest?: ((query: string, offset: number) => void) | null
  actionText?: (sign: FullSign) => string
  actionEnabled?: (sign: FullSign) => boolean
  query?: string
  offset?: number
  limit?: number
}


interface SearchViewState {
  searchResults: FullSign[]
  offset: number
  hits: number
  query: string
  errorMessage: string | null
}


export default class SearchView extends React.Component<SearchViewProps, SearchViewState> {

  public static defaultProps = {
    query: '',
    offset: 0,
    limit: 50,
  };

  constructor(props: SearchViewProps) {
    super(props);
    this.state = {
      searchResults: [],
      offset: props.offset,
      hits: 0,
      query: props.query,
      errorMessage: null,
    }
  }

  componentDidMount() {
    if (this.props.query) {
      this.internalPerformSearch(this.props.query, this.props.offset)
    }
  }

  internalPerformSearch = (
    query: string,
    offset: number,
  ) => {
    this.setState(
      {
        searchResults: [],
        hits: 0,
        offset: 0,
      },
      () => FullSign.search(query, this.props.limit, offset).then(
        response => {
          this.setState(
            {
              searchResults: response.objects,
              hits: response.hits,
              offset,
              errorMessage: null,
            }
          )
        }
      ).catch(
        error => {
          this.setState({errorMessage: 'something went wrong'});
        }
      )
    );
  };

  performSearch = (
    query: string,
    offset: number,
  ) => {
    if (this.props.handleSearchRequest) {
      this.props.handleSearchRequest(query, offset);
    } else {
      this.internalPerformSearch(query, offset);
    }
  };

  userSubmit = (event: any) => {
    this.performSearch(
      this.state.query,
      0,
    );
    event.preventDefault();
    event.stopPropagation();
  };

  handleFormChange = (event: any) => {
    const name: string = event.target.name;
    const value: string = event.target.value;

    if (name === 'query') {
      this.setState({query: value})
    } else {
      this.setState(
        // @ts-ignore
        {[event.target.name]: event.target.value},
        () => {
          if (this.state.query !== "") {
            this.performSearch(
              this.state.query,
              this.state.offset,
            );
          }
        },
      );
    }

  };

  handlePageChange = (offset: number) => {
    this.performSearch(
      this.state.query,
      offset,
    );
  };

  render() {
    return <Container fluid>
      <Col>
        {
          this.state.errorMessage && <Alert
            variant="danger"
          >
            {this.state.errorMessage}
          </Alert>
        }
        <Row>
          <Form
            onSubmit={this.userSubmit}
          >

            <Form.Row>

              <Form.Group
                controlId="query"
              >
                <Form.Control
                  type="text"
                  name="query"
                  onChange={this.handleFormChange}
                  defaultValue={this.state.query}
                />
              </Form.Group>

            </Form.Row>

          </Form>

        </Row>

        <Row>
          <span>
            {
              `Showing ${
                this.state.offset
              } - ${
                Math.min(this.state.offset + this.props.limit, this.state.hits)
              } out of ${
                this.state.hits
              } results.`
            }
          </span>
        </Row>

        <Row>
          {
            this.state.hits === 0 ? <div/> :
              <PaginationBar
                hits={this.state.hits}
                offset={this.state.offset}
                handleNewOffset={this.handlePageChange}
                maxPageDisplay={7}
                pageSize={this.props.limit}
              />
          }
        </Row>
        {
          !this.state.searchResults.length ? null :
            <Row>
              <Table>
                <tbody>
                {
                  this.state.searchResults.map(
                    (sign) => {
                      return <tr>
                        <td>
                          <span>{sign.atom.meaning}</span>
                        </td>
                        <td>
                          <SignThumbnail
                            sign={sign}
                            // allowExpand={!this.props.handleSignClicked}
                            // handleSignClicked={
                            //   this.props.handleSignClicked && (() => this.props.handleSignClicked(sign))
                            // }
                          />
                        </td>
                        {
                          this.props.actionText && <Button
                            onClick={() => this.props.handleSignClicked(sign)}
                            disabled={this.props.actionEnabled && !this.props.actionEnabled(sign)}
                          >
                            {this.props.actionText(sign)}
                          </Button>
                        }
                      </tr>
                    }
                  )
                }
                </tbody>
              </Table>
            </Row>
        }
      </Col>
    </Container>

  }
}

