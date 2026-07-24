# Pipeline icons

AutoCAD-style two-color line-art UI icons for pipeline operations.

| Spec | Value |
|------|-------|
| Grid | 24×24 |
| Stroke | 2px, round caps & joins |
| Background | Transparent |
| Primary (light default body) | `#484848` |
| Accent (obligatory in default) | `#B656FF` |
| Dark default body | `#D0D0D0` |
| Active | full `#B656FF` |

Default states are **two-colored**: structure in primary/gray, action cues in `#B656FF`.

## Icons

| Name | Meaning | Accent cue |
|------|---------|------------|
| `build-pipeline` | Build a pipeline | Grip nodes |
| `add-point` | Add a point to the pipeline | New vertex + plus |
| `import-pipeline` | Import a pipeline | Import arrow + end grips |
| `add-layer` | Add a layer to pipeline | Upper layer + plus |
| `paste-pipeline` | Paste a pipeline | Pipeline on clipboard |

## Layout

```
svg/currentColor/{name}.svg          # currentColor body + #B656FF accent
svg/{light|dark}/{default|active}/   # themed SVG
png/{light|dark}/{default|active}/   # 24px + @2x PNG
```

## Regenerate

```bash
npm install
node generate.js
```
