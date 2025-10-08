// ========================================
// MAIN APP - CON SALVA/CARICA TUTTO
// ========================================

import { PanoramaEngine } from './engine.js';
import { CameraControls } from './controls.js';
import { HotspotManager } from './hotspots.js';
import { UIManager } from './ui.js';
import { PreviewMode } from './preview.js';
import { VisualHotspotEditor } from './visual-hotspot-editor.js';

class App {
 constructor() {
 this.engine = null;
 this.controls = null;
 this.hotspotManager = null;
 this.uiManager = null;
 this.previewMode = null;
 this.visualEditor = null;

 console.log('🎨 VisualArte3D - Three.js Crossfade Editor');
 console.log('📦 Version: Modular 1.0 + JSON Loader');
 }
 
 init() {
 this.uiManager = new UIManager();
 this.uiManager.init();
 
 this.engine = new PanoramaEngine('canvas-container');
 
 this.controls = new CameraControls(
 this.engine.getCamera(),
 this.engine.getRenderer().domElement
 );
 
 this.hotspotManager = new HotspotManager(
 this.engine.getScene(),
 this.engine.getCamera(),
 this.engine.getRenderer().domElement
 );
 
 this.previewMode = new PreviewMode();

 // Inizializza Visual Editor
 console.log('🔧 Inizializzazione VisualHotspotEditor...');
 try {
 this.visualEditor = new VisualHotspotEditor(
 this.engine.getScene(),
 this.engine.getCamera(),
 this.engine.getRenderer(),
 this.controls
 );
 console.log('✅ VisualHotspotEditor creato:', this.visualEditor);

 // Setup callbacks per il visual editor
 this.setupVisualEditor();
 console.log('✅ Callbacks visual editor configurate');
 } catch (error) {
 console.error('❌ Errore inizializzazione VisualHotspotEditor:', error);
 this.visualEditor = null;
 }

 this.setupEvents();
 this.loadCurrentFoto();
 this.updateLoop();
 // this.loadDemoJSON(); // Demo disabilitato

 console.log('✅ App initialized successfully!');
 console.log('💡 SHIFT+Click su un hotspot per modificarlo!');
 }
 
 async loadDemoJSON() {
 try {
 console.log('🔍 Tentativo caricamento JSON demo...');
 const response = await fetch('../media/esempio_percorso_con_contenuti.json');
 
 if (!response.ok) {
 console.log('ℹ️ JSON demo non trovato');
 return;
 }
 
 const jsonData = await response.json();
 console.log('✅ JSON demo caricato:', jsonData);
 
 const nomePercorso = jsonData.nome || 'Tour Museo Demo';
 const result = this.uiManager.creaPercorso(nomePercorso);
 
 if (result.success) {
 const percorso = this.uiManager.percorsiAttivi[nomePercorso];
 percorso.punti = jsonData.punti;
 percorso.hotspots = jsonData.hotspots;
 
 this.uiManager.percorsoCorrente = nomePercorso;
 this.uiManager.aggiornaListaPercorsi();
 
 console.log('🎉 Tour Museo caricato automaticamente!');
 
 setTimeout(() => {
 alert('🎉 Tour Museo caricato!\n\n🎵 Audio: 3 tracce classiche\n🗿 Modelli 3D: 4 sculture Sketchfab\n📝 Testi: Info storiche\n\n👁️ Click "Play" per iniziare!');
 }, 1000);
 }
 
 } catch (error) {
 console.log('ℹ️ JSON demo non disponibile:', error.message);
 }
 }
 
