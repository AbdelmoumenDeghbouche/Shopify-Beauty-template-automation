/*
  © 2025 LuminTheme
  https://www.lumintheme.com
*/




class LuminProductQtyBreak extends HTMLElement {
  constructor() {
    super();

    this.closest(".product")
      .querySelectorAll("lumin-product-qty-break")
      .forEach((elem, index) => {
        elem.setAttribute("data-index", index);
      });

    this.handleInputChange();
    this.handleOptionChange();
    this.handleAtc();
    this.handleVariantChange();
  }

  disconnectedCallback() {
    // Clean up event listeners when element is removed
    document.removeEventListener("variant:change", this._variantChangeHandler);
  }

  handleInputChange() {
    this.querySelector("input").addEventListener("change", () => {
      const atcBtn =
        this.closest(".product").querySelector('button[name="add"]');

      setTimeout(() => {
        atcBtn.classList.add("animate__animated", "animate__shakeX");
      }, 250);

      setTimeout(() => {
        atcBtn.classList.remove("animate__animated", "animate__shakeX");
      }, 1500);
    });
  }

  handleOptionChange() {
    this.querySelectorAll(".lumin-product-block-qty-break-variant select").forEach(
      (select) => {
        select.addEventListener("change", async () => {
          try {
            const response = await fetch(`${this.dataset.productUrl}.js`);
            if (!response.ok) throw new Error('Network response was not ok');
            const productData = await response.json();

            let totalPrice = 0;
            const discount = Number(this.dataset.discount);
            const discountType = this.dataset.discountType || 'percentage';
            const qty = Number(this.dataset.qty) || 1;
            let selectedVariants = "";

            this.querySelectorAll(".lumin-product-block-qty-break-variant").forEach(
              (elem) => {
                const selectedOptions = [];

                elem.querySelectorAll("select").forEach((select) => {
                  selectedOptions.push(select.value);
                });

                const selectedVariant = productData.variants.find(
                  (variant) =>
                    JSON.stringify(variant.options) ===
                    JSON.stringify(selectedOptions)
                );

                if (!selectedVariant) {
                  throw new Error('Selected variant not found');
                }

                totalPrice += selectedVariant.price;
                selectedVariants += `${selectedVariant.id},`;
              }
            );

            // Calculate new values for placeholders
            let unitprice, discountq;
            let mainTotalCents;
            const fixedPrice = Number(this.dataset.fixedPrice) || 0;
            if (discountType === 'percentage') {
              discountq = `${discount}%`;
              mainTotalCents = Math.round((totalPrice * (100 - discount)) / 100);
              const unitpriceFormatted = window.Shopify.formatMoney(Math.round(mainTotalCents / qty));
              unitprice = this.extractTextFromMoney(unitpriceFormatted);
            } else {
              const fixedPriceFormatted = window.Shopify.formatMoney(fixedPrice);
              discountq = this.extractTextFromMoney(fixedPriceFormatted);
              mainTotalCents = Math.max(totalPrice - fixedPrice, 0);
              const unitpriceFormatted = window.Shopify.formatMoney(Math.round(mainTotalCents / qty));
              unitprice = this.extractTextFromMoney(unitpriceFormatted);
            }

            // Update total price and compare price display respecting compare price type
            const comparePriceType = this.dataset.comparePriceType || 'calculated';
            const mainPriceHtml = window.Shopify.formatMoney(mainTotalCents).replace(".00", "");

            let compareHtml = '';
            if (comparePriceType === 'original') {
              // For original, estimate original compare-at total by fetching product json for current selected options
              // We already have selected variants summed in totalPrice. We need sum of compare_at_price.
              let totalCompareAt = 0;
              this.querySelectorAll(".lumin-product-block-qty-break-variant").forEach((elem) => {
                const selectedOptions = [];
                elem.querySelectorAll("select").forEach((select) => {
                  selectedOptions.push(select.value);
                });
                const selectedVariant = productData.variants.find(
                  (variant) => JSON.stringify(variant.options) === JSON.stringify(selectedOptions)
                );
                if (selectedVariant && selectedVariant.compare_at_price) {
                  totalCompareAt += Number(selectedVariant.compare_at_price);
                } else {
                  totalCompareAt += 0;
                }
              });
              if (totalCompareAt > mainTotalCents) {
                compareHtml = `<s>${window.Shopify.formatMoney(totalCompareAt).replace(".00", "")}</s>`;
              }
            } else {
              // calculated
              if (totalPrice > mainTotalCents) {
                compareHtml = `<s>${window.Shopify.formatMoney(totalPrice).replace(".00", "")}</s>`;
              }
            }

            this.querySelector(".lumin-product-block-qty-break-total").innerHTML = `${mainPriceHtml} ${compareHtml}`;

            // Update title and subtitle elements with new placeholder values
            this.querySelectorAll(".lumin-product-block-qty-break-title").forEach((titleElem) => {
              let originalText = titleElem.getAttribute('data-original-text');
              if (!originalText) {
                // Store the original text with placeholders on first run
                originalText = titleElem.textContent;
                titleElem.setAttribute('data-original-text', originalText);
              }
              // Replace placeholders while preserving HTML structure
              let updatedText = originalText.replace(/\[\$\]/g, unitprice).replace(/\[%\]/g, discountq);
              titleElem.innerHTML = updatedText;
            });

            this.querySelectorAll(".lumin-product-block-qty-break-subtitle").forEach((subtitleElem) => {
              let originalText = subtitleElem.getAttribute('data-original-text');
              if (!originalText) {
                // Store the original text with placeholders on first run
                originalText = subtitleElem.textContent;
                subtitleElem.setAttribute('data-original-text', originalText);
              }
              // Replace placeholders while preserving HTML structure
              let updatedText = originalText.replace(/\[\$\]/g, unitprice).replace(/\[%\]/g, discountq);
              subtitleElem.innerHTML = updatedText;
            });

            // Update bottom text if it exists
            this.querySelectorAll(".lumin-qty-bottom span").forEach((bottomTextElem) => {
              let originalText = bottomTextElem.getAttribute('data-original-text');
              if (!originalText) {
                // Store the original text with placeholders on first run
                originalText = bottomTextElem.textContent;
                bottomTextElem.setAttribute('data-original-text', originalText);
              }
              // Replace placeholders while preserving HTML structure
              let updatedText = originalText.replace(/\[\$\]/g, unitprice).replace(/\[%\]/g, discountq);
              bottomTextElem.innerHTML = updatedText;
            });

            // Update badge text if it exists
            this.querySelectorAll(".lumin-product-block-qty-break .bs-form-check-label span[data-original-text]").forEach((badgeElem) => {
              let originalText = badgeElem.getAttribute('data-original-text');
              if (!originalText) {
                // Store the original text with placeholders on first run
                originalText = badgeElem.textContent;
                badgeElem.setAttribute('data-original-text', originalText);
              }
              // Replace placeholders while preserving HTML structure
              let updatedText = originalText.replace(/\[\$\]/g, unitprice).replace(/\[%\]/g, discountq);
              badgeElem.innerHTML = updatedText;
            });

            this.querySelector("input").value = selectedVariants.slice(0, -1);
          } catch (error) {
            console.error('Error updating product options:', error);
          }
        });
      }
    );
  }

