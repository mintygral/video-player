const playPauseBtn = document.querySelector(".play-pause-btn");
const theaterBtn = document.querySelector(".theater-btn");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const miniPlayerBtn = document.querySelector(".mini-player-btn");
const muteBtn = document.querySelector(".mute-btn");
const captionsBtn = document.querySelector(".captions-btn");
const speedBtn = document.querySelector(".speed-btn");
const currentTimeElem = document.querySelector(".current-time");
const totalTimeElem = document.querySelector(".total-time");
const previewImg = document.querySelector(".preview-img");
const thumbnailImg = document.querySelector(".thumbnail-img");
const volumeSlider = document.querySelector(".volume-slider");
const videoContainer = document.querySelector(".video-container");
const timelineContainer = document.querySelector(".timeline-container");
const videoElement = document.getElementById("videoElement");
const videoFileInput = document.getElementById("videoFileInput");

let isScrubbing = false;
let wasPaused;

console.log('Script loaded');

function loadVideo(videoFileInput) {
  const file = videoFileInput.files[0]; // Use videoFileInput instead of input
  if (file) {
    const objectURL = URL.createObjectURL(file);
    videoElement.src = objectURL;
    videoElement.load();
    videoElement.play();
  }
}

videoFileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    videoElement.src = objectURL;
    videoElement.load();
    videoElement.play(); // Start playing the video
  }
});

document.addEventListener("keydown", e => {
  const tagName = document.activeElement.tagName.toLowerCase();

  if (tagName === "input") return;

  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return;
    case "k":
      togglePlay();
      break;
    case "f":
      toggleFullScreenMode();
      break;
    case "t":
      toggleTheaterMode();
      break;
    case "i":
      toggleMiniPlayerMode();
      break;
    case "m":
      toggleMute();
      break;
    case "arrowleft":
    case "j":
      skip(-5);
      break;
    case "arrowright":
    case "l":
      skip(5);
      break;
    case "c":
      toggleCaptions();
      break;
  }
});

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", e => {
  if (isScrubbing) toggleScrubbing(e);
});
document.addEventListener("mousemove", e => {
  if (isScrubbing) handleTimelineUpdate(e);
});

function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = e.type === "mousedown";
  videoContainer.classList.toggle("scrubbing", isScrubbing);

  if (isScrubbing) {
    if (!videoElement.paused) {
      videoElement.pause();
    }
  } else {
    videoElement.currentTime = percent * videoElement.duration;
    if (!wasPaused) {
      videoElement.play();
    }
  }

  handleTimelineUpdate(e);
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
}

// Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed);

function changePlaybackSpeed() {
  let newPlaybackRate = videoElement.playbackRate + 0.25;
  if (newPlaybackRate > 2) newPlaybackRate = 0.25;
  videoElement.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;

  // If the video is paused and the playback speed is changed, play it
  if (videoElement.paused) {
    videoElement.play();
    videoContainer.classList.remove("paused");
  }
}

// Captions
const captions = videoElement.textTracks[0];

if (captions) {
  captions.mode = "hidden";
}


captionsBtn.addEventListener("click", toggleCaptions);

function toggleCaptions() {
  const isHidden = captions.mode === "hidden";
  captions.mode = isHidden ? "showing" : "hidden";
  videoContainer.classList.toggle("captions", isHidden);
}

// Duration
videoElement.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(videoElement.duration);
  volumeSlider.value = videoElement.volume;
  videoContainer.dataset.volumeLevel =
    videoElement.volume >= 0.5 ? "high" : "low";

  videoElement.addEventListener("volumechange", () => {
    volumeSlider.value = videoElement.volume;
    let volumeLevel;
    if (videoElement.muted || videoElement.volume === 0) {
      volumeSlider.value = 0;
      volumeLevel = "muted";
    } else if (videoElement.volume >= 0.5) {
      volumeLevel = "high";
    } else {
      volumeLevel = "low";
    }

    videoContainer.dataset.volumeLevel = volumeLevel;
  });
});

videoElement.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(videoElement.currentTime);
  const percent = videoElement.currentTime / videoElement.duration;
  timelineContainer.style.setProperty("--progress-position", percent);
});

function formatDuration(time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  const displayHours = hours > 0 ? hours + ":" : "";
  const displayMinutes =
    (displayHours && minutes < 10 ? "0" : "") + minutes + ":";
  const displaySeconds = (seconds < 10 ? "0" : "") + seconds;

  return displayHours + displayMinutes + displaySeconds;
}

function skip(duration) {
  videoElement.currentTime += duration;
}

// Volume
muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", e => {
  videoElement.volume = e.target.value;
  videoElement.muted = e.target.value === 0;
});

function toggleMute() {
  videoElement.muted = !videoElement.muted;
}

// View Modes
theaterBtn.addEventListener("click", toggleTheaterMode);
fullScreenBtn.addEventListener("click", toggleFullScreenMode);
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode);

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater");
}

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture();
  } else {
    videoElement.requestPictureInPicture();
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

videoElement.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player");
});

videoElement.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player");
});

// Play/Pause
videoElement.addEventListener("click", togglePlay);

function togglePlay() {
  if (videoElement.paused) {
    videoElement.play();
  } else {
    videoElement.pause();
  }
  console.log('Video paused:', videoElement.paused);
}

videoElement.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
  playPauseBtn.classList.add("playing"); // Add a playing class for styling
});

videoElement.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
  playPauseBtn.classList.remove("playing"); // Remove the playing class
});

videoElement.addEventListener('canplaythrough', function () {
  videoElement.play();
});


