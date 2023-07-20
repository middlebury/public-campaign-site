/**
 * Collection of jquery-like DOM utility functions for short-hand vanillajs manipulations
 * @file
 */

export const $ = (
  selector: string,
  elem: HTMLElement | Document = document
): any => elem.querySelector(selector);

export const $$ = (
  selector: string,
  elem: HTMLElement | Document = document
) => {
  return Array.from(elem.querySelectorAll(selector)) as HTMLElement[];
};

export const hide = (elem: HTMLElement) => {
  elem.style.display = 'none';
};

export const show = (elem: HTMLElement, display = 'block') => {
  elem.style.display = display;
};

export const on = (
  elem: HTMLElement | Document | Window,
  eventType: string,
  cb: (...args: any[]) => void
) => elem.addEventListener(eventType, cb);

export const off = (
  elem: HTMLElement | Document | Window,
  eventType: string,
  cb: (...args: any[]) => void
) => elem.removeEventListener(eventType, cb);

export const addClass = (elem: HTMLElement, className: any) =>
  elem.classList.add(className);

export const removeClass = (elem: HTMLElement, className: any) =>
  elem.classList.remove(className);

export const toggleClass = (elem: HTMLElement, className: any) =>
  elem.classList.toggle(className);

export const hasClass = (elem: HTMLElement, className: any) =>
  elem.classList.contains(className);

// https://stackoverflow.com/questions/16149431/make-function-wait-until-element-exists/53269990#53269990
export const checkElement = async (selector: string) => {
  while ($(selector) === null) {
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
  }
  return selector;
};
