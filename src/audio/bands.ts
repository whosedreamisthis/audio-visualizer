import { BAND_RANGES_HZ } from '@/lib/constants'
import type { BandEnergy } from '@/types'

/** Frequency in Hz at the center of FFT bin `bin`. */
export function binToFrequency(
  bin: number,
  sampleRate: number,
  fftSize: number,
): number {
  return (bin * sampleRate) / fftSize
}

/** Index of the FFT bin containing `frequency` Hz. */
export function frequencyToBin(
  frequency: number,
  sampleRate: number,
  fftSize: number,
): number {
  return Math.floor((frequency * fftSize) / sampleRate)
}

/**
 * Average energy (0..1) of the bins covering [lowHz, highHz).
 * Always uses at least one bin; returns 0 for invalid input.
 */
export function rangeEnergy(
  freq: Uint8Array,
  sampleRate: number,
  fftSize: number,
  lowHz: number,
  highHz: number,
): number {
  if (freq.length === 0 || sampleRate <= 0 || fftSize <= 0) return 0

  const binHz = sampleRate / fftSize
  const start = Math.min(freq.length - 1, Math.max(0, Math.floor(lowHz / binHz)))
  const end = Math.min(
    freq.length,
    Math.max(start + 1, Math.ceil(highHz / binHz)),
  )

  let sum = 0
  for (let i = start; i < end; i++) sum += freq[i]
  return sum / ((end - start) * 255)
}

/** Write bass, mid, treble and overall energy (each 0..1) into `out` without allocating. */
export function writeBandEnergy(
  out: BandEnergy,
  freq: Uint8Array,
  sampleRate: number,
  fftSize: number,
): BandEnergy {
  const { bass, mid, treble } = BAND_RANGES_HZ
  out.bass = rangeEnergy(freq, sampleRate, fftSize, bass[0], bass[1])
  out.mid = rangeEnergy(freq, sampleRate, fftSize, mid[0], mid[1])
  out.treble = rangeEnergy(freq, sampleRate, fftSize, treble[0], treble[1])
  out.level = rangeEnergy(freq, sampleRate, fftSize, bass[0], treble[1])
  return out
}

/** Bass, mid, treble and overall energy (each 0..1) from byte frequency data. */
export function getBandEnergy(
  freq: Uint8Array,
  sampleRate: number,
  fftSize: number,
): BandEnergy {
  return writeBandEnergy(
    { bass: 0, mid: 0, treble: 0, level: 0 },
    freq,
    sampleRate,
    fftSize,
  )
}
