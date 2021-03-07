/**
 * Base immutatable data type type, identified by its literal content. Atoms can be copied between
 * processes; atoms are equal if they have the same content.
 */
export type CrdtAtom<Element = unknown> =
  | string
  | number
  | ReadonlySet<Element>
  | ReadonlyArray<Element>
  | null
  | undefined;

/**
 * Mutable, replicatable data type.
 */
export interface CrdtPayload<Content> {
  /**
   * Unique identifier of the object. An object with the same identity may be in more than one
   * process, in which case we call these objects _replicas_.
   */
  id: string;
  /**
   * Underlying serializable data that represents the CRDT object state.
   */
  content: Content;
}

/**
 * A node in a network of processes.
 */
export interface CrdtProcess<Content> {
  /**
   * Globally unique identifier to uniquely identity the process in a network of processes.
   */
  id: string;
  /**
   * Local replica of the CRDT.
   */
  replica: CrdtPayload<Content>;
}

/**
 * Base specification for a **CvRDT**. Concrete specifications should also implement the update and
 * query operations, including their precondition checks.
 *
 * Note: Update and query operations should be immutable, have no side-effects and execute
 *       synchronously.
 */
export interface CvrdtSpecification<Payload extends CrdtPayload<unknown>> {
  getInitialPayload(payloadId: string): Payload;

  /**
   * Returns `true` if payloads `a` and `b` have equivalent abstract states.
   */
  compare(a: Payload, b: Payload): boolean;

  /**
   * Immutably merges payloads `a` and `b` and returns a least upper bound payload.
   */
  merge(a: Payload, b: Payload): Payload;
}
