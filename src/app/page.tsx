"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Float, Html, Box, TorusKnot, Line } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-pacifico" });

function GlassySphere({ color, position, icon }: { color: string; position: [number, number, number]; icon: string }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[0.5, 64, 64]} position={position}>
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </Sphere>
      <Html center position={position} style={{ pointerEvents: 'none' }}>
        <span style={{ fontSize: 32 }}>{icon}</span>
      </Html>
    </Float>
  );
}

function Service3DCard({ icon, color }: { icon: string; color: string }) {
  return (
    <Float speed={1.5} rotationIntensity={0.7} floatIntensity={1.5}>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </Box>
      <Html center style={{ pointerEvents: 'none' }}>
        <span style={{ fontSize: 32 }}>{icon}</span>
      </Html>
    </Float>
  );
}

function DNAHelix() {
  // Generate points for a simple DNA double helix
  const points1: [number, number, number][] = [];
  const points2: [number, number, number][] = [];
  for (let i = 0; i < 100; i++) {
    const t = i * 0.2;
    points1.push([
      Math.cos(t) * 0.5,
      (i - 50) * 0.04,
      Math.sin(t) * 0.5,
    ]);
    points2.push([
      -Math.cos(t) * 0.5,
      (i - 50) * 0.04,
      -Math.sin(t) * 0.5,
    ]);
  }
  return (
    <>
      <Line points={points1} color="#06b6d4" lineWidth={2} />
      <Line points={points2} color="#f472b6" lineWidth={2} />
      {/* Connecting rungs */}
      {points1.map((p, i) =>
        i % 8 === 0 ? (
          <Line key={i} points={[p, points2[i]]} color="#fff" lineWidth={1} />
        ) : null
      )}
    </>
  );
}

function Contact3DIcon() {
  // 3D envelope using TorusKnot for a stylized look
  return (
    <Float speed={1.2} rotationIntensity={1.2} floatIntensity={1.2}>
      <TorusKnot args={[0.5, 0.18, 100, 16]}>
        <meshStandardMaterial color="#facc15" transparent opacity={0.7} />
      </TorusKnot>
    </Float>
  );
}

function FireEffect({ visible }: { visible: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      group.current.scale.set(1.2 + Math.sin(t * 16) * 0.18, 1.5 + Math.abs(Math.sin(t * 12)) * 0.3, 1.2 + Math.sin(t * 18) * 0.18);
      group.current.position.y = 1.4 + Math.sin(t * 10) * 0.09;
    }
  });
  if (!visible) return null;
  return (
    <group ref={group} position={[0, 1.2, 0]}>
      {/* Main flame */}
      <mesh>
        <coneGeometry args={[0.28, 0.8, 24]} />
        <meshStandardMaterial color="#ff3c00" transparent opacity={0.85} emissive="#ff3c00" emissiveIntensity={1.2} />
      </mesh>
      {/* Middle flame */}
      <mesh position={[0, 0.22, 0]}>
        <coneGeometry args={[0.16, 0.45, 20]} />
        <meshStandardMaterial color="#ffb300" transparent opacity={0.8} emissive="#ffb300" emissiveIntensity={1.5} />
      </mesh>
      {/* Inner flame */}
      <mesh position={[0, 0.36, 0]}>
        <coneGeometry args={[0.09, 0.22, 16]} />
        <meshStandardMaterial color="#fff176" transparent opacity={0.9} emissive="#fff176" emissiveIntensity={2.2} />
      </mesh>
      {/* Flicker spheres */}
      <mesh position={[0.13, 0.28, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#ffd54f" transparent opacity={0.8} emissive="#ffd54f" emissiveIntensity={1.7} />
      </mesh>
      <mesh position={[-0.11, 0.18, 0.03]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#ffb300" transparent opacity={0.8} emissive="#ffb300" emissiveIntensity={1.7} />
      </mesh>
    </group>
  );
}

function Stethoscope({ onClick, fire }: { onClick: () => void; fire: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.01;
      group.current.rotation.x += 0.005;
    }
  });
  return (
    <group ref={group} position={[0, 0, 0]} scale={[1.8, 1.8, 1.8]} onClick={onClick}>
      {/* Tube */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 3.2, 32]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Earpiece */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      {/* Diaphragm */}
      <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {/* Fire effect */}
      <FireEffect visible={fire} />
      {/* Cursor overlay for pointer */}
      <Html center position={[0, 0, 1.2]} style={{ pointerEvents: 'none' }}>
        <div style={{ width: 60, height: 60, cursor: 'pointer', position: 'absolute', top: 0, left: 0 }} />
      </Html>
    </group>
  );
}

