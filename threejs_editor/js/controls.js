// ========================================
// CAMERA CONTROLS - Smooth Navigation
// ========================================

export class CameraControls {
 constructor(camera, domElement) {
 this.camera = camera;
 this.domElement = domElement;
 
 // State
 this.enabled = true; // IMPORTANTE: Proprietà per abilitare/disabilitare
 this.isUserInteracting = false;
 this.onPointerDownMouseX = 0;
 this.onPointerDownMouseY = 0;
 this.lon = 0;
 this.onPointerDownLon = 0;
 this.lat = 0;
 this.onPointerDownLat = 0;
 this.phi = 0;
 this.theta = 0;
 
 // Callbacks
 this.onClickCallback = null;
 
 this.init();
 }
 
 init() {
 // Mouse/Touch events
 this.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
 this.domElement.addEventListener('pointermove', (e) => this.onPointerMove(e));
 this.domElement.addEventListener('pointerup', (e) => this.onPointerUp(e));
 this.domElement.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
 
 console.log(' Camera controls ready');
 }
 
 onPointerDown(event) {
 if (!this.enabled) return;
 this.isUserInteracting = true;
 this.onPointerDownMouseX = event.clientX;
 this.onPointerDownMouseY = event.clientY;
 this.onPointerDownLon = this.lon;
 this.onPointerDownLat = this.lat;
 }
 
 onPointerMove(event) {
 if (!this.enabled || !this.isUserInteracting) return;
 this.lon = (this.onPointerDownMouseX - event.clientX) * 0.1 + this.onPointerDownLon;
 this.lat = (event.clientY - this.onPointerDownMouseY) * 0.1 + this.onPointerDownLat;
 }
 
 onPointerUp(event) {
 if (!this.enabled) {
 this.isUserInteracting = false;
 return;
 }

 if (this.isUserInteracting) {
 const dx = Math.abs(event.clientX - this.onPointerDownMouseX);
 const dy = Math.abs(event.clientY - this.onPointerDownMouseY);

 // Se movimento piccolo = click
 if (dx < 5 && dy < 5 && this.onClickCallback) {
 this.onClickCallback(event);
 }
 }

 this.isUserInteracting = false;
 }
 
 onWheel(event) {
 if (!this.enabled) return;
 event.preventDefault();

 // Zoom con FOV
 this.camera.fov += event.deltaY * 0.05;
 this.camera.fov = Math.max(30, Math.min(120, this.camera.fov));
 this.camera.updateProjectionMatrix();
 }
 
 update() {
 // Clamp latitude
 this.lat = Math.max(-85, Math.min(85, this.lat));
 
 // Calculate spherical coordinates
 this.phi = THREE.MathUtils.degToRad(90 - this.lat);
 this.theta = THREE.MathUtils.degToRad(this.lon);
 
 // Update camera lookAt
 const target = new THREE.Vector3(
 500 * Math.sin(this.phi) * Math.cos(this.theta),
 500 * Math.cos(this.phi),
 500 * Math.sin(this.phi) * Math.sin(this.theta)
 );
 
 this.camera.lookAt(target);
 }
 
 onClick(callback) {
 this.onClickCallback = callback;
 }
 
 reset() {
 this.lon = 0;
 this.lat = 0;
 this.camera.fov = 75;
 this.camera.updateProjectionMatrix();
 }
}
