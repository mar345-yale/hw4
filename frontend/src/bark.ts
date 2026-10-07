/** A short, friendly "woof" synthesized with the Web Audio API — no audio file needed.
 *  Filtered noise + a pitch-dropping tone gives a dog-bark feel to match Handsome Dan. */

let ctx: AudioContext | null = null

/** Create/resume the audio context. Call from a user gesture (click) so browsers allow sound. */
export function primeAudio(): void {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    /* audio not available; ignore */
  }
}

function woof(at: number): void {
  if (!ctx) return
  const dur = 0.17

  // Noise burst, band-passed and swept downward, for the "breathy" part of the bark.
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(950, at)
  bp.frequency.exponentialRampToValueAtTime(380, at + dur)
  bp.Q.value = 1.1
  const ng = ctx.createGain()
  ng.gain.setValueAtTime(0.0001, at)
  ng.gain.exponentialRampToValueAtTime(0.85, at + 0.02)
  ng.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  noise.connect(bp).connect(ng).connect(ctx.destination)

  // Voiced tone dropping in pitch, for the "vocal cord" part.
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(330, at)
  osc.frequency.exponentialRampToValueAtTime(140, at + dur)
  const og = ctx.createGain()
  og.gain.setValueAtTime(0.0001, at)
  og.gain.exponentialRampToValueAtTime(0.45, at + 0.02)
  og.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(og).connect(ctx.destination)

  noise.start(at)
  noise.stop(at + dur)
  osc.start(at)
  osc.stop(at + dur)
}

/** Play a quick "woof-woof". */
export function playBark(): void {
  if (!ctx) return
  const now = ctx.currentTime
  woof(now)
  woof(now + 0.22)
}
