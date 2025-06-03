// Global variables
let sentimentChart = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupTabNavigation();
    setupGalleryFilters();
    setupLightbox();
    setupSmoothScrolling();
    setupImageLazyLoading();
    // Initialize chart after a small delay to ensure the canvas is ready
    setTimeout(setupSentimentChart, 500);
}

// Tab Navigation
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and sections
            tabButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding section
            button.classList.add('active');
            const targetSection = document.getElementById(targetTab);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Initialize chart if social section is opened
                if (targetTab === 'social') {
                    setTimeout(() => {
                        if (!sentimentChart) {
                            setupSentimentChart();
                        }
                    }, 100);
                }
            }
        });
    });
}

// Gallery Filters
function setupGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');
            
            // Remove active class from all filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.6s ease-out';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Lightbox Functionality
function setupLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxDescription || !lightboxClose) {
        console.warn('Lightbox elements not found');
        return;
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const overlay = item.querySelector('.gallery-overlay');
            
            if (!img || !overlay) return;
            
            const title = overlay.querySelector('h3')?.textContent || 'Image';
            const description = overlay.querySelector('p')?.textContent || '';
            
            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
            lightboxTitle.textContent = title;
            lightboxDescription.textContent = description;
            
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Sentiment Chart
function setupSentimentChart() {
    const ctx = document.getElementById('sentimentChart');
    if (!ctx) {
        console.warn('Sentiment chart canvas not found');
        return;
    }

    // Destroy existing chart if it exists
    if (sentimentChart) {
        sentimentChart.destroy();
    }

    try {
        sentimentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [78, 18, 4],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12,
                                family: 'FKGroteskNeue, Inter, sans-serif'
                            },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#134252'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1500
                }
            }
        });
    } catch (error) {
        console.error('Error creating sentiment chart:', error);
    }
}

// Smooth Scrolling
function setupSmoothScrolling() {
    // Make scrollToSection available globally
    window.scrollToSection = function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            // First, activate the corresponding tab
            const tabButton = document.querySelector(`[data-tab="${sectionId}"]`);
            if (tabButton) {
                tabButton.click();
            }
            
            // Then scroll to the section with offset for sticky nav
            const headerOffset = 80;
            const elementPosition = section.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };
}

// Image Lazy Loading
function setupImageLazyLoading() {
    const images = document.querySelectorAll('img[src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.6s ease-out';
            
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            
            // Handle image load errors
            img.addEventListener('error', () => {
                console.warn('Failed to load image:', img.src);
                img.style.opacity = '0.5';
                img.style.filter = 'grayscale(100%)';
            });
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.style.opacity = '1';
            img.addEventListener('error', () => {
                console.warn('Failed to load image:', img.src);
                img.style.opacity = '0.5';
                img.style.filter = 'grayscale(100%)';
            });
        });
    }
}

// Enhanced Gallery Interactions
function enhanceGalleryInteractions() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        // Add loading state
        const img = item.querySelector('img');
        if (img) {
            img.addEventListener('load', () => {
                item.classList.add('loaded');
            });
        }
        
        // Enhanced hover effects
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Cast Card Interactions
function enhanceCastCards() {
    const castCards = document.querySelectorAll('.cast-card');
    
    castCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
        
        // Ensure Wikipedia links work
        const link = card.querySelector('a[target="_blank"]');
        if (link) {
            link.addEventListener('click', (e) => {
                // Allow the default behavior (opening in new tab)
                console.log('Opening Wikipedia link:', link.href);
            });
        }
    });
}

// Video Player Enhancements
function enhanceVideoPlayers() {
    const videoItems = document.querySelectorAll('.video-item');
    
    videoItems.forEach(item => {
        const iframe = item.querySelector('iframe');
        if (iframe) {
            // Add loading state
            iframe.addEventListener('load', () => {
                item.classList.add('video-loaded');
            });
            
            // Handle iframe errors
            iframe.addEventListener('error', () => {
                console.warn('Failed to load video:', iframe.src);
            });
        }
    });
}

// Social Buzz Animations
function animateSocialBuzz() {
    const buzzItems = document.querySelectorAll('.buzz-item');
    
    if ('IntersectionObserver' in window) {
        const buzzObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(buzzItems).indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                }
            });
        }, { threshold: 0.2 });

        buzzItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            buzzObserver.observe(item);
        });
    }
}

// Parallax Effect for Hero Banner
function setupParallaxEffect() {
    const heroBanner = document.querySelector('.hero-banner');
    
    if (heroBanner) {
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBanner.style.transform = `translateY(${rate}px)`;
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick);
    }
}

// Theme Detection and Chart Color Updates
function updateChartColors() {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                      document.documentElement.getAttribute('data-color-scheme') === 'dark';
    
    if (sentimentChart) {
        const textColor = isDarkMode ? '#f5f5f5' : '#134252';
        sentimentChart.options.plugins.legend.labels.color = textColor;
        sentimentChart.update();
    }
}

// Error Handling for Images
function setupImageErrorHandling() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', () => {
            console.warn('Failed to load image:', img.src);
            // Don't hide the image, just add visual indication
            img.style.opacity = '0.5';
            img.style.filter = 'grayscale(100%)';
        });
    });
}

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add small delay to ensure all elements are rendered
    setTimeout(() => {
        enhanceGalleryInteractions();
        enhanceCastCards();
        enhanceVideoPlayers();
        animateSocialBuzz();
        setupParallaxEffect();
        setupImageErrorHandling();
    }, 100);
    
    // Listen for theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateChartColors);
    }
});

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance Optimizations
const debouncedResize = debounce(() => {
    if (sentimentChart) {
        sentimentChart.resize();
    }
}, 250);

window.addEventListener('resize', debouncedResize);

// Accessibility Enhancements
function setupAccessibility() {
    // Add keyboard navigation for gallery
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', 'Open image in lightbox');
        
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });
    
    // Add keyboard navigation for tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
            let targetIndex;
            
            if (e.key === 'ArrowLeft') {
                targetIndex = index > 0 ? index - 1 : tabButtons.length - 1;
            } else if (e.key === 'ArrowRight') {
                targetIndex = index < tabButtons.length - 1 ? index + 1 : 0;
            }
            
            if (targetIndex !== undefined) {
                e.preventDefault();
                tabButtons[targetIndex].focus();
                tabButtons[targetIndex].click();
            }
        });
    });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', setupAccessibility);

// Export functions for potential external use
window.G2App = {
    scrollToSection: window.scrollToSection,
    closeLightbox,
    setupSentimentChart
};

// Additional error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Ensure chart.js is loaded
if (typeof Chart === 'undefined') {
    console.error('Chart.js library not loaded');
}