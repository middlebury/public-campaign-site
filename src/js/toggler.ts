import { $, $$ } from './utils/dom';

const SPACE_BAR = 32;

/**
 * Multi-purpose toggler utility that adds has-toggler class when js is active
 * and is-toggled when the data-toggle-target element is clicked.
 *
 * Also supports data-toggle-group="<unique-name>" for toggling all elements of that group at the same time
 * or data-toggle-linked="<unique-name>" so you can have multiple triggers for the same element.
 *
 * Can also have `data-toggle-focus="<selector>" for an element to focus after toggling on.
 * Used for focusing an input field after opening a dropdown e.g. header search.
 *
 * Supports spacebar and enter key presses on the data-toggle-target element for a11y and
 * toggles aria-expanded=true|false attribute appropriately.
 *
 */
class Toggler {
  /** Element which will be clicked/enter key/space key press to triggle a toggle */
  elem: HTMLElement;

  /**
   * Class to add when the toggler is enabled on the elements.
   * For closing things with css by default until they are toggled, which turns on the active class.
   */
  enabledClass: string;

  /** class to add when toggle has happened */
  activeClass: string;

  /**
   * Selector for element to focus after toggle has happened.
   * Example: Used in focusing input of a search dropdown
   */
  focusTargetSelector: string | null;

  /** element to focus  */
  focusTarget?: HTMLElement | null;

  /** selector for group items */
  group: string | null;

  /** selector for linked items items */
  linked: string | null;

  /** target element to toggle */
  target: HTMLElement;

  groupParent: HTMLElement;

  constructor(elem: HTMLElement) {
    // this.isToggled = false;
    this.elem = elem;
    this.target = this.getTarget(this.elem);

    this.activeClass = 'is-toggled';
    this.enabledClass = 'has-toggler';

    const linked = elem.getAttribute('data-toggle-linked');
    this.linked = linked ? `[data-toggle-linked="${linked}"]` : null;

    const group = elem.getAttribute('data-toggle-group');
    this.group = group ? `[data-toggle-group="${group}"]` : null;

    const parent = elem.getAttribute('data-toggle-group-parent');
    this.groupParent = group ? $(`.${group}`) : null;

    this.handleElemClick = this.handleElemClick.bind(this);

    this.focusTargetSelector = elem.getAttribute('data-toggle-focus');

    if (this.focusTargetSelector) {
      this.focusTarget = $(this.focusTargetSelector);
    }

    this.init();
  }

  init() {
    if (!this.target) {
      return;
    }

    this.addListeners();
    this.elem.classList.add(this.enabledClass);
    this.target.classList.add(this.enabledClass);
    this.groupParent?.classList.add(this.enabledClass);
  }

  // destroy method is not currently called in our apps but could be if you want to disable a toggler
  destroy() {
    this.elem.classList.remove(this.enabledClass);
    this.elem.classList.remove(this.activeClass);
    this.target.classList.remove(this.enabledClass);
    this.target.classList.remove(this.activeClass);
    this.groupParent?.classList.remove(this.enabledClass);
    this.groupParent?.classList.remove(this.activeClass);
    this.elem.removeEventListener('click', this.handleElemClick);
    this.elem.removeEventListener('keydown', this.handleElemKeyDown);
  }

  addListeners() {
    this.elem.addEventListener('click', this.handleElemClick);
    this.elem.addEventListener('keydown', this.handleElemKeyDown);
  }

  handleElemKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === SPACE_BAR) {
      e.preventDefault();
      this.toggle();
    }
  };

  // use query selector each time we need the target otherwise its classes are cached
  // if we stored it in the constructor
  getTarget(elem: HTMLElement) {
    const target = elem.getAttribute('data-toggle-target');
    if (target) {
      return $(target);
    }
  }

  handleElemClick(e: Event) {
    e.preventDefault();
    this.toggle();
  }

  // close all toggle targets in the same group
  closeGroup() {
    if (!this.group) return;

    const items = $$(this.group);
    if (items) {
      items.forEach((elem) => {
        const target = this.getTarget(elem);
        this.close(elem, target);
      });
    }
  }

  // find all linked triggers and toggle their target
  toggleLinked() {
    if (!this.linked) return;

    const items = $$(this.linked);

    if (items) {
      items.forEach((elem) => {
        const target = this.getTarget(elem);
        if (this.isToggled(target)) {
          return this.close(elem, target);
        }

        this.open(elem, target);
      });
    }
  }

  open(elem: HTMLElement, target: HTMLElement) {
    if (this.groupParent) {
      this.groupParent.classList.add(this.activeClass);
    }

    if (target) {
      target.classList.add(this.activeClass);
    }

    if (elem) {
      elem.classList.add(this.activeClass);
      this.setAriaExpanded(elem, true);
      if (this.focusTarget) {
        // TODO: watch for transition end instead
        setTimeout(() => {
          const input = this.focusTarget?.querySelector('input');
          input?.focus();
        }, 100);
      }
    }
  }

  setAriaExpanded(elem: HTMLElement, state: boolean) {
    if (elem.hasAttribute('aria-expanded')) {
      elem.setAttribute('aria-expanded', String(state));
    }
  }

  close(elem: HTMLElement, target: HTMLElement) {
    if (this.groupParent) {
      this.groupParent.classList.remove(this.activeClass);
    }

    if (target) {
      target.classList.remove(this.activeClass);
    }

    if (elem) {
      elem.classList.remove(this.activeClass);
      this.setAriaExpanded(elem, false);
    }
  }

  // if the element has the active toggle class we can assume it's active
  isToggled(elem: HTMLElement) {
    return elem.classList.contains(this.activeClass);
  }

  toggle() {
    if (!this.isToggled(this.target)) {
      if (this.group) {
        this.closeGroup();
      }

      if (this.linked) {
        this.toggleLinked();
      }

      return this.open(this.elem, this.target);
    }

    this.close(this.elem, this.target);
  }
}

const togglers = $$('[data-toggle-target]');

togglers.forEach((elem) => new Toggler(elem));

export default Toggler;
