uniform float time;
uniform float progress;
uniform sampler2D uMatcap;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

float PI = 3.1415926;
void main() {

	vec3 normal = normalize(vNormal);
	vec3 viewDir = normalize(vViewPosition);
	vec3 x = normalize(vec3(viewDir.z, 0., -viewDir.x));
	vec3 y = cross(viewDir, x);
	vec2 uv = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5;

	vec4 matcapColor = texture2D(uMatcap, uv);


	// vec4 scan = texture2D();


	vec3 origin = vec3(.0);




	gl_FragColor = vec4(vNormal, 1.);
	gl_FragColor = matcapColor;

}