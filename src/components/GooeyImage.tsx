"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  uniform vec2 uScale;
  void main() {
    vUv = (uv - 0.5) * uScale + 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader (Noise based liquid distortion)
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;

  // Simplex 2D noise
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
    
    // Noise generation
    float noiseValue = snoise(uv * 3.0 + uTime * 0.5); // Base noise
    
    // Displacement based on hover
    float displacement = noiseValue * uHover * 0.1;
    
    // Apply displacement to UVs
    vec2 displacedUv = uv + vec2(displacement, displacement);

    // Zoom effect on hover
    // vec2 center = vec2(0.5);
    // displacedUv = center + (displacedUv - center) * (1.0 - uHover * 0.05);

    vec4 color = texture2D(uTexture, displacedUv);
    
    // RGB Shift on hover (optional enhancement)
    // float shift = uHover * 0.02;
    // float r = texture2D(uTexture, displacedUv + vec2(shift, 0.0)).r;
    // float g = texture2D(uTexture, displacedUv).g;
    // float b = texture2D(uTexture, displacedUv - vec2(shift, 0.0)).b;
    // color = vec4(r, g, b, 1.0);

    gl_FragColor = color;
  }
`;

interface GooeyImageProps {
    imageSrc: string;
    intensity?: number;
    isActive?: boolean;
}

const ImageMesh = ({ imageSrc, intensity = 0.5, isActive = true }: GooeyImageProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const texture = useTexture(imageSrc) as THREE.Texture;
    const [hovered, setHover] = useState(false);

    const uniforms = useMemo(
        () => ({
            uTexture: { value: texture },
            uHover: { value: 0 },
            uTime: { value: 0 },
            uScale: { value: new THREE.Vector2(1, 1) },
        }),
        [texture]
    );

    // Aspect ratio correction covers the plane
    const { viewport, invalidate } = useThree();
    const scale: [number, number, number] = [viewport.width, viewport.height, 1];

    useFrame((state) => {
        if (!isActive) return;
        // Request next frame in demand mode
        invalidate();
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            // Smoothly interpolate uHover
            materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uHover.value,
                hovered ? 1 : 0,
                0.1
            );

            // Update UV scale for cover effect
            const img = texture.image as HTMLImageElement;
            const imageAspect = img.width / img.height;
            const screenAspect = viewport.width / viewport.height;
            const aspectFactor = screenAspect / imageAspect;

            if (aspectFactor > 1) {
                materialRef.current.uniforms.uScale.value.set(1, 1 / aspectFactor);
            } else {
                materialRef.current.uniforms.uScale.value.set(aspectFactor, 1);
            }
        }
    });

    // Kick the render loop when isActive becomes true
    React.useEffect(() => {
        if (isActive) invalidate();
    }, [isActive, invalidate]);

    return (
        <mesh
            ref={meshRef}
            scale={scale}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <planeGeometry args={[1, 1, 32, 32]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
            />
        </mesh>
    );
};

export default function GooeyImage({ imageSrc, className, isActive = true }: { imageSrc: string; className?: string; isActive?: boolean }) {
    return (
        <div className={`w-full h-full relative ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 1], fov: 50 }}
                dpr={[1, 1.5]}
                className="w-full h-full"
                frameloop="demand"
            >
                <React.Suspense fallback={null}>
                    <ImageMesh imageSrc={imageSrc} isActive={isActive} />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
