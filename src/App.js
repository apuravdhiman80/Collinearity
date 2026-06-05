import React, { useState, useEffect, useRef } from 'react';

/* ==================================================
   Helper: 2D Arrow (for Collinearity Demo)
   ================================================== */
const Arrow2D = ({ end, color, label }) => {
  const dx = end.x, dy = end.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const headLen = 8;
  return (
    <g>
      <line x1="0" y1="0" x2={dx} y2={dy} stroke={color} strokeWidth="2.5" />
      <polygon
        points={`0,-4 ${headLen},0 0,4`}
        fill={color}
        transform={`translate(${dx},${dy}) rotate(${angle})`}
      />
      {label && (
        <text x={dx + 6} y={dy - 6} fill={color} fontSize="13" fontWeight="bold">
          {label}
        </text>
      )}
    </g>
  );
};

/* ==================================================
   Helper: 3D Isometric Projection
   ================================================== */
const isoProject = (x, y, z, scale = 50) => {
  const angle = Math.PI / 6;
  const sx = (x - y) * Math.cos(angle) * scale;
  const sy = -(x + y) * Math.sin(angle) * scale - z * scale;
  return { sx, sy };
};

/* ==================================================
   Helper: 3D Arrow (for Coplanarity Demo)
   ================================================== */
const Arrow3D = ({ from, to, color, label, scale = 50 }) => {
  const p1 = isoProject(from.x, from.y, from.z, scale);
  const p2 = isoProject(to.x, to.y, to.z, scale);
  const dx = p2.sx - p1.sx;
  const dy = p2.sy - p1.sy;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const headLen = 8;
  return (
    <g>
      <line x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy} stroke={color} strokeWidth="2.5" />
      <polygon
        points={`0,-4 ${headLen},0 0,4`}
        fill={color}
        transform={`translate(${p2.sx},${p2.sy}) rotate(${angle})`}
      />
      {label && (
        <text x={p2.sx + 6} y={p2.sy - 6} fill={color} fontSize="12" fontWeight="bold">
          {label}
        </text>
      )}
    </g>
  );
};

/* ==================================================
   Helper: Expandable Explanation Box
   ================================================== */
