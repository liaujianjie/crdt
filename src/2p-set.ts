import { GOSet } from './go-set';
import {
  StateBasedCrdtPayload,
  StateBasedCrdtReplica,
  Primitive,
} from './typings';

/**
 * Set in which deleted elements are no longer re-addable.
 */
interface TwoPhaseSetPayload<Element extends Primitive>
  extends StateBasedCrdtPayload {
  readonly added: GOSet<Element>;
  readonly removed: GOSet<Element>;
}

interface TwoPhaseSetQueryOps<Element extends Primitive> {
  has(element: Element): boolean;
}

interface TwoPhaseSetUpdateOps<Element extends Primitive> {
  /**
   * Adds an element to the set.
   */
  add(element: Element): void;
  /**
   * Removes an element from the set.
   */
  remove(element: Element): void;
}

export class TwoPhaseSet<Element extends Primitive>
  implements
    StateBasedCrdtReplica<TwoPhaseSetPayload<Element>>,
    TwoPhaseSetPayload<Element>,
    TwoPhaseSetQueryOps<Element>,
    TwoPhaseSetUpdateOps<Element> {
  readonly replicaId: string;

  // Payload

  added: GOSet<Element>;
  removed: GOSet<Element>;

  constructor(node: string) {
    this.replicaId = node;
    this.added = new GOSet(node);
    this.removed = new GOSet(node);
  }

  hasEqualPayload(otherPayload: TwoPhaseSetPayload<Element>): boolean {
    return (
      this.added.hasEqualPayload(otherPayload.added) &&
      this.removed.hasEqualPayload(otherPayload.removed)
    );
  }

  merge(otherPayload: TwoPhaseSetPayload<Element>) {
    // TODO: implement
  }

  // Query ops

  has(element: Element): boolean {
    // TODO: implement
  }

  // Update ops

  add(element: Element) {
    // TODO: implement
  }

  remove(element: Element) {
    // TODO: implement
  }
}
