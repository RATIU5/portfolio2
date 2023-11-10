// Imports
import * as PIXI from "pixi.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

const DEBUG = false;

type AppState = {
  mouse: {
    x: number;
    y: number;
  };
  uniforms: {
    u_resolution: [number, number];
    u_time: number;
  };
  app: PIXI.Application<HTMLCanvasElement> | null;
  mesh: PIXI.Mesh<PIXI.Shader> | null;
};

// Application state
const appState: AppState = {
  mouse: { x: 0, y: 0 },
  uniforms: {
    u_resolution: [0, 0],
    u_time: 0,
  },
  app: null,
  mesh: null,
};

// Initialize the application
function init() {
  appState.app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    autoDensity: true,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
  });
  document.body.appendChild(appState.app.view);
  applyCanvasStyle(appState.app.renderer.view);

  window.addEventListener("resize", onResize);
  window.addEventListener("mousemove", onMouseMove);

  setupMesh();
  onResize();

  appState.app.ticker.add(onTick);
}

// Apply style to the canvas
function applyCanvasStyle(canvas: HTMLCanvasElement) {
  canvas.style.position = "absolute";
  canvas.style.display = "block";
  canvas.style.zIndex = "-1";
}

// Handle window resize events
function onResize() {
  if (!appState.app) {
    return console.error("app not initialized");
  }
  if (!appState.mesh) {
    return console.error("mesh not initialized");
  }
  appState.app.renderer.resize(window.innerWidth, window.innerHeight);
  appState.mesh.shader.uniforms.resolution = [
    appState.app.renderer.width,
    appState.app.renderer.height,
  ];
  updateGeometry();
}

// Handle mouse move events
function onMouseMove(e: MouseEvent) {
  if (!appState.app) {
    return console.error("app not initialized");
  }

  const rect = appState.app.view.getBoundingClientRect();
  appState.mouse.x =
    (e.clientX - rect.left) * (appState.app.view.width / rect.width);
  appState.mouse.y =
    (window.innerHeight - (e.clientY - rect.top)) *
    (appState.app.view.height / rect.height);
}

// Update the geometry on resize
function updateGeometry() {
  if (!appState.app) {
    return console.error("app not initialized");
  }
  if (!appState.mesh) {
    return console.error("mesh not initialized");
  }

  const positionBuffer = new Float32Array([
    0,
    0,
    appState.app.view.width,
    0,
    appState.app.view.width,
    appState.app.view.height,
    0,
    appState.app.view.height,
  ]);
  appState.mesh.geometry.buffers[0].update(positionBuffer);
}

// Setup PIXI geometry
function setupMesh() {
  if (!appState.app) {
    return console.error("app not initialized");
  }

  // Geometry
  let positionalBuffer = new Float32Array([
    0,
    0,
    appState.app.view.width,
    0,
    appState.app.view.width,
    appState.app.view.height,
    0,
    appState.app.view.height,
  ]);
  const geometry = new PIXI.Geometry()
    .addAttribute("position", positionalBuffer, 2)
    .addIndex([0, 1, 2, 0, 2, 3]);

  // Shader
  appState.uniforms.u_resolution = [
    appState.app.renderer.width,
    appState.app.renderer.height,
  ];
  const shader = PIXI.Shader.from(
    vertexShader,
    fragmentShader,
    appState.uniforms,
  );

  // Mesh
  appState.mesh = new PIXI.Mesh(geometry, shader);
  appState.app.stage.addChild(appState.mesh);
}

// Update shader uniforms
function updateUniforms() {
  if (!appState.app) {
    return console.error("app not initialized");
  }
  if (!appState.mesh) {
    return console.error("appState.mesh is null");
  }

  appState.uniforms.u_time += appState.app.ticker.elapsedMS / 1000.0;
  appState.mesh.shader.uniforms.uMouse = [appState.mouse.x, appState.mouse.y];
}

function onTick(delta: number) {
  if (!appState.app) {
    return console.error("app not initialized");
  }
  if (DEBUG && Math.floor(appState.uniforms.u_time * 100) % 1000 === 0) {
    console.log(appState);
  }

  updateUniforms();
}

init();
