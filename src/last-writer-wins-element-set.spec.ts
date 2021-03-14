import { LastWriterWinsElementSetUtils } from './last-writer-wins-element-set';

describe('last-writer-wins-element-set', () => {
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
    add,
    remove,
    has,
  } = LastWriterWinsElementSetUtils;

  describe(LastWriterWinsElementSetUtils.getInitialPayload, () => {
    it('should return empty sets', () => {
      expect(getInitialPayload('payload_x').content.added.size).toEqual(0);
      expect(getInitialPayload('payload_x').content.removed.size).toEqual(0);
    });
  });

  describe(LastWriterWinsElementSetUtils.merge, () => {
    it('should throw if payloads have different identities', () => {
      const a = getInitialPayload('payload_x');
      const b = getInitialPayload('payload_y');
      expect(() => merge(a, b)).toThrow();
    });

    it('should be commutative', () => {
      const a = add(getInitialPayload('payload_x'), 'meow');
      const b = add(getInitialPayload('payload_x'), 'woof');

      const mergedAB = merge(a, b);
      const mergedBA = merge(b, a);

      // White box - should we even assert for this?
      expect(mergedAB).toEqual(mergedBA);
      // Black box
      expect(compare(mergedAB, mergedBA)).toBe(true);
    });

    it('should be associative', () => {
      const a = add(getInitialPayload('payload_x'), 'meow');
      const b = add(getInitialPayload('payload_x'), 'woof');
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
      const b = add(getInitialPayload('payload_x'), 'woof');

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

  describe(LastWriterWinsElementSetUtils.compare, () => {
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
      expect(compare(a, b)).toBe(false);
    });

    it('should return false if payloads have at least 1 mismatch element', () => {
      const a = getInitialPayload('payload_x');
      const b = add(getInitialPayload('payload_x'), 'woof');
      expect(compare(a, b)).toBe(false);
    });
  });

  describe(LastWriterWinsElementSetUtils.add, () => {
    it('should add element', () => {
      const a = getInitialPayload('payload_x');
      expect(has(add(a, 'meow'), 'meow')).toBe(true);
    });

    it('should add previously-removed element', () => {
      const a = remove(add(getInitialPayload('payload_x'), 'meow'), 'meow');
      expect(has(a, 'meow')).toBe(false);
      expect(has(add(a, 'meow'), 'meow')).toBe(true);
    });
  });

  describe(LastWriterWinsElementSetUtils.remove, () => {
    it('should remove element', () => {
      const a = add(getInitialPayload('payload_x'), 'meow');
      expect(has(remove(a, 'meow'), 'meow')).toBe(false);
    });

    it('should remove previously-added element', () => {
      const a = add(remove(getInitialPayload('payload_x'), 'meow'), 'meow');
      expect(has(a, 'meow')).toBe(true);
      expect(has(remove(a, 'meow'), 'meow')).toBe(false);
    });
  });
});
