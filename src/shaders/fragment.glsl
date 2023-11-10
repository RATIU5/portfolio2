#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec4 u_rect_size; // x,y,z,w
uniform float u_time;

void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Shift origin to center
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    // Rectangle dimensions
    vec2 size = vec2(0.5, 0.25); // Half-width and half-height

    // Compute the distance to the edges of the rectangle
    vec2 d = abs(uv) - size;

    // Outside the rectangle the distance is positive, inside negative
    float insideRectangle = step(0.0, -max(d.x, d.y));

    // Set the color to blue inside the rectangle, transparent outside
    gl_FragColor = vec4(0.0, 0.0, 1.0, insideRectangle);
}
