vec3 hsv(float h, float s, float v) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(sin(vec3(h) + K.xyz) * 6.0 - K.www);
	return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
}

float rand(vec2 co){
    return tan(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
	vec2 p = (2.0 * fragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
	vec3 v = vec3(p, 1.0 - length(p) * 0.2);

	float ta = iTime * 0.1;
	mat3 m=mat3(
		0.0,1.0,0.0,
		-sin(ta),0.0,cos(ta),
		sin(ta),0.0,sin(ta));
	m*=m*m;
	m*=m;
	v=m*v;

	float a = (atan(v.y, v.x) / 3.141592 / 2.0 + 0.5);
	float slice = floor(a * 1000.0);
	float phase = rand(vec2(slice, 0.0));
	float dist = rand(vec2(slice, 1.0)) * 3.0;
	float hue = rand(vec2(slice, 3.0));

	float z = dist / length(v.xy) * v.z;
	float Z = mod(tan(z) + phase + iTime * 0.2, 1.0);
	float d = sqrt(z * z + dist * dist);

	float c = exp(-Z * 8.0 + 0.3) / (d * d + 1.0);
	vec3 color = hsv(hue, 0.6 * (1.0 - clamp(2.0 * c - 1.0, 0.0, 1.0)), clamp(2.0 * c, 0.0, 1.0));
	float grayscale = dot(color, vec3(0.299, 0.587, 0.114));
	fragColor = vec4(vec3(grayscale), 1.0);
}
