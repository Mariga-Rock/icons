#!/usr/bin/env node
/**
 * Pipeline + special-line UI icons — Comsol-inspired, lite 24×24, 2px stroke.
 * Default: two-color (body + obligatory #B656FF accent).
 * Active: full #B656FF.
 */
const fs = require('fs');
const path = require('path');

const SIZE = 24;
const STROKE = 2;
const PRIMARY = '#484848';
const SECONDARY = '#B656FF';
const DARK_DEFAULT = '#D0D0D0';

const ROOT = __dirname;
const OUT = {
  svg: path.join(ROOT, 'svg'),
  png: path.join(ROOT, 'png'),
};

const s = (c) =>
  `stroke="${c}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"`;
const none = `fill="none"`;
const f = (c) => `fill="${c}"`;

/** Pipeline grip (square) */
const grip = (cx, cy, c, size = 2.5) => {
  const h = size / 2;
  return `<rect x="${cx - h}" y="${cy - h}" width="${size}" height="${size}" rx="0.35" ${f(c)}/>`;
};

/** Special-line node (circle) */
const node = (cx, cy, c, r = 1.6) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" ${f(c)}/>`;

/** Shared “special line” path (softer geometry) */
const specialLine = (c) =>
  `<path d="M3 18 C7 18 8 8 12 8 C16 8 17 16 21 6" ${s(c)} ${none}/>`;

/** Shared “pipeline” path (angular) */
const pipeline = (c) =>
  `<path d="M3 18 L8 10 L14 14 L21 5" ${s(c)} ${none}/>`;

/** NEW add-layer mark: compact layer stack (3 bars), not double zigzag */
const layerStack = (x, y, c) => `
  <path d="M${x} ${y} H${x + 6}" ${s(c)} ${none}/>
  <path d="M${x} ${y + 3.5} H${x + 6}" ${s(c)} ${none}/>
  <path d="M${x} ${y + 7} H${x + 6}" ${s(c)} ${none}/>`;

const plus = (cx, cy, c, arm = 3) =>
  `<path d="M${cx} ${cy - arm} V${cy + arm} M${cx - arm} ${cy} H${cx + arm}" ${s(c)} ${none}/>`;

/**
 * @param {{ primary: string, accent: string }} colors
 */
