/** Call `fn` at most once per `intervalMs`; calls in between are dropped. */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  intervalMs: number,
  now: () => number = () => performance.now(),
): (...args: A) => void {
  let last = -Infinity
  return (...args: A) => {
    const t = now()
    if (t - last >= intervalMs) {
      last = t
      fn(...args)
    }
  }
}
