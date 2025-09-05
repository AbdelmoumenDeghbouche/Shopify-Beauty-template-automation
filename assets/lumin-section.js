/*
  © 2025 LuminTheme
  https://www.lumintheme.com
*/

class LuminShoppableVideos extends HTMLElement {
    constructor() {
      super();
  
      this.querySelectorAll("video").forEach((video) => {
        video.addEventListener("click", () => {
          this.onVideoPlay(video);
        });
      });
  
      this.querySelectorAll("a[data-quick-view]").forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          this.openQuickView(link);
        });
      });
  
      this.querySelector(".slider").addEventListener("scroll", () => {
        this.querySelectorAll("video").forEach((video) => {
          video.closest(".card").setAttribute("data-playing", "false");
          video.pause();
        });
      });
    }
  
    onVideoPlay(video) {
      this.querySelectorAll("video").forEach((elem) => {
        if (elem.dataset.index !== video.dataset.index) {
          elem.closest(".card").setAttribute("data-playing", "false");
          elem.pause();
        }
      });
  
      const card = video.closest(".card");
  
      if (card.dataset.playing === "true") {
        video.closest(".card").setAttribute("data-playing", "false");
        video.pause();
      } else {
        video.closest(".card").setAttribute("data-playing", "true");
        video.muted = false;
        video.play();
      }
    }
  
    async openQuickView(link) {
      link.disabled = true;
      link.setAttribute("aria-busy", "true");
      link.querySelector(".icon-wrapper").setAttribute("hidden", "hidden");
      link.querySelector(".spinner-border").removeAttribute("hidden");
  
      const response = await fetch(link.dataset.productUrl + ".js");
  
      if (response.ok) {
        const data = await response.json();
        console.log(data);
  
        document.querySelector("product-quick-view-modal").showModal(data);
      }
  
      link.disabled = false;
      link.removeAttribute("aria-busy");
      link.querySelector(".icon-wrapper").removeAttribute("hidden");
      link.querySelector(".spinner-border").setAttribute("hidden", "hidden");
    }
  }
  customElements.define("lumin-shoppable-videos", LuminShoppableVideos);

 