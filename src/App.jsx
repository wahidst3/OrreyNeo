// import React, { useEffect } from "react";
// // import { Canvas } from "@react-three/fiber";
// // import { OrbitControls } from "@react-three/drei";
// import EllipticalOrbit from "./component/elipe";
// import MovingObject from "./component/move";

// function App() {
//   // const a = 1;  // Semi-major axis
//   // const e = 0.5;  // Eccentricity

//   // const n = 0.1;  // Angular velocity (for animation)
 
//   return (
//     <>
    
//     </>
//     // <Canvas>
//     //   <ambientLight />
//     //   <EllipticalOrbit a={a} e={e} />
//     //   <MovingObject a={a} e={e} n={n} />
//     //   <OrbitControls />
//     // </Canvas>
//   );
// }

// export default App;
// import React, { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// const EllipticalOrbit = () => {
//   const mountRef = useRef(null); // Reference to the DOM element

//   useEffect(() => {
//     // Scene setup
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer();

//     // Append renderer to the DOM
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     mountRef.current.appendChild(renderer.domElement);

//     // Light setup
//     const light = new THREE.PointLight(0xffffff, 1, 100);
//     light.position.set(10, 10, 10);
//     scene.add(light);

//     // Eccentricity (0 = circle, closer to 1 = stretched ellipse)
//     let eccentricity = 0.6825; // Example value from the data you shared

//     // Create an elliptical shape using EllipseCurve
//     const ellipse = new THREE.EllipseCurve(
//       0,  0,                         // Center x, y
//       5,  5 * (1 - eccentricity),     // xRadius, yRadius (yRadius adjusted by eccentricity)
//       0,  2 * Math.PI,                // StartAngle, EndAngle
//       false,                          // Clockwise?
//       0                               // Rotation
//     );

//     // Get points for the ellipse curve
//     const points = ellipse.getPoints(100);
//     const geometry = new THREE.BufferGeometry().setFromPoints(points);

//     // Create a line material
//     const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

//     // Create a line from geometry and material
//     const ellipseLine = new THREE.Line(geometry, material);
//     scene.add(ellipseLine);

//     // Set up the camera position
//     camera.position.z = 10;

//     // OrbitControls to interact with the scene
//     const controls = new OrbitControls(camera, renderer.domElement);

//     // Animation function
//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update(); // Update controls
//       renderer.render(scene, camera); // Render the scene
//     };
//     animate();

//     // Cleanup on unmount
//     return () => {
//       mountRef.current.removeChild(renderer.domElement);
//     };
//   }, []);

//   return (
//     <div
//       style={{ width: '100vw', height: '100vh' }}
//       ref={mountRef} // This will hold the reference to the DOM element where Three.js renders
//     />
//   );
// };

// export default EllipticalOrbit;

//4thn

// import React, { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// const KeplerOrbit = () => {
//   const mountRef = useRef(null); // Reference for mounting the scene

//   const KeplerStart3 = (e, M) => {
//     const t34 = e ** 2;
//     const t35 = e * t34;
//     const t33 = Math.cos(M);
//     return M + (-0.5 * t35 + e + (t34 + 1.5 * t33 * t35) * t33) * Math.sin(M);
//   };

//   const eps3 = (e, M, x) => {
//     const t1 = Math.cos(x);
//     const t2 = -1 + e * t1;
//     const t3 = Math.sin(x);
//     const t4 = e * t3;
//     const t5 = -x + t4 + M;
//     const t6 = t5 / (0.5 * t5 * t4 / t2 + t2);
//     return t5 / ((0.5 * t3 - (1 / 6) * t1 * t6) * e * t6 + t2);
//   };

//   const KeplerSolve = (e, M) => {
//     const tol = 1.0e-14;
//     const Mnorm = M % (2 * Math.PI);
//     let E0 = KeplerStart3(e, Mnorm);
//     let dE = tol + 1;
//     let count = 0;

//     while (dE > tol) {
//       const E = E0 - eps3(e, Mnorm, E0);
//       dE = Math.abs(E - E0);
//       E0 = E;
//       count += 1;

//       if (count === 100) {
//         console.error("KeplerSolve failed to converge!");
//         break;
//       }
//     }
//     return E0;
//   };

//   const propagate = (clock, a, e) => {
//     const T = 120; // seconds
//     const n = (2 * Math.PI) / T;
//     const tau = 0; // time of pericenter passage

//     const M = n * (clock - tau);
//     const E = KeplerSolve(e, M);
//     const cose = Math.cos(E);

//     const r = a * (1 - e * cose);
//     const sX = r * ((cose - e) / (1 - e * cose));
//     const sY = r * (Math.sqrt(1 - e ** 2) * Math.sin(E) / (1 - e * cose));
//     const sZ = 0;

//     return { x: sX, y: sY, z: sZ };
//   };

//   useEffect(() => {
//     // Scene setup
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     mountRef.current.appendChild(renderer.domElement);

//     const controls = new OrbitControls(camera, renderer.domElement);
//     camera.position.z = 5;