 setupVisualEditor() {
 // Callback quando si salva un hotspot modificato
 this.visualEditor.onApply = (hotspotData) => {
 console.log('🎯 onApply chiamato con:', hotspotData);
 const hotspots = this.uiManager.hotspotTemporanei[this.uiManager.currentFoto] || [];
 console.log('🔍 Hotspots temporanei correnti:', hotspots);
 console.log('🔍 Cercando timestamp:', hotspotData.timestamp);
 const index = hotspots.findIndex(h => h.timestamp === hotspotData.timestamp);
 console.log('🔍 Index trovato:', index);
 if (index >= 0) {
 console.log('🔄 PRIMA aggiornamento temporanei:', hotspots[index]);
 hotspots[index] = hotspotData;
 console.log('🔄 DOPO aggiornamento temporanei:', hotspots[index]);
 this.uiManager.hotspotTemporanei[this.uiManager.currentFoto] = hotspots;

 // 🔥 IMPORTANTE: Aggiorna anche il percorso salvato se esiste
 if (this.uiManager.percorsoCorrente) {
 const percorso = this.uiManager.percorsiAttivi[this.uiManager.percorsoCorrente];
 console.log('🔍 onApply - Percorso corrente:', this.uiManager.percorsoCorrente);
 console.log('🔍 onApply - Hotspots percorso:', percorso?.hotspots);
 if (percorso && percorso.hotspots && percorso.hotspots[this.uiManager.currentFoto]) {
 const percorsoIndex = percorso.hotspots[this.uiManager.currentFoto].findIndex(h => h.timestamp === hotspotData.timestamp);
 if (percorsoIndex >= 0) {
 console.log('💾 PRIMA aggiornamento percorso:', percorso.hotspots[this.uiManager.currentFoto][percorsoIndex]);
 percorso.hotspots[this.uiManager.currentFoto][percorsoIndex] = hotspotData;
 console.log('💾 DOPO aggiornamento percorso:', percorso.hotspots[this.uiManager.currentFoto][percorsoIndex]);
 console.log('💾 Percorso aggiornato con nuova scala:', hotspotData.scale);
 } else {
 console.log('❌ Hotspot non trovato nel percorso, timestamp:', hotspotData.timestamp);
 }
 } else {
 console.log('❌ Nessun hotspot per foto corrente:', this.uiManager.currentFoto);
 }
 }

 this.uiManager.aggiornaListaHotspot();
 this.reloadHotspots();
 console.log('✅ Hotspot aggiornato:', hotspotData);
 }
 };

 // Auto-save durante il drag
 this.visualEditor.onAutoSave = (hotspotData) => {
 const hotspots = this.uiManager.hotspotTemporanei[this.uiManager.currentFoto] || [];
 const index = hotspots.findIndex(h => h.timestamp === hotspotData.timestamp);
 if (index >= 0) {
 hotspots[index] = hotspotData;
 this.uiManager.hotspotTemporanei[this.uiManager.currentFoto] = hotspots;

 // 🔥 IMPORTANTE: Aggiorna anche il percorso salvato durante auto-save
 if (this.uiManager.percorsoCorrente) {
 const percorso = this.uiManager.percorsiAttivi[this.uiManager.percorsoCorrente];
 if (percorso && percorso.hotspots && percorso.hotspots[this.uiManager.currentFoto]) {
 const percorsoIndex = percorso.hotspots[this.uiManager.currentFoto].findIndex(h => h.timestamp === hotspotData.timestamp);
 if (percorsoIndex >= 0) {
 percorso.hotspots[this.uiManager.currentFoto][percorsoIndex] = hotspotData;
 }
 }
 }
 }
 };

 // Callback per eliminazione hotspot
 this.visualEditor.onDelete = (hotspotData) => {
 // Elimina anche dal percorso salvato se esiste
 if (this.uiManager.percorsoCorrente) {
 const percorso = this.uiManager.percorsiAttivi[this.uiManager.percorsoCorrente];
 if (percorso && percorso.hotspots && percorso.hotspots[this.uiManager.currentFoto]) {
 percorso.hotspots[this.uiManager.currentFoto] =
 percorso.hotspots[this.uiManager.currentFoto].filter(h => h.timestamp !== hotspotData.timestamp);
 console.log('🗑️ Hotspot eliminato anche dal percorso salvato');
 }
 }

 this.uiManager.rimuoviHotspot(hotspotData.timestamp);
 this.reloadHotspots();
 console.log('🗑️ Hotspot eliminato:', hotspotData);
 };

 // Gestione camera quando si apre/chiude l'editor
 const originalSelect = this.visualEditor.selectHotspot.bind(this.visualEditor);
 this.visualEditor.selectHotspot = (mesh, data) => {
 originalSelect(mesh, data);
 this.controls.enabled = false; // Blocca la camera
 console.log('🔒 Camera bloccata per editing');
 };

 const originalClose = this.visualEditor.close.bind(this.visualEditor);
 this.visualEditor.close = () => {
 this.controls.enabled = true; // Sblocca la camera
 originalClose();
 console.log('🔓 Camera sbloccata');
 };
 }

