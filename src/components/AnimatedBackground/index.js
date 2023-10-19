import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";

const AnimatedBackground = ({ child }) => {
  const canvasRef = useRef(null);
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    if (!isInit) {
      const sketch = (p) => {
        const w = canvasRef.current.offsetWidth;
        const h = canvasRef.current.offsetHeight;
        let t = 0;
        let n = 800;
        let particles = [];
        const renderer = p.createCanvas(w, h);
        renderer.parent(canvasRef.current)
        p.setup = function () {
          p.stroke(0, 10);

          for (var i = 0; i < n; i++) {
            particles.push({
              pos: p.createVector(p.random(w), p.random(h)),
              vel: p.createVector(0, 0),
              seed: i,
            });
          }
        };

        p.draw = function () {
          particles.forEach(function (prtcl) {
            ui.display(p, prtcl.pos, prtcl.vel);
            ui.update(p, t, prtcl.pos, prtcl.vel, prtcl.seed);
          });
          t += 0.002;
        };

        const ui = {
          display: function display(p, pos, vel) {
            p.point(pos.x, pos.y);
          },

          update: function update(p, t, pos, vel, seed) {
            const w = p.windowWidth;
            const h = p.windowHeight;

            pos.x = mod((pos.x + vel.x), w);
            pos.y = mod((pos.y + vel.y), h);

            var r = p5.Vector.fromAngle(p.noise(seed, t) * p.TWO_PI);
            vel.x = r.x;
            vel.y = r.y;

            vel.add(flow(p, pos)).mult(3);
          },
        };
      };

      new p5(sketch);
      setIsInit(true);
    }
  }, [isInit]);

  return <div
    className="h-full w-full absolute"
    style={{ zIndex: "-1" }}
    ref={canvasRef}
  ></div>;
};
function mod(x, n) {
  return ((x % n) + n) % n;
};
function flow(p, pos) {
  let r = p.noise(pos.x / 100, pos.y / 100) * p.TWO_PI;
  return p5.Vector.fromAngle(r).mult(2);
};
export default AnimatedBackground;