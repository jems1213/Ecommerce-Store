import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PresentationControls, ContactShadows, Float, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import './ThreeShoe.css';

const ShoeMesh = ({ color = '#ff6b35', accent = '#222' }) => {
  const ref = useRef();

  // Create a simple shoe-like profile using lathe geometry
  const points = useMemo(() => {
    const pts = [];
    // profile from toe to heel (y, x)
    pts.push(new THREE.Vector2(0.0, 0.0));
    pts.push(new THREE.Vector2(0.2, 0.1));
    pts.push(new THREE.Vector2(0.6, 0.2));
    pts.push(new THREE.Vector2(0.9, 0.35));
    pts.push(new THREE.Vector2(1.05, 0.55));
    pts.push(new THREE.Vector2(1.05, 0.75));
    pts.push(new THREE.Vector2(0.9, 0.9));
    pts.push(new THREE.Vector2(0.5, 1.1));
    pts.push(new THREE.Vector2(0.15, 1.25));
    pts.push(new THREE.Vector2(0.0, 1.25));
    return pts;
  }, []);

  // subtle float/rotation
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={ref} rotation={[0, 0, 0]}>
      {/* Upper (lathe) */}
      <mesh castShadow receiveShadow position={[0, -0.6, 0]}>
        <latheGeometry args={[points, 64, 0, Math.PI * 2]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.4} />
      </mesh>

      {/* Sole */}
      <mesh castShadow receiveShadow position={[0, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.15, 0.35, 0.9]}>
        <torusGeometry args={[0.8, 0.18, 16, 64]} />
        <meshStandardMaterial color={accent} metalness={0.05} roughness={0.8} />
      </mesh>

      {/* Laces: small thin cylinders across top */}
      {[-0.1, 0.05, 0.22].map((x, idx) => (
        <mesh key={idx} position={[0.02, -0.25 + idx * 0.12, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

function Model({ modelUrl, castShadow = true, receiveShadow = true, scale = 1, color, accent }) {
  const gltf = useGLTF(modelUrl, true);
  const ref = useRef();

  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.3;
  });

  return (
    <group ref={ref} dispose={null} scale={[scale, scale, scale]}>
      <primitive object={gltf.scene} castShadow={castShadow} receiveShadow={receiveShadow} />
    </group>
  );
}

const ThreeShoeCanvas = ({ className, color = '#ff6b35', accent = '#222', modelUrl = null, lighting = {} }) => {
  const [canLoadModel, setCanLoadModel] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!modelUrl) {
      setCanLoadModel(false);
      setChecked(true);
      return;
    }
    // quick availability check
    fetch(modelUrl, { method: 'HEAD' })
      .then((res) => {
        if (mounted) {
          setCanLoadModel(res && res.ok);
          setChecked(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setCanLoadModel(false);
          setChecked(true);
        }
      });

    return () => (mounted = false);
  }, [modelUrl]);

  // if the HEAD is blocked by CORS, we still try to render the model via Suspense; the check simply helps avoid immediate errors.

  return (
    <div className={`three-shoe-wrapper ${className || ''}`}>
      <Canvas camera={{ position: [0, 1.25, 3.6], fov: 36 }} shadows dpr={[1, 2]}>
        {/* tweak lights per slide via lighting props */}
        <ambientLight intensity={lighting.ambient ?? 0.6} />
        <directionalLight intensity={lighting.key ?? 0.9} position={lighting.keyPos ?? [5, 10, 5]} castShadow />
        <directionalLight intensity={lighting.fill ?? 0.25} position={lighting.fillPos ?? [-5, -5, -5]} />

        <PresentationControls global zoom={0.9} polar={[-0.2, Math.PI / 2]} azimuth={[-Math.PI / 4, Math.PI / 4]}>
          <Float speed={1} rotationIntensity={0.6} floatIntensity={0.6}>
            <Suspense fallback={<ShoeMesh color={color} accent={accent} />}>
              {modelUrl && checked && canLoadModel ? (
                <Model modelUrl={modelUrl} scale={1} color={color} accent={accent} />
              ) : (
                <ShoeMesh color={color} accent={accent} />
              )}
            </Suspense>
          </Float>
        </PresentationControls>

        <ContactShadows position={[0, -1, 0]} opacity={0.6} width={4} blur={2} far={2} />

        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={0} />
      </Canvas>
    </div>
  );
};

export default ThreeShoeCanvas;
