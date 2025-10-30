export function assertDefined<T>(value: T | null | undefined, msg = "Unexpected null"): asserts value is T {
  if (value == null) throw new Error(msg)
}

export const isNonEmptyArray = <T,>(x: T[] | undefined | null): x is T[] => Array.isArray(x) && x.length > 0
