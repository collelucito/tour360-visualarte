// ========================================
// CONTENT MODAL - Text, Images, 3D Models
// AGGIORNATO 03/10/2025 - Supporto titolo/testo/wikipedia
// ========================================

export class ContentModal {
 constructor() {
 this.modal = null;
 this.viewer3D = null;
 this.currentGalleryIndex = 0;
 this.isOpen = false;
 
 console.log('✅ Content Modal ready');
 }
 
 init() {
 const modalHTML = `
 <div id="contentModal" class="content-modal">
 <div class="content-modal-overlay"></div>
 <div class="content-modal-content">
 <button class="content-modal-close">✕</button>
 <div class="content-modal-header">
 <h2 id="contentTitle">Titolo</h2>
 </div>
 <div class="content-modal-body" id="contentBody">
 <!-- Dynamic content here -->
 </div>
 <div class="content-modal-controls">
 <button id="contentToggleSize" class="btn-toggle-size">⛶ Espandi</button>
 </div>
 </div>
 </div>
 `;
 
 document.body.insertAdjacentHTML('beforeend', modalHTML);
 
 this.modal = document.getElementById('contentModal');
 
 // Event listeners
 this.modal.querySelector('.content-modal-close').addEventListener('click', () => this.close());
 this.modal.querySelector('.content-modal-overlay').addEventListener('click', () => this.close());
 this.modal.querySelector('#contentToggleSize').addEventListener('click', () => this.toggleSize());
 
 document.addEventListener('keydown', (e) => {
 if (e.key === 'Escape' && this.isOpen) {
 this.close();
 }
 });
 
 console.log('✅ Content Modal initialized');
 }
 
 open(content) {
 if (!this.modal) {
 this.init();
 }
 
 console.log('📖 Content modal opening with:', content);
 
 // Auto-detect type if missing
 if (!content.type) {
 if (content.titolo || content.testo || content.title || content.text || content.wikipedia) {
 content.type = 'text';
 } else if (content.modelId) {
 content.type = 'sketchfab';
 }
 }
 
 document.getElementById('contentTitle').textContent = content.title || content.titolo || 'Contenuto';
 
 const body = document.getElementById('contentBody');
 body.innerHTML = '';
 
 // Render content based on type
 switch(content.type) {
 case 'text':
 this.renderText(body, content);
 break;
 case 'image':
 this.renderImage(body, content);
 break;
 case 'gallery':
 this.renderGallery(body, content);
 break;
 case 'model3d':
 this.renderModel3D(body, content);
 break;
 case 'sketchfab':
 this.renderSketchfab(body, content);
 break;
 case 'mixed':
 this.renderMixed(body, content);
 break;
 default:
 body.innerHTML = '<p style="color:#999;">Tipo di contenuto non supportato</p>';
 console.warn('⚠️ Unsupported content type:', content.type);
 }
 
 this.modal.classList.add('active');
 this.isOpen = true;
 
 console.log('✅ Content modal opened');
 }
 
 renderText(container, content) {
 const textDiv = document.createElement('div');
 textDiv.className = 'text-content scrollable';
 
 // Support both html and titolo/testo format
 if (content.html) {
 textDiv.innerHTML = content.html;
 } else {
 let html = '';
 
 if (content.titolo || content.title) {
 html += `<h2 style="color:white; margin-bottom:15px;">${content.titolo || content.title}</h2>`;
 }
 
 if (content.testo || content.text) {
 html += `<p style="line-height:1.8; margin-bottom:20px;">${content.testo || content.text}</p>`;
 }
 
 if (content.wikipedia) {
 html += `<p style="margin-top:25px;">
 <a href="${content.wikipedia}" target="_blank" style="display:inline-block; background:#2196F3; color:white; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:600;">
 📖 Leggi su Wikipedia
 </a>
 </p>`;
 }
 
 textDiv.innerHTML = html || '<p style="color:#999;">Nessun contenuto disponibile</p>';
 }
 
 container.appendChild(textDiv);
 }
 
