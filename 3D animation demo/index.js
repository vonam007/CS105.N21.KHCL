import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { TransformControls } from './js/TransformControls.js';
import { TeapotBufferGeometry } from './js/TeapotBufferGeometry.js';

var camera, scene, renderer, control, orbit;
var mesh, texture;
var raycaster, light, PointLightHelper, meshplan;
var type_material = 3;
var material = new THREE.MeshBasicMaterial({ color: 0xf4efff });
material.needsUpdate = true;
var mouse = new THREE.Vector2();


// Create Geometry
var BoxGeometry = new THREE.BoxGeometry(30, 30, 30, 40, 40, 40);
var SphereGeometry = new THREE.SphereGeometry(20, 20, 20);
var ConeGeometry = new THREE.ConeGeometry(18, 30, 32, 20);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 30, 5);

init();
render();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x343a40);

    // Camera
    var camera_x = 1;
    var camera_y = 50;
    var camera_z = 100;
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(camera_x, camera_y, camera_z);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Grid
    var size = 300;
    var divisions = 50;
    var gridHelper = new THREE.GridHelper(size, divisions, 0x888888);
    scene.add(gridHelper);

    // Renderer
    raycaster = new THREE.Raycaster();
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("rendering").addEventListener('mousedown', onMouseDown, false);
    document.getElementById("rendering").appendChild(renderer.domElement);
    window.addEventListener('resize', () => {
        var width = window.innerWidth
        var height = window.innerHeight
        renderer.setSize(width, height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        render()
    })
    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', render);
    control = new TransformControls(camera, renderer.domElement);
    console.log(control)
    control.addEventListener('change', render);
    control.addEventListener('dragging-changed', function(event) {
        orbit.enabled = !event.value;
    });
}

function render() {
    renderer.render(scene, camera);
}

// 1. Basic 3D model 

function RenderGeo(id) {
    mesh = scene.getObjectByName("mesh1");
    scene.remove(mesh);

    switch (id) {
        case 1:
            mesh = new THREE.Mesh(BoxGeometry, material);
            break;
        case 2:
            mesh = new THREE.Mesh(SphereGeometry, material);
            break;
        case 3:
            mesh = new THREE.Mesh(ConeGeometry, material);
            break;
        case 4:
            mesh = new THREE.Mesh(CylinderGeometry, material);
            break;
    }
    mesh.name = "mesh1";
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    control_transform(mesh);
    render();
}
window.RenderGeo = RenderGeo;

// 2. near, far limited of camera
function setFOV(value) {
    camera.fov = Number(value);
    camera.updateProjectionMatrix();
    render();
}
window.setFOV = setFOV;

function setFar(value) {
    camera.far = Number(value);
    camera.updateProjectionMatrix();
    render();
}
window.setFar = setFar;

function setNear(value) {
    camera.near = Number(value);
    camera.updateProjectionMatrix();
    render();
}
window.setNear = setNear;

// 3. Affine
function Translate() {
    control.setMode("translate");
}
window.Translate = Translate;

function Rotate() {
    control.setMode("rotate");
}
window.Rotate = Rotate;

function Scale() {
    control.setMode("scale");
}
window.Scale = Scale;

function control_transform(mesh) {
    control.attach(mesh);
    scene.add(control);
    console.log(control);
    window.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            case 84: // T
                Translate();
                break;
            case 82: // R
                Rotate();
                break;
            case 83: // S
                Scale();
                break;
            case 88: // X
                control.showX = !control.showX;
                break;
            case 89: // Y
                control.showY = !control.showY;
                break;
            case 90: // Z
                control.showZ = !control.showZ;
                break;
        }
    });
}

// 4.Light
function SetPointLight() {
    light = scene.getObjectByName("pl1");

    if (!light) {
        {
            const planeSize = 400;
            const loader = new THREE.TextureLoader();
            const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
            const planeMat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, });
            meshplan = new THREE.Mesh(planeGeo, planeMat);
            meshplan.receiveShadow = true;
            meshplan.rotation.x = Math.PI * -.5;
            meshplan.position.y += 0.5;
            scene.add(meshplan);
        }
        const color = '#FFFFFF';
        const intensity = 2;
        light = new THREE.PointLight(color, intensity);
        light.castShadow = true;
        light.position.set(0, 70, 0);
        light.name = "pl1";
        scene.add(light);
        control_transform(light);
        if (type_material == 3 || type_material == 4) {
            SetMaterial(type_material);
        }
        PointLightHelper = new THREE.PointLightHelper(light);
        PointLightHelper.name = "plh1";
        scene.add(PointLightHelper);
        render();
    }
}
window.SetPointLight = SetPointLight;

