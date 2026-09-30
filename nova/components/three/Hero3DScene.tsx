"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center, ContactShadows, Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import "./RimLightMaterial";
import { Hero3DEffects } from "./Hero3DEffects";

export const DEFAULT_MODEL_URL = "/models/headphones.glb";

export type Hero3DSceneProps = {
  modelUrl: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  visible?: boolean;
  color?: string;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  rimColor?: string;
  rimIntensity?: number;
  bloomIntensity?: number;
  autoRotateSpeed?: number;
};

function Model({
  url,
  position,
  rotation,
  scale,
  visible,
  color,
  metalness,
  roughness,
  clearcoat,
  rimColor,
  rimIntensity,
}: Required<Omit<Hero3DSceneProps, "modelUrl" | "bloomIntensity" | "autoRotateSpeed">> & { url: string }) {
  const { scene } = useGLTF(url);

  // The source GLB ships raw geometry only (no material, no normals, no UVs),
  // so every mesh gets vertex normals computed once and a real PBR material
  // assigned here. A thin fresnel "shell" mesh reuses the same geometry to
  // add a rim-light glow without touching the base material's shader.
  const { model, rimGeometries } = useMemo(() => {
    const cloned = scene.clone(true);
    const geometries: THREE.BufferGeometry[] = [];

    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const geometry = child.geometry as THREE.BufferGeometry;
      if (!geometry.attributes.normal) {
        geometry.computeVertexNormals();
      }
      child.material = new THREE.MeshPhysicalMaterial({
        color,
        metalness,
        roughness,
        clearcoat,
        clearcoatRoughness: 0.25,
        envMapIntensity: 0.9,
      });
      child.castShadow = true;
      child.receiveShadow = true;
      geometries.push(geometry);
    });

    return { model: cloned, rimGeometries: geometries };
  }, [scene, color, metalness, roughness, clearcoat]);

  return (
    <group position={position} rotation={rotation} scale={scale} visible={visible}>
      <Center>
        <primitive object={model} />
        {rimGeometries.map((geometry, i) => (
          <mesh key={i} geometry={geometry} scale={1.02}>
            <rimLightMaterial
              color={rimColor}
              intensity={rimIntensity}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.FrontSide}
            />
          </mesh>
        ))}
      </Center>
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <span className="text-xs font-medium text-text-secondary">Loading model…</span>
    </Html>
  );
}

export default function Hero3DScene({
  modelUrl,
  position = [10, 4, -8],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
  color = "#F3F4F6",
  metalness = 0.1,
  roughness = 0.55,
  clearcoat = 0.15,
  rimColor = "#caa06a",
  rimIntensity = 1.4,
  bloomIntensity = 0.12,
  autoRotateSpeed = 0,
}: Hero3DSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.5], fov: 35 }}
      className="touch-none!"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={0.1} castShadow />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#8ec5ff" />
      <spotLight position={[0, 5, 2]} angle={0.3} penumbra={1} intensity={0.6} />
      <Suspense fallback={<Loader />}>
        <Bounds fit clip observe margin={1.3}>
          <Model
            url={modelUrl}
            position={position}
            rotation={rotation}
            scale={scale}
            visible={visible}
            color={color}
            metalness={metalness}
            roughness={roughness}
            clearcoat={clearcoat}
            rimColor={rimColor}
            rimIntensity={rimIntensity}
          />
        </Bounds>
        <Environment preset="city" environmentIntensity={0.6} />
      </Suspense>
      <ContactShadows position={[0, -1.4, 0]} opacity={0.35} scale={6} blur={2.5} far={2} />
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={autoRotateSpeed}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.6}
      />
      <Hero3DEffects bloomIntensity={bloomIntensity} />
    </Canvas>
  );
}
