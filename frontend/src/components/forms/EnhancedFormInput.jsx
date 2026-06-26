import React, { useRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ENHANCED FORM INPUT COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium input component with Framer Motion animations:
 * - Animated floating labels (glides to top border)
 * - Active field spotlight & elevation effect (y: -2, emerald glow)
 * - AnimatePresence validation state transitions
 * - Password visibility toggle
 * - Error/success indicators
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const EnhancedFormInput = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  success,
  isShaking = false,
  isSpotlight = false,
  required = false,
  disabled = false,
  staggerDelay = 0,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const isPasswordField = type === 'password';
  const isDateField = type === 'date';
  const displayType = isPasswordField && showPassword ? 'text' : type;
  
  // Force label to be active for date inputs or when focused/has value
  const active = isFocused || isSpotlight || isDateField || (value !== undefined && value !== null && value !== '');

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const containerClasses = [
    'form-field',
    error && 'form-field-error',
    success && 'form-field-success',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: staggerDelay * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        marginBottom: '16px',
        width: '100%',
      }}
    >
      {/* ANIMATED FLOATING LABEL */}
      {label && (
        <motion.label
          initial={false}
          animate={{
            top: active ? '-11px' : '14px', // Perfectly centered on border
            left: active ? '12px' : '16px',
            scale: active ? 0.82 : 1,
            color: active ? '#10b981' : '#64748b',
          }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            position: 'absolute',
            transformOrigin: 'left top',
            pointerEvents: 'none',
            zIndex: 4,
            padding: '0 6px',
            background: active ? 'var(--card, #161b2e)' : 'transparent',
            borderRadius: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </motion.label>
      )}

      {/* INPUT CONTAINER WITH SPOTLIGHT & ELEVATION */}
      <motion.div
        animate={{
          boxShadow: (isFocused || isSpotlight)
            ? '0 4px 20px -2px rgba(16, 185, 129, 0.15), 0 0 0 2px rgba(16, 185, 129, 0.2)'
            : error
              ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
              : success
                ? '0 0 0 2px rgba(16, 185, 129, 0.2)'
                : '0 2px 4px rgba(0,0,0,0.02)',
          y: (isFocused || isSpotlight) ? -2 : 0,
          x: isShaking ? [0, -6, 6, -6, 6, 0] : 0,
        }}
        transition={{
          boxShadow: { duration: 0.2 },
          y: { duration: 0.2 },
          x: { duration: 0.3, ease: 'easeInOut' }
        }}
        style={{
          position: 'relative',
          borderRadius: '10px',
          background: 'var(--bg, #f8fafc)',
        }}
      >
        <input
          ref={inputRef}
          name={name}
          type={displayType}
          placeholder={active ? (placeholder || label) : ''}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: `1.5px solid ${error ? '#ef4444' : success ? '#10b981' : (isFocused || isSpotlight) ? '#10b981' : 'var(--border, rgba(255,255,255,0.1))'}`,
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: 'var(--text, #ffffff)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            background: 'transparent',
            // Fix for autofill background - match card color
            WebkitBoxShadow: '0 0 0px 1000px #161b2e inset',
            WebkitTextFillColor: 'var(--text, #ffffff)',
            transitionDelay: '9999s', 
          }}
          {...props}
        />

        {/* PASSWORD VISIBILITY TOGGLE */}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-muted, #64748b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 200ms',
              zIndex: 2,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#10b981')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* SUCCESS CHECKMARK */}
        {success && !error && !isPasswordField && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#10b981',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '700',
              zIndex: 2,
            }}
          >
            ✓
          </motion.div>
        )}
      </motion.div>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#ef4444',
              marginTop: '4px',
              fontWeight: '600',
              overflow: 'hidden',
            }}
          >
            <AlertCircle size={12} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * ENHANCED FORM SELECT COMPONENT
 * ───────────────────────────────────────────────────────────────────────────
 */