 setupEvents() {
 document.getElementById('fotoSelect').addEventListener('change', () => {
 this.uiManager.currentFoto = parseInt(document.getElementById('fotoSelect').value);
 this.loadCurrentFoto();
 });
 
 document.querySelectorAll('.type-btn').forEach(btn => {
 btn.addEventListener('click', (e) => {
 const tipo = e.target.id.replace('btn-', '');
 this.uiManager.tipoCorrente = tipo;
 document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
 e.target.classList.add('active');
 });
 });
 
 this.controls.onClick((event) => {
 console.log('🖱️ Click rilevato, SHIFT:', event.shiftKey);

 // SHIFT+Click per modificare hotspot
 if (event.shiftKey) {
 console.log('⌨️ SHIFT+Click rilevato!');
 const hotspot = this.hotspotManager.checkIntersection(event);
 console.log('🎯 Hotspot trovato:', hotspot);
 if (hotspot) {
 const hotspotData = this.uiManager.getHotspotsCorrente().find(h =>
 h.timestamp === hotspot.userData.data.timestamp
 );
 console.log('📄 Hotspot data:', hotspotData);
 if (hotspotData && this.visualEditor) {
 console.log('🚀 Aprendo editor visuale...');
 this.visualEditor.selectHotspot(hotspot, hotspotData);
 console.log('📝 Editing hotspot:', hotspotData);
 } else {
 console.log('❌ Dati hotspot mancanti o visual editor non disponibile');
 }
 return;
 } else {
 console.log('❌ Nessun hotspot trovato con SHIFT+Click');
 }
 }

 // Click normale per navigazione
 const hotspot = this.hotspotManager.checkIntersection(event);
 if (hotspot && hotspot.userData.type === 'incrocio') {
 const targetFoto = hotspot.userData.data.targetFoto;
 if (targetFoto) {
 this.navigateToFoto(targetFoto);
 }
 return;
 }

 // Click per aggiungere nuovo hotspot
 const raycaster = new THREE.Raycaster();
 const mouse = new THREE.Vector2();
 const rect = this.engine.getRenderer().domElement.getBoundingClientRect();
 mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
 mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

 raycaster.setFromCamera(mouse, this.engine.getCamera());
 const sphere = this.engine.getScene().children.find(obj => obj.geometry && obj.geometry.type === 'SphereGeometry');

 if (sphere) {
 const intersects = raycaster.intersectObject(sphere);
 if (intersects.length > 0) {
 this.addHotspot(intersects[0].point);
 }
 }
 });
 
 document.querySelector('.new-route-section button').addEventListener('click', () => {
 const nome = document.getElementById('nomePercorso').value;
 const result = this.uiManager.creaPercorso(nome);
 if (result.success) {
 document.getElementById('nomePercorso').value = '';
 alert(`✅ Percorso "${nome}" creato!`);
 } else {
 alert(`❌ ${result.error}`);
 }
 });
 
 document.getElementById('addToRouteBtn').addEventListener('click', () => {
 const nome = document.getElementById('nomePunto').value;
 const desc = document.getElementById('descrizionePunto').value;
 const result = this.uiManager.aggiungiPunto(nome, desc);
 
 if (result.success) {
 document.getElementById('nomePunto').value = '';
 document.getElementById('descrizionePunto').value = '';
 
 const btn = document.getElementById('addToRouteBtn');
 const orig = btn.textContent;
 btn.style.background = '#4CAF50';
 btn.textContent = '✅ AGGIUNTO!';
 setTimeout(() => {
 btn.style.background = '';
 btn.textContent = orig;
 }, 1500);
 } else {
 alert(`❌ ${result.error}`);
 }
 });
 
 document.getElementById('listaPercorsi').addEventListener('click', (e) => {
 const btn = e.target.closest('button[data-action]');
 if (!btn) return;
 
 const action = btn.dataset.action;
 const nome = btn.dataset.name;
 
 switch(action) {
 case 'select':
 this.uiManager.percorsoCorrente = nome;
 this.uiManager.aggiornaListaPercorsi();
 break;
 case 'preview':
 const percorso = this.uiManager.percorsiAttivi[nome];
 if (percorso && percorso.punti.length > 0) {
 this.previewMode.start(percorso);
 } else {
 alert('⚠️ Percorso vuoto!');
 }
 break;
 case 'save':
 const result = this.uiManager.esportaPercorso(nome);
 if (result.success) {
 alert('💾 Percorso esportato!');
 } else {
 alert(`❌ ${result.error}`);
 }
 break;
 case 'delete':
 if (confirm(`Eliminare "${nome}"?`)) {
 this.uiManager.eliminaPercorso(nome);
 alert('🗑️ Eliminato!');
 }
 break;
 case 'edit':
 // Carica il percorso nell'editor
 this.loadPercorsoInEditor(nome);
 break;
 }
 });
 
 document.getElementById('hotspotList').addEventListener('click', (e) => {
 // Ferma la propagazione per evitare che altri eventi interferiscano
 e.stopPropagation();

 const target = e.target;
 console.log('🖱️ Click nella lista hotspot su:', target.tagName, target.className);

 if (target.classList.contains('delete-btn')) {
 e.preventDefault();

 const timestamp = parseInt(target.dataset.timestamp);
 console.log('🗑️ INIZIO ELIMINAZIONE - timestamp:', timestamp);

 // Log hotspot prima dell'eliminazione
 const hotspotsBefore = this.uiManager.getHotspotsCorrente();
 console.log('📊 Hotspot PRIMA eliminazione:', hotspotsBefore.length, hotspotsBefore);

 if (confirm('🗑️ Confermi eliminazione di questo hotspot?')) {
 console.log('✅ Utente ha confermato');

 // Elimina dai dati temporanei
 const rimosso = this.uiManager.rimuoviHotspot(timestamp);
 console.log('🗑️ Rimosso da temporanei:', rimosso);

 // Log hotspot dopo l'eliminazione
 const hotspotsAfter = this.uiManager.getHotspotsCorrente();
 console.log('📊 Hotspot DOPO eliminazione:', hotspotsAfter.length, hotspotsAfter);

 // Elimina anche dal percorso salvato se esiste
 if (this.uiManager.percorsoCorrente) {
 const percorso = this.uiManager.percorsiAttivi[this.uiManager.percorsoCorrente];
 if (percorso && percorso.hotspots && percorso.hotspots[this.uiManager.currentFoto]) {
 const countBefore = percorso.hotspots[this.uiManager.currentFoto].length;
 percorso.hotspots[this.uiManager.currentFoto] =
 percorso.hotspots[this.uiManager.currentFoto].filter(h => h.timestamp !== timestamp);
 const countAfter = percorso.hotspots[this.uiManager.currentFoto].length;
 console.log(`🗑️ Eliminato dal percorso: ${countBefore} → ${countAfter}`);
 }
 }

 // Ricarica la visualizzazione 3D
 console.log('🔄 Chiamata reloadHotspots()...');
 this.reloadHotspots();

 // Aggiorna anche la lista UI
 console.log('🔄 Chiamata aggiornaListaHotspot()...');
 this.uiManager.aggiornaListaHotspot();

 console.log('✅ ELIMINAZIONE COMPLETATA');
 alert('✅ Hotspot eliminato! Ricorda di salvare con "💾 Save"');
 } else {
 console.log('❌ Eliminazione annullata dall\'utente');
 }
 }
 });
 
 document.querySelector('.reset-section button').addEventListener('click', () => {
 if (this.uiManager.reset()) {
 this.hotspotManager.clearAll();
 alert('🔄 Reset completato!');
 }
 });
 
 document.getElementById('btn-confirm-incrocio').addEventListener('click', () => {
 this.confirmHotspot();
 });
 
 document.getElementById('btn-cancel-incrocio').addEventListener('click', () => {
 this.cancelHotspot();
 });
 
 document.getElementById('btn-confirm-chiedi').addEventListener('click', () => {
 this.confirmChiedi();
 });
 
 document.getElementById('btn-cancel-chiedi').addEventListener('click', () => {
 this.cancelChiedi();
 });
 
 document.getElementById('btn-confirm-more').addEventListener('click', () => {
 this.confirmMore();
 });
 
 document.getElementById('btn-cancel-more').addEventListener('click', () => {
 this.cancelMore();
 });
 
 document.getElementById('btn-confirm-3d').addEventListener('click', () => {
 this.confirm3d();
 });
 
 document.getElementById('btn-cancel-3d').addEventListener('click', () => {
 this.cancel3d();
 });
 
 // SALVA TUTTO
 document.getElementById('saveAllBtn').addEventListener('click', () => {
 const result = this.uiManager.salvaTutto();
 if (result.success) {
 alert(`💾 Salvati ${result.count} percorsi!`);
 } else {
 alert(`❌ ${result.error}`);
 }
 });
 
 // CARICA TUTTO
 document.getElementById('loadAllBtn').addEventListener('click', () => {
 document.getElementById('loadAllInput').click();
 });
 
 document.getElementById('loadAllInput').addEventListener('change', async (e) => {
 const file = e.target.files[0];
 if (!file) return;
 
 try {
 const result = await this.uiManager.caricaTutto(file);
 alert(`📂 Caricati ${result.count} percorsi!`);
 e.target.value = '';
 } catch (err) {
 alert(`❌ ${err.error}`);
 }
 });
 
 document.getElementById('preview-close').addEventListener('click', () => {
 this.previewMode.close();
 });
 }
 
