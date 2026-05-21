import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Dodecahedron({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.x = clock.elapsedTime * 0.1 + mouse.y * 0.15;
    ref.current.rotation.y = clock.elapsedTime * 0.16 + mouse.x * 0.15;
    ref.current.rotation.z = clock.elapsedTime * 0.05;
  });
  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[1.8]} />
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
}

export function AmbientMesh({ color = '#b8291f' }: { color?: string }) {
  return (
    <Canvas
      style={{ position: 'absolute', right: 0, top: 0, width: '45%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.15 }}
      camera={{ position: [0, 0, 5], fov: 42 }}
      dpr={[1, 1.5]}
    >
      <Dodecahedron color={color} />
    </Canvas>
  );
}
