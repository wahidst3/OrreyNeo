import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import getStarfield from "./starfield";

// Constants for Earth's orbital calculations
const earth_a = 1.9; // Semi-major axis of the Earth's orbit (in AU)
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
//Eros
const eros_a = 2.458181334135072; // Semi-major axis in AU
const eros_e = 0.2226906033843441; // Eccentricity
const eros_n = 0.5597405522715084; // Mean motion in deg/day
const erosInclination = 10.8277255953075; // Inclination in degrees
const erosArgumentOfPerihelion = 178.9102909699136; // Argument of perihelion in degrees
const erosNode = 304.2743443730555; // Longitude of ascending node in degrees
const eros_T = 643.1551163107046; // Orbital period in days

// Orbital elements for P/2008 S1 (Catalina-McNaught)
const catalina_a = (3.190641555 + 5.95) / 2; // Semi-major axis of the orbit (average of perihelion and aphelion distance in AU)
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
const ryugu_a = 1.191009085896445; // Semi-major axis in AU
const ryugu_e = 0.1911163183745462; // Eccentricity of the orbit
const ryugu_T = 474.7566304339163 * 24 * 3600; // Period in seconds (converted from days)
const ryugu_n = (2 * Math.PI) / ryugu_T; // Mean motion
const ryuguInclination = 5.866632165447784; // Inclination in degrees
const ryuguNode = 251.2944628355863; // Longitude of ascending node in degrees
const ryuguArgumentOfPerihelion = 211.6103483883579; // Argument of perihelion in degrees

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
  const ryuguClock = useRef(0);
  const erosClock = useRef(0);
  const apophisClock = useRef(0);
  const toutatisClock = useRef(0);
  const florenceClock = useRef(0);
  const an10Clock = useRef(0);
  const daClock = useRef(0);
  const  halleyClock = useRef(0);
const schwassmannClock = useRef(0);
const hondaClock = useRef(0);
const tempelClock = useRef(0);
const giacobiniClock = useRef(0);
const neowiseClock = useRef(0);
const mcnaughtClock = useRef(0);
const sidingSpringClock = useRef(0);

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

    
    let isZoomedIn = false; // Track zoom state
    let lastcometCameraPosition = camera.position.clone(); // Store the last camera position dynamically

    const zoomOnEarth = () => {
      camera.position.set(4.5, -2.4, -0.7);
      const targetPosition = earthMesh.position.clone();
      const zoomFactor = 0.4; // Adjust this for zoom intensity
      const newPosition = targetPosition.lerp(camera.position, zoomFactor);

      // Update the last camera position before moving
      lastcometCameraPosition.copy(camera.position);

      camera.position.copy(newPosition); // Zoom in
    };

    const zoomOutFromEarth = () => {
      // Return camera to the last position
      camera.position.copy(lastcometCameraPosition);

      // Optionally update the last position after zooming out (if further control is needed)
      lastcometCameraPosition.copy(camera.position);
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
            setIsVisible(true);
            earthMesh.scale.set(0.7, 0.7, 0.7);
            zoomOnEarth(); // Zoom in on first click
          } else {
            zoomOutFromEarth();
            earthMesh.scale.set(0.5, 0.5, 0.5);
            setIsVisible(false); // Zoom out on second click
          }
          isZoomedIn = !isZoomedIn;
          // Trigger zoom on Earth
        }
      } else {
        setIsVisible(false);
        // Optionally hide the div if clicking elsewhere
      }
    };
    window.addEventListener("click", onMouseClick, false);

    

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
    // Initialize 29075 (1950 DA) mesh and orbit
    const daTexture = textureLoader.load("/assets/da.jpg");
    const daGeometry = new THREE.IcosahedronGeometry(0.25, 12); // Adjust size based on DA's diameter (approximately 1.3 km)
    const daMaterial = new THREE.MeshStandardMaterial({ map: daTexture });
    const daMesh = new THREE.Mesh(daGeometry, daMaterial);
    scene.add(daMesh);

    const daOrbitPoints = [];
    const daOrbitSteps =55000;
    const da_a = 1.298925543061272; // Semi-major axis in AU
    const da_e = 0.9076629357590418; // Eccentricity
    const da_n = 0.4450845867833473; // Mean motion in deg/day
    const daInclination = 12.15654350332639; // Inclination in degrees
    const daArgumentOfPerihelion = 224.7639517079776; // Argument of perihelion in degrees
    const daNode = 356.59244288; // Longitude of ascending node in degrees
    const da_T = 808.8350185337608; // Orbital period in days

    for (let step = 0; step < daOrbitSteps; step++) {
      const clockVal = (step / daOrbitSteps) * da_T;
      const pos = propagate(
        clockVal,
        da_a,
        da_e,
        da_n,
        daInclination,
        daArgumentOfPerihelion,
        daNode
      );
      daOrbitPoints.push(pos);
    }

    const daOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      daOrbitPoints
    );
    const daOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const daOrbit = new THREE.Line(daOrbitGeometry, daOrbitMaterial);
    scene.add(daOrbit);
    // Initialize 3122 Florence mesh and orbit
    const florenceTexture = textureLoader.load("/assets/florence.jpg");
    const florenceGeometry = new THREE.IcosahedronGeometry(0.18, 12); // Adjust size based on Florence's diameter (4.9 km)
    const florenceMaterial = new THREE.MeshStandardMaterial({
      map: florenceTexture,
    });
    const florenceMesh = new THREE.Mesh(florenceGeometry, florenceMaterial);
    scene.add(florenceMesh);

    const florenceOrbitPoints = [];
    const florenceOrbitSteps =55000;
    const florence_a = 1.769594813301681; // Semi-major axis in AU
    const florence_e = 0.4236899948283012; // Eccentricity
    const florence_n = 0.4209616951187958; // Mean motion in deg/day
    const florenceInclination = 22.15194135493944; // Inclination in degrees
    const florenceArgumentOfPerihelion = 320.3270110110467; // Argument of perihelion in degrees
    const florenceNode = 336.2494805077249; // Longitude of ascending node in degrees
    const florence_T = 861.9372101114933; // Orbital period in days

    for (let step = 0; step < florenceOrbitSteps; step++) {
      const clockVal = (step / florenceOrbitSteps) * florence_T;
      const pos = propagate(
        clockVal,
        florence_a,
        florence_e,
        florence_n,
        florenceInclination,
        florenceArgumentOfPerihelion,
        florenceNode
      );
      florenceOrbitPoints.push(pos);
    }

    const florenceOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      florenceOrbitPoints
    );
    const florenceOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
    });
    const florenceOrbit = new THREE.Line(
      florenceOrbitGeometry,
      florenceOrbitMaterial
    );
    scene.add(florenceOrbit);

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
// Zoom functionality when Comet is clicked
// Zoom functionality for Comet mesh
let isCometZoomedIn = false; // Track zoom state for the comet
let lastCometCameraPosition = camera.position.clone(); // Store the last camera position

