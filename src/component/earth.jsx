import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Starfield from './starfield';
import getStarfield from './starfield';
const ThreeDBox = () => {
  const mountRef = useRef(null);

  useEffect(() => {
  
    // Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
    // Set size and append renderer to the DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // OrbitControls for camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth controls

    const earthGroup=new THREE.Group()
    earthGroup.rotation.z=-23.4*Math.PI/180
    scene.add(earthGroup)
    
    // Starfield
    const stars=getStarfield({numStars:20000})
    scene.add(stars)
    // Starfield
  // Create Directional Light (Sunlight)
const sunlight = new THREE.DirectionalLight(0xffffff, 1); // White light with intensity of 1
sunlight.position.set(5, 10, 7); // Set the position of the light
scene.add(sunlight);
    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/assets/2k_earth_daymap.jpg'); // Corrected path
    // Create Earth geometry and material
    const geometry = new THREE.IcosahedronGeometry(1, 12);
    const material = new THREE.MeshStandardMaterial({ map: earthTexture,

     });
    const earthMesh = new THREE.Mesh(geometry, material);

    // Add earthMesh to the scene
    earthGroup.add(earthMesh);

    // Add lights
    // const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    // scene.add(ambientLight);

    // const pointLight = new THREE.PointLight(0xffffff, 1);
    // pointLight.position.set(5, 5, 5);
    // scene.add(pointLight);

    // Position the camera
    camera.position.z = 5;

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls on each frame

      // Rotate the earthMesh for a dynamic effect
      earthMesh.rotation.x += 0.002;
      earthMesh.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    // Start animation
    animate();

    // Cleanup function
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default ThreeDBox;
