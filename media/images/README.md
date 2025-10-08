# 🖼️ IMAGES FOLDER

Inserisci qui le immagini per gli hotspot MORE.

## Formati supportati:
- ✅ JPG/JPEG - **Consigliato**
- ✅ PNG
- ✅ WebP

## Naming convention:
```
image_001.jpg
gallery_01_img001.jpg
gallery_01_img002.jpg
gallery_01_img003.jpg
```

## Specifiche consigliate:
- Risoluzione: max 2048x2048 px
- Dimensione file: < 2 MB per immagine
- Per gallery: nominare con prefisso comune

## Esempio JSON - Immagine singola:
```json
{
  "tipo": "more",
  "content": {
    "type": "image",
    "src": "media/images/image_001.jpg",
    "title": "Titolo",
    "description": "Testo descrittivo..."
  }
}
```

## Esempio JSON - Gallery:
```json
{
  "tipo": "more",
  "content": {
    "type": "gallery",
    "images": [
      {
        "src": "media/images/gallery_01_img001.jpg",
        "caption": "Didascalia 1"
      },
      {
        "src": "media/images/gallery_01_img002.jpg",
        "caption": "Didascalia 2"
      }
    ],
    "title": "Titolo Gallery"
  }
}
```
