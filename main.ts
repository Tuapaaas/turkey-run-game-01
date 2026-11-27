// main.ts — Turkey Run entry program (Node 22, stdlib only, no network).
// Copies game/ and screenshots/ from this repository to the output
// directory and writes /output/dossier.json with buildDossier from the
// kit's vendor/makefun-game.ts, exactly as the bounty requires.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function handIn() {
  mkdirSync(OUT_DIR, { recursive: true });
  // Empty only the handed-in subdirectories, never the output dir itself
  // (the grader mounts it: removing it would fail the run).
  for (const name of ['game', 'screenshots']) {
    const target = join(OUT_DIR, name);
    if (existsSync(target)) rmSync(target, { recursive: true, force: true });
    cpSync(join(REPO_ROOT, name), target, { recursive: true });
  }
  const dossier = buildDossier(OUT_DIR, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  writeFileSync(join(OUT_DIR, 'dossier.json'), dossier);
  // Self-check: the dossier must be exactly what buildDossier writes
  // from the handed-in files, or the gate's dossier_matches row fails.
  const rebuilt = buildDossier(OUT_DIR, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  if (!Buffer.from(rebuilt).equals(Buffer.from(dossier))) {
    throw new Error('dossier self-check failed: rebuilt dossier differs');
  }
  console.log(`handed in Turkey Run to ${OUT_DIR} (dossier ${dossier.length} bytes)`);
}

handIn();
