import { CrdtPayload, CvrdtSpecification } from './typings';
import { hasSameIdentity } from './utils/hasSameIdentity';
import { invariant } from './utils/invariant';

type GrowOnlyCounterContent = {
  /**
   * Map of all increments for each replica.
   */
  readonly [processId: string]: number;
};

export interface GrowOnlyCounterPayload
  extends CrdtPayload<GrowOnlyCounterContent> {}

export interface GrowOnlyCounterUpdateOperations {
  increment(
    payload: GrowOnlyCounterPayload,
    processId: string
  ): GrowOnlyCounterPayload;
}

export interface GrowOnlyCounterQueryOperations {
  getValue(payload: GrowOnlyCounterPayload): number;
}

interface GrowOnlyCounterUtils
  extends CvrdtSpecification<GrowOnlyCounterPayload>,
    GrowOnlyCounterUpdateOperations,
    GrowOnlyCounterQueryOperations {
  getInitialPayload(payloadId: string): GrowOnlyCounterPayload;
}

export const GrowOnlyCounterUtils: GrowOnlyCounterUtils = {
  getInitialPayload(payloadId) {
    return { id: payloadId, content: {} };
  },

  compare(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    // Although ES2015 guarantees key ordering based on insertion, we do not consider key ordering
    // for state equivalence of this CvRDT.
    const aIds = Object.keys(a.content);
    const bIds = Object.keys(b.content);

    // Payloads are trivially equal if they are referentially equal.
    if (a === b) {
      return true;
    }

    // Payloads are unequal if they are keeping records of different number of processes.
    if (aIds.length !== bIds.length) {
      return false;
    }

    // The counter payloads are unequal as long as there is one mismatchng count for any process.
    for (const processId of Array.from(new Set([...aIds, ...bIds]))) {
      if (a.content[processId] !== b.content[processId]) {
        return false;
      }
    }

    return true;
  },

  merge(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    const uniqueProcessIds = Array.from(
      new Set([...Object.keys(a.content), ...Object.keys(b.content)])
    );
    return {
      id: a.id,
      content: uniqueProcessIds.reduce(
        (acc, processId) => ({
          ...acc,
          [processId]: Math.max(
            a.content[processId] ?? 0,
            b.content[processId] ?? 0
          ),
        }),
        {}
      ),
    };
  },

  increment(payload, processId) {
    return {
      ...payload,
      content: {
        ...payload.content,
        [processId]: (payload.content[processId] ?? 0) + 1,
      },
    };
  },

  getValue(payload) {
    return Object.keys(payload.content).reduce(
      (previousValue, processId) => previousValue + payload.content[processId],
      0
    );
  },
};
