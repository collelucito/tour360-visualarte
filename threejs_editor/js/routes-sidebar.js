// ========================================
// ROUTES SIDEBAR - Matterport Style
// Sidebar collassabile con thumbnails dei percorsi
// ========================================

export class RoutesSidebar {
 constructor() {
 this.container = null;
 this.allRoutes = {};
 this.currentRoute = null;
 this.currentFotoNumero = null;
 this.isCollapsed = false;
 this.onPointClick = null; // Callback
 this.onRouteClick = null; // Callback
 
 console.log('✅ Routes Sidebar ready (Matterport style)');
 }
 
 create() {
 const sidebar = document.createElement('div');
 sidebar.id = 'routes-sidebar';
 sidebar.className = 'routes-sidebar';
 
 sidebar.innerHTML = `
 <button class="sidebar-toggle" id="sidebarToggle">
 <span class="toggle-icon">◀</span>
 </button>
 
 <div class="sidebar-content">
 <div class="sidebar-header">
 <h3>🗺️ PERCORSI</h3>
 </div>
 
 <div class="sidebar-routes" id="sidebarRoutes">
 <!-- Routes will be inserted here -->
 </div>
 </div>
 `;
 
 const previewMode = document.getElementById('preview-mode');
 if (previewMode) {
 previewMode.appendChild(sidebar);
 this.container = sidebar;
 }
 
 // Event listeners
 document.getElementById('sidebarToggle').addEventListener('click', () => this.toggle());
 
 this.addStyles();
 
 console.log('✅ Routes sidebar created');
 }
 
