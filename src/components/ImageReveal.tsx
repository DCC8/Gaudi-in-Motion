"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, Vector2 } from "three";
import * as THREE from "three";

interface ImageRevealProps {
    src: string;
    className?: string;
    progress?: number; // 0 to 1
}

const ImageMesh = ({ src, progress = 0 }: { src: string; progress: number }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const texture = useLoader(TextureLoader, src);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uTexture: { value: texture },
            uResolution: { value: new Vector2(1, 1) },
        }),
        [texture]
    );

    useFrame((state) => {
        if (mesh.current) {
            (mesh.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
            (mesh.current.material as THREE.ShaderMaterial).uniforms.uProgress.value = THREE.MathUtils.lerp(
                (mesh.current.material as THREE.ShaderMaterial).uniforms.uProgress.value,
                progress,
                0.1
            );
        }
    });

    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const fragmentShader = `
    uniform float uTime;
    uniform float uProgress;
    uniform sampler2D uTexture;
    varying vec2 vUv;

    // Simplex noise function (simplified)
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
      vec2 uv = vUv;
      
      // Liquid distortion effect driven by progress
      float noise = snoise(uv * 3.0 + uTime * 0.2);
      float distortion = noise * 0.1 * (1.0 - uProgress); 
      
      // Reveal mask
      float reveal = smoothstep(0.0, 0.2, uProgress - uv.y + distortion); // Simple wipe with noise
      
      // Or just distort the UVs for the texture lookup
      vec2 distortedUV = uv + vec2(distortion * 0.5, distortion * 0.5);
      vec4 color = texture2D(uTexture, distortedUV);
      
      // Apply reveal alpha
      // Actually, let's just do a nice displacement reveal
      // Standard liquid reveal: mix between displaced and normal?
      // Or simply opacity reveal with distortion?
      
      // Let's do opacity reveal
      float alpha = smoothstep(0.0, 1.0, uProgress * 1.5 - (1.0 - uv.y) + noise * 0.2);
      
      gl_FragColor = vec4(color.rgb, alpha);
    }
  `;

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[5, 5, 32, 32]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
            />
        </mesh>
    );
};

export default function ImageReveal({ src, className = "" }: ImageRevealProps) {
    // Use a state or ref to control progress, maybe trigger it on view?
    // For now, let's just make it auto-reveal on mount
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        // Simple auto-play on mount for testing
        const t = setTimeout(() => setProgress(1), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className={`relative w-full h-full ${className}`}>
            <Canvas camera={{ position: [0, 0, 3] }}>
                <React.Suspense fallback={null}>
                    <ImageMesh src={src} progress={progress} />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
