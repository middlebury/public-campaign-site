import anime, { EasingOptions, AnimeAnimParams, AnimeInstance } from 'animejs';

import { $, $$, on, off } from './utils/dom';
import { PREFERS_REDUCED_MOTION } from './utils/prefers-reduced-motion';

/** This callback is called scrollTop which overrides the default scrollTop function. */
type ScrollTopCallback = (
  /** element to scroll to */
  elem: HTMLElement,
  /** current scroll position */
  scrollPosition: number
) => void;

/** callback can get the offset based on the target element. */
type OffsetCallback = (target: HTMLElement) => number;

type SmoothScrollOffset = number | OffsetCallback;

interface SmoothScrollOptions {
  /** the element to force scrolling upon, usually the window */
  container?: HTMLElement;

  /** an integer to offset the scroll by or a function which gets passeD the target element */
  offset?: SmoothScrollOffset;

  /** override the scroll top */
  scrollTop?: ScrollTopCallback;

  /**
   * Updates the hash in the url with the target
   *
   * Uses history.replaceState instead of pushState to prevent bloating
   * browser history and to not break current back button behavior since the
   * digest nav did not update the url hash begin.
   */
  replaceState?: boolean;

  /** function to call begin scrolling animation starts. */
  begin?: (anime: AnimeInstance) => void;

  /** function to call after scrolling animation is done */
  complete?: (anime: AnimeInstance) => void;

  /**
   * animation easing. Options based on animejs easing https://animejs.com/documentation/#linearEasing
   */
  easing?: EasingOptions;

  /** animation speed duration for animejs */
  duration?: number;

  /** animation elasticity for animejs */
  elasticity?: number;
}

const smoothScrollDefaults: SmoothScrollOptions = {
  offset: 0,
  easing: 'easeInCubic',
  duration: 300,
  elasticity: 500,
  replaceState: false
};

/**
 * Applies smooth scroll effect to a container of anchor (links with onpage targets) links.
 * @class SmoothScroll
 *
 * @example
 * ```html
 * <ul class="nav">
 *  <li><a href="#target-1">target 1</a></li>
 *  <li><a href="#target-2">target 2</a></li>
 * </ul>
 *
 * <div>
 *  <section id="target-1">target 1 content</section>
 *  <section id="target-2">target 2 content</section>
 * </div>
 * ```
 *
 * Javascript usage to initialize
 *
 * @example
 * ```js
 * const options = {};
 * const scroller = new SmoothScroll('.nav a', options)
 * ```
 */
class SmoothScroll {
  animeOptions: AnimeAnimParams;
  elems: NodeListOf<HTMLElement> | HTMLElement[];
  options: SmoothScrollOptions;
  scrollTop?: ScrollTopCallback;
  anime?: AnimeInstance;

  /**
   * @param els - selector or element which contain the anchor links
   * @param options - config options
   */
  constructor(
    els: string | HTMLElement[] | NodeListOf<HTMLElement>,
    options?: SmoothScrollOptions
  ) {
    const config = {
      ...smoothScrollDefaults,
      ...options
    };

    const { easing, duration, elasticity, begin, complete } = config;

    this.elems = typeof els === 'string' ? $$(els) : els;

    this.options = config;

    const reducedDuration = PREFERS_REDUCED_MOTION ? 0 : duration;

    this.animeOptions = {
      duration: reducedDuration,
      easing,
      elasticity,
      begin,
      complete
    };

    this.init();
  }

  /**
   * initialize the widget
   */
  init() {
    this.addListeners();
  }

  /**
   * Add needed event listeners
   */
  addListeners() {
    this.elems.forEach((el: any) => on(el, 'click', this.handleClick));
  }

  /**
   * Destroy the widget
   */
  destroy() {
    this.elems.forEach((el: any) => off(el, 'click', this.handleClick));
  }

  /**
   * Handle link clicks
   */
  handleClick = (event: Event) => {
    event.preventDefault();
    const anchor = event.currentTarget as HTMLAnchorElement;
    const selector = anchor.getAttribute('href');

    if (selector) {
      const targetEl = $(selector);
      if (targetEl) {
        this.scrollTo(targetEl, selector);
      }
    }
  };

  /**
   * Scroll to an element with animation
   * @param {Element} elem - element to scroll to
   * @param {string} selector - selector for the target element
   */
  scrollTo(elem: HTMLElement, selector: string) {
    const { offset = 0, scrollTop, container } = this.options;

    const elementOffset = elem.getBoundingClientRect().top;

    let scrollPosition = window.pageYOffset;

    /**
     * Must be set to both elements for animejs.
     * See https://github.com/juliangarnier/anime/issues/197#issuecomment-314265652
     */
    let targets: HTMLElement | HTMLElement[] = [
      document.documentElement,
      document.body
    ];

    const finalOffset = typeof offset === 'function' ? offset(elem) : offset;

    if (container) {
      targets = container;
      scrollPosition = container.scrollTop;
    }

    const finalScrollTop =
      typeof scrollTop === 'function'
        ? scrollTop(elem, scrollPosition)
        : elementOffset + scrollPosition - finalOffset;

    const { duration, easing, elasticity, begin, complete } = this.animeOptions;

    this.anime = anime({
      scrollTop: finalScrollTop,
      targets,
      duration,
      easing,
      elasticity,
      begin,
      complete
    });

    if (this.options.replaceState) {
      window.history.replaceState(
        null,
        '',
        document.location.pathname + selector
      );
    }
  }
}

export default SmoothScroll;
