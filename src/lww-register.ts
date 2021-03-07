import {
  CrdtAtom,
  StateBasedCrdtPayload,
  StateBasedCrdtReplica,
} from './typings';
import { invariant } from './utils/invariant';

interface LWWRegisterPayload<Value extends CrdtAtom>
  extends StateBasedCrdtPayload {
  /**
   * Data
   */
  timestamp: Date;
  writerReplicaId: string;
  value: Value;
}

interface LWWRegisterQueryOps<Value extends CrdtAtom> {
  /**
   * Returns the value of the register.
   */
  getValue(): Value;
}

interface LWWRegisterUpdateOps<Value extends CrdtAtom> {
  /**
   * Assgins a new value to the register.
   */
  assign(newValue: Value): void;
}

/**
 * Last-writer-wins register.
 */
export class LWWRegister<Value extends CrdtAtom>
  implements
    StateBasedCrdtReplica<LWWRegisterPayload<Value>>,
    LWWRegisterQueryOps<Value>,
    LWWRegisterUpdateOps<Value>,
    LWWRegisterPayload<Value> {
  readonly replicaId: string;

  // Payload

  timestamp: Date;
  writerReplicaId: string;
  value: Value;

  constructor(node: string, initialValue: Value) {
    this.replicaId = node;
    this.timestamp = new Date();
    this.writerReplicaId = node;
    this.value = initialValue;
  }

  hasEqualPayload(otherPayload: LWWRegisterPayload<Value>): boolean {
    return (
      this.value === otherPayload.value &&
      this.writerReplicaId === otherPayload.writerReplicaId &&
      this.timestamp === otherPayload.timestamp
    );
  }

  merge(otherPayload: LWWRegisterPayload<Value>) {
    // Partially guard against byzantine nodes.
    invariant(
      otherPayload.timestamp <= new Date(),
      'Cannot merge payload from the future.'
    );

    // Do nothing if the other payload is less recent than the payload from this replica.
    if (
      this.timestamp > otherPayload.timestamp ||
      // For completeness
      this.writerReplicaId > otherPayload.writerReplicaId
    ) {
      return;
    }

    // Otherwise, update payload.
    this.timestamp = otherPayload.timestamp;
    this.writerReplicaId = otherPayload.writerReplicaId;
    this.value = otherPayload.value;
  }

  // Query ops

  getValue(): Value {
    return this.value;
  }

  // Update ops

  assign(newValue: Value) {
    this.writerReplicaId = this.replicaId;
    this.timestamp = new Date();
    this.value = newValue;
  }
}
