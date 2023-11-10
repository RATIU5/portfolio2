// Imports
import * as PIXI from "pixi.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { pixiApplicationConfig } from "./config.js";

type AppState = {
  app: PIXI.Application<HTMLCanvasElement>;
  mesh: PIXI.Mesh<PIXI.Shader>;
};

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
  state.app.renderer.resize(window.innerWidth, window.innerHeight);
  updateUniform(state, "u_resolution", getAppWidthAndHeight(state));
  updateUniform(state, "u_rect_size", calculateButtonSize(state));
  updateBuffer(
    state,
    "position",
    new Float32Array([
      0,
      0,
      state.app.view.width,
      0,
      state.app.view.width,
      state.app.view.height,
      0,
      state.app.view.height,
    ]),
  );
}

function mouseMove(state: AppState, e: MouseEvent) {
  const rect = state.app.view.getBoundingClientRect();
  const xy = [
    (e.clientX - rect.left) * (state.app.view.width / rect.width),
    (window.innerHeight - (e.clientY - rect.top)) *
    (state.app.view.height / rect.height),
  ];
  updateUniform(state, "u_mouse", xy);
}

function getAppWidthAndHeight(state: AppState): [number, number] {
  return [state.app.renderer.width, state.app.renderer.height];
}

function updateUniform<T = any>(state: AppState, name: string, value: T) {
  state.mesh.shader.uniforms[name] = value;
}

function updateBuffer(state: AppState, name: string, value: Float32Array) {
  state.mesh.geometry.getBuffer(name).data = value;
}

function calculateButtonSize(
  state: AppState,
): [number, number, number, number] {
  const buttonElement = document.querySelector(".button");
  if (!buttonElement) {
    console.error(".button element not defined");
    return [0, 0, 0, 0];
  }
  const rect = buttonElement.getBoundingClientRect();
  const canvasWidth = state.app.view.width;
  const canvasHeight = state.app.view.height;

  const left = (rect.left / canvasWidth) * 2 - 1;
  const right = (rect.right / canvasWidth) * 2 - 1;
  const top = -((rect.top / canvasHeight) * 2 - 1);
  const bottom = -((rect.bottom / canvasHeight) * 2 - 1);

  const ndcRect = [0, 0, 100, 100];
  console.log("NDC Rectangle:", ndcRect);
  return ndcRect;
}

function createMesh() {
  // Geometry
  let positionalBuffer = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
  const geometry = new PIXI.Geometry()
    .addAttribute("position", positionalBuffer, 2)
    .addIndex([0, 1, 2, 0, 2, 3]);
  // Shader
  const shader = PIXI.Shader.from(vertexShader, fragmentShader, {
    resolution: [0, 0],
    u_rect_size: [0, 0, 0, 0],
    u_time: 0,
  });
  return new PIXI.Mesh(geometry, shader);
}

function tick(state: AppState, delta: number) {
  updateUniform(state, "u_time", state.app.ticker.elapsedMS / 1000.0);
}
