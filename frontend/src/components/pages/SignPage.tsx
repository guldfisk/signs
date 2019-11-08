import React from 'react';

import ReactPlayer from "react-player";
import FilePlayer from 'react-player/lib/players/FilePlayer';


export default class SignPage extends React.Component {

  render() {
    return <FilePlayer
      url='http://tegnsprog.dk/video/t/t_1305.mp4'
      playing
      loop
      controls
      muted

    />
  }

}