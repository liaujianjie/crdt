class InvariantError extends Error {}

export function invariant(condition: boolean, errorMessage: string) {
  if (!condition) {
    throw new InvariantError(errorMessage);
  }
}
