document.addEventListener("DOMContentLoaded", () => {
  const observerOptions = {
    threshold: 0.15 // 15% of the element must be visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target;
      
      if (entry.isIntersecting) {
        // --- ENTERING VIEW ---
        const delay = element.getAttribute('data-delay') || "0";
        
        setTimeout(() => {
          element.classList.add('is-visible');
        }, parseInt(delay));

      } else {
        // --- LEAVING VIEW ---
        // Optional: Remove delay or immediately hide
        element.classList.remove('is-visible');
      }
    });
  }, observerOptions);

  const targets = document.querySelectorAll('.fade-in-up, .zoom-in');
  targets.forEach(target => observer.observe(target));
});