// ========================================
// MINIMAP 2D - Navigation Overview
// ========================================

export class Minimap {
 constructor(containerSelector) {
 this.container = document.querySelector(containerSelector);
 this.canvas = null;
 this.ctx = null;
 this.width = 250;
 this.height = 200;
 
 // Data
 this.points = []; // { foto_numero, x, y, nome }
 this.connections = []; // { from, to }
 this.currentPoint = null;
 this.hoveredPoint = null;
 
 // Styling
 this.pointRadius = 8;
 this.currentPointRadius = 12;
 this.colors = {
 bg: 'rgba(0, 0, 0, 0.3)',
 border: 'rgba(102, 126, 234, 0.5)',
 point: '#667eea',
 currentPoint: '#4CAF50',
 visitedPoint: '#2196F3',
 connection: 'rgba(102, 126, 234, 0.3)',
 text: '#ffffff',
 hover: '#FF9800'
 };
 
 // Animation
 this.pulseTime = 0;
 this.isAnimating = false;
 
 // Interaction
 this.onClick = null;
 
 console.log(' Minimap initialized');
 }
 
 create() {
 // Create canvas
 this.canvas = document.createElement('canvas');
 this.canvas.width = this.width;
 this.canvas.height = this.height;
 this.canvas.style.cssText = `
 position: absolute;
 bottom: 80px;
 right: 20px;
 border: 2px solid ${this.colors.border};
 border-radius: 15px;
 background: ${this.colors.bg};
 backdrop-filter: blur(20px);
 cursor: pointer;
 box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
 z-index: 1000;
 `;
 
 this.container.appendChild(this.canvas);
 this.ctx = this.canvas.getContext('2d');
 
 // Events
 this.canvas.addEventListener('click', (e) => this.handleClick(e));
 this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
 this.canvas.addEventListener('mouseleave', () => {
 this.hoveredPoint = null;
 this.draw();
 });
 
 console.log(' Minimap canvas created');
 }
 
 setData(percorso) {
 if (!percorso || !percorso.punti) return;
 
 // Extract points
 this.points = [];
 const punti = percorso.punti;
 
 // Auto-layout in grid
 const cols = Math.ceil(Math.sqrt(punti.length));
 const rows = Math.ceil(punti.length / cols);
 const spacingX = (this.width - 40) / (cols + 1);
 const spacingY = (this.height - 40) / (rows + 1);
 
 punti.forEach((punto, i) => {
 const col = i % cols;
 const row = Math.floor(i / cols);
 
 this.points.push({
 foto_numero: punto.foto_numero,
 x: 20 + spacingX * (col + 1),
 y: 20 + spacingY * (row + 1),
 nome: punto.nome,
 visited: false
 });
 });
 
 // Extract connections from hotspots
 this.connections = [];
 punti.forEach((punto, i) => {
 const hotspots = percorso.hotspots[punto.foto_numero];
 if (hotspots) {
 hotspots.forEach(h => {
 if (h.tipo === 'incrocio' && h.targetFoto) {
 const targetIdx = punti.findIndex(p => p.foto_numero === h.targetFoto);
 if (targetIdx >= 0 && targetIdx !== i) {
 // Check if connection already exists (bidirectional)
 const exists = this.connections.some(c => 
 (c.from === i && c.to === targetIdx) ||
 (c.from === targetIdx && c.to === i)
 );
 if (!exists) {
 this.connections.push({ from: i, to: targetIdx });
 }
 }
 }
 });
 }
 });
 
 this.draw();
 console.log(` Minimap loaded: ${this.points.length} points, ${this.connections.length} connections`);
 }
 
 setCurrentPoint(fotoNumero) {
 const point = this.points.find(p => p.foto_numero === fotoNumero);
 if (point) {
 // Mark previous as visited
 if (this.currentPoint) {
 this.currentPoint.visited = true;
 }
 this.currentPoint = point;
 this.startAnimation();
 }
 }
 
