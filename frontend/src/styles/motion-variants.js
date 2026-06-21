/**
 * GLOBAL MOTION CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Enterprise-grade animation constants and variants for Framer Motion.
 * Focus: Smooth, subtle, premium SaaS aesthetic.
 * 
 * DESIGN PRINCIPLES:
 * - No bouncing or flashy effects
 * - Smooth cubic-bezier easing [0.16, 1, 0.3, 1]
 * - Subtle movement (y: 10-20px)
 * - Intelligent staggering
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Timing constants
export const TIMING = {
  hover: 0.2,
  fieldFocus: 0.25,
  staggerReveal: 0.08, // Time between children
  sectionTransition: 0.5,
  quick: 0.15,
  standard: 0.35,
  slow: 0.6
};

// Easing constants
export const EASING = {
  smooth: [0.16, 1, 0.3, 1], // Custom cubic-bezier for enterprise feel
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  standard: [0.4, 0, 0.2, 1]
};

// Global Motion Variants
export const VARIANTS = {
  // Page/Container entrance
  pageContainer: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: TIMING.sectionTransition,
        ease: EASING.smooth,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: TIMING.standard, ease: EASING.smooth }
    }
  },

  // Section entrance with stagger
  section: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: TIMING.sectionTransition,
        ease: EASING.smooth,
        staggerChildren: TIMING.staggerReveal
      }
    }
  },

  // Individual field entrance
  field: {
    initial: { opacity: 0, y: 12 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: TIMING.standard,
        ease: EASING.smooth
      }
    }
  },

  // Subtle hover effect for interactive elements
  hover: {
    scale: 1.01,
    y: -1,
    transition: { duration: TIMING.hover, ease: EASING.easeOut }
  },

  // Field focus highlight (Emerald glow)
  focus: {
    scale: 1,
    boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.15)",
    borderColor: "#10b981",
    transition: { duration: TIMING.fieldFocus, ease: EASING.smooth }
  },

  // Validation feedback
  error: {
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.4 }
  },

  // Fade-in list items
  listItem: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: TIMING.standard, ease: EASING.smooth }
  },

  // Ambient background animation
  ambient: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.5, 0.3],
      rotate: [0, 5, 0],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },

  // Layout/Height expansion
  expandable: {
    initial: { height: 0, opacity: 0 },
    animate: { 
      height: "auto", 
      opacity: 1,
      transition: { duration: 0.4, ease: EASING.smooth }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: { duration: 0.3, ease: EASING.easeInOut }
    }
  },

  // Button micro-interaction
  button: {
    rest: { scale: 1 },
    hover: { scale: 1.02, y: -1 },
    tap: { scale: 0.98, y: 0 }
  },

  // Icon interaction
  icon: {
    rest: { rotate: 0 },
    hover: { rotate: 15, scale: 1.1 },
    tap: { scale: 0.9 }
  }
};
