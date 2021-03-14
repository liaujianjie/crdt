import { CrdtPayload, CvrdtSpecification, Primitive } from './typings';
import { hasSameIdentity } from './utils/hasSameIdentity';
import { invariant } from './utils/invariant';

type TimestampedElement<Element extends Primitive> = {
  element: Element;
  timestamp: number;
};

type LastWriterWinsElementSetContent = {
  readonly added: Set<string>;
  readonly removed: Set<string>;
};

export interface LastWriterWinsElementSetPayload
  extends CrdtPayload<LastWriterWinsElementSetContent> {}

export interface LastWriterWinsElementSetUpdateOperations<
  Element extends Primitive
> {
  add(
    payload: LastWriterWinsElementSetPayload,
    element: Element
  ): LastWriterWinsElementSetPayload;
  remove(
    payload: LastWriterWinsElementSetPayload,
    element: Element
  ): LastWriterWinsElementSetPayload;
}

export interface LastWriterWinsElementSetQueryOperations<
  Element extends Primitive
> {
  has(payload: LastWriterWinsElementSetPayload, element: Element): boolean;
}

interface LastWriterWinsElementSetUtils<Element extends Primitive = Primitive>
  extends CvrdtSpecification<LastWriterWinsElementSetPayload>,
    LastWriterWinsElementSetUpdateOperations<Element>,
    LastWriterWinsElementSetQueryOperations<Element> {
  getInitialPayload(payloadId: string): LastWriterWinsElementSetPayload;
}

export const LastWriterWinsElementSetUtils: LastWriterWinsElementSetUtils = {
  getInitialPayload(payloadId) {
    return {
      id: payloadId,
      content: {
        added: new Set(),
        removed: new Set(),
      },
    };
  },

  compare(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    if (a.content.added.size !== b.content.added.size) {
      return false;
    }
    if (a.content.removed.size !== b.content.removed.size) {
      return false;
    }

    for (const aAdded of a.content.added) {
      if (!b.content.added.has(aAdded)) {
        return false;
      }
    }
    for (const aRemoved of a.content.removed) {
      if (!b.content.removed.has(aRemoved)) {
        return false;
      }
    }

    return true;
  },

  merge(a, b) {
    invariant(hasSameIdentity(a, b), 'Payloads have different identities.');

    return {
      id: a.id,
      content: {
        added: new Set([...a.content.added, ...b.content.added]),
        removed: new Set([...a.content.removed, ...b.content.removed]),
      },
    };
  },

  add(payload, element) {
    return {
      id: payload.id,
      content: {
        added: new Set([
          ...payload.content.added,
          getTimestampedIdentifier({ element, timestamp: Date.now() }),
        ]),
        removed: payload.content.removed,
      },
    };
  },

  remove(payload, element) {
    return {
      id: payload.id,
      content: {
        added: payload.content.added,
        removed: new Set([
          ...payload.content.removed,
          getTimestampedIdentifier({ element, timestamp: Date.now() }),
        ]),
      },
    };
  },

  has(payload, element) {
    const identifier = getIdentifier(element);
    const latestAddTimestamp = getLatestTimestamp(
      payload.content.added,
      identifier
    );
    const latestRemoveTimestamp = getLatestTimestamp(
      payload.content.removed,
      identifier
    );

    if (latestAddTimestamp === undefined) {
      return false;
    }

    if (latestRemoveTimestamp === undefined) {
      return true;
    }

    return latestAddTimestamp > latestRemoveTimestamp;
  },
};

function getLatestTimestamp(
  timestampedIdentifiers: Set<string>,
  targetIdentifier: string
): number | undefined {
  return Array.from(timestampedIdentifiers).reduce<number | undefined>(
    (previousTimestamp, serializedIdentiier) => {
      const { timestamp, identifier } = splitTimestampFromIdentifier(
        serializedIdentiier
      );
      if (identifier !== targetIdentifier) {
        return previousTimestamp;
      }
      if (previousTimestamp === undefined) {
        return timestamp;
      }

      return timestamp > previousTimestamp ? timestamp : previousTimestamp;
    },
    undefined
  );
}

function getIdentifier<Element extends Primitive>(element: Element): string {
  switch (element) {
    case null:
      return 'null';
    case undefined:
      return 'undefined';
    default:
      return `${typeof element}:${element}`;
  }
}

function getTimestampedIdentifier<Element extends Primitive>(
  timestampedElement: TimestampedElement<Element>
): string {
  return `${timestampedElement.timestamp}:${getIdentifier(
    timestampedElement.element
  )}`;
}

function splitTimestampFromIdentifier(timestampedIdentifier: string) {
  const [
    timestampString,
    ...identifierComponents
  ] = timestampedIdentifier.split(':');
  return {
    timestamp: Number(timestampString),
    identifier: identifierComponents.join(':'),
  };
}
