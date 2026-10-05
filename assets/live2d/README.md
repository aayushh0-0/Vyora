# VYORA Live2D assets

## What you have now

| Path | Meaning |
|------|---------|
| `source/model.cmo3` | Cubism **Editor project** from Stretchy Studio (not loadable in browser) |
| `source/model.rig.log.json` | Auto-rig log |
| `source/main.xml` | Extracted project XML |
| `source/layers/*.png` | Per-mesh textures extracted from the .cmo3 |
| `vyora/` | **Place Runtime export here** |

## What the browser needs

Export **Live2D Runtime (.moc3)** from Stretchy Studio (not “Live2D Project”):

```
assets/live2d/vyora/
  model.model3.json    # or *.model3.json
  model.moc3
  textures/            # or model.2048/texture_00.png etc.
  optional: *.physics3.json, motions/
```

### Stretchy Studio steps

1. Open the character project in Stretchy Studio  
2. **Export → Live2D Runtime (.moc3)**  
3. Unzip the download into `assets/live2d/vyora/`  
4. Refresh the VYORA site  

### Cubism Editor alternative

1. Open `source/model.cmo3` in Live2D Cubism Editor  
2. File → Export Embedded File → Export as MOC3 file  
3. Copy the output into `assets/live2d/vyora/`

## Character API (already wired)

```js
VYORACharacter.setCharacterState("idle" | "listening" | "thinking" | "speaking" | "happy" | "concerned" | "celebrating")
VYORACharacter.setMouthAmplitude(0..1)  // real voice amplitude only
VYORACharacter.setCursorTracking(true)
```
