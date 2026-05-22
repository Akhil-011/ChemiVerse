// ============================================================
// ChemFusion AI — 3D Atom Visualization
// ============================================================
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { PeriodicElement } from "@/types";

interface AtomViewer3DProps {
  element: PeriodicElement;
}

export default function AtomViewer3D({ element }: AtomViewer3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#8b5cf6" />
        <hemisphereLight intensity={0.15} groundColor="#111827" />
        {/* subtle environment for reflections */}
        <Environment preset="studio" />
        
        <AtomScene element={element} />
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          autoRotate={true}
          autoRotateSpeed={3}
        />
      </Canvas>
    </div>
  );
}

function AtomScene({ element }: AtomViewer3DProps) {
  const nucleusRef = useRef<THREE.Mesh>(null);
  const electronRefs = useRef<(THREE.Mesh | null)[]>([]);

  const electronCount = element.atomicNumber;
  const shellModel = useMemo(() => buildShellModel(electronCount), [electronCount]);
  const orbitSlots = useMemo(() => buildElectronOrbitSlots(shellModel), [shellModel]);

  // Animate nucleus
  useFrame(() => {
    if (nucleusRef.current) {
      nucleusRef.current.rotation.x += 0.003;
      nucleusRef.current.rotation.y += 0.005;
    }
  });

  // nucleus glow pulse
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (glowRef.current) {
      const t = (Math.sin(state.clock.getElapsedTime() * 1.2) + 1) / 2;
      glowRef.current.scale.setScalar(1.2 + t * 0.35);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + t * 0.06;
    }
  });

  // Animate electrons
  useFrame((state) => {
    orbitSlots.forEach((slot, idx) => {
      const electron = electronRefs.current[idx];
      if (!electron) return;

      const angle = state.clock.getElapsedTime() * slot.speed + slot.phase;
      electron.position.set(
        Math.cos(angle) * slot.radius,
        0,
        Math.sin(angle) * slot.radius
      );

      electron.rotation.y += 0.03;
      electron.rotation.x += 0.02;
    });
  });

  return (
    <>
      {/* Nucleus */}
      <mesh ref={nucleusRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFA500"
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Glow around nucleus */}
      <mesh ref={glowRef} scale={1.3} renderOrder={0}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Orbit rings */}
      <OrbitRings orbits={shellModel.map((shell) => shell.radius)} />

      {/* Electrons */}
      <group>
        {orbitSlots.map((slot, i) => (
          <mesh
            key={i}
            ref={(node) => {
              electronRefs.current[i] = node;
            }}
            position={[slot.radius, 0, 0]}
          >
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial
              color={getElectronColor(i)}
              emissive={getElectronColor(i)}
              emissiveIntensity={0.6}
              metalness={0.8}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Floating particles */}
      <ParticleField />
    </>
  );
}

function OrbitRings({ orbits }: { orbits: number[] }) {
  return (
    <>
      {orbits.map((radius, idx) => (
        <OrbitRing key={idx} radius={radius} color={getOrbitColor(idx)} />
      ))}
    </>
  );
}

function OrbitRing({ radius, color }: { radius: number; color: string }) {
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => generateOrbitPoints(radius, 96), [radius]);

  useEffect(() => {
    lineRef.current?.computeLineDistances();
  }, []);

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={new Float32Array(points)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineDashedMaterial
        color={color}
        transparent
        opacity={0.45}
        dashSize={0.18}
        gapSize={0.12}
      />
    </line>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(300); // 100 particles * 3 coords
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current && particlesRef.current.geometry.attributes.position) {
      const positionAttribute = particlesRef.current.geometry.attributes.position;
      const array = positionAttribute.array as Float32Array;

      for (let i = 0; i < array.length; i += 3) {
        array[i] += Math.sin(state.clock.getElapsedTime() + i) * 0.01;
        array[i + 1] += Math.cos(state.clock.getElapsedTime() + i) * 0.01;
        array[i + 2] += Math.sin(state.clock.getElapsedTime() + i * 0.5) * 0.01;
      }
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8b5cf6"
        size={0.1}
        transparent
        opacity={0.3}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Helper functions
function buildShellModel(electronCount: number) {
  const shellCapacities = [2, 8, 18, 32, 32, 18, 8];
  const baseRadius = 2.2;
  const shellSpacing = 0.95;
  const shells: Array<{ radius: number; electrons: number; speed: number }> = [];

  let remaining = electronCount;
  shellCapacities.forEach((capacity, shellIndex) => {
    if (remaining <= 0) return;

    const electrons = Math.min(remaining, capacity);
    const orbitRadius = baseRadius + shellIndex * shellSpacing;
    const speed = Math.max(0.44 - shellIndex * 0.035, 0.14);

    shells.push({
      radius: orbitRadius,
      electrons,
      speed,
    });

    remaining -= electrons;
  });

  return shells;
}

function buildElectronOrbitSlots(shellModel: Array<{ radius: number; electrons: number; speed: number }>) {
  const slots: Array<{ radius: number; speed: number; phase: number }> = [];
  shellModel.forEach((shell) => {
    for (let electronIndex = 0; electronIndex < shell.electrons; electronIndex++) {
      slots.push({
        // Use the exact same radius as the ring geometry to lock electrons on-path.
        radius: shell.radius,
        speed: shell.speed,
        phase: (electronIndex / shell.electrons) * Math.PI * 2,
      });
    }
  });

  return slots;
}

function generateOrbitPoints(radius: number, segments: number): number[] {
  const points: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }
  return points;
}

function getElectronColor(index: number): string {
  const colors = ["#00d4ff", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
  return colors[index % colors.length];
}

function getOrbitColor(index: number): string {
  const colors = ["#00d4ff", "#8b5cf6", "#10b981", "#f59e0b"];
  return colors[index % colors.length];
}