 loadCurrentFoto() {
 const filename = `../IMG_${String(this.uiManager.currentFoto).padStart(3, '0')}.jpg`;
 
 this.hotspotManager.clearAll();
 
 this.engine.loadTexture(filename, () => {
 this.reloadHotspots();
 });
 
 this.uiManager.aggiornaUI();
 }
 
 reloadHotspots() {
 this.hotspotManager.clearAll();
 const hotspots = this.uiManager.getHotspotsCorrente();

 hotspots.forEach(h => {
 const position = new THREE.Vector3(h.position.x, h.position.y, h.position.z);
 const mesh = this.hotspotManager.createHotspot(position, h.tipo, {
 timestamp: h.timestamp,
 targetFoto: h.targetFoto,
 targetName: h.targetName,
 content: h.content
 });

 // 📏 IMPORTANTE: Applica la scala salvata se presente (con minimo garantito)
 if (h.scale && mesh) {
 // 🔍 Garantisce scala minima di 0.5 per evitare hotspot invisibili
 const scaleToApply = Math.max(0.5, h.scale);
 mesh.scale.set(scaleToApply, scaleToApply, scaleToApply);
 mesh.userData.originalScale = mesh.scale.clone(); // Aggiorna anche originalScale
 console.log(`📏 Scala applicata: ${scaleToApply} per hotspot`, h.timestamp);
 } else if (mesh) {
 // 🔍 Se non c'è scala salvata, usa 1.0 di default
 mesh.userData.originalScale = mesh.scale.clone();
 }

 // 🆕 Aggiungi riferimento hotspot data per Visual Editor
 if (mesh) {
 mesh.userData.hotspotData = h;
 mesh.userData.isHotspot = true;
 }
 });
 }
 
