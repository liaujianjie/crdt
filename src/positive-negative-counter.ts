import {
  GrowOnlyCounterPayload,
  GrowOnlyCounterUtils,
} from './grow-only-counter';
import { CrdtPayload, CvrdtSpecification } from './typings';
import { hasSameIdentity } from './utils/hasSameIdentity';
import { invariant } from './utils/invariant';

type PositiveNegativeCounterContent = {
  readonly positive: GrowOnlyCounterPayload;
  readonly negative: GrowOnlyCounterPayload;
};

export interface PositiveNegativeCounterPayload
  extends CrdtPayload<PositiveNegativeCounterContent> {}

export interface PositiveNegativeCounterUpdateOperations {
  increment(
    payload: PositiveNegativeCounterPayload,
    processId: string
  ): PositiveNegativeCounterPayload;
  decrement(
    payload: PositiveNegativeCounterPayload,
    processId: string
  ): PositiveNegativeCounterPayload;
}

export interface PositiveNegativeCounterQueryOperations {
  getValue(payload: PositiveNegativeCounterPayload): number;
}

interface PositiveNegativeCounterUtils
  extends CvrdtSpecification<PositiveNegativeCounterPayload>,
    PositiveNegativeCounterUpdateOperations,
    PositiveNegativeCounterQueryOperations {
  getInitialPayload(payloadId: string): PositiveNegativeCounterPayload;
}

export const PositiveNegativeCounterUtils: PositiveNegativeCounterUtils = {
  getInitialPayload(payloadId) {
    return {
      id: payloadId,
      content: {
        positive: GrowOnlyCounterUtils.getInitialPayload(
          `${payloadId}-positive`
        ),
        negative: GrowOnlyCounterUtils.getInitialPayload(
          `${payloadId}-negative`
        ),
      },
    };
  },

  compare(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    return (
      GrowOnlyCounterUtils.compare(a.content.negative, b.content.negative) &&
      GrowOnlyCounterUtils.compare(a.content.positive, b.content.positive)
    );
  },

  merge(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    return {
      id: a.id,
      content: {
        negative: GrowOnlyCounterUtils.merge(
          a.content.negative,
          b.content.negative
        ),
        positive: GrowOnlyCounterUtils.merge(
          a.content.positive,
          b.content.positive
        ),
      },
    };
  },

  increment(payload, processId) {
    return {
      id: payload.id,
      content: {
        negative: payload.content.negative,
        positive: GrowOnlyCounterUtils.increment(
          payload.content.positive,
          processId
        ),
      },
    };
  },

  decrement(payload, processId) {
    return {
      id: payload.id,
      content: {
        negative: GrowOnlyCounterUtils.increment(
          payload.content.negative,
          processId
        ),
        positive: payload.content.positive,
      },
    };
  },

  getValue(payload) {
    return (
      GrowOnlyCounterUtils.getValue(payload.content.positive) -
      GrowOnlyCounterUtils.getValue(payload.content.negative)
    );
  },
};
