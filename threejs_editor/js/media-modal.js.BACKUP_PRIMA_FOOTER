// ========================================
// MEDIA MODAL - Video/Audio/Gallery Player
// AGGIORNATO 03/10/2025 - X bianca visibile
// ========================================

export class MediaModal {
 constructor() {
 this.modal = null;
 this.players = [];
 this.isOpen = false;
 
 console.log('✅ Media Modal ready');
 }
 
 init() {
 // Crea modal HTML
 const modalHTML = `
 <div id="mediaModal" class="media-modal">
 <div class="media-modal-overlay"></div>
 <div class="media-modal-content">
 <button class="media-modal-close">✕</button>
 <div class="media-modal-header">
 <h2 id="mediaTitle">🎬 Contenuti Multimediali</h2>
 <p id="mediaDescription"></p>
 </div>
 <div class="media-modal-body" id="mediaPlayer">
 <!-- Dynamic content here -->
 </div>
 <div class="media-modal-controls">
 <button id="mediaToggleSize" class="btn-toggle-size">⛶ Espandi</button>
 </div>
 </div>
 </div>
 `;
 
 document.body.insertAdjacentHTML('beforeend', modalHTML);
 
 this.modal = document.getElementById('mediaModal');
 
 // Event listeners
 this.modal.querySelector('.media-modal-close').addEventListener('click', () => this.close());
 this.modal.querySelector('.media-modal-overlay').addEventListener('click', () => this.close());
 this.modal.querySelector('#mediaToggleSize').addEventListener('click', () => this.toggleSize());
 
 // ESC key to close
 document.addEventListener('keydown', (e) => {
 if (e.key === 'Escape' && this.isOpen) {
 this.close();
 }
 });
 
 console.log('✅ Media Modal initialized');
 }
 
 open(content) {
 if (!this.modal) {
 this.init();
 }
 
 console.log('🎬 Opening media modal with content:', content);
 
 // Clear previous players
 const playerContainer = document.getElementById('mediaPlayer');
 playerContainer.innerHTML = '';
 this.players = [];
 
 // Check content structure
 let hasVideo = false;
 let hasAudio = false;
 let hasGallery = false;
 
 if (content.video || (content.type === 'video' && content.src)) {
 hasVideo = true;
 }
 if (content.audio || (content.type === 'audio' && content.src)) {
 hasAudio = true;
 }
 if (content.gallery && content.gallery.length > 0) {
 hasGallery = true;
 }
 
 // Set header
 document.getElementById('mediaTitle').textContent = content.title || '🎬 Contenuti Multimediali';
 document.getElementById('mediaDescription').textContent = content.description || '';
 
 // Render content sections
 if (hasVideo) {
 this.createVideoSection(playerContainer, content);
 }
 
 if (hasAudio) {
 this.createAudioSection(playerContainer, content);
 }
 
 if (hasGallery) {
 this.createGallerySection(playerContainer, content);
 }
 
 // If no content
 if (!hasVideo && !hasAudio && !hasGallery) {
 playerContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">⚠️ Nessun contenuto multimediale disponibile</p>';
 }
 
 // Show modal
 this.modal.classList.add('active');
 this.isOpen = true;
 
 console.log('✅ Media modal opened');
 }
 
 createVideoSection(container, content) {
 const section = document.createElement('div');
 section.className = 'media-section';
 section.innerHTML = '<h3 style="color: #FF9800; margin-bottom: 15px;">📹 Video</h3>';
 
 const videoSrc = content.video || content.src;
 
 const video = document.createElement('video');
 video.src = videoSrc;
 video.controls = true;
 video.autoplay = content.autoplay !== false;
 video.style.width = '100%';
 video.style.maxHeight = '500px';
 video.style.borderRadius = '8px';
 video.style.backgroundColor = '#000';
 
 section.appendChild(video);
 container.appendChild(section);
 
 this.players.push(video);
 
 console.log('📹 Video player created:', videoSrc);
 }
 
 createAudioSection(container, content) {
 const section = document.createElement('div');
 section.className = 'media-section';
 section.innerHTML = '<h3 style="color: #FF9800; margin-bottom: 15px;">🎵 Audio</h3>';
 
 const audioSrc = content.audio || content.src;
 
 const audioWrapper = document.createElement('div');
 audioWrapper.className = 'audio-player-wrapper';
 audioWrapper.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
 audioWrapper.style.borderRadius = '12px';
 audioWrapper.style.padding = '30px';
 audioWrapper.style.textAlign = 'center';
 audioWrapper.style.marginBottom = '20px';
 
 const audioIcon = document.createElement('div');
 audioIcon.style.fontSize = '60px';
 audioIcon.style.marginBottom = '15px';
 audioIcon.textContent = '🎵';
 
 const audioTitle = document.createElement('div');
 audioTitle.style.color = 'white';
 audioTitle.style.fontSize = '18px';
 audioTitle.style.fontWeight = 'bold';
 audioTitle.style.marginBottom = '20px';
 audioTitle.textContent = content.title || 'Audio';
 
 const audio = document.createElement('audio');
 audio.src = audioSrc;
 audio.controls = true;
 audio.autoplay = content.autoplay !== false;
 audio.style.width = '100%';
 
 audioWrapper.appendChild(audioIcon);
 audioWrapper.appendChild(audioTitle);
 audioWrapper.appendChild(audio);
 
 section.appendChild(audioWrapper);
 container.appendChild(section);
 
 this.players.push(audio);
 
 console.log('🎵 Audio player created:', audioSrc);
 }
 
