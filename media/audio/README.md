# 🎵 AUDIO FOLDER

Inserisci qui i file audio per gli hotspot MP4.

## Formati supportati:
- ✅ MP3 - **Consigliato**
- ✅ WAV
- ✅ OGG

## Naming convention:
```
audio_001.mp3
audio_002.mp3
narrazione_stanza1.mp3
```

## Specifiche consigliate:
- Bitrate: 128-320 kbps
- Sample rate: 44.1 kHz
- Canali: Stereo

## Esempio JSON:
```json
{
  "tipo": "chiedi",
  "content": {
    "type": "audio",
    "src": "media/audio/audio_001.mp3",
    "title": "Titolo Audio",
    "description": "Descrizione opzionale"
  }
}
```
