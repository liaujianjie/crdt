import { LastWriterWinsRegisterUtils } from './last-writer-wins-register';

describe('last-writer-wins-register', () => {
  // Mock `Date.now()`.
  beforeEach(() => {
    const dateCounter = { currentCount: 0 };
    jest
      .spyOn(Date, 'now')
      .mockImplementation(() => dateCounter.currentCount++);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  const {
    getInitialPayload,
    merge,
    compare,
    assign,
    getValue,
  } = LastWriterWinsRegisterUtils;

  describe(LastWriterWinsRegisterUtils.getInitialPayload, () => {
    it('should return empty map', () => {
      expect(
        getInitialPayload('payload_x', 'meow', 'process_a').content
      ).toMatchObject({
        value: 'meow',
        writerId: 'process_a',
      });
    });
  });

  describe(LastWriterWinsRegisterUtils.merge, () => {
    it('should throw if payloads have different identities', () => {
      const a = getInitialPayload('payload_x', 'first', 'process_a');
      const b = getInitialPayload('payload_y', 'first', 'process_a');
      expect(() => merge(a, b)).toThrow();
    });

    it('should be commutative', () => {
      const a = getInitialPayload('payload_x', 'first', 'process_a');
      const b = assign(
        getInitialPayload('payload_x', 'second', 'process_b'),
        'third',
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
      const a = getInitialPayload('payload_x', 'first', 'process_a');
      const b = assign(
        getInitialPayload('payload_x', 'second', 'process_b'),
        'third',
        'process_b'
      );
      const c = assign(
        getInitialPayload('payload_x', 'fourth', 'process_c'),
        'fifth',
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
      const a = getInitialPayload('payload_x', 'first', 'process_a');
      const b = assign(
        getInitialPayload('payload_x', 'second', 'process_b'),
        'third',
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

  describe(LastWriterWinsRegisterUtils.compare, () => {
    it('should throw if payloads have different identities', () => {
      const aX = getInitialPayload('payload_x', 'meow', 'process_a');
      const aY = getInitialPayload('payload_y', 'meow', 'process_a');
      expect(() => compare(aX, aY)).toThrow();
    });

    it('should return false if payloads have different values', () => {
      const a = getInitialPayload('payload_x', 'meow', 'process_a');
      const b = getInitialPayload('payload_x', 'woof', 'process_a');
      expect(compare(a, b)).toBe(false);
    });

    it('should return false if payloads are written by different processes', () => {
      const a = getInitialPayload('payload_x', 'meow', 'process_a');
      const b = getInitialPayload('payload_x', 'woof', 'process_b');
      expect(compare(a, b)).toBe(false);
    });

    it('should return false if payloads have different timestamps', () => {
      const a = getInitialPayload('payload_x', 'meow', 'process_a');
      const b = getInitialPayload('payload_x', 'meow', 'process_a');
      expect(compare(a, b)).toBe(false);
    });

    it('should return true if payloads are referentially equal', () => {
      const a = getInitialPayload('payload_x', 'meow', 'process_a');
      expect(compare(a, a)).toBe(true);
    });

    it('should return true if payloads have the same merged payload', () => {
      const prevA = getInitialPayload('payload_x', 'meow', 'process_a');
      const b = getInitialPayload('payload_x', 'meow', 'process_a');
      const a = merge(prevA, b);

      expect(compare(a, b)).toBe(true);
    });
  });

  describe(LastWriterWinsRegisterUtils.assign, () => {
    it('should assign value', () => {
      const a = getInitialPayload('payload_x', 'meow', 'process_a');
      expect(getValue(assign(a, 'woof', 'process_a'))).toBe('woof');
    });
  });
});
