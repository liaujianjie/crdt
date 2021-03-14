import { GrowOnlySetPayload, GrowOnlySetUtils } from './grow-only-set';
import { CrdtPayload, CvrdtSpecification, Primitive } from './typings';
import { hasSameIdentity } from './utils/hasSameIdentity';
import { invariant } from './utils/invariant';

type TwoPhaseSetContent<Element extends Primitive> = {
  readonly added: GrowOnlySetPayload<Element>;
  readonly removed: GrowOnlySetPayload<Element>;
};

export interface TwoPhaseSetPayload<Element extends Primitive>
  extends CrdtPayload<TwoPhaseSetContent<Element>> {}

export interface TwoPhaseSetUpdateOperations<Element extends Primitive> {
  add(
    payload: TwoPhaseSetPayload<Element>,
    elemenet: Element
  ): TwoPhaseSetPayload<Element>;
  remove(
    payload: TwoPhaseSetPayload<Element>,
    elemenet: Element
  ): TwoPhaseSetPayload<Element>;
}

export interface TwoPhaseSetQueryOperations<Element extends Primitive> {
  has(payload: TwoPhaseSetPayload<Element>, element: Element): boolean;
}

interface TwoPhaseSetUtils<Element extends Primitive = Primitive>
  extends CvrdtSpecification<TwoPhaseSetPayload<Element>>,
    TwoPhaseSetUpdateOperations<Element>,
    TwoPhaseSetQueryOperations<Element> {
  getInitialPayload(payloadId: string): TwoPhaseSetPayload<Element>;
}

export const TwoPhaseSetUtils: TwoPhaseSetUtils = {
  getInitialPayload(payloadId) {
    return {
      id: payloadId,
      content: {
        added: GrowOnlySetUtils.getInitialPayload(`${payloadId}-added`),
        removed: GrowOnlySetUtils.getInitialPayload(`${payloadId}-removed`),
      },
    };
  },

  compare(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    return (
      GrowOnlySetUtils.compare(a.content.added, b.content.added) &&
      GrowOnlySetUtils.compare(a.content.removed, b.content.removed)
    );
  },

  merge(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    return {
      id: a.id,
      content: {
        added: GrowOnlySetUtils.merge(a.content.added, b.content.added),
        removed: GrowOnlySetUtils.merge(a.content.removed, b.content.removed),
      },
    };
  },

  add(payload, element) {
    return {
      id: payload.id,
      content: {
        added: GrowOnlySetUtils.add(payload.content.added, element),
        removed: payload.content.removed,
      },
    };
  },

  remove(payload, element) {
    return {
      id: payload.id,
      content: {
        removed: GrowOnlySetUtils.add(payload.content.removed, element),
        added: payload.content.added,
      },
    };
  },

  has(payload, element) {
    if (GrowOnlySetUtils.has(payload.content.removed, element)) {
      return false;
    }
    if (GrowOnlySetUtils.has(payload.content.added, element)) {
      return true;
    }
    return false;
  },
};
