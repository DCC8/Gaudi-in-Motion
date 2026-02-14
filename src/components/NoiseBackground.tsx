"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface NoiseBackgroundProps {
    intensity?: number;
    intensityRef?: React.RefObject<number>;
    className?: string;
    isActive?: boolean;
}

const NoiseMesh = ({ intensity = 0.5, intensityRef, isActive = true }: { intensity: number; intensityRef?: React.RefObject<number>; isActive: boolean }) => {
    const mesh = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uIntensity: { value: intensity },
            uColor: { value: new THREE.Color("#050505") }, // Dark background
        }),
        []
    );

    const { invalidate } = useThree();

    useFrame((state) => {
        if (!isActive) return;
        invalidate();
        if (mesh.current) {
            const material = mesh.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.getElapsedTime();
            // Read from ref (no re-render) or fall back to prop
            const targetIntensity = intensityRef ? intensityRef.current : intensity;
            material.uniforms.uIntensity.value = THREE.MathUtils.lerp(
                material.uniforms.uIntensity.value,
                targetIntensity,
                0.05
            );
        }
    });

    // Kick the render loop when isActive becomes true
    useEffect(() => {
        if (isActive) invalidate();
    }, [isActive, invalidate]);

    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const fragmentShader = `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec3 uColor;
    varying vec2 vUv;

    // Simplex noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      float grain = snoise(vUv * 500.0 + uTime * 5.0);
      float movement = snoise(vUv * 2.0 + uTime * 0.2);
      
      float finalNoise = grain * 0.1 * uIntensity + movement * 0.05 * uIntensity;
      
      vec3 color = uColor + vec3(finalNoise);
      
      // Vignette
      float dist = distance(vUv, vec2(0.5));
      color *= 1.0 - dist * 0.5;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

    return (
        <mesh ref={mesh} scale={[20, 20, 1]}> {/* Large scale to cover text slide */}
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
};

export default function NoiseBackground({ intensity = 0.5, intensityRef, className = "", isActive = true }: NoiseBackgroundProps) {
    return (
        <div className={`absolute inset-0 w-full h-full -z-10 ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 1] }}
                dpr={[1, 1.5]}
                frameloop="demand"
            >
                <NoiseMesh intensity={intensity} intensityRef={intensityRef} isActive={isActive} />
            </Canvas>
        </div>
    );
}
