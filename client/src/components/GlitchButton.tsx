import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props extends HTMLMotionProps<'button'> { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger' | 'void'; signal?: string }
export function GlitchButton({ children, variant = 'primary', signal, className = '', ...props }: Props) {
  return <motion.button whileTap={props.disabled ? undefined : { scale: .96, x: [0, -2, 2, 0] }} className={`glitch-button glitch-button--${variant} ${className}`} data-signal={signal ?? (typeof children === 'string' ? children : 'CLUE')} {...props}><span>{children}</span></motion.button>;
}
