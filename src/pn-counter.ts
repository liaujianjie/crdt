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

  decrements: GCounter;
  increments: GCounter;

  constructor(node: CrdtNode) {
    this.node = node;
    this.decrements = new GCounter(node);
    this.increments = new GCounter(node);
  }

  hasEqualPayload(otherPayload: PNCounterPayload): boolean {
    return (
      this.decrements.hasEqualPayload(otherPayload.decrements) &&
      this.increments.hasEqualPayload(otherPayload.increments)
    );
  }

  merge(otherPayload: PNCounterPayload) {
    this.decrements.merge(otherPayload.decrements);
    this.increments.merge(otherPayload.increments);
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