const Expandable = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          padding: '0.6rem 1.5rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
        }}
      >
        {open ? '🔽 Hide' : '▶️'} {title}
      </button>
      {open && (
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '1rem',
            borderRadius: '12px',
            marginTop: '0.5rem',
            lineHeight: 1.8,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/* ==================================================
   MAIN APP COMPONENT
   ================================================== */
function App() {
  // ===== Collinearity state =====
  const [lambda, setLambda] = useState(1.5);
  const [autoPlayCollinear, setAutoPlayCollinear] = useState(false);
  const collinearInterval = useRef(null);

  // Auto‑play for collinearity: oscillate λ between -2 and 2
  useEffect(() => {
    if (autoPlayCollinear) {
      let dir = 1;
      collinearInterval.current = setInterval(() => {
        setLambda(prev => {
          let next = prev + 0.03 * dir;
          if (next >= 2) { dir = -1; return 2; }
          if (next <= -2) { dir = 1; return -2; }
          return next;
        });
      }, 30);
    } else {
      clearInterval(collinearInterval.current);
    }
    return () => clearInterval(collinearInterval.current);
  }, [autoPlayCollinear]);

  const aScreen = { x: 120, y: 60 };
  const bScreen = { x: lambda * 120, y: lambda * 60 };

  // Points collinearity demo
  const [tPoint, setTPoint] = useState(0.7);
  const pointA = { x: 0, y: 0 };
  const pointB = { x: 80, y: 40 };
  const pointC = { x: tPoint * 80, y: tPoint * 40 };
  const AB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
  const AC = { x: pointC.x - pointA.x, y: pointC.y - pointA.y };
  const pointsAreCollinear = Math.abs(AB.x * AC.y - AB.y * AC.x) < 0.001;

  // ===== Coplanarity state =====
  const [cx, setCx] = useState(2.0);
  const [cy, setCy] = useState(1.5);
  const [cz, setCz] = useState(0);
  const [autoPlayCoplanar, setAutoPlayCoplanar] = useState(false);
  const coplanarInterval = useRef(null);

  // Auto‑play for coplanarity: toggle cz between 0 and 1.5
  useEffect(() => {
    if (autoPlayCoplanar) {
      coplanarInterval.current = setInterval(() => {
        setCz(prev => (prev === 0 ? 1.5 : 0));
      }, 2000);
    } else {
      clearInterval(coplanarInterval.current);
    }
    return () => clearInterval(coplanarInterval.current);
  }, [autoPlayCoplanar]);

  const isCoplanar = Math.abs(cz) < 0.001;

  // Points coplanarity demo
  const [dZ, setDZ] = useState(0);
  const pts = {
    A: { x: 0, y: 0, z: 0 },
    B: { x: 2, y: 0, z: 0 },
    C: { x: 0, y: 2, z: 0 },
    D: { x: 1.5, y: 1, z: dZ },
  };
  const AD = { x: pts.D.x - pts.A.x, y: pts.D.y - pts.A.y, z: pts.D.z - pts.A.z };
  const pointsCoplanar = Math.abs(AD.z) < 0.001;

  return (
    <div style={styles.appContainer}>
      {/* Global Styles */}
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #0f0c29; color: #e0e0e0; }
        .card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          margin-bottom: 1.5rem;
          transition: transform 0.3s;
        }
        .card:hover { transform: translateY(-3px); }
        h1, h2, h3, .gradient-text {
          background: linear-gradient(90deg, #c471f5, #fa71cd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #444;
          -webkit-appearance: none;
          outline: none;
          margin: 10px 0;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6a11cb;
          cursor: pointer;
          border: 2px solid white;
        }
        .btn {
          padding: 10px 24px;
          border: none;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.95rem;
        }
        .btn-primary {
          background: linear-gradient(45deg, #6a11cb, #2575fc);
          color: white;
          box-shadow: 0 4px 15px rgba(106,17,203,0.4);
        }
        .btn-primary:hover { transform: translateY(-2px); }
        @keyframes fadeSlide {
          from { opacity:0; transform: translateY(20px); }
          to { opacity:1; transform: translateY(0); }
        }
        .animate-section { animation: fadeSlide 0.8s ease-out; }
        @media (max-width: 768px) {
          .card { padding: 1rem; }
          h1 { font-size: 2rem !important; }
          h2 { font-size: 1.5rem !important; }
          .flex-row { flex-direction: column !important; }
        }
      `}</style>

      {/* ========== HEADER ========== */}
      <header style={{ textAlign: 'center', padding: '2rem 1rem 1rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '0.3rem' }}>
          📐 Vector Collinearity & Coplanarity
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
          Complete CBSE Class 12 Guide — Pure Vector Algebra
        </p>
        <p style={{ color: '#888', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Created by <span style={{ color: '#fa71cd', fontWeight: 600 }}>Apurav</span>
        </p>
      </header>

      {/* ========== COLLINEARITY SECTION ========== */}
      <section className="card animate-section" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2>🔹 Collinearity – “Same Line”</h2>
        <div style={{ marginTop: '1rem', lineHeight: 1.8 }}>
          <p>
            Two non‑zero vectors <b>a</b> and <b>b</b> are said to be <b>collinear</b>
            (or parallel) if they lie along the same line. This happens when one is a scalar multiple of the other.
          </p>
          <div style={{ background: '#1e1e2f', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
            <strong>🧾 Formula:</strong>
            <div style={{ fontSize: '2rem', fontFamily: 'monospace', margin: '0.5rem 0' }}>
              a = λ b
            </div>
            <p>λ ∈ ℝ \ {0} (non‑zero scalar)</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <b>Theorem:</b> Two vectors are collinear <em>iff</em> one is a scalar multiple of the other.
            </p>
          </div>
        </div>

        <Expandable title="Why does this work? (Deep reasoning)">
          <p>
            The set of all scalar multiples of a vector <b>a</b> is a straight line passing through the origin.
            If <b>b</b> can be written as λ·a, then <b>b</b> belongs to that same line.
            This is both a necessary and sufficient condition – no other possibility exists.
          </p>
        </Expandable>

        {/* Interactive Vector Demo */}
        <div className="flex-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="-150 -100 300 200" width="100%" style={{ maxWidth: '300px' }}>
              <line x1="-150" y1="0" x2="150" y2="0" stroke="#444" strokeWidth="1" />
              <line x1="0" y1="-100" x2="0" y2="100" stroke="#444" strokeWidth="1" />
              <Arrow2D end={aScreen} color="#6a11cb" label="a" />
              <Arrow2D end={bScreen} color="#ff6b6b" label="b" />
            </svg>
            <div style={{ width: '100%', marginTop: '1rem' }}>
              <label style={{ fontWeight: 600 }}>λ = {lambda.toFixed(2)}</label>
              <input type="range" className="slider" min="-2" max="2" step="0.01" value={lambda}
                onChange={e => setLambda(parseFloat(e.target.value))} />
            </div>
            <button className="btn btn-primary" onClick={() => setAutoPlayCollinear(!autoPlayCollinear)}
              style={{ marginTop: '0.8rem' }}>
              {autoPlayCollinear ? '⏸️ Stop Auto‑play' : '▶️ Auto‑play (λ oscillates)'}
            </button>
            <p style={{ marginTop: '0.8rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#6a11cb' }}>a = (2, 1)</span> &nbsp; | &nbsp;
              <span style={{ color: '#ff6b6b' }}>b = λ·a</span>
              <br />
              {Math.abs(lambda) > 0.001 ? '✅ b is collinear with a' : 'λ = 0 → zero vector'}
            </p>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <h3>🧠 Feel the concept</h3>
            <ul style={{ lineHeight: 1.8 }}>
              <li>λ &gt; 0 → same direction, different length.</li>
              <li>λ &lt; 0 → opposite direction, but still on the line.</li>
              <li>Auto‑play shows b sliding endlessly along the line.</li>
              <li>This single equation captures all of collinearity.</li>
            </ul>
          </div>
        </div>

        {/* Points Collinearity */}
        <h3 style={{ marginTop: '2rem' }}>📍 Collinearity of Points (A, B, C)</h3>
        <p style={{ lineHeight: 1.8 }}>
          In geometry, we check if three points lie on a line by forming vectors between them.
        </p>
        <div style={{ background: '#1e1e2f', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
          <strong>Condition for points:</strong>
          <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', margin: '0.5rem 0' }}>
            AB = λ · AC
          </div>
          <p>where <b>AB</b> and <b>AC</b> are vectors from point A to B and A to C.</p>
        </div>

        <div className="flex-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="-20 -20 120 80" width="100%" style={{ maxWidth: '300px' }}>
              <line x1="-20" y1="0" x2="100" y2="0" stroke="#444" strokeWidth="1" />
              <line x1="0" y1="-20" x2="0" y2="60" stroke="#444" strokeWidth="1" />
              <circle cx={pointA.x} cy={pointA.y} r="4" fill="#6a11cb" />
              <text x={pointA.x+5} y={pointA.y-5} fill="#6a11cb" fontSize="12">A</text>
              <circle cx={pointB.x} cy={pointB.y} r="4" fill="#2575fc" />
              <text x={pointB.x+5} y={pointB.y-5} fill="#2575fc" fontSize="12">B</text>
              <circle cx={pointC.x} cy={pointC.y} r="4" fill="#ff6b6b" />
              <text x={pointC.x+5} y={pointC.y-5} fill="#ff6b6b" fontSize="12">C</text>
              <line x1={pointA.x} y1={pointA.y} x2={pointB.x*2} y2={pointB.y*2} stroke="#555" strokeWidth="1" strokeDasharray="4" />
            </svg>
            <div style={{ width: '100%', marginTop: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Position of C along AB: t = {tPoint.toFixed(2)}</label>
              <input type="range" className="slider" min="0" max="1.5" step="0.01" value={tPoint}
                onChange={e => setTPoint(parseFloat(e.target.value))} />
            </div>
            <p style={{ marginTop: '0.5rem' }}>
              A(0,0), B(2,1) [scaled], C = t·(2,1)
            </p>
            <p style={{ fontWeight: 'bold', color: pointsAreCollinear ? '#4caf50' : '#ff6b6b' }}>
              {pointsAreCollinear ? '✅ Points are collinear' : '❌ Not collinear'}
            </p>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <Expandable title="Step‑by‑step reasoning">
              <p>
                1. Choose a reference point, e.g., A.<br />
                2. Compute AB = B − A, AC = C − A.<br />
                3. If AB = λ·AC, then A, B, C lie on a straight line.<br />
                In the demo, C slides along the line AB, so the condition is always satisfied.
              </p>
            </Expandable>
          </div>
        </div>

        {/* Worked Example Collinearity */}
        <h3 style={{ marginTop: '2rem' }}>📚 CBSE Example – Collinearity</h3>
        <div style={{ background: '#1e1e2f', padding: '1rem', borderRadius: '12px' }}>
          <p><b>Q:</b> Show that A(1,2,3), B(4,6,8), C(2,4,6) are collinear.</p>
          <p>AB = (3,4,5), AC = (1,2,3)</p>
          <p><b>3 × (1,2,3) = (3,4,5)</b> → AB = 3·AC</p>
          <p style={{ color: '#4caf50', fontWeight: 600 }}>✔ Hence points are collinear.</p>
        </div>
      </section>

      {/* ========== COPLANARITY SECTION ========== */}
      <section className="card animate-section" style={{ maxWidth: '900px', margin: '1.5rem auto' }}>
        <h2>🔸 Coplanarity – “Same Plane”</h2>
        <div style={{ marginTop: '1rem', lineHeight: 1.8 }}>
          <p>
            Three vectors <b>a</b>, <b>b</b>, <b>c</b> are <b>coplanar</b> if they all lie in the same plane.
            This occurs when one vector can be expressed as a <b>linear combination</b> of the other two (provided those two are not collinear).
          </p>
          <div style={{ background: '#1e1e2f', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
            <strong>🧾 Formula:</strong>
            <div style={{ fontSize: '2rem', fontFamily: 'monospace', margin: '0.5rem 0' }}>
              c = x a + y b
            </div>
            <p>x, y ∈ ℝ, and <b>a</b>, <b>b</b> are non‑collinear.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <b>Theorem:</b> Three vectors are coplanar <em>iff</em> one of them can be written as a linear combination of the other two.
            </p>
          </div>
          <Expandable title="Why must a and b be non‑collinear?">
            <p>
              If <b>a</b> and <b>b</b> are parallel, they only span a line, not a plane.
              Then any combination x·a + y·b still lies on that same line, so we can’t represent vectors outside the line.
              Two non‑collinear vectors are needed to generate a full 2D plane.
            </p>
          </Expandable>
        </div>

        {/* Interactive 3D Demo */}
        <h3 style={{ marginTop: '1.5rem' }}>🎮 Live 3D Explorer: c = x·a + y·b</h3>
        <p>
          Here <b>a = (1,0,0)</b> (purple) and <b>b = (0,1,0)</b> (blue) span the XY plane.
          Change the components of <b>c</b>. If <b>c_z = 0</b>, then <b>c</b> lies in the plane → coplanar.
        </p>
        <div className="flex-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="-200 -250 400 350" width="100%" style={{ maxWidth: '400px' }}>
              <Arrow3D from={{x:0,y:0,z:0}} to={{x:3.5,y:0,z:0}} color="#aaa" scale={55} label="x" />
              <Arrow3D from={{x:0,y:0,z:0}} to={{x:0,y:3.5,z:0}} color="#aaa" scale={55} label="y" />
              <Arrow3D from={{x:0,y:0,z:0}} to={{x:0,y:0,z:3.5}} color="#aaa" scale={55} label="z" />
              <Arrow3D from={{x:0,y:0,z:0}} to={{x:2.5,y:0,z:0}} color="#6a11cb" scale={55} label="a" />
              <Arrow3D from={{x:0,y:0,z:0}} to={{x:0,y:2.5,z:0}} color="#2575fc" scale={55} label="b" />
              <polygon
                points={`${isoProject(2.5,0,0,55).sx},${isoProject(2.5,0,0,55).sy}
                         ${isoProject(0,2.5,0,55).sx},${isoProject(0,2.5,0,55).sy}
                         ${isoProject(2.5,2.5,0,55).sx},${isoProject(2.5,2.5,0,55).sy}`}
                fill="rgba(106,17,203,0.15)" stroke="#6a11cb" strokeWidth="1" strokeDasharray="4"
              />
              <Arrow3D from={{x:0,y:0,z:0}} to={{x:cx, y:cy, z:cz}} color="#ff6b6b" scale={55} label="c" />
              {cz !== 0 && (
                <>
                  <Arrow3D from={{x:0,y:0,z:0}} to={{x:cx, y:cy, z:0}} color="#ffaa00" scale={55} label="proj" />
                  <line
                    x1={isoProject(cx,cy,0,55).sx} y1={isoProject(cx,cy,0,55).sy}
                    x2={isoProject(cx,cy,cz,55).sx} y2={isoProject(cx,cy,cz,55).sy}
                    stroke="#ffaa00" strokeWidth="1.5" strokeDasharray="5"
                  />
                </>
              )}
            </svg>
            <div style={{ width: '100%', marginTop: '0.5rem' }}>
              <div><label>c_x = {cx.toFixed(1)}</label>
                <input type="range" className="slider" min="0" max="3" step="0.1" value={cx}
                  onChange={e => setCx(parseFloat(e.target.value))} />
              </div>
              <div><label>c_y = {cy.toFixed(1)}</label>
                <input type="range" className="slider" min="0" max="3" step="0.1" value={cy}
                  onChange={e => setCy(parseFloat(e.target.value))} />
              </div>
              <div><label>c_z = {cz.toFixed(1)}</label>
                <input type="range" className="slider" min="-2" max="2" step="0.1" value={cz}
                  onChange={e => setCz(parseFloat(e.target.value))} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setAutoPlayCoplanar(!autoPlayCoplanar)}
              style={{ marginTop: '0.8rem' }}>
              {autoPlayCoplanar ? '⏸️ Stop Auto‑play' : '▶️ Auto‑play (z cycles 0 ↔ 1.5)'}
            </button>
            <div style={{ marginTop: '0.8rem', fontWeight: 'bold', fontSize: '1.1rem',
                          color: isCoplanar ? '#4caf50' : '#ff6b6b' }}>
              {isCoplanar ? '✅ Coplanar! c = x·a + y·b (z = 0)' : '❌ Not Coplanar – c has a z‑component'}
            </div>
            <p style={{ fontSize: '0.85rem' }}>c = {cx.toFixed(1)}·a + {cy.toFixed(1)}·b + {cz.toFixed(1)}·k</p>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <h3>🧠 How to feel it</h3>
            <ul style={{ lineHeight: 1.8 }}>
              <li>When <b>c_z = 0</b>, c lies flat in the XY plane.</li>
              <li>Any non‑zero <b>c_z</b> lifts c out of the plane.</li>
              <li>The orange <b>projection</b> shows the part of c inside the plane; the dashed line is the “outside” part.</li>
              <li>Auto‑play makes c jump in and out of the plane.</li>
            </ul>
            <Expandable title="Why c_z = 0 is the coplanarity condition">
              <p>
                Since a and b have zero z‑component, any linear combination x·a + y·b also has z = 0.
                If c has z ≠ 0, no values of x, y can make x·a + y·b equal to c.
                Therefore, z = 0 is both necessary and sufficient for coplanarity in this setup.
              </p>
            </Expandable>
          </div>
        </div>

        {/* Points Coplanarity */}
        <h3 style={{ marginTop: '2rem' }}>📍 Coplanarity of Four Points (A, B, C, D)</h3>
        <p style={{ lineHeight: 1.8 }}>
          Four points are coplanar if the vectors <b>AB</b>, <b>AC</b>, <b>AD</b> are coplanar.
        </p>
        <div style={{ background: '#1e1e2f', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
          <strong>Condition for points:</strong>
          <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', margin: '0.5rem 0' }}>
            AD = x·AB + y·AC
          </div>
        </div>
        <div className="flex-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="-200 -250 400 350" width="100%" style={{ maxWidth: '400px' }}>
              <Arrow3D from={{x:0,y:0,z:0}} to={{x:3,y:0,z:0}} color="#aaa" scale={55} label="x" />
              <Arrow3D from={{x:0,y:0,z:0}} to={{x:0,y:3,z:0}} color="#aaa" scale={55} label="y" />
              <Arrow3D from={{x:0,y:0,z:0}} to={{x:0,y:0,z:3}} color="#aaa" scale={55} label="z" />
              {Object.entries(pts).map(([label, pt]) => {
                const proj = isoProject(pt.x, pt.y, pt.z, 55);
                return (
                  <g key={label}>
                    <circle cx={proj.sx} cy={proj.sy} r="5" fill={label==='D'?'#ff6b6b':'#6a11cb'} />
                    <text x={proj.sx+6} y={proj.sy-6} fill={label==='D'?'#ff6b6b':'#6a11cb'} fontSize="12" fontWeight="bold">{label}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{ width: '100%', marginTop: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>D z‑coordinate = {dZ.toFixed(1)}</label>
              <input type="range" className="slider" min="-1.5" max="1.5" step="0.1" value={dZ}
                onChange={e => setDZ(parseFloat(e.target.value))} />
            </div>
            <p style={{ marginTop: '0.5rem' }}>
              A(0,0,0), B(2,0,0), C(0,2,0), D(1.5, 1, {dZ.toFixed(1)})
            </p>
            <p style={{ fontWeight: 'bold', color: pointsCoplanar ? '#4caf50' : '#ff6b6b' }}>
              {pointsCoplanar ? '✅ Points are coplanar' : '❌ Not coplanar'}
            </p>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <Expandable title="Step‑by‑step reasoning">
              <p>
                1. Choose a reference point, e.g., A.<br />
                2. Form vectors AB, AC, AD.<br />
                3. Try to write AD = x·AB + y·AC.<br />
                Here AB = (1,0,0), AC = (0,1,0), so AD must have z = 0 to be in the plane.
              </p>
            </Expandable>
          </div>
        </div>

        {/* Worked Example Coplanarity */}
        <h3 style={{ marginTop: '2rem' }}>📚 CBSE Example – Coplanarity</h3>
        <div style={{ background: '#1e1e2f', padding: '1rem', borderRadius: '12px' }}>
          <p><b>Q:</b> Check if A(1,0,2), B(3,1,4), C(2,2,6), D(1,5,7) are coplanar.</p>
          <p>AB = (2,1,2), AC = (1,2,4), AD = (0,5,5)</p>
          <p>Try AD = x·AB + y·AC:</p>
          <p>From x‑coord: 0 = 2x + y → y = -2x</p>
          <p>From y‑coord: 5 = x + 2y → 5 = x -4x → x = -5/3, y = 10/3</p>
          <p>Check z: (-5/3)*2 + (10/3)*4 = 30/3 = 10 ≠ 5</p>
          <p style={{ color: '#ff6b6b', fontWeight: 600 }}>✘ Inconsistent → points are <b>not coplanar</b>.</p>
        </div>
        <Expandable title="What if the numbers had worked?">
          <p>
            If the z‑coordinate had also matched, we would have found x, y satisfying all three equations,
            proving the vectors are coplanar and the points lie in the same plane.
          </p>
        </Expandable>
      </section>

      {/* ========== KEY FORMULAS SUMMARY ========== */}
      <section className="card animate-section" style={{ maxWidth: '900px', margin: '1.5rem auto', textAlign: 'center' }}>
        <h2>🧠 Formulas at a Glance (CBSE)</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ background: '#1e1e2f', padding: '1.5rem', borderRadius: '16px', minWidth: '200px' }}>
            <span style={{ fontSize: '2rem', fontFamily: 'monospace' }}>a = λ b</span>
            <p style={{ marginTop: '0.5rem' }}>Collinearity</p>
            <p style={{ fontSize: '0.8rem', color: '#aaa' }}>λ ∈ ℝ \ {0}</p>
          </div>
          <div style={{ background: '#1e1e2f', padding: '1.5rem', borderRadius: '16px', minWidth: '200px' }}>
            <span style={{ fontSize: '2rem', fontFamily: 'monospace' }}>c = x a + y b</span>
            <p style={{ marginTop: '0.5rem' }}>Coplanarity</p>
            <p style={{ fontSize: '0.8rem', color: '#aaa' }}>a, b non‑collinear</p>
          </div>
        </div>
        <p style={{ marginTop: '1.5rem', color: '#aaa', fontStyle: 'italic' }}>
          “Collinearity is scaling; Coplanarity is combining. No dot or cross products — just pure vector algebra.”
        </p>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem 1rem', color: '#666', fontSize: '0.9rem' }}>
        <p>Made with ❤️ for Class 12 CBSE Students</p>
        <p style={{ marginTop: '0.3rem' }}>
          Created by <span style={{ color: '#fa71cd', fontWeight: 600 }}>Apurav</span>
        </p>
      </footer>
    </div>
  );
}

/* ==================================================
   Inline Styles
   ================================================== */
const styles = {
  appContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 1rem 2rem',
    color: '#e0e0e0',
  },
};

export default App;
