

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import getStarfield from "./component/starfield";

// Constants for Earth's orbital calculations
const earth_a = 1; // Semi-major axis of the Earth's orbit (in AU)
const earth_e = 0.0167; // Eccentricity of Earth's orbit
const earth_T = 36000000; // Period of Earth's orbit in seconds
const earth_n = (2 * Math.PI) / earth_T;

// Constants for Comet's orbital calculations
const comet_a = 3.106380161; // Semi-major axis of the comet's orbit (in AU)
const comet_e = 0.682526943; // Eccentricity of the comet's orbit
const comet_T = 5.48 * 365.25 * 24 * 3600; // Period of comet's orbit in seconds (convert from years to seconds)
const comet_n = (2 * Math.PI) / comet_T; // Mean motion for the comet
const cometInclination = 4.894555854; // Inclination of the comet in degrees
const cometNode = 295.9854497; // Longitude of ascending node in degrees
const cometArgumentOfPerihelion = 0.626837835; // Argument of perihelion in degrees

// Orbital elements for P/2008 S1 (Catalina-McNaught)
const catalina_a = (1.190641555 + 5.95) / 2; // Semi-major axis of the orbit (average of perihelion and aphelion distance in AU)
const catalina_e = 0.6663127807; // Eccentricity of the orbit
const catalina_T = 6.74 * 365.25 * 24 * 3600; // Period of the orbit in seconds (convert from years to seconds)
const catalina_n = (2 * Math.PI) / catalina_T; // Mean motion for the object
const catalinaInclination = 15.1007464; // Inclination in degrees
const catalinaNode = 111.3920029; // Longitude of ascending node in degrees
const catalinaArgumentOfPerihelion = 203.6490232; // Argument of perihelion in degrees
//siding
const sidingSpring_a = (1.227689026 + 4.87) / 2; // Semi-major axis of the orbit (average of perihelion and aphelion distance in AU)
const sidingSpring_e = 0.5972436348; // Eccentricity of the orbit
const sidingSpring_T = 5.32 * 365.25 * 24 * 3600; // Period of the orbit in seconds (convert from years to seconds)
const sidingSpring_n = (2 * Math.PI) / sidingSpring_T; // Mean motion for the object
const sidingSpringInclination = 27.84477766; // Inclination in degrees
const sidingSpringNode = 31.25192352; // Longitude of ascending node in degrees
const sidingSpringArgumentOfPerihelion = 356.3636966; // Argument of perihelion in degrees


//For brorsan
const brorsen_a = (0.589847 + 5.61) / 2; // Semi-major axis in AU
const brorsen_e = 0.809796; // Eccentricity of the orbit
const brorsen_T = 5.46 * 365.25 * 24 * 3600; // Period in seconds
const brorsen_n = (2 * Math.PI) / brorsen_T; // Mean motion
const brorsenInclination = 29.3821; // Inclination in degrees
const brorsenNode = 102.9676; // Longitude of ascending node in degrees
const brorsenArgumentOfPerihelion = 14.9468; // Argument of perihelion in degrees

// For 8P/tutle
const tutle_a = 1.027116587 / (1 - 0.819799747); // Semi-major axis in AU
const tutle_e = 0.819799747; // Eccentricity of the orbit
const tutle_T = 13.61 * 365.25 * 24 * 3600; // Period in seconds
const tutle_n = (2 * Math.PI) / tutle_T; // Mean motion
const tutleInclination = 54.98318484; // Inclination in degrees
const tutleNode = 270.341652; // Longitude of ascending node in degrees
const tutleArgumentOfPerihelion = 207.509246; // Argument of perihelion in degrees
//new

// Function to convert degrees to radians
const degreesToRadians = (degrees) => degrees * (Math.PI / 180);

// Updated propagate function to calculate the position based on orbital elements
const propagate = (clock, a, e, n, i_deg, w_deg, node_deg) => {
  const M = n * clock; // Mean anomaly
  const E = M + e * Math.sin(M) * (1 + e * Math.cos(M)); // Eccentric anomaly (approximation)
  const cose = Math.cos(E); // Cosine of eccentric anomaly
  const r = a * (1 - e * cose); // Radius based on eccentricity and angle

  // Position in orbital plane
  const x_orbit = r * (cose - e);
  const y_orbit = r * (Math.sqrt(1 - e ** 2) * Math.sin(E));

  // Orbital elements (convert to radians)
  const i = degreesToRadians(i_deg); // Inclination
  const w = degreesToRadians(w_deg); // Argument of perihelion
  const node = degreesToRadians(node_deg); // Longitude of ascending node

  // Apply rotation based on the orbital elements
  let x = x_orbit * Math.cos(w) - y_orbit * Math.sin(w);
  let y = x_orbit * Math.sin(w) + y_orbit * Math.cos(w);
  let z = 0;

  // Rotate for inclination (around x-axis)
  const x1 = x;
  const z1 = z * Math.cos(i) - y * Math.sin(i);
  y = z * Math.sin(i) + y * Math.cos(i);
  x = x1;
  z = z1;

  // Rotate for longitude of ascending node (around z-axis)
  const x2 = x * Math.cos(node) - y * Math.sin(node);
  y = x * Math.sin(node) + y * Math.cos(node);
  x = x2;

  return new THREE.Vector3(x, y, z); // Return the new position in 3D space
};

