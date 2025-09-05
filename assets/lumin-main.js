/*
  © 2025 lumintheme
  https://www.lumintheme.com
*/

// Format money
window.Shopify.formatMoney = function (
  cents,
  moneyFormat = window.lumintheme.moneyFormat
) {
  if (typeof cents === "string") {
    cents = cents.replace(".", "");
  }

  let value = "";
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;

  function defaultOption(opt, def) {
    return typeof opt === "undefined" ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split(".");
    const dollars = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      "$1" + thousands
    );
    const cents = parts[1] ? decimal + parts[1] : "";

    return dollars + cents;
  }

  switch (moneyFormat.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
  }

  return moneyFormat.replace(placeholderRegex, value);
};

// Resize images
window.Shopify.resizeImage = function (src, size, crop = "") {
  return src
    .replace(
      /_(pico|icon|thumb|small|compact|medium|large|grande|original|1024x1024|2048x2048|master)+\./g,
      "."
    )
    .replace(/\.jpg|\.png|\.gif|\.jpeg/g, (match) => {
      if (crop.length) {
        crop = `_crop_${crop}`;
      }
      return `_${size}${crop}${match}`;
    });
};

// Calculate "xx time ago"
window.Shopify.calcTimeAgo = function (timestamp) {
  const now = new Date().getTime();
  const diff = now - timestamp;

  // Default time text values
  const defaultTimes = {
    moments: 'moments ago',
    minute: 'minute ago',
    minutes: 'minutes ago',
    hour: 'hour ago',
    hours: 'hours ago',
    day: 'day ago',
    days: 'days ago',
    ago: 'ago'
  };

  // Use window.lumintheme.times if available, otherwise use default values
  const times = window.lumintheme?.times || defaultTimes;

  let text;

  if (diff < 60000) {
    text = times.moments;
  } else if (diff < 3.6e6) {
    const min = Math.round(diff / 60000);
    text = min === 1 ? `${min} ${times.minute}` : `${min} ${times.minutes}`;
  } else if (diff < 8.64e7) {
    const hours = Math.round(diff / 3.6e6);
    text = hours === 1 ? `${hours} ${times.hour}` : `${hours} ${times.hours}`;
  } else {
    const days = Math.round(diff / 8.64e7);
    text = days === 1 ? `${days} ${times.day}` : `${days} ${times.days}`;
  }

  return `${text} ${times.ago}`;
};

// Create cookie helper fuction
window.ksCreateCookie = function (name, value, days) {
  let date, expires;
  if (days) {
    date = new Date();
    date.setDate(date.getDate() + days);
    expires = "; expires=" + date.toUTCString();
  } else {
    expires = "";
  }
  document.cookie = name + "=" + value + expires + "; path=/";
};

// Lazy load autoplayed videos
const lazyVideosObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.play();
        entry.target.muted = true;
      }
    });
  },
  { rootMargin: "0px 0px 300px 0px" }
);
document.querySelectorAll('video[data-autoplay="true"]').forEach((el) => {
  lazyVideosObserver.observe(el);
});

// Fix - Megamenu is not closed when clicking within the fancy slideshow
document.querySelectorAll(".lumin-fancy-slideshow").forEach((elem) => {
  elem.addEventListener("click", () => {
    document.querySelectorAll(".mega-menu").forEach((elem) => {
      elem.removeAttribute("open");
    });
    document.querySelectorAll(".header__menu-item").forEach((elem) => {
      elem.setAttribute("aria-expanded", "false");
    });
  });
});

// HTML5 accordions add animation support
document.querySelectorAll(".accordion__content").forEach((element) => {
  const detailsElement = element.closest("details");
  const summaryElement = element.previousElementSibling;

  detailsElement.classList.add("accordion__details");

  const wrapper = document.createElement("div");
  element.parentNode.insertBefore(wrapper, element);
  wrapper.appendChild(element);
  wrapper.id = element.id;
  wrapper.classList = element.classList;

  element.removeAttribute("id");
  element.removeAttribute("class");

  if (wrapper.classList.contains("rte")) {
    wrapper.classList.remove("rte");
    element.classList.add("rte");
  }

  summaryElement.addEventListener("click", (event) => {
    if (wrapper.classList.contains("summary-animation")) {
      wrapper.classList.remove("summary-animation", "summary-collapsing");
      void element.offsetWidth;
      return;
    }

    const onAnimationEnd = (cb) =>
      wrapper.addEventListener("animationend", cb, { once: true });

    requestAnimationFrame(() => wrapper.classList.add("summary-animation"));
    onAnimationEnd(() => wrapper.classList.remove("summary-animation"));

    const isDetailsOpen = detailsElement.getAttribute("open") !== null;
    if (isDetailsOpen) {
      event.preventDefault();
      wrapper.classList.add("summary-collapsing");
      onAnimationEnd(() => {
        detailsElement.removeAttribute("open");
        wrapper.classList.remove("summary-collapsing");
      });
    }
  });
});

class LuminWishlistDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.querySelector(".drawer__overlay").addEventListener(
      "click",
      this.close.bind(this)
    );
    this.addEventListener("click", (event) => {
      if (event.target === this) {
        this.close();
      }
    });
    this.setIconsAccessibility();
  }

  setIconsAccessibility() {
    document
      .querySelectorAll('a[href="#lumin-wishlist-drawer"]')
      .forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          this.open(link);
        });
        link.addEventListener("keydown", (event) => {
          if (event.code.toUpperCase() === "SPACE") {
            event.preventDefault();
            this.open(link);
          }
        });
      });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);

    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add("animate", "active");
      document.body.classList.add("overflow-hidden");
    });

    this.addEventListener(
      "transitionend",
      () => {
        const containerToTrapFocusOn = this.classList.contains("is-empty")
          ? this.querySelector(".drawer__inner-empty")
          : this.querySelector(".lumin-wishlist-drawer");
        const focusElement =
          this.querySelector(".drawer__inner") ||
          this.querySelector(".drawer__close");
        window.trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );
  }

  close() {
    this.classList.remove("active");
    window.removeTrapFocus(this.activeElement);
    document.body.classList.remove("overflow-hidden");
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define("lumin-wishlist-drawer", LuminWishlistDrawer);

class LuminWishlistContainer extends HTMLElement {
  constructor() {
    super();
    console.log('Wishlist container initialized');

    // Initialize immediately
    this.setCountBadges();
    this.setContent();

    // Listen for changes in localStorage
    window.addEventListener('storage', (event) => {
      if (event.key === 'lumin-wishlist') {
        console.log('Wishlist storage event received');
        this.setCountBadges();
        this.setContent();
      }
    });
  }

  get wishlist() {
    try {
      const stored = localStorage.getItem("lumin-wishlist");
      console.log('Raw wishlist from localStorage:', stored);
      const wishlist = stored ? JSON.parse(stored) : [];
      console.log('Parsed wishlist:', wishlist);
      return Array.isArray(wishlist) ? wishlist : [];
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return [];
    }
  }

  set wishlist(array) {
    try {
      console.log('Setting wishlist:', array);
      if (!Array.isArray(array)) {
        console.error('Invalid wishlist data:', array);
        return;
      }
      localStorage.setItem("lumin-wishlist", JSON.stringify(array));
      // Trigger storage event for other tabs/windows
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'lumin-wishlist',
        newValue: JSON.stringify(array)
      }));
    } catch (error) {
      console.error('Error setting wishlist:', error);
    }
  }

  async setProduct(url) {
    console.log('Setting product:', url);
    let wishlist = this.wishlist;
    const isWishlisted = wishlist.some((elem) => elem.url === url);
    console.log('Is wishlisted:', isWishlisted);

    if (isWishlisted) {
      wishlist = wishlist.filter((elem) => elem.url !== url);
      console.log('Removing from wishlist');
    } else {
      try {
        console.log('Fetching product data');
        const response = await fetch(`${url}.js`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();
        console.log('Product data received:', product);

        wishlist.push({
          url,
          id: product.id,
          handle: product.handle,
          title: product.title,
          img_src: product.featured_image,
          img_alt: product.featured_image.alt,
          compare_at_price: product.compare_at_price,
          price: product.price,
          price_varies: product.price_varies,
          added_at: Date.now(),
        });
        console.log('Product added to wishlist array');
      } catch (error) {
        console.error('Error fetching product data:', error);
        return;
      }
    }

    this.wishlist = wishlist;
    this.setCountBadges();
    this.setContent();
  }

  setCountBadges() {
    const count = this.wishlist.length;
    console.log('Setting count badges:', count);
    document.querySelectorAll(".wishlist-count-bubble").forEach((elem) => {
      const countSpan = elem.querySelector("span");
      if (countSpan) {
        countSpan.textContent = count;
        console.log('Updated count badge:', count);
      }
      if (count > 0) {
        elem.removeAttribute("hidden");
      } else {
        elem.setAttribute("hidden", "hidden");
      }
    });
  }

  setContent() {
    const wishlist = this.wishlist;
    console.log('Setting wishlist content, current wishlist:', wishlist);
    
    const emptyState = this.querySelector(".drawer__inner-empty.lumin-wishlist-empty");
    const productList = this.querySelector(".lumin-wishlist-drawer-product-list");
    const listWrapper = this.querySelector(".lumin-wishlist-drawer-product-list-wrapper");
    
    if (!emptyState || !productList || !listWrapper) {
      console.error('Required elements not found:', {
        emptyState: !!emptyState,
        productList: !!productList,
        listWrapper: !!listWrapper
      });
      return;
    }

    if (wishlist && wishlist.length > 0) {
      console.log('Wishlist has items, hiding empty state');
      emptyState.classList.add("hidden");
      this.classList.remove("is-empty");

      let productListHTML = "";
      let imgWidth = 600;
      let imgHeight = 600;

      switch (this.dataset.imgRatio) {
        case "ratio-4x3":
          imgWidth = 600;
          imgHeight = Math.round((600 / 4) * 3);
          break;
        case "ratio-3x4":
          imgWidth = Math.round((600 / 4) * 3);
          imgHeight = 600;
          break;
      }

      wishlist.forEach((product) => {
        productListHTML += `
          <div class="lumin-wishlist-drawer-product-list-item lumin-grid-product-list-item" role="listitem">
            <a href="${product.url}" tabindex="-1">
              <img 
                src="${window.Shopify.resizeImage(
                  product.img_src,
                  `${imgWidth}x${imgHeight}`,
                  "center"
                )}"
                class="product-card-img img-fluid ${this.dataset.imgBorder}" 
                alt="${product.img_alt}" 
                width="${imgWidth}" 
                height="${imgHeight}" 
                loading="lazy">
            </a>
            <div class="">
              <h4 class="title h5 text-truncate">
                <a href="${product.url}" class="full-unstyled-link">
                  ${product.title}
                </a>
              </h4>
              <div class="price">
                <div class="price__container">
                  <span class="price-item price-item--last">
                      ${window.Shopify.formatMoney(product.price)}
                  </span>
                </div>
              </div>
              <div class="lumin-grid-product-list-item-added-at">
                <svg xmlns="http://www.w3.org/2000/svg" class="me-2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${window.Shopify.calcTimeAgo(product.added_at)}
              </div>
            </div>
            <button 
              class="lumin-wishlist-product-item-btn-remove"
              type="button"
              aria-label="Remove"
              data-product-url="${product.url}">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-remove" viewBox="0 0 16 16" width="16" height="16"> 
                <path fill="currentColor" d="M14 3h-3.53a3.07 3.07 0 0 0-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 0 0 5.53 3H2a.5.5 0 0 0 0 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 0 0 .5-.5V4H14a.5.5 0 0 0 0-1M6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02m4.84 11.52h-7.5V4h7.5z"></path><path fill="currentColor" d="M6.55 5.25a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0v-6a.5.5 0 0 0-.5-.5m2.9 0a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0v-6a.5.5 0 0 0-.5-.5"></path>
              </svg>
            </button>
          </div>
        `;
      });

      productList.innerHTML = productListHTML;
      listWrapper.removeAttribute("hidden");

      document
        .querySelectorAll(".lumin-wishlist-product-item-btn-remove")
        .forEach((removeBtn) => {
          removeBtn.addEventListener("click", () => {
            this.setProduct(removeBtn.dataset.productUrl);

            document
              .querySelectorAll(".lumin-wishlist-btn")
              .forEach((wishlistButton) => {
                wishlistButton.adjustBtn();
              });
          });
        });
    } else {
      console.log('Wishlist is empty, showing empty state');
      emptyState.classList.remove("hidden");
      this.classList.add("is-empty");
      productList.innerHTML = "";
      listWrapper.setAttribute("hidden", "hidden");
    }
  }
}

