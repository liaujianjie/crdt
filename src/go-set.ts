import {
  StateBasedCrdtPayload,
  CrdtNode,
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

interface GOSetReplica<Element extends PrimitiveType>
  extends StateBasedCrdtReplica<GOSetPayload<Element>> {
  /**
   * Adds an element to the set.
   */
  add(element: Element): void;
}

/**
 * Grow-only set.
 *
 * Note: Yes, this one is kind of a no brainer. I just wanted to see how it fits into the semantics
 *       of a CvRDT.
 */
export class GOSet<Element extends PrimitiveType>
  implements GOSetReplica<Element> {
  readonly node: CrdtNode;
  payload: GOSetPayload<Element>;

  constructor(node: CrdtNode, initialElements: Iterable<Element> = []) {
    this.node = node;
    this.payload = { set: new Set(initialElements) };
  }

  hasEqualPayload(otherPayload: GOSetPayload<Element>): boolean {
    if (this.payload.set.size !== otherPayload.set.size) {
      return false;
    }

    for (const element of this.payload.set) {
      if (!otherPayload.set.has(element)) {
        return false;
      }
    }

    return true;
  }

  merge(otherPayload: GOSetPayload<Element>) {
    this.payload = { set: new Set([...this.payload.set, ...otherPayload.set]) };
  }

  // Query ops

  has(element: Element): boolean {
    return this.payload.set.has(element);
  }

  // Update ops

  add(element: Element) {
    this.payload = { set: new Set([...this.payload.set, element]) };
  }
}
