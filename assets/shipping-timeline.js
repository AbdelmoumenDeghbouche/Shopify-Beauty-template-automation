class ShippingTimeline {
  constructor() {
    this.init();
  }

  init() {
    this.updateTimeline();
  }

  formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  updateTimeline() {
    const timeline = document.querySelector('.shipping-timeline');
    if (!timeline) return;

    const today = new Date();
    const deliveryStart = new Date(today);
    const deliveryEnd = new Date(today);
    const bookStart = new Date(today);
    const bookEnd = new Date(today);

    // Get values from data attributes
    const deliveryDays = parseInt(timeline.dataset.deliveryDays) || 2;
    const bookingDays = parseInt(timeline.dataset.bookingDays) || 2;

    // Calculate dates
    deliveryEnd.setDate(deliveryEnd.getDate() + deliveryDays);
    bookStart.setDate(bookStart.getDate() + deliveryDays + 1);
    bookEnd.setDate(bookEnd.getDate() + deliveryDays + bookingDays);

    // Update DOM elements
    const orderDate = timeline.querySelector('[data-order-date]');
    const deliveryDates = timeline.querySelector('[data-delivery-dates]');
    const bookDates = timeline.querySelector('[data-book-dates]');

    if (orderDate) orderDate.textContent = this.formatDate(today);
    if (deliveryDates) deliveryDates.textContent = `${this.formatDate(deliveryStart)} - ${this.formatDate(deliveryEnd)}`;
    if (bookDates) bookDates.textContent = `${this.formatDate(bookStart)} - ${this.formatDate(bookEnd)}`;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ShippingTimeline();
}); 