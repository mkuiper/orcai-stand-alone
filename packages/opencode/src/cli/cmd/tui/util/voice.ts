import { tmpdir } from "os"
import path from "path"
import { Log } from "@/util/log"

const log = Log.create({ service: "voice" })

type VoiceConfig = {
  enabled: boolean
  autoSend: boolean
  talkback: boolean
  apiKey?: string
  voiceId?: string
  modelId?: string
  outputFormat?: string
  sttModelId?: string
}

type Recorder = {
  cmd: string
  args: (file: string) => string[]
}

type Player = {
  cmd: string
  args: (file: string) => string[]
}

const recorders: Recorder[] = [
  {
    cmd: "ffmpeg",
    args: (file) => ["-y", "-f", "alsa", "-i", "default", "-ac", "1", "-ar", "16000", file],
  },
  {
    cmd: "arecord",
    args: (file) => ["-f", "S16_LE", "-c", "1", "-r", "16000", file],
  },
]

const players: Player[] = [
  {
    cmd: "ffplay",
    args: (file) => ["-autoexit", "-nodisp", file],
  },
  {
    cmd: "mpg123",
    args: (file) => [file],
  },
  {
    cmd: "paplay",
    args: (file) => [file],
  },
  {
    cmd: "aplay",
    args: (file) => [file],
  },
]

function pickRecorder() {
  for (const item of recorders) {
    if (Bun.which(item.cmd)) return item
  }
}

function pickPlayer() {
  for (const item of players) {
    if (Bun.which(item.cmd)) return item
  }
}

function resolveApiKey() {
  return Bun.env.ORCAI_ELEVENLABS_API_KEY || Bun.env.ELEVENLABS_API_KEY
}

function resolveVoiceId() {
  return Bun.env.ORCAI_ELEVENLABS_VOICE_ID || Bun.env.ELEVENLABS_VOICE_ID
}

export function getVoiceConfig(input: {
  enabled?: boolean
  autoSend?: boolean
  talkback?: boolean
  voiceId?: string
  modelId?: string
  outputFormat?: string
  sttModelId?: string
}) {
  return {
    enabled: input.enabled ?? true,
    autoSend: input.autoSend ?? true,
    talkback: input.talkback ?? true,
    apiKey: resolveApiKey(),
    voiceId: input.voiceId || resolveVoiceId(),
    modelId: input.modelId,
    outputFormat: input.outputFormat,
    sttModelId: input.sttModelId,
  } satisfies VoiceConfig
}

export async function startRecording() {
  const recorder = pickRecorder()
  if (!recorder) {
    return { error: "No audio recorder found (ffmpeg or arecord)." }
  }
  const file = path.join(tmpdir(), `orcai-ptt-${Date.now()}.wav`)
  const proc = Bun.spawn([recorder.cmd, ...recorder.args(file)], {
    stdout: "ignore",
    stderr: "ignore",
  })
  return { proc, file }
}

export async function stopRecording(proc?: Bun.Subprocess) {
  if (!proc) return
  proc.kill("SIGINT")
  await proc.exited
}

export async function transcribe(file: string, cfg: VoiceConfig) {
  if (!cfg.apiKey) return { error: "Missing ElevenLabs API key." }
  const form = new FormData()
  form.append("model_id", cfg.sttModelId || "scribe_v1")
  form.append("file", Bun.file(file))
  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": cfg.apiKey,
    },
    body: form,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    log.error("transcribe failed", { status: res.status, body })
    return { error: "Speech-to-text request failed." }
  }
  const json = (await res.json()) as { text?: string }
  if (!json.text) return { error: "No transcript returned." }
  return { text: json.text }
}

export async function speak(text: string, cfg: VoiceConfig) {
  if (!cfg.apiKey) return { error: "Missing ElevenLabs API key." }
  if (!cfg.voiceId) return { error: "Missing ElevenLabs voice ID." }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${cfg.voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": cfg.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: cfg.modelId || "eleven_multilingual_v2",
      output_format: cfg.outputFormat || "mp3_44100_128",
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    log.error("tts failed", { status: res.status, body })
    return { error: "Text-to-speech request failed." }
  }
  const buf = await res.arrayBuffer()
  const file = path.join(tmpdir(), `orcai-tts-${Date.now()}.mp3`)
  await Bun.write(file, Buffer.from(buf))
  return { file }
}

export async function play(file: string) {
  const player = pickPlayer()
  if (!player) return { error: "No audio player found (ffplay, mpg123, paplay, aplay)." }
  const proc = Bun.spawn([player.cmd, ...player.args(file)], {
    stdout: "ignore",
    stderr: "ignore",
  })
  return { proc }
}

export async function stopPlayback(proc?: Bun.Subprocess) {
  if (!proc) return
  proc.kill("SIGINT")
  await proc.exited
}
