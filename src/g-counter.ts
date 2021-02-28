import { StateBasedCrdtPayload, StateBasedCrdtReplica } from './typings';

interface GCounterPayload extends StateBasedCrdtPayload {
  /**
   * Map of all increments for each replica.
   */
  counts: { readonly [replicaId: string]: number };
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
    StateBasedCrdtReplica<GCounterPayload>,
    GCounterPayload,
    GCounterQueryOps,
    GCounterUpdateOps {
  readonly replicaId: string;

  // Payload

  counts: GCounterPayload['counts'];

  constructor(node: string, initialCount = 0) {
    this.replicaId = node;
    this.counts = { [this.replicaId]: initialCount };
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
      [this.replicaId]: this.counts[this.replicaId] + 1,
    };
  }
}
