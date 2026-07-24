#!/usr/bin/env node
/**
 * Pipeline UI icons — AutoCAD-style 24×24, 3px stroke.
 * Generates SVG (currentColor + themed) and PNG via @resvg/resvg-js.
 */
const fs = require('fs');
const path = require('path');

const SIZE = 24;
const STROKE = 3;
const PRIMARY = '#484848';
const SECONDARY = '#B656FF';
/** Neutral light gray for dark-mode default (primary is too dark on dark UI). */
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

/** 3×3 grip square centered on (cx, cy) */
const grip = (cx, cy, c) =>
  `<rect x="${cx - 1.5}" y="${cy - 1.5}" width="3" height="3" rx="0.5" ${f(c)}/>`;

/**
 * Single-concept CAD metaphors. Geometry kept sparse for 3px weight.
 */
const icons = {
  'build-pipeline': {
    label: 'Build a pipeline',
    draw: (c) => `
  <path d="M3.5 18.5 L8.5 10.5 L14.5 14.5 L20.5 5.5" ${s(c)} ${none}/>
  ${grip(3.5, 18.5, c)}
  ${grip(8.5, 10.5, c)}
  ${grip(14.5, 14.5, c)}
  ${grip(20.5, 5.5, c)}`,
  },

  'add-point': {
    label: 'Add a point to the pipeline',
    draw: (c) => `
  <path d="M3.5 18.5 L10.5 8.5 L20.5 8.5" ${s(c)} ${none}/>
  ${grip(3.5, 18.5, c)}
  ${grip(20.5, 8.5, c)}
  ${grip(10.5, 8.5, c)}
  <path d="M16.5 14.5 V20.5 M13.5 17.5 H19.5" ${s(c)} ${none}/>`,
  },

  'import-pipeline': {
    label: 'Import a pipeline',
    draw: (c) => `
  <path d="M12 2.5 V10.5 M8.5 7 L12 10.5 L15.5 7" ${s(c)} ${none}/>
  <path d="M3.5 14.5 L9 20 L14.5 15.5 L20.5 20" ${s(c)} ${none}/>
  ${grip(3.5, 14.5, c)}
  ${grip(20.5, 20, c)}`,
  },

  'add-layer': {
    label: 'Add a layer to pipeline',
    draw: (c) => `
  <path d="M2.5 19 L9 14.5 L15 17.5 L21.5 12.5" ${s(c)} ${none}/>
  <path d="M2.5 10.5 L9 6 L15 9 L18 6.5" ${s(c)} ${none}/>
  <path d="M18.5 15 V21 M15.5 18 H21.5" ${s(c)} ${none}/>`,
  },

  'paste-pipeline': {
    label: 'Paste a pipeline',
    draw: (c) => `
  <rect x="5.5" y="6.5" width="13" height="14.5" rx="1.5" ${s(c)} ${none}/>
  <rect x="9" y="3.5" width="6" height="4" rx="1" ${s(c)} ${f(c)}/>
  <path d="M8.5 16 L11.5 11.5 L13.5 14 L16 10.5" ${s(c)} ${none}/>`,
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

const themes = [
  { mode: 'light', state: 'default', color: PRIMARY },
  { mode: 'light', state: 'active', color: SECONDARY },
  { mode: 'dark', state: 'default', color: DARK_DEFAULT },
  { mode: 'dark', state: 'active', color: SECONDARY },
];

async function main() {
  // drop any legacy paths
  fs.rmSync(path.join(OUT.svg, 'base'), { recursive: true, force: true });

  let Resvg = null;
  try {
    ({ Resvg } = require('@resvg/resvg-js'));
  } catch {
    console.warn('PNG skipped — install @resvg/resvg-js');
  }

  const files = [];

  for (const [name, icon] of Object.entries(icons)) {
    const baseSvg = wrap(icon.draw('currentColor'));
    write(path.join(OUT.svg, 'currentColor', `${name}.svg`), baseSvg);
    files.push(`svg/currentColor/${name}.svg`);

    for (const t of themes) {
      const svg = wrap(icon.draw(t.color));
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

  const readme = `# Pipeline icons

AutoCAD-style line-art UI icons for pipeline operations.

| Spec | Value |
|------|-------|
| Grid | 24×24 |
| Stroke | 3px, round caps & joins |
| Background | Transparent |
| Primary (light default) | \`${PRIMARY}\` |
| Secondary (active) | \`${SECONDARY}\` |
| Dark default | \`${DARK_DEFAULT}\` |

## Icons

| Name | Meaning |
|------|---------|
| \`build-pipeline\` | Build a pipeline |
| \`add-point\` | Add a point to the pipeline |
| \`import-pipeline\` | Import a pipeline |
| \`add-layer\` | Add a layer to pipeline |
| \`paste-pipeline\` | Paste a pipeline |

## Layout

\`\`\`
svg/currentColor/{name}.svg          # inherits currentColor
svg/{light|dark}/{default|active}/   # themed SVG
png/{light|dark}/{default|active}/   # 24px + @2x PNG
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
        palette: { primary: PRIMARY, secondary: SECONDARY, darkDefault: DARK_DEFAULT },
        strokePx: STROKE,
        size: SIZE,
        icons: Object.fromEntries(
          Object.entries(icons).map(([k, v]) => [k, v.label]),
        ),
        files,
      },
      null,
      2,
    ),
  );

  console.log(`Generated ${files.length} files`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
