"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import * as THREE from "three";

export function Hero3DEffects({ bloomIntensity = 0.35 }: { bloomIntensity?: number }) {
  const { gl, scene, camera, size } = useThree();

  const { composer, bloomPass } = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomIntensity,
      0.6,
      0.92,
    );
    c.addPass(bloom);
    c.addPass(new OutputPass());
    return { composer: c, bloomPass: bloom };
    // Composer/passes are recreated only when the renderer, scene or camera
    // identity changes; bloomIntensity is applied live via the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    bloomPass.strength = bloomIntensity;
  }, [bloomPass, bloomIntensity]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  // Priority > 0 hands r3f's per-frame render loop to us, so this composer
  // renders instead of the default single renderer.render(scene, camera) call.
  useFrame(
    (_, delta) => {
      composer.render(delta);
    },
    1,
  );

  return null;
}