customElements.define("lumin-wishlist-container", LuminWishlistContainer);

class LuminWishlistBtn extends HTMLElement {
  constructor() {
    super();
    console.log('Wishlist button initialized');

    this.btn = this.querySelector("button");
    if (!this.btn) {
      console.error('Wishlist button not found');
      return;
    }

    // Find the container first
    this.wishlistContainer = document.querySelector("lumin-wishlist-container");
    if (!this.wishlistContainer) {
      console.error('Wishlist container not found');
      return;
    }

    console.log('Wishlist container found:', this.wishlistContainer);
    console.log('Product URL:', this.dataset.productUrl);

    this.adjustBtn();

    this.btn.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('Wishlist button clicked');

      try {
        await this.wishlistContainer.setProduct(this.dataset.productUrl);
        console.log('Product added to wishlist');
        this.adjustBtn();
      } catch (error) {
        console.error('Error adding to wishlist:', error);
      }
    });
  }

  adjustBtn() {
    if (!this.wishlistContainer) {
      console.error('No wishlist container found in adjustBtn');
      return;
    }

    const isWishlisted = this.wishlistContainer.wishlist.some(
      (elem) => elem.url === this.dataset.productUrl
    );
    console.log('Is wishlisted:', isWishlisted);

    // Get wishlist text from window.kondasoft or use fallback values
    const wishlistText = window.kondasoft?.wishlist || {
      add: 'Add to wishlist',
      remove: 'Remove from wishlist'
    };

    if (isWishlisted) {
      this.btn.classList.add("active");
      this.btn.setAttribute("aria-label", wishlistText.remove);
      this.btn.setAttribute("aria-pressed", "true");
    } else {
      this.btn.classList.remove("active");
      this.btn.setAttribute("aria-label", wishlistText.add);
      this.btn.setAttribute("aria-pressed", "false");
    }
  }
}
customElements.define("lumin-wishlist-btn", LuminWishlistBtn);

class LuminRecentlyViewedDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.querySelector(".drawer__overlay").addEventListener(
      "click",
      this.close.bind(this)
    );
    this.addEventListener("click", (event) => {
      if (event.target === this) {
        this.close();
      }
    });
    this.setIconsAccessibility();
  }

  setIconsAccessibility() {
    document
      .querySelectorAll('a[href="#lumin-recently-viewed-drawer"]')
      .forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          this.open(link);
        });
        link.addEventListener("keydown", (event) => {
          if (event.code.toUpperCase() === "SPACE") {
            event.preventDefault();
            this.open(link);
          }
        });
      });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);

    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add("animate", "active");
    });

    this.addEventListener(
      "transitionend",
      () => {
        const containerToTrapFocusOn = this.classList.contains("is-empty")
          ? this.querySelector(".drawer__inner-empty")
          : this.querySelector(".lumin-recently-viewed-drawer");
        const focusElement =
          this.querySelector(".drawer__inner") ||
          this.querySelector(".drawer__close");
        window.trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add("overflow-hidden");
  }

  close() {
    this.classList.remove("active");
    window.removeTrapFocus(this.activeElement);
    document.body.classList.remove("overflow-hidden");
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define("lumin-recently-viewed-drawer", LuminRecentlyViewedDrawer);

class LuminRecentlyViewedContainer extends HTMLElement {
  constructor() {
    super();

    this.initTriggers();
    this.setContent();
    this.handleRemoveAll();
  }

  get recentlyViewed() {
    return JSON.parse(localStorage.getItem("lumin-recently-viewed")) || [];
  }

  set recentlyViewed(array) {
    localStorage.setItem("lumin-recently-viewed", JSON.stringify(array));
  }

  initTriggers() {
    document.querySelectorAll("[data-recently-viewed-set]").forEach((elem) => {
      this.setProduct(elem.dataset.productUrl).catch(error => {
        console.error('Error setting recently viewed product:', error);
      });
    });
  }

  async setProduct(url) {
    let recentlyViewed = this.recentlyViewed;
    const isViewed = this.recentlyViewed.some((elem) => elem.url === url);

    if (isViewed) {
      recentlyViewed = this.recentlyViewed.filter((elem) => elem.url !== url);
    }

    const response = await fetch(`${url}.js`);
    const product = await response.json();
    // console.log(product)

    recentlyViewed.push({
      url,
      id: product.id,
      handle: product.handle,
      title: product.title,
      img_src: product.featured_image,
      img_alt: product.featured_image.alt,
      compare_at_price: product.compare_at_price,
      price: product.price,
      price_varies: product.price_varies,
      added_at: Date.now(),
    });

    function keepLastXItemsInArray(arr, x) {
      if (x >= 0 && x <= arr.length) {
        return arr.slice(-x);
      } else {
        return arr;
      }
    }

    recentlyViewed = keepLastXItemsInArray(
      recentlyViewed,
      Number(this.dataset.limit)
    );

    this.recentlyViewed = recentlyViewed;
    this.setContent();
  }

  setContent() {
    if (this.recentlyViewed.length) {
      this.querySelector(".drawer__inner-empty.lumin-recently-viewed-empty").classList.add("hidden");
      this.classList.remove("is-empty");

      let productList = "";
      let imgWidth, imgHeight;

      switch (this.dataset.imgRatio) {
        case "ratio-4x3":
          imgWidth = 600;
          imgHeight = Math.round((600 / 4) * 3);
          break;
        case "ratio-3x4":
          imgWidth = Math.round((600 / 4) * 3);
          imgHeight = 600;
          break;
        default:
          imgWidth = 600;
          imgHeight = 600;
      }

      this.recentlyViewed.forEach((product) => {
        productList += `
          <div class="lumin-recently-viewed-drawer-product-list-item lumin-grid-product-list-item" role="listitem">
            <a href="${product.url}" tabindex="-1">
              <img 
                src="${window.Shopify.resizeImage(
                  product.img_src,
                  `${imgWidth}x${imgHeight}`,
                  "center"
                )}"
                class="img-fluid ${this.dataset.imgBorder}" 
                alt="${product.img_alt}" 
                width="${imgWidth}" 
                height="${imgHeight}" 
                loading="lazy">
            </a>
            <div class="">
              <h4 class="title h5 text-truncate">
                <a href="${product.url}" class="full-unstyled-link">
                  ${product.title}
                </a>
              </h4>
              <div class="price">
                <div class="price__container">
                  <span class="price-item price-item--last">
                      ${window.Shopify.formatMoney(product.price)}
                  </span>
                </div>
              </div>
              <div class="lumin-grid-product-list-item-added-at">
                <svg xmlns="http://www.w3.org/2000/svg" class="me-2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${window.Shopify.calcTimeAgo(product.added_at)}
              </div>
            </div>
            <button 
              class="lumin-recently-viewed-product-item-btn-remove"
              type="button"
              aria-label="Remove"
              data-product-url="${product.url}">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-remove" viewBox="0 0 16 16" width="16" height="16"> 
                <path fill="currentColor" d="M14 3h-3.53a3.07 3.07 0 0 0-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 0 0 5.53 3H2a.5.5 0 0 0 0 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 0 0 .5-.5V4H14a.5.5 0 0 0 0-1M6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02m4.84 11.52h-7.5V4h7.5z"></path><path fill="currentColor" d="M6.55 5.25a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0v-6a.5.5 0 0 0-.5-.5m2.9 0a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0v-6a.5.5 0 0 0-.5-.5"></path>
              </svg>
            </button>
          </div>
        `;
      });

      this.querySelector(".lumin-recently-viewed-drawer-product-list").innerHTML =
        productList;
      this.querySelector(
        ".lumin-recently-viewed-drawer-product-list-wrapper"
      ).removeAttribute("hidden");

      this.querySelectorAll(
        ".lumin-recently-viewed-product-item-btn-remove"
      ).forEach((removeBtn) => {
        removeBtn.addEventListener("click", () => {
          let recentlyViewed = this.recentlyViewed.filter(
            (elem) => elem.url !== removeBtn.dataset.productUrl
          );
          console.log(recentlyViewed);
          this.recentlyViewed = recentlyViewed;
          this.setContent();
        });
      });
    } else {
      this.querySelector(".drawer__inner-empty.lumin-recently-viewed-empty").classList.remove("hidden");
      this.classList.add("is-empty");
      this.querySelector(".lumin-recently-viewed-drawer-product-list").innerHTML =
        "";
      this.querySelector(
        ".lumin-recently-viewed-drawer-product-list-wrapper"
      ).setAttribute("hidden", "hidden");
    }
  }

  handleRemoveAll() {
    document
      .querySelectorAll(".lumin-recently-viewed-btm-remove-all")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          this.recentlyViewed = [];
          this.setContent();
        });
      });
  }
}

customElements.define(
  "lumin-recently-viewed-container",
  LuminRecentlyViewedContainer
);
