import React from "react";

import {Link} from "react-router-dom";

import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, {Search} from 'react-bootstrap-table2-toolkit';

import {FullSignWithFamiliarity} from "../models/models";
import {string} from "prop-types";


interface SignsViewProps {
  signs: FullSignWithFamiliarity[];
  familiarityThreshold: number;
}


interface SignsViewState {
}


export default class SignsView extends React.Component<SignsViewProps, SignsViewState> {

  constructor(props: SignsViewProps) {
    super(props);
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
        sortFunc: (aFam: any, bFam: any, order: string) => {
          const a = aFam.props.children;
          const b = bFam.props.children;
          if (order === 'desc') {
            return b - a;
          }
          return a - b;
        },
      },
    ];

    const data = this.props.signs.map(
      sign => {
        return {
          key: sign.id,
          meaning: <Link
            to={'/sign/' + sign.id + '/'}
          >
            {sign.atom.meaning}
          </Link>,
          meaningSearch: sign.atom.meaning,
          familiarity: <span
            style={
              {
                color: sign.familiarity >= this.props.familiarityThreshold ? 'green' : 'red',
              }
            }
          >
            {sign.familiarity}
          </span>,
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
