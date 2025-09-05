(() => {
  function initDiscountScript() {
    const appliedDiscountsContainer = document.getElementById('applied-discounts');
    const applyBtn = document.getElementById('apply-discount-btn');
    const discountInput = document.getElementById('discount-input');

    // Prevent duplicate event listeners
    const container = document.getElementById('discount-code-container');
    if (container && container.dataset.discountScriptInitialized === 'true') return;
    if (container) container.dataset.discountScriptInitialized = 'true';

    if (!appliedDiscountsContainer || !applyBtn || !discountInput) return;

    const strings = window.cartDiscountStrings || {};
    const MSG_NO_CODE = strings.errorNoCode || "Please enter a discount code.";
    const MSG_ALREADY_APPLIED = strings.errorAlreadyApplied || "That discount code is already applied.";
    const MSG_INVALID = strings.errorInvalid || "Discount code is invalid or not applicable.";

    function clearMessages() {
      const errDiv = document.getElementById('discount-error-message');
      if (errDiv) {
        errDiv.style.display = 'none';
        errDiv.textContent = '';
      }
    }

    function showError(msg) {
      const errDiv = document.getElementById('discount-error-message');
      if (errDiv) {
        errDiv.style.display = 'block';
        errDiv.textContent = msg;
      }
    }

    function getCurrentDiscounts() {
      const pills = document.querySelectorAll('#applied-discounts .discount-pill');
      return Array.from(pills).map((pill) => pill.getAttribute('data-code').toUpperCase());
    }

    function triggerCartUpdate() {
      const cartDrawerItems = document.querySelector('cart-drawer-items');
      if (cartDrawerItems && typeof cartDrawerItems.updateQuantity === 'function') {
        const qtyInput =
          document.getElementById('Drawer-quantity-1') ||
          document.getElementById('Quantity-1');
        if (qtyInput) {
          const currentQty = parseInt(qtyInput.value, 10) || 1;
          cartDrawerItems.updateQuantity(1, currentQty);
          return;
        } else {
          cartDrawerItems.onCartUpdate();
          return;
        }
      }

      const cartItems = document.querySelector('cart-items');
      if (cartItems && typeof cartItems.updateQuantity === 'function') {
        const qtyInput =
          document.getElementById('Quantity-1') ||
          document.getElementById('Drawer-quantity-1');
        if (qtyInput) {
          const currentQty = parseInt(qtyInput.value, 10) || 1;
          cartItems.updateQuantity(1, currentQty);
          return;
        } else {
          cartItems.onCartUpdate();
          return;
        }
      }
    }

    async function applyDiscounts(discountCodes = []) {
      let isRemoving = false;
      if (discountCodes.length === 0) {
        discountCodes = ['REMOVE_SHOPIFY_CODE'];
        isRemoving = true;
      }
      const discountString = discountCodes.join(',');
      const checkoutUrl = `/checkout?discount=${encodeURIComponent(discountString)}`;

      try {
        await fetch(checkoutUrl, { method: 'GET' });
      } catch (err) {}

      const cartRes = await fetch('/cart.js');
      const cartData = await cartRes.json();

      const validSet = new Set();
      (cartData.cart_level_discount_applications || []).forEach(d => validSet.add(d.title.toUpperCase()));
      cartData.items.forEach(item => {
        (item.line_level_discount_allocations || []).forEach(a => {
          validSet.add(a.discount_application.title.toUpperCase());
        });
      });

      const invalidCodes = discountCodes.filter(c => !validSet.has(c.toUpperCase()));
      const newlyAddedCode = discountCodes[discountCodes.length - 1];
      const codeIsInvalid = invalidCodes.includes(newlyAddedCode);

      if (newlyAddedCode === 'REMOVE_SHOPIFY_CODE' || !codeIsInvalid) {
        triggerCartUpdate();
      }
      return {
        success: !codeIsInvalid || isRemoving,
        invalidCodes
      };
    }

    applyBtn.addEventListener('click', async () => {
      clearMessages();
      const existingCodes = getCurrentDiscounts();
      let newCode = discountInput.value.trim().toUpperCase();
      if (!newCode) {
        showError(MSG_NO_CODE);
        return;
      }
      if (existingCodes.includes(newCode)) {
        showError(MSG_ALREADY_APPLIED);
        return;
      }
      // Start loading animation
      let originalBtnText = applyBtn.textContent;
      let dotCount = 0;
      let loading = true;
      applyBtn.disabled = true;
      const animateDots = () => {
        if (!loading) return;
        dotCount = (dotCount + 1) % 4;
        applyBtn.textContent = originalBtnText + '.'.repeat(dotCount);
        setTimeout(animateDots, 400);
      };
      animateDots();

      const combinedCodes = [...existingCodes, newCode];
      const result = await applyDiscounts(combinedCodes);
      loading = false;
      applyBtn.textContent = originalBtnText;
      applyBtn.disabled = false;
      if (result.invalidCodes.map(c => c.toUpperCase()).includes(newCode)) {
        showError(MSG_INVALID);
      }
    });

    appliedDiscountsContainer.addEventListener('click', async (event) => {
      if (!event.target.closest('.remove-discount')) return;
      clearMessages();
      const pill = event.target.closest('.discount-pill');
      if (!pill) return;
      const codeToRemove = pill.getAttribute('data-code');
      if (!codeToRemove) return;
      const existingCodes = getCurrentDiscounts();
      const newDiscountList = existingCodes.filter(c => c !== codeToRemove.toUpperCase());
      await applyDiscounts(newDiscountList);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDiscountScript();
  });

  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.cartUpdate, () => {
      initDiscountScript();
    });
  }

  // MutationObserver to re-initialize when discount code container is added
  const observer = new MutationObserver(() => {
    if (document.getElementById('discount-code-container')) {
      initDiscountScript();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose for manual triggering if needed
  window.initDiscountScript = initDiscountScript;
})();
