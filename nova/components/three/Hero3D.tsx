"use client";

import dynamic from "next/dynamic";
import { HeroFallback } from "./HeroFallback";
import { ModelErrorBoundary } from "./ModelErrorBoundary";
import { DEFAULT_MODEL_URL, type Hero3DSceneProps } from "./Hero3DScene";

const Hero3DScene = dynamic(() => import("./Hero3DScene"), {
  ssr: false,
  loading: () => <HeroFallback />,
});

export function Hero3D({
  modelUrl = DEFAULT_MODEL_URL,
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
  bloomIntensity,
  autoRotateSpeed,
}: Partial<Hero3DSceneProps>) {
  return (
    <div className="h-72 w-72 sm:h-96 sm:w-96">
      <ModelErrorBoundary fallback={<HeroFallback />}>
        <Hero3DScene
          modelUrl={modelUrl}
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
          bloomIntensity={bloomIntensity}
          autoRotateSpeed={autoRotateSpeed}
        />
      </ModelErrorBoundary>
    </div>
  );
}
