const playPauseBtn = document.querySelector(".play-pause-btn");
const video = document.querySelector("video");
const videoContainer = document.querySelector(".video-container");
const theaterBtn = document.querySelector(".theater-btn");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const muteBtn = document.querySelector(".mute-btn");
const volumeSlider = document.querySelector(".volume-slider");
const currentTimeE = document.querySelector(".current-time");
const totalTimeE = document.querySelector(".total-time");
const captionsBtn = document.querySelector(".closed-captions-btn");
const speedBtn = document.querySelector(".speed-btn");
const timelineContainer = document.querySelector(".timeline-container");

document.addEventListener("keydown", (e) => {
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
    case ".":
      {
        let newPlaybackRate = video.playbackRate + 0.25;
        if (newPlaybackRate > 3) newPlaybackRate = 3;
        video.playbackRate = newPlaybackRate;
        speedBtn.textContent = `${newPlaybackRate}x`;
      }
      break;
    case ",":
      {
        let newPlaybackRate = video.playbackRate - 0.25;
        if (newPlaybackRate < 0.25) newPlaybackRate = 0.25;
        video.playbackRate = newPlaybackRate;
        speedBtn.textContent = `${newPlaybackRate}x`;
      }
      break;
    case "arrowup":
      if (video.muted) {
        toggleMute();
        video.volume = 0.1;
      } else if (video.volume < 0.9) video.volume += 0.1;
      break;
    case "arrowdown":
      if (video.volume <= 0.1) {
        toggleMute();
        video.volume = 0;
      } else video.volume -= 0.1;
      break;
  }
});

timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});

document.addEventListener("mousemove", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});

let isScrubbing = false;
let wasPaused = true;
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = (e.buttons & 1) === 1;
  videoContainer.classList.toggle("scrubbing", isScrubbing);
  if (isScrubbing) {
    video.pause();
  } else {
    video.currentTime = percent * video.duration;
    if (!wasPaused) video.play();
  }
  handleTimelineUpdate(e);
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  timelineContainer.style.setProperty("--preview-position", percent);

  if (isScrubbing) {
    e.preventDefault();
    timelineContainer.style.setProperty("--progress-position", percent);
  }
}

speedBtn.addEventListener("click", changePlaybackSpeed);

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  if (newPlaybackRate > 3) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
}

const captions = video.textTracks[0];
captions.mode = "hidden";

captionsBtn.addEventListener("click", toggleCaptions);

function toggleCaptions() {
  const isHidden = captions.mode === "hidden";
  captions.mode = isHidden ? "showing" : "hidden";
  videoContainer.classList.toggle("captions", isHidden);
}

video.addEventListener("loadedmetadata", () => {
  totalTimeE.textContent = formatduration(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTimeE.textContent = formatduration(video.currentTime);
  const percent = video.currentTime / video.duration;
  timelineContainer.style.setProperty("--progress-position", percent);
});

function skip(duration) {
  video.currentTime += duration;
}

const leadingLeadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});
function formatduration(time) {
  const sec = Math.floor(time % 60);
  const min = Math.floor(time / 60) % 60;
  const hr = Math.floor(time / 3600);
  if (hr === 0) {
    return `${min}:${leadingLeadingZeroFormatter.format(sec)}`;
  } else {
    return `${hr}:${leadingLeadingZeroFormatter.format(
      min
    )}:${leadingLeadingZeroFormatter.format(sec)}`;
  }
}

muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

function toggleMute() {
  video.muted = !video.muted;
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }

  videoContainer.dataset.volumeLevel = volumeLevel;
});

theaterBtn.addEventListener("click", toggleTheaterMode);
fullScreenBtn.addEventListener("click", toggleFullScreenMode);

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater");
}

function toggleFullScreenMode() {
  if (document.fullscreenElement === null) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

playPauseBtn.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);

function togglePlay() {
  // video.paused ? video.play() : video.pause();
  if (video.paused) {
    video.play();
    wasPaused = false;
  } else {
    video.pause();
    wasPaused = true;
  }
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
});
