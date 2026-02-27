import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls, Environment, Float, MeshDistortMaterial, Center, Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function LoadedModel({ url, customScale }) {
    const isGLB = url.toLowerCase().endsWith('.glb') || url.toLowerCase().endsWith('.gltf')
    const { scene: glbScene } = isGLB ? useGLTF(url) : { scene: null }
    const obj = !isGLB ? useLoader(OBJLoader, url) : null

    const loadedObject = isGLB ? glbScene : obj
    const [scale, setScale] = React.useState(customScale || (isGLB ? 4.5 : 12))

    React.useEffect(() => {
        if (customScale) {
            setScale(customScale)
            return
        }
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setScale(isGLB ? 3.0 : 8)
            } else {
                setScale(isGLB ? 4.5 : 12)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isGLB, customScale])

    // Apply materials once when the object is loaded
    useMemo(() => {
        if (!loadedObject) return
        loadedObject.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: '#818cf8',
                    metalness: 0.9,
                    roughness: 0.2,
                    emissive: '#1e1b4b',
                    emissiveIntensity: 0.2,
                })
            }
        })
    }, [loadedObject])

    const meshRef = useRef()
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (meshRef.current) {
            meshRef.current.rotation.y = t * 0.2
        }
    })

    return (
        <Center>
            <primitive
                ref={meshRef}
                object={loadedObject}
                scale={scale}
            />
        </Center>
    )
}

function NeuralSphere() {
    const meshRef = useRef()
    const [size, setSize] = React.useState(1.0)

    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSize(0.7)
            } else {
                setSize(1.0)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        meshRef.current.rotation.x = t * 0.2
        meshRef.current.rotation.y = t * 0.3
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[size, 64, 64]} />
            <MeshDistortMaterial
                color="#6366f1"
                speed={2}
                distort={0.4}
                radius={size}
                metalness={0.8}
                roughness={0.2}
            />
        </mesh>
    )
}

const Model3D = ({ modelUrl, customScale, className = "" }) => {
    return (
        <div className={`w-full relative cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden ${className}`}>
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={1} />
                <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={5} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={2} color="#818cf8" />
                <pointLight position={[0, 5, 0]} intensity={2} color="#ffffff" />

                <Suspense fallback={
                    <group>
                        <NeuralSphere />
                        <Html center>
                            <div className="flex flex-col items-center gap-4 w-[300px] mt-24">
                                <span className="text-indigo-400/50 text-xs font-mono animate-pulse text-center">Initializing Axon Neural Link...</span>
                            </div>
                        </Html>
                    </group>
                }>
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        {modelUrl ? (
                            <LoadedModel url={modelUrl} customScale={customScale} />
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
