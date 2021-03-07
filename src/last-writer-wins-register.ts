import { CrdtAtom, CrdtPayload, CvrdtSpecification } from './typings';
import { hasSameIdentity } from './utils/hasSameIdentity';
import { invariant } from './utils/invariant';

type LastWriterWinsRegisterContent<Value extends CrdtAtom> = {
  /**
   * Value of the register.
   */
  readonly value: Value;
  /**
   * Timestamp at which the value was written.
   */
  readonly timestamp: number;
  /**
   * The id of the process that wrote the value.
   */
  readonly writerId: string;
};

export interface LastWriterWinsRegisterPayload<Value extends CrdtAtom>
  extends CrdtPayload<LastWriterWinsRegisterContent<Value>> {}

export interface LastWriterWinsRegisterUpdateOperations<
  Value extends CrdtAtom
> {
  assign(
    payloadId: LastWriterWinsRegisterPayload<Value>,
    value: Value,
    processId: string
  ): LastWriterWinsRegisterPayload<Value>;
}

export interface LastWriterWinsRegisterQueryOperations<Value extends CrdtAtom> {
  getValue(payloadId: LastWriterWinsRegisterPayload<Value>): Value;
}

interface LastWriterWinsRegisterUtils<Value extends CrdtAtom>
  extends CvrdtSpecification<LastWriterWinsRegisterPayload<Value>>,
    LastWriterWinsRegisterUpdateOperations<Value>,
    LastWriterWinsRegisterQueryOperations<Value> {
  getInitialPayload(
    payloadId: string,
    initialValue: Value,
    processId: string
  ): LastWriterWinsRegisterPayload<Value>;
}

export const LastWriterWinsRegisterUtils: LastWriterWinsRegisterUtils<CrdtAtom> = {
  getInitialPayload(payloadId, initialValue, processId) {
    return {
      id: payloadId,
      content: {
        value: initialValue,
        writerId: processId,
        timestamp: Date.now(),
      },
    };
  },

  compare(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    return (
      a.content.timestamp === b.content.timestamp &&
      a.content.value === b.content.value &&
      a.content.writerId === b.content.writerId
    );
  },

  merge(a, b) {
    const timestamp = Date.now();
    invariant(
      timestamp > a.content.timestamp,
      'First payload has a timestamp from the future.'
    );
    invariant(
      timestamp > b.content.timestamp,
      'Second payload has a timestamp from the future.'
    );
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    const lastWrittenPayload = (() => {
      if (a.content.timestamp > b.content.timestamp) {
        return a;
      } else if (a.content.timestamp < b.content.timestamp) {
        return b;
      }

      if (a.content.writerId > b.content.writerId) {
        return a;
      } else if (a.content.writerId < b.content.writerId) {
        return b;
      }

      invariant(
        a.content.value === b.content.value,
        'Payloads have different values despite being having the same writer in the same instant.'
      );
      return a;
    })();

    return lastWrittenPayload;
  },

  assign(payload, value, processId) {
    const timestamp = Date.now();
    invariant(
      timestamp > payload.content.timestamp,
      'Payload has a timestamp from the future.'
    );

    return {
      id: payload.id,
      content: {
        value,
        timestamp,
        writerId: processId,
      },
    };
  },

  getValue(payload) {
    return payload.content.value;
  },
};
