// ========================================
// UI MANAGER - FIX DUPLICATI + FORMATO JSON
// CON SALVA/CARICA TUTTO MIGLIORATO
// ========================================

export class UIManager {
    constructor() {
        this.percorsiAttivi = {};
        this.percorsoCorrente = null;
        this.hotspotTemporanei = {};
        this.currentFoto = 1;
        this.tipoCorrente = 'incrocio';
        this.pendingHotspot = null;
        
        console.log('✅ UI Manager ready');
    }
    
    init() {
        // Popola select foto
        const fotoSelect = document.getElementById('fotoSelect');
        const targetSelect = document.getElementById('targetFotoSelect');
        
        for (let i = 1; i <= 198; i++) {
            const filename = `IMG_${String(i).padStart(3, '0')}.jpg`;
            
            const opt1 = document.createElement('option');
            opt1.value = i;
            opt1.textContent = filename;
            fotoSelect.appendChild(opt1);
            
            const opt2 = document.createElement('option');
            opt2.value = i;
            opt2.textContent = filename;
            targetSelect.appendChild(opt2);
        }
        
        this.aggiornaUI();
    }
    
    creaPercorso(nome) {
        if (!nome || nome.trim() === '') {
            return { success: false, error: 'Nome vuoto' };
        }
        
        if (this.percorsiAttivi[nome]) {
            return { success: false, error: 'Nome già esistente' };
        }
        
        this.percorsiAttivi[nome] = {
            punti: [],
            hotspots: {},
            dataCreazione: new Date().toISOString()
        };
        
        this.percorsoCorrente = nome;
        this.aggiornaListaPercorsi();
        
        return { success: true };
    }
    
    aggiungiPunto(nome, descrizione) {
        if (!this.percorsoCorrente) {
            return { success: false, error: 'Nessun percorso selezionato' };
        }
        
        const filename = `IMG_${String(this.currentFoto).padStart(3, '0')}.jpg`;
        const percorso = this.percorsiAttivi[this.percorsoCorrente];
        
        const esistente = percorso.punti.findIndex(p => p.foto_numero === this.currentFoto);
        
        if (esistente >= 0) {
            percorso.punti[esistente] = {
                foto: filename,
                foto_numero: this.currentFoto,
                nome: nome || `Punto ${this.currentFoto}`,
                descrizione: descrizione || `Panorama ${this.currentFoto}`
            };
            console.log(`✅ Punto aggiornato: ${filename}`);
        } else {
            percorso.punti.push({
                foto: filename,
                foto_numero: this.currentFoto,
                nome: nome || `Punto ${this.currentFoto}`,
                descrizione: descrizione || `Panorama ${this.currentFoto}`
            });
            console.log(`✅ Punto aggiunto: ${filename}`);
        }
        
        if (this.hotspotTemporanei[this.currentFoto]) {
            console.log('💾 TRASFERIMENTO HOTSPOT - Temporanei:', this.hotspotTemporanei[this.currentFoto]);
            percorso.hotspots[this.currentFoto] = [...this.hotspotTemporanei[this.currentFoto]];
            console.log('💾 TRASFERIMENTO HOTSPOT - Nel percorso:', percorso.hotspots[this.currentFoto]);
        } else {
            console.log('❌ Nessun hotspot temporaneo da trasferire per foto:', this.currentFoto);
        }
        
        this.aggiornaListaPercorsi();
        
        return { success: true };
    }
    
    aggiungiHotspot(position, targetFoto = null) {
        if (!this.hotspotTemporanei[this.currentFoto]) {
            this.hotspotTemporanei[this.currentFoto] = [];
        }
        
        const hotspot = {
            tipo: this.tipoCorrente,
            position: { x: position.x, y: position.y, z: position.z },
            timestamp: Date.now(),
            targetFoto: targetFoto,
            targetName: targetFoto ? `IMG_${String(targetFoto).padStart(3, '0')}.jpg` : null,
            scale: 1.0  // 📏 Scala di default per tutti i nuovi hotspot
        };
        
        this.hotspotTemporanei[this.currentFoto].push(hotspot);
        this.aggiornaListaHotspot();
        
        return hotspot;
    }
    
