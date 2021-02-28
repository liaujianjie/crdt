/**
 * Payload for a CvRDT system. The payload is sent between replicas.
 */
export interface StateBasedCrdtPayload {}

/**
 * Replica for a CvRDT system.
 */
export interface StateBasedCrdtReplica<Payload extends StateBasedCrdtPayload> {
  /**
   * Node that controls the replica.
   */
  readonly replicaId: string;
  /**
   * Returns `true` if `otherPayload` is equals to the payload from `this` replica.
   */
  hasEqualPayload(otherPayload: Payload): boolean;
  /**
   * Merges the payload from another replica to the payload from `this` replica.
   */
  merge(otherPayload: Payload): void;
}

export type PrimitiveType = string | number | null | undefined;
