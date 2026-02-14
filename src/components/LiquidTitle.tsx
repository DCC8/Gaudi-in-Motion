"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, RenderTexture, PerspectiveCamera } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

// "3D Bulge" Shader (Minimal & Clean)
// Creates a magnifying glass effect that follows the mouse
const BulgeShader = {
    uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTexture: { value: null },
        uHover: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform sampler2D uTexture;
    uniform float uHover;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      vec2 center = uMouse;
      
      // Calculate distance to mouse
      float dist = distance(uv, center);
      
      // Configuration
      float radius = 0.25; // Size of the bulge
      float strength = 0.8; // Magnification strength (higher = more zoom)
      
      // Bulge Logic
      // Smooth falloff from center to radius
      float falloff = smoothstep(radius, 0.0, dist);
      
      // Calculate displaced UV
      // "Zoom in" means we map current UV to a point closer to center.
      // uv - center vector. We scale this vector down near the center.
      
      vec2 dir = uv - center;
      vec2 distortedUv = uv - dir * falloff * strength * uHover; 

      // Removed Chromatic Aberration as requested
      // float aberration = falloff * 0.015 * uHover;
      
      // Simple texture lookup without RGB split
      vec4 color = texture2D(uTexture, distortedUv);

      // Add a subtle highlight/shine on the bulge
      float shine = smoothstep(0.0, 0.5, falloff) * 0.1 * uHover;
      
      gl_FragColor = vec4(color.r + shine, color.g + shine, color.b + shine, color.a);
    }
  `
};

function BulgeContent() {
    const { viewport } = useThree();
    // Reduced font size and tighter constraints as requested
    // Smaller multiplier than before (was 0.15)
    const fontSize = Math.max(0.4, Math.min(1.2, viewport.width * 0.1));

    return (
        <Text
            fontSize={fontSize}
            font="/ttf/JetBrainsMono-ExtraBold.ttf"
            color="white"
            anchorX="center"
            anchorY="middle"
            letterSpacing={-0.02} // Slightly tighter tracking
            maxWidth={viewport.width * 0.8} // More centered constraint
            textAlign="center"
            fontWeight={800}
        >
            GAUDÍ IN MOTION
        </Text>
    )
}

function BulgePlane() {
    const { viewport, pointer } = useThree();
    const shaderRef = useRef<THREE.ShaderMaterial>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (!shaderRef.current) return;
        shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

        // Mouse mapping: -1..1 to 0..1
        const targetMouse = new THREE.Vector2((pointer.x + 1) / 2, (pointer.y + 1) / 2);

        // Smooth lerp for the lens movement
        shaderRef.current.uniforms.uMouse.value.lerp(targetMouse, 0.1);

        // Hover handling - make it smoother/slower decay
        const targetHover = hovered ? 1.0 : 0.0;
        shaderRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
            shaderRef.current.uniforms.uHover.value,
            targetHover,
            0.1
        );
    });

    return (
        <mesh
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <planeGeometry args={[viewport.width, viewport.height]} />
            <shaderMaterial
                ref={shaderRef}
                args={[BulgeShader]}
                transparent
            >
                <RenderTexture attach="uniforms-uTexture-value">
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <BulgeContent />
                </RenderTexture>
            </shaderMaterial>
        </mesh>
    );
}

export default function LiquidTitle() {
    return (
        <div className="w-full h-full absolute inset-0 pointer-events-auto">
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
                <BulgePlane />
            </Canvas>
        </div>
    );
}
