// ========================================
// THREE.JS ENGINE - Matterport Core
// ========================================

import { CrossfadeShaders } from './shaders.js';

export class PanoramaEngine {
 constructor(containerId) {
 this.container = document.getElementById(containerId);
 this.scene = null;
 this.camera = null;
 this.renderer = null;
 this.sphere = null;
 this.sphereMaterial = null;
 
 // Crossfade state
 this.currentTexture = null;
 this.nextTexture = null;
 this.isTransitioning = false;
 this.transitionProgress = 0;
 this.transitionSpeed = 0.015; // Smooth transition
 
 // Texture loader
 this.textureLoader = new THREE.TextureLoader();
 
 this.init();
 }
 
 init() {
 console.log(' Initializing Three.js Engine...');
 
 // Scene
 this.scene = new THREE.Scene();
 
 // Camera
 this.camera = new THREE.PerspectiveCamera(
 75,
 this.container.clientWidth / this.container.clientHeight,
 0.1,
 1000
 );
 this.camera.position.set(0, 0, 0.1);
 
 // Renderer
 this.renderer = new THREE.WebGLRenderer({ 
 antialias: true,
 alpha: false
 });
 this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
 this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 this.container.appendChild(this.renderer.domElement);
 
 // Sphere Geometry (inverted for inside view)
 const geometry = new THREE.SphereGeometry(500, 60, 40);
 geometry.scale(-1, 1, 1); // Invert normals
 
 // Shader Material with Crossfade
 this.sphereMaterial = new THREE.ShaderMaterial({
 uniforms: CrossfadeShaders.createUniforms(),
 vertexShader: CrossfadeShaders.vertexShader,
 fragmentShader: CrossfadeShaders.fragmentShader,
 side: THREE.DoubleSide
 });
 
 this.sphere = new THREE.Mesh(geometry, this.sphereMaterial);
 this.scene.add(this.sphere);
 
 // Ambient Light
 const ambientLight = new THREE.AmbientLight(0xffffff, 1);
 this.scene.add(ambientLight);
 
 // Window resize handler
 window.addEventListener('resize', () => this.onWindowResize());
 
 // Start animation loop
 this.animate();
 
 console.log(' Engine ready!');
 }
 
 animate() {
 requestAnimationFrame(() => this.animate());
 
 // Crossfade animation
 if (this.isTransitioning) {
 this.transitionProgress += this.transitionSpeed;
 this.sphereMaterial.uniforms.mixRatio.value = this.transitionProgress;
 
 if (this.transitionProgress >= 1.0) {
 // Transition complete
 this.isTransitioning = false;
 this.transitionProgress = 0;
 this.sphereMaterial.uniforms.texture1.value = this.nextTexture;
 this.sphereMaterial.uniforms.mixRatio.value = 0.0;
 this.currentTexture = this.nextTexture;
 this.nextTexture = null;
 
 console.log(' Transition complete');
 }
 }
 
 this.renderer.render(this.scene, this.camera);
 }
 
 loadTexture(imageUrl, onComplete) {
 console.log(` Loading: ${imageUrl}`);
 
 this.textureLoader.load(
 imageUrl,
 (texture) => {
 if (!this.currentTexture) {
 // First texture - no transition
 this.currentTexture = texture;
 this.sphereMaterial.uniforms.texture1.value = texture;
 this.sphereMaterial.uniforms.mixRatio.value = 0.0;
 console.log(' First texture loaded');
 } else {
 // Crossfade to new texture
 this.nextTexture = texture;
 this.sphereMaterial.uniforms.texture2.value = texture;
 this.isTransitioning = true;
 this.transitionProgress = 0;
 console.log(' Starting crossfade...');
 }
 
 if (onComplete) onComplete();
 },
 (progress) => {
 const percent = (progress.loaded / progress.total) * 100;
 console.log(` Loading: ${percent.toFixed(0)}%`);
 },
 (error) => {
 console.error(' Error loading texture:', error);
 }
 );
 }
 
 onWindowResize() {
 this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
 this.camera.updateProjectionMatrix();
 this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
 }
 
 getCamera() {
 return this.camera;
 }
 
 getScene() {
 return this.scene;
 }
 
 getRenderer() {
 return this.renderer;
 }
 
 dispose() {
 this.renderer.dispose();
 this.sphereMaterial.dispose();
 this.sphere.geometry.dispose();
 console.log(' Engine disposed');
 }
}
