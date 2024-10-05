// import React, { useEffect, useRef, useState } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import getStarfield from "./component/starfield";

// // Constants for Earth's orbital calculations
// const EARTH_SEMI_MAJOR_AXIS = 1.5; // Semi-major axis of the Earth's orbit (in AU)
// const EARTH_ECCENTRICITY = 0.0167; // Eccentricity of Earth's orbit
// const EARTH_ORBIT_PERIOD = 365.25 * 24 * 3600; // Period of Earth's orbit in seconds
// const EARTH_MEAN_MOTION = (2 * Math.PI) / EARTH_ORBIT_PERIOD;

// // Constants for camera and rendering
// const CAMERA_FIELD_OF_VIEW = 60;
// const CAMERA_NEAR_PLANE = 0.1;
// const CAMERA_FAR_PLANE = 1000;
// const CLOCK_INCREMENT = 0.002;

// // Define comets in an array
// const comets = [
//   {
//     semiMajorAxis: 19.106380161,
//     eccentricity: 0.682526943,
//     orbitPeriod: 5.48 * 365.25 * 24 * 3600,
//     inclination: 4.894555854,
//     longitudeOfAscendingNode: 295.9854497,
//     argumentOfPerihelion: 0.626837835,
//   },
//   {
//     semiMajorAxis: (7.190641555 + 5.95) / 2,
//     eccentricity: 0.6663127807,
//     orbitPeriod: 9.74 * 365.25 * 24 * 3600,
//     inclination: 15.1007464,
//     longitudeOfAscendingNode: 111.3920029,
//     argumentOfPerihelion: 203.6490232,
//   },
//   {
//     semiMajorAxis: (0.589847 + 5.61) / 2,
//     eccentricity: 0.809796,
//     orbitPeriod: 5.46 * 365.25 * 24 * 3600,
//     inclination: 29.3821,
//     longitudeOfAscendingNode: 102.9676,
//     argumentOfPerihelion: 14.9468,
//   },
//   {
//     semiMajorAxis: (1.027116587 / (1 - 0.819799747)),
//     eccentricity: 0.819799747,
//     orbitPeriod: 13.61 * 365.25 * 24 * 3600,
//     inclination: 54.98318484,
//     longitudeOfAscendingNode: 270.341652,
//     argumentOfPerihelion: 207.509246,
//   },
 
// ];

// // Function to convert degrees to radians
// const degreesToRadians = (degrees) => degrees * (Math.PI / 180);

// // Function to calculate the position based on orbital elements
// const calculatePosition = (clock, semiMajorAxis, eccentricity, meanMotion, inclination, argumentOfPerihelion, longitudeOfAscendingNode) => {
//   const meanAnomaly = meanMotion * clock;
//   const eccentricAnomaly = meanAnomaly + eccentricity * Math.sin(meanAnomaly) * (1 + eccentricity * Math.cos(meanAnomaly));
//   const radius = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));

//   // Position in orbital plane
//   const xOrbit = radius * (Math.cos(eccentricAnomaly) - eccentricity);
//   const yOrbit = radius * (Math.sqrt(1 - eccentricity ** 2) * Math.sin(eccentricAnomaly));

//   // Orbital elements (convert to radians)
//   const inclinationRadians = degreesToRadians(inclination);
//   const argumentOfPerihelionRadians = degreesToRadians(argumentOfPerihelion);
//   const longitudeOfAscendingNodeRadians = degreesToRadians(longitudeOfAscendingNode);

//   // Apply rotation based on the orbital elements
//   let x = xOrbit * Math.cos(argumentOfPerihelionRadians) - yOrbit * Math.sin(argumentOfPerihelionRadians);
//   let y = xOrbit * Math.sin(argumentOfPerihelionRadians) + yOrbit * Math.cos(argumentOfPerihelionRadians);
//   let z = 0;

//   // Rotate for inclination (around x-axis)
//   const x1 = x;
//   const z1 = z * Math.cos(inclinationRadians) - y * Math.sin(inclinationRadians);
//   y = z * Math.sin(inclinationRadians) + y * Math.cos(inclinationRadians);
//   x = x1;
//   z = z1;

//   // Rotate for longitude of ascending node (around z-axis)
//   const x2 = x * Math.cos(longitudeOfAscendingNodeRadians) - y * Math.sin(longitudeOfAscendingNodeRadians);
//   y = x * Math.sin(longitudeOfAscendingNodeRadians) + y * Math.cos(longitudeOfAscendingNodeRadians);
//   x = x2;

//   return new THREE.Vector3(x, y, z);
// };

