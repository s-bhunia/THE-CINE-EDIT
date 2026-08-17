import { ENTRANCE_EASE, EXIT_EASE } from './easings';
import { ELEMENT_S } from './durations';

export const fadeInUp = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: ELEMENT_S, ease: ENTRANCE_EASE },
};

export const revealOnce = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { duration: ELEMENT_S, ease: ENTRANCE_EASE },
};

export const exitCut = {
  transition: { duration: ELEMENT_S, ease: EXIT_EASE },
};
