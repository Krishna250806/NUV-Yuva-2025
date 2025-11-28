/**
 * Liquid Glass Button Component
 * Vanilla JS initialization for interactive button behaviors
 * 
 * Usage:
 *   1. Include CSS: <link rel="stylesheet" href="/assets/ui/liquid-glass-button.css" />
 *   2. Include JS: <script src="/assets/js/components/liquid-glass-button.js" defer></script>
 *   3. Initialize: window.initLiquidButtons() on DOMContentLoaded
 *   4. Use HTML markup with .liquid-btn or .metal-btn classes
 */

(function () {
  'use strict';

  // ==================== Helper Functions ====================

  /**
   * Simple class name utility (similar to clsx/cn)
   * Combines multiple class strings and filters out falsy values
   */
  // Utility: class combination (unused in components but left for extension hooks)
  // function cn(...classes) { return classes.filter(Boolean).join(' '); }

  /**
   * Initialize all liquid glass buttons in a given root element
   * @param {Element} root - Root element to search for buttons (default: document)
   */
  function initLiquidButtons(root = document) {
    const buttons = root.querySelectorAll('.liquid-btn, .metal-btn');
    
    buttons.forEach((btn) => {
      // Skip if already initialized
      if (btn.dataset.initialized === 'true') return;
      btn.dataset.initialized = 'true';

      // Initialize button behaviors
      initButtonBehaviors(btn);
    });
  }

  /**
   * Initialize pointer, keyboard, and touch handlers for a button
   * @param {Element} btn - The button element
   */
  function initButtonBehaviors(btn) {
    let isPressed = false;
    let touchId = null;

    // ========== Pointer/Mouse Events ==========
    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return; // Only left-click
      isPressed = true;
      btn.classList.add('pressed');
      
      // Create ripple effect (optional enhancement)
      createRipple(btn, e);
    });

    btn.addEventListener('pointerup', () => {
      isPressed = false;
      btn.classList.remove('pressed');
    });

    btn.addEventListener('pointercancel', () => {
      isPressed = false;
      btn.classList.remove('pressed');
    });

    btn.addEventListener('pointerleave', () => {
      if (isPressed) {
        isPressed = false;
        btn.classList.remove('pressed');
      }
    });

    // ========== Touch Events (fallback) ==========
    btn.addEventListener('touchstart', (e) => {
      touchId = e.touches[0].identifier;
      isPressed = true;
      btn.classList.add('pressed');
    });

    btn.addEventListener('touchend', (e) => {
      const touch = Array.from(e.changedTouches).find(
        (t) => t.identifier === touchId
      );
      if (touch) {
        isPressed = false;
        btn.classList.remove('pressed');
      }
    });

    btn.addEventListener('touchcancel', () => {
      isPressed = false;
      btn.classList.remove('pressed');
    });

    // ========== Keyboard Events ==========
    btn.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!isPressed) {
          isPressed = true;
          btn.classList.add('pressed');
        }
      }
    });

    btn.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (isPressed) {
          isPressed = false;
          btn.classList.remove('pressed');
          // Trigger click event for Space/Enter
          if (btn.tagName !== 'BUTTON') {
            btn.click();
          }
        }
      }
    });

    // ========== Accessibility ==========
    // Ensure button is keyboard focusable if not a native button
    if (btn.tagName !== 'BUTTON' && !btn.hasAttribute('tabindex')) {
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('role', 'button');
    }

    // Ensure aria-pressed is set for toggle buttons (if applicable)
    if (btn.dataset.toggle === 'true' && !btn.hasAttribute('aria-pressed')) {
      btn.setAttribute('aria-pressed', 'false');
    }

    // Add click listener to update aria-pressed if togglable
    if (btn.dataset.toggle === 'true') {
      btn.addEventListener('click', () => {
        const pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!pressed));
      });
    }
  }

  /**
   * Create a ripple effect on button click
   * @param {Element} btn - The button element
   * @param {PointerEvent} e - The pointer event
   */
  function createRipple(btn, e) {
    // Check if ripple effect is enabled
    if (btn.dataset.ripple === 'false') return;

    // Remove old ripple if exists
    const oldRipple = btn.querySelector('.ripple');
    if (oldRipple) oldRipple.remove();

    // Create ripple element
    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    // Get button rect and click position
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    btn.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => ripple.remove(), 600);
  }

  /**
   * Observe DOM for dynamically added buttons and initialize them
   */
  function observeDOMChanges() {
    if (typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.classList.contains('liquid-btn') || node.classList.contains('metal-btn')) {
                initButtonBehaviors(node);
              }
              // Also check children
              const children = node.querySelectorAll?.('.liquid-btn, .metal-btn');
              if (children) {
                children.forEach(initButtonBehaviors);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Create and inject SVG filter for glass effect (optional enhancement)
   * Can be called to add a glass displacement filter to the page
   */
  function injectGlassFilter() {
    // Check if SVG filter already exists
    if (document.getElementById('liquid-glass-filter')) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'liquid-glass-filter');
    svg.setAttribute('style', 'display: none; width: 0; height: 0;');
    svg.setAttribute('viewBox', '0 0 100 100');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'container-glass');

    // Turbulence for glass distortion
    const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
    turbulence.setAttribute('type', 'fractalNoise');
    turbulence.setAttribute('baseFrequency', '0.02');
    turbulence.setAttribute('numOctaves', '3');
    turbulence.setAttribute('result', 'noise');

    // Displacement map
    const displacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
    displacement.setAttribute('in', 'SourceGraphic');
    displacement.setAttribute('in2', 'noise');
    displacement.setAttribute('scale', '3');
    displacement.setAttribute('xChannelSelector', 'R');
    displacement.setAttribute('yChannelSelector', 'G');

    filter.appendChild(turbulence);
    filter.appendChild(displacement);
    defs.appendChild(filter);
    svg.appendChild(defs);
    document.body.appendChild(svg);
  }

  // ==================== Public API ====================

  // Expose initialization function globally
  window.initLiquidButtons = initLiquidButtons;
  window.createRipple = createRipple;
  window.injectGlassFilter = injectGlassFilter;

  // ==================== Auto-Initialize on Load ====================

  if (document.readyState === 'loading') {
    // DOM not ready yet
    document.addEventListener('DOMContentLoaded', () => {
      initLiquidButtons();
      observeDOMChanges();
    });
  } else {
    // DOM already loaded
    initLiquidButtons();
    observeDOMChanges();
  }

})();
