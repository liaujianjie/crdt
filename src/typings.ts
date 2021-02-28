/**
 * Represents a unique client.
 */
export interface CrdtNode {
  /**
   * Globally unique identifier.
   */
  readonly id: string;
}

/**
 * Payload for a CvRDT system. The payload is sent between replicas.
 */
export interface StateBasedCrdtPayload {}

/**
 * Replica for a CvRDT system.
 */
export interface StateBasedCrdtReplica<
  Payload extends StateBasedCrdtPayload,
  Value
> {
  /**
   * Node that controls the replica.
   */
  readonly node: CrdtNode;
  /**
   * Current payload of the replica.
   */
  payload: Payload;

  /**
   * Returns the valure represented by the payload from `this` replica.
   */
  getValue(): Value;
  /**
   * Returns `true` if `otherPayload` is equals to the payload from `this` replica.
   */
  hasEqualPayload(otherPayload: Payload): boolean;
  /**
   * Merges the payload from another replica to the payload from `this` replica.
   */
  merge(otherPayload: Payload): void;
}