    rimuoviHotspot(timestamp) {
        if (this.hotspotTemporanei[this.currentFoto]) {
            this.hotspotTemporanei[this.currentFoto] = 
                this.hotspotTemporanei[this.currentFoto].filter(h => h.timestamp !== timestamp);
            this.aggiornaListaHotspot();
            return true;
        }
        return false;
    }
    
    getHotspotsCorrente() {
        return this.hotspotTemporanei[this.currentFoto] || [];
    }
    
    esportaPercorso(nome) {
        const percorso = this.percorsiAttivi[nome];
        if (!percorso || percorso.punti.length === 0) {
            return { success: false, error: 'Percorso vuoto' };
        }

        // 🔧 FORMATO CORRETTO per il caricamento automatico
        const jsonExport = {
            percorsi: {
                [nome]: {
                    nome: nome,
                    descrizione: `Percorso ${nome}`,
                    punti: percorso.punti,
                    hotspots: percorso.hotspots,
                    dataCreazione: percorso.dataCreazione || new Date().toISOString()
                }
            },
            hotspots: percorso.hotspots || {}
        };

        const blob = new Blob([JSON.stringify(jsonExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `percorso_${nome.replace(/\s/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('✅ Formato esportato (compatibile con caricamento):', jsonExport);

        return { success: true };
    }
    
    eliminaPercorso(nome) {
        delete this.percorsiAttivi[nome];
        if (this.percorsoCorrente === nome) {
            this.percorsoCorrente = null;
        }
        this.aggiornaListaPercorsi();
    }
    
    aggiornaListaPercorsi() {
        const lista = document.getElementById('listaPercorsi');
        lista.innerHTML = '';
        
        if (Object.keys(this.percorsiAttivi).length === 0) {
            lista.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Nessun percorso</p>';
        } else {
            Object.keys(this.percorsiAttivi).forEach(nome => {
                const percorso = this.percorsiAttivi[nome];
                const fotoUniche = new Set(percorso.punti.map(p => p.foto_numero));
                
                const div = document.createElement('div');
                div.className = `route-item ${nome === this.percorsoCorrente ? 'active' : ''}`;
                div.innerHTML = `
                    <h4>${nome}</h4>
                    <div class="info">📸 ${fotoUniche.size} foto</div>
                    <div class="route-actions">
                        <button class="btn-preview" data-action="preview" data-name="${nome}">▶ Play</button>
                        <button class="btn-edit" data-action="edit" data-name="${nome}" style="background: #FF9800;">✏️ Edit</button>
                        <button class="btn-save" data-action="save" data-name="${nome}">💾 Save</button>
                        <button class="btn-delete" data-action="delete" data-name="${nome}">🗑 Del</button>
                    </div>
                `;
                lista.appendChild(div);
            });
        }
        
        document.getElementById('percorsoAttivo').textContent = this.percorsoCorrente || 'Nessuno';
        
        if (this.percorsoCorrente) {
            const fotoUniche = new Set(this.percorsiAttivi[this.percorsoCorrente].punti.map(p => p.foto_numero));
            document.getElementById('puntiPercorso').textContent = fotoUniche.size;
        } else {
            document.getElementById('puntiPercorso').textContent = 0;
        }
        
        this.aggiornaBottoneAggiungi();
    }
    
    aggiornaListaHotspot() {
        const lista = document.getElementById('hotspotList');
        const hotspots = this.getHotspotsCorrente();

        document.getElementById('hotspotCount').textContent = hotspots.length;

        if (hotspots.length === 0) {
            lista.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Nessun hotspot</p>';
            return;
        }

        lista.innerHTML = '';
        let count = 0;

        hotspots.forEach((h, index) => {
            // 🔍 DEBUG: Verifica se il timestamp esiste
            if (!h.timestamp) {
                console.warn(`⚠️ Hotspot ${index} SENZA timestamp!`, h);
                // Genera un timestamp al volo se manca
                h.timestamp = Date.now() + index;
                console.log(`🔧 Timestamp generato: ${h.timestamp}`);
            }

            const div = document.createElement('div');
            div.className = `hotspot-item ${h.tipo}`;

            const icona = h.tipo === 'incrocio' ? '🟢' : h.tipo === 'chiedi' ? '🟠' : '🔵';
            let desc = '';

            if (h.tipo === 'incrocio') {
                count++;
                desc = `#${count} ${h.targetName}`;
            } else {
                desc = h.tipo.toUpperCase();
            }

            console.log(`📝 Creando bottone elimina per hotspot con timestamp: ${h.timestamp}`);

            div.innerHTML = `
                <button class="delete-btn" data-timestamp="${h.timestamp}">🗑</button>
                <strong>${icona} ${desc}</strong><br>
                <small style="color: #aaa;">3D Position</small>
            `;
            lista.appendChild(div);
        });
    }
    
