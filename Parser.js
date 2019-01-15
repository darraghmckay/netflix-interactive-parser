'use es6';

import StateHistory from './StateHistory';

const PERSISTENT_STATE = 'persistentState';
const MomentType = {
  SCENE: 'scene:cs_bs',
  NOTIFICATION: 'notification:playbackImpression',
};

const INITIAL_SEGMENT_ID = '1A';

class Parser {
  constructor({ interactiveVideoMoments, ...rest }) {
    this.videoMoments = interactiveVideoMoments;
    this.stateHistory = new StateHistory();
    this.metaData = rest;
  }
  
  getSegment(segmentId = INITIAL_SEGMENT_ID) {
    return this.videoMoments.choicePointNavigatorMetadata.choicePointsMetadata.choicePoints[segmentId];
  }

  getMoment(segmentId = INITIAL_SEGMENT_ID) {
    return this.videoMoments.momentsBySegment[segmentId];
  }

  getChoices(segmentId = INITIAL_SEGMENT_ID) {
    const momentObj = this.videoMoments.momentsBySegment[segmentId];
    const moment = momentObj && momentObj.find(({ type }) => type === MomentType.SCENE);

    if (!moment) {
      const segment = this.videoMoments.segmentGroups[segmentId];
      if (segment) {
        return this.getSegmentGroupChoices(segment);
      } else {
        console.log('End');
        return {};
      }
    }

    return {
      choices: moment.choices,
      segment: this.getSegment(segmentId),
      segmentId,
    };
  }

  evaluateChoices(choices) {
    if (!choices) {
      return null;
    }

    choices.forEach(({ segmentId, sg }) => {
      if (segmentId) {
        this.evaluateChoices(this.getChoices(segmentId));
      } else if (sg) {
        this.evaluateSegmentGroup(sg);
      }
    });
  }

  getSegmentGroupChoices(segmentGroup) {
    for (var i = 0; i < segmentGroup.length; i++) {
      const segment = segmentGroup[i];
      if (segment.segmentGroup) {
        const segmentGroupObj = this.videoMoments.segmentGroups[segment.segmentGroup];
        return this.getSegmentGroupChoices(segmentGroupObj);
      } else if (segment.segment) {
        return this.getChoices(segment.segment);
      } else {
        const segmentMoment = this.getMoment(segment);
        const segmentNotification = segmentMoment && segmentMoment.find(({ type }) => type === MomentType.NOTIFICATION);

        if (segmentNotification) {
          const {
            impressionData: { data: { persistent } }
          } = segmentNotification;

          const precondition = this.videoMoments.preconditions[segment];
          if (this.stateHistory.isValidPrecondition(precondition)) {
            this.stateHistory = this.stateHistory.updateState(persistent);
            return this.getChoices(segment);
          }
        } else {
          return this.getChoices(segment);
        }
      }
    }
  }

  evaluateSegmentGroup(sg) {
    const segments = this.videoMoments.segmentGroups[sg];

    segments.forEach(segment => {
      if (segment.segmentGroup) {
        this.evaluateSegmentGroup(segment.segmentGroup);
      } else if (segment.segment) {
        this.evaluateChoices(this.getChoices(segment.segment));
      } else {
        this.evaluateChoices(this.getChoices(segment));
      }
    });
  }

  unwrapPreconditions(preconditions, depth = 2) {
    if (preconditions) {
      Object.keys(preconditions).forEach(momentKey => {
        this.indentLevel = depth;
        const precondition = preconditions[momentKey];
        if (precondition.length > 1) {
          this.unwrapPreconditions(precondition, depth + 1);
        } else if (precondition === PERSISTENT_STATE) {
          this.lastCondition = precondition;
        }
      });
    }
  }

  processMoments() {
    const moments = this.videoMoments.momentsBySegment;

    Object.keys(moments).forEach(momentKey => {
      this.indentLevel = 0;

      const moment = this.videoMoments.momentsBySegment[momentKey];
      const momentMeta = this.videoMoments.choicePointNavigatorMetadata.choicePointsMetadata.choicePoints[momentKey];
      const description = momentMeta.description;

      this.indentLevel = 1;
      const scene = moment.find(({ type }) => type === MomentType.SCENE);
      const notification = moment.find(({ type }) => type === MomentType.NOTIFICATION);
      const persistentSceneData = scene.impressionData.data.persistent;
      const persistentNotificationData = notification.impressionData.data.persistent;
      const preconditions = notification.precondition;

      if (preconditions) {
        this.unwrapPreconditions(preconditions);
      }

      this.indentLevel = 1;
      const choices = scene.choices;

      if (choices) {
        choices.forEach(({ segmentId, sg, text }) => {
          if (segmentId) {
            console.log('Choice', text, segmentId, sg);
          } else if (sg) {
            console.log('Choice', text, sg);
          }
        })
      }

    });

    this.indentLevel = 0;
  }
}

export default Parser;