const zoomOnComet = () => {
  camera.position.set(4.5, 4.4, -0.7); // Centered at (0, 0, 0)
  const targetPosition = cometMesh.position.clone();
  const zoomFactor = 0.04; // Adjust this for zoom intensity
  const newPosition = targetPosition.lerp(camera.position, zoomFactor);
 
  // Update the last camera position before moving
  lastCometCameraPosition.copy(camera.position);

  camera.position.copy(newPosition); // Zoom in
};

const zoomOutFromComet = () => {
  // Return camera to the last position
  camera.position.copy(lastCometCameraPosition);
};

// Tagging the Comet mesh
cometMesh.userData = { isComet: true }; 

const cometRaycaster = new THREE.Raycaster();
const cometMouse = new THREE.Vector2();

const onCometMouseClick = (event) => {
  event.preventDefault();
  cometMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  cometMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  cometRaycaster.setFromCamera(cometMouse, camera);

  // Check for intersections with the comet mesh
  const cometIntersects = cometRaycaster.intersectObject(cometMesh); // Use intersectObject for a single mesh

  if (cometIntersects.length > 0) {
    // Check if the intersected object is the comet
    const intersectedObject = cometIntersects[0].object; // Use cometIntersects instead of intersects
    if (intersectedObject.userData.isComet) {
      if (!isCometZoomedIn) {
        setIsVisible(true); // Show additional UI if necessary
        cometMesh.scale.set(0.7, 0.7, 0.7); // Scale the comet up
        zoomOnComet(); // Zoom in on first click
      } else {
        zoomOutFromComet(); // Zoom out on second click
        cometMesh.scale.set(0.5, 0.5, 0.5); // Scale the comet back down
        setIsVisible(false); // Hide additional UI if necessary
      }
      isCometZoomedIn = !isCometZoomedIn; // Toggle zoom state
    }
  } else {
    // Optionally handle clicks on other objects or the background
    // For example, resetting visibility if clicking outside the comet
    setIsVisible(false);
  }
};

