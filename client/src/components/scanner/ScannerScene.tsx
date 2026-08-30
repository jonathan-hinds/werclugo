import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import { useRef } from 'react';
import type { Mesh } from 'three';

function SignalForm({ jig = false, position }: { jig?: boolean; position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => { if (ref.current) { ref.current.rotation.y += delta * (jig ? 1.8 : .8); ref.current.rotation.x = Math.sin(state.clock.elapsedTime) * .22; } });
  return <Float speed={jig ? 4 : 2} rotationIntensity={.7} floatIntensity={1.5}><mesh ref={ref} position={position}>
    {jig ? <octahedronGeometry args={[.5, 0]}/> : <torusGeometry args={[.43, .13, 10, 22]}/>}<meshStandardMaterial color={jig ? '#ff36df' : '#edff17'} emissive={jig ? '#8d087c' : '#6f7700'} emissiveIntensity={2} wireframe={jig}/>
  </mesh></Float>;
}

export function ScannerScene({ effects }: { effects: string[] }) {
  const thermal = effects.includes('Coin Thermal'); const wrong = effects.includes('Wrong Spectrum');
  return <Canvas aria-label="Three dimensional clue signal field" dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 55 }} gl={{ antialias: false, alpha: true }}>
    <ambientLight intensity={thermal ? 1.5 : .55}/><pointLight color={wrong ? '#ff2c72' : '#25f9ff'} intensity={10} position={[2, 3, 4]}/>
    <Stars radius={20} depth={12} count={effects.includes('Hyper Clue') ? 420 : 160} factor={2} fade speed={2}/>
    <SignalForm position={[-2.1, .8, -1]}/><SignalForm jig position={[1.8, -.5, -2]}/><SignalForm position={[.2, 1.7, -3]}/>
  </Canvas>;
}
