import {
  PrimitiveType,
  StateBasedCrdtPayload,
  StateBasedCrdtReplica,
} from './typings';

interface LWWRegisterPayload<Value extends PrimitiveType>
  extends StateBasedCrdtPayload {
  /**
   * Data
   */
  timestamp: Date;
  writerReplicaId: string;
  value: Value;
}

interface LWWRegisterQueryOps<Value extends PrimitiveType> {
  /**
   * Returns the value of the register.
   */
  getValue(): Value;
}

interface LWWRegisterUpdateOps<Value extends PrimitiveType> {
  /**
   * Assgins a new value to the register.
   */
  assign(newValue: Value): void;
}

/**
 * Last-writer-wins register.
 */
export class LWWRegister<Value extends PrimitiveType>
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
    if (
      this.timestamp > otherPayload.timestamp ||
      this.writerReplicaId > otherPayload.writerReplicaId
    ) {
      return;
    }

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
