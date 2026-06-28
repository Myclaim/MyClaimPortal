import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VARIANTS, TIMING } from '../../styles/motion-variants';

/**
 * FORM ANIMATION WRAPPER
 * ═══════════════════════════════════════════════════════════════════════════
 * Wraps the entire form page to provide initial entrance and stagger logic.
 */
export const FormAnimationWrapper = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={VARIANTS.pageContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * MOTION SECTION
 * ═══════════════════════════════════════════════════════════════════════════
 * Animates a group of related fields (e.g., Personal Info, Address).
 */
export const MotionSection = ({ children, title, className = "", delay = 0 }) => {
  return (
    <motion.div
      variants={VARIANTS.section}
      className={`form-animation-section ${className}`}
      style={{ marginBottom: '32px' }}
    >
      {title && (
        <motion.h3 
          variants={VARIANTS.field}
          className="section-title-animated"
          style={{
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#10b981', // Emerald green
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(16, 185, 129, 0.1)'
          }}
        >
          {title}
        </motion.h3>
      )}
      <div className="section-content-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Increased min-width for better stability
        gap: '24px',
        alignItems: 'start' // Ensure items align at the top
      }}>
        {children}
      </div>
    </motion.div>
  );
};

/**
 * MOTION FIELD
 * ═══════════════════════════════════════════════════════════════════════════
 * Wraps individual input fields for smooth staggered entrance.
 */
export const MotionField = ({ children, className = "", fullWidth = false }) => {
  return (
    <motion.div
      variants={VARIANTS.field}
      className={`motion-field-wrap ${className}`}
      style={{ 
        gridColumn: fullWidth ? '1 / -1' : 'span 1',
        width: '100%'
      }}
      whileHover="hover"
    >
      {children}
    </motion.div>
  );
};

/**
 * MOTION SELECT
 * ═══════════════════════════════════════════════════════════════════════════
 * Custom animated select component.
 */
export const MotionSelect = ({ label, name, value, onChange, options, error, required }) => {
  return (
    <MotionField>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
          <select
            name={name}
            value={value}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1.5px solid var(--border)',
              borderRadius: '10px',
              background: 'var(--bg)',
              color: 'var(--text)',
              appearance: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => (e.target.style.borderColor = '#10b981')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          >
            <option value="" disabled>Select {label}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #64748b'
          }} />
        </div>
        {error && <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>{error}</span>}
      </div>
    </MotionField>
  );
};

/**
 * MOTION RADIO GROUP
 * ═══════════════════════════════════════════════════════════════════════════
 * Animated radio button group.
 */
export const MotionRadioGroup = ({ label, name, value, onChange, options, fullWidth = false }) => {
  return (
    <MotionField fullWidth={fullWidth}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{label}</label>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {options.map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={onChange}
                style={{ display: 'none' }}
              />
              <motion.div
                animate={{
                  backgroundColor: value === opt.value ? '#10b981' : 'transparent',
                  borderColor: value === opt.value ? '#10b981' : 'var(--border)',
                  scale: value === opt.value ? 1.1 : 1
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {value === opt.value && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
              </motion.div>
              <span style={{ fontSize: '14px', color: 'var(--text)' }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </MotionField>
  );
};

/**
 * MOTION FILE UPLOAD
 * ═══════════════════════════════════════════════════════════════════════════
 * Premium file upload field with smooth animations.
 */
export const MotionFile = ({ label, id, fileName, onChange, accept }) => {
  return (
    <MotionField>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{label}</label>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          border: '1.5px solid var(--border)',
          borderRadius: '10px',
          background: 'var(--bg)',
          overflow: 'hidden',
          transition: 'all 0.2s'
        }}
        className="file-field-container"
        >
          <button
            type="button"
            onClick={() => document.getElementById(id).click()}
            style={{
              padding: '10px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: 'none',
              borderRight: '1.5px solid var(--border)',
              fontFamily: 'inherit',
              fontSize: '13.5px',
              fontWeight: '600',
              color: '#10b981',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => (e.target.style.background = 'rgba(16, 185, 129, 0.15)')}
            onMouseLeave={(e) => (e.target.style.background = 'rgba(16, 185, 129, 0.1)')}
          >
            Choose File
          </button>
          <span style={{
            padding: '10px 14px',
            fontSize: '13.5px',
            color: fileName ? 'var(--text)' : '#64748b',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {fileName || 'No file chosen'}
          </span>
          <input
            type="file"
            id={id}
            accept={accept}
            onChange={onChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </MotionField>
  );
};

/**
 * MOTION TEXTAREA
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const MotionTextArea = ({ label, name, value, onChange, placeholder, fullWidth = false }) => {
  return (
    <MotionField fullWidth={fullWidth}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>{label}</label>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            background: 'var(--bg)',
            color: 'var(--text)',
            minHeight: '100px',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'all 0.2s'
          }}
          onFocus={(e) => (e.target.style.borderColor = '#10b981')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>
    </MotionField>
  );
};

/**
 * EXPANDABLE SECTION
 * ═══════════════════════════════════════════════════════════════════════════
 * Layout animation for expanding/collapsing content.
 */
export const ExpandableSection = ({ isOpen, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={VARIANTS.expandable}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * AMBIENT BACKGROUND
 * ═══════════════════════════════════════════════════════════════════════════
 * Subtle animated background elements for enterprise SaaS feel.
 */
export const AmbientBackground = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
      <motion.div
        variants={VARIANTS.ambient}
        animate="animate"
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <motion.div
        variants={VARIANTS.ambient}
        animate="animate"
        style={{
          position: 'absolute',
          bottom: '-5%',
          left: '-5%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.02) 0%, transparent 70%)',
          borderRadius: '50%',
          animationDelay: '-5s'
        }}
      />
    </div>
  );
};

/**
 * MOTION BUTTON
 * ═══════════════════════════════════════════════════════════════════════════
 * Standardized animated button with microinteractions.
 */
export const MotionButton = ({ children, onClick, type = "button", variant = "primary", disabled = false, className = "", style = {} }) => {
  const baseStyle = {
    padding: '12px 24px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14px',
    fontFamily: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background 0.2s',
    ...style
  };

  const variants = {
    primary: {
      background: '#10b981',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: '#10b981',
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      variants={VARIANTS.button}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={className}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </motion.button>
  );
};

/**
 * FORM SPLASH SCREEN
 * ═══════════════════════════════════════════════════════════════════════════
 * Premium splash transition for part-based forms.
 */
export const FormSplashScreen = ({ title, subtitle, onComplete }) => {
  React.useEffect(() => {
<<<<<<< HEAD
    const timer = setTimeout(onComplete, 2000);
=======
    const timer = setTimeout(onComplete, 400);
>>>>>>> 9cb87025bea4640e9ef29ca9ba9501c3bb704586
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 100,
        borderRadius: '16px'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ width: '24px', height: '24px', border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%' }}
          />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>{title}</h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>{subtitle}</p>
      </motion.div>
    </motion.div>
  );
};

/**
 * STEP TRANSITION
 * ═══════════════════════════════════════════════════════════════════════════
 * Smooth slide transition between form parts.
 */
export const StepTransition = ({ children, stepKey }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * GLOWING CARD WRAPPER
 * ═══════════════════════════════════════════════════════════════════════════
 * Enterprise SaaS glassmorphism card with subtle ambient glow.
 */
export const GlowingCard = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={VARIANTS.section}
      className={`premium-form-card ${className}`}
      style={{
        background: 'rgba(15, 23, 42, 0.8)', // Dark navy/black
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.03)',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle ambient glow effect */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
};