 addStyles() {
 const styleId = 'routes-sidebar-styles';
 if (document.getElementById(styleId)) return;
 
 const style = document.createElement('style');
 style.id = styleId;
 style.textContent = `
 .routes-sidebar {
 position: fixed;
 top: 70px;
 left: 0;
 width: 280px;
 height: calc(100vh - 70px);
 background: linear-gradient(135deg, rgba(26, 26, 26, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%);
 backdrop-filter: blur(15px);
 border-right: 2px solid rgba(102, 126, 234, 0.3);
 box-shadow: 5px 0 25px rgba(0, 0, 0, 0.5);
 z-index: 8500;
 transition: transform 0.3s ease;
 display: flex;
 }
 
 .routes-sidebar.collapsed {
 transform: translateX(-280px);
 }
 
 .sidebar-toggle {
 position: absolute;
 right: -40px;
 top: 50%;
 transform: translateY(-50%);
 width: 40px;
 height: 80px;
 background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(64, 84, 178, 0.9) 100%);
 border: none;
 border-radius: 0 12px 12px 0;
 color: white;
 cursor: pointer;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 20px;
 transition: all 0.3s ease;
 box-shadow: 3px 0 15px rgba(102, 126, 234, 0.4);
 z-index: 1;
 }
 
 .sidebar-toggle:hover {
 background: linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(64, 84, 178, 1) 100%);
 width: 45px;
 box-shadow: 5px 0 20px rgba(102, 126, 234, 0.6);
 }
 
 .routes-sidebar.collapsed .toggle-icon {
 transform: rotate(180deg);
 }
 
 .toggle-icon {
 transition: transform 0.3s ease;
 display: inline-block;
 }
 
 .sidebar-content {
 flex: 1;
 display: flex;
 flex-direction: column;
 overflow: hidden;
 }
 
 .sidebar-header {
 padding: 20px;
 border-bottom: 2px solid rgba(255, 255, 255, 0.1);
 }
 
 .sidebar-header h3 {
 color: white;
 margin: 0;
 font-size: 18px;
 font-weight: 600;
 }
 
 .sidebar-routes {
 flex: 1;
 overflow-y: auto;
 padding: 10px;
 }
 
 .sidebar-routes::-webkit-scrollbar {
 width: 8px;
 }
 
 .sidebar-routes::-webkit-scrollbar-track {
 background: rgba(255, 255, 255, 0.05);
 border-radius: 4px;
 }
 
 .sidebar-routes::-webkit-scrollbar-thumb {
 background: rgba(102, 126, 234, 0.5);
 border-radius: 4px;
 }
 
 .sidebar-routes::-webkit-scrollbar-thumb:hover {
 background: rgba(102, 126, 234, 0.8);
 }
 
 .route-section {
 margin-bottom: 20px;
 }
 
 .route-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 12px;
 background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(64, 84, 178, 0.2) 100%);
 border-radius: 8px;
 cursor: pointer;
 transition: all 0.2s ease;
 margin-bottom: 10px;
 border: 1px solid transparent;
 }
 
 .route-header:hover {
 background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(64, 84, 178, 0.3) 100%);
 border-color: rgba(102, 126, 234, 0.5);
 transform: translateX(5px);
 }
 
 .route-header.active {
 background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(56, 142, 60, 0.3) 100%);
 border-color: #4CAF50;
 }
 
 .route-title {
 color: white;
 font-size: 14px;
 font-weight: 600;
 margin: 0;
 flex: 1;
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
 }
 
 .route-count {
 background: rgba(102, 126, 234, 0.4);
 color: #667eea;
 padding: 3px 10px;
 border-radius: 12px;
 font-size: 11px;
 font-weight: 600;
 margin-left: 10px;
 }
 
 .route-header.active .route-count {
 background: rgba(76, 175, 80, 0.4);
 color: #4CAF50;
 }
 
 .route-points {
 display: grid;
 grid-template-columns: 1fr;
 gap: 8px;
 padding-left: 10px;
 }
 
 .point-card {
 display: flex;
 align-items: center;
 gap: 12px;
 padding: 10px;
 background: rgba(255, 255, 255, 0.05);
 border-radius: 8px;
 cursor: pointer;
 transition: all 0.2s ease;
 border: 2px solid transparent;
 }
 
 .point-card:hover {
 background: rgba(255, 255, 255, 0.1);
 border-color: rgba(102, 126, 234, 0.5);
 transform: translateX(5px);
 }
 
 .point-card.active {
 background: rgba(76, 175, 80, 0.2);
 border-color: #4CAF50;
 }
 
 .point-thumbnail {
 width: 60px;
 height: 60px;
 border-radius: 6px;
 object-fit: cover;
 flex-shrink: 0;
 border: 2px solid rgba(255, 255, 255, 0.2);
 }
 
 .point-card.active .point-thumbnail {
 border-color: #4CAF50;
 box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
 }
 
 .point-info {
 flex: 1;
 min-width: 0;
 }
 
 .point-name {
 color: white;
 font-size: 13px;
 font-weight: 600;
 margin: 0 0 4px 0;
 overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
 }
 
 .point-number {
 color: #999;
 font-size: 11px;
 margin: 0;
 }
 
 .point-hotspots {
 display: flex;
 gap: 4px;
 margin-top: 4px;
 }
 
 .hotspot-mini {
 width: 6px;
 height: 6px;
 border-radius: 50%;
 }
 
 .hotspot-mini.nav { background: #4CAF50; }
 .hotspot-mini.mp4 { background: #FF9800; }
 .hotspot-mini.info { background: #2196F3; }
 .hotspot-mini.model { background: #9C27B0; }
 `;
 
 document.head.appendChild(style);
 }
 
 setRoutes(routes, currentRouteName, currentFotoNumero) {
 this.allRoutes = routes;
 this.currentRoute = currentRouteName;
 this.currentFotoNumero = currentFotoNumero;
 this.render();
 }
 
 render() {
 const container = document.getElementById('sidebarRoutes');
 if (!container) return;
 
 container.innerHTML = '';
 
 Object.keys(this.allRoutes).forEach(routeName => {
 const route = this.allRoutes[routeName];
 const section = this.createRouteSection(routeName, route);
 container.appendChild(section);
 });
 
 console.log(`✅ Rendered ${Object.keys(this.allRoutes).length} routes in sidebar`);
 }
 
