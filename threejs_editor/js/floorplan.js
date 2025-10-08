// ========================================
// FLOOR PLAN - Complete 2D Layout View
// ========================================

export class FloorPlan {
 constructor() {
 this.modal = null;
 this.canvas = null;
 this.ctx = null;
 this.width = 1000;
 this.height = 700;
 
 // Data
 this.points = [];
 this.connections = [];
 this.rooms = []; // Detected rooms
 this.currentPoint = null;
 
 // View controls
 this.zoom = 1;
 this.offsetX = 0;
 this.offsetY = 0;
 this.isDragging = false;
 this.dragStartX = 0;
 this.dragStartY = 0;
 
 // Edit mode
 this.editMode = false;
 this.selectedPoint = null;
 
 // Styling
 this.colors = {
 bg: '#1a1a1a',
 grid: 'rgba(102, 126, 234, 0.1)',
 point: '#667eea',
 currentPoint: '#4CAF50',
 connection: 'rgba(102, 126, 234, 0.5)',
 room: 'rgba(102, 126, 234, 0.1)',
 roomBorder: 'rgba(102, 126, 234, 0.3)',
 text: '#ffffff',
 axis: 'rgba(255, 255, 255, 0.2)'
 };
 
 // Callback
 this.onNavigate = null;
 
 console.log(' Floor Plan initialized');
 }
 
 create() {
 // Create modal
 this.modal = document.createElement('div');
 this.modal.style.cssText = `
 position: fixed;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: rgba(0, 0, 0, 0.95);
 z-index: 15000;
 display: none;
 justify-content: center;
 align-items: center;
 backdrop-filter: blur(10px);
 `;
 
 // Container
 const container = document.createElement('div');
 container.style.cssText = `
 background: linear-gradient(135deg, rgba(42,42,42,0.98), rgba(26,26,26,0.98));
 border-radius: 20px;
 border: 3px solid #667eea;
 padding: 30px;
 box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
 position: relative;
 `;
 
 // Title
 const title = document.createElement('h2');
 title.textContent = ' FLOOR PLAN';
 title.style.cssText = `
 color: #667eea;
 margin-bottom: 20px;
 text-align: center;
 font-size: 28px;
 font-weight: 600;
 letter-spacing: 2px;
 `;
 container.appendChild(title);
 
 // Controls
 const controls = document.createElement('div');
 controls.style.cssText = `
 display: flex;
 gap: 10px;
 margin-bottom: 20px;
 justify-content: center;
 `;
 
 const btnZoomIn = this.createButton(' +', () => this.zoomIn());
 const btnZoomOut = this.createButton(' -', () => this.zoomOut());
 const btnReset = this.createButton(' Reset', () => this.resetView());
 const btnEdit = this.createButton(' Edit', () => this.toggleEditMode());
 const btnClose = this.createButton(' Close', () => this.close());
 btnClose.style.background = 'linear-gradient(135deg, #f44336, #e53935)';
 
 controls.appendChild(btnZoomIn);
 controls.appendChild(btnZoomOut);
 controls.appendChild(btnReset);
 controls.appendChild(btnEdit);
 controls.appendChild(btnClose);
 container.appendChild(controls);
 
 // Canvas
 this.canvas = document.createElement('canvas');
 this.canvas.width = this.width;
 this.canvas.height = this.height;
 this.canvas.style.cssText = `
 border: 2px solid rgba(102, 126, 234, 0.5);
 border-radius: 10px;
 cursor: grab;
 background: ${this.colors.bg};
 `;
 container.appendChild(this.canvas);
 this.ctx = this.canvas.getContext('2d');
 
 // Info panel
 const info = document.createElement('div');
 info.style.cssText = `
 margin-top: 15px;
 padding: 15px;
 background: rgba(15, 15, 15, 0.8);
 border-radius: 10px;
 text-align: center;
 color: #bbb;
 font-size: 14px;
 `;
 info.innerHTML = `
 <strong style="color: #4CAF50;">Controls:</strong> 
 Drag to pan Scroll to zoom Click point to navigate Edit mode to arrange
 `;
 container.appendChild(info);
 
 this.modal.appendChild(container);
 document.body.appendChild(this.modal);
 
 // Events
 this.setupEvents();
 
 console.log(' Floor Plan modal created');
 }
 
