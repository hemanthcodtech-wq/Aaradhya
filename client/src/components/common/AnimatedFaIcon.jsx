import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedFaIcon: Renders a FontAwesome icon with subtle, premium Framer Motion animation
 * animations: 'float' | 'pulse' | 'spin-slow' | 'bounce-subtle' | 'wiggle'
 */
const AnimatedFaIcon = ({
  icon: Icon,
  size = 18,
  color = '#E90064',
  animation = 'pulse',
  className = '',
  style = {},
}) => {
  if (!Icon) return null;

  const animationVariants = {
    float: {
      y: [0, -4, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
    },
    pulse: {
      scale: [1, 1.12, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    wiggle: {
      rotate: [0, -8, 8, -6, 6, 0],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
    'spin-slow': {
      rotate: [0, 360],
      transition: { duration: 8, repeat: Infinity, ease: 'linear' },
    },
    'bounce-subtle': {
      y: [0, -5, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const selectedAnimation = animationVariants[animation] || animationVariants.pulse;

  return (
    <motion.span
      className={`d-inline-flex align-items-center justify-content-center ${className}`}
      animate={selectedAnimation}
      whileHover={{ scale: 1.25, rotate: 12 }}
      style={{
        display: 'inline-flex',
        verticalAlign: 'middle',
        color,
        fontSize: typeof size === 'number' ? `${size}px` : size,
        ...style,
      }}
    >
      <Icon />
    </motion.span>
  );
};

export default AnimatedFaIcon;