  handleAtc() {
    if (this.dataset.index !== "0") return;

    const atcBtn = this.closest(".product").querySelector('button[name="add"]');

    atcBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      const checkedInput = this.closest(".product").querySelector(
        ".lumin-product-block-qty-break input:checked"
      );
      
      if (!checkedInput) {
        console.error('No variant selected');
        return;
      }

      let variantIds = checkedInput.value;

      atcBtn.classList.add("loading");
      atcBtn.disabled = true;
      atcBtn.setAttribute("aria-busy", "true");
      atcBtn.querySelector(".loading__spinner").classList.remove("hidden");
      atcBtn.closest("product-form").handleErrorMessage();

      const cart =
        document.querySelector("cart-notification") ||
        document.querySelector("cart-drawer");

      const items = [];

      variantIds.split(",").forEach((id) => {
        items.push({
          id,
          quantity: 1,
        });
      });

      try {
        // Get sections to render if cart component exists
        let sections = cart ? cart.getSectionsToRender().map((section) => section.id) : [];

        const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, sections }),
        });
        
        const responseData = await response.json();

        if (response.ok) {
          if (cart) {
            // If cart component exists, update it
            cart.renderContents(responseData);
            if (cart.classList.contains("is-empty")) {
              cart.classList.remove("is-empty");
            }
            // If it's a cart drawer, open it
            if (cart.tagName.toLowerCase() === 'cart-drawer') {
              cart.open();
            }
          } else {
            // If no cart component, redirect to cart page
            window.location.href = `${window.Shopify.routes.root}cart`;
          }
        } else {
          atcBtn
            .closest("product-form")
            .handleErrorMessage(responseData.description);
        }
      } catch (error) {
        console.error('Error adding items to cart:', error);
        atcBtn
          .closest("product-form")
          .handleErrorMessage('Error adding items to cart. Please try again.');
      }

      atcBtn.style.width = "";
      atcBtn.classList.remove("loading");
      atcBtn.disabled = false;
      atcBtn.setAttribute("aria-busy", "false");
      atcBtn.querySelector(".loading__spinner").classList.add("hidden");
    });
  }

  extractTextFromMoney(moneyHtml) {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = moneyHtml;
    
    // Extract the text content and remove .00 if present
    let text = tempDiv.textContent || tempDiv.innerText || '';
    return text.replace(/\.00$/, '');
  }

  handleVariantChange() {
    if (this.dataset.index !== "0") return;

    const product = this.closest(".product");
    if (!product) return;

    const variantSelects = product.querySelector("variant-selects");
    if (!variantSelects) return;

    // Store the handler as a class property so we can remove it later
    this._variantChangeHandler = async (event) => {
      // Only process if this is the first quantity break block
      if (this.dataset.index !== "0") return;

      try {
        const response = await fetch(window.location.href);
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        const newDocument = new DOMParser().parseFromString(text, "text/html");

        product.querySelectorAll(".lumin-product-block-qty-break").forEach((elem) => {
          const newElement = newDocument.querySelector(
            `#lumin-product-block-qty-break-${elem.dataset.blockId}`
          );
          if (newElement) {
            elem.replaceWith(newElement);
          }
        });
      } catch (error) {
        console.error('Error updating quantity break blocks:', error);
      }
    };

    // Add the event listener
    document.addEventListener("variant:change", this._variantChangeHandler);
  }
}
customElements.define("lumin-product-qty-break", LuminProductQtyBreak);
window.LuminProductQtyBreak = LuminProductQtyBreak;

