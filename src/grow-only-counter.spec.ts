import { GrowOnlyCounterUtils } from './grow-only-counter';

describe('grow-only-counter', () => {
  const {
    getInitialPayload,
    merge,
    compare,
    increment,
    getValue,
  } = GrowOnlyCounterUtils;

  describe(GrowOnlyCounterUtils.getInitialPayload, () => {
    it('should return empty map', () => {
      expect(getInitialPayload('payload_x').content).toEqual({});
    });
  });

  describe(GrowOnlyCounterUtils.merge, () => {
    it('should throw if payloads have different identities', () => {
      const a = getInitialPayload('payload_x');
      const b = getInitialPayload('payload_y');
      expect(() => merge(a, b)).toThrow();
    });

    it('should be commutative', () => {
      const a = increment(getInitialPayload('payload_x'), 'process_a');
      const b = increment(
        increment(getInitialPayload('payload_x'), 'process_b'),
        'process_b'
      );

      const mergedAB = merge(a, b);
      const mergedBA = merge(b, a);

      // White box - should we even assert for this?
      expect(mergedAB).toEqual(mergedBA);
      // Black box
      expect(compare(mergedAB, mergedBA)).toBe(true);
      expect(getValue(mergedAB)).toBe(getValue(mergedBA));
    });

    it('should be associative', () => {
      const a = increment(getInitialPayload('payload_x'), 'process_a');
      const b = increment(
        increment(getInitialPayload('payload_x'), 'process_b'),
        'process_b'
      );
      const c = increment(
        increment(getInitialPayload('payload_x'), 'process_c'),
        'process_c'
      );

      const mergedABThenC = merge(merge(a, b), c);
      const mergedBCThenA = merge(a, merge(b, c));

      // White box - should we even assert for this?
      expect(mergedABThenC).toEqual(mergedBCThenA);
      // Black box
      expect(compare(mergedABThenC, mergedBCThenA)).toBe(true);
      expect(getValue(mergedABThenC)).toBe(getValue(mergedBCThenA));
    });

    it('should be idempotent', () => {
      const a = increment(getInitialPayload('payload_x'), 'process_a');
      const b = increment(
        increment(getInitialPayload('payload_x'), 'process_b'),
        'process_b'
      );

      const mergedAB = merge(a, b);
      const mergedABThenA = merge(merge(b, a), a);
      const mergedABThenB = merge(merge(b, a), b);

      // White box - should we even assert for this?
      expect(mergedAB).toEqual(mergedABThenA);
      // Black box
      expect(compare(mergedAB, mergedABThenA)).toBe(true);
      expect(compare(mergedAB, mergedABThenB)).toBe(true);
      expect(getValue(mergedAB)).toBe(getValue(mergedABThenA));
      expect(getValue(mergedAB)).toBe(getValue(mergedABThenB));
    });
  });

  describe(GrowOnlyCounterUtils.compare, () => {
    it('should throw if payloads have different identities', () => {
      const aX = getInitialPayload('payload_x');
      const aY = getInitialPayload('payload_y');
      expect(() => compare(aX, aY)).toThrow();
    });

    it('should return true if payloads are referentially equal', () => {
      const a = getInitialPayload('payload_x');
      expect(compare(a, a)).toBe(true);
    });

    it('should return true if payloads have the same count for each process', () => {
      const a = increment(getInitialPayload('payload_x'), 'process_a');
      const b = increment(getInitialPayload('payload_x'), 'process_a');
      expect(compare(a, b)).toBe(true);
    });

    it('should return false if payloads have different count for at least one process', () => {
      const a = increment(getInitialPayload('payload_x'), 'process_a');
      const b = increment(getInitialPayload('payload_x'), 'process_b');
      expect(compare(a, b)).toBe(false);
    });
  });

  describe(GrowOnlyCounterUtils.increment, () => {
    it('should increment value by 1', () => {
      const a = getInitialPayload('payload_x');
      expect(getValue(a)).toBe(0);
      expect(getValue(increment(a, 'process_a'))).toBe(1);
    });
  });
});
