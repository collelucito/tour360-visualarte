// ========================================
// ROUTES FOOTER - Navigation Maps Component CON THUMBNAIL
// E SFONDO TRASPARENTE
// ========================================

export class RoutesFooter {
    constructor() {
        this.container = null;
        this.allRoutes = {};
        this.currentRoute = null;
        this.onRouteSwitch = null; // Callback function
        
        console.log('✅ Routes Footer component ready');
    }
    
    create() {
        // Create footer HTML
        const footer = document.createElement('div');
        footer.id = 'routes-footer';
        footer.className = 'routes-footer';
        
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'routes-scroll-container';
        scrollContainer.id = 'routes-scroll-container';
        
        footer.appendChild(scrollContainer);
        
        // Append to preview mode
        const previewMode = document.getElementById('preview-mode');
        if (previewMode) {
            previewMode.appendChild(footer);
            this.container = footer;
        }
        
        // Add styles
        this.addStyles();
        
        console.log('✅ Routes footer created');
    }
    
    addStyles() {
        const styleId = 'routes-footer-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .routes-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: transparent;
                padding: 8px 15px;
                z-index: 8000;
            }
            
            .routes-scroll-container {
                display: flex;
                gap: 12px;
                overflow-x: auto;
                overflow-y: hidden;
                padding: 5px 0;
                scroll-behavior: smooth;
            }
            
            .routes-scroll-container::-webkit-scrollbar {
                height: 6px;
            }
            
            .routes-scroll-container::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 3px;
            }
            
            .routes-scroll-container::-webkit-scrollbar-thumb {
                background: rgba(102, 126, 234, 0.5);
                border-radius: 3px;
            }
            
            .routes-scroll-container::-webkit-scrollbar-thumb:hover {
                background: rgba(102, 126, 234, 0.8);
            }
            
            .route-card {
                min-width: 200px;
                max-width: 200px;
                background: linear-gradient(135deg, rgba(40, 40, 45, 0.9) 0%, rgba(30, 30, 35, 0.9) 100%);
                border-radius: 10px;
                border: 2px solid rgba(255, 255, 255, 0.1);
                padding: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                backdrop-filter: blur(10px);
            }
            
            .route-card:hover {
                transform: translateY(-3px);
                border-color: rgba(102, 126, 234, 0.6);
                box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
            }
            
            .route-card.active {
                border-color: #4CAF50;
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(56, 142, 60, 0.3) 100%);
                box-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
            }
            
            .route-card.active::before {
                content: '✓';
                position: absolute;
                top: 8px;
                right: 8px;
                background: #4CAF50;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                z-index: 10;
            }
            
            .route-card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .route-card-title {
                color: white;
                font-size: 14px;
                font-weight: 600;
                margin: 0;
                max-width: 140px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .route-card-points {
                background: rgba(102, 126, 234, 0.3);
                color: #667eea;
                padding: 3px 8px;
                border-radius: 15px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
            }
            
            .route-card-thumbnail {
                width: 100%;
                height: 80px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 6px;
                margin-bottom: 8px;
                position: relative;
                overflow: hidden;
                background-size: cover;
                background-position: center;
            }
            
            .route-card-thumbnail::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
            }
            
            .route-card-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #999;
                flex-wrap: wrap;
                gap: 4px;
            }
            
            .route-card-hotspots {
                display: flex;
                gap: 6px;
            }
            
            .hotspot-badge {
                font-size: 10px;
                padding: 2px 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
            }
            
            .hotspot-badge.nav { color: #4CAF50; }
            .hotspot-badge.mp4 { color: #FF9800; }
            .hotspot-badge.info { color: #2196F3; }
            .hotspot-badge.model { color: #9C27B0; }
        `;
        
        document.head.appendChild(style);
    }
    
    setRoutes(routes, currentRouteName) {
        this.allRoutes = routes;
        this.currentRoute = currentRouteName;
        this.render();
    }
    
    render() {
        const container = document.getElementById('routes-scroll-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.keys(this.allRoutes).forEach(routeName => {
            const route = this.allRoutes[routeName];
            const card = this.createRouteCard(routeName, route);
            container.appendChild(card);
        });
        
        console.log(`✅ Rendered ${Object.keys(this.allRoutes).length} route cards`);
    }
    
    createRouteCard(routeName, route) {
        const card = document.createElement('div');
        card.className = 'route-card';
        if (routeName === this.currentRoute) {
            card.classList.add('active');
        }
        
        // Count hotspots by type
        let navCount = 0, mp4Count = 0, infoCount = 0, modelCount = 0;
        Object.values(route.hotspots || {}).forEach(hotspots => {
            hotspots.forEach(h => {
                if (h.tipo === 'incrocio') navCount++;
                else if (h.tipo === 'chiedi') mp4Count++;
                else if (h.tipo === 'more') infoCount++;
                else if (h.tipo === 'tred') modelCount++;
            });
        });
        
        // Get first image thumbnail
        const firstImage = route.punti.length > 0 ? `../${route.punti[0].foto}` : '';
        
        card.innerHTML = `
            <div class="route-card-header">
                <h4 class="route-card-title" title="${routeName}">${routeName}</h4>
                <span class="route-card-points">📍 ${route.punti.length}</span>
            </div>
            <div class="route-card-thumbnail" style="background-image: url('${firstImage}');">
                ${!firstImage ? '<p style="color:#666;text-align:center;padding-top:30px;font-size:10px;">Vuoto</p>' : ''}
            </div>
            <div class="route-card-info">
                <div class="route-card-hotspots">
                    ${navCount > 0 ? `<span class="hotspot-badge nav">🟢${navCount}</span>` : ''}
                    ${mp4Count > 0 ? `<span class="hotspot-badge mp4">🟠${mp4Count}</span>` : ''}
                    ${infoCount > 0 ? `<span class="hotspot-badge info">🔵${infoCount}</span>` : ''}
                    ${modelCount > 0 ? `<span class="hotspot-badge model">🟣${modelCount}</span>` : ''}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (this.onRouteSwitch && routeName !== this.currentRoute) {
                console.log(`🔄 Switching to route: ${routeName}`);
                this.onRouteSwitch(routeName);
            }
        });
        
        return card;
    }
    
    updateCurrentRoute(routeName) {
        this.currentRoute = routeName;
        
        // Update active class
        document.querySelectorAll('.route-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const cards = document.querySelectorAll('.route-card');
        const routeNames = Object.keys(this.allRoutes);
        const index = routeNames.indexOf(routeName);
        if (index >= 0 && cards[index]) {
            cards[index].classList.add('active');
        }
    }
    
    show() {
        if (this.container) {
            this.container.style.display = 'block';
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
        const style = document.getElementById('routes-footer-styles');
        if (style) {
            style.remove();
        }
    }
}
