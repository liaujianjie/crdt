import { GCounter, ReadonlyGCounter } from './g-counter';
import { StateBasedCrdtPayload, StateBasedCrdtReplica } from './typings';

interface PNCounterPayload extends StateBasedCrdtPayload {
  decrements: ReadonlyGCounter;
  increments: ReadonlyGCounter;
}

interface PNCounterQueryOps {
  /**
   * Returns the count.
   */
  getCount(): number;
}

interface PNCounterUpdateOps {
  /**
   * Increases the count by 1.
   */
  increment(): void;
  /**
   * Decrements the count by 1.
   */
  decrement(): void;
}

export interface ReadonlyPNCounter
  extends StateBasedCrdtReplica<PNCounterPayload>,
    Readonly<PNCounterPayload>,
    PNCounterQueryOps {}

/**
 * Positive-negative counter. Implemented with `GCounter`.
 */
export class PNCounter
  implements
    StateBasedCrdtReplica<PNCounterPayload>,
    PNCounterPayload,
    PNCounterQueryOps,
    PNCounterUpdateOps {
  readonly replicaId: string;

  // Payload

  increments: ReadonlyGCounter;
  decrements: ReadonlyGCounter;

  constructor(node: string, initialIncrements = 0, initialDecrements = 0) {
    this.replicaId = node;
    this.decrements = new GCounter(node, initialDecrements);
    this.increments = new GCounter(node, initialIncrements);
  }

  hasEqualPayload(otherPayload: PNCounterPayload): boolean {
    return (
      this.increments.hasEqualPayload(otherPayload.increments) &&
      this.decrements.hasEqualPayload(otherPayload.decrements)
    );
  }

  merge(otherPayload: PNCounterPayload) {
    const newIncrementsCounter = new GCounter(
      this.replicaId,
      this.increments.getCount()
    );
    const newDecrementsCounter = new GCounter(
      this.replicaId,
      this.decrements.getCount()
    );
    newIncrementsCounter.merge(otherPayload.increments);
    newDecrementsCounter.merge(otherPayload.decrements);
    this.increments = newIncrementsCounter;
    this.decrements = newDecrementsCounter;
  }

  // Query ops

  getCount(): number {
    return this.increments.getCount() - this.decrements.getCount();
  }

  // Update ops

  increment() {
    const newIncrementsCounter = new GCounter(
      this.replicaId,
      this.increments.getCount()
    );
    newIncrementsCounter.increment();
    this.increments = newIncrementsCounter;
  }

  decrement() {
    const newDecrementsCounter = new GCounter(
      this.replicaId,
      this.decrements.getCount()
    );
    newDecrementsCounter.increment();
    this.decrements = newDecrementsCounter;
  }
}
