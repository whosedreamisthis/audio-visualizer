import { describe, expect, it } from 'vitest'
import { mapKeyToAction, type KeyInput } from './shortcuts'

const press = (key: string, extra: Partial<KeyInput> = {}): KeyInput => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  target: { tag: 'BODY' },
  ...extra,
})

describe('mapKeyToAction', () => {
  it('maps every shortcut key', () => {
    expect(mapKeyToAction(press(' '))).toBe('togglePlay')
    expect(mapKeyToAction(press('ArrowLeft'))).toBe('seekBack')
    expect(mapKeyToAction(press('ArrowRight'))).toBe('seekForward')
    expect(mapKeyToAction(press('ArrowUp'))).toBe('volumeUp')
    expect(mapKeyToAction(press('ArrowDown'))).toBe('volumeDown')
    expect(mapKeyToAction(press('m'))).toBe('toggleMute')
    expect(mapKeyToAction(press('l'))).toBe('toggleLoop')
    expect(mapKeyToAction(press('f'))).toBe('toggleFullscreen')
    expect(mapKeyToAction(press('1'))).toBe('modeWaveform')
    expect(mapKeyToAction(press('2'))).toBe('modeBars')
    expect(mapKeyToAction(press('3'))).toBe('modeParticles')
    expect(mapKeyToAction(press('?'))).toBe('toggleHelp')
    expect(mapKeyToAction(press('p'))).toBe('toggleFps')
  })

  it('is case-insensitive for letters', () => {
    expect(mapKeyToAction(press('M'))).toBe('toggleMute')
    expect(mapKeyToAction(press('F'))).toBe('toggleFullscreen')
  })

  it('ignores unmapped keys', () => {
    expect(mapKeyToAction(press('x'))).toBeNull()
    expect(mapKeyToAction(press('Enter'))).toBeNull()
    expect(mapKeyToAction(press('4'))).toBeNull()
  })

  it('ignores keys while typing', () => {
    for (const target of [
      { tag: 'INPUT', type: 'text' },
      { tag: 'INPUT' },
      { tag: 'TEXTAREA' },
      { tag: 'SELECT' },
      { tag: 'DIV', isContentEditable: true },
    ]) {
      expect(mapKeyToAction(press('m', { target }))).toBeNull()
      expect(mapKeyToAction(press(' ', { target }))).toBeNull()
    }
  })

  it('ignores keys when a modifier is held', () => {
    expect(mapKeyToAction(press('f', { ctrlKey: true }))).toBeNull()
    expect(mapKeyToAction(press('l', { metaKey: true }))).toBeNull()
    expect(mapKeyToAction(press('ArrowLeft', { altKey: true }))).toBeNull()
  })

  it('leaves Space to a focused button so it does not fire twice', () => {
    expect(mapKeyToAction(press(' ', { target: { tag: 'BUTTON' } }))).toBeNull()
    expect(mapKeyToAction(press(' ', { target: { tag: 'DIV', role: 'tab' } }))).toBeNull()
    expect(mapKeyToAction(press('m', { target: { tag: 'BUTTON' } }))).toBe('toggleMute')
  })

  it('leaves arrow keys to a focused slider but keeps other shortcuts', () => {
    const range = { tag: 'INPUT', type: 'range' }
    expect(mapKeyToAction(press('ArrowRight', { target: range }))).toBeNull()
    expect(mapKeyToAction(press('ArrowUp', { target: { tag: 'SPAN', role: 'slider' } }))).toBeNull()
    expect(mapKeyToAction(press('m', { target: range }))).toBe('toggleMute')
  })
})
