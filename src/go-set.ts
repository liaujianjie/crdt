import {
  StateBasedCrdtPayload,
  StateBasedCrdtReplica,
  PrimitiveType,
} from './typings';

interface GOSetPayload<Element extends PrimitiveType>
  extends StateBasedCrdtPayload {
  /**
   * Underlying set.
   */
  readonly set: Set<Element>;
}

interface GOSetQueryOps<Element extends PrimitiveType> {
  /**
   * Returns `true` if the set contains `element`.
   */
  has(element: Element): boolean;
}

interface GOSetUpdateOps<Element extends PrimitiveType> {
  /**
   * Adds an element to the set.
   */
  add(element: Element): void;
}

/**
 * Grow-only set.
 *
 * Note: Yes, this one is kind of a no-brainer. I just wanted to see how it fits into the semantics
 *       of a CvRDT.
 */
export class GOSet<Element extends PrimitiveType>
  implements
    StateBasedCrdtReplica<GOSetPayload<Element>>,
    GOSetQueryOps<Element>,
    GOSetUpdateOps<Element>,
    GOSetPayload<Element> {
  readonly replicaId: string;

  // Payload

  set: Set<Element>;

  constructor(node: string, initialElements: Iterable<Element> = []) {
    this.replicaId = node;
    this.set = new Set(initialElements);
  }

  hasEqualPayload(otherPayload: GOSetPayload<Element>): boolean {
    if (this.set.size !== otherPayload.set.size) {
      return false;
    }

    for (const element of this.set) {
      if (!otherPayload.set.has(element)) {
        return false;
      }
    }

    return true;
  }

  merge(otherPayload: GOSetPayload<Element>) {
    this.set = new Set([...this.set, ...otherPayload.set]);
  }

  // Query ops

  has(element: Element): boolean {
    return this.set.has(element);
  }

  // Update ops

  add(element: Element) {
    this.set = new Set([...this.set, element]);
  }
}
