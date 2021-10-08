import React from 'react';

import {Sign} from "../models/models";
import {SignVideo} from "../views/video";


interface SignThumbnailProps {
  sign: Sign
  allowExpand?: boolean
  handleSignClicked?: ((sign: Sign) => void) | null
}

interface SignThumbnailState {
  expanded: boolean
}

export default class SignThumbnail extends React.Component<SignThumbnailProps, SignThumbnailState> {

  public static defaultProps = {
    allowExpand: true,
  };


  constructor(props: SignThumbnailProps) {
    super(props);
    this.state = {
      expanded: false,
    };
  }


  render() {
    if (this.state.expanded) {
      return <SignVideo sign={this.props.sign}/>
    }
    return <img
      src={this.props.sign.getThumbnailUrl()}
      onClick={
        () => {
          if (this.props.allowExpand) {
            this.setState({expanded: true});
          }
          if (this.props.handleSignClicked) {
            this.props.handleSignClicked(this.props.sign)
          }
        }
      }
    />
  }

}
