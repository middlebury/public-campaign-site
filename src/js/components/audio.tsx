import { h, Component, Fragment } from 'preact';

import { on } from '../utils/dom';
import Slider from './slider';
// import Icon from './icon';

function formatTime(seconds: number): string {
  let minutes = Math.floor(seconds / 60);
  // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'number'.
  minutes = minutes >= 10 ? minutes : String(minutes);
  seconds = Math.floor(seconds % 60);
  // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'number'.
  seconds = seconds >= 10 ? seconds : '0' + seconds;
  return minutes + ':' + seconds;
}

type AudioPlayerState = {
  playing: boolean;
  duration: number;
  currentTime: number;
  muted: boolean;
};

interface AudioPlayerProps {
  id: string;
  audio: HTMLAudioElement;
  btnOnly?: boolean;
  playIcon?: string;
  outline?: boolean;
  size?: string;
}

class AudioPlayer extends Component<AudioPlayerProps, AudioPlayerState> {
  audio: HTMLAudioElement;

  constructor(props: AudioPlayerProps) {
    super(props);

    this.state = {
      playing: false,
      duration: props.audio.duration,
      currentTime: 0,
      muted: false
    };

    this.audio = props.audio;

    on(this.audio, 'loadedmetadata', this.handleMetaDataLoad);
    on(this.audio, 'timeupdate', this.handleUpdateTime);
    on(this.audio, 'ended', this.pause);
  }

  handleMetaDataLoad = (event: Event) => {
    const target = event.target as HTMLAudioElement;
    this.setState({
      duration: target.duration
    });
  };

  handleUpdateTime = (event: Event) => {
    const target = event.target as HTMLAudioElement;
    this.setState({
      currentTime: target.currentTime
    });
  };

  handleBtnClick = () => {
    if (this.state.playing) {
      this.pause();
    } else {
      this.play();
    }
  };

  play = () => {
    this.audio.play();
    this.setState({
      playing: true
    });
  };

  pause = () => {
    this.audio.pause();

    this.setState({
      playing: false
    });
  };

  mute = () => {
    if (this.audio.muted) {
      this.audio.muted = false;
      this.setState({
        muted: false
      });
    } else {
      this.audio.muted = true;
      this.setState({
        muted: true
      });
    }
  };

  handleTrackClick = (percent: number) => {
    const targetTime = this.audio.duration * percent;
    this.audio.currentTime = targetTime;
  };

  handleSliderLeft = () => {
    this.audio.currentTime -= 3;
  };

  handleSliderRight = () => {
    this.audio.currentTime += 3;
  };

  render(
    { id, btnOnly, outline, playIcon = 'play', size }: AudioPlayerProps,
    { duration, currentTime, muted, playing }: AudioPlayerState
  ) {
    const btnClasses = `button button--primary  ${size &&
      `button--${size}`} ${outline && 'button--outline'}`;

    const playBtn = (
      <button
        class={btnClasses}
        aria-label={playing ? 'Pause' : 'Listen'}
        aria-describedby="midd-audio-title-1"
        onClick={this.handleBtnClick}
      >
        <span class="audio__button-text mr-2">
          {playing ? 'Pause' : 'Listen'}
        </span>
        <svg class="icon ">
          <use xlinkHref={`#icon-${playing ? 'pause' : playIcon}`} />
        </svg>
      </button>
    );

    if (btnOnly) {
      return playBtn;
    }

    return (
      <div class="audio__player">
        <div class="audio__buttons">{playBtn}</div>
        <div class="audio__times">
          <span>{formatTime(currentTime)}</span> /{' '}
          <span>{formatTime(duration)}</span>
        </div>
        <Slider
          id={id}
          label="Current time"
          min={0}
          max={duration}
          value={currentTime}
          onLeftKeyDown={this.handleSliderLeft}
          onRightKeyDown={this.handleSliderRight}
          onTrackClick={this.handleTrackClick}
        />
        <div class="audio__mute">
          <button
            class="button px-3"
            onClick={this.mute}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            <svg className="icon" aria-hidden="true">
              <use xlinkHref={`#icon-volume-${muted ? 'mute' : 'up'}`} />
            </svg>
          </button>
        </div>
      </div>
    );
  }
}

export default AudioPlayer;