 createButton(text, onClick) {
 const btn = document.createElement('button');
 btn.textContent = text;
 btn.style.cssText = `
 padding: 10px 20px;
 background: linear-gradient(135deg, #667eea, #764ba2);
 color: white;
 border: none;
 border-radius: 10px;
 cursor: pointer;
 font-size: 14px;
 font-weight: 600;
 transition: all 0.3s;
 `;
 btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
 btn.onmouseout = () => btn.style.transform = 'translateY(0)';
 btn.onclick = onClick;
 return btn;
 }
 
 setupEvents() {
 // Pan
 this.canvas.addEventListener('mousedown', (e) => {
 if (this.editMode) return;
 this.isDragging = true;
 this.dragStartX = e.clientX - this.offsetX;
 this.dragStartY = e.clientY - this.offsetY;
 this.canvas.style.cursor = 'grabbing';
 });
 
 this.canvas.addEventListener('mousemove', (e) => {
 if (this.isDragging) {
 this.offsetX = e.clientX - this.dragStartX;
 this.offsetY = e.clientY - this.dragStartY;
 this.draw();
 }
 });
 
 this.canvas.addEventListener('mouseup', () => {
 this.isDragging = false;
 this.canvas.style.cursor = 'grab';
 });
 
 // Zoom
 this.canvas.addEventListener('wheel', (e) => {
 e.preventDefault();
 const delta = e.deltaY > 0 ? 0.9 : 1.1;
 this.zoom *= delta;
 this.zoom = Math.max(0.3, Math.min(3, this.zoom));
 this.draw();
 });
 
 // Click
 this.canvas.addEventListener('click', (e) => {
 if (this.isDragging) return;
 const rect = this.canvas.getBoundingClientRect();
 const x = (e.clientX - rect.left - this.offsetX) / this.zoom;
 const y = (e.clientY - rect.top - this.offsetY) / this.zoom;
 
 this.handleClick(x, y);
 });
 }
 
 setData(percorso) {
 if (!percorso || !percorso.punti) return;
 
 // Auto-layout points in circular pattern
 this.points = [];
 const punti = percorso.punti;
 const centerX = this.width / 2;
 const centerY = this.height / 2;
 const radius = Math.min(this.width, this.height) * 0.35;
 
 punti.forEach((punto, i) => {
 const angle = (i / punti.length) * Math.PI * 2 - Math.PI / 2;
 this.points.push({
 foto_numero: punto.foto_numero,
 x: centerX + Math.cos(angle) * radius,
 y: centerY + Math.sin(angle) * radius,
 nome: punto.nome,
 visited: false
 });
 });
 
 // Extract connections
 this.connections = [];
 punti.forEach((punto, i) => {
 const hotspots = percorso.hotspots[punto.foto_numero];
 if (hotspots) {
 hotspots.forEach(h => {
 if (h.tipo === 'incrocio' && h.targetFoto) {
 const targetIdx = punti.findIndex(p => p.foto_numero === h.targetFoto);
 if (targetIdx >= 0) {
 this.connections.push({ from: i, to: targetIdx });
 }
 }
 });
 }
 });
 
 // Detect rooms (simple clustering)
 this.detectRooms();
 
 this.resetView();
 this.draw();
 
 console.log(` Floor Plan loaded: ${this.points.length} points`);
 }
 
