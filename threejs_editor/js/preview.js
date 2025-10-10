// ========================================
// PREVIEW MODE - CON FOOTER THUMBNAIL (SENZA MINIMAP E DROPDOWN)
// ========================================

import { Minimap } from './minimap.js';
import { FloorPlan } from './floorplan.js';
import { MediaModal } from './media-modal.js';
import { ContentModal } from './content-modal.js';
import { RoutesFooter } from './routes-footer.js';

export class PreviewMode {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphere = null;
        this.sphereMaterial = null;
        this.hotspotMeshes = [];
        this.hotspotSprites = [];
        
        this.minimap = null; // 🙈 Nascosta per ora
        this.floorPlan = null;
        this.mediaModal = null;
        this.contentModal = null;
        this.routesFooter = null;
        
        this.percorso = null;
        this.currentIndex = 0;
        this.isActive = false;
        
        this.lon = 0;
        this.lat = 0;
        this.phi = 0;
        this.theta = 0;
        this.isUserInteracting = false;
        this.onPointerDownMouseX = 0;
        this.onPointerDownMouseY = 0;
        this.onPointerDownLon = 0;
        this.onPointerDownLat = 0;
        
        this.currentTexture = null;
        this.nextTexture = null;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionSpeed = 0.012;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.textureLoader = new THREE.TextureLoader();

        // Auto-rotation
        this.autoRotateSpeed = 0.1; // Velocità di rotazione automatica (gradi per frame)
        this.lastInteractionTime = Date.now();

