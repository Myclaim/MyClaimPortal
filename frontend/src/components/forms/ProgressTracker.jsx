import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * PROGRESS TRACKER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Enterprise-grade progress indicator for multi-step forms with:
 * - Animated progress bar fill
 * - Active step pulse animation
 * - Completed step checkmark reveal
 * - Smooth step transitions
 * - Premium dark theme styling
 * 
 * USAGE:
 * <ProgressTracker
 *   currentStep={2}
 *   totalSteps={8}
 *   steps={[
 *     { label: 'Account', icon: '👤' },
 *     { label: 'Personal', icon: '📋' },
 *     { label: 'Contact', icon: '📞' },
 *   ]}
 * />
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ProgressTracker = ({
  currentStep = 1,
  totalSteps = 5,
  steps = [],
  onStepClick,
  compact = false,
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Generate steps if not provided
  const displaySteps = steps.length
    ? steps
    : Array.from({ length: totalSteps }, (_, i) => ({
        label: `Step ${i + 1}`,
        icon: String.fromCharCode(9312 + i), // Circled numbers
      }));

  return (
    <div
      className="progress-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        background: 'rgba(16, 185, 129, 0.04)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(16, 185, 129, 0.12)',
      }}
    >
      {!compact && (
        <>
          {/* PROGRESS BAR */}
          <div
            className="progress-bar"
            style={{
              flex: 1,
              height: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              className="progress-bar-fill"
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #22c55e)',
                borderRadius: '3px',
                width: `${progressPercentage}%`,
                animation: `progressLineFill 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                '--progress': `${progressPercentage}%`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  height: '100%',
                  width: '20px',
                  background: 'linear-gradient(90deg, rgba(16, 185, 129, 1), rgba(16, 185, 129, 0))',
                  animation: 'progressPulse 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          {/* STEP INDICATORS */}
          <div
            className="progress-steps"
            style={{
              display: 'flex',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            {displaySteps.slice(0, 4).map((step, idx) => (
              <div
                key={idx}
                className={`progress-step ${currentStep > idx + 1 ? 'completed' : currentStep === idx + 1 ? 'active' : ''}`}
                onClick={() => onStepClick?.(idx + 1)}
                role={onStepClick ? 'button' : undefined}
                tabIndex={onStepClick ? 0 : -1}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentStep > idx + 1 ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                  border: `1.5px solid ${currentStep > idx + 1 ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: currentStep > idx + 1 ? 'white' : 'var(--text-muted, #9ca3af)',
                  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: onStepClick ? 'pointer' : 'default',
                  animation:
                    currentStep === idx + 1
                      ? 'progressStepGlow 1s ease-out'
                      : currentStep > idx + 1
                        ? 'progressCheckReveal 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
                        : 'none',
                }}
                title={step.label}
              >
                {currentStep > idx + 1 ? '✓' : idx + 1}
              </div>
            ))}
          </div>

          {/* TEXT LABEL */}
          <div
            className="progress-text"
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-muted, #9ca3af)',
              whiteSpace: 'nowrap',
              minWidth: '80px',
              textAlign: 'right',
            }}
          >
            <span className="progress-text-current" style={{ color: 'var(--text, #ffffff)' }}>
              {currentStep}
            </span>
            <span> / {totalSteps}</span>
          </div>
        </>
      )}

      {compact && (
        // Compact version for sidebars
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text, #ffffff)' }}>
            {currentStep} / {totalSteps}
          </div>
          <div style={{ flex: 1, height: '4px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #22c55e)',
                width: `${progressPercentage}%`,
                transition: 'width 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * VERTICAL PROGRESS TRACKER
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * Vertical step indicator (often used in sidebars).
 * Shows all steps with completion status.
 */
export const VerticalProgressTracker = ({
  currentStep = 1,
  totalSteps = 5,
  steps = [],
  onStepClick,
  compact = false,
}) => {
  const displaySteps = steps.length
    ? steps
    : Array.from({ length: totalSteps }, (_, i) => ({
        label: `Step ${i + 1}`,
        icon: String.fromCharCode(9312 + i),
      }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {displaySteps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        const isUpcoming = stepNum > currentStep;

        return (
          <div
            key={idx}
            onClick={() => onStepClick?.(stepNum)}
            role={onStepClick && isCompleted ? 'button' : undefined}
            tabIndex={onStepClick && isCompleted ? 0 : -1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: isActive
                ? 'rgba(16, 185, 129, 0.1)'
                : isCompleted
                  ? 'transparent'
                  : 'transparent',
              border: isActive
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid transparent',
              cursor: onStepClick && isCompleted ? 'pointer' : 'default',
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isUpcoming ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (onStepClick && isCompleted) {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (onStepClick && isCompleted) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            {/* STEP INDICATOR */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: isCompleted
                  ? '#10b981'
                  : isActive
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(16, 185, 129, 0.1)',
                border: `1.5px solid ${isCompleted || isActive ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: isCompleted ? 'white' : isActive ? '#10b981' : 'var(--text-muted, #9ca3af)',
                flexShrink: 0,
                animation:
                  isActive && !compact
                    ? 'progressStepGlow 1s ease-out infinite'
                    : isCompleted
                      ? 'progressCheckReveal 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
                      : 'none',
              }}
            >
              {isCompleted ? '✓' : stepNum}
            </div>

            {/* STEP LABEL */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive
                    ? '#10b981'
                    : isCompleted
                      ? 'var(--text, #ffffff)'
                      : 'var(--text-muted, #9ca3af)',
                  transition: 'color 250ms',
                }}
              >
                {step.label}
              </div>
              {step.description && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted, #9ca3af)',
                    marginTop: '2px',
                  }}
                >
                  {step.description}
                </div>
              )}
            </div>

            {/* COMPLETION INDICATOR */}
            {isCompleted && (
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'successCheckReveal 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              >
                ✓
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * PROGRESS SUMMARY BADGE
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * Compact progress badge showing current/total steps.
 */
export const ProgressSummary = ({ currentStep = 1, totalSteps = 5, showPercentage = true }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '700',
        color: 'var(--text, #ffffff)',
      }}
    >
      <span>{currentStep}</span>
      <span style={{ color: 'var(--text-muted, #9ca3af)' }}>/</span>
      <span style={{ color: 'var(--text-muted, #9ca3af)' }}>{totalSteps}</span>
      {showPercentage && (
        <>
          <span style={{ color: 'var(--text-muted, #9ca3af)', marginLeft: '4px' }}>·</span>
          <span style={{ color: '#10b981', marginLeft: '4px' }}>{percentage}%</span>
        </>
      )}
    </div>
  );
};

export default ProgressTracker;