const ThreeDBox = () => {
  const [isZoomed, setIsZoomed] = useState(false);
  const mountRef = useRef(null);
  const clock = useRef(0); // Reference for the clock
  const cometClock = useRef(0); // Reference for the comet's clock
  const brorsenClock = useRef(0); // Reference for the comet's clock
  const catalinaClock = useRef(0); // Reference for P/2008 S1 (Catalina-McNaught)'s clock
  const tutleClock = useRef(0); // Reference for P/2008 S1 (Catalina-McNaught)'s clock
  const levyClock = useRef(0);
  const mcnaughtRussellClock = useRef(0);
  const gibbsClock = useRef(0);
  const ponsGambartClock = useRef(0);
  const blanpainClock = useRef(0);

  useEffect(() => {
    // Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);

    // Set size and append renderer to the DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // OrbitControls for camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth controls

    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
    scene.add(earthGroup);

    // Starfield
    const stars = getStarfield({ numStars: 20000 });
    scene.add(stars);

    // Create Directional Light (Sunlight)
    // const sunlight = new THREE.DirectionalLight(0xffffff, 1);
    // sunlight.position.set(5, 10, 7);
    // scene.add(sunlight);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load("/assets/earth.jpg");
    const geometry = new THREE.IcosahedronGeometry(1, 12);
    const material = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earthMesh = new THREE.Mesh(geometry, material);
    earthMesh.scale.set(0.5, 0.5, 0.5); // Scale down to 50% of the original size

    earthGroup.add(earthMesh);

    // Zoom functionality when Earth is clicked
    const zoomOnEarth = () => {
      if (!isZoomed) {
        // Zoom In
        const targetPosition = earthMesh.position.clone();
        const zoomFactor = 0.7; // Adjust how much you want to zoom in
        const newPosition = camera.position.clone().lerp(targetPosition, zoomFactor);
        
        camera.position.copy(newPosition);
        setIsZoomed(!isZoomed)
        console.log(isZoomed)  // Move the camera to the new position
      // Set click to 1 to prepare for zooming out next time
      } else if (isZoomed) {
        // Zoom Out
        const targetPosition = earthMesh.position.clone();
        const zoomFactor = -0.5; // Adjust how much you want to zoom out
        const newPosition = camera.position.clone().lerp(targetPosition, zoomFactor);
        
        camera.position.copy(newPosition);  // Move the camera to the new position
       // Reset click to 0 for zooming in again
      }
    };

    // Add event listener for clicking on Earth
    earthMesh.userData = { isEarth: true }; // Tagging the Earth mesh
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(earthGroup.children);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData.isEarth) {
          zoomOnEarth(); // Trigger zoom on Earth
        }
      }
    };

    window.addEventListener("click", onMouseClick, false);

    // Draw the Earth's orbit path
    const earthPoints = [];
    const earthOrbitSteps = 100; // Number of steps for the Earth's orbit line
    for (let i = 0; i <= earthOrbitSteps; i++) {
      const loc = propagate(
        (i / earthOrbitSteps) * earth_T,
        earth_a,
        earth_e,
        earth_n,
        0,
        0,
        0
      ); // Adjusted for the orbit period
      earthPoints.push(loc);
    }

    const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      earthPoints
    );
    const earthOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5,
    });
    const earthOrbitLine = new THREE.Line(
      earthOrbitGeometry,
      earthOrbitMaterial
    );
    scene.add(earthOrbitLine);

    // Draw the Comet's orbit path
    const cometPoints = [];
    const cometOrbitSteps = 100; 
    for (let i = 0; i <= cometOrbitSteps; i++) {
      const loc = propagate(
        (i / cometOrbitSteps) * comet_T,
        comet_a,
        comet_e,
        comet_n,
        cometInclination,
        cometArgumentOfPerihelion,
        cometNode
      );
      cometPoints.push(loc);
    }

    const cometOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      cometPoints
    );
    const cometOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0xffa500,
      transparent: true,
      opacity: 0.9,
    });
    const cometOrbitLine = new THREE.Line(
      cometOrbitGeometry,
      cometOrbitMaterial
    );
    scene.add(cometOrbitLine);
     // Create the comet mesh
     const cometGeometry = new THREE.SphereGeometry(0.1, 16, 16);
     const cometMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
     const cometMesh = new THREE.Mesh(cometGeometry, cometMaterial);
     scene.add(cometMesh);
 

    // Draw the orbit for P/2008 S1 (Catalina-McNaught)
    const catalinaPoints = [];
    const catalinaOrbitSteps = 100;
    for (let i = 0; i <= catalinaOrbitSteps; i++) {
      const loc = propagate(
        (i / catalinaOrbitSteps) * catalina_T,
        catalina_a,
        catalina_e,
        catalina_n,
        catalinaInclination,
        catalinaArgumentOfPerihelion,
        catalinaNode
      );
      catalinaPoints.push(loc);
    }

    const catalinaOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      catalinaPoints
    );
    const catalinaOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });
    const catalinaOrbitLine = new THREE.Line(
      catalinaOrbitGeometry,
      catalinaOrbitMaterial
    );
    scene.add(catalinaOrbitLine);
    const catalianaTexture = textureLoader.load("/assets/catali.png");    
    const catalinaGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const catalinaMaterial = new THREE.MeshStandardMaterial({
      map: catalianaTexture
    });
    const catalinaMesh = new THREE.Mesh(catalinaGeometry, catalinaMaterial);
    scene.add(catalinaMesh);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/assets/lights.png'), // Use a glow texture
      // Glow color
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 2, 0.4); // Adjust scale as necessary
    catalinaMesh.add(sprite); // Add the sprite to the main mesh

    //brorsen
    // Propagate the orbit using the converted parameters for Brorsen
    const brorsenPoints = [];
    const brorsenOrbitSteps = 100;
    for (let i = 0; i <= brorsenOrbitSteps; i++) {
      const loc = propagate(
        (i / brorsenOrbitSteps) * brorsen_T,
        brorsen_a,
        brorsen_e,
        brorsen_n,
        brorsenInclination,
        brorsenArgumentOfPerihelion,
        brorsenNode
      );
      brorsenPoints.push(loc);
    }
    const brorsenOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      brorsenPoints
    );
    const brorsenOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000, 
      transparent: true,
      opacity: 0.8,
    });

    const brorsenOrbitLine = new THREE.Line(
      brorsenOrbitGeometry,
      brorsenOrbitMaterial
    );
    scene.add(brorsenOrbitLine);
    const brorsenGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const brorsenMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Set a different color for visibility
    const brorsenMesh = new THREE.Mesh(brorsenGeometry, brorsenMaterial);
    scene.add(brorsenMesh);

    // tutle
    const tutlePoints = [];
    const tutleOrbitSteps = 100;
    for (let i = 0; i <= tutleOrbitSteps; i++) {
      const loc = propagate(
        (i / tutleOrbitSteps) * tutle_T,
        tutle_a,
        tutle_e,
        tutle_n,
        tutleInclination,
        tutleArgumentOfPerihelion,
        tutleNode
      );
      tutlePoints.push(loc);
    }

    const tutleOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      tutlePoints
    );
    const tutleOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });
    const tutleOrbitLine = new THREE.Line(
      tutleOrbitGeometry,
      tutleOrbitMaterial
    );
    scene.add(tutleOrbitLine);
    const tutleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const tutleMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Set a different color for visibility
    const tutleMesh = new THREE.Mesh(tutleGeometry, tutleMaterial);
    scene.add(tutleMesh);

    // Set camera position
    camera.position.z = 5; // Initial camera position

    // Animation loop
    // POSITION OF COMET AND ASTERIODE ON ITS ORBIT
    const animate = () => {
      requestAnimationFrame(animate);

      // Update clocks for orbital motion
      clock.current += 0.01;
      cometClock.current = 0.09*comet_T;
      catalinaClock.current = 0.25*catalina_T;
      brorsenClock.current = 0.09 * brorsen_T;
      tutleClock.current = 0.08 * tutle_T;

      // Update Earth's position based on Kepler's equations
      earthMesh.position.copy(
        propagate(clock.current, earth_a, earth_e, earth_n, 0, 0, 0)
      );

      // Update Comet's position based on Kepler's equations and orbital elements
      cometMesh.position.copy(
        propagate(
          cometClock.current,
          comet_a,
          comet_e,
          comet_n,
          cometInclination,
          cometArgumentOfPerihelion,
          cometNode
        )
      );

      // Update Catalina-McNaught's position based on its orbital elements
      
      catalinaMesh.position.copy(
        propagate(
          catalinaClock.current,
          catalina_a,
          catalina_e,
          catalina_n,
          catalinaInclination,
          catalinaArgumentOfPerihelion,
          catalinaNode
        )
      );
      // Update Brorsen's position
      brorsenMesh.position.copy(
        propagate(
          brorsenClock.current,
          brorsen_a,
          brorsen_e,
          brorsen_n,
          brorsenInclination,
          brorsenArgumentOfPerihelion,
          brorsenNode
        )
      );
      tutleMesh.position.copy(
        propagate(
          tutleClock.current,
          tutle_a,
          tutle_e,
          tutle_n,
          tutleInclination,
          tutleArgumentOfPerihelion,
          tutleNode
        )
      );
      controls.update(); // Update controls
      renderer.render(scene, camera); // Render the scene
    };

    animate();

    // Cleanup function when component unmounts
    return () => {
      window.removeEventListener("click", onMouseClick, false);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeDBox;