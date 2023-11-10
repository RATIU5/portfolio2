#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec4 u_rect_size;
uniform float u_time;


void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;

    // Assuming u_rect_size is now in NDC
    vec2 rectMin = u_rect_size.xy;
    vec2 rectMax = u_rect_size.zw;

    float inRect = step(rectMin.x, uv.x) * step(uv.x, rectMax.x) * 
                   step(rectMin.y, uv.y) * step(uv.y, rectMax.y);    // Output blue color if inside the rectangle, otherwise transparent
    gl_FragColor = vec4(0.0, 0.0, inRect, inRect);    // Output blue color if inside the rectangle, otherwise transparent
}
