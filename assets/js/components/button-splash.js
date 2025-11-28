/**
 * Button Splash Effect Component
 * Directional color splash on hover with pointer tracking
 * 
 * Features:
 * - GPU-optimized CSS variable updates (no layout thrashing)
 * - Pointer position tracking with requestAnimationFrame
 * - Keyboard focus support (centered splash)
 * - Touch device fallback (animated static splash)
 * - prefers-reduced-motion support (disables tracking)
 * - Per-button customization via data-attributes
 * 
 * Usage:
 *   1. Add CSS: <link rel="stylesheet" href="/assets/ui/button-splash.css" />
 *   2. Add JS: <script src="/assets/js/components/button-splash.js" defer></script>
 *   3. Call: window.initButtonSplash() or window.initButtonSplash(document.querySelector('.container'))
 *   4. Mark buttons: <button class="liquid-btn with-splash" data-splash="cool">Button</button>
 * 
 * Data Attributes:
 *   data-splash="primary|cool|destructive|secondary|success|warning|ghost" — Color variant
 *   data-splash-size="small|medium|large" — Splash size
 *   data-debug="true" — Show position coordinates (dev mode)
 */

(function () {
  'use strict';

  // ==================== Constants ====================
  
  const TOUCH_DEVICE = () => {
    return (
      typeof window !== 'undefined' &&
      (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0))
    );
  };
  
  const PREFERS_REDUCED_MOTION = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  // ==================== Shared rAF Loop ====================
  
  let rafId = null;
  const pendingUpdates = new Map(); // btn -> { x, y }

  /**
   * Shared requestAnimationFrame loop
   * Applies all pending CSS variable updates in one frame
   * Prevents animation frame thrashing when many buttons are tracked
   */
  function startRafLoop() {
    if (rafId !== null) return;

    function loop() {
      if (pendingUpdates.size > 0) {
        pendingUpdates.forEach(({ x, y }, btn) => {
          if (btn.isConnected) {
            // Update CSS variables (GPU-optimized, no layout)
            btn.style.setProperty('--splash-x', x);
            btn.style.setProperty('--splash-y', y);

            // Debug mode: show coordinates
            if (btn.dataset.debug === 'true') {
              btn.dataset.debugX = Math.round(parseFloat(x));
              btn.dataset.debugY = Math.round(parseFloat(y));
            }
          }
        });
        pendingUpdates.clear();
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
  }

  function stopRafLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ==================== Main Initialization ====================

  /**
   * Initialize all .with-splash buttons in a root element
   * @param {Element} root - Root element to search (default: document)
   */
  function initButtonSplash(root = document) {
    const buttons = root.querySelectorAll('.with-splash');

    if (buttons.length === 0) {
      console.debug('[button-splash] No .with-splash elements found');
      return;
    }

    // Detect if on touch device
    const isTouchDevice = TOUCH_DEVICE();
    const prefersReducedMotion = PREFERS_REDUCED_MOTION();

    buttons.forEach((btn) => {
      // Skip if already initialized
      if (btn.dataset.splashInitialized === 'true') return;
      btn.dataset.splashInitialized = 'true';

      // Mark as touch mode for CSS
      if (isTouchDevice) {
        btn.dataset.touchMode = 'true';
      }

      // Set up event handlers
      initButtonSplashBehaviors(btn, isTouchDevice, prefersReducedMotion);
    });

    // Start the shared rAF loop if any button needs tracking
    if (buttons.length > 0 && !isTouchDevice && !prefersReducedMotion) {
      startRafLoop();
    }

    // Watch for dynamically added buttons
    observeDynamicButtons(root, isTouchDevice, prefersReducedMotion);

    console.debug(
      `[button-splash] Initialized ${buttons.length} splash button(s). ` +
      `Touch: ${isTouchDevice}, Reduced Motion: ${prefersReducedMotion}`
    );
  }

  /**
   * Initialize event handlers for a single button
   * @param {Element} btn - Button element
   * @param {boolean} isTouchDevice - Whether on touch device
   * @param {boolean} prefersReducedMotion - Whether motion is reduced
   */
  function initButtonSplashBehaviors(btn, isTouchDevice, prefersReducedMotion) {
    let isTracking = false;
    let touchId = null;

    // ========== Pointer Events (Desktop) ==========

    if (!isTouchDevice && !prefersReducedMotion) {
      btn.addEventListener('pointerenter', () => {
        isTracking = true;
        btn.style.setProperty('--splash-opacity', '1');
        startRafLoop();
      });

      btn.addEventListener('pointermove', (e) => {
        if (!isTracking) return;

        // Queue position update for next rAF frame
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        pendingUpdates.set(btn, {
          x: Math.max(0, Math.min(100, x)) + '%',
          y: Math.max(0, Math.min(100, y)) + '%',
        });
      });

      btn.addEventListener('pointerdown', () => {
        btn.classList.add('splash-pressed');
        btn.style.setProperty('--splash-scale', '1.15');
        btn.style.setProperty('--splash-opacity', '0.9');
      });

      btn.addEventListener('pointerup', () => {
        btn.classList.remove('splash-pressed');
        btn.style.setProperty('--splash-scale', '1');
        if (isTracking) {
          btn.style.setProperty('--splash-opacity', '1');
        }
      });

      btn.addEventListener('pointercancel', () => {
        btn.classList.remove('splash-pressed');
        btn.style.setProperty('--splash-scale', '1');
        btn.style.setProperty('--splash-opacity', '1');
      });

      btn.addEventListener('pointerleave', () => {
        isTracking = false;
        btn.classList.remove('splash-pressed');
        btn.style.setProperty('--splash-opacity', '0');
        btn.style.setProperty('--splash-scale', '1');
        pendingUpdates.delete(btn);
      });
    }

    // ========== Touch Events (Mobile/Tablet) ==========

    if (isTouchDevice) {
      btn.addEventListener('touchstart', (e) => {
        touchId = e.touches[0].identifier;

        // Animate splash on touch
        btn.classList.add('splash-pressed');
        btn.style.setProperty('--splash-opacity', '0.9');
        btn.style.setProperty('--splash-scale', '1.15');

        // Optional: set splash to touch position (first touch point)
        if (!prefersReducedMotion) {
          const touch = e.touches[0];
          const rect = btn.getBoundingClientRect();
          const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
          const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));

          btn.style.setProperty('--splash-x', x + '%');
          btn.style.setProperty('--splash-y', y + '%');
        }
      });

      btn.addEventListener('touchend', (e) => {
        // Fade out splash
        btn.classList.remove('splash-pressed');
        btn.style.setProperty('--splash-opacity', '0');
        btn.style.setProperty('--splash-scale', '1');

        touchId = null;
      });

      btn.addEventListener('touchcancel', (e) => {
        btn.classList.remove('splash-pressed');
        btn.style.setProperty('--splash-opacity', '0');
        btn.style.setProperty('--splash-scale', '1');

        touchId = null;
      });
    }

    // ========== Keyboard Events ==========

    btn.addEventListener('focusin', () => {
      // Center splash on focus
      btn.style.setProperty('--splash-x', '50%');
      btn.style.setProperty('--splash-y', '50%');
      btn.style.setProperty('--splash-opacity', prefersReducedMotion ? '0.5' : '0.6');
    });

    btn.addEventListener('focusout', () => {
      // Fade splash on blur
      if (!isTracking) {
        btn.style.setProperty('--splash-opacity', '0');
      }
    });

    // Keyboard press animates splash
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        btn.classList.add('splash-pressed');
        btn.style.setProperty('--splash-opacity', prefersReducedMotion ? '0.4' : '0.9');
        btn.style.setProperty('--splash-scale', prefersReducedMotion ? '1' : '1.15');
      }
    });

    btn.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        btn.classList.remove('splash-pressed');
        btn.style.setProperty('--splash-scale', '1');
        // Keep splash visible on focus
        btn.style.setProperty('--splash-opacity', prefersReducedMotion ? '0.5' : '0.6');
      }
    });
  }

  // ==================== Dynamic Content Watcher ====================

  /**
   * Watch for dynamically added .with-splash elements
   * @param {Element} root - Root element to observe
   * @param {boolean} isTouchDevice - Touch device flag
   * @param {boolean} prefersReducedMotion - Reduced motion flag
   */
  function observeDynamicButtons(root, isTouchDevice, prefersReducedMotion) {
    if (typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return; // Skip non-element nodes

          // Check if the added node or its children contain .with-splash
          const elements = node.classList?.contains('with-splash')
            ? [node]
            : node.querySelectorAll?.('.with-splash') || [];

          elements.forEach((el) => {
            if (el.dataset.splashInitialized !== 'true') {
              initButtonSplashBehaviors(el, isTouchDevice, prefersReducedMotion);
              el.dataset.splashInitialized = 'true';

              if (isTouchDevice) {
                el.dataset.touchMode = 'true';
              }

              console.debug('[button-splash] Initialized dynamically added button');
            }
          });
        });
      });
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });
  }

  // ==================== Auto-Init on DOM Ready ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initButtonSplash();
    });
  } else {
    // DOM is already loaded
    initButtonSplash();
  }

  // ==================== Public API ====================

  window.initButtonSplash = initButtonSplash;
  window.startRafLoop = startRafLoop;
  window.stopRafLoop = stopRafLoop;

  // Export for debugging
  if (process?.env?.NODE_ENV === 'development') {
    window.__buttonSplashDebug = {
      pendingUpdates,
      rafId: () => rafId,
      TOUCH_DEVICE,
      PREFERS_REDUCED_MOTION,
    };
  }
})();
