import { $, $$ } from './utils/dom';

class ColorToggler {
    triggerEl: HTMLElement[];
    targetEl: HTMLElement;
    triggerRect: DOMRect;
    targetRect: DOMRect;
    io: IntersectionObserver;
    thresholdSet: number[];

    constructor(elem: HTMLElement) {
        this.targetEl = elem;
        this.triggerEl = $$('[data-toggle-color-trigger]');
        this.thresholdSet = [];

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
        for (let i = 0; i <= 1.0; i += 0.01) {
            this.thresholdSet.push(i);
        }
        
        this.io = new IntersectionObserver(this.handleIntersection, 
            {
                threshold: this.thresholdSet
            }
        );

        this.triggerEl.forEach((el) => this.io.observe(el));
    }

    handleIntersection(entries: any) {
        entries.forEach((entry: any) => {
            if(this.isOverlapping(entry.target.getBoundingClientRect())) {
                this.targetEl.classList.add('text-dark');
            } else {
                this.targetEl.classList.remove('text-dark');
            }
        });
    }
}

const header = $('[data-toggle-color-target]');

new ColorToggler(header);
