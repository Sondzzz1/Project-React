// Services Page JavaScript

// Smooth scroll to category when clicking category card
document.addEventListener('DOMContentLoaded', function() {
  const categoryCards = document.querySelectorAll('.category-card');
  
  categoryCards.forEach(card => {
    card.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      const targetSection = document.getElementById(category);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Add highlight effect
        targetSection.style.transition = 'all 0.3s ease';
        targetSection.style.transform = 'scale(1.02)';
        setTimeout(() => {
          targetSection.style.transform = 'scale(1)';
        }, 300);
      }
    });
  });

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe service category sections
  const serviceSections = document.querySelectorAll('.service-category-section');
  serviceSections.forEach(section => {
    observer.observe(section);
  });

  // Observe feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    observer.observe(card);
  });

  // Parallax effect for hero section
  const heroSection = document.querySelector('.services-hero');
  if (heroSection) {
    window.addEventListener('scroll', function() {
      const scrolled = window.pageYOffset;
      const heroContent = document.querySelector('.hero-content');
      if (heroContent && scrolled < heroSection.offsetHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / heroSection.offsetHeight) * 0.5;
      }
    });
  }

  // Add hover effect to service items
  const serviceItems = document.querySelectorAll('.service-item');
  serviceItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.borderLeftColor = 'var(--primary-light)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.borderLeftColor = 'var(--primary-color)';
    });
  });

  // Animate numbers in hero stats
  const statNumbers = document.querySelectorAll('.stat-number');
  const animateNumber = (element) => {
    const target = element.textContent;
    const isNumber = /^\d+/.test(target);
    
    if (isNumber) {
      const num = parseInt(target);
      const duration = 2000;
      const increment = num / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= num) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current) + (target.includes('+') ? '+' : '');
        }
      }, 16);
    }
  };

  // Observe hero stats and animate when visible
  const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numberElement = entry.target.querySelector('.stat-number');
        if (numberElement && !numberElement.classList.contains('animated')) {
          numberElement.classList.add('animated');
          animateNumber(numberElement);
        }
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelectorAll('.hero-stat');
  heroStats.forEach(stat => {
    statsObserver.observe(stat);
  });

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .category-card');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add CSS for ripple effect if not already present
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
      }
      
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Sticky header on scroll
  const header = document.querySelector('.header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // Smooth reveal animation for service items
  const serviceItemsObserver = new IntersectionObserver(function(entries) {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }, index * 100);
        serviceItemsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  serviceItems.forEach(item => {
    serviceItemsObserver.observe(item);
  });
});

