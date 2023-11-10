import * as PIXI from "pixi.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { pixiApplicationConfig } from "./config.js";

type AppState = {
  app: PIXI.Application<HTMLCanvasElement>;
  mesh: PIXI.Mesh<PIXI.Shader>;
};

// TODO: with pixel ratio of 1, the geometry does not update on resize
// Update: it happens on retina displays whenever the size
// grows more than double it's initial size

function main() {
  const state: AppState = {
    app: new PIXI.Application(pixiApplicationConfig),
    mesh: createMesh(),
  };
  state.app.stage.addChild(state.mesh);
  setupDOM(state);
  resize(state);
  state.app.ticker.add((delta) => tick(state, delta));
}
main();

function setupDOM(state: AppState) {
  document.body.appendChild(state.app.view);
  state.app.view.style.position = "absolute";
  state.app.view.style.display = "block";
  state.app.view.style.zIndex = "-1";
  window.addEventListener("resize", () => resize(state));
  window.addEventListener("mousemove", (e) => mouseMove(state, e));
}

function resize(state: AppState) {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  state.app.renderer.resize(newWidth, newHeight);
  state.app.view.style.width = `${newWidth}px`;
  state.app.view.style.height = `${newHeight}px`;
  state.mesh.geometry = createGeometry(newWidth, newHeight);
  updateUniform(state, "u_resolution", [
    state.app.renderer.width,
    state.app.renderer.height,
  ]);

  const element = document.querySelector(".button");
  if (!element) {
    return console.error(".button is not defined");
  }
  const rect = element.getBoundingClientRect();
  updateUniform(
    state,
    "u_rect_size",
    calculateSize(state, [rect.left, rect.top, rect.width, rect.height]),
  );
}

function mouseMove(state: AppState, e: MouseEvent) {
  updateUniform(
    state,
    "u_mouse",
    calculatePosition(state, e.clientX, e.clientY),
  );
}

function updateUniform<T = any>(state: AppState, name: string, value: T) {
  state.mesh.shader.uniforms[name] = value;
}

function createGeometry(newWidth: number, newHeight: number) {
  let positionalBuffer = new Float32Array([
    0,
    0,
    newWidth,
    0,
    newWidth,
    newHeight,
    0,
    newHeight,
  ]);
  return new PIXI.Geometry()
    .addAttribute("position", positionalBuffer, 2)
    .addIndex([0, 1, 2, 0, 2, 3]);
}

function pixelRatio(): number {
  return window.devicePixelRatio || 1;
}

function calculatePosition(
  state: AppState,
  x: number,
  y: number,
): [number, number] {
  const rect = state.app.view.getBoundingClientRect();
  const scaleX = state.app.renderer.width / rect.width;
  const scaleY = state.app.renderer.height / rect.height;
  const x2 = (x - rect.left) * scaleX;
  const y2 = (y - rect.top) * scaleY;
  const ndcX = (x2 / state.app.renderer.width) * 2 - 1;
  const ndcY = 1 - (y2 / state.app.renderer.height) * 2;
  return [ndcX, ndcY];
}

// state: AppState
// rect: [x, y, width, height]
function calculateSize(
  state: AppState,
  rect: [number, number, number, number],
): [number, number, number, number] {
  const pr = pixelRatio();
  const canvasWidth = state.app.renderer.width / pr;
  const canvasHeight = state.app.renderer.height / pr;
  const left = 2 * (rect[0] / canvasWidth) - 1;
  const right = 2 * ((rect[0] + rect[2]) / canvasWidth) - 1;
  const top = 1 - 2 * (rect[1] / canvasHeight);
  const bottom = 1 - 2 * ((rect[1] + rect[3]) / canvasHeight);
  return [left, bottom, right, top];
}

function createMesh() {
  const geometry = createGeometry(0, 0);
  const shader = PIXI.Shader.from(vertexShader, fragmentShader, {
    resolution: [0, 0],
    u_rect_size: [0, 0, 0, 0],
    u_mouse: [0, 0],
    u_time: 0,
  });
  return new PIXI.Mesh(geometry, shader);
}

function tick(state: AppState, delta: number) {
  updateUniform(state, "u_time", state.app.ticker.elapsedMS / 1000.0);
}
