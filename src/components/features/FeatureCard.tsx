// ============================================================
// ChemFusion AI — Feature Card Component
// ============================================================
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardVariants } from "@/lib/animationVariants";
import { cardTransition, springTapTransition } from "@/lib/motionPresets";

const MotionLink = motion.create(Link);

interface FeatureCardProps {
  title: string;
  description: string;
  gradient: string;
  href: string;
  badge?: string;
  icon: React.ReactNode;
  index?: number;
}

export default function FeatureCard({
  title,
  description,
  gradient,
  href,
  badge,
  icon,
  index = 0,
}: FeatureCardProps) {
  return (
    <MotionLink
      to={href}
      className="glass-card-hover group block p-6 cursor-pointer"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.96 }}
      transition={cardTransition}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
            gradient
          )}
        >
          {icon}
        </div>
        {badge && (
          <span className="atom-badge text-[10px]">{badge}</span>
        )}
      </div>

      {/* Content */}
      <h3 className="font-display font-semibold text-base text-foreground mb-2 group-hover:text-[#00d4ff] transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>

      {/* CTA */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span>Explore</span>
        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Bottom gradient accent */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl",
          gradient
        )}
      />
    </MotionLink>
  );
}