//     const a = 1; // Semi-major axis
//     const e = 0.1; // Eccentricity

//     // Orbit calculation
//     const orbcoords = [];
//     const ts = 120; // Number of time slices
//     for (let clock = 1; clock <= ts; clock++) {
//       const loc = propagate(clock, a, e);
//       orbcoords.push(loc);
//     }

//     // Create the orbit
//     const orbitGeometry = new THREE.BufferGeometry();
//     const orbitPositions = new Float32Array(orbcoords.length * 3);
//     orbcoords.forEach((point, index) => {
//       orbitPositions.set([point.x, point.y, point.z], index * 3);
//     });
//     orbitGeometry.setAttribute('position', new THREE.BufferAttribute(orbitPositions, 3));
    
//     const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
//     const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
//     scene.add(orbitLine);

//     // Create a sphere at the start of the orbit
//     const sphereGeometry = new THREE.SphereGeometry(0.05, 32, 32);
//     const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
//     sphere.position.set(orbcoords[0].x, orbcoords[0].y, orbcoords[0].z);
//     scene.add(sphere);

//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update();
//       renderer.render(scene, camera);
//     };

//     animate();

//     return () => {
//       mountRef.current.removeChild(renderer.domElement);
//     };
//   }, []);

//   return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
// };

// export default KeplerOrbit;


//5th
// import React, { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import getStarfield from './component/starfield';

// // Constants for orbital calculations
// const a = 1; // Semi-major axis of the orbit
// const e = 0.0167; // Eccentricity of Earth's orbit
// const T = 120; // Period of orbit in seconds
// const n = (2 * Math.PI) / T; // Mean motion

// // Kepler's equation calculations
// const keplerStart3 = (e, M) => {
//   const t34 = e ** 2;
//   const t35 = e * t34;
//   const t33 = Math.cos(M);
//   return M + (-0.5 * t35 + e + (t34 + 1.5 * t33 * t35) * t33) * Math.sin(M);
// };

// const eps3 = (e, M, x) => {
//   const t1 = Math.cos(x);
//   const t2 = -1 + e * t1;
//   const t3 = Math.sin(x);
//   const t4 = e * t3;
//   const t5 = -x + t4 + M;
//   const t6 = t5 / (0.5 * t5 * t4 / t2 + t2);
//   return t5 / ((0.5 * t3 - (1 / 6) * t1 * t6) * e * t6 + t2);
// };

// const keplerSolve = (e, M) => {
//   const tol = 1.0e-14;
//   const Mnorm = M % (2 * Math.PI);
//   let E0 = keplerStart3(e, Mnorm);
//   let dE = tol + 1;
//   let count = 0;

//   while (dE > tol) {
//     const E = E0 - eps3(e, Mnorm, E0);
//     dE = Math.abs(E - E0);
//     E0 = E;
//     count += 1;

//     if (count === 100) {
//       console.error("KeplerSolve failed to converge!");
//       break;
//     }
//   }
//   return E0;
// };
// const propagate = (clock) => {
//   const M = n * clock; // Mean anomaly
//   const E = keplerSolve(e, M); // Eccentric anomaly
//   const cose = Math.cos(E); // Cosine of eccentric anomaly

//   const r = a * (1 - e * cose); // Radius based on eccentricity and angle

//   // Increase the radius to increase the width of the orbit
//   const orbitWidthMultiplier = 1.5; // Adjust this value to increase the width
//   const sX = r * orbitWidthMultiplier * ((cose - e) / (1 - e * cose));
//   const sY = r * orbitWidthMultiplier * ((Math.sqrt(1 - e ** 2) * Math.sin(E)) / (1 - e * cose));

//   return new THREE.Vector3(sX, sY, 0); // Return the new position as a 3D vector
// };

// const ThreeDBox = () => {
//   const mountRef = useRef(null);
//   const clock = useRef(0); // Reference for the clock

//   useEffect(() => {
//     // Scene, Camera, and Renderer
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer();
//     const color = 0xFFFFFF;
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
//     earthGroup.rotation.z = -23.4 * Math.PI / 180;
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
//     const earthTexture = textureLoader.load('/assets/2k_earth_daymap.jpg');
//     const geometry = new THREE.IcosahedronGeometry(1, 12);
//     const material = new THREE.MeshStandardMaterial({ map: earthTexture });
//     const earthMesh = new THREE.Mesh(geometry, material);
//     earthMesh.scale.set(0.5, 0.5, 0.5); // Scale down to 50% of the original size

//     earthGroup.add(earthMesh);

//     // Draw the orbit path
//     const points = [];
//     const orbitSteps = 100; // Number of steps for the orbit line
//     for (let i = 0; i <= orbitSteps; i++) {
//       const loc = propagate((i / orbitSteps) * T); // Adjusted for the orbit period
//       points.push(loc);
//     }

//     const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
//     const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
//     const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
//     scene.add(orbitLine);

//     // Position the camera
//     camera.position.z = 5;

//     // Animation function
//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update(); // Update controls on each frame

