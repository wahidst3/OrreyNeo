import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// Function to solve Kepler's equation for eccentric anomaly
const keplerSolve = (e, M) => {
  let tol = 1e-14;
  let E = M;
  let deltaE = tol + 1;
  
  while (deltaE > tol) {
    let newE = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    deltaE = Math.abs(newE - E);
    E = newE;
  }

  return E;
};

const MovingObject = ({ a, e, n }) => {
  const ref = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();  // Time from start
    const M = n * t;  // Mean anomaly
    const E = keplerSolve(e, M);  // Eccentric anomaly
    const r = a * (1 - e * Math.cos(E));  // Distance from focus

    const x = r * Math.cos(E) - e;
    const y = r * Math.sqrt(1 - e * e) * Math.sin(E);

    ref.current.position.set(x, y, 0);  // Set object's position
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

export default MovingObject;
