(function () {
  const DURATION = 6000;
  const FADE_DURATION = 1500;
  const VIDEO_SOURCES = [
    "assets/images/kv-1.mp4",
    "assets/images/kv-2.mp4",
    "assets/images/kv-3.mp4",
    "assets/images/kv-4.mp4",
  ];

  class KvVideoController {
    constructor(root) {
      this.root = root;
      this.videos = Array.from(root.querySelectorAll(".kv__video"));
      this.progressFill = root.querySelector(".kv__progress-fill");
      this.prevButton = root.querySelector(".kv__prev");
      this.nextButton = root.querySelector(".kv__next");
      this.toggleButton = root.querySelector(".kv__toggle");
      this.toggleIcon = root.querySelector(".kv__play-icon");

      this.currentVideoLayer = 0;
      this.currentSourceIndex = 0;
      this.isPaused = false;
      this.isTransitioning = false;
      this.rafId = null;
      this.cycleStartedAt = 0;
      this.pausedElapsed = 0;
      this.transitionTimeoutId = null;

      this.bindEvents();
      this.initialize();
    }

    bindEvents() {
      this.prevButton.addEventListener("click", () => this.changeVideo(-1));
      this.nextButton.addEventListener("click", () => this.changeVideo(1));
      this.toggleButton.addEventListener("click", () => this.togglePause());
    }

    initialize() {
      const firstVideo = this.getActiveVideo();
      this.setVideoSource(firstVideo, this.currentSourceIndex);
      firstVideo.classList.add("is-active");
      this.playVideo(firstVideo);
      this.restartCycle();
      this.tick();
    }

    normalizeIndex(index) {
      return (index + VIDEO_SOURCES.length) % VIDEO_SOURCES.length;
    }

    getActiveVideo() {
      return this.videos[this.currentVideoLayer];
    }

    getInactiveVideo() {
      return this.videos[1 - this.currentVideoLayer];
    }

    setVideoSource(videoElement, sourceIndex) {
      videoElement.src = VIDEO_SOURCES[this.normalizeIndex(sourceIndex)];
      videoElement.load();
    }

    playVideo(videoElement) {
      videoElement.play().catch(() => {});
    }

    waitForVideoReady(videoElement) {
      if (videoElement.readyState >= 3) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const onReady = () => {
          videoElement.removeEventListener("canplay", onReady);
          resolve();
        };
        videoElement.addEventListener("canplay", onReady, { once: true });
      });
    }

    restartCycle() {
      cancelAnimationFrame(this.rafId);
      this.cycleStartedAt = performance.now();
      this.pausedElapsed = 0;
      this.progressFill.style.width = "0%";
    }

    tick = (now = performance.now()) => {
      if (this.isPaused) return;

      const elapsed = now - this.cycleStartedAt;
      const progress = Math.min(elapsed / DURATION, 1);
      this.progressFill.style.width = `${progress * 100}%`;

      if (elapsed >= DURATION && !this.isTransitioning) {
        this.transitionTo(this.currentSourceIndex + 1);
        return;
      }

      this.rafId = requestAnimationFrame(this.tick);
    };

    changeVideo(step) {
      this.transitionTo(this.currentSourceIndex + step);
    }

    transitionTo(targetSourceIndex) {
      if (this.isTransitioning) return;

      this.isTransitioning = true;
      const nextSourceIndex = this.normalizeIndex(targetSourceIndex);
      const currentVideo = this.getActiveVideo();
      const nextVideo = this.getInactiveVideo();

      clearTimeout(this.transitionTimeoutId);
      this.restartCycle();
      this.currentSourceIndex = nextSourceIndex;

      const startCrossFade = () => {
        nextVideo.currentTime = 0;
        if (!this.isPaused) this.playVideo(nextVideo);

        nextVideo.classList.add("is-active");
        currentVideo.classList.remove("is-active");

        this.transitionTimeoutId = setTimeout(() => {
          currentVideo.pause();
          currentVideo.currentTime = 0;

          this.currentVideoLayer = this.currentVideoLayer === 0 ? 1 : 0;
          this.isTransitioning = false;

          if (!this.isPaused) {
            this.tick();
          }
        }, FADE_DURATION);
      };

      this.setVideoSource(nextVideo, nextSourceIndex);
      this.waitForVideoReady(nextVideo).then(() => {
        if (!this.isTransitioning) return;
        startCrossFade();
      });
    }

    togglePause() {
      if (this.isPaused) {
        this.isPaused = false;
        this.cycleStartedAt = performance.now() - this.pausedElapsed;
        this.videos.forEach((video) => {
          if (video.classList.contains("is-active")) this.playVideo(video);
        });
        this.updateToggleUI();
        this.tick();
        return;
      }

      this.isPaused = true;
      cancelAnimationFrame(this.rafId);
      this.pausedElapsed = performance.now() - this.cycleStartedAt;
      this.videos.forEach((video) => video.pause());
      this.updateToggleUI();
    }

    updateToggleUI() {
      this.toggleIcon.textContent = this.isPaused ? "▲" : "〓";
      this.toggleButton.setAttribute("aria-label", this.isPaused ? "재생" : "일시정지");
    }
  }

  function initializeKvSection() {
    const kvSection = document.querySelector(".kv");
    if (!kvSection) return;
    new KvVideoController(kvSection);
  }

  function initializeRoomTabs() {
    const roomSection = document.querySelector(".room");
    if (!roomSection) return;

    const tabButtons = Array.from(roomSection.querySelectorAll(".room__tab"));
    const sourceMap = new Map(
      Array.from(roomSection.querySelectorAll(".room__source")).map((source) => [source.dataset.tab, source])
    );
    const mediaWrapper = roomSection.querySelector(".room__media");
    const contentWrapper = roomSection.querySelector(".room__content");
    const imageElement = roomSection.querySelector(".room__media img");
    const titleElement = roomSection.querySelector(".room__title");
    const descriptionElement = roomSection.querySelector(".room__content p");
    const viewMoreElement = roomSection.querySelector(".room__view-more");
    let isSwitching = false;
    if (!tabButtons.length || !sourceMap.size) return;
    if (!mediaWrapper || !contentWrapper || !imageElement || !titleElement || !descriptionElement || !viewMoreElement) return;

    const updateDisplayContent = (tabName) => {
      const source = sourceMap.get(tabName);
      if (!source) return;

      const sourceImage = source.querySelector("img");
      const sourceTitle = source.querySelector("h3");
      const sourceDescription = source.querySelector("p");
      const sourceLink = source.querySelector("a");
      if (!sourceImage || !sourceTitle || !sourceDescription || !sourceLink) return;

      imageElement.src = sourceImage.getAttribute("src") || "";
      imageElement.alt = sourceImage.getAttribute("alt") || "";
      titleElement.textContent = sourceTitle.textContent || "";
      descriptionElement.innerHTML = sourceDescription.innerHTML;
      viewMoreElement.textContent = sourceLink.textContent || "";
      viewMoreElement.href = sourceLink.getAttribute("href") || "#";
    };

    const activateTab = (tabName) => {
      tabButtons.forEach((button) => {
        const isActive = button.dataset.tab === tabName;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      mediaWrapper.classList.add("is-fading");
      contentWrapper.classList.add("is-fading");

      window.setTimeout(() => {
        updateDisplayContent(tabName);
        mediaWrapper.classList.remove("is-fading");
        contentWrapper.classList.remove("is-fading");
        isSwitching = false;
      }, 220);
    };

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (isSwitching || button.classList.contains("is-active")) return;
        isSwitching = true;
        activateTab(button.dataset.tab);
      });
    });
  }

  initializeKvSection();
  initializeRoomTabs();
})();
