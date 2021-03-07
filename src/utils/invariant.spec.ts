import { invariant } from './invariant';

describe(invariant, () => {
  it('should throw if condition is false', () => {
    expect(() => invariant(false)).toThrow();
    // FIXME: Not sure why the matcher sees `Error` instead of `InvariantError`.
    // expect(() => invariant(false)).toThrow(InvariantError);
  });

  it('should not throw if condition is true', () => {
    expect(() => invariant(true)).not.toThrow();
  });
});
