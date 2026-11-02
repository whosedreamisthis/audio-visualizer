import { describe, expect, it, vi } from 'vitest'
import { throttle } from './throttle'

describe('throttle', () => {
  it('calls immediately, then at most once per interval', () => {
    let time = 0
    const fn = vi.fn()
    const throttled = throttle(fn, 100, () => time)

    throttled(1)
    time = 50
    throttled(2)
    time = 99
    throttled(3)
    time = 100
    throttled(4)

    expect(fn.mock.calls).toEqual([[1], [4]])
  })

  it('passes all arguments through', () => {
    const fn = vi.fn()
    throttle(fn, 10, () => 0)('a', 2)
    expect(fn).toHaveBeenCalledWith('a', 2)
  })
})