    aggiornaBottoneAggiungi() {
        const btn = document.getElementById('addToRouteBtn');
        if (this.percorsoCorrente) {
            btn.disabled = false;
            
            const percorso = this.percorsiAttivi[this.percorsoCorrente];
            const esistente = percorso.punti.find(p => p.foto_numero === this.currentFoto);
            
            if (esistente) {
                btn.textContent = `➕ AGGIORNA ${this.percorsoCorrente}`;
                btn.style.background = '#FF9800';
            } else {
                btn.textContent = `➕ ${this.percorsoCorrente}`;
                btn.style.background = '';
            }
        } else {
            btn.disabled = true;
            btn.textContent = '➕ CREA PERCORSO';
            btn.style.background = '';
        }
    }
    
    aggiornaUI() {
        const filename = `IMG_${String(this.currentFoto).padStart(3, '0')}.jpg`;
        document.getElementById('fotoCorrente').textContent = filename;
        
        this.aggiornaListaPercorsi();
        this.aggiornaListaHotspot();
    }
    
    reset() {
        if (confirm('🔄 Cancellare tutto?')) {
            this.percorsiAttivi = {};
            this.percorsoCorrente = null;
            this.hotspotTemporanei = {};
            this.aggiornaUI();
            return true;
        }
        return false;
    }
    
    // ===== SALVA/CARICA TUTTO - VERSIONE MIGLIORATA =====
    
    salvaTutto() {
        if (Object.keys(this.percorsiAttivi).length === 0) {
            return { success: false, error: 'Nessun percorso da salvare' };
        }
        
        const backup = {
            version: '1.0',
            dataCreazione: new Date().toISOString(),
            percorsi: this.percorsiAttivi,
            hotspots: this.hotspotTemporanei
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0,10);
        a.download = `backup_tutti_percorsi_${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('💾 Backup completo salvato:', backup);
        
        return { success: true, count: Object.keys(this.percorsiAttivi).length };
    }
    
    caricaTutto(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject({ success: false, error: 'Nessun file selezionato' });
                return;
            }
            
            console.log('📂 Caricamento file:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            const reader = new FileReader();
            
            reader.onerror = (error) => {
                console.error('❌ FileReader error:', error);
                reject({ success: false, error: 'Errore lettura file: impossibile leggere il file' });
            };
            
            reader.onload = (e) => {
                try {
                    console.log('📥 File letto, parsing JSON...');
                    const content = e.target.result;
                    
                    if (!content || content.trim() === '') {
                        reject({ success: false, error: 'File vuoto' });
                        return;
                    }
                    
                    console.log('📄 Contenuto file (primi 200 char):', content.substring(0, 200));
                    
                    const data = JSON.parse(content);
                    
                    console.log('✅ JSON parsato:', data);
                    
                    // Verifica formato
                    if (!data.percorsi) {
                        console.error('❌ Formato non valido - manca campo "percorsi"');
                        console.log('📋 Campi trovati:', Object.keys(data));
                        reject({ success: false, error: 'Formato file non valido: manca il campo "percorsi"' });
                        return;
                    }
                    
                    // Carica i dati
                    this.percorsiAttivi = data.percorsi;
                    this.hotspotTemporanei = data.hotspots || {};
                    
                    const count = Object.keys(data.percorsi).length;
                    console.log(`✅ Caricati ${count} percorsi:`, Object.keys(data.percorsi));
                    
                    // Aggiorna UI
                    this.aggiornaListaPercorsi();
                    
                    resolve({ success: true, count: count });
                    
                } catch (err) {
                    console.error('❌ Errore parsing JSON:', err);
                    console.error('Stack:', err.stack);
                    reject({ success: false, error: `Errore lettura file: ${err.message}` });
                }
            };
            
            // Leggi il file come testo
            reader.readAsText(file, 'UTF-8');
        });
    }
}
