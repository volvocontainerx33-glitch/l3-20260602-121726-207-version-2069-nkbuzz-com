(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("play-toggle");

    if (!video || !button) {
      return;
    }

    var initialized = false;
    var hlsInstance = null;

    function attachStream() {
      if (initialized) {
        return Promise.resolve();
      }

      var source = video.getAttribute("data-src");
      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }

      video.src = source;
      return Promise.resolve();
    }

    function play() {
      attachStream().then(function () {
        var playback = video.play();
        if (playback && typeof playback.catch === "function") {
          playback.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", function () {
      button.classList.add("is-hidden");
      play();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        button.classList.add("is-hidden");
        play();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
