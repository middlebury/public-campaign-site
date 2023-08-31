import { h, render } from 'preact';

import { $$ } from './utils/dom';

import AudioPlayer from './components/audio';

const audioWrappers = $$('.js-audio');

audioWrappers.forEach((wrapper: HTMLElement, index: number) => {
  const root = document.createElement('div');

  const audioElem = wrapper.querySelector('audio') as HTMLAudioElement;

  const { btnOnly, size, outline, playIcon } = wrapper.dataset;

  const props = {
    id: `audio-player-${index}`,
    btnOnly: btnOnly !== undefined,
    outline: outline !== undefined,
    audio: audioElem,
    playIcon,
    size
  };

  render(<AudioPlayer {...props} />, root);

  wrapper.style.display = 'none';

  wrapper.parentNode?.insertBefore(root, wrapper.nextSibling);
});
