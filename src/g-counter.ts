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
  readonly counts: {
    [index in CrdtNode['id']]: number;
  };
}

interface GCounterReplica
  extends StateBasedCrdtReplica<GCounterPayload, number> {
  /**
   * Increases the count by 1.
   */
  increment(): void;
}

export class GCounter implements GCounterReplica {
  readonly node: CrdtNode;
  payload: GCounterPayload;

  constructor(node: CrdtNode) {
    this.node = node;
    this.payload = { counts: { [this.node.id]: 0 } };
  }

  getValue(): number {
    return Object.values(this.payload.counts).reduce(
      (previousTotalCount, count) => previousTotalCount + count,
      0
    );
  }

  hasEqualPayload(otherPayload: GCounterPayload): boolean {
    const thisIds = Object.keys(this.payload.counts);
    const otherIds = Object.keys(otherPayload.counts);
    if (thisIds.length !== otherIds.length) {
      return false;
    }

    // The counters are unequal as long as
    for (const nodeId in otherPayload.counts) {
      const otherCount = otherPayload.counts[nodeId];
      const thisCount = this.payload.counts[nodeId];
      if (otherCount !== thisCount) {
        return false;
      }
    }

    return true;
  }

  merge(otherPayload: GCounterPayload) {
    const thisKeys = Object.keys(this.payload.counts);
    const otherKeys = Object.keys(otherPayload.counts);
    const keys = Array.from(new Set([...thisKeys, ...otherKeys]));

    this.payload = {
      counts: keys.reduce((previousPartialPayload, nodeId) => {
        return {
          ...previousPartialPayload,
          [nodeId]: Math.max(
            this.payload.counts[nodeId] ?? 0,
            otherPayload.counts[nodeId] ?? 0
          ),
        };
      }, {}),
    };
  }

  increment() {
    this.payload.counts[this.node.id]++;
  }
}
