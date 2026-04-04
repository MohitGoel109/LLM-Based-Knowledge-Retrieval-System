import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

// Floating crystal geometry component
function Crystal({ position, color = '#3b82f6', speed = 1 }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(t * 0.5 * speed) * 0.2;
            meshRef.current.rotation.y = Math.sin(t * 0.3 * speed) * 0.3;
            meshRef.current.position.y = position[1] + Math.sin(t * speed) * 0.1;

            // Pulsing effect when hovered
            if (hovered) {
                meshRef.current.scale.x = 1 + Math.sin(t * 5) * 0.05;
                meshRef.current.scale.y = 1 + Math.sin(t * 5) * 0.05;
                meshRef.current.scale.z = 1 + Math.sin(t * 5) * 0.05;
            }
        }
    });

    return (
        <Float speed={speed * 0.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh
                ref={meshRef}
                position={position}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                scale={hovered ? 1.2 : 1}
            >
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.8}
                    roughness={0.1}
                    metalness={0.9}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.3 : 0.1}
                />
                <Html
                    position={[0, 1, 0]}
                    center
                    distanceFactor={10}
                    style={{
                        color: 'white',
                        background: 'rgba(59, 130, 246, 0.8)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        opacity: hovered ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    Click me!
                </Html>
            </mesh>
        </Float>
    );
}

// Interactive particle system
function ParticleField() {
    const pointsRef = useRef();
    const particleCount = 200;

    // Create particle positions
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    useFrame((state) => {
        if (pointsRef.current) {
            const time = state.clock.getElapsedTime();
            pointsRef.current.rotation.y = time * 0.05;

            // Animate particles
            const positions = pointsRef.current.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3 + 1] = (Math.random() - 0.5) * 20 + Math.sin(time + i) * 0.5;
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={positions}
                    count={particleCount}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#3b82f6"
                size={0.02}
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

// Rotating torus knot
function TorusKnot() {
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.01;
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -5]}>
            <torusKnotGeometry args={[1, 0.3, 128, 32]} />
            <meshStandardMaterial
                color="#60a5fa"
                roughness={0.1}
                metalness={0.9}
                wireframe
            />
        </mesh>
    );
}

// Main 3D scene component
function Scene() {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(0, 0, 10);
    }, [camera]);

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />

            <Crystal position={[-3, 2, 0]} color="#3b82f6" speed={1} />
            <Crystal position={[3, -2, 0]} color="#60a5fa" speed={1.5} />
            <Crystal position={[0, 0, 2]} color="#93c5fd" speed={0.8} />

            <ParticleField />
            <TorusKnot />

            <ContactShadows
                position={[0, -5, 0]}
                opacity={0.4}
                scale={20}
                blur={1}
                far={5}
            />

            <Environment preset="city" />
        </>
    );
}

// Controls component
function Controls() {
    const controlsRef = useRef();

    useFrame((state) => {
        if (controlsRef.current) {
            controlsRef.current.update();
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            autoRotate
            autoRotateSpeed={0.5}
            minDistance={5}
            maxDistance={20}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
        />
    );
}

// Main export component
export default function ThreeScene({ className = "" }) {
    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}>
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                <Scene />
                <Controls />
            </Canvas>
        </div>
    );
}