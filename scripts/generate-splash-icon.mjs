import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const FONT_PATH = resolve(
  ROOT,
  'node_modules/@expo-google-fonts/onest/400Regular/Onest_400Regular.ttf',
)
const OUTPUT_PATH = resolve(ROOT, 'assets/images/splash-icon.png')

const SIZE = 1024
const FONT_SIZE = 154
const TEXT = 'clip2fit'
const COLOR = '#bef264'

GlobalFonts.registerFromPath(FONT_PATH, 'Onest')

const canvas = createCanvas(SIZE, SIZE)
const ctx = canvas.getContext('2d')

// Transparent background (default)
ctx.clearRect(0, 0, SIZE, SIZE)

ctx.font = `${FONT_SIZE}px Onest`
ctx.fillStyle = COLOR
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText(TEXT, SIZE / 2, SIZE / 2)

const buffer = canvas.toBuffer('image/png')
writeFileSync(OUTPUT_PATH, buffer)

console.log(`Splash icon generated: ${OUTPUT_PATH}`)
