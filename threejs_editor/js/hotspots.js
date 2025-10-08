// ========================================
// HOTSPOT MANAGER - 3D Interactive Points
// ========================================

export class HotspotManager {
 constructor(scene, camera, domElement) {
 this.scene = scene;
 this.camera = camera;
 this.domElement = domElement;
 
 this.hotspots = [];
 this.raycaster = new THREE.Raycaster();
 this.mouse = new THREE.Vector2();
 
 console.log('✅ Hotspot manager ready');
 }
 
 createHotspot(position, type = 'incrocio', data = {}) {
 let color, size;
 
 switch(type) {
 case 'incrocio':
 color = 0x4CAF50;
 size = 30; // 🔍 Aumentato da 20 a 30 per maggiore visibilità
 break;
 case 'chiedi':
 color = 0xFF9800;
 size = 25; // 🔍 Aumentato da 15 a 25
 break;
 case 'more':
 color = 0x2196F3;
 size = 25; // 🔍 Aumentato da 15 a 25
 break;
 case 'tred':
 color = 0x9C27B0; // Viola per 3D
 size = 25; // 🔍 Aumentato da 15 a 25
 break;
 default:
 console.warn(`⚠️ Tipo hotspot sconosciuto: ${type}`);
 color = 0xFFFFFF;
 size = 25; // 🔍 Aumentato da 15 a 25
 }
 
 // Create sphere geometry
 const geometry = new THREE.SphereGeometry(size, 16, 16);
 const material = new THREE.MeshBasicMaterial({ 
 color: color,
 transparent: true,
 opacity: 0.85
 });
 
 const mesh = new THREE.Mesh(geometry, material);
 mesh.position.copy(position);
 
 // Store data
 mesh.userData = {
 type: type,
 data: data,
 originalScale: mesh.scale.clone(),
 isHotspot: true,
 pulseEnabled: true // Flag per controllare l'animazione pulse
 };
 
 this.scene.add(mesh);
 this.hotspots.push(mesh);
 
 // Animate pulse
 this.animatePulse(mesh);
 
 console.log(`✅ Hotspot created: ${type}`);
 
 return mesh;
 }
 
 animatePulse(mesh) {
 let time = Math.random() * Math.PI * 2; // Random start

 const animate = () => {
 if (!mesh.parent) return; // Stop if removed

 // IMPORTANTE: Non animare se il pulse è disabilitato (durante editing)
 if (mesh.userData.pulseEnabled) {
 time += 0.05;
 const scale = 1 + Math.sin(time) * 0.2;
 const originalScale = mesh.userData.originalScale;
 mesh.scale.set(
 originalScale.x * scale,
 originalScale.y * scale,
 originalScale.z * scale
 );
 }

 requestAnimationFrame(animate);
 };

 animate();
 }
 
 checkIntersection(event) {
 // Calculate mouse position
 const rect = this.domElement.getBoundingClientRect();
 this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
 this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
 
 // Raycast
 this.raycaster.setFromCamera(this.mouse, this.camera);
 const intersects = this.raycaster.intersectObjects(this.hotspots);
 
 if (intersects.length > 0) {
 return intersects[0].object;
 }
 
 return null;
 }
 
 clearAll() {
 this.hotspots.forEach(hotspot => {
 this.scene.remove(hotspot);
 hotspot.geometry.dispose();
 hotspot.material.dispose();
 });
 
 this.hotspots = [];
 console.log('🧹 All hotspots cleared');
 }
 
 remove(hotspot) {
 const index = this.hotspots.indexOf(hotspot);
 if (index > -1) {
 this.scene.remove(hotspot);
 hotspot.geometry.dispose();
 hotspot.material.dispose();
 this.hotspots.splice(index, 1);
 console.log('🗑️ Hotspot removed');
 }
 }
 
 getAll() {
 return this.hotspots;
 }
}
