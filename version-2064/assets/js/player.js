(function () {
  window.setupPlayer = function (options) {
    var video = document.querySelector(options.videoSelector);
    var button = document.querySelector(options.playSelector);
    var url = options.url;
    var prepared = false;
    var hlsInstance = null;

    if (!video || !button || !url) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function beginPlayback() {
      prepare();
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", beginPlayback);

    video.addEventListener("click", function () {
      if (video.paused) {
        beginPlayback();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
