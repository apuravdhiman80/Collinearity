import React, { useState, useEffect, useRef } from 'react';

/* ==================================================
   Small 2D arrow component for SVG
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
   Expandable explanation box
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
   MAIN APP
   ================================================== */
function App() {
  // Collinearity: b = λ * a
  const [lambda, setLambda] = useState(1.5);
  const [autoPlay, setAutoPlay] = useState(false);
  const intervalRef = useRef(null);

  // Auto‑play: animate λ between -2 and 2 smoothly
  useEffect(() => {
    if (autoPlay) {
      let dir = 1;
      intervalRef.current = setInterval(() => {
        setLambda(prev => {
          let next = prev + 0.03 * dir;
          if (next >= 2) { dir = -1; return 2; }
          if (next <= -2) { dir = 1; return -2; }
          return next;
        });
      }, 30);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoPlay]);

  // Fixed vector a = (2, 1) (screen coords: x = 120, y = 60 for visibility)
  const aScreen = { x: 120, y: 60 };
  const bScreen = { x: lambda * 120, y: lambda * 60 };

  // Points demonstration: A(0,0), B(2,1), C( ? )
  const [tPoint, setTPoint] = useState(0.7); // t for point C
  const pointA = { x: 0, y: 0 };
  const pointB = { x: 80, y: 40 }; // scaled AB = (2,1) scaled down
  const pointC = { x: tPoint * 80, y: tPoint * 40 };

  // Collinearity condition for points: AB and AC must be collinear
  const AB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
  const AC = { x: pointC.x - pointA.x, y: pointC.y - pointA.y };
  const pointsAreCollinear = Math.abs(AB.x * AC.y - AB.y * AC.x) < 0.001; // cross product ~ 0

  return (
    <div style={styles.appContainer}>
      {/* Global styles */}
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

      {/* Header */}
      <header style={{ textAlign: 'center', padding: '2rem 1rem 1rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '0.3rem' }}>
          📏 Collinearity of Vectors
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
          When two vectors lie on the same straight line — the heart of parallelism
        </p>
        <p style={{ color: '#888', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Created by <span style={{ color: '#fa71cd', fontWeight: 600 }}>Apurav</span>
        </p>
      </header>

      {/* ---- What is Collinearity? ---- */}
      <div className="card animate-section" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2>🔹 What is Collinearity?</h2>
        <p style={{ marginTop: '0.5rem', lineHeight: 1.8 }}>
          Two non‑zero vectors <b>a</b> and <b>b</b> are <b>collinear</b> (or parallel) if they point along the same line.
          That means one is just a “scaled” version of the other — same direction, different length (or opposite if the scalar is negative).
        </p>
        <div style={{ background: '#1e1e2f', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
          <strong>🔑 The Golden Formula:</strong>
          <div style={{ fontSize: '2rem', fontFamily: 'monospace', margin: '0.5rem 0' }}>
            <span style={{ color: '#6a11cb' }}>a</span> = λ <span style={{ color: '#ff6b6b' }}>b</span>
          </div>
          <p>where <b>λ</b> is any real number except zero (λ ∈ ℝ\{0}).</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            This single equation captures the entire idea of collinearity. No fancy products, just scaling.
          </p>
        </div>
        <Expandable title="Why λ must be non‑zero?">
          <p>
            If λ = 0, then <b>a</b> = 0, which is the zero vector. The zero vector is technically collinear with every vector (it lies along any line), but we usually consider non‑zero vectors for meaningful geometry.
            For practical purposes, we say two <b>non‑zero</b> vectors are collinear if one is a <b>non‑zero scalar multiple</b> of the other.
          </p>
        </Expandable>
      </div>

      {/* ---- Interactive Demo 1: Vector b = λa ---- */}
      <div className="card animate-section" style={{ maxWidth: '900px', margin: '1.5rem auto' }}>
        <h2>🎮 Live Demo: b = λ·a</h2>
        <div className="flex-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="-150 -100 300 200" width="100%" style={{ maxWidth: '300px' }}>
              {/* Axes */}
              <line x1="-150" y1="0" x2="150" y2="0" stroke="#444" strokeWidth="1" />
              <line x1="0" y1="-100" x2="0" y2="100" stroke="#444" strokeWidth="1" />
              {/* Fixed a */}
              <Arrow2D end={aScreen} color="#6a11cb" label="a" />
              {/* Dynamic b = λa */}
              <Arrow2D end={bScreen} color="#ff6b6b" label="b" />
            </svg>
            <div style={{ width: '100%', marginTop: '1rem' }}>
              <label style={{ fontWeight: 600 }}>λ = {lambda.toFixed(2)}</label>
              <input
                type="range"
                className="slider"
                min="-2"
                max="2"
                step="0.01"
                value={lambda}
                onChange={e => setLambda(parseFloat(e.target.value))}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setAutoPlay(!autoPlay)}
              style={{ marginTop: '0.8rem' }}
            >
              {autoPlay ? '⏸️ Stop Auto‑play' : '▶️ Auto‑play (λ oscillates)'}
            </button>
            <p style={{ marginTop: '0.8rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#6a11cb' }}>a = (2, 1)</span> &nbsp; | &nbsp;
              <span style={{ color: '#ff6b6b' }}>b = λ·a</span>
              <br />
              {Math.abs(lambda) > 0.001
                ? '✅ b is collinear with a'
                : 'λ = 0 → b is zero vector (trivial collinearity)'}
            </p>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <h3>🧠 How to feel it</h3>
            <ul style={{ lineHeight: 1.8 }}>
              <li>Move the slider → <b>b</b> stretches or shrinks along the same line.</li>
              <li>When λ is <b>positive</b> → same direction.</li>
              <li>When λ is <b>negative</b> → opposite direction, <em>but still on the same line!</em></li>
              <li>Hit <b>Auto‑play</b> to see b oscillate smoothly — it never leaves the line.</li>
            </ul>
            <Expandable title="Why does this prove collinearity?">
              <p>
                The line containing vector <b>a</b> is the set of all scalar multiples of <b>a</b> (i.e., { `t·a | t ∈ ℝ` }).
                If <b>b</b> equals λ·a, then <b>b</b> belongs to that set — so it lies on exactly the same line.
                That's why the condition “one is a scalar multiple of the other” is both necessary and sufficient.
              </p>
            </Expandable>
          </div>
        </div>
      </div>

      {/* ---- Collinearity of Points ---- */}
      <div className="card animate-section" style={{ maxWidth: '900px', margin: '1.5rem auto' }}>
        <h2>📍 Collinearity of Points (A, B, C)</h2>
        <p style={{ marginTop: '0.5rem', lineHeight: 1.8 }}>
          In geometry, we often check if three points lie on a straight line.
          The trick: Form vectors between them and check if they are collinear.
        </p>
        <div style={{ background: '#1e1e2f', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
          <strong>Condition for Points:</strong>
          <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', margin: '0.5rem 0' }}>
            AB = λ · AC
          </div>
          <p>Where <b>AB</b> and <b>AC</b> are vectors from point A to B and A to C.</p>
        </div>
        <div className="flex-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          {/* Point demo SVG */}
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg viewBox="-20 -20 120 80" width="100%" style={{ maxWidth: '300px' }}>
              {/* Axes */}
              <line x1="-20" y1="0" x2="100" y2="0" stroke="#444" strokeWidth="1" />
              <line x1="0" y1="-20" x2="0" y2="60" stroke="#444" strokeWidth="1" />
              {/* Points */}
              <circle cx={pointA.x} cy={pointA.y} r="4" fill="#6a11cb" />
              <text x={pointA.x + 5} y={pointA.y - 5} fill="#6a11cb" fontSize="12">A</text>
              <circle cx={pointB.x} cy={pointB.y} r="4" fill="#2575fc" />
              <text x={pointB.x + 5} y={pointB.y - 5} fill="#2575fc" fontSize="12">B</text>
              <circle cx={pointC.x} cy={pointC.y} r="4" fill="#ff6b6b" />
              <text x={pointC.x + 5} y={pointC.y - 5} fill="#ff6b6b" fontSize="12">C</text>
              {/* Line AB (dashed) */}
              <line x1={pointA.x} y1={pointA.y} x2={pointB.x*2} y2={pointB.y*2} stroke="#555" strokeWidth="1" strokeDasharray="4" />
            </svg>
            <div style={{ width: '100%', marginTop: '0.5rem' }}>
              <label style={{ fontWeight: 600 }}>Position of C along AB: t = {tPoint.toFixed(2)}</label>
              <input
                type="range"
                className="slider"
                min="0"
                max="1.5"
                step="0.01"
                value={tPoint}
                onChange={e => setTPoint(parseFloat(e.target.value))}
              />
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              A(0,0), B(2,1) [scaled], C = t·(2,1)
            </p>
            <p style={{ fontWeight: 'bold', color: pointsAreCollinear ? '#4caf50' : '#ff6b6b' }}>
              {pointsAreCollinear ? '✅ Points are collinear (C lies on line AB)' : '❌ Not collinear (should not happen with this setup!)'}
            </p>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <Expandable title="Step‑by‑step reasoning">
              <p>
                1. Pick a reference point, say A.<br />
                2. Compute vectors <b>AB</b> = B − A and <b>AC</b> = C − A.<br />
                3. If <b>AB</b> and <b>AC</b> are collinear (i.e., AB = λ·AC), then A, B, C lie on the same line.
              </p>
              <p style={{ marginTop: '0.5rem' }}>
                In the demo, C is defined as C = A + t·(AB), so it's automatically on the line.
                You can move the slider to change <b>t</b> — C slides along the line, proving collinearity.
              </p>
            </Expandable>
          </div>
        </div>
      </div>

      {/* ---- CBSE‑Style Example ---- */}
      <div className="card animate-section" style={{ maxWidth: '900px', margin: '1.5rem auto' }}>
        <h2>📚 CBSE Board Example</h2>
        <p style={{ marginTop: '0.5rem' }}>
          <b>Q:</b> Show that points A(1, 2, 3), B(4, 6, 8), C(2, 4, 6) are collinear.
        </p>
        <div style={{ background: '#1e1e2f', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
          <p>AB = (4−1, 6−2, 8−3) = (3, 4, 5)</p>
          <p>AC = (2−1, 4−2, 6−3) = (1, 2, 3)</p>
          <p>Observe: <b>3 × (1, 2, 3) = (3, 4, 5)</b> → AB = 3·AC</p>
          <p style={{ color: '#4caf50', fontWeight: 600, marginTop: '0.5rem' }}>
            ✔ Since AB is a scalar multiple of AC, the points are collinear.
          </p>
        </div>
        <Expandable title="Why this works in 3D as well?">
          <p>
            The concept is identical in 3D. Vectors AB and AC being collinear means they lie along the same line in space. No dot or cross product is required — the scalar multiple condition is sufficient.
          </p>
        </Expandable>
      </div>

      {/* ---- Key Formula Recap ---- */}
      <div className="card animate-section" style={{ maxWidth: '900px', margin: '1.5rem auto', textAlign: 'center' }}>
        <h2>🧠 The One Formula to Remember</h2>
        <div
          style={{
            background: '#1e1e2f',
            padding: '2rem',
            borderRadius: '20px',
            display: 'inline-block',
            marginTop: '1rem',
          }}
        >
          <span style={{ fontSize: '2.5rem', fontFamily: 'monospace' }}>
            a = λ b
          </span>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
            λ ∈ ℝ \ {0} &nbsp; (for non‑zero vectors)
          </p>
        </div>
        <p style={{ marginTop: '1.5rem', color: '#aaa', fontStyle: 'italic' }}>
          “Collinearity is just scaling — keep it simple, keep it straight.”
        </p>
      </div>

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
