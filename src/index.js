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
const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const material = new THREE.MeshPhysicalMaterial( { color: 0xff0000 } );
const cube = new THREE.Mesh(geometry, material);
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
const maxBackgroundDistance = 1.0;
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
const uResolution = new THREE.Vector2(width, height);
const canvas = renderer.domElement;
let backgroundMovementSpeed = { x: 0.003, y: 0.003 };
let composer = new THREE.EffectComposer(renderer);

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
  obj[pass.name] = false;
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
scene.add(cube);
scene.add(ambientLight);
scene.add(pointLight);
renderer.setSize(width, height, false);
document.body.appendChild(canvas);
document.body.insertBefore(gui.domElement, canvas.nextSibling);

configureEffects();
animate();

function animate(timestamp) {
  requestAnimationFrame(animate);

  scanlinesPass.uniforms["uTime"].value = timestamp;
  colorBleedPass.uniforms["uTime"].value = timestamp;
  jitterPass.uniforms["uTime"].value = timestamp;
  cube.rotation.x += rotateSpeed;
  cube.rotation.y += rotateSpeed;
  const scale = 1.0 + (Math.sin(timestamp / 800) + 1.0) / 2.0;
  cube.scale.x = scale;
  cube.scale.y = scale;
  cube.scale.z = scale;

  if (Math.abs(backgroundSprite.position.x) > maxBackgroundDistance) {
    backgroundMovementSpeed.x = -backgroundMovementSpeed.x;
  }

  if (Math.abs(backgroundSprite.position.y) > maxBackgroundDistance / aspectRatio) {
    backgroundMovementSpeed.y = -backgroundMovementSpeed.y;
  }

  backgroundSprite.position.x += backgroundMovementSpeed.x;
  backgroundSprite.position.y += backgroundMovementSpeed.y;

  composer.render(timestamp);
}

function configureEffects() {
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderPass);
  passes.filter((pass) => shaderPassConfig[pass.name]).forEach((pass) => composer.addPass(pass));
  composer.addPass(copyPass);
}