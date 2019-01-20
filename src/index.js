import React, { Component } from 'react';
import ReactDOM from "react-dom";
import bandersnatchData from './data/bandersnatch';

import Parser from './js/Parser';

class App extends Component {
  constructor(props) {
    super(props);
    this.parser = new Parser(bandersnatchData);

    this.state = this.parser.getChoices();
  }

  componentDidMount() {
    document.addEventListener("keyup", ({ key }) => {
      console.log('index - key', key);
      const { choices, selected } = this.state;
      if (key === 'ArrowRight' && choices.length > 1) {
        this.updateSelection(choices[1]);
      } else if (key === 'ArrowLeft') {
        this.updateSelection(choices[0]);
      } if (key === ' ' || key === 'Enter') {
        this.getNextSegmentByChoice(selected);
      }
    });
  }

  updateSelection(selected) {
    this.setState({
      selected,
    });
  }

  getNextSegmentByChoice({ id, sg, segmentId }) {
    console.log(id, sg, segmentId);

    this.setState(!sg ? this.parser.getChoices(id) : this.parser.getChoices(sg));
  }

  render() {
    const { choices, choicePoint, segmentId, selected } = this.state;
    // console.log(choices, choicePoint, segmentId);

    if (!choices) {
      return null;
    }

    return choicePoint && (
      <div
        className="choice-point-wrapper"
        style={{ backgroundImage: choicePoint.image.styles.backgroundImage}}
      >
        <div className="choice-wrapper">
          {/*<div className="choice-timer" />*/}
          <h2>{choicePoint.description}</h2>
          <div className="button-wrapper" key={segmentId}>
            <button
              className={selected === choices[0] ? 'selected' : ''}
              onClick={() => this.getNextSegmentByChoice(choices[0])}
              onMouseEnter={() => this.updateSelection(choices[0])}
            >
              {choices[0].text}
            </button>
            {choices.length > 1 && (
              <button
                className={selected === choices[1] ? 'selected' : ''}
                onClick={() => this.getNextSegmentByChoice(choices[1])}
                onMouseEnter={() => this.updateSelection(choices[1])}
              >
                {choices[1].text}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
