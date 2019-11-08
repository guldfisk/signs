import axios from 'axios';

import {Counter, MultiplicityList} from "./utils";
import store from '../state/store';
import wu from 'wu';


export const apiPath = '/api/';


export class Atomic {
  id: string | number;

  constructor(id: string | number) {
    this.id = id
  }

  public static fromRemote(remote: any): Atomic {
    return new Atomic('0')
  }

}

export class Sign extends Atomic {
  externalId: number;

  constructor(id: string, externalId: number) {
    super(id);
    this.externalId = externalId;
  }

  getVideoUrl = (): string => {
    return 'http://tegnsprog.dk/video/t/t_' + this.externalId + '.mp4';
  };

  public static fromRemote(remote: any): Sign {
    return new Sign(
      remote.id,
      remote.external_id,
    )
  }

}


export class Atom extends Atomic {
  signs: Sign[];
  meaning: string;

  constructor(id: string, meaning: string, signs: Sign[]) {
    super(id);
    this.meaning = meaning;
    this.signs = signs;
  }

  public static fromRemote(remote: any): Atom {
    return new Atom(
      remote.id,
      remote.meaning,
      remote.signs.map(
        (sign: any) => Sign.fromRemote(sign)
      ),
    )
  }

  public static get(id: string): Promise<Atom> {
    return axios.get(
      apiPath + 'atom/' + id + '/',
    ).then(
      response => Atom.fromRemote(response.data)
    )
  }

}