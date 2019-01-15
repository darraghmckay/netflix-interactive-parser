'use es6';

import { Record } from 'immutable';

export default class StateHistory extends Record({
  p_sp: false,
  p_tt: false,
  p_8a: false,
  p_td: false,
  p_cs: false,
  p_w1: false,
  p_2b: false,
  p_3j: false,
  p_pt: false,
  p_cd: false,
  p_cj: false,
  p_sj: false,
  p_sj2: false,
  p_tud: false,
  p_lsd: false,
  p_vh: false,
  p_3l: false,
  p_3s: false,
  p_3z: false,
  p_ps: false,
  p_wb: false,
  p_kd: false,
  p_bo: false,
  p_5v: false,
  p_pc: false,
  p_sc: false,
  p_ty: false,
  p_cm: false,
  p_pr: false,
  p_3ad: false,
  p_s3af: false,
  p_nf: false,
  p_np: false,
  p_ne: false,
  p_pp: false,
  p_tp: false,
  p_bup: false,
  p_be: false,
  p_pe: false,
  p_pae: false,
  p_te: false,
  p_snt: false,
  p_8j: false,
  p_8d: false,
  p_8m: false,
  p_8q: false,
  p_8s: false,
  p_8v: false,
  p_vs: false,
  p_scs: false,
  p_3ab: false,
  p_3ac: false,
  p_3aj: false,
  p_3ah: false,
  p_3ak: false,
  p_3al: false,
  p_3af: false,
  p_5h: false,
  p_5ac: false,
  p_5ag: false,
  p_5ad: false,
  p_6c: false
}) {

  isValidPrecondition(precondition) {
    return this.evaluatePrecondition(precondition);
  }

  evaluateConditions(conditions) {
    if (conditions && conditions.length > 0) {
      return conditions.map(condition => {
        if (condition[0] === 'persistentState') {
          return this[condition[1]];
        } else if (['and', 'or', 'not'].includes(condition[0])) {
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

  updateState(newStateHistory) {
    return this.merge(newStateHistory);
  }
};
