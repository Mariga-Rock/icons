#!/usr/bin/env node
/**
 * Special-line UI icons — Comsol Multiphysics–style 24×24, 3px stroke.
 * Generates SVG (currentColor + themed) and PNG via @resvg/resvg-js.
 */
const fs = require('fs');
const path = require('path');

const SIZE = 24;
const STROKE = 3;
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

/** Comsol-like circular geometry node */
const node = (cx, cy, c, r = 1.75) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" ${f(c)}/>`;

/**
 * Single-concept metaphors inspired by Comsol geometry / mesh UI.
 * draw(color) — monochrome themed or currentColor.
 */
const icons = {
  'add-element': {
    label: 'Add an element to a special line',
    draw: (c) => `
  <!-- special line -->
  <path d="M2.5 16.5 L8 8 L21 8" ${s(c)} ${none}/>
  ${node(2.5, 16.5, c)}
  ${node(21, 8, c)}
  <!-- mesh element (triangle) attached at mid-node -->
  <path d="M8 8 L12.5 17 L17 8" ${s(c)} ${none}/>
  ${node(8, 8, c)}
  ${node(12.5, 17, c)}
  ${node(17, 8, c)}`,
  },

  'add-point': {
    label: 'Add a point to that special line',
    draw: (c) => `
  <path d="M3 18 L9 9 L21 9" ${s(c)} ${none}/>
  ${node(3, 18, c)}
  ${node(21, 9, c)}
  <!-- new point (hollow ring = selection) -->
  <circle cx="9" cy="9" r="2.75" ${s(c)} ${none}/>
  <path d="M16.5 14.5 V20.5 M13.5 17.5 H19.5" ${s(c)} ${none}/>`,
  },

  'import-special-line': {
    label: 'Import a special line',
    draw: (c) => `
  <path d="M12 2.5 V11 M8.5 7.5 L12 11 L15.5 7.5" ${s(c)} ${none}/>
  <path d="M3 15 L8 20 L14 15.5 L21 19.5" ${s(c)} ${none}/>
  ${node(3, 15, c)}
  ${node(21, 19.5, c)}`,
  },

  'add-layer': {
    label: 'Add a cool layer to the special line',
    draw: (c) => `
  <path d="M2.5 19 L9 14.5 L15 17.5 L21.5 13" ${s(c)} ${none}/>
  <path d="M2.5 11 L9 6.5 L15 9.5 L18.5 6.5" ${s(c)} ${none}/>
  <path d="M18.5 15 V21 M15.5 18 H21.5" ${s(c)} ${none}/>`,
  },

  'paste-special-line': {
    label: 'Paste a special line from clipboard',
    draw: (c) => `
  <rect x="5.5" y="6.5" width="13" height="14.5" rx="1.5" ${s(c)} ${none}/>
  <rect x="9" y="3.5" width="6" height="4" rx="1" ${s(c)} ${f(c)}/>
  <path d="M8.5 16 L11.5 11 L14 14 L16.5 10" ${s(c)} ${none}/>
  ${node(11.5, 11, c)}
  ${node(16.5, 10, c)}`,
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

  // Remove obsolete pipeline icon filenames from prior generations
  const keep = new Set(Object.keys(icons));
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

  const readme = `# Special-line icons

Comsol Multiphysics–style line-art UI icons for special-line operations.

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
| \`add-element\` | Add an element to a special line |
| \`add-point\` | Add a point to that special line |
| \`import-special-line\` | Import a special line |
| \`add-layer\` | Add a cool layer to the special line |
| \`paste-special-line\` | Paste a special line from clipboard |

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
        palette: {
          primary: PRIMARY,
          secondary: SECONDARY,
          darkDefault: DARK_DEFAULT,
        },
        strokePx: STROKE,
        size: SIZE,
        style: 'Comsol Multiphysics',
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

function walkDirs(dir) {
  const out = [dir];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) out.push(...walkDirs(path.join(dir, ent.name)));
  }
  return out;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