 renderImage(container, content) {
 const imgWrapper = document.createElement('div');
 imgWrapper.className = 'image-wrapper';
 
 const img = document.createElement('img');
 img.src = content.src;
 img.alt = content.title || 'Image';
 img.style.maxWidth = '100%';
 img.style.borderRadius = '8px';
 
 imgWrapper.appendChild(img);
 
 if (content.description) {
 const desc = document.createElement('p');
 desc.className = 'image-caption';
 desc.textContent = content.description;
 imgWrapper.appendChild(desc);
 }
 
 container.appendChild(imgWrapper);
 }
 
 renderGallery(container, content) {
 this.currentGalleryIndex = 0;
 
 const galleryWrapper = document.createElement('div');
 galleryWrapper.className = 'gallery-wrapper';
 
 const mainImg = document.createElement('img');
 mainImg.id = 'galleryMainImage';
 mainImg.src = content.images[0].src;
 mainImg.alt = content.images[0].caption || '';
 
 const caption = document.createElement('p');
 caption.id = 'galleryCaption';
 caption.className = 'gallery-caption';
 caption.textContent = content.images[0].caption || '';
 
 const nav = document.createElement('div');
 nav.className = 'gallery-nav';
 
 const prevBtn = document.createElement('button');
 prevBtn.className = 'gallery-btn gallery-prev';
 prevBtn.innerHTML = '◀';
 prevBtn.onclick = () => this.galleryPrev(content.images);
 
 const counter = document.createElement('span');
 counter.id = 'galleryCounter';
 counter.className = 'gallery-counter';
 counter.textContent = `1 / ${content.images.length}`;
 
 const nextBtn = document.createElement('button');
 nextBtn.className = 'gallery-btn gallery-next';
 nextBtn.innerHTML = '▶';
 nextBtn.onclick = () => this.galleryNext(content.images);
 
 nav.appendChild(prevBtn);
 nav.appendChild(counter);
 nav.appendChild(nextBtn);
 
 const thumbs = document.createElement('div');
 thumbs.className = 'gallery-thumbs';
 
 content.images.forEach((img, index) => {
 const thumb = document.createElement('img');
 thumb.src = img.src;
 thumb.className = index === 0 ? 'active' : '';
 thumb.onclick = () => this.galleryGoTo(content.images, index);
 thumbs.appendChild(thumb);
 });
 
 galleryWrapper.appendChild(mainImg);
 galleryWrapper.appendChild(caption);
 galleryWrapper.appendChild(nav);
 galleryWrapper.appendChild(thumbs);
 
 container.appendChild(galleryWrapper);
 
 const handleKey = (e) => {
 if (!this.isOpen) return;
 if (e.key === 'ArrowLeft') this.galleryPrev(content.images);
 if (e.key === 'ArrowRight') this.galleryNext(content.images);
 };
 document.addEventListener('keydown', handleKey);
 
 console.log('✅ Gallery loaded:', content.images.length, 'images');
 }
 
 galleryGoTo(images, index) {
 this.currentGalleryIndex = index;
 
 const mainImg = document.getElementById('galleryMainImage');
 const caption = document.getElementById('galleryCaption');
 const counter = document.getElementById('galleryCounter');
 
 mainImg.src = images[index].src;
 caption.textContent = images[index].caption || '';
 counter.textContent = `${index + 1} / ${images.length}`;
 
 document.querySelectorAll('.gallery-thumbs img').forEach((thumb, i) => {
 thumb.classList.toggle('active', i === index);
 });
 }
 
 galleryNext(images) {
 this.currentGalleryIndex = (this.currentGalleryIndex + 1) % images.length;
 this.galleryGoTo(images, this.currentGalleryIndex);
 }
 
 galleryPrev(images) {
 this.currentGalleryIndex = (this.currentGalleryIndex - 1 + images.length) % images.length;
 this.galleryGoTo(images, this.currentGalleryIndex);
 }
 