function onMouseDown(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // find intersections
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);
    let check_obj = 0;
    if (intersects.length > 0) {
        var obj;
        for (obj in intersects) {
            if (intersects[obj].object.name == "mesh1") {
                check_obj = 1;
                control_transform(intersects[obj].object);
                break;
            }
            if (intersects[obj].object.type == "PointLightHelper") {
                check_obj = 1;
                control_transform(light);
                break;
            }
        }
    }
    if (check_obj == 0 && control.dragging == 0) control.detach();
    render();
}

// Animation
var mesh = new THREE.Mesh();
var id_animation1, id_animation2, id_animation3, id_animation4;

function Animation1() {
    cancelAnimationFrame(id_animation1);
    mesh.rotation.x += 0.01;
    render();
    id_animation1 = requestAnimationFrame(Animation1);
}
window.Animation1 = Animation1;

function Animation2() {
    cancelAnimationFrame(id_animation2);
    mesh.rotation.y += 0.01;
    render();
    id_animation2 = requestAnimationFrame(Animation2);
}
window.Animation2 = Animation2;

const position_x = mesh.position.x;
const position_y = mesh.position.y;
var kt = 0;

function Animation3() {
    cancelAnimationFrame(id_animation4);
    cancelAnimationFrame(id_animation3);
    var positionx = mesh.position.x;
    var positiony = mesh.position.y;
    if (positiony < position_y + 30 && kt == 0) {
        mesh.position.y += 0.3;
    }
    if (positiony > position_y + 30 && positionx < position_x + 30) {
        mesh.position.x += 0.3;
    }
    if (positiony > position_y + 30 && positionx > position_x + 30) kt += 1;
    if (kt > 1 && positiony > position_y) {
        mesh.position.y -= 0.3;
    }
    if (kt > 1 && positiony < position_y && positionx > position_x) {
        mesh.position.x -= 0.3;
    }
    if (positiony < position_y && positionx < position_x) kt = 0;
    mesh.rotation.y += 0.01;
    render();
    id_animation3 = requestAnimationFrame(Animation3);
}
window.Animation3 = Animation3;

var kt2 = 0;

function Animation4() {
    cancelAnimationFrame(id_animation3);
    cancelAnimationFrame(id_animation4);
    var positiony = mesh.position.y;
    if (positiony < position_y + 30 && kt2 == 0) {
        mesh.position.y += 0.3;
        mesh.rotation.y += 0.05;
    }
    if (positiony > position_y + 30) kt2 += 1;
    if (kt2 > 1 && positiony > position_y) {
        mesh.position.y -= 0.3;
        mesh.rotation.y += 0.05;
    }
    if (positiony < position_y) kt2 = 0;
    render();
    id_animation4 = requestAnimationFrame(Animation4);
}
window.Animation4 = Animation4;

function RemoveAnimation1() {
    cancelAnimationFrame(id_animation1);
}
window.RemoveAnimation1 = RemoveAnimation1;

function RemoveAnimation2() {
    cancelAnimationFrame(id_animation2);
}
window.RemoveAnimation2 = RemoveAnimation2;

function RemoveAnimation3() {
    cancelAnimationFrame(id_animation3);
}
window.RemoveAnimation3 = RemoveAnimation3;

function RemoveAnimation4() {
    cancelAnimationFrame(id_animation4);
}
window.RemoveAnimation4 = RemoveAnimation4;

function RemoveAllAnimation() {
    cancelAnimationFrame(id_animation1);
    cancelAnimationFrame(id_animation2);
    cancelAnimationFrame(id_animation3);
    cancelAnimationFrame(id_animation4);
    mesh.rotation.set(0, 0, 0);
    render();
}
window.RemoveAllAnimation = RemoveAllAnimation;