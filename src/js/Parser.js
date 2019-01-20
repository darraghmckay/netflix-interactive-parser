'use es6';

import StateHistory from './StateHistory';

const PERSISTENT_STATE = 'persistentState';
const MomentType = {
  SCENE: 'scene:',
  NOTIFICATION: 'notification:',
};

const INITIAL_SEGMENT_ID = '1A';

class Parser {
  constructor({ interactiveVideoMoments, ...rest }) {
    this.videoMoments = interactiveVideoMoments;
    this.stateHistory = new StateHistory();
    this.metaData = rest;
  }

  updateStateHistory(nextState) {
    this.stateHistory = this.stateHistory.updateState(nextState);
  }

  getChoicePoint(segmentId = INITIAL_SEGMENT_ID) {
    return this.videoMoments.choicePointNavigatorMetadata.choicePointsMetadata.choicePoints[segmentId];
  }

  getMoment(segmentId = INITIAL_SEGMENT_ID) {
    return this.videoMoments.momentsBySegment[segmentId];
  }

  getChoices(segmentId = INITIAL_SEGMENT_ID) {
    const momentObj = this.videoMoments.momentsBySegment[segmentId];
    const moment = momentObj && momentObj.find(({ choices, type }) => type.includes(MomentType.SCENE) && choices.length === 2);
    const momentNoti = momentObj && momentObj.find(({ type }) => type.includes(MomentType.NOTIFICATION));

    if (!moment) {
      const segment = this.videoMoments.segmentGroups[segmentId];
      if (segment) {
        return this.getSegmentGroupChoices(segment);
      } else {
        console.log('End');
        return {};
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
      segmentId,
      selected: moment.choices[moment.defaultChoiceIndex],
    };
  }

  getSegmentGroupChoices(segmentGroup) {
    for (let i = 0; i < segmentGroup.length; i++) {
      const segment = segmentGroup[i];
      if (segment.segmentGroup) {
        const segmentGroupObj = this.videoMoments.segmentGroups[segment.segmentGroup];
        return this.getSegmentGroupChoices(segmentGroupObj);
      } else if (segment.segment) {
        const precondition = this.videoMoments.preconditions[segment.precondition];
        if (this.stateHistory.isValidPrecondition(precondition)) {
          return this.getChoices(segment.segment);
        }
      } else {
        const segmentMoment = this.getMoment(segment);
        const segmentNotification = segmentMoment && segmentMoment.find(({ type }) => type.includes(MomentType.NOTIFICATION));
        const segmentPrecondition = this.videoMoments.preconditions[segment];

        if (segmentNotification && segmentNotification.precondition) {
          if (this.stateHistory.isValidPrecondition(segmentNotification.precondition)) {
            return this.getChoices(segment);
          }
        } else if (segmentPrecondition) {
          if (this.stateHistory.isValidPrecondition(segmentPrecondition)) {
            return this.getChoices(segment);
          }
        } else {
          return this.getChoices(segment);
        }
      }
    }
  }
}

export default Parser;
