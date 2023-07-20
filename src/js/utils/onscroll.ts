/**
 * Optimized onscroll event listener using requestAnimationFrame.
 *
 * Source: https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event#Scroll_event_throttling
 */

/**
 * update function to run on available frame
 */
type OnScollCallback = (lastScroll: number, time: number) => void;

/**
 * container to add scroll listener to
 */
type OnScrollContainer = Window | HTMLElement;

export default function onscroll(
  cb: OnScollCallback,
  elem: OnScrollContainer = window
) {
  let lastScrollY = 0;
  let ticking = false;

  const update: FrameRequestCallback = (time: number) => {
    cb(lastScrollY, time);
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  const handleScroll = (event: any) => {
    lastScrollY = event.target.scrollTop || window.pageYOffset;
    requestTick();
  };

  elem.addEventListener('scroll', handleScroll);

  return {
    destroy() {
      elem.removeEventListener('scroll', handleScroll);
    }
  };
}
