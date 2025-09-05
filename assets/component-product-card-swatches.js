class ProductCardSwatches {
  constructor() {
    this.init();
  }

  init() {
    this.initializeSwatchCounters();
    window.addEventListener('resize', this.initializeSwatchCounters.bind(this));
  }

  initializeSwatchCounters() {
    const swatchContainers = document.querySelectorAll('.product-form-swatch__variants');
    
    swatchContainers.forEach(container => {
      const swatches = container.querySelectorAll('.swatch');
      const counter = container.querySelector('.swatch-counter');
      if (!swatches.length || !counter) return;

      const containerWidth = container.offsetWidth;
      const swatchWidth = swatches[0].offsetWidth;
      const gap = 5; // This should match the gap in the CSS
      const swatchesPerRow = Math.floor((containerWidth + gap) / (swatchWidth + gap));
      
      if (swatches.length > swatchesPerRow) {
        // Show one less swatch than can fit
        const visibleSwatches = swatchesPerRow - 1;
        const hiddenCount = swatches.length - visibleSwatches;
        counter.style.display = 'flex';
        counter.querySelector('.counter-number').textContent = hiddenCount;
        
        // Hide swatches that don't fit
        swatches.forEach((swatch, index) => {
          if (index >= visibleSwatches) {
            swatch.style.display = 'none';
          } else {
            swatch.style.display = 'block';
          }
        });
      } else {
        counter.style.display = 'none';
        swatches.forEach(swatch => {
          swatch.style.display = 'block';
        });
      }
    });
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductCardSwatches();
});

// Initialize on Shopify section load
document.addEventListener('shopify:section:load', () => {
  new ProductCardSwatches();
}); 