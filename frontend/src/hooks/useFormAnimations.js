import { useState, useCallback, useEffect } from 'react';

/**
 * USEFORMANIMATIONS HOOK
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Manages form animation states, field visibility, progress tracking,
 * and validation feedback animations across the form lifecycle.
 * 
 * Features:
 * - Progressive field reveal with stagger timing
 * - Section collapse/expand management
 * - Validation state tracking with animation triggers
 * - Progress calculation for multi-step forms
 * - Field spotlight effect coordination
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const useFormAnimations = (totalSteps = 1, fieldsPerSection = []) => {
  // ───────────────────────────────────────────────────────────────────────
  // STATE: Animation & Visibility
  // ───────────────────────────────────────────────────────────────────────
  
  const [currentStep, setCurrentStep] = useState(1);
  const [visibleFields, setVisibleFields] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldSuccess, setFieldSuccessState] = useState({});
  const [fieldSpotlight, setFieldSpotlight] = useState(null);
  const [isShaking, setIsShaking] = useState({});

  // ───────────────────────────────────────────────────────────────────────
  // ANIMATION TRIGGERS: Field Reveal with Stagger
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Reveal fields sequentially with staggered animation
   * Respects the stagger timing defined in CSS (40-60ms intervals)
   */
  const revealFieldsSequentially = useCallback((sectionKey, fieldNames = []) => {
    fieldNames.forEach((fieldName, index) => {
      setTimeout(() => {
        setVisibleFields(prev => ({
          ...prev,
          [`${sectionKey}-${fieldName}`]: true
        }));
      }, index * 50); // 50ms stagger per field
    });
  }, []);

  /**
   * Reveal entire section with all its fields
   */
  const revealSection = useCallback((sectionKey) => {
    setVisibleFields(prev => ({
      ...prev,
      [sectionKey]: true
    }));
  }, []);

  /**
   * Collapse section elegantly
   */
  const collapseSection = useCallback((sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: true
    }));
  }, []);

  /**
   * Expand previously collapsed section
   */
  const expandSection = useCallback((sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: false
    }));
  }, []);

  // ───────────────────────────────────────────────────────────────────────
  // VALIDATION ANIMATIONS
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Set field error state with micro-shake animation
   */
  const setFieldError = useCallback((fieldName, errorMessage) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));

    // Trigger shake animation
    setIsShaking(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Clear shake state after animation completes
    setTimeout(() => {
      setIsShaking(prev => ({
        ...prev,
        [fieldName]: false
      }));
    }, 300);

    // Auto-clear error after 4 seconds if no new interaction
    const timeout = setTimeout(() => {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  /**
   * Clear field error
   */
  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Set field success state with checkmark animation
   */
  const setFieldSuccess = useCallback((fieldName, duration = 2000) => {
    setFieldSuccessState(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Auto-clear success state after duration
    const timeout = setTimeout(() => {
      setFieldSuccessState(prev => {
        const newSuccess = { ...prev };
        delete newSuccess[fieldName];
        return newSuccess;
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, []);

  /**
   * Clear field success state
   */
  const clearFieldSuccess = useCallback((fieldName) => {
    setFieldSuccessState(prev => {
      const newSuccess = { ...prev };
      delete newSuccess[fieldName];
      return newSuccess;
    });
  }, []);

  // ───────────────────────────────────────────────────────────────────────
  // SPOTLIGHT EFFECT
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Activate spotlight effect on field focus
   */
  const activateFieldSpotlight = useCallback((fieldName) => {
    setFieldSpotlight(fieldName);
  }, []);

  /**
   * Deactivate spotlight effect on field blur
   */
  const deactivateFieldSpotlight = useCallback(() => {
    setFieldSpotlight(null);
  }, []);

  // ───────────────────────────────────────────────────────────────────────
  // PROGRESS TRACKING
  // ───────────────────────────────────────────────────────────────────────

  const progressPercentage = (currentStep / totalSteps) * 100;

  /**
   * Move to next step with animation
   */
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  /**
   * Move to previous step
   */
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  /**
   * Jump to specific step
   */
  const goToStep = useCallback((stepNum) => {
    if (stepNum >= 1 && stepNum <= totalSteps) {
      setCurrentStep(stepNum);
    }
  }, [totalSteps]);

  // ───────────────────────────────────────────────────────────────────────
  // BATCH OPERATIONS
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Clear all animation states (useful on form reset)
   */
  const resetAnimations = useCallback(() => {
    setCurrentStep(1);
    setVisibleFields({});
    setCollapsedSections({});
    setFieldErrors({});
    setFieldSuccess({});
    setFieldSpotlight(null);
    setIsShaking({});
  }, []);

  /**
   * Get CSS class names for a field based on animation state
   */
  const getFieldClasses = useCallback((fieldName, baseClass = '') => {
    let classes = [baseClass];

    if (fieldErrors[fieldName]) {
      classes.push('form-field-error');
      if (isShaking[fieldName]) {
        classes.push('shake');
      }
    }

    if (fieldSuccess[fieldName]) {
      classes.push('form-field-success');
    }

    if (fieldSpotlight === fieldName) {
      classes.push('form-field-spotlight');
    }

    return classes.filter(Boolean).join(' ');
  }, [fieldErrors, fieldSuccess, fieldSpotlight, isShaking]);

  /**
   * Get stagger delay class for field index
   */
  const getStaggerDelayClass = useCallback((index) => {
    const delays = [
      'form-field-delay-1',
      'form-field-delay-2',
      'form-field-delay-3',
      'form-field-delay-4',
      'form-field-delay-5',
      'form-field-delay-6',
      'form-field-delay-7',
      'form-field-delay-8',
      'form-field-delay-9',
      'form-field-delay-10',
    ];
    return delays[Math.min(index, delays.length - 1)] || '';
  }, []);

  return {
    // STATE
    currentStep,
    progressPercentage,
    visibleFields,
    collapsedSections,
    fieldErrors,
    fieldSuccess,
    fieldSpotlight,
    isShaking,

    // FIELD REVEAL
    revealFieldsSequentially,
    revealSection,

    // SECTION COLLAPSE
    collapseSection,
    expandSection,

    // VALIDATION
    setFieldError,
    clearFieldError,
    setFieldSuccess,
    clearFieldSuccess,

    // SPOTLIGHT
    activateFieldSpotlight,
    deactivateFieldSpotlight,

    // PROGRESS
    nextStep,
    prevStep,
    goToStep,

    // UTILITIES
    resetAnimations,
    getFieldClasses,
    getStaggerDelayClass,
  };
};

/**
 * USEVALIDATIONANIMATION HOOK
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * Simplified hook for just validation animations on individual fields.
 * Useful for form components that handle their own validation logic.
 */
export const useValidationAnimation = () => {
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [shaking, setShaking] = useState({});

  const showError = useCallback((fieldName, message) => {
    setErrors(prev => ({ ...prev, [fieldName]: message }));
    setShaking(prev => ({ ...prev, [fieldName]: true }));

    setTimeout(() => {
      setShaking(prev => ({ ...prev, [fieldName]: false }));
    }, 300);
  }, []);

  const clearError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const showSuccess = useCallback((fieldName, duration = 1500) => {
    setSuccess(prev => ({ ...prev, [fieldName]: true }));
    setTimeout(() => {
      setSuccess(prev => {
        const newSuccess = { ...prev };
        delete newSuccess[fieldName];
        return newSuccess;
      });
    }, duration);
  }, []);

  return { errors, success, shaking, showError, clearError, showSuccess };
};

/**
 * USEUPLOADANIMATION HOOK
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * Manages upload zone drag states, progress animation, and file card reveals.
 */
export const useUploadAnimation = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    return e.dataTransfer?.files || [];
  }, []);

  const addFileCard = useCallback((fileName, fileSize) => {
    setUploadedFiles(prev => [...prev, {
      id: Date.now(),
      name: fileName,
      size: fileSize,
      timestamp: new Date()
    }]);
  }, []);

  const removeFileCard = useCallback((fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const animateProgress = useCallback((targetProgress) => {
    let current = uploadProgress;
    const interval = setInterval(() => {
      current = Math.min(current + Math.random() * 30, targetProgress);
      setUploadProgress(current);
      if (current >= targetProgress) {
        clearInterval(interval);
      }
    }, 100);
  }, [uploadProgress]);

  return {
    isDragging,
    uploadProgress,
    uploadedFiles,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    addFileCard,
    removeFileCard,
    animateProgress,
    setUploadProgress,
    setUploadedFiles,
  };
};

export default useFormAnimations;
