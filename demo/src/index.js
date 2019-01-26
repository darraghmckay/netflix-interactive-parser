import React, { Component } from 'react';
import ReactDOM from "react-dom";
import NetflixInteractiveParser from 'netflix-interactive-parser';
import bandersnatchData from './data/bandersnatch';
import bandersnatchSegmentMap from './data/segmentMap';


class App extends Component {
  constructor(props) {
    super(props);
    this.parser = new NetflixInteractiveParser(
      bandersnatchData,
      bandersnatchSegmentMap
    );

    this.checkCode = this.checkCode.bind(this);
    this.onTimerUpdate = this.onTimerUpdate.bind(this);
    this.resetTimer = this.resetTimer.bind(this);

    this.state = {
      ...this.parser.getInitialChoices(),
      input: [],
      timer: 0,
      timerId: setInterval(this.onTimerUpdate, 1000),
    };
  }

  componentDidMount() {
    document.addEventListener("keyup", ({ key }) => {
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

  onTimerUpdate() {
    const { selected, timer } = this.state;

    if (timer + 1 <= 10) {
      this.setState({
        timer: timer + 1,
      });
    } else {
      this.getNextSegmentByChoice(selected);
    }
  }

  resetTimer() {
    const { timerId } = this.state;
    clearInterval(timerId);

    this.setState({
      timer: 0,
      timerId: setInterval(this.onTimerUpdate, 1000),
    });
  }

  updateSelection(selected) {
    this.setState({
      selected,
    });
  }

  getNextSegmentByChoice(choice) {
    this.setState(this.parser.getNextChoices(choice));
    this.resetTimer();
  }

  checkCode(value, position) {
    const { choices, input } = this.state;
    input[position] = value;
    this.setState({
      input,
    }, () => {
      debugger;
      choices.forEach(choice => {
        if (choice.code) {
          const isCorrect = choice.code.split('').every((char, index) => (
            input.hasOwnProperty(index) && char === input[index]
          ));

          if (isCorrect) {
            this.setState({
              input: [],
            });
            return this.getNextSegmentByChoice(choice);
          }
        }
      });
    });
  }

  renderChoiceLayouts() {
    const { choices, layoutType, selected } = this.state;

    switch(layoutType) {
      case 'l30': {
        const { code } = choices.find(choice => !!choice.code);
        return (
          <div className="code-input-wrapper">
            {code.split('').map((_, i) => (
              <input
                key={i}
                maxLength={1}
                onChange={({ target: { value } }) => this.checkCode(value, i)}
                placeholder="-"
              />
            ))}
          </div>
        )
      }
      default: {
        return (
          <div className="button-wrapper">
            {choices.map(choice => (
              <button
                className={selected === choice ? 'selected' : ''}
                key={choice.id}
                onClick={() => this.getNextSegmentByChoice(choice)}
                onMouseEnter={() => this.updateSelection(choice)}
              >
                {choice.image ? (
                  <div className="image-button" style={choice.image.styles} />
                ) : choice.text}
              </button>
            ))}
          </div>
        )
      }
    }
  }

  render() {
    const { choices, choicePoint, layoutType, timer } = this.state;

    if (!choices) {
      return null;
    }

    return choicePoint && (
      <div
        className="choice-point-wrapper"
        style={choicePoint.image.styles}
      >
        <div className="choice-wrapper">
          <div className="choice-timer" style={{ width: `${timer * 10}%`}} />
          <h2>{choicePoint.description}</h2>
          {this.renderChoiceLayouts()}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
