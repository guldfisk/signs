import axios from 'axios';

import store from '../state/store';


export const apiPath = '/api/';


export interface PaginatedResponse<T> {
  objects: T[]
  hits: number
}


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
  videoId: number;
  thumbnailId: number;

  constructor(id: string, videoId: number, thumbnailId: number) {
    super(id);
    this.videoId = videoId;
    this.thumbnailId = thumbnailId;
  }

  getVideoUrl = (): string => {
    return 'http://tegnsprog.dk/video/t/t_' + this.videoId + '.mp4';
  };

  getThumbnailUrl = (): string => {
    return 'http://tegnsprog.dk/billede_t/f_' + this.thumbnailId + '.jpg';
  };

  setFamiliarity = (familiarity: number): Promise<any> => {
    return axios.patch(
      apiPath + 'sign/' + this.id + '/familiarity/',
      {
        familiarity
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${store.getState().token}`,
        }
      }
    )
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
          'Content-Type': 'application/json',
          'Authorization': `Token ${store.getState().token}`,
        }
      }
    ).then(
      response => FullSign.fromRemote(response.data)
    )
  }

  public static repetitionSign(threshold: number, feedback: SignFeedback | null = null): Promise<FullSign> {
    return axios.post(
      apiPath + 'repetition/',
      !feedback ? {
        threshold,
      } : {
        threshold,
        sign: feedback.sign.id,
        success: feedback.success,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${store.getState().token}`,
        }
      }
    ).then(
      response => FullSign.fromRemote(response.data)
    )
  }


  public static fromRemote(remote: any): Sign {
    return new Sign(
      remote.id,
      remote.video_id,
      remote.thumbnail_id,
    )
  }

}


export class FullSign extends Sign {
  atom: MinimalAtom;

  constructor(id: string, videoId: number, thumbnailId: number, atom: MinimalAtom) {
    super(id, videoId, thumbnailId);
    this.atom = atom;
  }

  public static fromRemote(remote: any): FullSign {
    return new FullSign(
      remote.id,
      remote.video_id,
      remote.thumbnail_id,
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

  public static search(query: string, limit: number = 50, offset: number = 0): Promise<PaginatedResponse<FullSign>> {
    return axios.get(
      `${apiPath}sign/search/${query}/`,
      {
        params: {
          limit,
          offset,
        }
      }
    ).then(
      response => {
        return {
          objects: response.data.results.map(
            (wish: any) => FullSign.fromRemote(wish)
          ),
          hits: response.data.count,
        }
      }
    )
  }

}


export class FullSignWithFamiliarity extends FullSign {
  familiarity: number;

  constructor(id: string, externalId: number, thumbnailId: number, atom: MinimalAtom, familiarity: number) {
    super(id, externalId, thumbnailId, atom);
    this.familiarity = familiarity;
  }

  public static familiar(): Promise<FullSignWithFamiliarity[]> {
    return axios.get(
      apiPath + 'repetition/',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${store.getState().token}`,
        }
      }
    ).then(
      response => response.data.map(
        (sign: any) => FullSignWithFamiliarity.fromRemote(sign)
      )
    )
  }

  public static fromRemote(remote: any): FullSignWithFamiliarity {
    return new FullSignWithFamiliarity(
      remote.id,
      remote.video_id,
      remote.thumbnail_id,
      MinimalAtom.fromRemote(remote.atom),
      remote.familiarity,
    )
  }

}


export class MinimalAtom extends Atomic {
  meaning: string;
  externalId: string;

  constructor(id: string, meaning: string, externalId: string) {
    super(id);
    this.meaning = meaning;
    this.externalId = externalId;
  }

  getExternalLink = (): string => {
    return `http://tegnsprog.dk/#|soeg|'tekst'${this.meaning}|tegn|${this.externalId}`
  }

  public static fromRemote(remote: any): MinimalAtom {
    return new MinimalAtom(
      remote.id,
      remote.meaning,
      remote.external_id,
    )
  }

}


export class TrainingSet extends Atomic {
  threshold: number
  name: string
  signs: FullSignWithFamiliarity[]

  constructor(id: number | string, threshold: number, name: string, signs: FullSignWithFamiliarity[]) {
    super(id);
    this.threshold = threshold;
    this.name = name;
    this.signs = signs;
  }

  public static fromRemote(remote: any): TrainingSet {
    return new TrainingSet(
      remote.id,
      remote.threshold,
      remote.name,
      remote.signs.map((sign: any) => FullSignWithFamiliarity.fromRemote(sign)),
    )
  }

  contains = (sign: Sign): boolean => {
    return this.signs.some(s => s.id == sign.id)
  }

  train = (): Promise<TrainingSet> => {
    return axios.post(
      `${apiPath}training-set/${this.id}/`,
      {},
      {
        headers: {
          'Content-Type': `application/json`,
          'Authorization': `Token ${store.getState().token}`,
        }
      },
    ).then(
      response => TrainingSet.fromRemote(response.data)
    )
  }

  addSign = (sign: Sign): Promise<TrainingSet> => {
    return axios.post(
      `${apiPath}training-set/${this.id}/add/${sign.id}/`,
      {},
      {
        headers: {
          'Content-Type': `application/json`,
          'Authorization': `Token ${store.getState().token}`,
        }
      },
    ).then(
      response => TrainingSet.fromRemote(response.data)
    )
  }

  removeSign = (sign: Sign): Promise<TrainingSet> => {
    return axios.post(
      `${apiPath}training-set/${this.id}/remove/${sign.id}/`,
      {},
      {
        headers: {
          'Content-Type': `application/json`,
          'Authorization': `Token ${store.getState().token}`,
        }
      },
    ).then(
      response => TrainingSet.fromRemote(response.data)
    )
  }

  public static get(id: string | number): Promise<TrainingSet> {
    const token = store.getState().token;
    return axios.get(
      `${apiPath}training-set/${id}/`,
      token ? {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        }
      } : {}
    ).then(
      response => TrainingSet.fromRemote(response.data)
    )
  }

  public static getCurrent(): Promise<TrainingSet> {
    return axios.get(
      apiPath + 'training-set/',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${store.getState().token}`,
        }
      }
    ).then(
      response => TrainingSet.fromRemote(response.data)
    )
  }

  public static all(offset: number = 0, limit: number = 50): Promise<PaginatedResponse<TrainingSet>> {
    return axios.get(
      apiPath + 'training-sets/',
      {
        params: {
          limit,
          offset,
        }
      }
    ).then(
      response => {
        return {
          objects: response.data.results.map(
            (set: any) => TrainingSet.fromRemote(set)
          ),
          hits: response.data.count,
        }
      }
    )
  }

  public static new(name: string, size: number, familiarityThreshold: number, isPublic: boolean): Promise<TrainingSet> {
    return axios.post(
      apiPath + 'training-set/',
      {
        name,
        size,
        familiarity_threshold: familiarityThreshold,
        public: isPublic,
        auto: !!size,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${store.getState().token}`,
        }
      }
    ).then(
      response => TrainingSet.fromRemote(response.data)
    )
  }

}