// Add the event listener to the window
window.addEventListener("click", onCometMouseClick, false);

    // Draw the Earth's orbit path
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
      map: catalianaTexture,
    });
    const catalinaMesh = new THREE.Mesh(catalinaGeometry, catalinaMaterial);
    scene.add(catalinaMesh);
    // Adjust scale as necessary
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

    // Initialize Ryugu mesh and orbit
    const ryuguTexture = textureLoader.load("/assets/ryugu.jpg");
    const ryuguGeometry = new THREE.IcosahedronGeometry(0.3, 12); // Smaller than Earth
    const ryuguMaterial = new THREE.MeshStandardMaterial({ map: ryuguTexture });
    const ryuguMesh = new THREE.Mesh(ryuguGeometry, ryuguMaterial);
    scene.add(ryuguMesh);

    const ryuguOrbitPoints = [];
    const ryuguOrbitSteps =55000;
    for (let step = 0; step < ryuguOrbitSteps; step++) {
      const clockVal = (step / ryuguOrbitSteps) * ryugu_T;
      const pos = propagate(
        clockVal,
        ryugu_a,
        ryugu_e,
        ryugu_n,
        ryuguInclination,
        ryuguArgumentOfPerihelion,
        ryuguNode
      );
      ryuguOrbitPoints.push(pos);
    }

    const ryuguOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      ryuguOrbitPoints
    );
    const ryuguOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    });
    const ryuguOrbit = new THREE.Line(ryuguOrbitGeometry, ryuguOrbitMaterial);
    scene.add(ryuguOrbit);
    // Initialize 99942 Apophis mesh and orbit
    const apophisTexture = textureLoader.load("/assets/apophis.jpg");
    const apophisGeometry = new THREE.IcosahedronGeometry(0.15, 12); // Adjust size based on Apophis diameter (0.34 km)
    const apophisMaterial = new THREE.MeshStandardMaterial({
      map: apophisTexture,
    });
    const apophisMesh = new THREE.Mesh(apophisGeometry, apophisMaterial);
    scene.add(apophisMesh);

    const apophisOrbitPoints = [];
    const apophisOrbitSteps =55000;
    const apophis_a = 0.9223819788122343; // Semi-major axis in AU
    const apophis_e = 0.1911496057614814; // Eccentricity
    const apophis_n = 1.112596937012332; // Mean motion in deg/day
    const apophisInclination = 3.340993241446215; // Inclination in degrees
    const apophisArgumentOfPerihelion = 126.6724287481343; // Argument of perihelion in degrees
    const apophisNode = 203.9041887697427; // Longitude of ascending node in degrees
    const apophis_T = 323.5673117766365; // Orbital period in days

    for (let step = 0; step < apophisOrbitSteps; step++) {
      const clockVal = (step / apophisOrbitSteps) * apophis_T;
      const pos = propagate(
        clockVal,
        apophis_a,
        apophis_e,
        apophis_n,
        apophisInclination,
        apophisArgumentOfPerihelion,
        apophisNode
      );
      apophisOrbitPoints.push(pos);
    }

    const apophisOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      apophisOrbitPoints
    );
    const apophisOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    });
    const apophisOrbit = new THREE.Line(
      apophisOrbitGeometry,
      apophisOrbitMaterial
    );
    scene.add(apophisOrbit);
    //eros
    // Initialize 433 Eros mesh and orbit
    const erosTexture = textureLoader.load("/assets/eros.jpg");
    const erosGeometry = new THREE.IcosahedronGeometry(0.2, 12); // Smaller than Earth
    const erosMaterial = new THREE.MeshStandardMaterial({ map: erosTexture });
    const erosMesh = new THREE.Mesh(erosGeometry, erosMaterial);
    scene.add(erosMesh);

    const erosOrbitPoints = [];
    const erosOrbitSteps =55000;

    for (let step = 0; step < erosOrbitSteps; step++) {
      const clockVal = (step / erosOrbitSteps) * eros_T;
      const pos = propagate(
        clockVal,
        eros_a,
        eros_e,
        eros_n,
        erosInclination,
        erosArgumentOfPerihelion,
        erosNode
      );
      erosOrbitPoints.push(pos);
    }

    const erosOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      erosOrbitPoints
    );
    const erosOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const erosOrbit = new THREE.Line(erosOrbitGeometry, erosOrbitMaterial);
    scene.add(erosOrbit);
    // Initialize 137108 (1999 AN10) mesh and orbit
    const an10Texture = textureLoader.load("/assets/an10.jpg");
    const an10Geometry = new THREE.IcosahedronGeometry(0.6, 12); // Adjust size based on AN10's diameter (approximately 3.2 km)
    const an10Material = new THREE.MeshStandardMaterial({ map: an10Texture });
    const an10Mesh = new THREE.Mesh(an10Geometry, an10Material);
    scene.add(an10Mesh);

    const an10OrbitPoints = [];
    const an10OrbitSteps =55000;
    const an10_a = 4.458591817854945; // Semi-major axis in AU
    const an10_e = 1.5621440029717847; // Eccentricity
    const an10_n = 0.5595042816968883; // Mean motion in deg/day
    const an10Inclination = 39.92660630620198; // Inclination in degrees
    const an10ArgumentOfPerihelion = 268.3349475180796; // Argument of perihelion in degrees
    const an10Node = 314.3393696419268; // Longitude of ascending node in degrees
    const an10_T = 643.4267114242214; // Orbital period in days

    for (let step = 0; step < an10OrbitSteps; step++) {
      const clockVal = (step / an10OrbitSteps) * an10_T;
      const pos = propagate(
        clockVal,
        an10_a,
        an10_e,
        an10_n,
        an10Inclination,
        an10ArgumentOfPerihelion,
        an10Node
      );
      an10OrbitPoints.push(pos);
    }

    const an10OrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      an10OrbitPoints
    );
    const an10OrbitMaterial = new THREE.LineBasicMaterial({ color: 0xfff000 });
    const an10Orbit = new THREE.Line(an10OrbitGeometry, an10OrbitMaterial);
    scene.add(an10Orbit);
    // Initialize 1P/Halley mesh and orbit
