// ============================================================
// ChemFusion AI — Home Page
// ============================================================
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Atom, FlaskConical, Zap, Bot, LayoutDashboard, Mic,
  ArrowRight, ChevronDown, Star, Play
} from "lucide-react";
import AnimatedBackground from "@/components/features/AnimatedBackground";
import FeatureCard from "@/components/features/FeatureCard";
import { FEATURES, STATS, TESTIMONIALS } from "@/constants/chemistry";
import heroBg from "@/assets/hero-bg.jpg";
import { listVariants, itemVariants, sectionVariants } from "@/lib/animationVariants";
import { cardTransition, pageTransition, springTapTransition } from "@/lib/motionPresets";

const MotionLink = motion.create(Link);

const ICON_MAP: Record<string, React.ReactNode> = {
  Atom: <Atom size={22} />,
  FlaskConical: <FlaskConical size={22} />,
  Zap: <Zap size={22} />,
  Bot: <Bot size={22} />,
  Mic: <Mic size={22} />,
  LayoutDashboard: <LayoutDashboard size={22} />,
};

export default function Home() {
  return (
    <motion.div className="relative overflow-x-hidden" initial="initial" animate="animate" variants={sectionVariants} transition={pageTransition}>

      {/* ── Hero Section ────────────────────────────────────── */}
      <motion.section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={pageTransition}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Molecular background"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.25) saturate(1.5)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        </div>

        {/* Floating particles */}
        <AnimatedBackground count={20} />

        {/* Grid overlay */}
        <div className="absolute inset-0 chem-grid-bg opacity-30" />

        {/* Content */}
        <motion.div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center" initial="initial" animate="animate" variants={listVariants}>
          {/* Label */}
          <motion.div variants={itemVariants} transition={cardTransition} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.06)] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-[#00d4ff] tracking-wide">Next-Gen Chemistry Platform · Powered by AI</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} transition={cardTransition} className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">
            <span className="gradient-text">Explore Chemistry</span>
            <br />
            <span className="text-foreground">in the Age of AI</span>
          </motion.h1>

          <motion.p variants={itemVariants} transition={cardTransition} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Visualize 3D molecules, run virtual experiments, predict reactions with AI, and learn from your personal chemistry tutor — all in one platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} transition={cardTransition} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MotionLink to="/molecules" whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.96 }} transition={springTapTransition} className="btn-neon text-white flex items-center gap-2 py-3.5 px-8 text-base">
              <Atom size={18} />
              Explore Molecules
              <ArrowRight size={16} />
            </MotionLink>
            <MotionLink to="/predictor" whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.96 }} transition={springTapTransition} className="btn-ghost-neon flex items-center gap-2 py-3.5 px-8 text-base">
              <Play size={16} />
              Try AI Predictor
            </MotionLink>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div className="mt-16 flex justify-center" animate={{ y: [0, 4, 0], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown size={22} className="text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Stats Bar ───────────────────────────────────────── */}
      <motion.section className="py-10 border-y border-border/40 bg-muted/20" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={pageTransition}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6" variants={listVariants} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.4 }}>
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} transition={cardTransition} whileHover={{ y: -2, scale: 1.02 }} className="text-center">
                <div className="font-display font-bold text-3xl gradient-text-blue mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Features Grid ───────────────────────────────────── */}
      <motion.section className="py-20 px-4 sm:px-6 lg:px-8" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={pageTransition}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label mb-3 block">Everything You Need</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Chemistry Reimagined with <span className="gradient-text">Artificial Intelligence</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From molecular visualization to AI-powered reaction prediction — ChemFusion AI makes chemistry accessible, interactive, and engaging.
            </p>
          </div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={listVariants} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }}>
            {FEATURES.map((feature, i) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                href={feature.href}
                badge={feature.badge}
                icon={ICON_MAP[feature.icon] ?? <Atom size={22} />}
                index={i}
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Demo Section ────────────────────────────────────── */}
      <motion.section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={pageTransition}>
        <div className="absolute inset-0 chem-grid-bg opacity-20" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div className="grid lg:grid-cols-2 gap-12 items-center" variants={listVariants} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }}>
            {/* Left copy */}
            <motion.div variants={itemVariants} transition={cardTransition}>
              <span className="section-label mb-3 block">AI Reaction Predictor</span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-5">
                Predict Any Reaction <span className="gradient-text">Instantly</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Type any chemical reaction and our AI instantly generates balanced equations, identifies reaction types, predicts energy changes, and suggests industrial applications.
              </p>
              <ul className="space-y-3 mb-8">
                {["Balanced chemical equations in seconds", "Exothermic / Endothermic classification", "Industrial use cases and applications", "Safety warnings and handling tips"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <MotionLink to="/predictor" whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.96 }} transition={springTapTransition} className="btn-neon text-white inline-flex items-center gap-2">
                <Zap size={16} />
                Try AI Predictor Free
              </MotionLink>
            </motion.div>

            {/* Right card preview */}
            <motion.div variants={itemVariants} transition={cardTransition} className="glass-card p-6 glow-border-cyan">
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Processing...
              </div>
              <div className="font-mono text-sm text-[#00d4ff] mb-4">
                Input: N₂ + H₂ →
              </div>
              <div className="space-y-3">
                <div className="glass-card p-3">
                  <p className="text-xs text-muted-foreground mb-1">Balanced Equation</p>
                  <p className="text-sm font-semibold text-foreground">N₂ + 3H₂ → 2NH₃</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-3">
                    <p className="text-xs text-muted-foreground mb-1">Reaction Type</p>
                    <p className="text-sm font-semibold text-emerald-400">Haber Process</p>
                  </div>
                  <div className="glass-card p-3">
                    <p className="text-xs text-muted-foreground mb-1">Energy</p>
                    <p className="text-sm font-semibold text-orange-400">🔥 Exothermic</p>
                  </div>
                </div>
                <div className="glass-card p-3">
                  <p className="text-xs text-muted-foreground mb-1">ΔH (Enthalpy)</p>
                  <p className="text-sm font-semibold text-foreground">−92.4 kJ/mol</p>
                </div>
                <div className="glass-card p-3">
                  <p className="text-xs text-muted-foreground mb-2">Industrial Uses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Fertilizers", "Explosives", "Refrigerant"].map((use) => (
                      <span key={use} className="atom-badge text-[10px]">{use}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials and final CTA removed per request */}
    </motion.div>
  );
}
