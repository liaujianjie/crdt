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

interface PNCounterReplica
  extends StateBasedCrdtReplica<PNCounterPayload, number> {
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

  getValue(): number {
    return (
      this.payload.increments.getValue() - this.payload.decrements.getValue()
    );
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

  increment() {
    this.payload.increments.increment();
  }

  decrement() {
    this.payload.decrements.increment();
  }
}
