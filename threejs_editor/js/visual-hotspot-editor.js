// ========================================
// VISUAL HOTSPOT EDITOR - Modifica posizione e scala
// ========================================

export class VisualHotspotEditor {
    constructor(scene, camera, renderer, cameraControls) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.domElement = renderer.domElement;
        this.cameraControls = cameraControls;
        
        this.selectedHotspot = null;
        this.hotspotData = null;
        this.isDragging = false;
        this.dragPlane = new THREE.Plane();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.intersection = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        
        this.setupUI();
        this.setupEvents();
        
        console.log('✅ Visual Hotspot Editor ready');
    }
    
    setupUI() {
        const panel = document.createElement('div');
        panel.id = 'hotspot-editor-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 15px;
            color: white;
            min-width: 300px;
            display: none;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            font-family: Arial, sans-serif;
        `;
        
        panel.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #4CAF50;">🎯 Editor Hotspot</h3>

            <div style="margin-bottom: 15px; padding: 15px; background: rgba(76, 175, 80, 0.2); border-radius: 8px;">
                <strong id="selected-hotspot-info">Hotspot selezionato</strong>
                <div style="margin-top: 10px; font-size: 12px; color: #aaa;">
                    <div>📍 X: <span id="pos-x-display">0</span></div>
                    <div>📍 Y: <span id="pos-y-display">0</span></div>
                    <div>📍 Z: <span id="pos-z-display">0</span></div>
                    <div>📏 Scala: <span id="scale-display">1.0</span></div>
                </div>
            </div>

            <div style="padding: 15px; background: rgba(33, 150, 243, 0.2); border-radius: 8px; font-size: 12px; margin-bottom: 15px;">
                <strong>💡 Controlli:</strong><br>
                • <strong>Click e trascina</strong>: Sposta hotspot<br>
                • <strong>Rotellina</strong>: Scala dimensione (0.1 - 10.0)<br>
                • <strong>ESC</strong>: Annulla e chiudi<br>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <button id="hotspot-save" style="padding: 12px; background: #4CAF50; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">
                    ✅ SALVA
                </button>
                <button id="hotspot-delete" style="padding: 12px; background: #FF9800; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">
                    🗑️ ELIMINA
                </button>
                <button id="hotspot-cancel" style="padding: 12px; background: #f44336; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">
                    ❌ ANNULLA
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.panel = panel;
        
        document.getElementById('hotspot-save').addEventListener('click', () => {
            this.saveAndClose();
        });

        document.getElementById('hotspot-delete').addEventListener('click', () => {
            this.deleteHotspot();
        });

        document.getElementById('hotspot-cancel').addEventListener('click', () => {
            this.cancel();
        });
    }
    
    setupEvents() {
        this.domElement.addEventListener('mousedown', (e) => {
            if (!this.selectedHotspot) return;

            this.updateMousePosition(e);
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.selectedHotspot);

            if (intersects.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.isDragging = true;

                console.log('🎯 Inizio drag hotspot - BLOCCANDO CAMERA');

                // Blocca camera SOLO durante il drag dell'hotspot
                if (this.cameraControls) {
                    this.cameraControls.enabled = false;
                    console.log('🔒 Camera bloccata durante drag');
                }

                const cameraDirection = new THREE.Vector3();
                this.camera.getWorldDirection(cameraDirection);
                this.dragPlane.setFromNormalAndCoplanarPoint(
                    cameraDirection,
                    this.selectedHotspot.position
                );

                this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection);
                this.offset.copy(this.intersection).sub(this.selectedHotspot.position);
            }
        }, { capture: true, passive: false });
        
        this.domElement.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.selectedHotspot) return;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            this.updateMousePosition(e);
            this.raycaster.setFromCamera(this.mouse, this.camera);

            if (this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection)) {
                this.selectedHotspot.position.copy(this.intersection.sub(this.offset));
                this.updateDisplayValues();
                this.autoSave();
            }
        }, { capture: true, passive: false });
        
        this.domElement.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.isDragging = false;

                console.log('✅ Drag ended - RIABILITANDO CAMERA');

                // Riabilita camera dopo il drag - così può ruotare per posizionare meglio
                if (this.cameraControls) {
                    this.cameraControls.enabled = true;
                    console.log('🔓 Camera sbloccata dopo drag');
                }
            }
        }, { capture: true, passive: false });
        
        this.domElement.addEventListener('wheel', (e) => {
            if (!this.selectedHotspot) return;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const currentScale = this.selectedHotspot.scale.x;
            const newScale = Math.max(0.1, Math.min(2.0, currentScale + delta)); // Limiti corretti 0.1-2.0

            // Applica la scala a tutti e 3 gli assi
            this.selectedHotspot.scale.set(newScale, newScale, newScale);
            this.updateDisplayValues();

            console.log('📏 Scale changed:', newScale.toFixed(2), 'Actual scale:', {
                x: this.selectedHotspot.scale.x,
                y: this.selectedHotspot.scale.y,
                z: this.selectedHotspot.scale.z
            });
            this.autoSave();
        }, { passive: false, capture: true });
        
        document.addEventListener('keydown', (e) => {
            // 🔒 IMPORTANTE: Verifica che il target non sia un input field
            const isInputField = e.target.tagName === 'INPUT' ||
                                 e.target.tagName === 'TEXTAREA' ||
                                 e.target.tagName === 'SELECT';

            if (isInputField) {
                return; // Non intercettare tasti se siamo in un campo di input
            }

            if (e.key === 'Escape' && this.selectedHotspot) {
                e.preventDefault();
                e.stopPropagation();
                this.cancel();
            }

            // 🗑️ Elimina hotspot SOLO con Delete (NO Backspace per evitare navigazione browser)
            if (e.key === 'Delete' && this.selectedHotspot) {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('🗑️ Eliminare questo hotspot?')) {
                    console.log('🗑️ Eliminazione hotspot via tastiera');
                    if (this.onDelete) {
                        this.onDelete(this.hotspotData);
                    }
                    this.close();
                }
            }
        });
    }
    
    updateMousePosition(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    selectHotspot(hotspotMesh, hotspotData) {
        this.selectedHotspot = hotspotMesh;
        this.hotspotData = hotspotData;
        this.originalPosition = hotspotMesh.position.clone();
        this.originalScale = hotspotMesh.scale.x;

        // NON bloccare la camera qui - permettiamo la rotazione per posizionare l'hotspot
        console.log('🎯 Editor attivo - camera libera per posizionamento');

        // IMPORTANTE: Disabilita animazione pulse durante editing
        if (hotspotMesh.userData) {
            hotspotMesh.userData.pulseEnabled = false;
            console.log('⏸️ Pulse animation disabilitata per editing');
        }

        this.highlightHotspot(hotspotMesh);
        this.panel.style.display = 'block';

        // Mostra info tipo con icone appropriate
        const typeInfo = {
            'incrocio': '🚪 Navigazione',
            'vai': '🚪 Navigazione',
            'chiedi': '🎬 Media',
            'mp4': '🎬 Media',
            'more': 'ℹ️ Informazioni',
            'tred': '🎨 3D'
        };

        let info = typeInfo[hotspotData.tipo] || `Tipo: ${hotspotData.tipo}`;
        if (hotspotData.targetFoto) {
            info += ` → IMG_${String(hotspotData.targetFoto).padStart(3, '0')}`;
        }
        document.getElementById('selected-hotspot-info').textContent = info;

        this.updateDisplayValues();

        console.log('🎯 Hotspot selezionato per editing');
    }
    
    highlightHotspot(mesh) {
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.isHotspot) {
                if (child.material && child.material.color) {
                    const originalColor = child.userData.type === 'incrocio' ? 0x4CAF50 : 
                                         child.userData.type === 'chiedi' ? 0xFF9800 :
                                         child.userData.type === 'more' ? 0x2196F3 : 0x9C27B0;
                    child.material.color.setHex(originalColor);
                }
            }
        });
        
        if (mesh && mesh.material) {
            mesh.material.color.setHex(0xffff00); // Giallo
        }
    }
    
    updateDisplayValues() {
        if (!this.selectedHotspot) return;
        
        document.getElementById('pos-x-display').textContent = Math.round(this.selectedHotspot.position.x);
        document.getElementById('pos-y-display').textContent = Math.round(this.selectedHotspot.position.y);
        document.getElementById('pos-z-display').textContent = Math.round(this.selectedHotspot.position.z);
        document.getElementById('scale-display').textContent = this.selectedHotspot.scale.x.toFixed(2);
    }
    
    autoSave() {
        if (!this.selectedHotspot || !this.hotspotData) return;
        
        // Salva posizione e scala
        this.hotspotData.position = {
            x: this.selectedHotspot.position.x,
            y: this.selectedHotspot.position.y,
            z: this.selectedHotspot.position.z
        };
        
        this.hotspotData.scale = this.selectedHotspot.scale.x;
        
        if (this.onAutoSave) {
            this.onAutoSave(this.hotspotData);
        }
        
        console.log('💾 Auto-save:', {
            position: this.hotspotData.position,
            scale: this.hotspotData.scale
        });
    }
    
    saveAndClose() {
        if (!this.selectedHotspot || !this.hotspotData) return;

        // Salva posizione e scala
        this.hotspotData.position = {
            x: this.selectedHotspot.position.x,
            y: this.selectedHotspot.position.y,
            z: this.selectedHotspot.position.z
        };

        this.hotspotData.scale = this.selectedHotspot.scale.x;

        console.log('🔧 VISUAL EDITOR - Salvataggio hotspot:');
        console.log('📍 Position:', this.hotspotData.position);
        console.log('📏 Scale:', this.hotspotData.scale);
        console.log('🔢 Timestamp:', this.hotspotData.timestamp);
        console.log('🎯 Tipo:', this.hotspotData.tipo);
        console.log('📦 Intero hotspotData:', this.hotspotData);

        if (this.onApply) {
            console.log('📡 Chiamando callback onApply...');
            this.onApply(this.hotspotData);
        } else {
            console.log('❌ Nessun callback onApply impostato!');
        }

        this.close();
    }
    
    deleteHotspot() {
        if (!this.selectedHotspot || !this.hotspotData) return;

        if (confirm('Eliminare questo hotspot?')) {
            console.log('🗑️ Eliminazione hotspot:', this.hotspotData);

            // Notifica la callback di eliminazione
            if (this.onDelete) {
                this.onDelete(this.hotspotData);
            }

            // Rimuovi dalla scena
            if (this.selectedHotspot.parent) {
                this.selectedHotspot.parent.remove(this.selectedHotspot);
            }

            this.close();
        }
    }

    cancel() {
        if (!this.selectedHotspot) return;

        this.selectedHotspot.position.copy(this.originalPosition);
        this.selectedHotspot.scale.set(this.originalScale, this.originalScale, this.originalScale);
        
        console.log('❌ Modifiche annullate');
        this.close();
    }
    
    close() {
        // Assicurati sempre che la camera sia riabilitata quando chiudi l'editor
        if (this.cameraControls) {
            this.cameraControls.enabled = true;
            console.log('🔓 Editor chiuso - camera riabilitata');
        }

        this.panel.style.display = 'none';

        // Riabilita animazione pulse
        if (this.selectedHotspot && this.selectedHotspot.userData) {
            this.selectedHotspot.userData.pulseEnabled = true;
            console.log('▶️ Pulse animation riabilitata');
        }

        if (this.selectedHotspot && this.selectedHotspot.material) {
            const originalColor = this.selectedHotspot.userData.type === 'incrocio' ? 0x4CAF50 : 
                                 this.selectedHotspot.userData.type === 'chiedi' ? 0xFF9800 :
                                 this.selectedHotspot.userData.type === 'more' ? 0x2196F3 : 0x9C27B0;
            this.selectedHotspot.material.color.setHex(originalColor);
        }
        
        this.selectedHotspot = null;
        this.hotspotData = null;
        this.isDragging = false;
    }
}
