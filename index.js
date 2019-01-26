'use es6';

const MomentType = {
  SCENE: 'scene:',
  NOTIFICATION: 'notification:',
};

class NetflixInteractiveParser {
  constructor({ interactiveVideoMoments, ...rest }, { initialSegment, segments }) {
    this.videoMoments = interactiveVideoMoments;
    this.segments = segments;
    this.stateHistory = {};
    this.initialSegmentId = initialSegment;

  }

  updateStateHistory(nextState) {
    this.stateHistory = {
      ...this.stateHistory,
      ...nextState
    };
  }

  getChoicePoint(segmentId = INITIAL_SEGMENT_ID) {
    return this.videoMoments.choicePointNavigatorMetadata.choicePointsMetadata.choicePoints[segmentId];
  }

  getMoment(segmentId = INITIAL_SEGMENT_ID) {
    return this.videoMoments.momentsBySegment[segmentId];
  }

  getInitialChoices() {
    return this.getChoices();
  }

  getNextChoices({ id, impressionData, sg }) {
    if (impressionData) {
      this.updateStateHistory(impressionData.data.persistent);
    }

    return this.getChoices(sg || id);
  }

  getChoices(segmentId = this.initialSegmentId) {
    const momentObj = this.videoMoments.momentsBySegment[segmentId];
    const moment = momentObj && momentObj.find(({ choices, type }) => type.includes(MomentType.SCENE) && choices.length === 2);
    const momentNoti = momentObj && momentObj.find(({ type }) => type.includes(MomentType.NOTIFICATION));

    if (!moment) {
      const segment = this.videoMoments.segmentGroups[segmentId];
      if (segment) {
        return this.getSegmentGroupChoices(segment);
      } else if (this.segments[segmentId]) {
        const segmentFromMap = this.segments[segmentId];
        // Redoing a segment so preconditions can be ignored
        return this.getSegmentGroupChoices(Object.keys(segmentFromMap.next), false);
      } else {
        console.log('End');
        return null;
      }
    }



    if (moment.impressionData) {
      // On entering this moment there is state that is initialised
      this.updateStateHistory(moment.impressionData.data.persistent);
    } else if (momentNoti && momentNoti.impressionData) {
      // On choosing this moment there is state that is updated
      this.updateStateHistory(momentNoti.impressionData.data.persistent);
    }

    return {
      choices: moment.choices,
      choicePoint: this.getChoicePoint(segmentId),
      layoutType: moment.layoutType,
      segmentId,
      selected: moment.choices[moment.defaultChoiceIndex],
    };
  }

  getSegmentGroupChoices(segmentGroup, observePreconditions = true) {
    for (let i = 0; i < segmentGroup.length; i++) {
      const segment = segmentGroup[i];
      if (segment.segmentGroup) {
        const segmentGroupObj = this.videoMoments.segmentGroups[segment.segmentGroup];
        return this.getSegmentGroupChoices(segmentGroupObj);
      } else if (segment.segment) {
        const precondition = this.videoMoments.preconditions[segment.precondition];
        if (this.isValidPrecondition(precondition)) {
          return this.getChoices(segment.segment);
        }
      } else {
        const segmentMoment = this.getMoment(segment);
        const segmentNotification = segmentMoment && segmentMoment.find(({ type }) => type.includes(MomentType.NOTIFICATION));
        const segmentPrecondition = this.videoMoments.preconditions[segment];

        if (segmentNotification && segmentNotification.precondition) {
          if (this.isValidPrecondition(segmentNotification.precondition) || !observePreconditions) {
            return this.getChoices(segment);
          }
        } else if (segmentPrecondition) {
          if (this.isValidPrecondition(segmentPrecondition) || !observePreconditions) {
            return this.getChoices(segment);
          }
        }
      }
    }
  }

  isValidPrecondition(precondition) {
    return this.evaluatePrecondition(precondition);
  }

  evaluateConditions(conditions) {
    if (conditions && conditions.length > 0) {
      return conditions.map(condition => {
        const operator = condition[0];
        if (operator === 'persistentState') {
          return this.stateHistory[condition[1]];
        } else if (operator === 'eql') {
          return this.stateHistory[condition[1][1]] === condition[2];
        } if (['and', 'or', 'not'].includes(operator)) {
          return this.evaluatePrecondition(condition)
        }
      });
    }

    return [];
  }

  evaluatePrecondition(precondition) {
    if (precondition && precondition.length > 0) {
      const operator = precondition[0];
      switch (operator) {
        case 'and': {
          return this.evaluateConditions(precondition.slice(1)).every(value => value);
        }
        case 'or': {
          return this.evaluateConditions(precondition.slice(1)).some(value => value);
        }
        case 'not': {
          return !this.evaluateConditions(precondition.slice(1)).every(value => value);
        }
        default: {
          return this.evaluateConditions([precondition]).every(value => value);
        }
      }
    }

    return true;
  }
}

export default NetflixInteractiveParser;
