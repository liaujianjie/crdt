import { CrdtPayload } from '../typings';

export function hasSameIdentity<Content extends unknown>(
  a: CrdtPayload<Content>,
  b: CrdtPayload<Content>
): boolean {
  return a.id === b.id;
}
