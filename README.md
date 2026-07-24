# Pipeline & special-line icons

Lite Comsol Multiphysics–inspired line-art UI icons (24×24, 2px).

| Spec | Value |
|------|-------|
| Grid | 24×24 |
| Stroke | 2px, round caps & joins |
| Background | Transparent |
| Primary (light body) | `#484848` |
| Accent (obligatory in default) | `#B656FF` |
| Dark body | `#D0D0D0` |
| Active | full `#B656FF` |

**Visual language**
- **Pipeline** — angular polyline + square grips
- **Special line** — soft curve + circular nodes
- **Add element** — diamond tile accent (not mesh triangle)
- **Add layer** — 3-bar layer stack accent (not double zigzag)

## Icons (10)

| # | File | Meaning |
|---|------|---------|
| 1 | `pipeline-add-element` | Add an element to a pipeline |
| 2 | `special-line-add-element` | Add an element to a special line |
| 3 | `pipeline-add-point` | Add a point to the special pipeline |
| 4 | `special-line-add-point` | Add a point to the special line |
| 5 | `pipeline-import` | Import a pipeline |
| 6 | `special-line-import` | Import a special line |
| 7 | `pipeline-add-layer` | Add a layer to the pipeline |
| 8 | `special-line-add-layer` | Add a layer to special line |
| 9 | `pipeline-paste` | Paste a pipeline from clipboard |
| 10 | `special-line-paste` | Paste a special line from clipboard |

## Layout

```
svg/currentColor/{name}.svg          # currentColor body + #B656FF accent
svg/{light|dark}/{default|active}/
png/{light|dark}/{default|active}/   # 24px + @2x
```

## Regenerate

```bash
npm install
node generate.js
```
