# 📘 GUIDA COMPLETA - Tour 360° dall'Editor a GitHub Pages

Guida passo-passo per creare e pubblicare un tour virtuale 360° online.

---

## 🎯 PARTE 1: CREARE IL TOUR CON L'EDITOR

### Passo 1: Avviare l'Editor
1. Vai nella cartella `Tour360_GitHub_LITE`
2. Fai doppio click su `START_EDITOR.bat`
3. Si apre il browser con l'editor

### Passo 2: Creare un Nuovo Percorso
1. Nell'editor, clicca su **"➕ Nuovo Percorso"**
2. Scrivi il nome del percorso (esempio: "Piano Terra")
3. Scrivi una descrizione (esempio: "Tour del piano terra")
4. Clicca **"Crea Percorso"**

### Passo 3: Aggiungere Foto al Percorso
1. Clicca su **"📁 Carica Foto"**
2. Seleziona le tue foto panoramiche (formato .jpg)
3. Le foto appaiono nella lista a sinistra
4. Clicca su una foto per iniziare a lavorarci

### Passo 4: Aggiungere Hotspot (Punti Cliccabili)
Quando sei dentro una foto, puoi aggiungere 4 tipi di hotspot:

#### A. Hotspot INCROCIO (per andare a un'altra foto)
1. Clicca sul pulsante **"🚶 INCROCIO"**
2. Clicca sulla foto panoramica nel punto dove vuoi mettere l'hotspot
3. Appare un pallino verde con scritta "GO"
4. Nel menu a destra:
   - Seleziona **"Foto di destinazione"** (dove vuoi andare)
   - Modifica la dimensione se vuoi (scala)
5. Clicca **"Salva Hotspot"**

#### B. Hotspot VIDEO (per mostrare un video)
1. Clicca sul pulsante **"🎬 CHIEDI"**
2. Clicca sulla foto dove vuoi il video
3. Appare un pallino rosso con scritta "MP4"
4. Nel menu a destra:
   - Scrivi il titolo del video
   - Scrivi il link del video (esempio: video.mp4)
5. Clicca **"Salva Hotspot"**

#### C. Hotspot INFO (per mostrare informazioni)
1. Clicca sul pulsante **"ℹ️ MORE"**
2. Clicca sulla foto dove vuoi le info
3. Appare un pallino blu con scritta "INFO"
4. Nel menu a destra:
   - Scrivi il titolo
   - Scrivi il testo delle informazioni
5. Clicca **"Salva Hotspot"**

#### D. Hotspot 3D (per mostrare modelli 3D)
1. Clicca sul pulsante **"🎨 TRED"**
2. Clicca sulla foto dove vuoi il modello 3D
3. Appare un pallino viola con scritta "3D"
4. Nel menu a destra:
   - Scrivi il titolo
   - Scrivi il link del modello 3D
5. Clicca **"Salva Hotspot"**

### Passo 5: Modificare o Eliminare Hotspot
- **Per spostare:** Trascina l'hotspot con il mouse
- **Per modificare:** Clicca sull'hotspot, cambia i dati, clicca "Salva Hotspot"
- **Per eliminare:** Clicca sull'hotspot, clicca "🗑️ Elimina Hotspot", conferma con "OK"

### Passo 6: Salvare il Percorso
1. Quando hai finito, clicca su **"💾 Salva Percorso"**
2. Il percorso viene salvato nella cartella `percorsi_salvati`
3. Il file si chiama come il nome del tuo percorso (esempio: `Piano_Terra.json`)

---

## 💾 PARTE 2: PREPARARE IL TOUR PER LA PUBBLICAZIONE

### Passo 7: Creare il File per il Viewer
1. Trova il file JSON del tuo percorso in `percorsi_salvati`
2. **Copia** il file
3. **Incolla** il file nella cartella principale `Tour360_GitHub_LITE`
4. **Rinomina** il file in: `Piano_Terra_PER_VIEWER.json`

### Passo 8: Verificare le Foto
Controlla che tutte le foto del tour siano già caricate sui repository GitHub:
- Foto IMG_001 - IMG_040 → Repository `tour360-photos-1`
- Foto IMG_041 - IMG_080 → Repository `tour360-photos-2`
- Foto IMG_081 - IMG_120 → Repository `tour360-photos-3`
- Foto IMG_121 - IMG_160 → Repository `tour360-photos-4`
- Foto IMG_161 - IMG_198 → Repository `tour360-photos-5`

**NOTA:** Se usi foto che non sono ancora su GitHub, il tour non funzionerà!

---

## 🌐 PARTE 3: PUBBLICARE SU GITHUB

### Passo 9: Aprire GitHub Desktop
1. Fai doppio click sull'icona **GitHub Desktop** (viola/rosa)
2. In alto a sinistra, verifica che sia selezionato **"tour360-visualarte"**

### Passo 10: Vedere le Modifiche
1. Nella parte sinistra vedi la lista dei file modificati
2. Dovresti vedere:
   - `Piano_Terra_PER_VIEWER.json` (se hai aggiunto il tour)
   - Altri file se li hai modificati

### Passo 11: Fare il Commit
1. In basso a sinistra, nel campo **"Summary"**, scrivi cosa hai fatto
   - Esempio: "Aggiunto tour Piano Terra"
2. Clicca sul pulsante blu **"Commit to main"**

### Passo 12: Fare il Push (Caricare Online)
1. Dopo il commit, appare un pulsante in alto **"Push origin"**
   - Oppure dice **"Push commits to the original remote"**
2. Clicca sul pulsante
3. Aspetta qualche secondo finché non dice "Successfully pushed"

