import React from 'react';

import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

import {TrainingSet} from "../models/models";
import Container from "react-bootstrap/Container";
import {Link} from 'react-router-dom';


interface TrainingSetsPageProps {
  match: any
}

interface TrainingSetsPageState {
  page: number
  pageSize: number
  sets: TrainingSet[]
  hits: number
}

export default class TrainingSetsPage extends React.Component<TrainingSetsPageProps, TrainingSetsPageState> {

  constructor(props: TrainingSetsPageProps) {
    super(props);
    this.state = {
      page: 1,
      pageSize: 20,
      sets: [],
      hits: 0,
    };
  }

  componentDidMount() {
    this.fetchSets();
  }

  fetchSets = () => {
    TrainingSet.all(
      (this.state.page - 1) * this.state.pageSize,
      this.state.pageSize,
    ).then(
      ({objects, hits}) => {
        this.setState(
          {
            sets: objects,
            hits,
          }
        )
      }
    );
  };

  handleTableChanged = (
    type: string,
    {page, sizePerPage, filters, sortField, sortOrder, data, cellEdit}:
      {
        page: number,
        sizePerPage: number,
        filters: any,
        sortField: string,
        sortOrder: string,
        data: any,
        cellEdit: any,
      },
  ) => {
    if (type == 'filter') {
    } else if (type == 'pagination') {
      TrainingSet.all(
        (page - 1) * sizePerPage,
        sizePerPage,
      ).then(
        paginatedResponse => this.setState(
          {
            page,
            pageSize: sizePerPage,
            sets: paginatedResponse.objects,
            hits: paginatedResponse.hits,
          }
        )
      )
    } else if (type == 'sort') {
    } else if (type == 'cellEdit') {
    }
  };

  render() {

    const columns = [
      {
        dataField: 'id',
        text: 'ID',
        hidden: true,
      },
      {
        dataField: 'name',
        text: 'Name',
        formatter: (cell: any, row: any) => <Link
          to={'/training-set/' + row.id + '/'}
        >
          {cell}
        </Link>,
      },
    ];

    return <Container fluid>
      <BootstrapTable
        remote
        keyField='id'
        data={this.state.sets}
        columns={columns}
        bootstrap4
        condensed
        pagination={
          paginationFactory(
            {
              hidePageListOnlyOnePage: true,
              showTotal: true,
              page: this.state.page,
              sizePerPage: this.state.pageSize,
              totalSize: this.state.hits,
            }
          )
        }
        onTableChange={this.handleTableChanged}
        classes='dark-table'
      />
    </Container>
  }

}
