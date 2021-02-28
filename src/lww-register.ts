import {
  CrdtNode,
  PrimitiveType,
  StateBasedCrdtPayload,
  StateBasedCrdtReplica,
} from './typings';

interface LWWRegisterPayload<Value extends PrimitiveType>
  extends StateBasedCrdtPayload {
  timestamp: Date;
  nodeId: string;
  value: Value;
}

interface LWWRegisterReplica<Value extends PrimitiveType>
  extends StateBasedCrdtReplica<LWWRegisterPayload<Value>> {
  /**
   * Assgins a new value to the register.
   */
  assign(newValue: Value): void;
}

/**
 * Last-writer-wins register.
 */
export class LWWRegister<Value extends PrimitiveType>
  implements LWWRegisterReplica<Value>, LWWRegisterPayload<Value> {
  readonly node: CrdtNode;

  // Payload

  timestamp: Date;
  nodeId: string;
  value: Value;

  constructor(node: CrdtNode, initialValue: Value) {
    this.node = node;
    this.timestamp = new Date();
    this.nodeId = node.id;
    this.value = initialValue;
  }

  hasEqualPayload(otherPayload: LWWRegisterPayload<Value>): boolean {
    return (
      this.value === otherPayload.value &&
      this.nodeId === otherPayload.nodeId &&
      this.timestamp === otherPayload.timestamp
    );
  }

  merge(otherPayload: LWWRegisterPayload<Value>) {
    if (
      this.timestamp > otherPayload.timestamp ||
      this.nodeId > otherPayload.nodeId
    ) {
      return;
    }

    this.timestamp = otherPayload.timestamp;
    this.nodeId = otherPayload.nodeId;
    this.value = otherPayload.value;
  }

  // Query ops

  /**
   * Returns the value of the register.
   */
  getValue(): Value {
    return this.value;
  }

  // Update ops

  assign(newValue: Value) {
    this.nodeId = this.node.id;
    this.timestamp = new Date();
    this.value = newValue;
  }
}
