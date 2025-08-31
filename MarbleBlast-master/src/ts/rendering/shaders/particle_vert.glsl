precision highp float;

#include <definitions>

attribute vec2 position;
attribute vec2 uv;
attribute float particleSpawnTime;
attribute float particleLifetime;
attribute vec3 particlePosition;
attribute vec3 particleVelocity;
attribute float particleInitialSpin;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform float time;
uniform float acceleration;
uniform float spinSpeed;
uniform float dragCoefficient;
uniform vec4 times;
uniform vec4 sizes;
uniform mat4 colors;

varying vec2 vUv;
varying float vFragDepth;
varying float vIsPerspective;
varying vec4 color;

bool isPerspectiveMatrix(mat4 m) {
    return m[2][3] == -1.0;
}

float accessDynamically(vec4 data, int idx) {
    #ifdef IS_WEBGL1
        if (idx == 0) return data[0];
        if (idx == 1) return data[1];
        if (idx == 2) return data[2];
        return data[3];
    #else
        return data[idx];
    #endif
}

vec4 accessDynamically(mat4 data, int idx) {
    #ifdef IS_WEBGL1
        if (idx == 0) return data[0];
        if (idx == 1) return data[1];
        if (idx == 2) return data[2];
        return data[3];
    #else
        return data[idx];
    #endif
}

void main() {
    float elapsed = time - particleSpawnTime;
    float completion = clamp(elapsed / particleLifetime, 0.0, 1.0);

    if (completion >= 1.0) {
        gl_Position = vec4(0.0);
        return;
    }

    float velElapsed = elapsed / 1000.0;
    velElapsed = pow(velElapsed, 1.0 - dragCoefficient);

    vec3 computedPosition = particlePosition + particleVelocity * (velElapsed + acceleration * velElapsed * velElapsed * 0.5);
    float rotation = particleInitialSpin + spinSpeed * elapsed / 1000.0;

    int indexLow = 0;
    int indexHigh = 1;
    for (int i = 2; i < 4; i++) {
        if (times[indexHigh] >= completion) break;
        indexLow = indexHigh;
        indexHigh = i;
    }
    if (times[1] > 1.0) indexHigh = indexLow;

    float timeLow = accessDynamically(times, indexLow);
    float timeHigh = accessDynamically(times, indexHigh);
    float t = (completion - timeLow) / max(timeHigh - timeLow, 1e-6);

    color = mix(accessDynamically(colors, indexLow), accessDynamically(colors, indexHigh), t);
    color.a = pow(color.a, 1.5);

    vec4 viewPosition = viewMatrix * vec4(computedPosition, 1.0);

    vec2 scale = vec2(1.0);
    scale *= mix(accessDynamically(sizes, indexLow), accessDynamically(sizes, indexHigh), t);

    // Clamp scale to avoid disappearing quads on mobile GPUs
    scale = max(scale, vec2(0.01));

    vec2 center = vec2(0.5, 0.5);
    vec2 alignedPosition = (position - (center - vec2(0.5))) * scale;

    vec2 rotatedPosition;
    rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;
    rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;
    viewPosition.xy += rotatedPosition;

    gl_Position = projectionMatrix * viewPosition;

    vUv = uv;

    #ifdef LOG_DEPTH_BUF
        vFragDepth = 1.0 + gl_Position.w;
        vIsPerspective = float(isPerspectiveMatrix(projectionMatrix));
    #endif
}
