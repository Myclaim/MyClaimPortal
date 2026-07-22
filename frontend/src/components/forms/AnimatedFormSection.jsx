import React, { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * ANIMATED FORM SECTION COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Wrapper component for form sections with progressive reveal animation,
 * collapse/expand functionality, and completion badges.
 * 
 * FEATURES:
 * - Smooth section entrance animation
 * - Automatic field reveal on mount with stagger
 * - Collapsible summary view for completed sections
 * - Premium glassmorphism styling
 * - Responsive to dark theme
 * 
 * Example usage provided in documentation.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AnimatedFormSection = ({
  sectionKey,
  title,
  subtitle,
  isActive = false,
  isCollapsed = false,
  onToggleCollapse,
  completionSummary,
  fieldNames = [],
  onSectionReady,
  children,
  icon,
  stepNumber,
}) => {
  useEffect(() => {
    // Trigger field reveal animation when section becomes active
    if (isActive && onSectionReady && fieldNames.length > 0) {
      onSectionReady(fieldNames);
    }
  }, [isActive, fieldNames, onSectionReady]);

  if (isCollapsed && completionSummary) {
    return (
      <div
        className="form-section-collapsed"
        onClick={onToggleCollapse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggleCollapse?.()}
      >
        <div className="form-section-collapsed-title">
          <span className="form-section-collapsed-check">✓</span>
          {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
          <span>{title}</span>
        </div>
        <div className="form-section-collapsed-preview">{completionSummary}</div>
      </div>
    );
  }

  return (
    <div
      className={`form-section ${isActive ? 'form-section-active' : ''}`}
      style={{
        marginBottom: '24px',
        animation: isActive ? 'sectionReveal 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
      }}
    >
      {/* SECTION HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(16, 185, 129, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {stepNumber !== undefined && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--text-muted, #9ca3af)',
              }}
            >
              {stepNumber}
            </div>
          )}
          {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text, #ffffff)',
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted, #9ca3af)',
                  marginTop: '2px',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted, #9ca3af)',
              transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            aria-label="Toggle section"
          >
            <ChevronDown
              size={18}
              style={{
                transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              }}
            />
          </button>
        )}
      </div>

      {/* SECTION CONTENT */}
      <div
        style={{
          animation: isActive ? 'sectionExpand 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * ANIMATED FORM SECTION GROUP
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * Container for multiple sections with stagger entrance animation.
 * Automatically manages section visibility and collapse states.
 */
export const AnimatedFormSectionGroup = ({
  sections = [],
  activeSectionIndex = 0,
  collapsedSections = {},
  onToggleCollapse,
  onSectionReady,
  children,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {sections.map((section, index) => {
        const isActive = index === activeSectionIndex;
        const isCollapsed = collapsedSections[section.key];

        return (
          <AnimatedFormSection
            key={section.key}
            sectionKey={section.key}
            title={section.title}
            subtitle={section.subtitle}
            isActive={isActive}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => onToggleCollapse?.(section.key)}
            completionSummary={section.completionSummary}
            fieldNames={section.fieldNames}
            onSectionReady={onSectionReady}
            icon={section.icon}
            stepNumber={section.stepNumber}
          >
            {children && children(section.key, isActive)}
          </AnimatedFormSection>
        );
      })}
    </div>
  );
};

export default AnimatedFormSection;
