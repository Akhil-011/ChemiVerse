// ============================================================
// ChemFusion AI — 3D Molecule Viewer (React Three Fiber)
// Renders atoms as spheres and bonds as cylinders
// ============================================================
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Molecule, Atom } from "@/types";

// ─── Single Atom Sphere ───────────────────────────────────────
function AtomSphere({ atom, showLabel }: { atom: Atom; showLabel: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // subtle breathing animation
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2 + atom.position[0]) * 0.03;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={atom.position}>
      {/* Atom sphere */}
      <Sphere ref={meshRef} args={[atom.radius, 32, 32]}>
        <meshStandardMaterial
          color={atom.color}
          roughness={0.15}
          metalness={0.3}
          emissive={atom.color}
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Glow halo */}
      <Sphere args={[atom.radius * 1.35, 16, 16]}>
        <meshStandardMaterial
          color={atom.color}
          transparent
          opacity={0.06}
          roughness={1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Label */}
      {showLabel && (
        <Html center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div
            className="px-1.5 py-0.5 rounded text-[10px] font-bold font-display select-none"
            style={{
              background: "rgba(0,0,0,0.75)",
              color: atom.color,
              border: `1px solid ${atom.color}40`,
              backdropFilter: "blur(4px)",
              whiteSpace: "nowrap",
            }}
          >
            {atom.symbol}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Bond Cylinder ────────────────────────────────────────────
function BondCylinder({
  from,
  to,
  color,
  type,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  type: string;
}) {
  const points = useMemo(() => {
    return [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  }, [from, to]);

  // Double bond offset
  if (type === "double" || type === "aromatic") {
    const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from)).normalize();
    const perp = new THREE.Vector3(-dir.y, dir.x, dir.z).normalize().multiplyScalar(0.12);
    const p1a = [from[0] + perp.x, from[1] + perp.y, from[2] + perp.z] as [number, number, number];
    const p1b = [to[0] + perp.x, to[1] + perp.y, to[2] + perp.z] as [number, number, number];
    const p2a = [from[0] - perp.x, from[1] - perp.y, from[2] - perp.z] as [number, number, number];
    const p2b = [to[0] - perp.x, to[1] - perp.y, to[2] - perp.z] as [number, number, number];

    return (
      <>
        <Line points={[p1a, p1b]} color={color} lineWidth={type === "aromatic" ? 1.5 : 2} />
        <Line
          points={[p2a, p2b]}
          color={color}
          lineWidth={type === "aromatic" ? 1.5 : 2}
          dashed={type === "aromatic"}
          dashSize={0.15}
          gapSize={0.1}
        />
      </>
    );
  }

  return (
    <Line
      points={points}
      color={color}
      lineWidth={type === "triple" ? 3 : 2}
    />
  );
}

// ─── Rotating Group ───────────────────────────────────────────
function RotatingMolecule({ molecule, showLabels, autoRotate }: {
  molecule: Molecule;
  showLabels: boolean;
  autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  // Build lookup map for bond endpoints
  const atomMap = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    molecule.atoms.forEach((a) => { map[a.id] = a.position; });
    return map;
  }, [molecule]);

  return (
    <group ref={groupRef}>
      {/* Atoms */}
      {molecule.atoms.map((atom) => (
        <AtomSphere key={atom.id} atom={atom} showLabel={showLabels} />
      ))}

      {/* Bonds */}
      {molecule.bonds.map((bond, i) => {
        const from = atomMap[bond.from];
        const to = atomMap[bond.to];
        if (!from || !to) return null;
        return (
          <BondCylinder
            key={`bond-${i}`}
            from={from}
            to={to}
            color="#94a3b8"
            type={bond.type}
          />
        );
      })}
    </group>
  );
}

// ─── Scene Lighting ───────────────────────────────────────────
function SceneLights({ color }: { color: string }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color={color} />
      <pointLight position={[-10, -5, -10]} intensity={0.6} color="#8b5cf6" />
      <directionalLight position={[0, 10, 5]} intensity={0.8} color="#ffffff" />
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────
interface MoleculeSceneProps {
  molecule: Molecule;
  showLabels?: boolean;
  autoRotate?: boolean;
  height?: string;
}

export default function MoleculeScene({
  molecule,
  showLabels = true,
  autoRotate = true,
  height = "500px",
}: MoleculeSceneProps) {
  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden relative">
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 opacity-20 blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${molecule.color}, transparent 70%)` }}
      />

      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneLights color={molecule.color} />
        <RotatingMolecule
          molecule={molecule}
          showLabels={showLabels}
          autoRotate={autoRotate}
        />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={20}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
