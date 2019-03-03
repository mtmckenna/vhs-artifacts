
// scanlines - done
// color bleed - done
// static
// tracking bar
// jitter - done
// interlacing - done
// vignette - done
// busted colors
// rando noise
// heart model
// cables image
// beat - doneish

const width = 320;
const height = 240;
const aspectRatio = width / height;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const material = new THREE.MeshPhysicalMaterial( { color: 0xff0000 } );
const ambientLight = new THREE.AmbientLight(0xffffff);
const pointLight = new THREE.PointLight(0xffffff);
const renderPass = new THREE.RenderPass(scene, camera);
const scanlinesPass = new THREE.ShaderPass(ScanlinesShader);
const colorBleedPass = new THREE.ShaderPass(ColorBleedShader);
const jitterPass = new THREE.ShaderPass(JitterShader);
const interlacePass = new THREE.ShaderPass(InterlaceShader);
const vignettePass = new THREE.ShaderPass(VignetteShader);
const horizBlurPass = new THREE.ShaderPass(THREE.HorizontalBlurShader);
const vertBlurPass = new THREE.ShaderPass(THREE.VerticalBlurShader);
const copyPass = new THREE.ShaderPass(THREE.CopyShader);
const backgroundTexture = new THREE.TextureLoader().load("./images/croissant.png");
const backgroundMaterial = new THREE.SpriteMaterial({ map: backgroundTexture, color: 0xffffff });
const backgroundSprite = new THREE.Sprite(backgroundMaterial);
const uResolution = new THREE.Vector2(width, height);
const canvasWrapper = document.body.getElementsByClassName("canvas-wrapper")[0];
const maxBackgroundDistance = 1.0;
const heartScale = 25;
const gui = new dat.GUI({ autoPlace: false, width: "100%" });
const passes = [
  scanlinesPass,
  colorBleedPass,
  jitterPass,
  interlacePass,
  vignettePass,
  horizBlurPass,
  vertBlurPass
];
const rotateSpeed = 0.01;
const canvas = renderer.domElement;
let backgroundMovementSpeed = { x: 0.003, y: 0.003 };
let composer = new THREE.EffectComposer(renderer);
let model = null;

new THREE.ObjectLoader().load("./models/heart.json", (object) => {
  const geometry = object.children[0].geometry;
  model = new THREE.Mesh(geometry, material);
  scene.add(model);
});

scanlinesPass.name = "scanlines";
colorBleedPass.name = "colorBleed";
jitterPass.name = "jitter";
interlacePass.name = "interlace";
vignettePass.name = "vignette";
horizBlurPass.name = "horizontalBlur";
vertBlurPass.name = "verticalBlur";

scanlinesPass.uniforms["uResolution"].value = uResolution;
vignettePass.uniforms["uResolution"].value = uResolution;

const shaderPassConfig = passes.reduce((obj, pass) => {
  obj[pass.name] = true;
  return obj;
}, {});

passes.forEach((pass) => {
  const controller = gui.add(shaderPassConfig, pass.name);
  controller.onFinishChange(() => configureEffects());
});

backgroundSprite.scale.set(26, 13, 1);
backgroundSprite.position.z = -2;
camera.position.z = 5;
pointLight.position.x = -1;
pointLight.position.y = 1;
pointLight.position.z = 1;
copyPass.renderToScreen = true;
scene.add(backgroundSprite);
scene.add(ambientLight);
scene.add(pointLight);
renderer.setSize(width, height, false);
canvasWrapper.appendChild(canvas);
document.body.getElementsByClassName("gui-wrapper")[0].append(gui.domElement);

configureEffects();
resize();
animate();

function animate(timestamp) {
  requestAnimationFrame(animate);

  scanlinesPass.uniforms["uTime"].value = timestamp;
  colorBleedPass.uniforms["uTime"].value = timestamp;
  jitterPass.uniforms["uTime"].value = timestamp;

  if (Math.abs(backgroundSprite.position.x) > maxBackgroundDistance) {
    backgroundMovementSpeed.x = -backgroundMovementSpeed.x;
  }

  if (Math.abs(backgroundSprite.position.y) > maxBackgroundDistance / aspectRatio) {
    backgroundMovementSpeed.y = -backgroundMovementSpeed.y;
  }

  backgroundSprite.position.x += backgroundMovementSpeed.x;
  backgroundSprite.position.y += backgroundMovementSpeed.y;

  composer.render(timestamp);

  if (!model) return;
  model.rotation.y += rotateSpeed;
  const scale = heartScale + (Math.sin(timestamp / 200) + 1.0);
  model.scale.x = scale;
  model.scale.y = -scale;
  model.scale.z = scale;
}

function configureEffects() {
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderPass);
  passes.filter((pass) => shaderPassConfig[pass.name]).forEach((pass) => composer.addPass(pass));
  composer.addPass(copyPass);
}

function resize() {
  const canvasWrapperWidth = canvasWrapper.clientWidth;
  const canvasWrapperHeight = canvasWrapper.clientHeight;
  if (canvasWrapperWidth > canvasWrapperHeight) {
    canvas.style.height = `${canvasWrapperHeight}px`;
    canvas.style.width = null;
  } else {
    canvas.style.width = `${canvasWrapperWidth}px`;;
    canvas.style.height = null;
  }
}

window.addEventListener("resize", function () {
  resize()
});