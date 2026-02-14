"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree, createPortal } from "@react-three/fiber";
import { useTexture, Text, Float, useFBO } from "@react-three/drei";
import * as THREE from "three";
import { ShaderConfig } from "./HeroControls";

// =============================================================================
// POST-PROCESSING FRAGMENT SHADER
// Mouse-position UV distortion with radial falloff, velocity warping,
// chromatic aberration, simplex noise animation
// =============================================================================

const quadVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const quadFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uDistortion;
  uniform float uSpeed;
  uniform float uNoiseScale;
  uniform vec2 uMouse;
  uniform vec2 uMouseVelocity;
  uniform float uAspect;
  uniform float uRevealRadius;
  uniform float uGlowIntensity;
  varying vec2 vUv;

  // --- Simplex 2D Noise ---
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;

    // Aspect-corrected distance for circular falloff
    vec2 diff = uv - uMouse;
    diff.x *= uAspect;
    float dist = length(diff);

    // Smooth radial falloff around mouse (radius ~0.3)
    float falloff = smoothstep(0.35, 0.0, dist);

    // Animated noise field
    float n1 = snoise(uv * uNoiseScale + uTime * uSpeed);
    float n2 = snoise(uv * uNoiseScale * 1.5 - uTime * uSpeed * 0.7);

    // Noise-based displacement, gated by mouse proximity
    float noiseDisp = (n1 + n2 * 0.5) * uDistortion;

    // Velocity-based directional warp (stretch UVs in direction of mouse movement)
    float velMag = length(uMouseVelocity);
    vec2 velDir = velMag > 0.001 ? normalize(uMouseVelocity) : vec2(0.0);
    vec2 velocityWarp = velDir * velMag * falloff * 0.15;

    // Combined displacement
    vec2 displacement = vec2(noiseDisp * 0.08) * falloff + velocityWarp;
    vec2 displacedUv = uv + displacement;

    // --- Grayscale-to-Color Reveal ---
    vec4 fullColor = texture2D(uTexture, displacedUv);

    // Desaturate (luminance-preserving grayscale)
    float luma = dot(fullColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grayscale = vec3(luma);

    // Reveal radius: wider falloff for color transition
    float revealDist = length(diff); // reuse aspect-corrected diff
    float colorReveal = smoothstep(uRevealRadius + 0.15, uRevealRadius * 0.3, revealDist);

    // Mix from grayscale to full color based on mouse proximity
    vec3 finalColor = mix(grayscale, fullColor.rgb, colorReveal);

    // --- Subtle Luminance Glow ---
    // Soft additive glow near mouse (warm white, like bioluminescence)
    float glowFalloff = smoothstep(uRevealRadius + 0.1, 0.0, revealDist);
    vec3 glowColor = vec3(1.0, 0.98, 0.95); // warm white
    finalColor += glowColor * glowFalloff * uGlowIntensity * 0.15;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// =============================================================================
// CONTENT SCENE (Rendered to FBO)
// Image centered at natural size + Text overlay
// =============================================================================

const ContentScene = ({ imageSrc }: { imageSrc: string }) => {
    const { viewport } = useThree();
    const texture = useTexture(imageSrc) as THREE.Texture;
    const img = texture.image as HTMLImageElement;

    // Fit image inside viewport while preserving aspect ratio (CONTAIN)
    const imageAspect = img ? img.width / img.height : 1;
    const viewportAspect = viewport.width / viewport.height;

    let w: number, h: number;
    if (imageAspect > viewportAspect) {
        // Image wider than viewport: fit to width
        w = viewport.width * 0.75; // 75% of viewport width to leave breathing room
        h = w / imageAspect;
    } else {
        // Image taller than viewport: fit to height
        h = viewport.height * 0.85; // 85% of viewport height
        w = h * imageAspect;
    }

    return (
        <>
            {/* Centered Image at natural proportions */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[w, h]} />
                <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>

            {/* "GAUDI IN MOTION" Text */}
            <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.3}>
                <Text
                    position={[0, 0, 0]}
                    fontSize={Math.min(viewport.width * 0.12, 1.8)}
                    font="/ttf/JetBrainsMono-Bold.ttf"
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    letterSpacing={0.3}
                    maxWidth={viewport.width * 0.9}
                    textAlign="center"
                    lineHeight={1.1}
                >
                    GAUDI{"\n"}IN MOTION
                    <meshBasicMaterial color="white" toneMapped={false} />
                </Text>
            </Float>
        </>
    );
};