//       // Update Earth's position based on Kepler's equations
//       earthMesh.position.copy(propagate(clock.current)); // Set Earth's position

//       // Increment clock for the animation
//       clock.current += 0.01; // Adjust speed of orbiting
//       if (clock.current > T) clock.current = 0; // Reset clock

//       renderer.render(scene, camera);
//     };

//     // Start animation
//     animate();

//     // Cleanup function
//     return () => {
//       mountRef.current.removeChild(renderer.domElement);
//     };
//   }, []);

//   return <div ref={mountRef}></div>;
// };

// export default ThreeDBox;
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import getStarfield from './component/starfield';

// Constants for Earth's orbital calculations
const earth_a = 1; // Semi-major axis of the Earth's orbit
const earth_e = 0.0167; // Eccentricity of Earth's orbit
const earth_T = 120; // Period of Earth's orbit in seconds
const earth_n = (2 * Math.PI) / earth_T; // Mean motion for Earth

// Constants for Comet's orbital calculations
const comet_a = 2; // Semi-major axis of the comet's orbit
const comet_e = 0.7; // Eccentricity of the comet's orbit (more elongated)
const comet_T = 300; // Period of comet's orbit in seconds
const comet_n = (2 * Math.PI) / comet_T; // Mean motion for the comet

const propagate = (clock, a, e, n) => {
  const M = n * clock; // Mean anomaly
  const E = M + e * Math.sin(M) * (1 + e * Math.cos(M)); // Eccentric anomaly (approximation)
  const cose = Math.cos(E); // Cosine of eccentric anomaly
  const r = a * (1 - e * cose); // Radius based on eccentricity and angle
  return new THREE.Vector3(r * (cose - e), r * (Math.sqrt(1 - e ** 2) * Math.sin(E)), 0); // Return the new position as a 3D vector
};

const ThreeDBox = () => {
  const mountRef = useRef(null);
  const clock = useRef(0); // Reference for the clock
  const cometClock = useRef(0); // Reference for the comet's clock

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

    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = -23.4 * Math.PI / 180;
    scene.add(earthGroup);

    // Starfield
    const stars = getStarfield({ numStars: 20000 });
    scene.add(stars);

    // Create Directional Light (Sunlight)
    const sunlight = new THREE.DirectionalLight(0xffffff, 1);
    sunlight.position.set(5, 10, 7);
    scene.add(sunlight);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/assets/2k_earth_daymap.jpg');
    const geometry = new THREE.IcosahedronGeometry(1, 12);
    const material = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earthMesh = new THREE.Mesh(geometry, material);
    earthMesh.scale.set(0.5, 0.5, 0.5); // Scale down to 50% of the original size

    earthGroup.add(earthMesh);

    // Draw the Earth's orbit path
    const earthPoints = [];
    const earthOrbitSteps = 100; // Number of steps for the Earth's orbit line
    for (let i = 0; i <= earthOrbitSteps; i++) {
      const loc = propagate((i / earthOrbitSteps) * earth_T, earth_a, earth_e, earth_n); // Adjusted for the orbit period
      earthPoints.push(loc);
    }

    const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(earthPoints);
    const earthOrbitMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
    const earthOrbitLine = new THREE.Line(earthOrbitGeometry, earthOrbitMaterial);
    scene.add(earthOrbitLine);

    // Draw the Comet's orbit path
    const cometPoints = [];
    const cometOrbitSteps = 100; // Number of steps for the comet's orbit line
    for (let i = 0; i <= cometOrbitSteps; i++) {
      const loc = propagate((i / cometOrbitSteps) * comet_T, comet_a, comet_e, comet_n); // Adjusted for the orbit period
      cometPoints.push(loc);
    }

    const cometOrbitGeometry = new THREE.BufferGeometry().setFromPoints(cometPoints);
    const cometOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0.9 });
    const cometOrbitLine = new THREE.Line(cometOrbitGeometry, cometOrbitMaterial);
    scene.add(cometOrbitLine);

    // Create Comet
 
    const cometTexture = textureLoader.load('/assets/com.png');
    const cometGeometry = new THREE.SphereGeometry(0.09, 22, 12);
    const cometMaterial = new THREE.MeshStandardMaterial({map:cometTexture }); // Color of the comet
    const cometMesh = new THREE.Mesh(cometGeometry, cometMaterial);
    scene.add(cometMesh);

    // Position the camera
    camera.position.z = 5;

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls on each frame

      // Update Earth's position based on Kepler's equations
      earthMesh.position.copy(propagate(clock.current, earth_a, earth_e, earth_n)); // Set Earth's position

      // Update Comet's position based on Kepler's equations
      cometMesh.position.copy(propagate(cometClock.current, comet_a, comet_e, comet_n)); // Set Comet's position

      // Increment clocks for the animation
      clock.current += 0.01; // Adjust speed of orbiting
      cometClock.current += 0.02; // Adjust speed of comet's orbiting
      if (clock.current > earth_T) clock.current = 0; // Reset Earth clock
      if (cometClock.current > comet_T) cometClock.current = 0; // Reset Comet clock

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
