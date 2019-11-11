import React from "react";

import {Link} from "react-router-dom";

import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, {Search} from 'react-bootstrap-table2-toolkit';

import {apiPath, Atom, FullSign, Sign, TrainingSet} from "../models/models";
import Row from "react-bootstrap/Row";
import {SignVideo} from "./video";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import {string} from "prop-types";


interface TrainingSetViewProps {
  trainingSet: TrainingSet;
}


interface TrainingSetViewState {
  sign: FullSign | null;
}


export default class TrainingSetView extends React.Component<TrainingSetViewProps, TrainingSetViewState> {

  constructor(props: TrainingSetViewProps) {
    super(props);
    this.state = {
      sign: null,
    };
  }

  render() {
    const columns = [
      {
        dataField: 'key',
        text: 'Key',
        hidden: true,
      },
      {
        dataField: 'meaning',
        text: 'Meaning',
        type: 'string',
      },
      {
        dataField: 'meaningSearch',
        text: 'Meaning Search',
        type: 'string',
        hidden: true,
      },
      {
        dataField: 'familiarity',
        text: 'Familiarity',
        type: 'number',
        sort: true,
      },
    ];

    const data = this.props.trainingSet.signs.map(
      sign => {
        return {
          key: sign.id,
          meaning: <Link
            to={'/sign/' + sign.id + '/'}
          >
            {sign.atom.meaning}
          </Link>,
          meaningSearch: sign.atom.meaning,
          familiarity: sign.familiarity,
        }
      }
    );

    const {SearchBar} = Search;

    return <ToolkitProvider
      keyField='key'
      data={data}
      columns={columns}
      bootstrap4
      search
    >
      {
        (props: any) => (
          <div>
            {
              <SearchBar
                {...props.searchProps}
              />
            }
            <BootstrapTable
              {...props.baseProps}
              condensed
              striped
              pagination={
                paginationFactory(
                  {
                    hidePageListOnlyOnePage: true,
                    showTotal: true,
                    sizePerPage: 25,
                  }
                )
              }
            />
          </div>
        )
      }
    </ToolkitProvider>
  }

}
