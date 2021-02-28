import {
  CrdtNode,
  PrimitiveType,
  StateBasedCrdtPayload,
  StateBasedCrdtReplica,
} from './typings';

interface LWWRegisterPayload<Data extends PrimitiveType>
  extends StateBasedCrdtPayload {
  timestamp: Date;
  nodeId: string;
  data: Data;
}

interface LWWRegisterReplica<Data extends PrimitiveType>
  extends StateBasedCrdtReplica<LWWRegisterPayload<Data>> {
  /**
   * Assgins a new value to the register.
   */
  assign(data: Data): void;
}

/**
 * Last-writer-wins register.
 */
export class LWWRegister<Data extends PrimitiveType>
  implements LWWRegisterReplica<Data>, LWWRegisterPayload<Data> {
  readonly node: CrdtNode;

  // Payload

  timestamp: Date;
  nodeId: string;
  data: Data;

  constructor(node: CrdtNode, initialData: Data) {
    this.node = node;
    this.timestamp = new Date();
    this.nodeId = node.id;
    this.data = initialData;
  }

  hasEqualPayload(otherPayload: LWWRegisterPayload<Data>): boolean {
    return (
      this.data === otherPayload.data &&
      this.nodeId === otherPayload.nodeId &&
      this.timestamp === otherPayload.timestamp
    );
  }

  merge(otherPayload: LWWRegisterPayload<Data>) {
    if (
      this.timestamp > otherPayload.timestamp ||
      this.nodeId > otherPayload.nodeId
    ) {
      return;
    }

    this.timestamp = otherPayload.timestamp;
    this.nodeId = otherPayload.nodeId;
    this.data = otherPayload.data;
  }

  // Query ops

  /**
   * Returns the value of the register.
   */
  getValue(): Data {
    return this.data;
  }

  // Update ops

  assign(data: Data) {
    this.nodeId = this.node.id;
    this.timestamp = new Date();
    this.data = data;
  }
}
