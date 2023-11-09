vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
//The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }
precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 uMouse;
uniform float noise_speed;
uniform float metaball;
uniform vec4 buttonSize;
uniform float buttonFadeRange;
uniform float discard_threshold;
uniform float antialias_threshold;
uniform float noise_height;
uniform float noise_scale;


void main() {
  vec2 baseResolution = vec2(800.0, 800.0);
  vec2 scaleFactor = baseResolution / resolution;
  float ar = resolution.x / resolution.y;
  vec2 posOld = gl_FragCoord.xy / resolution;
  vec2 posOld2 = vec2(posOld.x * ar, posOld.y);
  vec2 pos = posOld2 * scaleFactor;

  vec2 mouse = uMouse / resolution;

  // Calculate noise as before
  float noise = snoise(vec3(pos * noise_scale, time * noise_speed)); 
  noise = (noise + 1.) / 2.; 

  // Determine if we're within the button bounds and how close we are
  vec4 button = vec4(buttonSize.x, buttonSize.y, buttonSize.z, buttonSize.w);
  // The button's Y coordinate should be based on GLSL space, i.e., bottom is 0 and top is 1.
  float inButtonY = step(button.y, mouse.y) * step(mouse.y, button.w);
  float distX = distance(mouse.x, clamp(mouse.x, button.x, button.z));
  float distY = distance(mouse.y, clamp(mouse.y, button.y, button.w));
  float dist = max(distX, distY); // Use the largest distance to maintain a circular range

  // Calculate a gradient based on the distance, where 0.0 is far and 1.0 is on the button
  float gradient = 1.0 - smoothstep(0.0, buttonFadeRange, dist);

  float val = noise * noise_height;

  float d = distance(mouse, pos); 
  float u = d / (metaball + 0.00001);
  float mouseMetaball = u * max(5., 10. - 25. * u);
  mouseMetaball = clamp(1. - mouseMetaball, 0., 1.);
  val += mouseMetaball; // Apply the gradient here as well

  float low = discard_threshold - antialias_threshold;
  float high = discard_threshold;
  float alpha = smoothstep(low, high, val);
  vec3 color = vec3(63., 30., 223.) / 255.;
  gl_FragColor = vec4(color, alpha);
}

