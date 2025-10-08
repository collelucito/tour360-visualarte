// ====================================================
// VIEWER THREE.JS PROFESSIONALE - AGGIORNATO 03/10/2025
// Supporto completo 4 hotspot: incrocio, chiedi, more, tred
// ====================================================

let scene, camera, renderer;
let sphere, sphereMaterial;
let tourData = null;
let currentIndex = 0;
let hotspotMeshes = [];

// Crossfade System
let currentTexture = null;
let nextTexture = null;
let isTransitioning = false;
let transitionProgress = 0;
let transitionSpeed = 0.015;

// Camera Controls
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isUserInteracting = false;
let onPointerDownMouseX = 0, onPointerDownMouseY = 0;
let lon = 0, onPointerDownLon = 0;
let lat = 0, onPointerDownLat = 0;
let phi = 0, theta = 0;

// Texture Cache
let textureCache = {};

// ==================== CROSSFADE SHADER ====================
const crossfadeVertexShader = `
 varying vec2 vUv;
 void main() {
 vUv = uv;
 gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
 }
`;

const crossfadeFragmentShader = `
 uniform sampler2D texture1;
 uniform sampler2D texture2;
 uniform float mixRatio;
 varying vec2 vUv;
 
 void main() {
 vec4 color1 = texture2D(texture1, vUv);
 vec4 color2 = texture2D(texture2, vUv);
 gl_FragColor = mix(color1, color2, mixRatio);
 }
`;

// ==================== INIT ====================
window.onload = function() {
 // Gestione caricamento JSON
 document.getElementById('json-file-input').addEventListener('change', handleFileSelect);
 
 console.log('✅ Viewer Three.js Ready - Supporto 4 hotspot');
};

function handleFileSelect(event) {
 const file = event.target.files[0];
 if (!file) return;

 const reader = new FileReader();
 reader.onload = function(e) {
 try {
 tourData = JSON.parse(e.target.result);
 console.log('📦 Tour caricato:', tourData);

 // Nascondi selettore
 document.getElementById('file-selector').classList.add('hidden');

 // Aggiorna titolo mappa con nome percorso
 const nomePercorso = tourData.nome || 'Mappa';
 document.querySelector('#floorplan h3').textContent = `📍 ${nomePercorso}`;

 // Inizia tour
 initThreeJS();
 preloadAllImages();
 loadPunto(0);
 generateFloorplan();

 // Aggiungi sfondo prima foto alla card mappa
 if (tourData.punti && tourData.punti.length > 0) {
 const primaFoto = tourData.punti[0].foto;
 const floorplanDiv = document.getElementById('floorplan');
 floorplanDiv.style.backgroundImage = `url('${primaFoto}')`;
 floorplanDiv.style.backgroundSize = 'cover';
 floorplanDiv.style.backgroundPosition = 'center';
 floorplanDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
 floorplanDiv.style.backgroundBlendMode = 'darken';
 }

 } catch (error) {
 alert('❌ Errore nel file JSON: ' + error.message);
 }
 };
 reader.readAsText(file);
}

// ==================== THREE.JS INIT ====================
function initThreeJS() {
 const container = document.getElementById('viewer-container');
 
 scene = new THREE.Scene();
 
 camera = new THREE.PerspectiveCamera(
 75,
 window.innerWidth / window.innerHeight,
 0.1,
 1000
 );
 camera.position.set(0, 0, 0.1);
 
 renderer = new THREE.WebGLRenderer({ antialias: true });
 renderer.setSize(window.innerWidth, window.innerHeight);
 renderer.setPixelRatio(window.devicePixelRatio);
 container.appendChild(renderer.domElement);
 
 const geometry = new THREE.SphereGeometry(500, 60, 40);
 geometry.scale(-1, 1, 1);
 
 sphereMaterial = new THREE.ShaderMaterial({
 uniforms: {
 texture1: { value: null },
 texture2: { value: null },
 mixRatio: { value: 0.0 }
 },
 vertexShader: crossfadeVertexShader,
 fragmentShader: crossfadeFragmentShader,
 side: THREE.DoubleSide
 });
 
 sphere = new THREE.Mesh(geometry, sphereMaterial);
 scene.add(sphere);
 
 const ambientLight = new THREE.AmbientLight(0xffffff, 1);
 scene.add(ambientLight);
 
 // Events
 renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
 renderer.domElement.addEventListener('pointermove', onPointerMove, false);
 renderer.domElement.addEventListener('pointerup', onPointerUp, false);
 renderer.domElement.addEventListener('wheel', onWheel, false);
 window.addEventListener('resize', onWindowResize, false);
 
 animate();
 
 console.log('✅ Three.js Engine inizializzato');
}

