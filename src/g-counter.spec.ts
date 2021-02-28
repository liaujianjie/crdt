import { GCounter } from './g-counter';

describe(GCounter, () => {
  const nodeA = { id: 'A' };
  const nodeB = { id: 'B' };

  it('should instantiate with value 0', () => {
    const replica = new GCounter(nodeA);
    expect(replica.getValue()).toBe(0);
  });

  it('should increment correctly', () => {
    const replica = new GCounter(nodeA);
    replica.increment();
    expect(replica.getValue()).toBe(1);
    replica.increment();
    replica.increment();
    expect(replica.getValue()).toBe(3);
  });

  describe(GCounter.prototype.hasEqualPayload, () => {
    it('should return true for the same replica', () => {
      const replica = new GCounter(nodeA);
      replica.increment();

      expect(replica.hasEqualPayload(replica.payload)).toBe(true);
    });

    it('should return false for different replicas that had never merged', () => {
      const replicaX = new GCounter(nodeA);
      const replicaY = new GCounter(nodeB);
      replicaX.increment();
      replicaY.increment();

      expect(replicaX.hasEqualPayload(replicaY.payload)).toBe(false);
    });

    it('should return false for different replicas for which only one had merged', () => {
      const replicaX = new GCounter(nodeA);
      const replicaY = new GCounter(nodeB);
      replicaX.increment();
      replicaY.increment();

      replicaX.merge(replicaY.payload);
      expect(replicaX.hasEqualPayload(replicaY.payload)).toBe(false);
      expect(replicaY.hasEqualPayload(replicaX.payload)).toBe(false);
    });

    it('should return false for different replicas when both are merged', () => {
      const replicaX = new GCounter(nodeA);
      const replicaY = new GCounter(nodeB);
      replicaX.increment();
      replicaY.increment();

      replicaX.merge(replicaY.payload);
      replicaY.merge(replicaX.payload);
      expect(replicaX.hasEqualPayload(replicaY.payload)).toBe(true);
      expect(replicaY.hasEqualPayload(replicaX.payload)).toBe(true);
    });
  });
});
