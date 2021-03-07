import { CrdtPayload, CvrdtSpecification, Primitive } from './typings';
import { hasSameIdentity } from './utils/hasSameIdentity';
import { invariant } from './utils/invariant';

type GrowOnlySetContent<Element extends Primitive> = ReadonlySet<Element>;

export interface GrowOnlySetPayload<Element extends Primitive>
  extends CrdtPayload<GrowOnlySetContent<Element>> {}

export interface GrowOnlySetUpdateOperations<Element extends Primitive> {
  add(
    payload: GrowOnlySetPayload<Element>,
    element: Element
  ): GrowOnlySetPayload<Element>;
}

export interface GrowOnlySetQueryOperations<Element extends Primitive> {
  has(payload: GrowOnlySetPayload<Element>, element: Element): boolean;
}

interface GrowOnlySetUtils<Element extends Primitive = Primitive>
  extends CvrdtSpecification<GrowOnlySetPayload<Element>>,
    GrowOnlySetUpdateOperations<Element>,
    GrowOnlySetQueryOperations<Element> {
  getInitialPayload(payloadId: string): GrowOnlySetPayload<Element>;
}

export const GrowOnlySetUtils: GrowOnlySetUtils = {
  getInitialPayload(payloadId) {
    return {
      id: payloadId,
      content: new Set(),
    };
  },

  compare(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    // Payloads are trivially equal if they are referentially equal.
    if (a === b) {
      return true;
    }

    // Payloads are unequal if they have different number of elements.
    if (a.content.size !== b.content.size) {
      return false;
    }

    // Payloads are unequal if there is at least one element from a set that doesn't exist in the
    // other set.
    for (const elementFromA of a.content) {
      if (!b.content.has(elementFromA)) {
        return false;
      }
    }

    return true;
  },

  merge(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    return {
      id: a.id,
      content: new Set([...a.content, ...b.content]),
    };
  },

  add(payload, element) {
    return {
      id: payload.id,
      content: new Set([...payload.content, element]),
    };
  },

  has(payload, element) {
    return payload.content.has(element);
  },
};
