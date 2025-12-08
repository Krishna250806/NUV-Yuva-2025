// Esports Gallery Slideshow JavaScript

let currentSlide = 0;
let slides = [];
let indicators = [];
let totalSlides = 0;
let slideshowInterval;
const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

// Initialize slideshow
function initSlideshow() {
  // Query elements when initializing
  slides = Array.from(document.querySelectorAll('.slide'));
  indicators = Array.from(document.querySelectorAll('.indicator'));
  totalSlides = slides.length;
  
  if (!slides || slides.length === 0) {
    console.warn('No slides found');
    return;
  }
  
  updateIndicators();
  startAutoSlide();

  // Add keyboard navigation
  document.addEventListener('keydown', handleKeyboard, { passive: true });
  
  // Pause on hover
  const slideshowContainer = document.querySelector('.slideshow-container');
  if (slideshowContainer) {
    slideshowContainer.addEventListener('mouseenter', pauseAutoSlide, { passive: true });
    slideshowContainer.addEventListener('mouseleave', startAutoSlide, { passive: true });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    slideshowContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slideshowContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchEndX - touchStartX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff < 0) {
          // Swipe left - next slide
          changeSlide(1);
        } else {
          // Swipe right - previous slide
          changeSlide(-1);
        }
      }
    }
  }

  // Preload images for smooth transitions
  preloadImages();
}

// Change slide function - Optimized with requestAnimationFrame
function changeSlide(direction) {
  if (!slides || slides.length === 0) return;
  
  // Use requestAnimationFrame for smoother transitions
  requestAnimationFrame(() => {
    // Remove active class from current slide
    slides[currentSlide]?.classList.remove('active');
    indicators[currentSlide]?.classList.remove('active');

    // Calculate new slide index
    currentSlide += direction;

    // Loop around
    if (currentSlide < 0) {
      currentSlide = totalSlides - 1;
    } else if (currentSlide >= totalSlides) {
      currentSlide = 0;
    }

    // Add active class to new slide
    slides[currentSlide]?.classList.add('active');
    updateIndicators();
    
    // Preload next slide for smoother transition
    const nextIndex = (currentSlide + 1) % totalSlides;
    const nextSlide = slides[nextIndex];
    if (nextSlide) {
      const nextImg = nextSlide.querySelector('img');
      if (nextImg && !nextImg.complete && !nextImg.dataset.preloaded) {
        const preloadImg = new Image();
        preloadImg.src = nextImg.src;
        preloadImg.onload = () => {
          nextImg.dataset.preloaded = 'true';
        };
      }
    }
    
    // Reset auto-slide timer
    resetAutoSlide();
  });
}

// Go to specific slide - Optimized
function goToSlide(index) {
  if (!slides || slides.length === 0) return;
  if (index >= 0 && index < totalSlides && index !== currentSlide) {
    requestAnimationFrame(() => {
      slides[currentSlide]?.classList.remove('active');
      indicators[currentSlide]?.classList.remove('active');
      
      currentSlide = index;
      
      slides[currentSlide]?.classList.add('active');
      updateIndicators();
      resetAutoSlide();
    });
  }
}

// Update indicators - Optimized
function updateIndicators() {
  if (!indicators || indicators.length === 0) return;
  
  indicators.forEach((indicator, index) => {
    if (index === currentSlide) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
}

// Auto-slide functionality - Optimized
function startAutoSlide() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
  }
  slideshowInterval = setInterval(() => {
    if (slides && slides.length > 0) {
      changeSlide(1);
    }
  }, AUTO_SLIDE_INTERVAL);
}

function pauseAutoSlide() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
}

function resetAutoSlide() {
  pauseAutoSlide();
  startAutoSlide();
}

// Keyboard navigation - Optimized
function handleKeyboard(e) {
  // Only handle if slideshow is active
  if (!slides || slides.length === 0) return;
  
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      changeSlide(-1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      changeSlide(1);
      break;
    case ' ':
      e.preventDefault();
      pauseAutoSlide();
      changeSlide(1);
      break;
    case 'Escape':
      e.preventDefault();
      pauseAutoSlide();
      break;
  }
}

// Preload images for smooth transitions - OPTIMIZED
function preloadImages() {
  if (!slides || slides.length === 0) return;
  
  // Preload first image immediately (already visible)
  const firstImg = slides[0]?.querySelector('img');
  if (firstImg && !firstImg.complete) {
    const preloadImg = new Image();
    preloadImg.src = firstImg.src;
    preloadImg.loading = 'eager';
  }
  
  // Preload next 2 slides for smoother transitions
  const nextIndex1 = (currentSlide + 1) % totalSlides;
  const nextIndex2 = (currentSlide + 2) % totalSlides;
  
  [nextIndex1, nextIndex2].forEach(index => {
    const slide = slides[index];
    if (slide) {
      const img = slide.querySelector('img');
      if (img && !img.complete && !img.dataset.preloaded) {
        const preloadImg = new Image();
        preloadImg.src = img.src;
        preloadImg.onload = () => {
          img.dataset.preloaded = 'true';
        };
        preloadImg.onerror = () => {
          console.warn('Failed to preload image:', img.src);
        };
      }
    }
  });
  
  // Lazy preload remaining images after a short delay
  setTimeout(() => {
    slides.forEach((slide, index) => {
      if (index !== currentSlide && index !== nextIndex1 && index !== nextIndex2) {
        const img = slide.querySelector('img');
        if (img && !img.complete && !img.dataset.preloaded) {
          const preloadImg = new Image();
          preloadImg.src = img.src;
          preloadImg.onload = () => {
            img.dataset.preloaded = 'true';
          };
        }
      }
    });
  }, 1000);
}

// Video play promise handling - Optimized
function handleVideoPlay() {
  const video = document.getElementById('background-video');
  if (!video) return;
  
  // Set initial opacity to 0 for smooth fade-in
  video.style.opacity = '0';
  video.style.transition = 'opacity 1.5s ease-in';
  
  // Optimize video loading
  video.load();
  
  // Handle video ready state
  const handleCanPlay = () => {
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Video is playing - fade in smoothly
          requestAnimationFrame(() => {
            video.style.opacity = '1';
          });
        })
        .catch((error) => {
          // Auto-play was prevented (common on mobile)
          console.log('Video autoplay prevented, showing anyway:', error);
          video.style.opacity = '1';
        });
    } else {
      video.style.opacity = '1';
    }
    
    // Remove listener after first use
    video.removeEventListener('canplay', handleCanPlay);
  };
  
  if (video.readyState >= 3) {
    // Video already loaded enough
    handleCanPlay();
  } else {
    video.addEventListener('canplay', handleCanPlay, { once: true });
  }
  
  // Fallback timeout
  setTimeout(() => {
    if (video.style.opacity === '0') {
      video.style.opacity = '1';
    }
  }, 3000);
}

// Optimize image loading with Intersection Observer
function setupImageOptimization() {
  const images = document.querySelectorAll('.slide img[loading="lazy"]');
  
  if ('IntersectionObserver' in window && images.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.01
    });
    
    images.forEach(img => {
      if (img) imageObserver.observe(img);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSlideshow();
    handleVideoPlay();
    setupImageOptimization();
  });
} else {
  initSlideshow();
  handleVideoPlay();
  setupImageOptimization();
}

// Make functions globally accessible
window.changeSlide = changeSlide;
window.goToSlide = goToSlide;

