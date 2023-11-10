#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec4 u_rect_size;
uniform float u_time;


void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 2.0 - 1.0;

    vec2 rectMin = u_rect_size.xy;
    vec2 rectMax = u_rect_size.zw;
    float inRect = step(rectMin.x, uv.x) * step(uv.x, rectMax.x) * 
                   step(rectMin.y, uv.y) * step(uv.y, rectMax.y);

    float aspectRatio = u_resolution.x / u_resolution.y;
    vec2 adjustedUv = uv;
    adjustedUv.x *= aspectRatio;

    float radius = 0.05;
    float dist = distance(adjustedUv, vec2(u_mouse.x * aspectRatio, u_mouse.y));
    float circle = step(dist, radius);

    float shape = max(inRect, circle);

    gl_FragColor = vec4(0.0, 0.0, shape, shape);
}
