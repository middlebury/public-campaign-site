import MicroModal from 'micromodal';
import lozad from 'lozad';
import anime from 'animejs';

import { $, $$, on, off, addClass, removeClass } from './utils/dom';
import onscroll from './utils/onscroll';
import SmoothScroll from './smooth-scroll';

import { LEFT_ARROW_KEY, RIGHT_ARROW_KEY } from './constants';

/**
 * Creates a lightbox gallery with prev/next buttons, a list of images and thumbnails,
 * and a pagination count (1/10) of the active image in view.
 *
 *
 * Example:
 *
 * <div data-lightbox>
 *
 *   <button data-lightbox-next>next</button>
 *   <button data-lightbox-prev>prev</button>
 *
 *   <div data-lightbox-count>(the pagination will render here)</div>
 *
 *   <ol data-lightbox-thumbs>
 *     <li><a href="#image-1" data-lightbox-thumb><img src="" alt=""></a></li>
 *   </ol>
 *
 *   <!-- each item must have an id that corresponds with the anchor link in the thumbs -->
 *
 *   <figure data-lightbox-item id="image-1">
 *     <!-- must contain an image -->
 *     <img src="" alt="">
 *   </figure>
 *
 * </div>
 */
class Lightbox {
  center: any;
  closeBtn: any;
  count: any;
  el: any;
  images: any;
  index: any;
  isAnimating: any;
  isAnimatingThumb: any;
  items: any;
  nextBtn: any;
  observer: any;
  prevBtn: any;
  scrollRaf: any;
  smoothScroller: any;
  thumbs: any;
  thumbsList: any;
  total: any;
  constructor(el: any) {
    this.el = el;

    this.nextBtn = $('[data-lightbox-next]', el);
    this.prevBtn = $('[data-lightbox-prev]', el);
    this.count = $('[data-lightbox-count]', el);
    this.closeBtn = $('[data-lightbox-close]', el);
    this.items = $$('[data-lightbox-item]', el);
    this.images = $$('[data-lightbox-item] img', el);
    this.thumbs = $$('[data-lightbox-thumb]', el);
    this.thumbsList = $('[data-lightbox-thumbs]', el);

    // capture the vertical center of the lightbox
    this.center = el.offsetHeight / 2;

    this.index = 0;
    this.total = this.items.length;
    this.isAnimating = false;
    this.isAnimatingThumb = false;

    // initialize some properties for instances of other widgets so we can destroy them later.
    this.observer = null;
    this.smoothScroller = null;

    this.init();
  }

  init() {
    this.addListeners();
    // this.updateCount(this.index);
    this.setActive(this.index);

    // Since prev btn gets focused automatically by micromodal, we want to focus the close btn instead
    // as that's a better first action for keyboard users.
    this.closeBtn.focus();
  }

  updateCount(index: any) {
    this.count.innerHTML = `${index + 1}/${this.total}`;
  }

  destroy() {
    off(this.el, 'keyup', this.handleKeyUp);
    off(this.nextBtn, 'click', this.next);
    off(this.prevBtn, 'click', this.prev);

    this.smoothScroller.destroy();
    this.scrollRaf.destroy();

    // reset scroll position on close since everything else resets on open
    this.el.scrollTop = 0;
  }

  addListeners() {
    on(this.el, 'keyup', this.handleKeyUp);
    on(this.nextBtn, 'click', this.next);
    on(this.prevBtn, 'click', this.prev);

    // set the onscroll listener so we can destroy it on modal close
    this.scrollRaf = onscroll(this.handleScroll, this.el);

    this.smoothScroller = new SmoothScroll(this.thumbs, {
      // our scroll area is the lightbox, not default body
      container: this.el,

      // instead of default scrolling to the top of the image, we want to center it
      scrollTop: (el: HTMLElement, scrollPos: number) => {
        const rect = el.getBoundingClientRect();
        const centerEl = rect.height / 2;
        // vertically center the target in the middle of the lightbox
        const top = rect.top + scrollPos + centerEl - this.center;

        return top;
      },

      // set animating flag so we can skip updating active one when scrolling
      begin: () => {
        this.isAnimating = true;
      },

      // unset the animating flag when done
      complete: () => {
        this.isAnimating = false;
      }
    });

    // init lazy loaded images

    const lazyThumbs = lozad(
      '[data-lightbox-item] img, [data-lightbox-thumb] img'
    );
    lazyThumbs.observe();
  }

