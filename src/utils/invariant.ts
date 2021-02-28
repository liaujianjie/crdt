class InvariantError extends Error {}

/**
 * Throws an `InvariantError` if `condition` is `false`.
 */
export const invariant: (
  condition: boolean,
  errorMessage?: string
) => asserts condition is true = (
  condition,
  errorMessage = 'Invariant error encountered'
) => {
  if (!condition) {
    throw new InvariantError(errorMessage);
  }
};
