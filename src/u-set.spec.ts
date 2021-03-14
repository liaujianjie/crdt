import { USetUtils } from './u-set';

describe('u-set', () => {
  const { getInitialPayload, merge, compare, add, remove, has } = USetUtils;

  describe(USetUtils.getInitialPayload, () => {
    it('should return empty added and removed sets', () => {
      const a = getInitialPayload('payload_x');
      expect(a.content.added.content.size).toEqual(0);
      expect(a.content.removed.content.size).toEqual(0);
    });
  });

  describe(USetUtils.merge, () => {
    it('should throw if payloads have different identities', () => {
      const a = getInitialPayload('payload_x');
      const b = getInitialPayload('payload_y');
      expect(() => merge(a, b)).toThrow();
    });

    it('should be commutative', () => {
      const a = add(getInitialPayload('payload_x'), 'meow');
      const b = remove(add(getInitialPayload('payload_x'), 'woof'), 'woof');

      const mergedAB = merge(a, b);
      const mergedBA = merge(b, a);

      // White box - should we even assert for this?
      expect(mergedAB).toEqual(mergedBA);
      // Black box
      expect(compare(mergedAB, mergedBA)).toBe(true);
    });

    it('should be associative', () => {
      const a = add(getInitialPayload('payload_x'), 'meow');
      const b = remove(add(getInitialPayload('payload_x'), 'woof'), 'woof');
      const c = add(getInitialPayload('payload_x'), 'skrt');

      const mergedABThenC = merge(merge(a, b), c);
      const mergedBCThenA = merge(a, merge(b, c));

      // White box - should we even assert for this?
      expect(mergedABThenC).toEqual(mergedBCThenA);
      // Black box
      expect(compare(mergedABThenC, mergedBCThenA)).toBe(true);
    });

    it('should be idempotent', () => {
      const a = add(getInitialPayload('payload_x'), 'meow');
      const b = remove(add(getInitialPayload('payload_x'), 'woof'), 'woof');

      const mergedAB = merge(a, b);
      const mergedABThenA = merge(merge(b, a), a);
      const mergedABThenB = merge(merge(b, a), b);

      // White box - should we even assert for this?
      expect(mergedAB).toEqual(mergedABThenA);
      // Black box
      expect(compare(mergedAB, mergedABThenA)).toBe(true);
      expect(compare(mergedAB, mergedABThenB)).toBe(true);
    });
  });

  describe(USetUtils.compare, () => {
    it('should throw if payloads have different identities', () => {
      const aX = getInitialPayload('payload_x');
      const aY = getInitialPayload('payload_y');
      expect(() => compare(aX, aY)).toThrow();
    });

    it('should return true if payloads are referentially equal', () => {
      const a = getInitialPayload('payload_x');
      expect(compare(a, a)).toBe(true);
    });

    it('should return true if payloads have the same elements', () => {
      const a = add(getInitialPayload('payload_x'), 'meow');
      const b = add(getInitialPayload('payload_x'), 'meow');
      expect(compare(a, b)).toBe(true);
    });

    it('should return false if payloads have at least 1 mismatch element', () => {
      const a = getInitialPayload('payload_x');
      const b = add(getInitialPayload('payload_x'), 'woof');
      expect(compare(a, b)).toBe(false);

      const c = remove(add(getInitialPayload('payload_x'), 'woof'), 'woof');
      expect(compare(a, c)).toBe(false);
    });
  });

  describe(USetUtils.add, () => {
    it('should add element', () => {
      const a = getInitialPayload('payload_x');
      expect(has(add(a, 'meow'), 'meow')).toBe(true);
    });

    it('should be equal when adding an already-removed element', () => {
      const a = remove(add(getInitialPayload('payload_x'), 'meow'), 'meow');
      expect(compare(a, remove(a, 'meow'))).toBe(true);
    });

    it('should be equal when adding an already-added element', () => {
      const a = add(getInitialPayload('payload_x'), 'meow');
      expect(compare(a, add(a, 'meow'))).toBe(true);
    });
  });

  describe(USetUtils.remove, () => {
    it('should remove element', () => {
      const a = add(getInitialPayload('payload_x'), 'meow');
      expect(has(remove(a, 'meow'), 'meow')).toBe(false);
    });

    // Main difference between this CRDT and 2P-Set.
    it('should be equal when removing an item that has not been added yet', () => {
      const a = getInitialPayload('payload_x');
      expect(compare(a, remove(a, 'meow'))).toBe(true);
    });

    it('should be equal when removing an already-removed element', () => {
      const a = remove(add(getInitialPayload('payload_x'), 'meow'), 'meow');
      expect(compare(a, remove(a, 'meow'))).toBe(true);
    });
  });
});