export default function Home() {
  const [fire, setFire] = useState(false);
  React.useEffect(() => {
    if (fire) {
      const t = setTimeout(() => setFire(false), 2000);
      return () => clearTimeout(t);
    }
  }, [fire]);
  return (
    <main className={`bg-gradient-to-br from-[#0a0a0a] via-[#18181c] to-[#050509] min-h-screen w-full flex flex-col items-center ${pacifico.variable}`}>
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between py-24 px-6 md:px-20 gap-10" id="hero">
        <div className="flex-1 flex flex-col gap-6 items-start">
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-6xl md:text-8xl font-bold text-[#ff3c00] mb-4 drop-shadow-lg font-[var(--font-pacifico),cursive] italic">
            Welcome to <span className="text-[#ffd54f] font-[var(--font-pacifico),cursive] italic">HealthCareX</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-2xl md:text-3xl text-[#fff176] max-w-xl font-[var(--font-pacifico),cursive] italic font-bold drop-shadow">
            Your health, our priority. Modern, secure, and accessible healthcare for everyone.
          </motion.p>
          <motion.a href="#services" whileHover={{ scale: 1.05 }} className="mt-6 inline-block bg-[#ff3c00]/90 text-white font-bold px-10 py-5 rounded-2xl shadow-2xl hover:bg-[#ffd54f]/90 transition backdrop-blur-xl text-2xl font-[var(--font-pacifico),cursive] italic">
            Explore Services
          </motion.a>
        </div>
        <div className="flex-1 flex items-center justify-center min-h-[350px]">
          <Canvas style={{ height: 350, width: 350 }} camera={{ position: [0, 0, 5] }} shadows>
            <ambientLight intensity={1.1} />
            <directionalLight position={[2, 2, 2]} intensity={1.5} castShadow />
            {/* Glassy spheres with medical icons */}
            <GlassySphere color="#ff3c00" position={[-1.2, 0.7, 0]} icon="❤️" />
            <GlassySphere color="#ffd54f" position={[1.2, -0.7, 0]} icon="💊" />
            <GlassySphere color="#fff176" position={[0, 1.2, 0]} icon="🩺" />
            <GlassySphere color="#ffb300" position={[0.7, -1.2, 0]} icon="🧬" />
            {/* Improved Stethoscope 3D element with fire on click */}
            <Float speed={1.2} rotationIntensity={1.2} floatIntensity={1.2}>
              <Stethoscope onClick={() => setFire(true)} fire={fire} />
            </Float>
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="w-full max-w-6xl py-20 px-6 md:px-0 flex flex-col items-center">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-5xl md:text-6xl font-bold mb-12 text-[#ff3c00] drop-shadow font-[var(--font-pacifico),cursive] italic">Our Services</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
          {[{icon: "💬", color: "#ff3c00"}, {icon: "📋", color: "#ffd54f"}, {icon: "📅", color: "#fff176"}].map((service, i) => (
            <motion.div key={service.icon} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7 }} className="bg-[#18181c]/90 backdrop-blur-2xl rounded-2xl p-12 shadow-2xl flex flex-col items-center text-center border border-[#ff3c00]/30 hover:scale-105 hover:bg-[#0a0a0a]/90 transition-transform duration-300">
              <div className="w-24 h-24 mb-4 flex items-center justify-center">
                <Canvas style={{ height: 80, width: 80 }} camera={{ position: [0, 0, 2.5] }}>
                  <ambientLight intensity={0.7} />
                  <Service3DCard icon={service.icon} color={service.color} />
                </Canvas>
              </div>
              <h3 className="text-2xl font-bold text-[#ffd54f] mb-2 drop-shadow font-[var(--font-pacifico),cursive] italic">{i === 0 ? "24/7 Telemedicine" : i === 1 ? "EHR Management" : "Appointment Scheduling"}</h3>
              <p className="text-[#fff176] font-bold font-[var(--font-pacifico),cursive] italic">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod.</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="w-full max-w-4xl py-20 px-6 md:px-0 flex flex-col items-center">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-4xl md:text-5xl font-bold mb-8 text-cyan-400 drop-shadow font-[var(--font-pacifico),cursive] italic">About Us</motion.h2>
        <div className="w-full flex flex-col md:flex-row items-center gap-10">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-xl text-white/80 text-center md:text-left flex-1 font-[var(--font-pacifico),cursive] italic">
            HealthCareX is dedicated to providing innovative, secure, and accessible healthcare solutions. Our team of professionals is passionate about improving patient outcomes through technology and compassion.
          </motion.p>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <Canvas style={{ height: 220, width: 220 }} camera={{ position: [0, 0, 3] }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[2, 2, 2]} intensity={1.2} />
              <DNAHelix />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full max-w-2xl py-20 px-6 md:px-0 flex flex-col items-center">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-4xl md:text-5xl font-bold mb-8 text-cyan-400 drop-shadow font-[var(--font-pacifico),cursive] italic">Contact Us</motion.h2>
        <div className="w-full flex flex-col md:flex-row gap-8 items-center">
          <form className="w-full flex flex-col gap-4 bg-white/10 backdrop-blur-xl p-10 rounded-2xl border border-white/20 shadow-xl md:flex-1">
            <input type="text" placeholder="Your Name" className="bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 transition" />
            <input type="email" placeholder="Your Email" className="bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 transition" />
            <textarea placeholder="Your Message" className="bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 transition" rows={4} />
            <button type="submit" className="bg-cyan-400/80 text-black font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-cyan-300/80 transition backdrop-blur-xl">Send Message</button>
          </form>
          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            <Canvas style={{ height: 120, width: 120 }} camera={{ position: [0, 0, 2.5] }}>
              <ambientLight intensity={0.7} />
              <Contact3DIcon />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
        </div>
      </section>
    </main>
  );
}