const halleyTexture = textureLoader.load("/assets/halley.jpg");
const halleyGeometry = new THREE.IcosahedronGeometry(0.11, 12); // Adjust size based on Halley's diameter (approximately 11 km)
const halleyMaterial = new THREE.MeshStandardMaterial({ map: halleyTexture });
const halleyMesh = new THREE.Mesh(halleyGeometry, halleyMaterial);
scene.add(halleyMesh);

const halleyOrbitPoints = [];
const halleyOrbitSteps = 1000;
const halley_a = 17.93003431157555; // Semi-major axis in AU
const halley_e = 0.9679221169240834; // Eccentricity
const halley_n = 0.01298172464034513; // Mean motion in deg/day
const halleyInclination = 162.1951462980701; // Inclination in degrees
const halleyArgumentOfPerihelion = 112.2128395742619; // Argument of perihelion in degrees
const halleyNode = 59.07198712310091; // Longitude of ascending node in degrees
const halley_T = 27731.29225689917; // Orbital period in days

for (let step = 0; step < halleyOrbitSteps; step++) {
  const clockVal = (step / halleyOrbitSteps) * halley_T;
  const pos = propagate(clockVal, halley_a, halley_e, halley_n, halleyInclination, halleyArgumentOfPerihelion, halleyNode);
  halleyOrbitPoints.push(pos);
}

const halleyOrbitGeometry = new THREE.BufferGeometry().setFromPoints(halleyOrbitPoints);
const halleyOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const halleyOrbit = new THREE.Line(halleyOrbitGeometry, halleyOrbitMaterial);
scene.add(halleyOrbit);

    // Initialize 4179 Toutatis mesh and orbit
    const toutatisTexture = textureLoader.load("/assets/Touthies.jpg");
    const toutatisGeometry = new THREE.IcosahedronGeometry(0.27, 12); // Adjust size based on Toutatis diameter (5.4 km)
    const toutatisMaterial = new THREE.MeshStandardMaterial({
      map: toutatisTexture,
    });
    const toutatisMesh = new THREE.Mesh(toutatisGeometry, toutatisMaterial);
    scene.add(toutatisMesh);

    const toutatisOrbitPoints = [];
    const toutatisOrbitSteps =55000;
    const toutatis_a = 2.543298279475208; // Semi-major axis in AU
    const toutatis_e = 0.6247568946248941; // Eccentricity
    const toutatis_n = 0.2430010374214225; // Mean motion in deg/day
    const toutatisInclination = 0.4480321666093682; // Inclination in degrees
    const toutatisArgumentOfPerihelion = 277.8770693928367; // Argument of perihelion in degrees
    const toutatisNode = 125.3589080445109; // Longitude of ascending node in degrees
    const toutatis_T = 1481.475156732245; // Orbital period in days

    for (let step = 0; step < toutatisOrbitSteps; step++) {
      const clockVal = (step / toutatisOrbitSteps) * toutatis_T;
      const pos = propagate(
        clockVal,
        toutatis_a,
        toutatis_e,
        toutatis_n,
        toutatisInclination,
        toutatisArgumentOfPerihelion,
        toutatisNode
      );
      toutatisOrbitPoints.push(pos);
    }

    const toutatisOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      toutatisOrbitPoints
    );
    const toutatisOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0xffa500,
    });
    const toutatisOrbit = new THREE.Line(
      toutatisOrbitGeometry,
      toutatisOrbitMaterial
    );
    scene.add(toutatisOrbit);



// Initialize 73P/Schwassmann-Wachmann 3 mesh and orbit for Epoch 2457800.5 (2017-Feb-16.0) TDB
const schwassmannTexture = textureLoader.load("/assets/73p.jpg");
const schwassmannGeometry = new THREE.IcosahedronGeometry(0.043, 10); // Adjust size based on object’s diameter
const schwassmannMaterial = new THREE.MeshStandardMaterial({ map: schwassmannTexture });
const schwassmannMesh = new THREE.Mesh(schwassmannGeometry, schwassmannMaterial);
scene.add(schwassmannMesh);

