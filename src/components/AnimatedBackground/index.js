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
  // p.fill(0);
  // p.square(pos.x-10, pos.y-10, 0.1);
  // p.noFill();
  p.point(pos.x, pos.y);
  // p.line(pos.x, pos.y, pos.x + vel.x, pos.y + vel.y);
}

function update(p, t, pos, vel, seed, w, h) {

  pos.x = mod((pos.x + 10 + vel.x), w + 20) - 10;
  pos.y = mod((pos.y + 10 + vel.y), h + 20) - 10;

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
      // number of particles based on screen size
      let n = Math.floor(Math.sqrt(w * h));
      console.log(n);
      let step = 0.0001;
      let particles = [];
      let last, current;
      p.setup = function () {
        p.createCanvas(w, h);
        p.stroke(0, 87, 146, 30);
        // p.stroke(0, 30);
        for (var i = 0; i < n; i++) {
          particles.push({
            pos: p.createVector(p.random(w), p.random(h)),
            vel: p.createVector(0, 0),
            seed: i,
          });
        }
      };

      p.draw = function () {
        last = p.get();
        p.clear();
        p.background(255, 0);
        particles.forEach(function (prtcl) {
          display(p, prtcl.pos, prtcl.vel);
          update(p, t, prtcl.pos, prtcl.vel, prtcl.seed, w, h);
        });
        current = p.get();
        p.background(255, 0);
        if (last) {
          p.image(last, 0, 0);
        }
        p.image(current, 0, 0);
        t += step;
        if (Math.floor((t/(100*step))*100) % 300 === 0) {
          p.noiseSeed(p.random(100000));
          t = 0;
        }
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
      className="bg-gray-100 absolute h-full w-full -z-50"
      ref={this.canvasRef}
    />;
  }
}

export default AnimatedBackground;