const icons = {
  'pipeline-add-element': {
    label: 'Add an element to a pipeline',
    draw: ({ primary, accent }) => `
  <!-- existing pipeline -->
  <path d="M3 17 L8 9 L13 13" ${s(primary)} ${none}/>
  ${grip(3, 17, primary)}
  ${grip(13, 13, primary)}
  <!-- similar part being added (same angular language) -->
  <path d="M13 13 L18 8 L21 11" ${s(accent)} ${none}/>
  ${grip(18, 8, accent)}
  ${grip(21, 11, accent)}`,
  },

  'special-line-add-element': {
    label: 'Add an element to a special line',
    draw: ({ primary, accent }) => `
  <!-- existing special line -->
  <path d="M3 17 C7 17 8 8 12 9" ${s(primary)} ${none}/>
  ${node(3, 17, primary)}
  ${node(12, 9, primary)}
  <!-- similar curve segment being added -->
  <path d="M12 9 C15 10 17 16 21 7" ${s(accent)} ${none}/>
  ${node(21, 7, accent)}`,
  },

  'pipeline-add-point': {
    label: 'Add a point to the special pipeline',
    draw: ({ primary, accent }) => `
  ${pipeline(primary)}
  ${grip(3, 18, primary)}
  ${grip(21, 5, primary)}
  ${grip(8, 10, accent, 3)}
  ${plus(17.5, 18, accent, 2.75)}`,
  },

  'special-line-add-point': {
    label: 'Add a point to the special line',
    draw: ({ primary, accent }) => `
  ${specialLine(primary)}
  ${node(3, 18, primary)}
  ${node(21, 6, primary)}
  <circle cx="12" cy="8" r="2.6" ${s(accent)} ${none}/>
  ${plus(17.5, 18, accent, 2.75)}`,
  },

  'pipeline-import': {
    label: 'Import a pipeline',
    draw: ({ primary, accent }) => `
  <path d="M12 2.5 V10 M8.5 6.5 L12 10 L15.5 6.5" ${s(accent)} ${none}/>
  <path d="M3 15 L8 20 L14 15.5 L21 19.5" ${s(primary)} ${none}/>
  ${grip(3, 15, accent)}
  ${grip(21, 19.5, accent)}`,
  },

  'special-line-import': {
    label: 'Import a special line',
    draw: ({ primary, accent }) => `
  <path d="M12 2.5 V10 M8.5 6.5 L12 10 L15.5 6.5" ${s(accent)} ${none}/>
  <path d="M3 16 C7 20 10 13 14 16 C17 18.5 19 15 21 18" ${s(primary)} ${none}/>
  ${node(3, 16, accent)}
  ${node(21, 18, accent)}`,
  },

  'pipeline-add-layer': {
    label: 'Add a layer to the pipeline',
    draw: ({ primary, accent }) => `
  <path d="M3 12 L8 6 L13 10 L18 4" ${s(primary)} ${none}/>
  ${grip(3, 12, primary)}
  ${grip(18, 4, primary)}
  ${layerStack(15.5, 13, accent)}`,
  },

  'special-line-add-layer': {
    label: 'Add a layer to special line',
    draw: ({ primary, accent }) => `
  <path d="M3 13 C7 13 8 5 12 5 C15 5 16 11 18 5" ${s(primary)} ${none}/>
  ${node(3, 13, primary)}
  ${node(18, 5, primary)}
  ${layerStack(15.5, 13, accent)}`,
  },

  'pipeline-paste': {
    label: 'Paste a pipeline from clipboard',
    draw: ({ primary, accent }) => `
  <!-- open clipboard: sides + top only, no bottom -->
  <path d="M7 19.5 V8 H17 V19.5" ${s(primary)} ${none}/>
  <path d="M9.5 8 V5.5 H14.5 V8" ${s(primary)} ${none}/>
  <path d="M9.5 14.5 L12 11 L13.5 12.5 L15.5 10" ${s(accent)} ${none}/>`,
  },

  'special-line-paste': {
    label: 'Paste a special line from clipboard',
    draw: ({ primary, accent }) => `
  <path d="M7 19.5 V8 H17 V19.5" ${s(primary)} ${none}/>
  <path d="M9.5 8 V5.5 H14.5 V8" ${s(primary)} ${none}/>
  <path d="M9.5 14.5 C11 14.5 11.5 11 13 11 C14.5 11 14.5 13.5 15.5 10.5" ${s(accent)} ${none}/>`,
  },
};

