import { GCounter } from './g-counter';
import {
  StateBasedCrdtPayload,
  CrdtNode,
  StateBasedCrdtReplica,
} from './typings';

interface PNCounterPayload extends StateBasedCrdtPayload {
  decrements: GCounter;
  increments: GCounter;
}

interface PNCounterReplica extends StateBasedCrdtReplica<PNCounterPayload> {
  /**
   * Increases the count by 1.
   */
  increment(): void;
  /**
   * Decrements the count by 1.
   */
  decrement(): void;
}

/**
 * Positive-negative counter.
 */
export class PNCounter implements PNCounterReplica, PNCounterPayload {
  readonly node: CrdtNode;

  // Payload

  increments: GCounter;
  decrements: GCounter;

  constructor(node: CrdtNode, initialIncrements = 0, initialDecrements = 0) {
    this.node = node;
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
      this.node,
      this.increments.getCount()
    );
    const newDecrementsCounter = new GCounter(
      this.node,
      this.decrements.getCount()
    );
    newIncrementsCounter.merge(otherPayload.increments);
    newDecrementsCounter.merge(otherPayload.decrements);
    this.increments = newIncrementsCounter;
    this.decrements = newDecrementsCounter;
  }

  // Query ops

  /**
   * Returns the count.
   */
  getCount(): number {
    return this.increments.getCount() - this.decrements.getCount();
  }

  // Update ops

  increment() {
    this.increments.increment();
  }

  decrement() {
    this.decrements.increment();
  }
}