// ==================== CAMERA CONTROLS ====================
function onPointerDown(event) {
 isUserInteracting = true;
 onPointerDownMouseX = event.clientX;
 onPointerDownMouseY = event.clientY;
 onPointerDownLon = lon;
 onPointerDownLat = lat;
}

function onPointerMove(event) {
 if (isUserInteracting) {
 lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
 lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;
 }
 
 mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
 mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onPointerUp(event) {
 if (isUserInteracting) {
 const dx = Math.abs(event.clientX - onPointerDownMouseX);
 const dy = Math.abs(event.clientY - onPointerDownMouseY);
 
 if (dx < 5 && dy < 5) {
 handleClick(event);
 }
 }
 isUserInteracting = false;
}

function handleClick(event) {
 mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
 mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

 raycaster.setFromCamera(mouse, camera);

 const intersects = raycaster.intersectObjects(hotspotMeshes, true);
 if (intersects.length > 0) {
 console.log('🖱️ Click su oggetto:', intersects[0].object);

 // Cerca il gruppo parent che contiene l'hotspot
 let targetObject = intersects[0].object;
 while (targetObject && !targetObject.userData.hotspot) {
 targetObject = targetObject.parent;
 }

 if (targetObject && targetObject.userData.hotspot) {
 const hotspot = targetObject.userData.hotspot;
 console.log('✅ Hotspot trovato:', hotspot.tipo);
 if (hotspot.clickHandler) {
 hotspot.clickHandler();
 } else {
 console.warn('⚠️ Hotspot senza clickHandler');
 }
 } else {
 console.warn('⚠️ Nessun hotspot userData trovato');
 }
 }
}

function onWheel(event) {
 event.preventDefault();
 camera.fov += event.deltaY * 0.05;
 camera.fov = Math.max(30, Math.min(120, camera.fov));
 camera.updateProjectionMatrix();
}

function onWindowResize() {
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== ANIMATION ====================
function animate() {
 requestAnimationFrame(animate);
 update();
 
 if (isTransitioning) {
 transitionProgress += transitionSpeed;
 sphereMaterial.uniforms.mixRatio.value = transitionProgress;
 
 if (transitionProgress >= 1.0) {
 isTransitioning = false;
 transitionProgress = 0;
 sphereMaterial.uniforms.texture1.value = nextTexture;
 sphereMaterial.uniforms.mixRatio.value = 0.0;
 currentTexture = nextTexture;
 nextTexture = null;
 }
 }
 
 renderer.render(scene, camera);
}

function update() {
 lat = Math.max(-85, Math.min(85, lat));
 phi = THREE.MathUtils.degToRad(90 - lat);
 theta = THREE.MathUtils.degToRad(lon);
 
 camera.target = new THREE.Vector3(
 500 * Math.sin(phi) * Math.cos(theta),
 500 * Math.cos(phi),
 500 * Math.sin(phi) * Math.sin(theta)
 );
 
 camera.lookAt(camera.target);
}

// ==================== TEXTURE LOADING ====================
function preloadAllImages() {
 console.log('📥 Precaricamento immagini...');
 if (tourData.punti) {
 tourData.punti.forEach(punto => {
 const img = new Image();
 img.src = punto.foto;
 console.log('✅ Precaricata:', punto.foto);
 });
 }
}

function loadTextureCrossfade(filename, callback) {
 if (textureCache[filename]) {
 applicaTexture(textureCache[filename], callback);
 return;
 }
 
 const textureLoader = new THREE.TextureLoader();
 
 textureLoader.load(
 filename,
 function(texture) {
 textureCache[filename] = texture;
 applicaTexture(texture, callback);
 },
 undefined,
 function(error) {
 console.error('❌ Errore caricamento:', error);
 }
 );
}

function applicaTexture(texture, callback) {
 if (!currentTexture) {
 currentTexture = texture;
 sphereMaterial.uniforms.texture1.value = texture;
 sphereMaterial.uniforms.mixRatio.value = 0.0;
 } else {
 nextTexture = texture;
 sphereMaterial.uniforms.texture2.value = texture;
 isTransitioning = true;
 transitionProgress = 0;
 }
 
 if (callback) callback();
}

// ==================== LOAD PUNTO ====================
function loadPunto(index) {
 if (!tourData || index < 0 || index >= tourData.punti.length) return;
 
 currentIndex = index;
 const punto = tourData.punti[index];
 
 // Update UI
 document.getElementById('punto-title').textContent = punto.nome;
 document.getElementById('punto-desc').textContent = punto.descrizione;
 
 // Clear old hotspots
 clearHotspots();
 
 // Load texture
 loadTextureCrossfade(punto.foto, function() {
 document.getElementById('loading').classList.add('hidden');
 
 // Get hotspots for this foto
 const fotoHotspots = tourData.hotspots[punto.foto_numero] || [];
 addHotspots(fotoHotspots, punto.foto_numero);
 });
 
 // Update floorplan
 updateFloorplan();
}

// ==================== HOTSPOTS ====================
function clearHotspots() {
 hotspotMeshes.forEach(mesh => {
 if (mesh.parent) mesh.parent.remove(mesh);
 if (mesh.geometry) mesh.geometry.dispose();
 if (mesh.material) mesh.material.dispose();
 });
 hotspotMeshes = [];
}

function addHotspots(hotspots, currentFoto) {
 if (!hotspots || hotspots.length === 0) {
 console.log('ℹ️ Nessun hotspot per foto', currentFoto);
 return;
 }
 
 console.log(`📌 Caricamento ${hotspots.length} hotspot per foto ${currentFoto}`);
 
 hotspots.forEach((h, index) => {
 const position = new THREE.Vector3(h.position.x, h.position.y, h.position.z);
 const hotspotGroup = createHotspotMesh(h, position);
 
 // INCROCIO - Navigazione
 if (h.tipo === 'incrocio') {
 hotspotGroup.userData.hotspot = {
 ...h,
 clickHandler: function() {
 const targetIndex = tourData.punti.findIndex(p => p.foto_numero === h.targetFoto);
 if (targetIndex >= 0) {
 console.log(`🔄 Navigazione verso foto ${h.targetFoto}`);
 loadPunto(targetIndex);
 } else {
 console.warn(`⚠️ Foto target ${h.targetFoto} non trovata`);
 }
 }
 };
 } 
 // CHIEDI - Video/Audio/Gallery
 else if (h.tipo === 'chiedi') {
 hotspotGroup.userData.hotspot = {
 ...h,
 clickHandler: function() {
 console.log('🎬 Apertura modal MP4');
 openChiediModal(h);
 }
 };
 } 
 // MORE - Testi/Info
 else if (h.tipo === 'more') {
 hotspotGroup.userData.hotspot = {
 ...h,
 clickHandler: function() {
 console.log('ℹ️ Apertura modal MORE');
 openMoreModal(h);
 }
 };
 } 
 // TRED - Modelli 3D
 else if (h.tipo === 'tred') {
 hotspotGroup.userData.hotspot = {
 ...h,
 clickHandler: function() {
 console.log('🗿 Apertura modal 3D');
 open3dModal(h);
 }
 };
 }
 
 scene.add(hotspotGroup);
 hotspotMeshes.push(hotspotGroup);
 
 console.log(`✅ [${index + 1}/${hotspots.length}] Hotspot ${h.tipo} creato`);
 });
}

function createHotspotMesh(hotspot, position) {
 const group = new THREE.Group();

 // Colori, dimensioni e testo per tipo (allineato con preview.js)
 let color, size, text;
 switch(hotspot.tipo) {
 case 'incrocio':
 color = 0x4CAF50;
 size = 30;
 text = 'GO';
 break;
 case 'chiedi':
 color = 0xFF9800;
 size = 28;
 text = 'MP4';
 break;
 case 'more':
 color = 0x2196F3;
 size = 28;
 text = 'INFO';
 break;
 case 'tred':
 color = 0x9C27B0;
 size = 28;
 text = '3D';
 break;
 default:
 color = 0xFFFFFF;
 size = 25;
 text = '?';
 }

 // Sfera base
 const geometry = new THREE.SphereGeometry(size, 16, 16);
 const material = new THREE.MeshStandardMaterial({
 color: color,
 transparent: true,
 opacity: 0.85,
 emissive: color,
 emissiveIntensity: 0.6,
 roughness: 0.3,
 metalness: 0.1
 });

 const sphere = new THREE.Mesh(geometry, material);
 sphere.material.depthTest = false;
 group.add(sphere);

 // Sprite con testo
 const canvas = document.createElement('canvas');
 canvas.width = 128;
 canvas.height = 128;
 const ctx = canvas.getContext('2d');

 // Testo
 ctx.fillStyle = 'white';
 ctx.font = 'bold 48px Arial';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(text, 64, 64);

 const texture = new THREE.CanvasTexture(canvas);
 const spriteMaterial = new THREE.SpriteMaterial({
 map: texture,
 transparent: true,
 depthTest: false
 });
 const sprite = new THREE.Sprite(spriteMaterial);
 sprite.scale.set(size * 1.8, size * 1.8, 1);
 group.add(sprite);

 // Posizionamento
 group.position.set(position.x, position.y, position.z);

 // 📏 Applica scala salvata se presente (come in preview.js)
 if (hotspot.scale) {
 const scaleToApply = Math.max(0.5, hotspot.scale);
 group.scale.set(scaleToApply, scaleToApply, scaleToApply);
 console.log(`📏 Viewer: Scala applicata ${scaleToApply} per hotspot ${hotspot.tipo}`);
 }

 group.renderOrder = 999;
 
 // Animazione pulse
 const originalScale = group.scale.clone();
 let time = Math.random() * Math.PI * 2;
 function animatePulse() {
 time += 0.08;
 const scale = 1 + Math.sin(time) * 0.25;
 group.scale.set(originalScale.x * scale, originalScale.y * scale, originalScale.z * scale);
 if (group.parent) {
 requestAnimationFrame(animatePulse);
 }
 }
 animatePulse();
 
 return group;
}

// ==================== FLOORPLAN ====================
function generateFloorplan() {
 const canvas = document.getElementById('floorplan-canvas');
 canvas.innerHTML = '';
 
 if (!tourData || !tourData.punti) return;
 
 const punti = tourData.punti;
 const width = 270;
 const height = 155;
 const margin = 20;
 
 const centerX = width / 2;
 const centerY = height / 2;
 const radius = Math.min(width, height) / 2 - margin;
 
 punti.forEach((punto, i) => {
 const angle = (i / punti.length) * 2 * Math.PI - Math.PI / 2;
 const x = centerX + radius * Math.cos(angle);
 const y = centerY + radius * Math.sin(angle);
 
 const dot = document.createElement('div');
 dot.className = 'floorplan-point';
 if (i === currentIndex) {
 dot.classList.add('active');
 }
 dot.style.left = `${x}px`;
 dot.style.top = `${y}px`;
 dot.title = punto.nome;
 dot.onclick = () => loadPunto(i);
 canvas.appendChild(dot);
 
 // Linee di connessione
 if (i < punti.length - 1) {
 const nextAngle = ((i + 1) / punti.length) * 2 * Math.PI - Math.PI / 2;
 const nextX = centerX + radius * Math.cos(nextAngle);
 const nextY = centerY + radius * Math.sin(nextAngle);
 
 const dx = nextX - x;
 const dy = nextY - y;
 const length = Math.sqrt(dx * dx + dy * dy);
 const angle2 = Math.atan2(dy, dx) * 180 / Math.PI;
 
 const line = document.createElement('div');
 line.className = 'floorplan-line';
 line.style.left = `${x}px`;
 line.style.top = `${y}px`;
 line.style.width = `${length}px`;
 line.style.transform = `rotate(${angle2}deg)`;
 canvas.appendChild(line);
 }
 });
}

function updateFloorplan() {
 const dots = document.querySelectorAll('.floorplan-point');
 dots.forEach((dot, i) => {
 if (i === currentIndex) {
 dot.classList.add('active');
 } else {
 dot.classList.remove('active');
 }
 });
}

// ==================== MODALS ====================
function openChiediModal(hotspot) {
 const modal = document.getElementById('modal-mp4');
 const content = document.getElementById('modal-mp4-content');
 
 const c = hotspot.content;
 if (!c) {
 content.innerHTML = '<p>⚠️ Nessun contenuto disponibile</p>';
 modal.classList.add('active');
 return;
 }
 
 let html = '<h2 style="color: #FF9800; margin-bottom: 20px;">🎬 Contenuti Multimediali</h2>';
 
 // VIDEO
 if (c.type === 'video' || c.video) {
 const videoSrc = c.src || c.video;
 html += `<h3>📹 Video</h3>
 <video controls style="width:100%; max-height:500px; border-radius:10px; margin-bottom:25px;">
 <source src="${videoSrc}" type="video/mp4">
 Il tuo browser non supporta video HTML5.
 </video>`;
 if (c.title) html += `<h4>${c.title}</h4>`;
 if (c.description) html += `<p>${c.description}</p>`;
 }
 
 // AUDIO
 if (c.type === 'audio' || c.audio) {
 const audioSrc = c.src || c.audio;
 html += `<h3 style="margin-top:25px;">🎵 Audio</h3>`;
 if (c.title) html += `<h4>${c.title}</h4>`;
 if (c.description) html += `<p style="margin-bottom:15px;">${c.description}</p>`;
 html += `<audio controls style="width:100%; margin-bottom:20px;">
 <source src="${audioSrc}" type="audio/mpeg">
 Il tuo browser non supporta audio HTML5.
 </audio>`;
 }
 
 // GALLERY
 if (c.gallery && c.gallery.length > 0) {
 html += '<h3 style="margin-top:25px;">🖼️ Galleria</h3>';
 html += '<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:15px; margin-top:15px;">';
 c.gallery.forEach(img => {
 html += `<img src="${img}" style="width:100%; height:200px; object-fit:cover; border-radius:10px; cursor:pointer;" onclick="window.open('${img}', '_blank')">`;
 });
 html += '</div>';
 }
 
 content.innerHTML = html;
 modal.classList.add('active');
}

function openMoreModal(hotspot) {
 const modal = document.getElementById('modal-more');
 const content = document.getElementById('modal-more-content');
 
 const c = hotspot.content;
 if (!c) {
 content.innerHTML = '<p>⚠️ Nessun contenuto disponibile</p>';
 modal.classList.add('active');
 return;
 }
 
 let html = `<h2 style="color: #2196F3; margin-bottom: 20px;">${c.title || c.titolo || 'ℹ️ Informazioni'}</h2>`;
 
 // TESTO HTML
 if (c.html) {
 html += c.html;
 } else if (c.text || c.testo) {
 html += `<p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">${c.text || c.testo}</p>`;
 }
 
 // WIKIPEDIA
 if (c.wikipedia && c.wikipedia.trim() !== '') {
 html += `<div style="margin-top:25px;">
 <a href="${c.wikipedia}" target="_blank" style="display:inline-block; background:#2196F3; color:white; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:600;">
 📖 Leggi su Wikipedia
 </a>
 </div>`;
 }
 
 content.innerHTML = html;
 modal.classList.add('active');
}

function open3dModal(hotspot) {
 const modal = document.getElementById('modal-3d');
 const content = document.getElementById('modal-3d-content');
 
 const c = hotspot.content;
 if (!c) {
 content.innerHTML = '<p>⚠️ Nessun modello 3D disponibile</p>';
 modal.classList.add('active');
 return;
 }
 
 let embedUrl = '';
 
 // SKETCHFAB
 if (c.type === 'sketchfab' || c.modelId) {
 const modelId = c.modelId;
 embedUrl = `https://sketchfab.com/models/${modelId}/embed?autostart=1&ui_theme=dark&preload=1`;
 } 
 // URL DIRETTO
 else if (c.model3d) {
 let modelUrl = c.model3d.trim();
 if (modelUrl.includes('/embed')) {
 embedUrl = modelUrl;
 } else if (modelUrl.includes('sketchfab.com')) {
 const parts = modelUrl.split('/');
 const modelId = parts[parts.length - 1].split('-').pop();
 embedUrl = `https://sketchfab.com/models/${modelId}/embed?autostart=1&ui_theme=dark`;
 }
 }
 
 let html = `<h2 style="color: #9C27B0; margin-bottom: 20px;">${c.title || c.titolo || '🗿 Modello 3D'}</h2>`;
 
 if (c.description || c.testo) {
 html += `<div style="margin-bottom: 20px; line-height:1.6;">${c.description || c.testo}</div>`;
 }
 
 if (embedUrl) {
 html += `<iframe src="${embedUrl}" width="100%" height="600" style="border:none; border-radius:10px;" allowfullscreen allow="autoplay; fullscreen; xr-spatial-tracking"></iframe>`;
 html += `<p style="margin-top:15px; font-size:13px; color:#999;">💡 Usa il mouse per ruotare, la rotellina per zoomare</p>`;
 } else {
 html += '<p style="color:#f44336;">❌ URL modello 3D non valido</p>';
 }
 
 content.innerHTML = html;
 modal.classList.add('active');
}

function closeModal(modalId) {
 document.getElementById(modalId).classList.remove('active');
 // Stop videos/audio
 const modal = document.getElementById(modalId);
 const videos = modal.querySelectorAll('video');
 const audios = modal.querySelectorAll('audio');
 videos.forEach(v => v.pause());
 audios.forEach(a => a.pause());
}

// ==================== UTILITY ====================
function changeFile() {
 if (confirm('Vuoi caricare un altro tour?')) {
 location.reload();
 }
}

console.log('✅ Viewer Three.js Seamless - Ready (4 Hotspot Support)');
console.log('📌 Tipi supportati: incrocio, chiedi, more, tred');
