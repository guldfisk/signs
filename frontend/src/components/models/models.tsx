import axios from 'axios';

import {Counter, MultiplicityList} from "./utils";
import store from '../state/store';
import wu from 'wu';
import {prependOnceListener} from "cluster";


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


export class SignFeedback {
  sign: Sign;
  success: boolean;

  constructor(sign: Sign, success: boolean) {
    this.sign = sign;
    this.success = success;
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

  public static nextTrainingSign(feedback: SignFeedback | null = null): Promise<FullSign> {
    return axios.post(
      apiPath + 'training-set/sign/',
      !feedback ? {} : {
        sign: feedback.sign.id,
        success: feedback.success,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${store.getState().token}`,
        }
      }
    ).then(
      response => FullSign.fromRemote(response.data)
    )
  }

  public static fromRemote(remote: any): Sign {
    return new Sign(
      remote.id,
      remote.external_id,
    )
  }

}


export class FullSign extends Sign {
  atom: MinimalAtom;

  constructor(id: string, externalId: number, atom: MinimalAtom) {
    super(id, externalId);
    this.atom = atom;
  }

  public static fromRemote(remote: any): FullSign {
    return new FullSign(
      remote.id,
      remote.external_id,
      MinimalAtom.fromRemote(remote.atom),
    )
  }

  public static get(id: string): Promise<FullSign> {
    return axios.get(
      apiPath + 'sign/' + id + '/'
    ).then(
      response => FullSign.fromRemote(response.data)
    )
  }

}


export class FullSignWithFamiliarity extends FullSign {
  familiarity: number;

  constructor(id: string, externalId: number, atom: MinimalAtom, familiarity: number) {
    super(id, externalId, atom);
    this.familiarity = familiarity;
  }

  public static fromRemote(remote: any): FullSignWithFamiliarity {
    return new FullSignWithFamiliarity(
      remote.id,
      remote.external_id,
      MinimalAtom.fromRemote(remote.atom),
      remote.familiarity,
    )
  }

}


export class MinimalAtom extends Atomic {
  meaning: string;

  constructor(id: string, meaning: string) {
    super(id);
    this.meaning = meaning;
  }

  public static fromRemote(remote: any): MinimalAtom {
    return new MinimalAtom(
      remote.id,
      remote.meaning,
    )
  }

}


export class Atom extends MinimalAtom {
  signs: Sign[];

  constructor(id: string, meaning: string, signs: Sign[]) {
    super(id, meaning);
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


export class TrainingSet extends Atomic {
  threshold: number;
  size: number;
  signs: FullSignWithFamiliarity[];

  constructor(id: number | string, threshold: number, size: number, signs: FullSignWithFamiliarity[]) {
    super(id);
    this.threshold = threshold;
    this.size = size;
    this.signs = signs;
  }

  public static fromRemote(remote: any): TrainingSet {
    return new TrainingSet(
      remote.id,
      remote.threshold,
      remote.size,
      remote.signs.map((sign: any) => FullSignWithFamiliarity.fromRemote(sign)),
    )
  }

  public static get(): Promise<TrainingSet> {
    return axios.get(
      apiPath + 'training-set/',
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${store.getState().token}`,
        }
      }
    ).then(
      response => TrainingSet.fromRemote(response.data)
    )
  }

  public static new(size: number): Promise<TrainingSet> {
    return axios.post(
      apiPath + 'training-set/',
      {
        size
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${store.getState().token}`,
        }
      }
    ).then(
      response => TrainingSet.fromRemote(response.data)
    )
  }

}