 detectRooms() {
 // Simple room detection based on connection clusters
 // This is a basic implementation - can be improved
 this.rooms = [];
 
 if (this.points.length < 3) return;
 
 // Create a simple bounding area around connected points
 const visited = new Set();
 
 this.points.forEach((point, i) => {
 if (visited.has(i)) return;
 
 const cluster = [i];
 visited.add(i);
 
 // Find connected points
 this.connections.forEach(conn => {
 if (conn.from === i && !visited.has(conn.to)) {
 cluster.push(conn.to);
 visited.add(conn.to);
 }
 });
 
 if (cluster.length >= 2) {
 // Calculate bounding box
 const xs = cluster.map(idx => this.points[idx].x);
 const ys = cluster.map(idx => this.points[idx].y);
 
 this.rooms.push({
 minX: Math.min(...xs) - 30,
 minY: Math.min(...ys) - 30,
 maxX: Math.max(...xs) + 30,
 maxY: Math.max(...ys) + 30,
 points: cluster
 });
 }
 });
 }
 
 draw() {
 if (!this.ctx) return;
 
 const ctx = this.ctx;
 
 // Clear
 ctx.fillStyle = this.colors.bg;
 ctx.fillRect(0, 0, this.width, this.height);
 
 // Save transform
 ctx.save();
 ctx.translate(this.offsetX, this.offsetY);
 ctx.scale(this.zoom, this.zoom);
 
 // Draw grid
 this.drawGrid();
 
 // Draw rooms
 ctx.fillStyle = this.colors.room;
 ctx.strokeStyle = this.colors.roomBorder;
 ctx.lineWidth = 2;
 this.rooms.forEach(room => {
 ctx.fillRect(room.minX, room.minY, room.maxX - room.minX, room.maxY - room.minY);
 ctx.strokeRect(room.minX, room.minY, room.maxX - room.minX, room.maxY - room.minY);
 });
 
 // Draw connections
 ctx.strokeStyle = this.colors.connection;
 ctx.lineWidth = 3;
 ctx.setLineDash([5, 5]);
 this.connections.forEach(conn => {
 const p1 = this.points[conn.from];
 const p2 = this.points[conn.to];
 if (p1 && p2) {
 ctx.beginPath();
 ctx.moveTo(p1.x, p1.y);
 ctx.lineTo(p2.x, p2.y);
 ctx.stroke();
 }
 });
 ctx.setLineDash([]);
 
 // Draw points
 this.points.forEach((point, i) => {
 const isCurrent = this.currentPoint && point.foto_numero === this.currentPoint.foto_numero;
 
 // Shadow
 ctx.shadowBlur = isCurrent ? 30 : 15;
 ctx.shadowColor = isCurrent ? this.colors.currentPoint : this.colors.point;
 
 // Circle
 ctx.beginPath();
 ctx.arc(point.x, point.y, isCurrent ? 25 : 20, 0, Math.PI * 2);
 ctx.fillStyle = isCurrent ? this.colors.currentPoint : this.colors.point;
 ctx.fill();
 ctx.shadowBlur = 0;
 
 // Border
 ctx.strokeStyle = '#ffffff';
 ctx.lineWidth = 3;
 ctx.stroke();
 
 // Number
 ctx.fillStyle = '#ffffff';
 ctx.font = 'bold 16px "Segoe UI"';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(i + 1, point.x, point.y);
 
 // Label
 ctx.fillStyle = this.colors.text;
 ctx.font = '14px "Segoe UI"';
 ctx.fillText(point.nome, point.x, point.y + 35);
 });
 
 // Restore transform
 ctx.restore();
 
 // Draw compass
 this.drawCompass();
 
 // Draw scale
 this.drawScale();
 }
 
 drawGrid() {
 const ctx = this.ctx;
 const gridSize = 50;
 
 ctx.strokeStyle = this.colors.grid;
 ctx.lineWidth = 1;
 
 // Vertical lines
 for (let x = 0; x < this.width; x += gridSize) {
 ctx.beginPath();
 ctx.moveTo(x, 0);
 ctx.lineTo(x, this.height);
 ctx.stroke();
 }
 
 // Horizontal lines
 for (let y = 0; y < this.height; y += gridSize) {
 ctx.beginPath();
 ctx.moveTo(0, y);
 ctx.lineTo(this.width, y);
 ctx.stroke();
 }
 
 // Axes
 ctx.strokeStyle = this.colors.axis;
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(this.width / 2, 0);
 ctx.lineTo(this.width / 2, this.height);
 ctx.moveTo(0, this.height / 2);
 ctx.lineTo(this.width, this.height / 2);
 ctx.stroke();
 }
 
