import './style/main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


// How to shrink file -- https://stackoverflow.com/questions/56271427/can-i-make-the-glb-file-smaller
// Building skeleton -- https://www.youtube.com/watch?v=eEqB-eKcv7k

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()
var loader = new GLTFLoader(); 
loader.load('mesh/testskeleton.glb', function (gltf) {

// Add light
const color = 0xFFFFFF;
const intensity = 0.75;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);

const hemilight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 1.2 ); 
scene.add(hemilight);

const hemilight2 = new THREE.HemisphereLight( 0xFFFFFF, 0xFFFFFF, 0.75 ); 
scene.add(hemilight2);



// Load Mesh (Children[1] is the mesh; other arrays are the bones)
let bone = gltf.scene.children.find((child) => child.name == "Armature");
bone.children[1].material.skinning = true

// bone.children[1].material = buildTwistMaterial( 10, bone.children[1].material)

// //BONE 3 -- The Neck
// Z = Tilt head  (positive is objects right)
// Y = Twist Head (positive is objects right)
// Nod head (positive is tilt forwards)
// Initialize pose
bone.children[0].children[0].children[0].rotation.y = -0.4

// Distance is the number you will play around with the most
// The distance of my object to the view, update this so that it also depends on window size
var distance = 200; 



// X,Y location of the mouse
var X = 0 
var Y = 0

// Element window size (later add an equation to update distance based on window size, 
// browser size, and distance of my head to the camera)
var w = window.innerWidth
var h = window.innerHeight

// Where element is located on the full browser window
var rect = canvas.getBoundingClientRect();

// Find the center point of the element in the browser coordinates
// This is the lcoation of my head in the browser
var CenterY = (rect.top + rect.bottom) / 2
var CenterX = (rect.left + rect.right) / 2


var mousedownEvent = function(evt) {

    // Update X Y mouse coordinates
    X = evt.clientX
    Y = evt.clientY

    // How far is my face from the mouse?
    var distanceX = X - CenterX;
    var distanceY = Y - CenterY;

    // Move head using arctan
    bone.children[0].children[0].children[0].rotation.x = 0.8 *(-.4 -Math.atan(distanceY/distance) );
    bone.children[0].children[0].children[0].rotation.y = 0.8 * ( 0 + Math.atan(distanceX/distance) );
    
    bone.children[0].children[0].rotation.x = 0.2 * (-.4 -Math.atan(distanceY/distance) );
    bone.children[0].children[0].rotation.y =0.2 * ( 0 + Math.atan(distanceX/distance) ) ;


  }
  
  if (window.PointerEvent) {
    window.addEventListener('mousemove', mousedownEvent);
  } else {
    window.addEventListener('mousemove', mousedownEvent);
  }


   bone.position.x = 1
   bone.position.y = -4
   bone.position.z = -4
   bone.rotation.x = .2

   scene.add(bone)
 })


//  loader.load('mesh/flower.glb', function (gltf) {
//   const geometry = gltf.scene.children[0].geometry
//   geometry.computeVertexNormals(false)

//   let mesh = new THREE.Mesh(geometry, buildTwistMaterial(100))
//   mesh.position.x = 0
//   mesh.position.y = 0
//   scene.add(mesh)
// })

// function buildTwistMaterial(amount) {
//   const material = new THREE.MeshNormalMaterial()
//   material.onBeforeCompile = function (shader) {
//     shader.uniforms.time = { value: 0 }

//     shader.vertexShader = 'uniform float time;\n' + shader.vertexShader
//     shader.vertexShader = shader.vertexShader.replace(
//       '#include <begin_vertex>',
//       [
//         `float theta = sin( time + position.y ) / ${amount.toFixed(1)};`,
//         'float c = cos( theta );',
//         'float s = sin( theta );',
//         'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
//         'vec3 transformed = vec3( position ) * m;',
//         'vNormal = vNormal * m;',
//       ].join('\n')
//     )

//     material.userData.shader = shader
//   }

//   // Make sure WebGLRenderer doesnt reuse a single program

//   material.customProgramCacheKey = function () {
//     return amount
//   }

//   return material
// }


const sizes = {
  width: window.innerWidth,
  height:window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(
  20,
  sizes.width / sizes.height,
  0.001,
  1000
)
camera.position.x = -1
camera.position.y = 15
camera.position.z = -25
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.autoRotate = false
controls.enablePan = false
controls.enableZoom = false

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



const clock = new THREE.Clock()
const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  scene.traverse(function (child) {
    if (child.isMesh) {
      const shader = child.material.userData.shader

      if (shader) {
        shader.uniforms.time.value = performance.now() / 1000
      }
    }
  })

  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()