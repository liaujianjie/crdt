import {
  CrdtNode,
  PrimitiveType,
  StateBasedCrdtPayload,
  StateBasedCrdtReplica,
} from './typings';

interface LWWRegisterPayload<Data extends PrimitiveType>
  extends StateBasedCrdtPayload {
  readonly timestamp: Date;
  readonly nodeId: string;
  readonly data: Data;
}

interface LWWRegisterReplica<Data extends PrimitiveType>
  extends StateBasedCrdtReplica<LWWRegisterPayload<Data>> {
  assign(data: Data): void;
}

/**
 * Last-writer-wins register.
 */
export class LWWRegister<Data extends PrimitiveType>
  implements LWWRegisterReplica<Data> {
  readonly node: CrdtNode;
  payload: LWWRegisterPayload<Data>;

  constructor(node: CrdtNode, initialData: Data) {
    this.node = node;
    this.payload = {
      timestamp: new Date(),
      nodeId: node.id,
      data: initialData,
    };
  }

  hasEqualPayload(otherPayload: LWWRegisterPayload<Data>): boolean {
    return (
      this.payload.data === otherPayload.data &&
      this.payload.nodeId === otherPayload.nodeId &&
      this.payload.timestamp === otherPayload.timestamp
    );
  }

  merge(otherPayload: LWWRegisterPayload<Data>) {
    if (
      this.payload.timestamp > otherPayload.timestamp ||
      this.payload.nodeId > otherPayload.nodeId
    ) {
      return;
    }

    this.payload = { ...otherPayload };
  }

  // Query ops

  getValue(): Data {
    return this.payload.data;
  }

  // Update ops

  assign(data: Data) {
    this.payload = {
      nodeId: this.node.id,
      timestamp: new Date(),
      data,
    };
  }
}
