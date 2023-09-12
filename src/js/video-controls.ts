import { $, $$ } from './utils/dom';
import { PREFERS_REDUCED_MOTION } from './utils/prefers-reduced-motion';

class VideoControls {
  elem: HTMLElement;
  controls: HTMLElement;
  videoElement: HTMLMediaElement;
  playButton: HTMLElement;
  pauseButton: HTMLElement;

  constructor(elem: HTMLElement) {
    this.elem = elem;
    this.videoElement = $('.campaign-section__video', this.elem);
    this.controls = $('[data-video-trigger]', this.elem);
    this.playButton = $('.video--button-play', this.elem);
    this.pauseButton = $('.video--button-pause', this.elem);

    this.handleClick = this.handleClick.bind(this);
    this.init();
  }

  init() {
    this.addListeners();

    if (
      window.matchMedia('(max-width: 512px)').matches ||
      PREFERS_REDUCED_MOTION
    ) {
      this.videoElement.autoplay = false;
      this.controls.classList.add('not-playing');
      this.controls.setAttribute('aria-hidden', 'true');
    } else {
      this.controls.setAttribute('aria-hidden', 'false');
      this.playButton.setAttribute('aria-hidden', 'true');
      this.pauseButton.setAttribute('aria-hidden', 'false');
    }
  }

  addListeners() {
    this.controls.addEventListener('click', this.handleClick);
  }

  handleClick(e: Event) {
    this.controls.classList.toggle('not-playing');
    if (this.controls.classList.contains('not-playing')) {
      this.videoElement.pause();
      this.playButton.setAttribute('aria-hidden', 'false');
      this.pauseButton.setAttribute('aria-hidden', 'true');
    } else {
      this.videoElement.play();
      this.playButton.setAttribute('aria-hidden', 'true');
      this.pauseButton.setAttribute('aria-hidden', 'false');
    }
  }
}

const introSection = $('.campaign-section.intro');

if(introSection) {
  new VideoControls(introSection);
}; 

export default VideoControls;