 addHotspot(position) {
 this.uiManager.pendingHotspot = { position: position };
 
 if (this.uiManager.tipoCorrente === 'incrocio') {
 document.getElementById('modalIncrocio').classList.add('active');
 } else if (this.uiManager.tipoCorrente === 'chiedi') {
 document.getElementById('chiediVideoSelect').value = '';
 document.getElementById('chiediAudioSelect').value = '';
 document.querySelectorAll('#chiediImagesCheckboxes input').forEach(cb => cb.checked = false);
 document.getElementById('modalChiedi').classList.add('active');
 } else if (this.uiManager.tipoCorrente === 'more') {
 document.getElementById('moreTitleInput').value = '';
 document.getElementById('moreTextInput').value = '';
 document.getElementById('moreWikipediaInput').value = '';
 document.getElementById('modalMore').classList.add('active');
 } else if (this.uiManager.tipoCorrente === 'tred') {
 document.getElementById('tredTitleInput').value = '';
 document.getElementById('tredDescInput').value = '';
 document.getElementById('tredSketchfabInput').value = '';
 document.getElementById('modal3d').classList.add('active');
 }
 }
 
 confirmHotspot() {
 const targetFoto = parseInt(document.getElementById('targetFotoSelect').value);
 if (!targetFoto) {
 alert('⚠️ Seleziona una foto!');
 return;
 }
 
 const position = this.uiManager.pendingHotspot.position;
 const hotspot = this.uiManager.aggiungiHotspot(position, targetFoto);
 
 const pos = new THREE.Vector3(position.x, position.y, position.z);
 this.hotspotManager.createHotspot(pos, 'incrocio', {
 timestamp: hotspot.timestamp,
 targetFoto: targetFoto,
 targetName: hotspot.targetName
 });
 
 document.getElementById('modalIncrocio').classList.remove('active');
 this.uiManager.pendingHotspot = null;
 }
 