 renderModel3D(container, content) {
 const viewer = document.createElement('div');
 viewer.id = 'model3DViewer';
 viewer.style.width = '100%';
 viewer.style.height = '500px';
 viewer.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
 viewer.style.borderRadius = '8px';
 viewer.style.position = 'relative';
 
 container.appendChild(viewer);
 
 this.load3DModel(viewer, content);
 
 if (content.description) {
 const desc = document.createElement('p');
 desc.className = 'model-description';
 desc.textContent = content.description;
 container.appendChild(desc);
 }
 }
 
 load3DModel(container, content) {
 // Three.js scene would go here - simplified for now
 container.innerHTML = '<p style="color:#999; padding:20px; text-align:center;">3D Model viewer (Three.js GLB loader)</p>';
 }
 
 renderSketchfab(container, content) {
 const iframe = document.createElement('iframe');
 iframe.src = `https://sketchfab.com/models/${content.modelId}/embed?autostart=1&ui_theme=dark&preload=1`;
 iframe.style.width = '100%';
 iframe.style.height = '600px';
 iframe.style.border = 'none';
 iframe.style.borderRadius = '8px';
 iframe.allowFullscreen = true;
 iframe.setAttribute('allow', 'autoplay; fullscreen; xr-spatial-tracking');
 
 container.appendChild(iframe);
 
 if (content.description || content.testo) {
 const desc = document.createElement('p');
 desc.className = 'model-description';
 desc.style.marginTop = '20px';
 desc.style.lineHeight = '1.6';
 desc.textContent = content.description || content.testo;
 container.appendChild(desc);
 }
 
 console.log('✅ Sketchfab model loaded:', content.modelId);
 }
 
 renderMixed(container, content) {
 content.items.forEach(item => {
 switch(item.type) {
 case 'text':
 this.renderText(container, item);
 break;
 case 'image':
 this.renderImage(container, item);
 break;
 case 'model3d':
 this.renderModel3D(container, item);
 break;
 }
 });
 }
 
 toggleSize() {
 const modalContent = this.modal.querySelector('.content-modal-content');
 const btn = document.getElementById('contentToggleSize');
 
 if (modalContent.classList.contains('expanded')) {
 modalContent.classList.remove('expanded');
 btn.textContent = '⛶ Espandi';
 } else {
 modalContent.classList.add('expanded');
 btn.textContent = '⛶ Riduci';
 }
 }
 
 close() {
 if (this.viewer3D) {
 this.viewer3D.renderer.dispose();
 this.viewer3D = null;
 }
 
 this.modal.classList.remove('active');
 this.isOpen = false;
 
 console.log('✅ Content modal closed');
 }
}

