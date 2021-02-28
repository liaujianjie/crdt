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
export class PNCounter implements PNCounterReplica {
  readonly node: CrdtNode;
  payload: PNCounterPayload;

  constructor(node: CrdtNode) {
    this.node = node;
    this.payload = {
      decrements: new GCounter(node),
      increments: new GCounter(node),
    };
  }

  hasEqualPayload(otherPayload: PNCounterPayload): boolean {
    return (
      this.payload.decrements.hasEqualPayload(
        otherPayload.decrements.payload
      ) &&
      this.payload.increments.hasEqualPayload(otherPayload.increments.payload)
    );
  }

  merge(otherPayload: PNCounterPayload) {
    this.payload.decrements.merge(otherPayload.decrements.payload);
    this.payload.increments.merge(otherPayload.increments.payload);
  }

  // Query ops

  /**
   * Returns the count.
   */
  getCount(): number {
    return (
      this.payload.increments.getCount() - this.payload.decrements.getCount()
    );
  }

  // Update ops

  increment() {
    this.payload.increments.increment();
  }

  decrement() {
    this.payload.decrements.increment();
  }
}
