import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls, Environment, Float, MeshDistortMaterial, Center, Html } from '@react-three/drei'
import * as THREE from 'three'

function LoadedModel({ url }) {
    const obj = useLoader(OBJLoader, url)

    // Apply materials once when the object is loaded
    useMemo(() => {
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: '#818cf8', // Slightly brighter indigo
                    metalness: 0.9,
                    roughness: 0.1,
                    emissive: '#1e1b4b',
                    emissiveIntensity: 0.2,
                })
            }
        })
    }, [obj])

    const meshRef = useRef()
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (meshRef.current) {
            meshRef.current.rotation.y = t * 0.2
        }
    })

    // Model vertices are ~0.1 to 0.2, so scale 10-12x is appropriate
    return (
        <Center>
            <primitive
                ref={meshRef}
                object={obj}
                scale={11}
            />
        </Center>
    )
}

function NeuralSphere() {
    const meshRef = useRef()
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        meshRef.current.rotation.x = t * 0.2
        meshRef.current.rotation.y = t * 0.3
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1.0, 64, 64]} />
            <MeshDistortMaterial
                color="#6366f1"
                speed={2}
                distort={0.4}
                radius={1.0}
                metalness={0.8}
                roughness={0.2}
            />
        </mesh>
    )
}

const Model3D = ({ modelUrl }) => {
    return (
        <div className="w-full h-full min-h-[500px] relative cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden">
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={1} />
                <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={5} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={2} color="#818cf8" />
                <pointLight position={[0, 5, 0]} intensity={2} color="#ffffff" />

                <Suspense fallback={
                    <Html center>
                        <div className="flex flex-col items-center gap-4 w-[300px]">
                            <NeuralSphere />
                            <span className="text-indigo-400/50 text-xs font-mono animate-pulse text-center">Initializing Axon Neural Link...</span>
                        </div>
                    </Html>
                }>
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        {modelUrl ? (
                            <LoadedModel url={modelUrl} />
                        ) : (
                            <NeuralSphere />
                        )}
                    </Float>
                    <Environment preset="city" />
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    )
}

export default Model3D