const schwassmannOrbitPoints = [];
const schwassmannOrbitSteps =55000;
const schwassmann_a = 3.091409125402872; // Semi-major axis in AU
const schwassmann_e = 0.6855224213052875; // Eccentricity
const schwassmann_n = 0.1813298686853155; // Mean motion in deg/day
const schwassmannInclination = 11.23695257587073; // Inclination in degrees
const schwassmannArgumentOfPerihelion = 199.38905381; // Argument of perihelion in degrees
const schwassmannNode = 69.66179724003742; // Longitude of ascending node in degrees
const schwassmann_T = 1985.332050423272; // Orbital period in days

for (let step = 0; step < schwassmannOrbitSteps; step++) {
  const clockVal = (step / schwassmannOrbitSteps) * schwassmann_T;
  const pos = propagate(clockVal, schwassmann_a, schwassmann_e, schwassmann_n, schwassmannInclination, schwassmannArgumentOfPerihelion, schwassmannNode);
  schwassmannOrbitPoints.push(pos);
}

const schwassmannOrbitGeometry = new THREE.BufferGeometry().setFromPoints(schwassmannOrbitPoints);
const schwassmannOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const schwassmannOrbit = new THREE.Line(schwassmannOrbitGeometry, schwassmannOrbitMaterial);
scene.add(schwassmannOrbit);

// Initialize 45P/Honda-Mrkos-Pajdusakova mesh and orbit for Epoch 2457979.5 (2017-Aug-14.0) TDB
const hondaTexture = textureLoader.load("/assets/45p.jpg");
const hondaGeometry = new THREE.IcosahedronGeometry(0.032, 10); // Adjust size based on object’s diameter (1.6 km)
const hondaMaterial = new THREE.MeshStandardMaterial({ map: hondaTexture });
const hondaMesh = new THREE.Mesh(hondaGeometry, hondaMaterial);
scene.add(hondaMesh);

const hondaOrbitPoints = [];
const hondaOrbitSteps =55000;
const honda_a = 3.026353875026082; // Semi-major axis in AU
const honda_e = 0.8239960779465374; // Eccentricity
const honda_n = 0.1872080459025086; // Mean motion in deg/day
const hondaInclination = 4.248170541497252; // Inclination in degrees
const hondaArgumentOfPerihelion = 326.3441984051743; // Argument of perihelion in degrees
const hondaNode = 88.93460245064746; // Longitude of ascending node in degrees
const honda_T = 1922.994272305344; // Orbital period in days

for (let step = 0; step < hondaOrbitSteps; step++) {
  const clockVal = (step / hondaOrbitSteps) * honda_T;
  const pos = propagate(clockVal, honda_a, honda_e, honda_n, hondaInclination, hondaArgumentOfPerihelion, hondaNode);
  hondaOrbitPoints.push(pos);
}
const hondaOrbitGeometry = new THREE.BufferGeometry().setFromPoints(hondaOrbitPoints);
const hondaOrbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const hondaOrbit = new THREE.Line(hondaOrbitGeometry, hondaOrbitMaterial);
scene.add(hondaOrbit);

// Initialize 55P/Tempel-Tuttle mesh and orbit for Epoch 2451040.5 (1998-Aug-15.0) TDB
const tempelTexture = textureLoader.load("/assets/55p.jpg");
const tempelGeometry = new THREE.IcosahedronGeometry(0.036, 10); // Adjust size based on object’s diameter (3.6 km)
const tempelMaterial = new THREE.MeshStandardMaterial({ map: tempelTexture });
const tempelMesh = new THREE.Mesh(tempelGeometry, tempelMaterial);
scene.add(tempelMesh);

const tempelOrbitPoints = [];
const tempelOrbitSteps =55000;
const tempel_a = 10.3383382297577; // Semi-major axis in AU
const tempel_e = 0.905552720972412; // Eccentricity
const tempel_n = 0.02965022335088491; // Mean motion in deg/day
const tempelInclination = 162.486575379434; // Inclination in degrees
const tempelArgumentOfPerihelion = 172.5002736828059; // Argument of perihelion in degrees
const tempelNode = 235.270989149082; // Longitude of ascending node in degrees
const tempel_T = 12141.56115249823; // Orbital period in days

for (let step = 0; step < tempelOrbitSteps; step++) {
  const clockVal = (step / tempelOrbitSteps) * tempel_T;
  const pos = propagate(clockVal, tempel_a, tempel_e, tempel_n, tempelInclination, tempelArgumentOfPerihelion, tempelNode);
  tempelOrbitPoints.push(pos);
}

const tempelOrbitGeometry = new THREE.BufferGeometry().setFromPoints(tempelOrbitPoints);
const tempelOrbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const tempelOrbit = new THREE.Line(tempelOrbitGeometry, tempelOrbitMaterial);
scene.add(tempelOrbit);


