import React from "react";

// Function to generate ellipse points
const generateEllipse = (a, e) => {
  let points = [];
  const b = a * Math.sqrt(1 - e * e);  // Calculate minor axis
  
  for (let i = 0; i <= Math.PI * 2; i += Math.PI / 40) {
    const x = a * Math.cos(i) - e;
    const y = b * Math.sin(i);
    points.push([x, y, 0]);  // Store as 3D points
  }
  
  return points;
};

const EllipticalOrbit = ({ a, e }) => {
  const points = generateEllipse(a, e);

  return (
    <line>
      <bufferGeometry attach="geometry">
        <float32BufferAttribute
          attachObject={['attributes', 'position']}
          array={new Float32Array(points.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="red" />
    </line>
  );
};

export default EllipticalOrbit;
