// Records the course's English with OpenAI text-to-speech, so the page sounds the same on every device
// instead of depending on the voices each browser has installed.
//
//   OPENAI_API_KEY=... node scripts/ingilizce/generate-audio.mjs
//   node scripts/ingilizce/generate-audio.mjs --dry-run      (lists what would be recorded)
//
// Clips go to public/audio/ingilizce/ next to a manifest.json that maps each text to its file. Clips
// already there are kept, so a later run only records new or changed lines.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = join(root, 'app/araclar/ingilizce');
const out = join(root, 'public/audio/ingilizce');
const manifestPath = join(out, 'manifest.json');

const model = process.env.OPENAI_TTS_MODEL ?? 'gpt-4o-mini-tts';
const voice = process.env.OPENAI_TTS_VOICE ?? 'coral';
const instructions =
  'Speak clear, warm and cheerful American English for a young child who is learning English. ' +
  'Use a gentle, slightly slow pace and natural intonation.';
const dryRun = process.argv.includes('--dry-run');
const PARALLEL = 4;

// The course is TypeScript: transpile its data modules into a temporary folder and import them
async function loadCourse() {
  const dir = mkdtempSync(join(tmpdir(), 'ingilizce-'));
  try {
    for (const name of ['course', 'stories', 'sounds']) {
      const { outputText } = ts.transpileModule(readFileSync(join(source, `${name}.ts`), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      });
      writeFileSync(join(dir, `${name}.mjs`), outputText.replace(/from '\.\/(\w+)'/g, "from './$1.mjs'"));
    }
    const load = (name) => import(pathToFileURL(join(dir, `${name}.mjs`)).href);
    const [course, stories, sounds] = await Promise.all([load('course'), load('stories'), load('sounds')]);
    return { ...course, ...stories, ...sounds };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Every English line the page reads out with fixed text; pattern sentences are made up on the fly */
function spokenTexts({ units, stories, SOUND_PAIRS }) {
  const texts = new Set();
  for (const unit of units) {
    for (const tip of unit.tips) for (const example of tip.examples) texts.add(example.en);
    for (const lesson of unit.lessons) {
      for (const word of lesson.words) texts.add(word.en);
      for (const sentence of lesson.sentences) texts.add(sentence.en);
      for (const blank of lesson.blanks) texts.add(blank.en.replace('___', blank.answer));
    }
  }
  for (const story of stories) for (const line of story.lines) texts.add(line.en);
  for (const pair of SOUND_PAIRS) for (const word of pair.words) texts.add(word.en);
  return [...texts];
}

function fileFor(text) {
  return `${createHash('sha1').update(`${model}|${voice}|${text}`).digest('hex').slice(0, 16)}.mp3`;
}

async function record(text, key) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      response_format: 'mp3',
      // Only the gpt-* speech models take speaking instructions
      ...(model.startsWith('gpt-') ? { instructions } : {}),
    }),
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return Buffer.from(await response.arrayBuffer());
}

const texts = spokenTexts(await loadCourse());
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const missing = texts.filter((text) => !manifest[text] || !existsSync(join(out, manifest[text])));
console.log(`${texts.length} lines, ${texts.length - missing.length} already recorded, ${missing.length} to record`);

if (dryRun) {
  for (const text of missing.slice(0, 20)) console.log(`  ${text}`);
  if (missing.length > 20) console.log(`  … and ${missing.length - 20} more`);
  process.exit(0);
}

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error('Set OPENAI_API_KEY to record the clips (or pass --dry-run to only list them).');
  process.exit(1);
}

mkdirSync(out, { recursive: true });
let done = 0;
let failed = 0;
const queue = [...missing];
await Promise.all(
  Array.from({ length: PARALLEL }, async () => {
    for (let text = queue.shift(); text !== undefined; text = queue.shift()) {
      try {
        const file = fileFor(text);
        writeFileSync(join(out, file), await record(text, key));
        manifest[text] = file;
        done++;
        if (done % 20 === 0) console.log(`  ${done}/${missing.length}`);
      } catch (error) {
        failed++;
        console.error(`  failed: ${text} (${error.message})`);
      }
    }
  }),
);

// Only lines the course still uses stay in the manifest
const kept = Object.fromEntries(texts.filter((text) => manifest[text]).map((text) => [text, manifest[text]]));
writeFileSync(manifestPath, `${JSON.stringify(kept, null, 2)}\n`);
console.log(`Recorded ${done}, failed ${failed}. Manifest has ${Object.keys(kept).length} clips.`);
