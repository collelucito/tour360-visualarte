#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script per ottimizzare immagini 360° per mobile
Riduce dimensioni mantenendo qualità visiva
"""

import os
import sys
from pathlib import Path

def check_pillow():
    """Verifica se PIL/Pillow è installato"""
    try:
        from PIL import Image
        print("✅ Pillow installato")
        return True
    except ImportError:
        print("❌ Pillow non installato!")
        print("\n🔧 INSTALLAZIONE RICHIESTA:")
        print("   pip install Pillow")
        print("\nOppure:")
        print("   python -m pip install Pillow")
        return False

def optimize_images():
    """Ottimizza tutte le immagini JPG nella cartella corrente"""
    from PIL import Image

    # Trova tutte le immagini
    images = list(Path('.').glob('IMG_*.jpg'))

    if not images:
        print("❌ Nessuna immagine IMG_*.jpg trovata!")
        return

    print(f"\n📸 Trovate {len(images)} immagini da ottimizzare\n")

    # Crea cartella backup
    backup_dir = Path('BACKUP_IMMAGINI_ORIGINALI')
    backup_dir.mkdir(exist_ok=True)

    total_before = 0
    total_after = 0

    for i, img_path in enumerate(images, 1):
        try:
            # Dimensione originale
            size_before = img_path.stat().st_size
            total_before += size_before

            print(f"[{i}/{len(images)}] {img_path.name}")
            print(f"   Prima: {size_before / 1024 / 1024:.1f} MB")

            # Backup originale
            backup_path = backup_dir / img_path.name
            if not backup_path.exists():
                import shutil
                shutil.copy2(img_path, backup_path)
                print(f"   💾 Backup creato")

            # Apri immagine
            img = Image.open(img_path)

            # Riduci risoluzione se troppo grande (max 4096px per lato)
            width, height = img.size
            max_size = 4096

            if width > max_size or height > max_size:
                # Mantieni aspect ratio
                ratio = min(max_size / width, max_size / height)
                new_width = int(width * ratio)
                new_height = int(height * ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                print(f"   📏 Ridimensionata: {width}x{height} → {new_width}x{new_height}")

            # Salva con qualità ottimizzata (85 = ottimo compromesso)
            img.save(
                img_path,
                'JPEG',
                quality=85,
                optimize=True,
                progressive=True  # Caricamento progressivo per mobile
            )

            # Dimensione dopo
            size_after = img_path.stat().st_size
            total_after += size_after
            saved = size_before - size_after
            saved_pct = (saved / size_before) * 100

            print(f"   Dopo: {size_after / 1024 / 1024:.1f} MB")
            print(f"   ✅ Risparmio: {saved / 1024 / 1024:.1f} MB ({saved_pct:.1f}%)\n")

        except Exception as e:
            print(f"   ❌ Errore: {e}\n")
            continue

    # Statistiche finali
    print("=" * 60)
    print("📊 RISULTATI FINALI")
    print("=" * 60)
    print(f"Dimensione totale PRIMA:  {total_before / 1024 / 1024:.1f} MB")
    print(f"Dimensione totale DOPO:   {total_after / 1024 / 1024:.1f} MB")
    total_saved = total_before - total_after
    total_saved_pct = (total_saved / total_before) * 100
    print(f"RISPARMIO TOTALE:         {total_saved / 1024 / 1024:.1f} MB ({total_saved_pct:.1f}%)")
    print("=" * 60)
    print("\n✅ Ottimizzazione completata!")
    print(f"💾 Originali salvati in: {backup_dir}")
    print("\n💡 ORA:")
    print("   1. Apri GitHub Desktop")
    print("   2. Fai commit delle immagini ottimizzate")
    print("   3. Push su GitHub")
    print("   4. Testa su iPhone tra 2-3 minuti")

if __name__ == '__main__':
    print("=" * 60)
    print("🖼️  OTTIMIZZATORE IMMAGINI 360° PER MOBILE")
    print("=" * 60)
    print("\nQuesto script:")
    print("✅ Crea backup degli originali")
    print("✅ Ridimensiona immagini troppo grandi (max 4096px)")
    print("✅ Comprime con qualità 85 (ottimale per 360°)")
    print("✅ Abilita caricamento progressivo")
    print("\n⚠️  ATTENZIONE: Le immagini originali saranno modificate!")
    print("   (ma sarà creato un backup in BACKUP_IMMAGINI_ORIGINALI/)")

    risposta = input("\n🤔 Vuoi continuare? (s/n): ")

    if risposta.lower() != 's':
        print("❌ Operazione annullata")
        sys.exit(0)

    if not check_pillow():
        sys.exit(1)

    optimize_images()
