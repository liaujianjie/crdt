import {
  StateBasedCrdtPayload,
  CrdtNode,
  StateBasedCrdtReplica,
} from './typings';

interface GCounterPayload extends StateBasedCrdtPayload {
  /**
   * Map of all increments for each replica.
   */
  counts: { readonly [index in CrdtNode['id']]: number };
}

interface GCounterQueryOps {
  /**
   * Returns the count of the counter.
   */
  getCount(): number;
}

interface GCounterUpdateOps {
  /**
   * Increases the count by 1.
   */
  increment(): void;
}

export interface ReadonlyGCounter
  extends StateBasedCrdtReplica<GCounterPayload>,
    Readonly<GCounterPayload>,
    GCounterQueryOps {}

/**
 * Increment-only counter.
 */
export class GCounter
  implements
    GCounterPayload,
    GCounterQueryOps,
    GCounterUpdateOps,
    StateBasedCrdtReplica<GCounterPayload> {
  readonly node: CrdtNode;

  // Payload

  counts: GCounterPayload['counts'];

  constructor(node: CrdtNode, initialCount = 0) {
    this.node = node;
    this.counts = { [this.node.id]: initialCount };
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
    this.counts = {
      ...this.counts,
      [this.node.id]: this.counts[this.node.id] + 1,
    };
  }
}