  /**
   * sets the image that is in vertical center of view as active
   */
  handleScroll = () => {
    // skip updating the active item if we're animating to another one via thumb/controls
    if (this.isAnimating) return;

    this.images.forEach((el: any, i: any) => {
      const rect = el.getBoundingClientRect();

      // if top of image is above center point
      // and bottom of image is below center point we can
      // assume it's the 'active' image in view

      // also do nothing if navigating to the already active image
      if (
        rect.top <= this.center &&
        rect.bottom >= this.center &&
        this.index !== i
      ) {
        this.setActive(i);
      }
    });
  };

  /**
   * scrolls the thumbnail in the list into view if it's not already visible
   *
   * @param {int} index - the index of the image to scroll to
   */
  scrollThumbIntoView(index: any) {
    const thumb = this.thumbs[index];
    const rect = thumb.getBoundingClientRect();
    const listTop = this.thumbsList.offsetTop;
    const listHeight = this.thumbsList.offsetHeight;

    // if thumb top is more than the thumblist top
    // and thumb bottom is less than thumblist height + listtop
    // we can assume the thumb is in view already
    if (
      (rect.top >= listTop && rect.bottom <= listTop + listHeight) ||
      this.isAnimatingThumb
    ) {
      return;
    }

    // Use same animation settings as smooth scroller
    const { easing, elasticity, duration } = this.smoothScroller.animeOptions;

    anime({
      targets: this.thumbsList,
      scrollTop: thumb.offsetTop - this.thumbsList.scrollTop,
      easing,
      duration,
      elasticity,
      begin: () => {
        this.isAnimatingThumb = true;
      },
      complete: () => {
        this.isAnimatingThumb = false;
      }
    });
  }

  /**
   * sets the active display of the thumbnail and updates count
   *
   * @param {int} index - index of the image to set active
   */
  setActive(index: any) {
    const { id } = this.items[index];
    const link = $(`a[href="#${id}"]`, this.thumbsList);

    this.thumbs.forEach((el: any) => {
      removeClass(el.closest('li'), 'active');
    });

    addClass(link.closest('li'), 'active');

    this.scrollThumbIntoView(index);

    this.index = index;

    this.updateCount(index);
  }

  /**
   * handle left/right arrow key presses
   *
   * @param {Object} event - keyup event
   */
  handleKeyUp = (event: any) => {
    const { keyCode } = event;

    if (keyCode === RIGHT_ARROW_KEY) {
      this.next();
    } else if (keyCode === LEFT_ARROW_KEY) {
      this.prev();
    }
  };

  next = () => {
    this.scrollToImage(this.index + 1);
  };

  prev = () => {
    this.scrollToImage(this.index - 1);
  };

  /**
   * Animates to the view to the chosen image.
   *
   * @param {int} index - index of the image to scroll to
   */
  scrollToImage(index: any) {
    // skip if animating, trying to go back from first item, or already at end of list
    if (this.isAnimating || index === -1 || index === this.total) {
      return;
    }

    const target = this.items[index];

    // use thumbnail smooth scroller instance to scroll to image with same animation
    // it already changes animating flag and has offset from initializes
    this.smoothScroller.scrollTo(target);
  }
}

MicroModal.init({
  openTrigger: 'data-lightbox-open',
  closeTrigger: 'data-lightbox-close',
  onShow: (modal: any) => {
    if (modal.hasAttribute('data-lightbox')) {
      // add lightbox instead to the modal instance so we can destroy it on close
      modal.lightbox = new Lightbox(modal);
    }
  },
  onClose: (modal: any) => {
    if (modal.lightbox) {
      modal.lightbox.destroy();
    }
  },
  disableScroll: true
});
