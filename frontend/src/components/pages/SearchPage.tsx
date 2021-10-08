import React from 'react';

import queryString from 'query-string';
import SearchView from "../views/SearchView";
import history from '../routing/history';


interface SearchPageProps {
  match: any
  location: any
}


interface SearchPageState {
  query: string
  offset: number
}


export default class SearchPage extends React.Component<SearchPageProps, SearchPageState> {
  constructor(props: SearchPageProps) {
    super(props);
    this.state = {
      query: '',
      offset: 0,
    }
  }

  componentDidMount() {
    const queries = this.props.location.search;
    if (!queries) {
      return
    }

    const _map: { [key: string]: string } = {
      query: "",
      offset: "0",
    };

    for (const [key, value] of Object.entries(queryString.parse(queries))) {
      if (key in _map) {
        if (value instanceof Array) {
          _map[key] = decodeURIComponent(value[0])
        } else {
          _map[key] = decodeURIComponent(value)
        }
      }
    }

    this.setState(_map as unknown as SearchPageState);
  }

  handleSearchRequest = (query: string, offset: number): void => {
    history.push(
      {
        pathname: this.props.match.path,
        search: "?" + new URLSearchParams(
          {
            query,
            offset: offset.toString(),
          }
        ).toString()
      }
    );
  };

  render() {
    return <SearchView
      handleSearchRequest={this.handleSearchRequest}
      query={this.state.query}
      offset={parseInt(this.state.offset as unknown as string)}
      key={this.state.query + this.state.offset}
    />
  }
}