function wrap(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" fill="none" aria-hidden="true">
${inner}
</svg>
`;
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function write(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, data);
}

function walkDirs(dir) {
  const out = [dir];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) out.push(...walkDirs(path.join(dir, ent.name)));
  }
  return out;
}

const themes = [
  { mode: 'light', state: 'default', primary: PRIMARY, accent: SECONDARY },
  { mode: 'light', state: 'active', primary: SECONDARY, accent: SECONDARY },
  { mode: 'dark', state: 'default', primary: DARK_DEFAULT, accent: SECONDARY },
  { mode: 'dark', state: 'active', primary: SECONDARY, accent: SECONDARY },
];

async function main() {
  fs.rmSync(path.join(OUT.svg, 'base'), { recursive: true, force: true });

  let Resvg = null;
  try {
    ({ Resvg } = require('@resvg/resvg-js'));
  } catch {
    console.warn('PNG skipped — install @resvg/resvg-js');
  }

  const files = [];
  const keep = new Set(Object.keys(icons));

  for (const [name, icon] of Object.entries(icons)) {
    const baseSvg = wrap(
      icon.draw({ primary: 'currentColor', accent: SECONDARY }),
    );
    write(path.join(OUT.svg, 'currentColor', `${name}.svg`), baseSvg);
    files.push(`svg/currentColor/${name}.svg`);

    for (const t of themes) {
      const svg = wrap(icon.draw({ primary: t.primary, accent: t.accent }));
      const svgRel = `${t.mode}/${t.state}/${name}.svg`;
      write(path.join(OUT.svg, svgRel), svg);
      files.push(`svg/${svgRel}`);

      if (Resvg) {
        for (const px of [SIZE, SIZE * 2]) {
          const png = new Resvg(svg, {
            fitTo: { mode: 'width', value: px },
            background: 'rgba(0,0,0,0)',
          })
            .render()
            .asPng();
          const suffix = px === SIZE ? '' : `@${px / SIZE}x`;
          const pngRel = `${t.mode}/${t.state}/${name}${suffix}.png`;
          write(path.join(OUT.png, pngRel), png);
          files.push(`png/${pngRel}`);
        }
      }
    }
  }

  // Remove obsolete icon files from earlier sets
  for (const root of [OUT.svg, OUT.png]) {
    if (!fs.existsSync(root)) continue;
    for (const dir of walkDirs(root)) {
      for (const file of fs.readdirSync(dir)) {
        const base = file.replace(/(@2x)?\.(svg|png)$/, '');
        if (base && !keep.has(base) && /\.(svg|png)$/.test(file)) {
          fs.unlinkSync(path.join(dir, file));
        }
      }
    }
  }

  const readme = `# Pipeline & special-line icons

Lite Comsol Multiphysics–inspired line-art UI icons (24×24, 2px).

| Spec | Value |
|------|-------|
| Grid | 24×24 |
| Stroke | 2px, round caps & joins |
| Background | Transparent |
| Primary (light body) | \`${PRIMARY}\` |
| Accent (obligatory in default) | \`${SECONDARY}\` |
| Dark body | \`${DARK_DEFAULT}\` |
| Active | full \`${SECONDARY}\` |

**Visual language**
- **Pipeline** — angular polyline + square grips
- **Special line** — soft curve + circular nodes
- **Add element** — matching continuation segment in accent (same visual language)
- **Add layer** — 3-bar layer stack accent
- **Paste** — light open clipboard + sparse inner path

## Icons (10)

| # | File | Meaning |
|---|------|---------|
| 1 | \`pipeline-add-element\` | Add an element to a pipeline |
| 2 | \`special-line-add-element\` | Add an element to a special line |
| 3 | \`pipeline-add-point\` | Add a point to the special pipeline |
| 4 | \`special-line-add-point\` | Add a point to the special line |
| 5 | \`pipeline-import\` | Import a pipeline |
| 6 | \`special-line-import\` | Import a special line |
| 7 | \`pipeline-add-layer\` | Add a layer to the pipeline |
| 8 | \`special-line-add-layer\` | Add a layer to special line |
| 9 | \`pipeline-paste\` | Paste a pipeline from clipboard |
| 10 | \`special-line-paste\` | Paste a special line from clipboard |

## Layout

\`\`\`
svg/currentColor/{name}.svg          # currentColor body + #B656FF accent
svg/{light|dark}/{default|active}/
png/{light|dark}/{default|active}/   # 24px + @2x
\`\`\`

## Regenerate

\`\`\`bash
npm install
node generate.js
\`\`\`
`;

  write(path.join(ROOT, 'README.md'), readme);
  write(
    path.join(ROOT, 'manifest.json'),
    JSON.stringify(
      {
        palette: {
          primary: PRIMARY,
          secondary: SECONDARY,
          darkDefault: DARK_DEFAULT,
        },
        strokePx: STROKE,
        size: SIZE,
        twoColorDefault: true,
        style: 'Comsol Multiphysics (lite)',
        icons: Object.fromEntries(
          Object.entries(icons).map(([k, v]) => [k, v.label]),
        ),
        files,
      },
      null,
      2,
    ),
  );

  console.log(`Generated ${files.length} files (${keep.size} icons)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