// Initialize 21P/Giacobini-Zinner mesh and orbit for Epoch 2458065.5 (2017-Nov-08.0) TDB
const giacobiniTexture = textureLoader.load("/assets/21p.jpg");
const giacobiniGeometry = new THREE.IcosahedronGeometry(0.02, 10); // Adjust size based on object's diameter (2.0 km)
const giacobiniMaterial = new THREE.MeshStandardMaterial({ map: giacobiniTexture });
const giacobiniMesh = new THREE.Mesh(giacobiniGeometry, giacobiniMaterial);
scene.add(giacobiniMesh);

const giacobiniOrbitPoints = [];
const giacobiniOrbitSteps =55000;
const giacobini_a = 3.500400853758239; // Semi-major axis in AU
const giacobini_e = 0.7104683811941821; // Eccentricity
const giacobini_n = 0.1504968473328959; // Mean motion in deg/day
const giacobiniInclination = 32.00291968861099; // Inclination in degrees
const giacobiniArgumentOfPerihelion = 172.8102579769661; // Argument of perihelion in degrees
const giacobiniNode = 195.4049997631541; // Longitude of ascending node in degrees
const giacobini_T = 2392.076687185927; // Orbital period in days

for (let step = 0; step < giacobiniOrbitSteps; step++) {
  const clockVal = (step / giacobiniOrbitSteps) * giacobini_T;
  const pos = propagate(clockVal, giacobini_a, giacobini_e, giacobini_n, giacobiniInclination, giacobiniArgumentOfPerihelion, giacobiniNode);
  giacobiniOrbitPoints.push(pos);
}

const giacobiniOrbitGeometry = new THREE.BufferGeometry().setFromPoints(giacobiniOrbitPoints);
const giacobiniOrbitMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
const giacobiniOrbit = new THREE.Line(giacobiniOrbitGeometry, giacobiniOrbitMaterial);
scene.add(giacobiniOrbit)


// Initialize C/2020 F3 (NEOWISE) mesh and orbit for Epoch 2459036.5 (2020-Jul-06.0) TDB
const neowiseTexture = textureLoader.load("/assets/neowise.jpg");
const neowiseGeometry = new THREE.IcosahedronGeometry(0.03, 10); // Adjust size based on the estimated diameter
const neowiseMaterial = new THREE.MeshStandardMaterial({ map: neowiseTexture });
const neowiseMesh = new THREE.Mesh(neowiseGeometry, neowiseMaterial);
scene.add(neowiseMesh);

const neowiseOrbitPoints = [];
const neowiseOrbitSteps =55000;
const neowise_a = 358.4679565529321; // Semi-major axis in AU
const neowise_e = 0.9991780262531292; // Eccentricity
const neowise_n = 0.0001452207126474352; // Mean motion in deg/day
const neowiseInclination = 128.9375027594809; // Inclination in degrees
const neowiseArgumentOfPerihelion = 37.2786584481257; // Argument of perihelion in degrees
const neowiseNode = 61.01042818536988; // Longitude of ascending node in degrees
const neowise_T = 2478985.217997125; // Orbital period in days (roughly ~6.79 million years)

for (let step = 0; step < neowiseOrbitSteps; step++) {
  const clockVal = (step / neowiseOrbitSteps) * neowise_T;
  const pos = propagate(clockVal, neowise_a, neowise_e, neowise_n, neowiseInclination, neowiseArgumentOfPerihelion, neowiseNode);
  neowiseOrbitPoints.push(pos);
}

const neowiseOrbitGeometry = new THREE.BufferGeometry().setFromPoints(neowiseOrbitPoints);
const neowiseOrbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const neowiseOrbit = new THREE.Line(neowiseOrbitGeometry, neowiseOrbitMaterial);
scene.add(neowiseOrbit);

// Initialize C/2006 P1 (McNaught) mesh and orbit for Epoch 2454065.5 (2006-Nov-26.0) TDB
const mcnaughtTexture = textureLoader.load("/assets/sky_1280.jpg");
const mcnaughtGeometry = new THREE.IcosahedronGeometry(0.03, 10); // Adjust size based on its estimated diameter
const mcnaughtMaterial = new THREE.MeshStandardMaterial({ map: mcnaughtTexture });
const mcnaughtMesh = new THREE.Mesh(mcnaughtGeometry, mcnaughtMaterial);
scene.add(mcnaughtMesh);

const mcnaughtOrbitPoints = [];
const mcnaughtOrbitSteps =55000;
const mcnaught_a = -9074.061068728695; // Semi-major axis (negative for hyperbolic orbit)
const mcnaught_e = 1.000018815882278; // Eccentricity (hyperbolic)
const mcnaught_n = 1.140253797432305E-6; // Mean motion in deg/day
const mcnaughtInclination = 77.83700054890942; // Inclination in degrees
const mcnaughtArgumentOfPerihelion = 155.9749681149126; // Argument of perihelion in degrees
const mcnaughtNode = 267.4148026435385; // Longitude of ascending node in degrees
const mcnaught_tp = 2454113.298843632772; // Time of perihelion passage (2007-Jan-12)

