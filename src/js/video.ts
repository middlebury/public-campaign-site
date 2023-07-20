import { on, $, $$ } from './utils/dom';
import decodeHtml from './utils/decode-html';
import { onOutOfElementView } from './utils/on-element-out-of-view';

/**
 * Swaps the cotents of an element with an iframe (retrieved from data attribute) on link click.
 * - For lazy loading a video iframe into page after user clicks to play the video.
 * - If js breaks, the anchor can link directly to the video service page. Non-JS experience may ot matter since the service will likely need JS.
 * - Checks for enter key and space bar press on anchor link for a11y.
 *
 * @example
 * ```html
 * <figure
 *   class="js-video"
 *   data-video='<iframe src="https://player.vimeo.com/video/221201240?autoplay=1" width="400" height="225" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen allow="autoplay"></iframe>'>
 * <div class="js-video-content">
 *   <a
 *     href="https://player.vimeo.com/video/221201240"
 *     class="js-video-link"
 *     role="button"
 *     aria-label="Play video"
 *   >
 *
 *     <img src="<splash image>" alt="" />
 *   </a>
 * </div>
 * </figure>
 * ```
 *
 * @todo: cleaner set up for this is to construct the iframe from the anchor tag href instead of storing
 * the encoded video in the data-video attribute.
 */
class VideoSwap {
  elem: HTMLElement;
  activeClass: string;
  content: HTMLElement | null;
  link: HTMLElement | null;
  originalContent: HTMLElement | null;
  flag: boolean;

  /** iframe string encoded from server */
  iframe: string | null;

  constructor(elem: HTMLElement) {
    this.elem = elem;
    this.originalContent = elem;
    this.content = $('.js-video-content', elem);
    this.link = $('.js-video-link', elem);
    this.iframe = elem.getAttribute('data-video');

    this.activeClass = 'has-video';

    this.hideVideo = this.hideVideo.bind(this);
    this.init();
  }

  init() {
    this.addListeners();
  }

  addListeners() {
    if (this.link) {
      on(this.link, 'click', this.handleVideoEmbedClick);
      on(this.link, 'keydown', this.handleKeyUp);
    }
  }

  hideVideo() {
    this.elem.classList.remove(this.activeClass);

    if (this.content) {
      this.content.innerHTML = this.link.outerHTML;
    }

    this.link = $('.js-video-link', this.elem);

    this.addListeners();
  }

  showVideo() {
    this.elem.classList.add(this.activeClass);

    if (!this.iframe) {
      console.warn('No data-video set for video', this.elem);
      return;
    }

    const html = decodeHtml(this.iframe);

    if (this.content) {
      this.content.innerHTML = html || this.iframe;
    }

    onOutOfElementView(this.elem, () => {
      this.hideVideo();
    });
  }

  handleKeyUp = (e: KeyboardEvent) => {
    // Check for spacebar press since the video should always use a link.
    // We want to be able to set the link as role='button' and allow
    // keyboard users to use spacebar as that is a common alternative to enter key press
    // to interact with buttons.
    if (e.keyCode === 32) {
      e.preventDefault();
      this.showVideo();
    }
  };

  handleVideoEmbedClick = (e: Event) => {
    e.preventDefault();

    this.showVideo();
  };
}

const elems = $$('.js-video');

elems.forEach((elem) => new VideoSwap(elem));

export default VideoSwap;