 cancelHotspot() {
 document.getElementById('modalIncrocio').classList.remove('active');
 this.uiManager.pendingHotspot = null;
 }
 
 confirmChiedi() {
 const video = document.getElementById('chiediVideoSelect').value;
 const audio = document.getElementById('chiediAudioSelect').value;
 const gallery = [];
 document.querySelectorAll('#chiediImagesCheckboxes input:checked').forEach(cb => {
 gallery.push(cb.value);
 });
 
 if (!video && !audio && gallery.length === 0) {
 alert('⚠️ Seleziona almeno un contenuto!');
 return;
 }
 
 const position = this.uiManager.pendingHotspot.position;
 const hotspot = this.uiManager.aggiungiHotspot(position);
 
 hotspot.content = {
 video: video,
 audio: audio,
 gallery: gallery
 };
 
 const pos = new THREE.Vector3(position.x, position.y, position.z);
 this.hotspotManager.createHotspot(pos, 'chiedi', {
 timestamp: hotspot.timestamp,
 content: hotspot.content
 });
 
 document.getElementById('modalChiedi').classList.remove('active');
 this.uiManager.pendingHotspot = null;
 }
 
 cancelChiedi() {
 document.getElementById('modalChiedi').classList.remove('active');
 this.uiManager.pendingHotspot = null;
 }
 
 confirmMore() {
 const titolo = document.getElementById('moreTitleInput').value.trim();
 const testo = document.getElementById('moreTextInput').value.trim();
 const wikipedia = document.getElementById('moreWikipediaInput').value.trim();
 
 if (!titolo && !testo) {
 alert('⚠️ Inserisci almeno un titolo o del testo!');
 return;
 }
 
 const position = this.uiManager.pendingHotspot.position;
 const hotspot = this.uiManager.aggiungiHotspot(position);
 
 hotspot.content = {
 titolo: titolo,
 testo: testo,
 wikipedia: wikipedia
 };
 
 const pos = new THREE.Vector3(position.x, position.y, position.z);
 this.hotspotManager.createHotspot(pos, 'more', {
 timestamp: hotspot.timestamp,
 content: hotspot.content
 });
 
 document.getElementById('modalMore').classList.remove('active');
 this.uiManager.pendingHotspot = null;
 }
 
