import {
  StateBasedCrdtPayload,
  CrdtNode,
  StateBasedCrdtReplica,
} from './typings';

/**
 * Increment-only counter.
 */
interface GCounterPayload extends StateBasedCrdtPayload {
  /**
   * Map of all increments for each replica.
   */
  counts: { [index in CrdtNode['id']]: number };
}

interface GCounterReplica extends StateBasedCrdtReplica<GCounterPayload> {
  /**
   * Increases the count by 1.
   */
  increment(): void;
}

export class GCounter implements GCounterReplica, GCounterPayload {
  readonly node: CrdtNode;

  // Payload

  counts: GCounterPayload['counts'];

  constructor(node: CrdtNode) {
    this.node = node;
    this.counts = { [this.node.id]: 0 };
  }

  hasEqualPayload(otherPayload: GCounterPayload): boolean {
    const thisIds = Object.keys(this.counts);
    const otherIds = Object.keys(otherPayload.counts);
    if (thisIds.length !== otherIds.length) {
      return false;
    }

    // The counters are unequal as long as
    for (const nodeId in otherPayload.counts) {
      const otherCount = otherPayload.counts[nodeId];
      const thisCount = this.counts[nodeId];
      if (otherCount !== thisCount) {
        return false;
      }
    }

    return true;
  }

  merge(otherPayload: GCounterPayload) {
    const thisKeys = Object.keys(this.counts);
    const otherKeys = Object.keys(otherPayload.counts);
    const keys = Array.from(new Set([...thisKeys, ...otherKeys]));

    this.counts = keys.reduce((previousPartialPayload, nodeId) => {
      return {
        ...previousPartialPayload,
        [nodeId]: Math.max(
          this.counts[nodeId] ?? 0,
          otherPayload.counts[nodeId] ?? 0
        ),
      };
    }, {});
  }

  // Query ops

  getCount(): number {
    return Object.values(this.counts).reduce(
      (previousTotalCount, count) => previousTotalCount + count,
      0
    );
  }

  // Update ops

  increment() {
    this.counts[this.node.id]++;
  }
}
