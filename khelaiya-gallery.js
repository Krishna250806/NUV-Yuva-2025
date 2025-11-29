// Khelaiya Gallery Slideshow JavaScript

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;
let slideshowInterval;
const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

// Initialize slideshow
function initSlideshow() {
  updateIndicators();
  startAutoSlide();

  // Add keyboard navigation
  document.addEventListener('keydown', handleKeyboard);
  
  // Pause on hover
  const slideshowContainer = document.querySelector('.slideshow-container');
  if (slideshowContainer) {
    slideshowContainer.addEventListener('mouseenter', pauseAutoSlide);
    slideshowContainer.addEventListener('mouseleave', startAutoSlide);
  }

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
    if (touchEndX < touchStartX - 50) {
      // Swipe left - next slide
      changeSlide(1);
    }
    if (touchEndX > touchStartX + 50) {
      // Swipe right - previous slide
      changeSlide(-1);
    }
  }

  // Preload images for smooth transitions
  preloadImages();
}

// Change slide function
function changeSlide(direction) {
  // Remove active class from current slide
  slides[currentSlide].classList.remove('active');
  indicators[currentSlide].classList.remove('active');

  // Calculate new slide index
  currentSlide += direction;

  // Loop around
  if (currentSlide < 0) {
    currentSlide = totalSlides - 1;
  } else if (currentSlide >= totalSlides) {
    currentSlide = 0;
  }

  // Add active class to new slide
  slides[currentSlide].classList.add('active');
  updateIndicators();
  
  // Preload next slide for smoother transition
  const nextIndex = (currentSlide + 1) % totalSlides;
  const nextSlide = slides[nextIndex];
  if (nextSlide) {
    const nextImg = nextSlide.querySelector('img');
    if (nextImg && !nextImg.complete) {
      const preloadImg = new Image();
      preloadImg.src = nextImg.src;
      preloadImg.loading = 'eager';
    }
  }
  
  // Reset auto-slide timer
  resetAutoSlide();
}

// Go to specific slide
function goToSlide(index) {
  if (index >= 0 && index < totalSlides && index !== currentSlide) {
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    updateIndicators();
    resetAutoSlide();
  }
}

// Update indicators
function updateIndicators() {
  indicators.forEach((indicator, index) => {
    if (index === currentSlide) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
}

// Auto-slide functionality
function startAutoSlide() {
  clearInterval(slideshowInterval);
  slideshowInterval = setInterval(() => {
    changeSlide(1);
  }, AUTO_SLIDE_INTERVAL);
}

function pauseAutoSlide() {
  clearInterval(slideshowInterval);
}

function resetAutoSlide() {
  pauseAutoSlide();
  startAutoSlide();
}

// Keyboard navigation
function handleKeyboard(e) {
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
      pauseAutoSlide();
      break;
  }
}

// Preload images for smooth transitions - OPTIMIZED
function preloadImages() {
  // Preload all images immediately for faster transitions
  slides.forEach((slide, index) => {
    const img = slide.querySelector('img');
    if (img) {
      const preloadImg = new Image();
      preloadImg.src = img.src;
      preloadImg.loading = 'eager';
      preloadImg.onload = () => {
        if (img) img.dataset.preloaded = 'true';
      };
    }
  });
  
  // Preload next 2 slides immediately
  const nextIndex1 = (currentSlide + 1) % totalSlides;
  const nextIndex2 = (currentSlide + 2) % totalSlides;
  [nextIndex1, nextIndex2].forEach(index => {
    const slide = slides[index];
    if (slide) {
      const img = slide.querySelector('img');
      if (img && !img.complete) {
        const preloadImg = new Image();
        preloadImg.src = img.src;
        preloadImg.loading = 'eager';
      }
    }
  });
}

// Video play promise handling
function handleVideoPlay() {
  const video = document.getElementById('background-video');
  if (video) {
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Video is playing
          video.style.opacity = '1';
        })
        .catch((error) => {
          // Auto-play was prevented
          console.log('Video autoplay prevented:', error);
          // Fallback: show poster image or handle gracefully
        });
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSlideshow();
    handleVideoPlay();
  });
} else {
  initSlideshow();
  handleVideoPlay();
}

// Make functions globally accessible
window.changeSlide = changeSlide;
window.goToSlide = goToSlide;