// const ThreeDBox = () => {
//   const [planets, setPlanets] = useState([]); // Initialize planets state
//   const mountRef = useRef(null);
//   const clock = useRef(0); // Reference for the clock
//   const cometMeshes = useRef([]); // Reference for comet meshes

//   useEffect(() => {
//     // Scene, Camera, and Renderer
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(CAMERA_FIELD_OF_VIEW, window.innerWidth / window.innerHeight, CAMERA_NEAR_PLANE, CAMERA_FAR_PLANE);
//     const renderer = new THREE.WebGLRenderer();
//     const color = 0xffffff;
//     const intensity = 1;
//     const light = new THREE.AmbientLight(color, intensity);
//     scene.add(light);

//     // Set size and append renderer to the DOM
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     mountRef.current.appendChild(renderer.domElement);

//     // OrbitControls for camera movement
//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true; // Smooth controls

//     const earthGroup = new THREE.Group();
//     earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
//     scene.add(earthGroup);

//     // Starfield
//     const stars = getStarfield({ numStars: 20000 });
//     scene.add(stars);

//     // Create Directional Light (Sunlight)
//     const sunlight = new THREE.DirectionalLight(0xffffff, 1);
//     sunlight.position.set(5, 10, 7);
//     scene.add(sunlight);

//     // Texture Loader
//     const textureLoader = new THREE.TextureLoader();
//     const earthTexture = textureLoader.load("/assets/2k_earth_daymap.jpg");
//     const geometry = new THREE.IcosahedronGeometry(1, 12);
//     const material = new THREE.MeshStandardMaterial({ map: earthTexture });
//     const earthMesh = new THREE.Mesh(geometry, material);
//     earthMesh.scale.set(0.5, 0.5, 0.5); // Scale down to 50% of the original size

//     earthGroup.add(earthMesh);

//     // Draw the Earth's orbit path
//     const earthPoints = [];
//     const earthOrbitSteps = 100; // Number of steps for the Earth's orbit line
//     for (let i = 0; i <= earthOrbitSteps; i++) {
//       const loc = calculatePosition(
//         (i / earthOrbitSteps) * EARTH_ORBIT_PERIOD,
//         EARTH_SEMI_MAJOR_AXIS,
//         EARTH_ECCENTRICITY,
//         EARTH_MEAN_MOTION,
//         0,
//         0,
//         0
//       );
//       earthPoints.push(loc);
//     }

//     const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(earthPoints);
//     const earthOrbitMaterial = new THREE.LineBasicMaterial({
//       color: 0x0000ff,
//       transparent: true,
//       opacity: 0.5,
//     });
//     const earthOrbitLine = new THREE.Line(earthOrbitGeometry, earthOrbitMaterial);
//     scene.add(earthOrbitLine);

//     // Loop through comets array to draw orbits
//     comets.forEach((comet) => {
//       const cometPoints = [];
//       const cometOrbitSteps = 100; // Number of steps for the comet's orbit line
//       for (let i = 0; i <= cometOrbitSteps; i++) {
//         const loc = calculatePosition(
//           (i / cometOrbitSteps) * comet.orbitPeriod,
//           comet.semiMajorAxis,
//           comet.eccentricity,
//           (2 * Math.PI) / comet.orbitPeriod,
//           comet.inclination,
//           comet.argumentOfPerihelion,
//           comet.longitudeOfAscendingNode
//         );
//         cometPoints.push(loc);
//       }

//       const cometOrbitGeometry = new THREE.BufferGeometry().setFromPoints(cometPoints);
//       const cometOrbitMaterial = new THREE.LineBasicMaterial({
//         color: 0xffa500, // Color for the comet orbit line
//         transparent: true,
//         opacity: 0.9,
//       });
//       const cometOrbitLine = new THREE.Line(cometOrbitGeometry, cometOrbitMaterial);
//       // scene.add(cometOrbitLine);

//       // Create a mesh for the comet
//       const cometGeometry = new THREE.SphereGeometry(0.4, 32, 32);
//       const cometMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Changed to red
//       const cometMesh = new THREE.Mesh(cometGeometry, cometMaterial);
//       const cometPosition = calculatePosition(
//         clock.current,
//         comet.semiMajorAxis,
//         comet.eccentricity,
//         (2 * Math.PI) / comet.orbitPeriod,
//         comet.inclination,
//         comet.argumentOfPerihelion,
//         comet.longitudeOfAscendingNode
//       );
//       // cometMesh.position.copy(calculatePosition(clock.current, comet.semiMajorAxis, comet.eccentricity, (2 * Math.PI) / comet.orbitPeriod, comet.inclination, comet.argumentOfPerihelion, comet.longitudeOfAscendingNode));
//       // cometMesh.position.set(cometPosition.x + 0.9, cometPosition.y + 0.4, cometPosition.z + 0.4);
//       const offsetDistance = 1.5; // Adjust this distance as needed
//       cometMesh.position.copy(cometPosition).multiplyScalar(offsetDistance);
//       scene.add(cometMesh);
//       cometMeshes.current.push({ comet, cometMesh }); // Store the comet and its mesh in the ref
//     });
// earthMesh.scale.set(0.5,0.5,0.5)
//     // Camera position
//     camera.position.z = 8;