// CSS Styles
const style = document.createElement('style');
style.textContent = `
 .content-modal {
 display: none;
 position: fixed;
 top: 0;
 left: 0;
 width: 100vw;
 height: 100vh;
 z-index: 10000;
 }
 
 .content-modal.active {
 display: block;
 }
 
 .content-modal-overlay {
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 background: rgba(0, 0, 0, 0.9);
 backdrop-filter: blur(10px);
 }
 
 .content-modal-content {
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translate(-50%, -50%);
 background: #1a1a1a;
 border-radius: 12px;
 padding: 30px;
 width: 80%;
 max-width: 1000px;
 max-height: 90vh;
 overflow-y: auto;
 box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
 transition: all 0.3s ease;
 }
 
 .content-modal-content.expanded {
 width: 95%;
 max-width: 1600px;
 max-height: 95vh;
 }
 
 .content-modal-close {
 position: absolute;
 top: 15px;
 right: 15px;
 background: rgba(244, 67, 54, 0.9);
 border: 2px solid white;
 color: white;
 font-size: 32px;
 font-weight: bold;
 width: 45px;
 height: 45px;
 border-radius: 50%;
 cursor: pointer;
 transition: all 0.2s;
 z-index: 10;
 display: flex;
 align-items: center;
 justify-content: center;
 line-height: 1;
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
 }
 
 .content-modal-close:hover {
 background: rgba(255, 255, 255, 0.95);
 color: #f44336;
 transform: rotate(90deg) scale(1.1);
 box-shadow: 0 6px 20px rgba(255, 255, 255, 0.4);
 }
 
 .content-modal-header {
 margin-bottom: 25px;
 }
 
 .content-modal-header h2 {
 color: white;
 margin: 0;
 font-size: 26px;
 }
 
 .content-modal-body {
 margin-bottom: 20px;
 color: #ddd;
 }
 
 .content-modal-controls {
 display: flex;
 justify-content: center;
 gap: 10px;
 padding-top: 15px;
 border-top: 1px solid #333;
 }
 
 .btn-toggle-size {
 background: #2196F3;
 color: white;
 border: none;
 padding: 10px 20px;
 border-radius: 6px;
 cursor: pointer;
 font-size: 14px;
 font-weight: 600;
 transition: all 0.2s;
 }
 
 .btn-toggle-size:hover {
 background: #1976D2;
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
 }
 
 .text-content {
 line-height: 1.8;
 font-size: 16px;
 }
 
 .text-content.scrollable {
 max-height: 60vh;
 overflow-y: auto;
 padding-right: 15px;
 }
 
 .text-content h1, .text-content h2, .text-content h3 {
 color: white;
 margin-top: 25px;
 margin-bottom: 15px;
 }
 
 .text-content p {
 margin-bottom: 15px;
 }
 
 .text-content ul, .text-content ol {
 margin-left: 25px;
 margin-bottom: 15px;
 }
 
 .image-wrapper {
 text-align: center;
 }
 
 .image-caption {
 margin-top: 15px;
 color: #aaa;
 font-style: italic;
 }
 
 .gallery-wrapper {
 text-align: center;
 }
 
 #galleryMainImage {
 max-width: 100%;
 max-height: 500px;
 border-radius: 8px;
 margin-bottom: 15px;
 }
 
 .gallery-caption {
 color: #aaa;
 margin-bottom: 20px;
 font-style: italic;
 }
 
 .gallery-nav {
 display: flex;
 justify-content: center;
 align-items: center;
 gap: 20px;
 margin-bottom: 20px;
 }
 
 .gallery-btn {
 background: #2196F3;
 color: white;
 border: none;
 width: 40px;
 height: 40px;
 border-radius: 50%;
 cursor: pointer;
 font-size: 18px;
 transition: all 0.2s;
 }
 
 .gallery-btn:hover {
 background: #1976D2;
 transform: scale(1.1);
 }
 
 .gallery-counter {
 color: white;
 font-size: 16px;
 min-width: 60px;
 }
 
 .gallery-thumbs {
 display: flex;
 justify-content: center;
 gap: 10px;
 flex-wrap: wrap;
 }
 
 .gallery-thumbs img {
 width: 80px;
 height: 80px;
 object-fit: cover;
 border-radius: 6px;
 cursor: pointer;
 opacity: 0.5;
 transition: all 0.2s;
 border: 2px solid transparent;
 }
 
 .gallery-thumbs img:hover {
 opacity: 0.8;
 }
 
 .gallery-thumbs img.active {
 opacity: 1;
 border-color: #2196F3;
 }
 
 .model-description {
 margin-top: 20px;
 color: #aaa;
 line-height: 1.6;
 }
 
 .content-modal-content::-webkit-scrollbar,
 .text-content::-webkit-scrollbar {
 width: 8px;
 }
 
 .content-modal-content::-webkit-scrollbar-track,
 .text-content::-webkit-scrollbar-track {
 background: #2a2a2a;
 border-radius: 4px;
 }
 
 .content-modal-content::-webkit-scrollbar-thumb,
 .text-content::-webkit-scrollbar-thumb {
 background: #555;
 border-radius: 4px;
 }
 
 .content-modal-content::-webkit-scrollbar-thumb:hover,
 .text-content::-webkit-scrollbar-thumb:hover {
 background: #777;
 }
`;
document.head.appendChild(style);