 drawCompass() {
 const ctx = this.ctx;
 const x = this.width - 50;
 const y = 50;
 const size = 30;
 
 // Background
 ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
 ctx.beginPath();
 ctx.arc(x, y, size + 5, 0, Math.PI * 2);
 ctx.fill();
 
 // North arrow
 ctx.fillStyle = '#f44336';
 ctx.beginPath();
 ctx.moveTo(x, y - size);
 ctx.lineTo(x - 8, y);
 ctx.lineTo(x + 8, y);
 ctx.closePath();
 ctx.fill();
 
 // South
 ctx.fillStyle = '#666';
 ctx.beginPath();
 ctx.moveTo(x, y + size);
 ctx.lineTo(x - 8, y);
 ctx.lineTo(x + 8, y);
 ctx.closePath();
 ctx.fill();
 
 // N label
 ctx.fillStyle = '#ffffff';
 ctx.font = 'bold 12px "Segoe UI"';
 ctx.textAlign = 'center';
 ctx.fillText('N', x, y - size - 10);
 }
 
 drawScale() {
 const ctx = this.ctx;
 const x = 20;
 const y = this.height - 30;
 const length = 100;
 
 // Background
 ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
 ctx.fillRect(x - 5, y - 15, length + 10, 25);
 
 // Scale bar
 ctx.strokeStyle = '#ffffff';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(x, y);
 ctx.lineTo(x + length, y);
 ctx.stroke();
 
 // Ticks
 ctx.beginPath();
 ctx.moveTo(x, y - 5);
 ctx.lineTo(x, y + 5);
 ctx.moveTo(x + length / 2, y - 3);
 ctx.lineTo(x + length / 2, y + 3);
 ctx.moveTo(x + length, y - 5);
 ctx.lineTo(x + length, y + 5);
 ctx.stroke();
 
 // Label
 ctx.fillStyle = '#ffffff';
 ctx.font = '11px "Segoe UI"';
 ctx.textAlign = 'center';
 ctx.fillText(`${(length / this.zoom).toFixed(0)}px`, x + length / 2, y - 10);
 }
 
 handleClick(x, y) {
 // Check if clicked on a point
 for (let point of this.points) {
 const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
 if (dist < 25) {
 if (this.onNavigate) {
 this.onNavigate(point.foto_numero);
 this.close();
 }
 break;
 }
 }
 }
 
 setCurrentPoint(fotoNumero) {
 const point = this.points.find(p => p.foto_numero === fotoNumero);
 if (point) {
 if (this.currentPoint) {
 this.currentPoint.visited = true;
 }
 this.currentPoint = point;
 this.draw();
 }
 }
 
 zoomIn() {
 this.zoom *= 1.2;
 this.zoom = Math.min(3, this.zoom);
 this.draw();
 }
 
 zoomOut() {
 this.zoom *= 0.8;
 this.zoom = Math.max(0.3, this.zoom);
 this.draw();
 }
 
 resetView() {
 this.zoom = 1;
 this.offsetX = 0;
 this.offsetY = 0;
 this.draw();
 }
 
 toggleEditMode() {
 this.editMode = !this.editMode;
 // TODO: Implement drag & drop editing
 alert(this.editMode ? ' Edit mode ON (drag points)' : ' View mode');
 }
 
 open(percorso, currentFoto) {
 if (!this.modal) {
 this.create();
 }
 
 this.setData(percorso);
 if (currentFoto) {
 this.setCurrentPoint(currentFoto);
 }
 
 this.modal.style.display = 'flex';
 }
 
 close() {
 if (this.modal) {
 this.modal.style.display = 'none';
 }
 }
 
 destroy() {
 if (this.modal) {
 this.modal.remove();
 }
 }
}