        console.log('✅ Preview mode ready');
    }
    
    init() {
        const container = document.getElementById('preview-container');
        
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 0.1);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);
        
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        
        this.sphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                texture1: { value: null },
                texture2: { value: null },
                mixRatio: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D texture1;
                uniform sampler2D texture2;
                uniform float mixRatio;
                varying vec2 vUv;
                
                void main() {
                    vec4 color1 = texture2D(texture1, vUv);
                    vec4 color2 = texture2D(texture2, vUv);
                    
                    float t = mixRatio;
                    float smoothMix = t < 0.5 
                        ? 4.0 * t * t * t 
                        : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
                    
                    gl_FragColor = mix(color1, color2, smoothMix);
                }
            `,
            side: THREE.DoubleSide
        });
        
        this.sphere = new THREE.Mesh(geometry, this.sphereMaterial);
        this.scene.add(this.sphere);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(0, 1, 0);
        this.scene.add(dirLight);
        
        // 🙈 MINIMAP DISABILITATA
        // this.minimap = new Minimap('#preview-container');
        // this.minimap.create();
        // this.minimap.onClick = (fotoNumero) => this.navigateToFotoNumber(fotoNumero);
        
        this.floorPlan = new FloorPlan();
        this.floorPlan.onNavigate = (fotoNumero) => this.navigateToFotoNumber(fotoNumero);
        
        // Init modals
        this.mediaModal = new MediaModal();
        this.contentModal = new ContentModal();
        
        // Init routes footer
        this.routesFooter = new RoutesFooter();
        this.routesFooter.create();
        this.routesFooter.onRouteSwitch = (routeName) => {
            this.switchRouteByName(routeName);
        };
        
        this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        this.renderer.domElement.addEventListener('pointermove', (e) => this.onPointerMove(e));
        this.renderer.domElement.addEventListener('pointerup', (e) => this.onPointerUp(e));
        this.renderer.domElement.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        window.addEventListener('resize', () => this.onWindowResize());
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                if (this.isActive && this.percorso) {
                    const currentFoto = this.percorso.punti[this.currentIndex].foto_numero;
                    this.floorPlan.open(this.percorso, currentFoto);
                }
            }
        });
        
        console.log('✅ Preview scene initialized');
    }
    
    // Carica tutti i percorsi salvati
    loadAllSavedRoutes() {
        const routes = {};
        
        // Leggi da window.app se disponibile
        if (window.app && window.app.uiManager && window.app.uiManager.percorsiAttivi) {
            console.log('📦 Loading routes from app.uiManager');
            return window.app.uiManager.percorsiAttivi;
        }
        
        // Fallback: leggi dal localStorage
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith('route_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.nome) {
                        routes[data.nome] = data;
                    }
                } catch (e) {
                    console.warn(`⚠️ Skipping invalid route: ${key}`);
                }
            }
        }
        
        console.log(`📦 Loaded ${Object.keys(routes).length} routes`);
        return routes;
    }
    
    // Cambia percorso per nome
    switchRouteByName(routeName) {
        const routes = this.loadAllSavedRoutes();
        const route = routes[routeName];
        
        if (!route) {
            alert('❌ Errore: percorso non trovato!');
            return;
        }
        
        console.log(`🔄 Switching to route: ${routeName}`);
        
        // Chiudi preview corrente
        this.clearHotspots();
        
        // Riavvia con nuovo percorso
        this.start(route, routeName);
    }
    
    start(percorso, routeName = null) {
        if (!percorso || percorso.punti.length === 0) {
            alert('⚠️ Percorso vuoto!');
            return;
        }
        
        console.log('🎯 DEBUG Percorso:', percorso);
        console.log('🎯 DEBUG Hotspots structure:', percorso.hotspots);
        
        this.percorso = percorso;
        this.currentIndex = 0;
        this.isActive = true;
        
        document.getElementById('preview-mode').classList.add('active');
        
        if (!this.renderer) {
            this.init();
        }
        
        const currentRouteName = routeName || percorso.nome;
        
        // 🎯 POPOLA IL FOOTER CON TUTTI I PERCORSI
        const allRoutes = this.loadAllSavedRoutes();
        this.routesFooter.setRoutes(allRoutes, currentRouteName);
        this.routesFooter.show();
        
        // 🙈 MINIMAP DISABILITATA
        // this.minimap.setData(percorso);
        // this.minimap.show();
        
        this.loadPoint();
        this.animate();
        
        console.log(`✅ Preview started: ${percorso.punti.length} points`);
    }
    
    loadPoint() {
        const punto = this.percorso.punti[this.currentIndex];
        
        console.log(`📍 Loading punto:`, punto);
        console.log(`🎯 Hotspots per foto ${punto.foto_numero}:`, this.percorso.hotspots[punto.foto_numero]);
        
        document.getElementById('preview-title').textContent = punto.nome;
        document.getElementById('preview-desc').textContent = punto.descrizione;
        document.getElementById('preview-progress').textContent = 
            `${this.currentIndex + 1} / ${this.percorso.punti.length}`;
        
        // 🙈 MINIMAP DISABILITATA
        // this.minimap.setCurrentPoint(punto.foto_numero);
        
        this.clearHotspots();
        
        const filename = `../` + punto.foto;
        
        this.textureLoader.load(
            filename,
            (texture) => {
                if (!this.currentTexture) {
                    this.currentTexture = texture;
                    this.sphereMaterial.uniforms.texture1.value = texture;
                    this.sphereMaterial.uniforms.mixRatio.value = 0.0;
                    
                    setTimeout(() => {
                        console.log('⏰ Timeout addHotspots chiamato');
                        this.addHotspots();
                    }, 100);
                } else {
                    this.nextTexture = texture;
                    this.sphereMaterial.uniforms.texture2.value = texture;
                    this.isTransitioning = true;
                    this.transitionProgress = 0;
                    console.log('🔄 Morphing...');
                }
                
                console.log(`✅ Loaded: ${punto.foto}`);
            },
            (progress) => {
                const percent = (progress.loaded / progress.total) * 100;
                if (percent % 25 === 0) {
                    console.log(`📥 ${percent.toFixed(0)}%`);
                }
            },
            (error) => {
                console.error('❌ Error loading texture:', error);
            }
        );
    }
    
    addHotspots() {
        console.log('🎯 addHotspots() chiamato');
        
        const punto = this.percorso.punti[this.currentIndex];
        const hotspots = this.percorso.hotspots[punto.foto_numero];
        
        console.log('🔍 hotspots trovati:', hotspots);
        
        if (!hotspots || hotspots.length === 0) {
            console.log('ℹ️ No hotspots for this point (foto_numero: ' + punto.foto_numero + ')');
            return;
        }
        
        console.log(`📌 Loading ${hotspots.length} hotspots...`);
        console.log('🔍 PREVIEW - Hotspots ricevuti:', hotspots);

        hotspots.forEach((h, index) => {
            const position = new THREE.Vector3(h.position.x, h.position.y, h.position.z);

            console.log(`📍 [${index + 1}] Tipo: ${h.tipo}, Scale: ${h.scale}, Position:`, position);
            console.log(`📦 [${index + 1}] Hotspot completo:`, h);
            
            if (h.tipo === 'incrocio') {
                const targetIdx = this.percorso.punti.findIndex(p => p.foto_numero === h.targetFoto);
                if (targetIdx >= 0) {
                    this.createHotspot(position, h.tipo, targetIdx, h);
                    console.log(`✅ Incrocio created target index ${targetIdx} (foto ${h.targetFoto})`);
                } else {
                    console.log(`⚠️ Target foto ${h.targetFoto} NOT in percorso - SKIPPING hotspot`);
                    console.log(`📋 Available foto in percorso:`, this.percorso.punti.map(p => p.foto_numero));
                }
            } else {
                this.createHotspot(position, h.tipo, null, h);
            }
        });
        
        console.log(`✅ Loaded ${this.hotspotMeshes.length}/${hotspots.length} hotspots visible`);
    }
    
    createHotspot(position, tipo, targetIndex = null, hotspotData = null) {
        let color, size, text;
        switch(tipo) {
            case 'incrocio':
                color = 0x4CAF50;
                size = 30;
                text = '⬆️';
                break;
            case 'chiedi':
                color = 0xFF9800;
                size = 28;
                text = '🎬';
                break;
            case 'more':
                color = 0x2196F3;
                size = 28;
                text = 'ℹ️';
                break;
            case 'tred':
                color = 0x9C27B0;
                size = 28;
                text = '📦';
                break;
            default:
                color = 0xFFFFFF;
                size = 25;
                text = '?';
        }
        
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: 0, // Invisibile per tutti gli hotspot
            emissive: color,
            emissiveIntensity: 0.6,
            roughness: 0.3,
            metalness: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.userData = {
            tipo: tipo,
            targetIndex: targetIndex,
            content: hotspotData?.content || null
        };

        // 📏 IMPORTANTE: Applica la scala salvata se presente (con minimo garantito)
        if (hotspotData && hotspotData.scale) {
            // 🔍 Garantisce scala minima di 0.5 per evitare hotspot invisibili
            const scaleToApply = Math.max(0.5, hotspotData.scale);
            mesh.scale.set(scaleToApply, scaleToApply, scaleToApply);
            console.log(`📏 Preview: Scala applicata ${scaleToApply} per hotspot ${tipo}`);
        }

        mesh.renderOrder = 999;
        mesh.material.depthTest = false;

        this.scene.add(mesh);
        this.hotspotMeshes.push(mesh);

        const sprite = this.createTextSprite(text, color);
        sprite.position.copy(position);
        sprite.renderOrder = 1000;
        sprite.material.depthTest = false;
        sprite.userData = { tipo: tipo, parentMesh: mesh };

        // 📏 NON scalare il testo per mantenerlo sempre leggibile
        // Il testo rimane sempre alla scala 1.0 indipendentemente dalla scala dell'hotspot

        this.scene.add(sprite);
        this.hotspotSprites.push(sprite);

        console.log(`✅ Created ${tipo} hotspot "${text}" at`, position);

        // Animate pulse
        const originalScale = mesh.scale.clone();
        const originalSpriteScale = sprite.scale.clone();
        let time = Math.random() * Math.PI * 2;
        
        const animate = () => {
            if (!mesh.parent) return;
            time += 0.08;
            const scale = 1 + Math.sin(time) * 0.25;
            
            mesh.scale.set(
                originalScale.x * scale,
                originalScale.y * scale,
                originalScale.z * scale
            );
            
            sprite.scale.set(
                originalSpriteScale.x * scale,
                originalSpriteScale.y * scale,
                originalSpriteScale.z
            );
            
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    createTextSprite(text, backgroundColor) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = 256;
        canvas.height = 128;
        
        context.font = 'Bold 64px Arial';
        context.fillStyle = '#FFFFFF';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        context.strokeStyle = '#000000';
        context.lineWidth = 8;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
        
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,
            depthTest: false
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(40, 20, 1);
        
        return sprite;
    }
    
    clearHotspots() {
        this.hotspotMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.hotspotMeshes = [];
        
        this.hotspotSprites.forEach(sprite => {
            this.scene.remove(sprite);
            if (sprite.material.map) {
                sprite.material.map.dispose();
            }
            sprite.material.dispose();
        });
        this.hotspotSprites = [];
    }
    
    navigateToPoint(index) {
        if (index >= 0 && index < this.percorso.punti.length) {
            this.currentIndex = index;
            this.loadPoint();
        }
    }
    
    navigateToFotoNumber(fotoNumero) {
        const index = this.percorso.punti.findIndex(p => p.foto_numero === fotoNumero);
        if (index >= 0) {
            this.navigateToPoint(index);
        }
    }
    
    close() {
        this.isActive = false;
        document.getElementById('preview-mode').classList.remove('active');
        this.clearHotspots();
        // 🙈 MINIMAP DISABILITATA
        // this.minimap.hide();
        this.routesFooter.hide();
        console.log('❌ Preview closed');
    }
    
    onPointerDown(event) {
        this.isUserInteracting = true;
        this.lastInteractionTime = Date.now(); // Reset timer per auto-rotazione
        this.onPointerDownMouseX = event.clientX;
        this.onPointerDownMouseY = event.clientY;
        this.onPointerDownLon = this.lon;
        this.onPointerDownLat = this.lat;
    }

    onPointerMove(event) {
        if (this.isUserInteracting) {
            this.lastInteractionTime = Date.now(); // Reset timer per auto-rotazione
            this.lon = (this.onPointerDownMouseX - event.clientX) * 0.1 + this.onPointerDownLon;
            this.lat = (event.clientY - this.onPointerDownMouseY) * 0.1 + this.onPointerDownLat;
        }
    }
    
    onPointerUp(event) {
        if (this.isUserInteracting) {
            const dx = Math.abs(event.clientX - this.onPointerDownMouseX);
            const dy = Math.abs(event.clientY - this.onPointerDownMouseY);
            
            if (dx < 5 && dy < 5) {
                this.handleClick(event);
            }
        }
        this.isUserInteracting = false;
    }
    
    handleClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.hotspotMeshes);
        
        if (intersects.length > 0) {
            const hotspot = intersects[0].object;
            const tipo = hotspot.userData.tipo;
            const targetIndex = hotspot.userData.targetIndex;
            const content = hotspot.userData.content;
            
            console.log(`Clicked hotspot: ${tipo}`, content);
            
            if (tipo === 'incrocio' && targetIndex !== null) {
                this.hotspotMeshes.forEach(h => {
                    h.material.opacity = 0.3;
                });
                this.hotspotSprites.forEach(s => {
                    s.material.opacity = 0.3;
                });
                
                this.navigateToPoint(targetIndex);
                
                setTimeout(() => {
                    this.hotspotMeshes.forEach(h => {
                        h.material.opacity = 0.85;
                    });
                    this.hotspotSprites.forEach(s => {
                        s.material.opacity = 1.0;
                    });
                }, 1000);
            } else if (tipo === 'chiedi') {
                if (content) {
                    this.mediaModal.open(content);
                } else {
                    alert('🎬 Hotspot MP4\n\nNessun contenuto configurato per questo hotspot.');
                }
            } else if (tipo === 'more') {
                if (content) {
                    this.contentModal.open(content);
                } else {
                    alert('ℹ️ Hotspot MORE\n\nNessun contenuto configurato per questo hotspot.');
                }
            } else if (tipo === 'tred') {
                if (content) {
                    this.contentModal.open(content);
                } else {
                    alert('🗿 Hotspot 3D\n\nNessun contenuto configurato per questo hotspot.');
                }
            }
        }
    }
    
    onWheel(event) {
        event.preventDefault();
        this.lastInteractionTime = Date.now(); // Reset timer per auto-rotazione
        this.camera.fov += event.deltaY * 0.05;
        this.camera.fov = Math.max(30, Math.min(120, this.camera.fov));
        this.camera.updateProjectionMatrix();
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    update() {
        // Auto-rotazione se l'utente non interagisce da 2 secondi
        const timeSinceLastInteraction = Date.now() - this.lastInteractionTime;
        if (!this.isUserInteracting && timeSinceLastInteraction > 2000) {
            this.lon += this.autoRotateSpeed;
        }

        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = THREE.MathUtils.degToRad(90 - this.lat);
        this.theta = THREE.MathUtils.degToRad(this.lon);

        const target = new THREE.Vector3(
            500 * Math.sin(this.phi) * Math.cos(this.theta),
            500 * Math.cos(this.phi),
            500 * Math.sin(this.phi) * Math.sin(this.theta)
        );

        this.camera.lookAt(target);
    }
    
    animate() {
        if (!this.isActive) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.update();
        
        if (this.isTransitioning) {
            this.transitionProgress += this.transitionSpeed;
            this.sphereMaterial.uniforms.mixRatio.value = this.transitionProgress;
            
            if (this.transitionProgress >= 1.0) {
                this.isTransitioning = false;
                this.transitionProgress = 0;
                this.sphereMaterial.uniforms.texture1.value = this.nextTexture;
                this.sphereMaterial.uniforms.mixRatio.value = 0.0;
                this.currentTexture = this.nextTexture;
                this.nextTexture = null;
                
                console.log('🔄 Post-morphing addHotspots');
                this.addHotspots();
                console.log('✅ Morphing complete');
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    dispose() {
        if (this.renderer) {
            this.clearHotspots();
            // 🙈 MINIMAP DISABILITATA
            // this.minimap.destroy();
            this.floorPlan.destroy();
            this.routesFooter.destroy();
            this.renderer.dispose();
            this.sphereMaterial.dispose();
            this.sphere.geometry.dispose();
        }
    }
}
