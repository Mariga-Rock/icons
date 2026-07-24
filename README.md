# Special-line icons

Comsol Multiphysics–style line-art UI icons for special-line operations.

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
| `add-element` | Add an element to a special line |
| `add-point` | Add a point to that special line |
| `import-special-line` | Import a special line |
| `add-layer` | Add a cool layer to the special line |
| `paste-special-line` | Paste a special line from clipboard |

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
