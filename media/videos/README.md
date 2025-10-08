# 🎬 VIDEO FOLDER

Inserisci qui i file video per gli hotspot MP4.

## Formati supportati:
- ✅ MP4 (H.264) - **Consigliato**
- ✅ WebM (VP9)
- ✅ MOV

## Naming convention:
```
video_001.mp4
video_002.mp4
video_descrizione.mp4
```

## Dimensioni consigliate:
- Risoluzione: 1920x1080 (Full HD) o 1280x720 (HD)
- Bitrate: 5-10 Mbps
- Durata: massimo 5 minuti per performance ottimali

## Esempio JSON:
```json
{
  "tipo": "chiedi",
  "content": {
    "type": "video",
    "src": "media/videos/video_001.mp4",
    "title": "Titolo Video",
    "description": "Descrizione opzionale"
  }
}
```
