import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbState } from '@/types';

const STATE_COLOR: Record<OrbState, string> = {
  idle: '#4ADE9E',
  listening: '#4ADE9E',
  thinking: '#8FE8C4',
  speaking: '#4ADE9E',
  alert: '#FF8B6B',
};

const STATE_SPEED: Record<OrbState, number> = {
  idle: 0.35,
  listening: 0.55,
  thinking: 1.4,
  speaking: 0.9,
  alert: 1.9,
};

/**
 * Wireframe icosphere core: the "vital" — breathes at rest, quickens when
 * the AI is thinking, flares coral on urgent/alert states.
 */
function OrbCore({ orbState }: { orbState: OrbState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const materialColor = useMemo(() => new THREE.Color(STATE_COLOR[orbState]), [orbState]);
  const targetColor = useRef(new THREE.Color(STATE_COLOR[orbState]));

  useFrame((frameState) => {
    const t = frameState.clock.getElapsedTime();
    const speed = STATE_SPEED[orbState];
    const breathe = 1 + Math.sin(t * speed) * (orbState === 'thinking' ? 0.09 : 0.06);

    if (meshRef.current) {
      meshRef.current.scale.setScalar(breathe);
      meshRef.current.rotation.y = t * 0.12 * speed;
      meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.15;

      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      targetColor.current.set(STATE_COLOR[orbState]);
      mat.color.lerp(targetColor.current, 0.05);
    }
    if (innerRef.current) {
      innerRef.current.scale.setScalar(breathe * 0.62);
      innerRef.current.rotation.y = -t * 0.18 * speed;
      innerRef.current.rotation.z = t * 0.08 * speed;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 2]} />
        <meshBasicMaterial color={materialColor} wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color={materialColor} wireframe transparent opacity={0.35} />
      </mesh>
      {/* Solid glow core */}
      <mesh>
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshBasicMaterial color={materialColor} transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/** Ambient particles orbiting the core, like data points / vitals in motion. */
function ParticleField({ orbState }: { orbState: OrbState }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 260;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 1.9 + Math.random() * 1.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((frameState) => {
    if (!pointsRef.current) return;
    const t = frameState.clock.getElapsedTime();
    const speed = STATE_SPEED[orbState];
    pointsRef.current.rotation.y = t * 0.05 * speed;
    pointsRef.current.rotation.x = Math.sin(t * 0.03) * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color={STATE_COLOR[orbState]}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

function Scene({ orbState }: { orbState: OrbState }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <OrbCore orbState={orbState} />
      <ParticleField orbState={orbState} />
    </>
  );
}

interface AiraOrbProps {
  state?: OrbState;
  className?: string;
  size?: number;
}

/**
 * The Aira Orb — signature visual identity of the AI copilot.
 * Renders a breathing wireframe icosphere with an orbiting particle field.
 * Reacts to `state`: idle (breathing), listening, thinking (faster pulse,
 * lighter mint), speaking, alert (coral — urgent triage).
 */
export default function AiraOrb({ state = 'idle', className, size = 420 }: AiraOrbProps) {
  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Aira AI status: ${state}`}
    >
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene orbState={state} />
      </Canvas>
    </div>
  );
}
