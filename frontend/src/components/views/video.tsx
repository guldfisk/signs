import React from "react";

import FilePlayer from 'react-player/lib/players/FilePlayer';
import {Sign} from "../models/models";


interface SignVideoProps {
  sign: Sign;
}


export class SignVideo extends React.Component<SignVideoProps> {

  render() {
    return <FilePlayer
      url={this.props.sign.getVideoUrl()}
      playing
      loop
      controls
      muted
    />
  }

}
