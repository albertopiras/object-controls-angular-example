import { Component, OnInit } from '@angular/core';

import Dat from 'dat.gui';
import init from 'three-dat.gui'; // Import initialization method

import * as THREE from 'three';
import {ObjectControls} from 'threeJS-object-controls';

var gui, guiElements, param = { color: '0xffffff' };


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  ngOnInit() {
    init(Dat); // Init three-dat.gui with Dat
    this.init();
    this.animate();
    this.buildGui();
  }
  
  title = 'example';

  renderer: any = new THREE.WebGLRenderer();

  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
  scene = new THREE.Scene();

  matFloor = new THREE.MeshPhongMaterial({ dithering: true });
  matBox = new THREE.MeshPhongMaterial({ color: 0xebe20d, dithering: true });

  geoFloor = new THREE.BoxGeometry(1000, 1, 1000);
  geoBox = new THREE.BoxGeometry(2, 2, 2);

  mshFloor = new THREE.Mesh(this.geoFloor, this.matFloor);
  mshBox = new THREE.Mesh(this.geoBox, this.matBox);
  mshBox2 = new THREE.Mesh(this.geoBox, this.matBox);

  ambient = new THREE.AmbientLight(0xffffff, 0.1);

  spotLight = new THREE.SpotLight(0xffffff, 1);
  lightHelper : THREE.SpotLightHelper;

  controls: any;

  init() {

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;

    this.camera.position.set(0, 5, 50);
    this.camera.position.z = 30;

    this.spotLight.position.set(15, 40, 35);
    this.spotLight.castShadow = true;
    this.spotLight.angle = 0.18;
    this.spotLight.penumbra = 0;
    this.spotLight.decay = 2;
    this.spotLight.distance = 200;
    this.spotLight.intensity = 2;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadow.camera.near = 1;
    this.spotLight.shadow.camera.far = 200;

    this.lightHelper = new THREE.SpotLightHelper(this.spotLight);

    this.matFloor.color.set(0x808080);

    this.mshFloor.receiveShadow = true;
    this.mshFloor.position.set(0, - 0.05, 0);

    this.mshBox.castShadow = true;
    this.mshBox2.castShadow = true;
    this.mshBox.position.set(-3, 2.3, 3);
    this.mshBox2.position.set(3, 2.3, 3);

    this.camera.lookAt(this.mshBox.position);

    this.scene.add(this.camera);
    this.scene.add(this.mshFloor);
    this.scene.add(this.mshBox);
    this.scene.add(this.mshBox2);
    this.scene.add(this.ambient);
    this.scene.add(this.spotLight);
    this.scene.add(this.lightHelper);

    document.body.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    /** instantiate ObjectControls**/
    this.controls = new ObjectControls(this.camera, this.renderer.domElement, this.mshBox);
    this.controls.setDistance(8, 200); // set min - max distance for zoom
    this.controls.setZoomSpeed(0.5); // set zoom speed
    this.controls.enableVerticalRotation();
    this.controls.setMaxVerticalRotationAngle(Math.PI / 4, Math.PI / 4);
    this.controls.setRotationSpeed(0.05);

    window.addEventListener('resize', this.onResize.bind(this), false);

  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = (window.innerWidth / window.innerHeight);
    this.camera.updateProjectionMatrix();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  render() {
    this.lightHelper.update(); // required
    this.renderer.render(this.scene, this.camera);
  }

  clearGui() {
    if (gui) gui.destroy();
    gui = new Dat.GUI();
    gui.open();
  }

  buildGui() {

    this.clearGui();

    this.addGui('light color', this.spotLight.color.getHex(), (val) => {

      this.spotLight.color.setHex(val);

    }, true);

    this.addGui('intensity', this.spotLight.intensity, (val) => {

      this.spotLight.intensity = val;

    }, false, 0, 2);

    this.addGui('distance', this.spotLight.distance, (val) => {

      this.spotLight.distance = val;

    }, false, 0, 200);

    this.addGui('angle', this.spotLight.angle, (val) => {

      this.spotLight.angle = val;

    }, false, 0, Math.PI / 3);

    this.addGui('penumbra', this.spotLight.penumbra, (val) => {

      this.spotLight.penumbra = val;

    }, false, 0, 1);

    this.addGui('decay', this.spotLight.decay, (val) => {

      this.spotLight.decay = val;

    }, false, 1, 2);

    var changeMeshConfig = {
      useMesh1: () => {
        this.controls.setObjectToMove(this.mshBox);
      },
      useMesh2: () => {
        this.controls.setObjectToMove(this.mshBox2);
      }
    };
    gui.add(changeMeshConfig, 'useMesh1');

    gui.add(changeMeshConfig, 'useMesh2');

  }

  addGui(name, value, callback, isColor, min = 0, max = 0) {

    var node;
    param[name] = value;

    if (isColor) {

      node = gui.addColor(param, name).onChange(() => {

        callback(param[name]);

      });

    } else if (typeof value == 'object') {

      node = gui.add(param, name, value).onChange(() => {

        callback(param[name]);

      });

    } else {

      node = gui.add(param, name, min, max).onChange(() => {
        callback(param[name]);
      });

    }
    return node;
  }

}