 createRouteSection(routeName, route) {
 const section = document.createElement('div');
 section.className = 'route-section';
 
 const header = document.createElement('div');
 header.className = 'route-header';
 if (routeName === this.currentRoute) {
 header.classList.add('active');
 }
 
 header.innerHTML = `
 <h4 class="route-title" title="${routeName}">${routeName}</h4>
 <span class="route-count">📍 ${route.punti.length}</span>
 `;
 
 header.addEventListener('click', () => {
 if (this.onRouteClick && routeName !== this.currentRoute) {
 this.onRouteClick(routeName);
 }
 });
 
 section.appendChild(header);
 
 // Points container
 const pointsContainer = document.createElement('div');
 pointsContainer.className = 'route-points';
 
 // Show points only if this is the current route
 if (routeName === this.currentRoute) {
 route.punti.forEach((punto, index) => {
 const card = this.createPointCard(punto, route.hotspots);
 pointsContainer.appendChild(card);
 });
 }
 
 section.appendChild(pointsContainer);
 
 return section;
 }
 
 createPointCard(punto, allHotspots) {
 const card = document.createElement('div');
 card.className = 'point-card';
 if (punto.foto_numero === this.currentFotoNumero) {
 card.classList.add('active');
 }
 
 // Thumbnail
 const thumb = document.createElement('img');
 thumb.className = 'point-thumbnail';
 thumb.src = `../${punto.foto}`;
 thumb.alt = punto.nome;
 thumb.onerror = () => {
 thumb.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23333" width="60" height="60"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="30"%3E📷%3C/text%3E%3C/svg%3E';
 };
 
 // Info
 const info = document.createElement('div');
 info.className = 'point-info';
 
 const name = document.createElement('h5');
 name.className = 'point-name';
 name.textContent = punto.nome;
 name.title = punto.nome;
 
 const number = document.createElement('p');
 number.className = 'point-number';
 number.textContent = `Foto ${punto.foto_numero}`;
 
 info.appendChild(name);
 info.appendChild(number);
 
 // Hotspots indicators
 const hotspots = allHotspots[punto.foto_numero] || [];
 if (hotspots.length > 0) {
 const hotspotsDiv = document.createElement('div');
 hotspotsDiv.className = 'point-hotspots';
 
 hotspots.forEach(h => {
 const dot = document.createElement('div');
 dot.className = 'hotspot-mini';
 if (h.tipo === 'incrocio') dot.classList.add('nav');
 else if (h.tipo === 'chiedi') dot.classList.add('mp4');
 else if (h.tipo === 'more') dot.classList.add('info');
 else if (h.tipo === 'tred') dot.classList.add('model');
 hotspotsDiv.appendChild(dot);
 });
 
 info.appendChild(hotspotsDiv);
 }
 
 card.appendChild(thumb);
 card.appendChild(info);
 
 // Click handler
 card.addEventListener('click', () => {
 if (this.onPointClick) {
 this.onPointClick(punto.foto_numero);
 }
 });
 
 return card;
 }
 
 updateCurrentPoint(routeName, fotoNumero) {
 this.currentRoute = routeName;
 this.currentFotoNumero = fotoNumero;
 
 // Update active states
 document.querySelectorAll('.route-header').forEach(h => h.classList.remove('active'));
 document.querySelectorAll('.point-card').forEach(c => c.classList.remove('active'));
 
 // Re-render to update active route and points
 this.render();
 }
 
 toggle() {
 this.isCollapsed = !this.isCollapsed;
 
 if (this.isCollapsed) {
 this.container.classList.add('collapsed');
 } else {
 this.container.classList.remove('collapsed');
 }
 
 console.log(`Sidebar ${this.isCollapsed ? 'collapsed' : 'expanded'}`);
 }
 
 show() {
 if (this.container) {
 this.container.style.display = 'flex';
 }
 }
 
 hide() {
 if (this.container) {
 this.container.style.display = 'none';
 }
 }
 
 destroy() {
 if (this.container) {
 this.container.remove();
 }
 const style = document.getElementById('routes-sidebar-styles');
 if (style) {
 style.remove();
 }
 }
}