for (let step = 0; step < mcnaughtOrbitSteps; step++) {
  const clockVal = (step / mcnaughtOrbitSteps) * (mcnaught_tp - 2454065.5);
  const pos = propagate(clockVal, mcnaught_a, mcnaught_e, mcnaught_n, mcnaughtInclination, mcnaughtArgumentOfPerihelion, mcnaughtNode);
  mcnaughtOrbitPoints.push(pos);
}

const mcnaughtOrbitGeometry = new THREE.BufferGeometry().setFromPoints(mcnaughtOrbitPoints);
const mcnaughtOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xffa500 });
const mcnaughtOrbit = new THREE.Line(mcnaughtOrbitGeometry, mcnaughtOrbitMaterial);
scene.add(mcnaughtOrbit);


// Initialize C/2013 A1 (Siding Spring) mesh and orbit for Epoch 2457480.5 (2016-Apr-02.0) TDB
const sidingSpringTexture = textureLoader.load("/assets/sidingspring.jpg");
const sidingSpringGeometry = new THREE.IcosahedronGeometry(0.03, 10); // Adjust size for the comet's estimated diameter
const sidingSpringMaterial = new THREE.MeshStandardMaterial({ map: sidingSpringTexture });
const sidingSpringMesh = new THREE.Mesh(sidingSpringGeometry, sidingSpringMaterial);
scene.add(sidingSpringMesh);

const sidingSpringOrbitPoints = [];
const sidingSpringOrbitSteps =55000;
const sidingSpring_a = -16366.48574855812; // Semi-major axis (negative for hyperbolic orbit)
const sidingSpring_e = 1.000085526301256; // Eccentricity (hyperbolic)
const sidingSpring_n = 4.707289613947705E-7; // Mean motion in deg/day
const sidingSpringInclination = 129.0329176101494; // Inclination in degrees
const sidingSpringArgumentOfPerihelion = 2.449169482138664; // Argument of perihelion in degrees
const sidingSpringNode = 300.9994099243701; // Longitude of ascending node in degrees
const sidingSpring_tp = 2456955.675811088666; // Time of perihelion passage (2014-Oct-25)

for (let step = 0; step < sidingSpringOrbitSteps; step++) {
  const clockVal = (step / sidingSpringOrbitSteps) * (sidingSpring_tp - 2457480.5);
  const pos = propagate(clockVal, sidingSpring_a, sidingSpring_e, sidingSpring_n, sidingSpringInclination, sidingSpringArgumentOfPerihelion, sidingSpringNode);
  sidingSpringOrbitPoints.push(pos);
}

