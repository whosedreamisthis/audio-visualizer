import { describe, expect, it } from 'vitest'
import { playbackAnnouncement } from './announce'

describe('playbackAnnouncement', () => {
  it('announces loaded, playing and paused with the track name', () => {
    expect(playbackAnnouncement({ status: 'ready', trackName: 'Song', error: null })).toBe('Loaded Song')
    expect(playbackAnnouncement({ status: 'playing', trackName: 'Song', error: null })).toBe('Playing Song')
    expect(playbackAnnouncement({ status: 'paused', trackName: 'Song', error: null })).toBe('Paused')
  })

  it('announces errors with their message', () => {
    expect(playbackAnnouncement({ status: 'error', trackName: null, error: 'Bad file' })).toBe('Error: Bad file')
  })

  it('stays silent when idle', () => {
    expect(playbackAnnouncement({ status: 'idle', trackName: null, error: null })).toBe('')
  })
})
