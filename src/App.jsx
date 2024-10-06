import React, { useState } from 'react';
import Orbits from './component/orbits';
import SolarSystem from './component/solar';
import Tabs from './component/tabs';

const App = () => {
  const [isClicked, setIsClicked] = useState(false);

  const toggleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <div>
      <Orbits />
      <div  style={{
      
        
          position:"absolute",
          top:320,
          left: isClicked ? 660 : 22, 
        }}>
      <button
        style={{
          backgroundColor: 'blue',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
      
        }}
        onClick={toggleClick}
      >
        O
      </button></div>
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: isClicked ? 150 : -520,  // Adjusting positions for correct behavior
          transition: 'left 0.3s ease-in-out', // Changed transition for clarity
        }}
      >
        <Tabs  />
      </div>
    </div>
  );
};

export default App;
