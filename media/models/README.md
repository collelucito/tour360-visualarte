# 🎨 MODELS 3D FOLDER

Inserisci qui i modelli 3D per gli hotspot MORE.

## Formati supportati:
- ✅ GLB (glTF Binary) - **Consigliato**
- ✅ GLTF (glTF Text)
- ✅ Sketchfab (via embed URL)

## Naming convention:
```
model_001.glb
model_statua.glb
model_oggetto.gltf
```

## Specifiche consigliate:
- Dimensione file: < 20 MB
- Poligoni: < 100k triangoli per performance ottimali
- Texture: compresse, max 2048x2048 px
- PBR materials preferito (Blender → glTF export)

## Export da Blender:
```
File → Export → glTF 2.0 (.glb)
- Format: glTF Binary (.glb)
- Include: Selected Objects
- Transform: +Y Up
- Geometry: Apply Modifiers
- Materials: Export
- Compression: Draco (opzionale)
```

## Export da Unreal:
```
File → Export → glTF Exporter
- Format: Binary (.glb)
- Export Mode: Scene
```

## Esempio JSON - Modello locale:
```json
{
  "tipo": "more",
  "content": {
    "type": "model3d",
    "src": "media/models/model_001.glb",
    "title": "Titolo Modello",
    "description": "Descrizione...",
    "scale": 1.0,
    "autoRotate": true
  }
}
```

## Esempio JSON - Sketchfab:
```json
{
  "tipo": "more",
  "content": {
    "type": "sketchfab",
    "modelId": "abc123xyz456",
    "title": "Titolo Modello",
    "description": "Descrizione..."
  }
}
```

## Come ottenere modelId da Sketchfab:
1. Vai sul tuo modello Sketchfab
2. Click "Share" / "Embed"
3. URL sarà: https://sketchfab.com/models/ABC123XYZ456
4. Il modelId è: ABC123XYZ456
