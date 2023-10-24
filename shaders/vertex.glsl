uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
uniform vec3 uMin;
float PI = 3.1415926;
 
varying vec3 vNormal;

varying vec3 vWorldPosition;

varying vec3 vViewPosition;

attribute float aRandom;
void main () {
	vUv = uv;

	float offset = aRandom + sin(time + 2. * aRandom);	
	// offset = 0.;

	vec4 mvPosition = modelViewMatrix * instanceMatrix *  vec4(position, 1.);

	mvPosition.y +=  offset;


	mvPosition = viewMatrix * mvPosition;

	vViewPosition = -mvPosition.xyz;
	vNormal = normalMatrix * mat3(instanceMatrix) * normal;


	vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.);
	worldPosition.y += offset;
	vWorldPosition = worldPosition.xyz;


	gl_Position = projectionMatrix * mvPosition;
}