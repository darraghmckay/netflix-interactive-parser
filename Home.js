'use es6';

import React, { Component } from 'react';
import bandersnatchData from './data/bandersnatch';

import Parser from '../components/Parser';

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    this.parser = new Parser(bandersnatchData);

    this.state = this.parser.getChoices();
  }

  getNextSegmentByChoice({ id, sg, segmentId }) {
    console.log(id, sg, segmentId);

    this.setState({
      ...!sg ? this.parser.getChoices(id) : this.parser.getChoices(sg)
    });
  }

  render() {
    const { choices, segment, segmentId } = this.state;
    console.log(choices, segment, segmentId);

    if (!choices) {
      return null;
    }

    return (
      <div>
        {segment && (
          <div>
            <img
              className="m-y-8"
              src={segment.image.styles.backgroundImage.replace('url(', '').replace(')', '')}
            />
            <h3>{segment.description}</h3>
          </div>
        )}
        <button onClick={() => this.getNextSegmentByChoice(choices[0])}>
            {choices[0].text}
        </button>
        {choices.length > 1 && (
          <button onClick={() => this.getNextSegmentByChoice(choices[1])}>
            {choices[1].text}
          </button>
        )}

      </div>
    );
  }
}

export default HomeContainer;
