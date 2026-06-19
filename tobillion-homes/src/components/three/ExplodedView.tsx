'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense } from 'react';

function HouseModel() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 1, 2.5]} />
        <meshStandardMaterial color="#047857" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[2.2, 1, 4]} />
        <meshStandardMaterial color="#064e3b" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[1.8, 0.5, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.8, 0.05, 0.8]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[-0.8, 0.25, 1.3]}>
        <boxGeometry args={[0.4, 0.5, 0.05]} />
        <meshStandardMaterial color="#a7f3d0" roughness={0.1} metalness={0.05} />
      </mesh>
      <mesh position={[0.5, 0.25, 1.3]}>
        <boxGeometry args={[0.4, 0.5, 0.05]} />
        <meshStandardMaterial color="#a7f3d0" roughness={0.1} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[3.5, 0.1, 3]} />
        <meshStandardMaterial color="#065f46" roughness={0.8} />
      </mesh>
      <mesh position={[1.8, 0.25, -0.5]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 8]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>
      <mesh position={[1.8, 0.25, 0.5]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 8]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>
    </group>
  );
}

function ExplodedHouseModel() {
  return (
    <group>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 0.15, 3.5]} />
        <meshStandardMaterial color="#065f46" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[3, 0.8, 2.5]} />
        <meshStandardMaterial color="#047857" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[2.2, 0.8, 4]} />
        <meshStandardMaterial color="#064e3b" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[-1.5, 0.3, 0]}>
        <boxGeometry args={[0.04, 0.6, 0.4]} />
        <meshStandardMaterial color="#a7f3d0" roughness={0.1} />
      </mesh>
      <mesh position={[1.5, 0.3, 0]}>
        <boxGeometry args={[0.04, 0.6, 0.4]} />
        <meshStandardMaterial color="#a7f3d0" roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.3, 1.4]}>
        <boxGeometry args={[0.3, 0.4, 0.04]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.6} />
      </mesh>
    </group>
  );
}

interface ExplodedViewProps {
  variant?: 'house' | 'apartment';
  height?: string;
}

export function ExplodedView({ variant = 'house', height = '500px' }: ExplodedViewProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-emerald-100" style={{ height }}>
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 shadow-sm">
        3D Interactive View — Drag to explore
      </div>
      <Canvas camera={{ position: [4, 3, 5], fov: 50 }}>
        <Suspense fallback={
          <Html center>
            <div className="text-emerald-700 text-sm">Loading 3D view...</div>
          </Html>
        }>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#F59E0B" />
          <pointLight position={[0, 3, 2]} intensity={0.4} />
          {variant === 'house' ? <HouseModel /> : <ExplodedHouseModel />}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1.5}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
