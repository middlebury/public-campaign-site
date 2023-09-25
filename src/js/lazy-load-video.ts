import {$, $$} from './utils/dom';

class LazyLoadVideo {
    elem: HTMLVideoElement;
    videoButton: HTMLElement;

    constructor(el: HTMLVideoElement) {
        this.elem = el;
        this.videoButton = $('[data-video-trigger]');

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
            this.videoButton.classList.add('show-button');
            this.videoButton.setAttribute('aria-hidden', 'false');
            this.elem.play();
        }, 2000);
    }
}

const videoElems = $$('[data-campaign-video]');

videoElems.forEach(elem => new LazyLoadVideo(elem as HTMLVideoElement));