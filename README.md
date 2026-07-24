# Pipeline icons

AutoCAD-style line-art UI icons for pipeline operations.

| Spec | Value |
|------|-------|
| Grid | 24×24 |
| Stroke | 3px, round caps & joins |
| Background | Transparent |
| Primary (light default) | `#484848` |
| Secondary (active) | `#B656FF` |
| Dark default | `#D0D0D0` |

## Icons

| Name | Meaning |
|------|---------|
| `build-pipeline` | Build a pipeline |
| `add-point` | Add a point to the pipeline |
| `import-pipeline` | Import a pipeline |
| `add-layer` | Add a layer to pipeline |
| `paste-pipeline` | Paste a pipeline |

## Layout

```
svg/currentColor/{name}.svg          # inherits currentColor
svg/{light|dark}/{default|active}/   # themed SVG
png/{light|dark}/{default|active}/   # 24px + @2x PNG
```

## Regenerate

```bash
npm install
node generate.js
```
