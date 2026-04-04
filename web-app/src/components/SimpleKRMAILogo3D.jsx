import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';

function AnimatedKRMAILogo({ size = 1, animate = true }) {
    const groupRef = useRef();
    const sphereRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        if (animate && groupRef.current) {
            groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
            groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
        }

        if (animate && sphereRef.current) {
            sphereRef.current.scale.x = 1 + Math.sin(t * 2) * 0.05;
            sphereRef.current.scale.y = 1 + Math.sin(t * 2) * 0.05;
            sphereRef.current.scale.z = 1 + Math.sin(t * 2) * 0.05;
        }
    });

    return (
        <group ref={groupRef} scale={size}>
            <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={sphereRef} position={[0, 0, 0]}>
                    <icosahedronGeometry args={[1, 0]} />
                    <MeshTransmissionMaterial
                        color="#3b82f6"
                        transmission={0.9}
                        roughness={0.1}
                        thickness={0.5}
                        ior={1.5}
                        chromaticAberration={0.05}
                        anisotropy={0.5}
                    />
                </mesh>
            </Float>
        </group>
    );
}

export default function SimpleKRMAILogo3D({ size = 48, animate = true, className = "" }) {
    const canvasSize = size * 2;

    return (
        <div className={className} style={{ width: `${canvasSize}px`, height: `${canvasSize}px` }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />
                <AnimatedKRMAILogo size={1.5} animate={animate} />
            </Canvas>
        </div>
    );
}