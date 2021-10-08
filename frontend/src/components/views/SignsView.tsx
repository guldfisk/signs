import React from "react";

import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button";
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, {Search} from 'react-bootstrap-table2-toolkit';
import {Link} from "react-router-dom";

import {FullSign, FullSignWithFamiliarity, Sign} from "../models/models";


interface SignsViewProps {
  signs: FullSignWithFamiliarity[];
  familiarityThreshold: number;
  actionText?: string
  action?: (sign: Sign) => void
}


interface SignsViewState {
}


export default class SignsView extends React.Component<SignsViewProps, SignsViewState> {

  constructor(props: SignsViewProps) {
    super(props);
  }

  render() {
    const columns: { [key: string]: any } = [
      {
        dataField: 'id',
        text: 'Key',
        hidden: true,
      },
      {
        dataField: 'meaning',
        text: 'Meaning',
        type: 'string',
        sort: true,
        formatter: (cell: any, row: FullSign) => <Link
          to={'/sign/' + row.id + '/'}
        >
          {row.atom.meaning}
        </Link>,
        filterValue: (cell: any, row: FullSign) => row.atom.meaning
      },
      {
        dataField: 'familiarity',
        text: 'Familiarity',
        type: 'number',
        sort: true,
        formatter: (cell: number) => <span
          style={
            {
              color: cell >= this.props.familiarityThreshold ? 'green' : 'red',
            }
          }
        >
          {cell}
        </span>,
        headerStyle: (column: any, colIndex: number) => {
          return {width: '7em', textAlign: 'center'};
        },
      },
    ];

    if (this.props.actionText) {
      columns.push(
        {
          dataField: 'action',
          text: '',
          isDummyField: true,
          formatter: (cell: any, row: FullSign) => <Button
            onClick={() => this.props.action(row)}
          >
            {this.props.actionText}
          </Button>,
          headerStyle: (column: any, colIndex: number) => {
            return {width: '8em', textAlign: 'center'};
          },
        }
      )
    }


    const {SearchBar} = Search;

    return <ToolkitProvider
      keyField='key'
      data={this.props.signs}
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
