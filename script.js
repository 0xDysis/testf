const canvas = document.getElementById('glCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

// Vertex shader
const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }
`;

// Fragment shader for mobile
const fsSourceMobile = `

precision mediump float;
uniform vec2 iResolution;
uniform float iTime;

vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.*(c*t+d) );
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);

    for (float i = 0.0; i < 4.0; i++) {
        uv = abs(uv * 1.2) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + i*.9 + iTime*.5);

        d = fract(sin(tan(d*8. + iTime)))/9.;
        d = abs(d);

        d = pow(0.01 / d, 1.1);

        finalColor += col * fract(d);
    }

    gl_FragColor = vec4(finalColor, 1.0);
}

`;

// Fragment shader for desktop
const fsSourceDesktop = `
precision highp float;
uniform vec2 iResolution;
uniform float iTime;

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec4 fragColor;

    float s = 0.0, v = 0.0;
    vec2 uv = (fragCoord / iResolution.xy) * 2.0 - 1.;
    float time = (iTime-6.0)*50.0;
    vec3 col = vec3(-0.1);
    vec3 init = vec3(tan(time * .0032)*.3, .35 - tan(time * .005)*.3, time * 0.0002);
    for (int r = 0; r < 100; r++) 
    {
        vec3 p = init + s * vec3(uv, 0.05);
        p.z = fract(p.z);
for (int i=0; i < 8; i++) p = abs(p * 2.04) / dot(p, p) - 0.80

;
        v += pow(dot(p, p), .8) * .04;
        col +=  vec3(v * 0.2+.4, 12.-s*2., .1 + v * 1.) * v * 0.00006;
        s += .02;
    }

    float grayscale = dot(col, vec3(0.3, 0.59, 0.11));
    col = vec3(grayscale);

    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);

    gl_FragColor = fragColor;
}
`;

// Detect if the user is on a mobile device
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Choose the appropriate fragment shader source
const fsSource = isMobile ? fsSourceMobile : fsSourceDesktop;





const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
     1.0,  1.0
]), gl.STATIC_DRAW);

gl.useProgram(shaderProgram);

const positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const iResolutionLocation = gl.getUniformLocation(shaderProgram, 'iResolution');
gl.uniform2f(iResolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);

const iTimeLocation = gl.getUniformLocation(shaderProgram, 'iTime');
let startTime = Date.now();
function render() {
    let currentTime = Date.now();
    gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000); // time in seconds
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}
render();