const sidingSpringOrbitGeometry = new THREE.BufferGeometry().setFromPoints(sidingSpringOrbitPoints);
const sidingSpringOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xff4500 });
const sidingSpringOrbit = new THREE.Line(sidingSpringOrbitGeometry, sidingSpringOrbitMaterial);
scene.add(sidingSpringOrbit);

    // Set camera position
    camera.position.z = 5; // Initial camera position

    // Animation loop
    // POSITION OF COMET AND ASTERIODE ON ITS ORBIT
    const animate = () => {
      requestAnimationFrame(animate);

      // Update clocks for orbital motion

      // Rotate the Earth on its axis

      clock.current = 0.01;
      cometClock.current = 0.09 * comet_T;
      catalinaClock.current = 0.25 * catalina_T;
      brorsenClock.current = 0.09 * brorsen_T;
      tutleClock.current = 0.2 * tutle_T;
      ryuguClock.current = 0.3*ryugu_T;
      erosClock.current = 0.09*eros_T;
      daClock.current = 0.09*da_T;
      apophisClock.current = 0.09*apophis_T;
      toutatisClock.current = 0.09*toutatis_T;
      florenceClock.current = 0.09*florence_T;
      an10Clock.current = 0.09*an10_T;
      halleyClock.current = 0.09*halley_T;
     
schwassmannClock.current = 0.09*schwassmann_T;

  // Update Schwassmann-Wachmann's position
  const schwassmannPosition = propagate(schwassmannClock.current, schwassmann_a, schwassmann_e, schwassmann_n, schwassmannInclination, schwassmannArgumentOfPerihelion, schwassmannNode);
  schwassmannMesh.position.copy(schwassmannPosition);


 hondaClock.current = 0.09*honda_T;

  // Update Honda-Mrkos-Pajdusakova's position
  const hondaPosition = propagate(hondaClock.current, honda_a, honda_e, honda_n, hondaInclination, hondaArgumentOfPerihelion, hondaNode);
  hondaMesh.position.copy(hondaPosition);



tempelClock.current = 0.09*tempel_T
  // Update Tempel-Tuttle's position
  const tempelPosition = propagate(tempelClock.current, tempel_a, tempel_e, tempel_n, tempelInclination, tempelArgumentOfPerihelion, tempelNode);
  tempelMesh.position.copy(tempelPosition);



giacobiniClock.current = 0.09*giacobini_T;

  // Update Giacobini-Zinner's position
  const giacobiniPosition = propagate(giacobiniClock.current, giacobini_a, giacobini_e, giacobini_n, giacobiniInclination, giacobiniArgumentOfPerihelion, giacobiniNode);
  giacobiniMesh.position.copy(giacobiniPosition);



 neowiseClock.current = 0.09*neowise_T;

  // Update NEOWISE's position
  const neowisePosition = propagate(neowiseClock.current, neowise_a, neowise_e, neowise_n, neowiseInclination, neowiseArgumentOfPerihelion, neowiseNode);
  neowiseMesh.position.copy(neowisePosition);



mcnaughtClock.current = 0.09*mcnaught_tp;

  // Update McNaught's position
  const mcnaughtPosition = propagate(mcnaughtClock.current, mcnaught_a, mcnaught_e, mcnaught_n, mcnaughtInclination, mcnaughtArgumentOfPerihelion, mcnaughtNode);
  mcnaughtMesh.position.copy(mcnaughtPosition);



sidingSpringClock.current = 0.09*sidingSpring_T;

  // Update Siding Spring's position
  const sidingSpringPosition = propagate(sidingSpringClock.current, sidingSpring_a, sidingSpring_e, sidingSpring_n, sidingSpringInclination, sidingSpringArgumentOfPerihelion, sidingSpringNode);
  sidingSpringMesh.position.copy(sidingSpringPosition);

      // Update Earth's position based on Kepler's equations
      earthMesh.position.copy(
        propagate(clock.current, earth_a, earth_e, earth_n, 0, 0, 0)
      );
      // Update 1P/Halley's position
  const halleyPosition = propagate(halleyClock.current, halley_a, halley_e, halley_n, halleyInclination, halleyArgumentOfPerihelion, halleyNode);
  halleyMesh.position.copy(halleyPosition);

      // Update 137108 (1999 AN10) position
      const an10Position = propagate(
        an10Clock.current,
        an10_a,
        an10_e,
        an10_n,
        an10Inclination,
        an10ArgumentOfPerihelion,
        an10Node
      );
      an10Mesh.position.copy(an10Position);

      const toutatisPosition = propagate(
        toutatisClock.current,
        toutatis_a,
        toutatis_e,
        toutatis_n,
        toutatisInclination,
        toutatisArgumentOfPerihelion,
        toutatisNode
      );
      toutatisMesh.position.copy(toutatisPosition);
      const ryuguPosition = propagate(
        ryuguClock.current,
        ryugu_a,
        ryugu_e,
        ryugu_n,
        ryuguInclination,
        ryuguArgumentOfPerihelion,
        ryuguNode
      );
      ryuguMesh.position.copy(ryuguPosition);

      const apophisPosition = propagate(
        apophisClock.current,
        apophis_a,
        apophis_e,
        apophis_n,
        apophisInclination,
        apophisArgumentOfPerihelion,
        apophisNode
      );
      apophisMesh.position.copy(apophisPosition);
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
      // Update Florence's position
      const florencePosition = propagate(
        florenceClock.current,
        florence_a,
        florence_e,
        florence_n,
        florenceInclination,
        florenceArgumentOfPerihelion,
        florenceNode
      );
      florenceMesh.position.copy(florencePosition);
      // Update 29075 (1950 DA) position
      const daPosition = propagate(
        daClock.current,
        da_a,
        da_e,
        da_n,
        daInclination,
        daArgumentOfPerihelion,
        daNode
      );
      daMesh.position.copy(daPosition);

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
      const erosPosition = propagate(
        erosClock.current,
        eros_a,
        eros_e,
        eros_n,
        erosInclination,
        erosArgumentOfPerihelion,
        erosNode
      );
      erosMesh.position.copy(erosPosition);
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
      window.removeEventListener("click", onCometMouseClick, false);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <div ref={mountRef} />
      <div
        style={{
          width: "20vw",
          height: "50vh",
          backgroundColor: "red",
          position: "absolute",
          top: 210,
          left: 80,
          display: "none",
        }}
        ref={detailRef}
      >
        <h1>Earth</h1>
        <h2>Orbit: {earth_a.toFixed(2)} AU</h2>
        <h2>Inclination: 23.5°</h2>
      </div>
      {isVisible && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px",
            backgroundColor: "#fff",
            border: "1px solid #000",
          }}
        >
          <h3>Comet Details</h3>
          <p>The Earth's axial tilt is approximately 23.5 degrees.</p>
        </div>
      )}
    </>
  );
};

export default ThreeDBox;