class LuminCrossSells extends HTMLElement {
  constructor() {
    super();

    this.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () =>
        this.onCheckboxChange(checkbox)
      );
    });

    this.querySelectorAll('select[name="variant-id"]').forEach((select) => {
      select.addEventListener("change", () => this.onChangeVariant(select));
    });

    this.querySelectorAll("[data-cross-sells-footer] .button").forEach(
      (btn) => {
        btn.addEventListener("click", () => this.addToCart(btn));
      }
    );
  }

  onChangeVariant(select) {
    const variantImage = select[select.selectedIndex].dataset.variantImage;

    if (variantImage.length) {
      select
        .closest("[data-cross-sells-list-item]")
        .querySelector(".img-wrapper img")
        .setAttribute("src", variantImage);
    }

    this.updateTotalPrice(); 
  }

  onCheckboxChange(checkbox) {
    if (checkbox.checked) {
      checkbox
        .closest("[data-cross-sells-list-item]")
        .setAttribute("data-is-selected", "true");
    } else {
      checkbox
        .closest("[data-cross-sells-list-item]")
        .setAttribute("data-is-selected", "false");
    }
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    let totalPrice = 0;
    let totalComparePrice = 0;

    this.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      if (checkbox.checked) {
        const inputHidden = checkbox
          .closest("[data-cross-sells-list-item]")
          .querySelector('input[name="variant-id"][type="hidden"]');
        if (inputHidden) {
          totalPrice += Number(inputHidden.dataset.price);
          totalComparePrice += Number(inputHidden.dataset.compareAtPrice);
        }

        const select = checkbox
          .closest("[data-cross-sells-list-item]")
          .querySelector('select[name="variant-id"]');
        if (select) {
          totalPrice += Number(select[select.selectedIndex].dataset.price);
          totalComparePrice += Number(
            select[select.selectedIndex].dataset.compareAtPrice
          );
        }
      }
    });

    const stripHtml = (html) => {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    this.querySelectorAll("[data-total-price]").forEach((elem) => {
      elem.textContent = stripHtml(window.Shopify.formatMoney(totalPrice)).replace(".00", "");
    });

    this.querySelectorAll("[data-total-compare-price]").forEach((elem) => {
      elem.textContent = stripHtml(window.Shopify.formatMoney(totalComparePrice)).replace(".00", "");
    });

    this.querySelectorAll("[data-total-savings]").forEach((elem) => {
      elem.textContent = stripHtml(window.Shopify.formatMoney(totalComparePrice - totalPrice)).replace(".00", "");
    });

    if (totalPrice === 0) {
      this.querySelector("[data-cross-sells-footer] .button").disabled = true;
    } else {
      this.querySelector("[data-cross-sells-footer] .button").disabled = false;
    }

    if (totalComparePrice > totalPrice) {
      this.querySelectorAll("[data-total-compare-price]").forEach((elem) => {
        elem.closest("s").removeAttribute("hidden");
      });
      this.querySelectorAll("[data-total-savings]").forEach((elem) => {
        elem.parentElement.removeAttribute("hidden");
      });
    } else {
      this.querySelectorAll("[data-total-compare-price]").forEach((elem) => {
        elem.closest("s").setAttribute("hidden", "hidden");
      });
      this.querySelectorAll("[data-total-savings]").forEach((elem) => {
        elem.parentElement.setAttribute("hidden", "hidden");
      });
    }
  }

  async addToCart(atcBtn) {
    atcBtn.classList.add("loading");
    atcBtn.disabled = true;
    atcBtn.setAttribute("aria-busy", "true");
    atcBtn.querySelector(".loading__spinner").classList.remove("hidden");

    const items = [];

    this.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      if (checkbox.checked) {
        const id = Number(
          checkbox
            .closest("[data-cross-sells-list-item]")
            .querySelector('[name="variant-id"]').value
        );

        items.push({
          id,
          quantity: 1,
        });
      }
    });

    try {
      const cart =
        document.querySelector("cart-notification") ||
        document.querySelector("cart-drawer");

      let sections = [];
      if (cart) {
        sections = cart.getSectionsToRender().map((section) => section.id);
      }

      const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, sections }),
      }); 

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();

      if (cart) {
        cart.renderContents(responseData);
        if (cart.classList.contains("is-empty")) {
          cart.classList.remove("is-empty");
        }
        // If it's a cart drawer, open it
        if (cart.tagName.toLowerCase() === 'cart-drawer') {
          cart.open();
        }
      } else {
        // If no cart component, redirect to cart page
        window.location.href = `${window.Shopify.routes.root}cart`;
      }
    } catch (error) {
      console.error('Error adding items to cart:', error);
      // Redirect to cart page on error
      window.location.href = `${window.Shopify.routes.root}cart`;
    } finally {
      atcBtn.style.width = "";
      atcBtn.classList.remove("loading");
      atcBtn.disabled = false;
      atcBtn.setAttribute("aria-busy", "false");
      atcBtn.querySelector(".loading__spinner").classList.add("hidden");
    }
  }
}
customElements.define("lumin-cross-sells", LuminCrossSells);