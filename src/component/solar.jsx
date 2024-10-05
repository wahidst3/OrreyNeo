import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const SolarSystem = () => {
  const canvasRef = useRef(null);
  const loadingRef = useRef(null);
  const loadingTextRef = useRef(null);
  const loadingBarRef = useRef(null);
  const infoTextRef = useRef(null);
  const mainRef = useRef(null);
  let count = 0;
  let renderer, scene, camera, controls, sun;
  const planets = [];

  // Function to create the scene
  const initScene = () => {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 70;

    const canvas = canvasRef.current;
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Create sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/sun.jpg') });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Create background
    const backgroundTexture = new THREE.TextureLoader().load('img/stars.jpg');
    const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture, side: THREE.BackSide });
    const backgroundGeometry = new THREE.SphereGeometry(500, 32, 32);
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(background);

    // Create planets with their orbits
    createPlanet(0.4, 'mercury.jpg', 10, 0.01); // Mercury
    createPlanet(0.9, 'venus.jpg', 15, 0.005); // Venus
    createPlanet(1, 'earth.jpg', 20, 0.02); // Earth
    createPlanet(0.5, 'mars.jpg', 25, 0.015); // Mars
    createPlanet(2.5, 'jupiter.jpg', 35, 0.025); // Jupiter
    createPlanet(2, 'saturn.jpg', 45, 0.03, 'saturn_rings.jpg', 2.5, 4, 0xffa500); // Saturn
    createPlanet(1.5, 'uranus.jpg', 55, 0.02, 'uranus_rings.jpg', 2, 3, 0x00ffff); // Uranus
    createPlanet(1.4, 'neptune.jpg', 65, 0.02); // Neptune

    // Start animation
    animate();
  };

  // Function to create planets and their rings
  const createPlanet = (radius, texture, distance, rotationSpeed, ringTexture = null, ringInnerRadius = 0, ringOuterRadius = 0, ringColor = 0xffffff) => {
    const planetGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const planetMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`img/${texture}`) });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    const orbitObject = new THREE.Object3D();
    orbitObject.add(planet);
    orbitObject.position.x = distance;

    // Add the orbiting object to the sun
    sun.add(orbitObject);
    planets.push({ planet, orbitObject, rotationSpeed });

    // Create rings if applicable
    if (ringTexture) {
      const ringGeometry = new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, 64);
      const ringMaterial = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load(`img/${ringTexture}`),
        side: THREE.DoubleSide,
        transparent: true,
        emissive: new THREE.Color(ringColor),
        emissiveIntensity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      planet.add(ring);
    }
  };

  // Animate the scene
  const animate = () => {
    requestAnimationFrame(animate);

    // Rotate sun
    sun.rotation.y += 0.004;

    // Rotate planets and their orbits
    planets.forEach(({ planet, orbitObject, rotationSpeed }) => {
      planet.rotation.y += rotationSpeed; // Planet rotation
      orbitObject.rotation.y += 0.01; // Orbit around the sun
    });

    controls.update();
    renderer.render(scene, camera);
  };

  // Loading overlay removal
  const removeLoadingOverlay = () => {
    const loadingInterval = setInterval(() => {
      count++;
      loadingBarRef.current.style.width = `${count}%`;
      loadingTextRef.current.innerText = `${count}%`;
      if (count >= 100) {
        clearInterval(loadingInterval);
        loadingRef.current.style.display = 'none';
        infoTextRef.current.style.display = 'block';
      }
    }, 30);
  };

  const handleClose = () => {
    mainRef.current.style.display = 'none';
  };

  // Handle resize
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // Initial loading and event listeners
  useEffect(() => {
    initScene();
    removeLoadingOverlay();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      <div id="loading-overlay" ref={loadingRef}>
        <div className="loading-bar" ref={loadingBarRef}></div>
        <div id="loading-progress" ref={loadingTextRef}>0%</div>
        <div className="info-text" ref={infoTextRef} style={{ display: 'none' }}>Loading Complete!</div>
        <button className="close-btn" onClick={handleClose}>Close</button>
      </div>
      <div className="main" ref={mainRef}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default SolarSystem;