### Passo 13: Verificare su GitHub.com
1. Apri il browser
2. Vai su: `https://github.com/collelucito/tour360-visualarte`
3. Dovresti vedere i tuoi file caricati
4. Controlla che ci sia `Piano_Terra_PER_VIEWER.json`

---

## 🚀 PARTE 4: PUBBLICARE IL SITO

### Passo 14: Attivare GitHub Pages (Solo la Prima Volta)
Se è la prima volta che pubblichi, devi attivare GitHub Pages:

1. Su GitHub.com, vai nella pagina del repository
2. Clicca su **"Settings"** (in alto a destra)
3. Nel menu a sinistra, clicca su **"Pages"**
4. Sotto "Branch":
   - Seleziona **"main"**
   - Seleziona **"/ (root)"**
5. Clicca **"Save"**
6. Aspetta 2-3 minuti

### Passo 15: Modificare tour.html per Caricare il Tuo Tour
Se hai creato un tour con un nome diverso, devi modificare `tour.html`:

1. Apri il file `tour.html` con un editor di testo (Notepad++)
2. Cerca la riga: `fetch('Piano_Terra_PER_VIEWER.json')`
3. Cambia il nome del file con il tuo: `fetch('IL_MIO_TOUR_PER_VIEWER.json')`
4. Salva il file
5. Torna su GitHub Desktop
6. Fai commit con messaggio: "Cambiato tour da caricare"
7. Fai push

---

## ✅ PARTE 5: VEDERE IL TOUR ONLINE

### Passo 16: Aprire il Tour
1. Aspetta 2-3 minuti dopo il push
2. Apri il browser in **modalità incognito** (per evitare cache):
   - **Chrome/Edge:** Premi `Ctrl + Shift + N`
   - **Firefox:** Premi `Ctrl + Shift + P`
3. Vai all'indirizzo: `https://collelucito.github.io/tour360-visualarte/tour.html`
4. Il tour dovrebbe partire automaticamente!

### Passo 17: Verificare che Funzioni
Controlla nella console del browser (premi F12):
- ✅ `🚀 Viewer script caricato`
- ✅ `📦 Tour pre-caricato, avvio automatico...`
- ✅ `🎬 Inizializzazione Three.js...`
- ✅ `✅ Tour avviato con successo`

Se vedi questi messaggi, il tour funziona! 🎉

---

## 🐛 PROBLEMI COMUNI E SOLUZIONI

### Problema 1: Il Tour Resta su "Caricamento..."
**Causa:** Le foto non sono state trovate su GitHub
**Soluzione:**
- Apri la console (F12)
- Cerca errori tipo "404 (Not Found)"
- Verifica che le foto usate nel tour siano state caricate sui repository GitHub
- Se mancano foto, caricale nei repository corretti

### Problema 2: Non Vedo il Pulsante "Push Origin"
**Causa:** Non ci sono modifiche da caricare, oppure sei già aggiornato
**Soluzione:**
- Clicca su "Fetch origin" e aspetta
- Verifica che tu abbia fatto il commit prima

### Problema 3: GitHub Desktop Chiede Username/Password
**Causa:** Non sei autenticato
**Soluzione:**
- Vai su File → Options → Accounts
- Clicca "Sign in" per GitHub.com
- Accedi con il tuo account GitHub

### Problema 4: Il Sito Mostra "404 - File not found"
**Causa:** GitHub Pages non è attivato o il file non esiste
**Soluzione:**
- Verifica che GitHub Pages sia attivo (Passo 14)
- Controlla che i file esistano nel repository su GitHub.com
- Aspetta 2-3 minuti dopo aver fatto il push

### Problema 5: Vedo il Tour Vecchio, Non le Nuove Modifiche
**Causa:** Cache del browser
**Soluzione:**
- Usa modalità incognito
- Oppure svuota la cache (Ctrl + Shift + Canc)
- Ricarica la pagina con Ctrl + F5

---

## 📋 CHECKLIST RAPIDA

Prima di pubblicare, controlla di aver fatto:

- ✅ Creato il tour con l'editor
- ✅ Salvato il percorso
- ✅ Copiato il file JSON e rinominato in `_PER_VIEWER.json`
- ✅ Verificato che le foto siano su GitHub
- ✅ Modificato `tour.html` se necessario
- ✅ Aperto GitHub Desktop
- ✅ Fatto commit con messaggio descrittivo
- ✅ Fatto push su GitHub
- ✅ Aspettato 2-3 minuti
- ✅ Testato in modalità incognito

---

## 🎓 GLOSSARIO

- **Repository:** Una cartella online su GitHub che contiene i tuoi file
- **Commit:** Salvare una versione dei tuoi file
- **Push:** Caricare i file salvati su GitHub online
- **GitHub Pages:** Servizio gratuito per pubblicare siti web
- **Hotspot:** Punto cliccabile nelle foto panoramiche
- **JSON:** Tipo di file che contiene i dati del tour
- **Cache:** Memoria temporanea del browser (a volte causa problemi)
- **Modalità Incognito:** Navigazione privata senza cache

---

## 📞 LINK UTILI

- **Repository principale:** https://github.com/collelucito/tour360-visualarte
- **Tour online:** https://collelucito.github.io/tour360-visualarte/tour.html
- **Repository foto 1:** https://github.com/collelucito/tour360-photos-1
- **Repository foto 2:** https://github.com/collelucito/tour360-photos-2
- **Repository foto 3:** https://github.com/collelucito/tour360-photos-3
- **Repository foto 4:** https://github.com/collelucito/tour360-photos-4
- **Repository foto 5:** https://github.com/collelucito/tour360-photos-5

---

**Creato il:** 08/10/2025
**Versione:** 1.0
