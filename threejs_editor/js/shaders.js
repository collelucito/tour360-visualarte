// ========================================
// CROSSFADE SHADERS - Matterport Style
// ========================================

export const CrossfadeShaders = {
 // Vertex Shader - passa UV coordinates
 vertexShader: `
 varying vec2 vUv;
 
 void main() {
 vUv = uv;
 gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
 }
 `,
 
 // Fragment Shader - blend tra due texture
 fragmentShader: `
 uniform sampler2D texture1;
 uniform sampler2D texture2;
 uniform float mixRatio;
 
 varying vec2 vUv;
 
 void main() {
 vec4 color1 = texture2D(texture1, vUv);
 vec4 color2 = texture2D(texture2, vUv);
 
 // Smooth blend con curve easing
 float smoothMix = smoothstep(0.0, 1.0, mixRatio);
 
 gl_FragColor = mix(color1, color2, smoothMix);
 }
 `,
 
 // Uniforms iniziali
 createUniforms: function() {
 return {
 texture1: { value: null },
 texture2: { value: null },
 mixRatio: { value: 0.0 }
 };
 }
};