export const EnhancedFormSelect = ({
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  options = [],
  error,
  success,
  isShaking = false,
  isSpotlight = false,
  required = false,
  disabled = false,
  staggerDelay = 0,
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = React.useRef(null);

  const active = isFocused || isSpotlight || (value !== undefined && value !== null && value !== '');

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const containerClasses = [
    'form-field',
    error && 'form-field-error',
    success && 'form-field-success',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: staggerDelay * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        marginBottom: '16px',
        width: '100%',
      }}
    >
      {/* LABEL */}
      {label && (
        <motion.label
          initial={false}
          animate={{
            top: active ? '-10px' : '13px',
            left: active ? '12px' : '14px',
            scale: active ? 0.82 : 1,
            color: active ? '#10b981' : '#64748b',
          }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            position: 'absolute',
            transformOrigin: 'left top',
            pointerEvents: 'none',
            zIndex: 3,
            padding: '0 6px',
            background: active ? 'var(--bg, #f8fafc)' : 'transparent',
            borderRadius: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </motion.label>
      )}

      {/* SELECT WRAPPER */}
      <motion.div
        animate={{
          boxShadow: (isFocused || isSpotlight)
            ? '0 4px 20px -2px rgba(16, 185, 129, 0.15), 0 0 0 2px rgba(16, 185, 129, 0.2)'
            : error
              ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
              : success
                ? '0 0 0 2px rgba(16, 185, 129, 0.2)'
                : '0 2px 4px rgba(0,0,0,0.02)',
          y: (isFocused || isSpotlight) ? -2 : 0,
          x: isShaking ? [0, -6, 6, -6, 6, 0] : 0,
        }}
        transition={{
          boxShadow: { duration: 0.2 },
          y: { duration: 0.2 },
          x: { duration: 0.3, ease: 'easeInOut' }
        }}
        style={{
          position: 'relative',
          borderRadius: '10px',
          background: 'var(--bg, #f8fafc)',
        }}
      >
        <select
          ref={selectRef}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '12px 14px',
            paddingRight: '36px',
            border: `1.5px solid ${error ? '#ef4444' : success ? '#10b981' : (isFocused || isSpotlight) ? '#10b981' : 'var(--border, #e2e8f0)'}`,
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: 'var(--text, #1e293b)',
            outline: 'none',
            background: 'transparent',
            cursor: 'pointer',
            appearance: 'none',
            transition: 'border-color 0.2s ease',
          }}
          {...props}
        >
          {placeholder && <option value="" disabled hidden={active}>{active ? placeholder : ''}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* DROPDOWN ARROW */}
        <div
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${isFocused ? '#10b981' : '#64748b'}`,
              transition: 'border-top-color 0.2s ease',
            }}
          />
        </div>
      </motion.div>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#ef4444',
              marginTop: '4px',
              fontWeight: '600',
              overflow: 'hidden',
            }}
          >
            <AlertCircle size={12} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * ENHANCED FORM TEXTAREA COMPONENT
 * ───────────────────────────────────────────────────────────────────────────
 */
export const EnhancedFormTextarea = ({
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  error,
  success,
  isShaking = false,
  isSpotlight = false,
  required = false,
  disabled = false,
  staggerDelay = 0,
  rows = 4,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = React.useRef(null);

  const active = isFocused || isSpotlight || (value !== undefined && value !== null && value !== '');

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const containerClasses = [
    'form-field',
    error && 'form-field-error',
    success && 'form-field-success',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: staggerDelay * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        marginBottom: '16px',
        width: '100%',
      }}
    >
      {/* LABEL */}
      {label && (
        <motion.label
          initial={false}
          animate={{
            top: active ? '-10px' : '13px',
            left: active ? '12px' : '14px',
            scale: active ? 0.82 : 1,
            color: active ? '#10b981' : '#64748b',
          }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            position: 'absolute',
            transformOrigin: 'left top',
            pointerEvents: 'none',
            zIndex: 3,
            padding: '0 6px',
            background: active ? 'var(--bg, #f8fafc)' : 'transparent',
            borderRadius: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </motion.label>
      )}

      {/* TEXTAREA */}
      <motion.div
        animate={{
          boxShadow: (isFocused || isSpotlight)
            ? '0 4px 20px -2px rgba(16, 185, 129, 0.15), 0 0 0 2px rgba(16, 185, 129, 0.2)'
            : error
              ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
              : success
                ? '0 0 0 2px rgba(16, 185, 129, 0.2)'
                : '0 2px 4px rgba(0,0,0,0.02)',
          y: (isFocused || isSpotlight) ? -2 : 0,
          x: isShaking ? [0, -6, 6, -6, 6, 0] : 0,
        }}
        transition={{
          boxShadow: { duration: 0.2 },
          y: { duration: 0.2 },
          x: { duration: 0.3, ease: 'easeInOut' }
        }}
        style={{
          position: 'relative',
          borderRadius: '10px',
          background: 'var(--bg, #f8fafc)',
        }}
      >
        <textarea
          ref={textareaRef}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={active ? (placeholder || label) : ''}
          disabled={disabled}
          rows={rows}
          style={{
            width: '100%',
            padding: '12px 14px',
            border: `1.5px solid ${error ? '#ef4444' : success ? '#10b981' : (isFocused || isSpotlight) ? '#10b981' : 'var(--border, #e2e8f0)'}`,
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: 'var(--text, #1e293b)',
            outline: 'none',
            background: 'transparent',
            resize: 'vertical',
            minHeight: '90px',
            transition: 'border-color 0.2s ease',
          }}
          {...props}
        />
      </motion.div>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#ef4444',
              marginTop: '4px',
              fontWeight: '600',
              overflow: 'hidden',
            }}
          >
            <AlertCircle size={12} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedFormInput;
