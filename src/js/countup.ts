import anime from 'animejs';

import { $$ } from './utils/dom';
import { onElementInView } from './utils/on-element-in-view';
import { PREFERS_REDUCED_MOTION } from './utils/prefers-reduced-motion';

const isFloat = (n: number): boolean => Number(n) === n && n % 1 !== 0;

function countup(el: HTMLElement, target: number): void {
  const data = { count: 0 };

  const round = !isFloat(target);

  const duration = PREFERS_REDUCED_MOTION ? 0 : 2000;

  anime({
    targets: data,
    count: [0, target],
    duration,
    round,
    delay: 200,
    easing: 'easeOutSine',
    update() {
      el.innerText = data.count.toLocaleString(undefined, {
        maximumFractionDigits: 2
      });
    }
  });
}

function makeCountup(el: HTMLElement) {
  const text = el.textContent ?? '';
  const target = parseFloat(text);

  onElementInView(el, () => {
    countup(el, target);
  });
}

const els = $$('[data-countup]');

els.forEach(makeCountup);
