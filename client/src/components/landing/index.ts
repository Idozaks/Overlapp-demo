// HeroVennDiagram.js
import React from 'react';
import styled from 'styled-components';

const Circle = styled.div`
  position: absolute;
  border-radius: 50%;
  ${props => props.left && `
    left: 0;
    top: 0;
    width: 150px;
    height: 150px;
    background: linear-gradient(to bottom, #4c83ee, #44bdbe);
  `}
  ${props => props.right && `
    right: 0;
    top: 0;
    width: 150px;
    height: 150px;
    background: linear-gradient(to bottom, #44bdbe, #a964cf);
  `}
`;

const Intersection = styled.div`
  position: absolute;
  left: 75px;
  top: 75px;
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: rgba(76, 189, 190, 0.5); /* Dynamically adjust this */
`;


function HeroVennDiagram() {
  return (
    <div style={{ position: 'relative', width: '300px', height: '150px' }}>
      <Circle left />
      <Circle right />
      <Intersection />
    </div>
  );
}

export default HeroVennDiagram;


// Hero.js (Assuming this file exists and needs update)
// ... other existing Hero component code ...
import HeroVennDiagram from './HeroVennDiagram';

function Hero() {
  // ... other existing Hero component code ...

  return (
    <div>
      {/*Existing Hero content*/}
      <HeroVennDiagram />
      {/*Existing Hero content*/}
    </div>
  );
}

export default Hero;

//index.js (or wherever your exports are)
export { default as Hero } from './Hero';
export { default as HeroVennDiagram } from './HeroVennDiagram';