 draw() {
 if (!this.ctx) return;
 
 const ctx = this.ctx;
 
 // Clear
 ctx.clearRect(0, 0, this.width, this.height);
 
 // Background
 ctx.fillStyle = this.colors.bg;
 ctx.fillRect(0, 0, this.width, this.height);
 
 // Title
 ctx.fillStyle = this.colors.text;
 ctx.font = 'bold 12px "Segoe UI"';
 ctx.textAlign = 'center';
 ctx.fillText('NAVIGATION MAP', this.width / 2, 15);
 
 // Draw connections
 ctx.strokeStyle = this.colors.connection;
 ctx.lineWidth = 2;
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
 
 // Draw points
 this.points.forEach((point, i) => {
 const isCurrent = this.currentPoint && point.foto_numero === this.currentPoint.foto_numero;
 const isHovered = this.hoveredPoint && point.foto_numero === this.hoveredPoint.foto_numero;
 
 // Point circle
 ctx.beginPath();
 ctx.arc(point.x, point.y, 
 isCurrent ? this.currentPointRadius + Math.sin(this.pulseTime) * 2 : this.pointRadius, 
 0, Math.PI * 2
 );
 
 // Color
 if (isCurrent) {
 ctx.fillStyle = this.colors.currentPoint;
 ctx.shadowBlur = 20;
 ctx.shadowColor = this.colors.currentPoint;
 } else if (isHovered) {
 ctx.fillStyle = this.colors.hover;
 ctx.shadowBlur = 15;
 ctx.shadowColor = this.colors.hover;
 } else if (point.visited) {
 ctx.fillStyle = this.colors.visitedPoint;
 ctx.shadowBlur = 0;
 } else {
 ctx.fillStyle = this.colors.point;
 ctx.shadowBlur = 0;
 }
 
 ctx.fill();
 ctx.shadowBlur = 0;
 
 // Border
 ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
 ctx.lineWidth = 2;
 ctx.stroke();
 
 // Number
 ctx.fillStyle = '#ffffff';
 ctx.font = 'bold 10px "Segoe UI"';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText(i + 1, point.x, point.y);
 
 // Label on hover
 if (isHovered) {
 ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
 ctx.fillRect(point.x - 40, point.y - 35, 80, 20);
 ctx.fillStyle = '#ffffff';
 ctx.font = '11px "Segoe UI"';
 ctx.fillText(point.nome, point.x, point.y - 25);
 }
 });
 }
 
 startAnimation() {
 if (this.isAnimating) return;
 this.isAnimating = true;
 this.animate();
 }
 
 animate() {
 if (!this.isAnimating) return;
 
 this.pulseTime += 0.1;
 this.draw();
 
 requestAnimationFrame(() => this.animate());
 }
 
 handleClick(event) {
 const rect = this.canvas.getBoundingClientRect();
 const x = event.clientX - rect.left;
 const y = event.clientY - rect.top;
 
 // Check if clicked on a point
 for (let point of this.points) {
 const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
 if (dist < this.pointRadius + 5) {
 if (this.onClick) {
 this.onClick(point.foto_numero);
 }
 break;
 }
 }
 }
 
 handleMouseMove(event) {
 const rect = this.canvas.getBoundingClientRect();
 const x = event.clientX - rect.left;
 const y = event.clientY - rect.top;
 
 // Check hover
 let found = false;
 for (let point of this.points) {
 const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
 if (dist < this.pointRadius + 5) {
 this.hoveredPoint = point;
 found = true;
 break;
 }
 }
 
 if (!found) {
 this.hoveredPoint = null;
 }
 
 this.draw();
 }
 
 show() {
 if (this.canvas) {
 this.canvas.style.display = 'block';
 }
 }
 
 hide() {
 if (this.canvas) {
 this.canvas.style.display = 'none';
 }
 }
 
 destroy() {
 this.isAnimating = false;
 if (this.canvas) {
 this.canvas.remove();
 }
 }
}

