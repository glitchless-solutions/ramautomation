'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HeroScene.module.css';

/**
 * Hero visual: interactive 3D assembly (three.js, loaded only in the browser)
 * over a static CAD line drawing. The drawing is pre-rendered into the HTML, so
 * it shows instantly, without JS, and if WebGL is unavailable.
 */
export default function HeroScene({ visual }) {
  const mountRef = useRef(null);
  const spotRefs = useRef({});
  const lastPoints = useRef({});
  const [live, setLive] = useState(false);
  const { label, alt, tags = {}, hint, hotspots = [] } = visual;

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let cleanup;
    let cancelled = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    Promise.all([import('three'), import('@/lib/assemblyScene')])
      .then(([THREE, { mountAssemblyScene }]) => {
        if (cancelled) return;
        cleanup = mountAssemblyScene(THREE, el, {
          reducedMotion,
          // Pin each hotspot link to its part of the model. Direct style writes,
          // no React state, so this costs nothing per frame.
          onProject(points) {
            lastPoints.current = points;
            for (const [part, node] of Object.entries(spotRefs.current)) placeSpot(node, points[part]);
          },
        });
        setLive(true);
      })
      .catch(() => {
        /* no WebGL or chunk failed to load: keep the line drawing */
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className={styles.frame}>
      <div role="img" aria-label={alt} className={styles.art}>
        <FallbackDrawing className={`${styles.fallback} ${live ? styles.hidden : ''}`} />
        <div ref={mountRef} className={`${styles.canvas} ${live ? styles.grab : ''}`} />
      </div>

      {label && (
        <div className={`${styles.tag} ${styles.tl}`} aria-hidden="true">
          {label}
        </div>
      )}
      {tags.topRight && (
        <div className={`${styles.tag} ${styles.tr}`} aria-hidden="true">
          {tags.topRight}
        </div>
      )}

      {live && hotspots.length > 0 && (
        <ul className={styles.spots} aria-label="Explore the assembly">
          {hotspots.map((h) => {
            const external = /^https?:\/\//.test(h.href);
            return (
              <li key={h.part} ref={(n) => {
                  spotRefs.current[h.part] = n;
                  placeSpot(n, lastPoints.current[h.part]);
                }} className={`${styles.spot} ${h.side === 'left' ? styles.spotLeft : ''}`}>
                <a href={h.href} {...(external ? { rel: 'noopener', target: '_blank' } : {})}>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.spotLabel}>{h.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {live && hint && (
        <div className={`${styles.tag} ${styles.bl}`} aria-hidden="true">
          <RotateIcon />
          {hint}
        </div>
      )}
      {tags.bottomRight && (
        <div className={styles.br} aria-hidden="true">
          {tags.bottomRight}
        </div>
      )}
    </div>
  );
}

/** Move a hotspot <li> to its projected screen point (or hide it behind the camera). */
function placeSpot(node, p) {
  if (!node || !p) return;
  node.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
  node.style.visibility = p.visible ? 'visible' : 'hidden';
}

function RotateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 3v4h-4M6 21v-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Static vector version of the 3D scene (from the client mockup). */
function FallbackDrawing({ className }) {
  const mono = { fontFamily: 'var(--mono)' };
  return (
    <svg className={className} viewBox="0 0 600 460" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      {/* floor */}
      <line x1="40" x2="560" y1="400" y2="400" stroke="#4F5D75" strokeDasharray="4 4" strokeWidth="1.5" />
      <line x1="40" x2="560" y1="418" y2="418" stroke="#4F5D75" strokeOpacity="0.4" />
      <rect x="70" y="385" width="460" height="15" fill="#252937" stroke="#BFC0C0" strokeWidth="1.2" />
      {/* raceway */}
      <rect x="225" y="368" width="80" height="17" fill="#1F232F" stroke="#4F5D75" strokeWidth="1.2" />
      <line x1="235" x2="295" y1="376" y2="376" stroke="#BFC0C0" strokeDasharray="2 2" />
      <text x="265" y="360" fill="#BFC0C0" fontSize="9" letterSpacing="0.1em" textAnchor="middle" style={mono}>
        WIRE RACEWAY
      </text>
      {/* cabinet */}
      <rect x="90" y="120" width="135" height="265" fill="#252937" stroke="#BFC0C0" strokeWidth="1.5" />
      <rect x="96" y="126" width="123" height="253" fill="#1F232F" stroke="#4F5D75" />
      <rect x="110" y="165" width="70" height="46" fill="#161922" stroke="#BFC0C0" strokeWidth="1.2" />
      <rect x="115" y="170" width="60" height="36" fill="#252937" stroke="#4F5D75" strokeWidth="0.8" />
      <text x="145" y="192" fill="#F47E1F" fontSize="8" textAnchor="middle" style={mono}>
        HMI
      </text>
      <circle cx="195" cy="180" r="8" fill="#F47E1F" stroke="#FFFFFF" />
      <circle cx="195" cy="205" r="4.5" fill="#BFC0C0" stroke="#4F5D75" strokeWidth="0.8" />
      <line x1="110" x2="205" y1="230" y2="230" stroke="#4F5D75" />
      <line x1="110" x2="205" y1="240" y2="240" stroke="#4F5D75" />
      <line x1="110" x2="205" y1="250" y2="250" stroke="#4F5D75" />
      <rect x="210" y="220" width="4" height="28" fill="#BFC0C0" />
      <text x="157" y="145" fill="#FFFFFF" fontSize="9" fontWeight="600" textAnchor="middle" style={mono}>
        UL 508A ENCLOSURE
      </text>
      <text x="157" y="360" fill="#BFC0C0" fontSize="8" textAnchor="middle" style={mono}>
        MODCENTER MACHINED
      </text>
      {/* robot */}
      <ellipse cx="360" cy="385" rx="45" ry="12" fill="#252937" stroke="#BFC0C0" strokeWidth="1.5" />
      <rect x="325" y="340" width="70" height="42" rx="4" fill="#3E4554" stroke="#4F5D75" strokeWidth="1.2" />
      <line x1="325" x2="395" y1="360" y2="360" stroke="#F47E1F" strokeWidth="2" />
      <circle cx="360" cy="325" r="22" fill="#1F232F" stroke="#BFC0C0" strokeWidth="1.5" />
      <circle cx="360" cy="325" r="8" fill="#F47E1F" />
      <line x1="360" x2="415" y1="325" y2="210" stroke="#3E4554" strokeLinecap="round" strokeWidth="18" />
      <line x1="360" x2="415" y1="325" y2="210" stroke="#BFC0C0" strokeLinecap="round" strokeWidth="3" />
      <line x1="375" x2="405" y1="290" y2="230" stroke="#F47E1F" strokeWidth="3" />
      <circle cx="415" cy="210" r="16" fill="#1F232F" stroke="#BFC0C0" strokeWidth="1.5" />
      <circle cx="415" cy="210" r="6" fill="#BFC0C0" />
      <line x1="415" x2="470" y1="210" y2="155" stroke="#3E4554" strokeLinecap="round" strokeWidth="14" />
      <line x1="415" x2="470" y1="210" y2="155" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2" />
      <circle cx="470" cy="155" r="11" fill="#1F232F" stroke="#F47E1F" strokeWidth="1.5" />
      <polygon points="470,166 462,190 478,190" fill="#BFC0C0" stroke="#4F5D75" />
      <line x1="470" x2="470" y1="190" y2="300" stroke="#F47E1F" strokeDasharray="3 3" strokeWidth="1.5" />
      <text x="435" y="125" fill="#FFFFFF" fontSize="9" fontWeight="600" textAnchor="middle" style={mono}>
        6-AXIS ROBOT CELL
      </text>
      {/* fixture */}
      <rect x="435" y="335" width="70" height="50" fill="#1F232F" stroke="#4F5D75" strokeWidth="1.2" />
      <rect x="448" y="300" width="44" height="35" fill="#3E4554" stroke="#BFC0C0" strokeWidth="1.2" />
      <ellipse cx="470" cy="300" rx="22" ry="7" fill="#161922" stroke="#F47E1F" />
      <circle cx="470" cy="300" r="2" fill="#F47E1F" />
      <text x="470" y="420" fill="#BFC0C0" fontSize="8.5" textAnchor="middle" style={mono}>
        MACHINED PART FIXTURE
      </text>
    </svg>
  );
}
