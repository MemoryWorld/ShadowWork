// src/lib/animation.ts
import { Variants } from 'framer-motion';

/**
 * Linear-style fade up animation
 * - subtle
 * - fast
 * - no visual noise
 */
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    clipPath: 'inset(0 100% 0 0)', // 右侧全部裁掉
  },
  visible: (delay = 0) => ({
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)', // 完整显示
    transition: {
      delay,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1], // Linear / iOS easing
    },
  }),
};