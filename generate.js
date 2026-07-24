#!/usr/bin/env node
/**
 * Pipeline UI icons — AutoCAD-style 24×24, 2px stroke, two-color defaults.
 * Default: primary gray + obligatory #B656FF accent.
 * Active: full #B656FF.
 * Generates SVG (currentColor + themed) and PNG via @resvg/resvg-js.
 */
const fs = require('fs');
const path = require('path');

const SIZE = 24;
const STROKE = 2;
const PRIMARY = '#484848';
const SECONDARY = '#B656FF';
/** Readable neutral for dark-mode default body strokes. */
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

/** Filled grip square (AutoCAD-style) centered on (cx, cy) */
const grip = (cx, cy, c, size = 2.5) => {
  const h = size / 2;
  return `<rect x="${cx - h}" y="${cy - h}" width="${size}" height="${size}" rx="0.4" ${f(c)}/>`;
};

/**
 * Two-color CAD metaphors.
 * @param {{ primary: string, accent: string }} colors
 *   primary = body / structure, accent = #B656FF action cue (always required in default)
 */
const icons = {
  'build-pipeline': {
    label: 'Build a pipeline',
    draw: ({ primary, accent }) => `
  <path d="M3.5 18.5 L8.5 10.5 L14.5 14.5 L20.5 5.5" ${s(primary)} ${none}/>
  ${grip(3.5, 18.5, accent)}
  ${grip(8.5, 10.5, accent)}
  ${grip(14.5, 14.5, accent)}
  ${grip(20.5, 5.5, accent)}`,
  },

  'add-point': {
    label: 'Add a point to the pipeline',
    draw: ({ primary, accent }) => `
  <path d="M3.5 18.5 L10.5 8.5 L20.5 8.5" ${s(primary)} ${none}/>
  ${grip(3.5, 18.5, primary)}
  ${grip(20.5, 8.5, primary)}
  ${grip(10.5, 8.5, accent, 3)}
  <path d="M16.5 14.5 V20.5 M13.5 17.5 H19.5" ${s(accent)} ${none}/>`,
  },

  'import-pipeline': {
    label: 'Import a pipeline',
    draw: ({ primary, accent }) => `
  <path d="M12 2.5 V10.5 M8.5 7 L12 10.5 L15.5 7" ${s(accent)} ${none}/>
  <path d="M3.5 14.5 L9 20 L14.5 15.5 L20.5 20" ${s(primary)} ${none}/>
  ${grip(3.5, 14.5, accent)}
  ${grip(20.5, 20, accent)}`,
  },

  'add-layer': {
    label: 'Add a layer to pipeline',
    draw: ({ primary, accent }) => `
  <path d="M2.5 19 L9 14.5 L15 17.5 L21.5 12.5" ${s(primary)} ${none}/>
  <path d="M2.5 10.5 L9 6 L15 9 L18 6.5" ${s(accent)} ${none}/>
  <path d="M18.5 15 V21 M15.5 18 H21.5" ${s(accent)} ${none}/>`,
  },

  'paste-pipeline': {
    label: 'Paste a pipeline',
    draw: ({ primary, accent }) => `
  <rect x="5.5" y="6.5" width="13" height="14.5" rx="1.5" ${s(primary)} ${none}/>
  <rect x="9" y="3.5" width="6" height="4" rx="1" ${s(primary)} ${f(primary)}/>
  <path d="M8.5 16 L11.5 11.5 L13.5 14 L16 10.5" ${s(accent)} ${none}/>
  ${grip(11.5, 11.5, accent)}
  ${grip(16, 10.5, accent)}`,
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

/**
 * default → two-color (body + obligatory #B656FF accent)
 * active  → both channels #B656FF
 */
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

  for (const [name, icon] of Object.entries(icons)) {
    // currentColor body + fixed accent (keeps obligatory purple when tinted via CSS)
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

  const readme = `# Pipeline icons

AutoCAD-style two-color line-art UI icons for pipeline operations.

| Spec | Value |
|------|-------|
| Grid | 24×24 |
| Stroke | 2px, round caps & joins |
| Background | Transparent |
| Primary (light default body) | \`${PRIMARY}\` |
| Accent (obligatory in default) | \`${SECONDARY}\` |
| Dark default body | \`${DARK_DEFAULT}\` |
| Active | full \`${SECONDARY}\` |

Default states are **two-colored**: structure in primary/gray, action cues in \`${SECONDARY}\`.

## Icons

| Name | Meaning | Accent cue |
|------|---------|------------|
| \`build-pipeline\` | Build a pipeline | Grip nodes |
| \`add-point\` | Add a point to the pipeline | New vertex + plus |
| \`import-pipeline\` | Import a pipeline | Import arrow + end grips |
| \`add-layer\` | Add a layer to pipeline | Upper layer + plus |
| \`paste-pipeline\` | Paste a pipeline | Pipeline on clipboard |

## Layout

\`\`\`
svg/currentColor/{name}.svg          # currentColor body + #B656FF accent
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
        palette: {
          primary: PRIMARY,
          secondary: SECONDARY,
          darkDefault: DARK_DEFAULT,
        },
        strokePx: STROKE,
        size: SIZE,
        twoColorDefault: true,
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