 createGallerySection(container, content) {
 const section = document.createElement('div');
 section.className = 'media-section';
 section.innerHTML = '<h3 style="color: #FF9800; margin-bottom: 15px;">🖼️ Galleria Immagini</h3>';
 
 const gallery = document.createElement('div');
 gallery.style.display = 'grid';
 gallery.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
 gallery.style.gap = '15px';
 gallery.style.marginTop = '15px';
 
 content.gallery.forEach((imgSrc, index) => {
 const imgWrapper = document.createElement('div');
 imgWrapper.style.position = 'relative';
 imgWrapper.style.overflow = 'hidden';
 imgWrapper.style.borderRadius = '8px';
 imgWrapper.style.cursor = 'pointer';
 imgWrapper.style.transition = 'transform 0.3s';
 
 const img = document.createElement('img');
 img.src = imgSrc;
 img.alt = `Immagine ${index + 1}`;
 img.style.width = '100%';
 img.style.height = '200px';
 img.style.objectFit = 'cover';
 img.style.display = 'block';
 
 imgWrapper.appendChild(img);
 
 // Hover effect
 imgWrapper.addEventListener('mouseenter', () => {
 imgWrapper.style.transform = 'scale(1.05)';
 });
 imgWrapper.addEventListener('mouseleave', () => {
 imgWrapper.style.transform = 'scale(1)';
 });
 
 // Click to open full size
 imgWrapper.addEventListener('click', () => {
 window.open(imgSrc, '_blank');
 });
 
 gallery.appendChild(imgWrapper);
 });
 
 section.appendChild(gallery);
 container.appendChild(section);
 
 console.log(`🖼️ Gallery created with ${content.gallery.length} images`);
 }
 
 toggleSize() {
 const modalContent = this.modal.querySelector('.media-modal-content');
 const btn = document.getElementById('mediaToggleSize');
 
 if (modalContent.classList.contains('expanded')) {
 modalContent.classList.remove('expanded');
 btn.textContent = '⛶ Espandi';
 } else {
 modalContent.classList.add('expanded');
 btn.textContent = '⛶ Riduci';
 }
 }
 
 close() {
 // Stop all players
 this.players.forEach(player => {
 if (player && player.pause) {
 player.pause();
 player.currentTime = 0;
 }
 });
 this.players = [];
 
 this.modal.classList.remove('active');
 this.isOpen = false;
 
 console.log('❌ Media modal closed');
 }
}

// CSS Styles
const style = document.createElement('style');
style.textContent = `
 .media-modal {
 display: none;
 position: fixed;
 top: 0;
 left: 0;
 width: 100vw;
 height: 100vh;
 z-index: 10000;
 }
 
 .media-modal.active {
 display: block;
 }
 
 .media-modal-overlay {
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 background: rgba(0, 0, 0, 0.9);
 backdrop-filter: blur(10px);
 }
 
 .media-modal-content {
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
 
 .media-modal-content.expanded {
 width: 95%;
 max-width: 1400px;
 max-height: 95vh;
 }
 
 .media-modal-close {
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
 
 .media-modal-close:hover {
 background: rgba(255, 255, 255, 0.95);
 color: #f44336;
 transform: rotate(90deg) scale(1.1);
 box-shadow: 0 6px 20px rgba(255, 255, 255, 0.4);
 }
 
 .media-modal-header {
 margin-bottom: 25px;
 }
 
 .media-modal-header h2 {
 color: white;
 margin: 0 0 10px 0;
 font-size: 24px;
 }
 
 .media-modal-header p {
 color: #aaa;
 margin: 0;
 line-height: 1.6;
 }
 
 .media-modal-body {
 margin-bottom: 20px;
 color: white;
 }
 
 .media-section {
 margin-bottom: 30px;
 }
 
 .media-section:last-child {
 margin-bottom: 0;
 }
 
 .media-modal-controls {
 display: flex;
 justify-content: center;
 gap: 10px;
 padding-top: 20px;
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
 transition: all 0.2s;
 font-weight: 600;
 }
 
 .btn-toggle-size:hover {
 background: #1976D2;
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
 }
 
 /* Scrollbar styling */
 .media-modal-content::-webkit-scrollbar {
 width: 8px;
 }
 
 .media-modal-content::-webkit-scrollbar-track {
 background: #2a2a2a;
 border-radius: 4px;
 }
 
 .media-modal-content::-webkit-scrollbar-thumb {
 background: #555;
 border-radius: 4px;
 }
 
 .media-modal-content::-webkit-scrollbar-thumb:hover {
 background: #777;
 }
`;
document.head.appendChild(style);
