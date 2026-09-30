"use client";

import { extend, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

export const RimLightMaterialImpl = shaderMaterial(
  { color: new THREE.Color("#7dd3fc"), intensity: 1.2 },
  /* glsl vertex */ `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mvPosition.xyz);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  /* glsl fragment */ `
    uniform vec3 color;
    uniform float intensity;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), 2.5);
      gl_FragColor = vec4(color * fresnel * intensity, fresnel * intensity);
    }
  `,
);

extend({ RimLightMaterial: RimLightMaterialImpl });

declare module "@react-three/fiber" {
  interface ThreeElements {
    rimLightMaterial: ThreeElement<typeof RimLightMaterialImpl>;
  }
}
