import type { Transition } from "framer-motion";

export const pageTransition: Transition = {
  duration: 0.38,
  ease: [0.16, 1, 0.3, 1],
};

export const cardTransition: Transition = {
  duration: 0.22,
  ease: [0.2, 0.8, 0.2, 1],
};

export const modalTransition: Transition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1],
};

export const sidebarTransition: Transition = {
  duration: 0.26,
  ease: [0.2, 0.8, 0.2, 1],
};

export const springTapTransition: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 32,
};
