// scanlines - done
// color bleed - done
// static
// tracking bar
// jitter
// interlacing

const width = 320;
const height = 240;
const aspectRatio = width / height;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const geometry = new THREE.BoxGeometry(3, 3, 3);
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh(geometry, material);
const renderPass = new THREE.RenderPass(scene, camera);
const scanlinesPass = new THREE.ShaderPass(ScanlinesShader);
const colorBleedPass = new THREE.ShaderPass(ColorBleedShader);
const copyPass = new THREE.ShaderPass(THREE.CopyShader);
const horizBlurPass = new THREE.ShaderPass(THREE.HorizontalBlurShader);
const vertBlurPass = new THREE.ShaderPass(THREE.VerticalBlurShader);
const backgroundTexture = new THREE.TextureLoader().load("./images/croissant.png");
const backgroundMaterial = new THREE.SpriteMaterial({ map: backgroundTexture, color: 0xffffff });
const backgroundSprite = new THREE.Sprite(backgroundMaterial);
const maxBackgroundDistance = 1.0;
const gui = new dat.GUI();
const passes = [scanlinesPass, colorBleedPass, horizBlurPass, vertBlurPass];
const rotateSpeed = 0.01;
let backgroundMovementSpeed = { x: 0.003, y: 0.003 };
let composer = new THREE.EffectComposer(renderer);

scanlinesPass.name = "scanlines";
scanlinesPass.activated = false;
colorBleedPass.name = "colorBleed";
colorBleedPass.activated = false;
horizBlurPass.name = "horizontalBlur";
horizBlurPass.activated = false;
vertBlurPass.name = "verticalBlur";
vertBlurPass.activated = false;

const shaderPassConfig = passes.reduce((obj, pass) => {
  obj[pass.name] = true;
  return obj;
}, {});

passes.forEach((pass) => gui.add(shaderPassConfig, pass.name));
backgroundSprite.scale.set(26, 13, 1);
backgroundSprite.position.z = -2;
camera.position.z = 5;
copyPass.renderToScreen = true;
scene.add(backgroundSprite);
scene.add(cube);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

animate();

function animate(timestamp) {
  requestAnimationFrame(animate);
  configureEffects();

  scanlinesPass.uniforms["uTime"].value = timestamp;
  cube.rotation.x += rotateSpeed;
  cube.rotation.y += rotateSpeed;

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
  let somethingChanged = false;

  passes
    .filter((pass) => pass.activated != shaderPassConfig[pass.name])
    .forEach((pass) => {
      pass.activated = shaderPassConfig[pass.name];
      somethingChanged = true;
    });

  if (somethingChanged) {
    console.log("Changed a pass config...")
    composer.reset();
    composer = new THREE.EffectComposer(renderer);

    composer.addPass(renderPass);
    passes.filter((pass) => pass.activated).forEach((pass) => composer.addPass(pass));
    composer.addPass(horizBlurPass);
    composer.addPass(vertBlurPass);
    composer.addPass(copyPass);
  }
}