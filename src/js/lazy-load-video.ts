import {$, $$} from './utils/dom';

class LazyLoadVideo {
    elem: HTMLVideoElement;

    constructor(el: HTMLVideoElement) {
        this.elem = el;

        this.init();
    }

    init() {
        this.loadVideo();
    }

    loadVideo() {
        let source = $('source', this.elem);
        source.src = source.dataset.src;
        this.elem.load();

        setTimeout(() => {
            this.elem.play();
        }, 2000);
    }
}

const videoElems = $$('[data-campaign-video]');

videoElems.forEach(elem => new LazyLoadVideo(elem as HTMLVideoElement));