 cancelMore() {
 document.getElementById('modalMore').classList.remove('active');
 this.uiManager.pendingHotspot = null;
 }
 
 confirm3d() {
 const titolo = document.getElementById('tredTitleInput').value.trim();
 const testo = document.getElementById('tredDescInput').value.trim();
 const model3d = document.getElementById('tredSketchfabInput').value.trim();
 
 if (!titolo && !model3d) {
 alert('⚠️ Inserisci almeno un titolo o un URL modello!');
 return;
 }
 
 const position = this.uiManager.pendingHotspot.position;
 const hotspot = this.uiManager.aggiungiHotspot(position);
 
 let modelId = '';
 if (model3d) {
 const match = model3d.match(/models\/([a-zA-Z0-9]+)/);
 if (match) {
 modelId = match[1];
 } else {
 modelId = model3d;
 }
 }
 
 hotspot.content = {
 type: 'sketchfab',
 title: titolo,
 description: testo,
 modelId: modelId,
 url: model3d
 };
 
 const pos = new THREE.Vector3(position.x, position.y, position.z);
 this.hotspotManager.createHotspot(pos, 'tred', {
 timestamp: hotspot.timestamp,
 content: hotspot.content
 });
 
 document.getElementById('modal3d').classList.remove('active');
 this.uiManager.pendingHotspot = null;
 
 console.log('✅ Hotspot 3D creato:', hotspot.content);
 }
 
 cancel3d() {
 document.getElementById('modal3d').classList.remove('active');
 this.uiManager.pendingHotspot = null;
 }

 
 loadPercorsoInEditor(nome) {
 const percorso = this.uiManager.percorsiAttivi[nome];
 if (!percorso) {
 alert('❌ Percorso non trovato!');
 return;
 }

 console.log('🔧 Caricamento percorso editor:', nome);
 console.log('📦 Hotspots percorso:', percorso.hotspots);
 console.log('⚡ Hotspots temporanei prima:', this.uiManager.hotspotTemporanei);

 // Imposta il percorso come corrente
 this.uiManager.percorsoCorrente = nome;

 // Carica gli hotspot del percorso (DEEP COPY per evitare riferimenti condivisi)
 if (percorso.hotspots) {
 // 🔧 IMPORTANTE: Facciamo una copia profonda degli hotspot
 this.uiManager.hotspotTemporanei = {};
 Object.keys(percorso.hotspots).forEach(fotoNum => {
 this.uiManager.hotspotTemporanei[fotoNum] = percorso.hotspots[fotoNum].map(h => ({...h}));
 });
 console.log('⚡ Hotspots temporanei dopo (deep copy):', this.uiManager.hotspotTemporanei);
 }

 // Se ci sono punti, vai al primo punto
 if (percorso.punti && percorso.punti.length > 0) {
 const primaFoto = percorso.punti[0].foto_numero;
 this.navigateToFoto(primaFoto);
 }

 // Aggiorna la UI
 this.uiManager.aggiornaListaPercorsi();
 this.uiManager.aggiornaListaHotspot();

 alert(`✏️ Percorso "${nome}" caricato nell'editor!\n\n` +
 `📸 ${percorso.punti.length} punti\n` +
 `🎯 ${Object.keys(percorso.hotspots || {}).reduce((acc, key) => acc + percorso.hotspots[key].length, 0)} hotspot totali\n\n` +
 `Ora puoi:\n` +
 `• Navigare tra le foto con il selettore in alto\n` +
 `• Click per aggiungere nuovi hotspot\n` +
 `• SHIFT+Click su un hotspot per modificarlo\n` +
 `• Usare i bottoni Play per vedere l'anteprima`);
 }

 navigateToFoto(fotoNumero) {
 document.getElementById('fotoSelect').value = fotoNumero;
 this.uiManager.currentFoto = fotoNumero;
 this.loadCurrentFoto();
 }
 
 updateLoop() {
 requestAnimationFrame(() => this.updateLoop());
 this.controls.update();
 }
}

window.addEventListener('DOMContentLoaded', () => {
 const app = new App();
 app.init();
 window.app = app;
});
