import { $, $$ } from './utils/dom';

class ColorToggler {
    triggerEl: HTMLElement[];
    targetEl: HTMLElement;
    triggerRect: DOMRect;
    targetRect: DOMRect;
    io: IntersectionObserver;

    constructor(elem: HTMLElement) {
        this.targetEl = elem;
        this.triggerEl = $$('[data-toggle-color-trigger]');

        this.targetRect = elem.getBoundingClientRect();

        this.handleIntersection = this.handleIntersection.bind(this);
        this.init();
    }

    init() {
        this.sectionInit();
    }

    isOverlapping(triggerRect: DOMRect) {
        return(!(this.targetRect.bottom < triggerRect.top || this.targetRect.top > triggerRect.bottom));
    }

    sectionInit() {
        this.io = new IntersectionObserver(this.handleIntersection, 
            {
                threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
            }
        );

        this.triggerEl.forEach((el) => this.io.observe(el));
    }

    handleIntersection(entries: any) {
        entries.forEach((entry: any) => {
            if(entry.isIntersecting) {
                if(this.isOverlapping(entry.target.getBoundingClientRect())) {
                    this.targetEl.classList.add('text-dark');
                } else {
                    this.targetEl.classList.remove('text-dark');
                }
            }
        });
    }
}

const header = $('[data-toggle-color-target]');

new ColorToggler(header);
