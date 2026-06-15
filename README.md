# Scanline Synth

Scanline Synth is a browser-based synthesizer that turns image data into playable sound.

It reads the horizontal rows of an image as single-cycle waveforms, lets you play those waveforms from your computer keyboard, a connected MIDI controller, or the on-screen piano, and shapes the result with multiple playback modes and live controls.

## Try it

[scanline-synthesizer](https://mathemaudio.github.io/scanline-synthesizer/)

## What it does

- Plays notes from a QWERTY keyboard layout
- Supports Web MIDI note input from connected MIDI keyboards and controllers
- Supports on-screen piano interaction with pointer dragging
- Loads a default synth image on startup
- Lets you upload your own image and convert each row into a waveform
- Switches between three playback modes:
  - **Raw**: direct waveform playback
  - **Cutoff**: waveform playback through a filter ADSR shape
  - **Pluck**: Karplus-Strong style string/pluck synthesis
- Supports **monophonic** and **polyphonic** behavior
- Includes **portamento**, **filter controls**, **chorus**, **delay**, **waveform crossfade**, and **row randomness**
- Shows visual previews for the uploaded image and selected waveform row

## Core idea

Each horizontal line of an image becomes one waveform.

That means visual texture turns into timbre:

- brighter/darker patterns affect the waveform shape
- different rows create different tones
- switching rows changes the sound color
- crossfading and row randomization make the instrument feel more alive

## Tech stack

- **LLLTS**
- **Lit** for UI rendering
- **Vite** for local development and bundling
- **Web Audio API** for synthesis

## GitHub Pages deployment

The site is deployed with GitHub Actions from `.github/workflows/deploy-pages.yml`.

Important note:
- GitHub Pages itself does **not** need the `.lll/` folder.
- The earlier CI failure happened because `client/package.json` includes a local development dependency:
  - `lllts: file:../.lll/vendor/lllts`
- On GitHub Actions, that ignored local folder does not exist, so `pnpm install` failed before the website build started.
- The workflow now removes that local-only dependency in CI before installing packages, so Pages can build the static site without `.lll/vendor/lllts`.

## Getting started

### Requirements

- Node.js
- pnpm

## Controls and features

### Keyboard input

The synth maps a section of the computer keyboard to chromatic notes, similar to many software synths.

It also includes visible keyboard guides so the musical layout is easy to follow.

### MIDI input

Scanline Synth also listens for **Web MIDI** note input when your browser and device support it.

- Connect a MIDI keyboard or pad controller before or after opening the app.
- The app automatically listens for note-on and note-off messages from connected inputs.
- MIDI notes are merged with QWERTY-held notes, so either input path can drive the same synth engine.
- The active note card will show **MIDI** as the key source when the most recent note came from a MIDI device.

Web MIDI support depends on browser support and user/device permissions.

### Playback modes

#### Raw

Plays the current waveform directly with minimal shaping.

#### Cutoff

Routes the waveform through a low-pass filter with ADSR-style cutoff control. This is the default mode and gives the instrument its more animated synth behavior.

#### Pluck

Uses a Karplus-Strong inspired pluck/string model for a more percussive, string-like response.

### Image waveform synthesis

When an image is loaded:

- each horizontal row is sampled from canvas pixel data
- luminance is converted into waveform values
- the row is normalized into a usable audio range
- the selected row becomes the synth waveform source

### Live sound shaping

The app includes controls for:

- monophonic mode
- portamento
- filter attack, decay, sustain, release, cutoff, resonance
- chorus mix, feedback, and depth
- delay mix, feedback, and time
- pluck damping, brightness, and noise blend
- waveform seam crossfade
- waveform row randomness

## Notes

- The app depends on browser audio support through the Web Audio API.
- Web MIDI input requires a browser that supports the Web MIDI API and may prompt for MIDI-device permission.
- Some browser autoplay restrictions may require a user interaction before audio starts.
- A default image is loaded so the synth is immediately playable without upload.

## Why the name “Scanline Synth”?

Because the instrument treats image scanlines as sound-generating waveforms. Visual rows become audio cycles.

