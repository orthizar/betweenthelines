import React, { Component } from "react";
import p5 from "p5";

function mod(x, n) {
  return ((x % n) + n) % n;
};

function flow(p, pos) {
  let r = p.noise(pos.x / 100, pos.y / 100) * p.TWO_PI;
  return p5.Vector.fromAngle(r).mult(2);
}

function display(p, pos, vel) {
  p.point(pos.x, pos.y);
}

function update(p, t, pos, vel, seed, w, h) {

  pos.x = mod((pos.x + vel.x), w);
  pos.y = mod((pos.y + vel.y), h);

  var r = p5.Vector.fromAngle(p.noise(seed, t) * p.TWO_PI);
  vel.x = r.x;
  vel.y = r.y;

  vel.add(flow(p, pos)).mult(3);
}

class AnimatedBackground extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }


  componentDidMount() {
    const sketch = (p) => {
      const w = this.canvasRef.current.offsetWidth;
      const h = this.canvasRef.current.offsetHeight;
      let t = 0;
      let n = 10000;
      let particles = [];
      p.setup = function () {
        p.createCanvas(w, h);
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
          display(p, prtcl.pos, prtcl.vel);
          update(p, t, prtcl.pos, prtcl.vel, prtcl.seed, w, h);
        });
        t += 0.01;
      };
    };
    this.p5 = new p5(sketch, this.canvasRef.current);
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount() {
    this.p5.remove();
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    const canvas = this.canvasRef.current;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    this.p5.resizeCanvas(width, height);
  };

  render() {
    return <div
      className="absolute h-full w-full -z-50"
      ref={this.canvasRef}
    />;
  }
}

export default AnimatedBackground;