//     // Animation loop
//    // Animation loop
//    const animate = () => {
//     requestAnimationFrame(animate);
  
//     controls.update();
  
//     // Increment clock based on elapsed time
//     clock.current +=34; // Keep a running total of time
//     earthGroup.rotation.y += CLOCK_INCREMENT; // Rotate the Earth
//     earthGroup.rotation.x += CLOCK_INCREMENT;
//     comets.forEach((comet)=>{
//       comet=clock.current*comet.orbitPeriod // Rotate the comet around its orbital axis
//     })    // earthGroup.position.x+=0.01 // Rotate the Earth
//     // earthGroup.position.y+=0.01
//     // earthGroup.position.z+=0.01
//      // Rotate the Earth
  
//     // Update comet mesh positions
//     cometMeshes.current.forEach((cometMeshData) => {
//       const comet = cometMeshData.comet;
//       const cometMesh = cometMeshData.cometMesh;
  
//       // Calculate new position based on the current total clock time
//       cometMesh.position.copy(
//         calculatePosition(
//           clock.current+=514,
//           comet.semiMajorAxis,
//           comet.eccentricity,
//           (2 * Math.PI) / comet.orbitPeriod,
//           comet.inclination,
//           comet.argumentOfPerihelion,
//           comet.longitudeOfAscendingNode
//         )
//       );
//     });
  
//     renderer.render(scene, camera);
//   };
  
//   // Handle window resize
//   window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   });
  
//   animate();
  

//     // Cleanup on component unmount
//     return () => {
//       mountRef.current.removeChild(renderer.domElement);
//     };
//   }, []);

//   return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
// };

// export default ThreeDBox;

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import getStarfield from "./starfield";

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
  const [isVisible, setIsVisible] = useState(false); // State for visibility of the div
  const cameraRef = useRef(null); //
  const [click, setClick] = useState(0); // Initialize planets state
  const mountRef = useRef(null);
  const detailRef = useRef(null);
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
 
    cameraRef.current = camera; 
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
    const stars = getStarfield({ numStars: 5000 });
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
    let isZoomedIn = false; // Track zoom state
       let lastCameraPosition = camera.position.clone(); // Store the last camera position dynamically
    
    
    const zoomOnEarth = () => {
      const targetPosition = earthMesh.position.clone();
      const zoomFactor = 0.4; // Adjust this for zoom intensity
      const newPosition = targetPosition.lerp(camera.position, zoomFactor);

      
      // Update the last camera position before moving
      lastCameraPosition.copy(camera.position);
      
      camera.position.copy(newPosition); // Zoom in
    };
    
    const zoomOutFromEarth = () => {
      // Return camera to the last position
      camera.position.copy(lastCameraPosition); 
        
      // Optionally update the last position after zooming out (if further control is needed)
      lastCameraPosition.copy(camera.position);
        // Return camera to the initial position
       
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
        // Show the div if Earth is clicked
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData.isEarth) {
          if (!isZoomedIn) {
            setIsVisible(true)
            earthMesh.scale.set(0.7, 0.7, 0.7);
            zoomOnEarth(); // Zoom in on first click
        } else {
            zoomOutFromEarth();
            earthMesh.scale.set(0.5, 0.5, 0.5);
            setIsVisible(false) // Zoom out on second click
        }
        isZoomedIn = !isZoomedIn; 
         ; 
          // Trigger zoom on Earth
        }
      } else {
        setIsVisible(false);
         // Optionally hide the div if clicking elsewhere
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
     
      // Rotate the Earth on its axis
    
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

  return(<>
    <div ref={mountRef} />
    <div style={{width:"20vw",height:"50vh",backgroundColor:"red",position:"absolute",top:210,left:80,display:"none"}} ref={detailRef}>
      <h1>Earth</h1>
      <h2>Orbit: {earth_a.toFixed(2)} AU</h2>
      <h2>Inclination: 23.5°</h2>
      
    </div>{isVisible && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px',
            backgroundColor: '#fff',
            border: '1px solid #000',
          }}
        >
          <h3>Earth Details</h3>
          <p>The Earth's axial tilt is approximately 23.5 degrees.</p>
        </div>
      )}

    
    </>
  ) ;
};

export default ThreeDBox;