// =============================================================================
// FBO PIPELINE
// =============================================================================

const HeroFBOScene = ({
    imageSrc,
    config,
    isActive,
}: {
    imageSrc: string;
    config: ShaderConfig;
    isActive: boolean;
}) => {
    const target = useFBO({ samples: 4 });
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Off-screen scene
    const offScreenScene = useMemo(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#000000");
        return scene;
    }, []);

    const { viewport, invalidate } = useThree();

    // Mouse tracking with velocity
    const prevMouse = useRef(new THREE.Vector2(0.5, 0.5));
    const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5));
    const smoothVelocity = useRef(new THREE.Vector2(0, 0));
    const tempVec2 = useRef(new THREE.Vector2());
    const tempVelocity = useRef(new THREE.Vector2());

    const uniforms = useMemo(
        () => ({
            uTexture: { value: null as THREE.Texture | null },
            uTime: { value: 0 },
            uDistortion: { value: 0 },
            uSpeed: { value: 0 },
            uNoiseScale: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uMouseVelocity: { value: new THREE.Vector2(0, 0) },
            uAspect: { value: 1 },
            uRevealRadius: { value: 0.3 },
            uGlowIntensity: { value: 0.5 },
        }),
        []
    );

    useFrame((state) => {
        if (!isActive) return;
        invalidate();
        const { gl, camera, pointer } = state;

        // --- PASS 1: Render content scene to FBO ---
        gl.setRenderTarget(target);
        gl.clear();
        gl.render(offScreenScene, camera);
        gl.setRenderTarget(null);

        // --- PASS 2: Update uniforms for post-processing quad ---
        if (!materialRef.current) return;
        const u = materialRef.current.uniforms;

        u.uTexture.value = target.texture;
        u.uTime.value = state.clock.getElapsedTime();
        u.uAspect.value = viewport.width / viewport.height;

        // Smooth config interpolation
        u.uDistortion.value = THREE.MathUtils.lerp(
            u.uDistortion.value,
            config.distortionStrength * 0.15,
            0.08
        );
        u.uSpeed.value = config.speed;
        u.uNoiseScale.value = config.noiseScale;
        u.uRevealRadius.value = config.colorRevealRadius;
        u.uGlowIntensity.value = config.glowIntensity;

        // Mouse position (normalized 0..1, lerped for smooth trailing)
        const rawX = (pointer.x + 1) / 2;
        const rawY = (pointer.y + 1) / 2;
        smoothMouse.current.lerp(tempVec2.current.set(rawX, rawY), 0.08);
        u.uMouse.value.copy(smoothMouse.current);

        // Mouse velocity (difference between frames, smoothed) — reuse refs to avoid GC
        tempVelocity.current.set(
            smoothMouse.current.x - prevMouse.current.x,
            smoothMouse.current.y - prevMouse.current.y
        );
        smoothVelocity.current.lerp(tempVelocity.current, 0.15);
        u.uMouseVelocity.value.copy(smoothVelocity.current);
        prevMouse.current.copy(smoothMouse.current);
    });

    // Kick the render loop when isActive becomes true
    React.useEffect(() => {
        if (isActive) invalidate();
    }, [isActive, invalidate]);

    return (
        <>
            {/* Portal renders ContentScene into the off-screen scene */}
            {createPortal(
                <ContentScene imageSrc={imageSrc} />,
                offScreenScene
            )}

            {/* Fullscreen quad with post-processing shader */}
            <mesh scale={[viewport.width, viewport.height, 1]}>
                <planeGeometry args={[1, 1]} />
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={quadVertexShader}
                    fragmentShader={quadFragmentShader}
                    uniforms={uniforms}
                />
            </mesh>
        </>
    );
};

// =============================================================================
// EXPORT
// =============================================================================

export default function HeroShader({
    imageSrc,
    config,
    isActive = true,
}: {
    imageSrc: string;
    config: ShaderConfig;
    isActive?: boolean;
}) {
    return (
        <div className="w-full h-full relative">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                className="w-full h-full"
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: false }}
                frameloop="demand"
            >
                <React.Suspense fallback={null}>
                    <HeroFBOScene imageSrc={imageSrc} config={config} isActive={isActive} />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
