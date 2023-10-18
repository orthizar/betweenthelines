// import * as THREE from "three";

import React, { useEffect, useRef, useState } from "react";

import TOPOLOGY from "vanta/dist/vanta.topology.min";
import p5 from "p5/lib/p5.min";

const AnimatedBackground = ({ child }) => {
  const [vantaEffect, setVantaEffect] = useState(0);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        TOPOLOGY({
          el: vantaRef.current,
          p5: p5,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: "#005792",
          backgroundColor: 0xffffff,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);
  return (
    <div
      className="h-full w-full absolute"
      style={{ zIndex: "-1" }}
      ref={vantaRef}
    ></div>
  );
};

export default AnimatedBackground;
