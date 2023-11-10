#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec4 u_rect_size; // x,y,z,w
uniform float u_time;


void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Convert pixel coordinates of the rectangle to normalized device coordinates
    vec2 rectMin = u_rect_size.xy / u_resolution;
    vec2 rectMax = u_rect_size.zw / u_resolution;

    // Determine if within the rectangle
    float inRect = step(rectMin.x, uv.x) * step(uv.x, rectMax.x) * step(rectMin.y, uv.y) * step(uv.y, rectMax.y);

    // Output blue color if inside the rectangle, otherwise transparent
    gl_FragColor = vec4(0.0, 0.0, inRect, inRect);
}
