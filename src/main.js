import * as PIXI from "pixi.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

const mouse = {
  x: 0,
  y: 0,
};

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  autoDensity: true,
  backgroundAlpha: 0,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.view);

// Auto-resize
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.view.style.zIndex = "-1";
window.addEventListener("resize", onResize);

window.addEventListener("mousemove", (e) => {
  const rect = app.view.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (app.view.width / rect.width);
  mouse.y = (e.clientY - rect.top) * (app.view.height / rect.height);
});

let positionalBuffer = new Float32Array([
  0,
  0,
  app.view.width,
  0,
  app.view.width,
  app.view.height,
  0,
  app.view.height,
]);

const geometry = new PIXI.Geometry()
  .addAttribute("position", positionalBuffer, 2)
  .addIndex([0, 1, 2, 0, 2, 3]);

const button = document.querySelector(".button");
const buttonRect = button.getBoundingClientRect();
const buttonSizeNDC = {
  x: buttonRect.x / window.innerWidth,
  y: 1.0 - (buttonRect.y + buttonRect.height) / window.innerHeight, // Flip Y
  z: (buttonRect.x + buttonRect.width) / window.innerWidth,
  w: 1.0 - buttonRect.y / window.innerHeight, // Flip Y and use top-left as origin
};

const uniforms = {
  resolution: [0, 0],
  uMouse: [0, 0],
  buttonSize: [
    buttonSizeNDC.x,
    buttonSizeNDC.y,
    buttonSizeNDC.z,
    buttonSizeNDC.w,
  ],
  time: 0,
  noise_speed: 0.2,
  metaball: 1,
  discard_threshold: 0.5,
  antialias_threshold: 0.002,
  noise_height: 0.5,
  noise_scale: 50,
};

const shader = PIXI.Shader.from(vertexShader, fragmentShader, uniforms);

const mesh = new PIXI.Mesh(geometry, shader);
mesh.blendMode = PIXI.BLEND_MODES.NORMAL;
app.stage.addChild(mesh);

app.ticker.add((delta) => {
  const elapsed = app.ticker.elapsedMS / 1000.0;
  mesh.shader.uniforms.time += elapsed;
  mesh.shader.uniforms.uMouse = [mouse.x, mouse.y];
  mesh.shader.uniforms.resolution = [app.renderer.width, app.renderer.height];
});

function onResize() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  const positionBuffer = new Float32Array([
    0,
    0,
    window.innerWidth,
    0,
    window.innerWidth,
    window.innerHeight,
    0,
    window.innerHeight,
  ]);
  geometry.buffers[0].update(positionBuffer);
  mesh.shader.uniforms.resolution = [window.innerWidth, window.innerHeight];
}

onResize();
