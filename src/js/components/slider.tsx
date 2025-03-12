import { h, Component } from 'preact';

import { LEFT_ARROW_KEY, RIGHT_ARROW_KEY } from '../constants';

interface SliderProps {
  id: string;
  min: number;
  max: number;
  value: number;
  label: string;
  onLeftKeyDown?: () => void;
  onRightKeyDown?: () => void;
  onTrackClick?: (percentage: number) => void;
}

class Slider extends Component<SliderProps> {
  track?: HTMLElement;

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.keyCode === RIGHT_ARROW_KEY) {
      this.handleRightArrowDown();
    } else if (event.keyCode === LEFT_ARROW_KEY) {
      this.handleLeftArrowDown();
    }
  };

  handleRightArrowDown = () => {
    const { onRightKeyDown } = this.props;
    if (onRightKeyDown) {
      onRightKeyDown();
    }
  };

  handleLeftArrowDown = () => {
    const { onLeftKeyDown } = this.props;
    if (onLeftKeyDown) {
      onLeftKeyDown();
    }
  };

  handleTrackClick = (event: MouseEvent) => {
    const { onTrackClick } = this.props;

    let sliderWidth = 0;
    let clickLocation = 0;

    if (this.track) {
      sliderWidth = this.track.offsetWidth;
      clickLocation = event.pageX - this.track.getBoundingClientRect().left;
    }

    const percentage = clickLocation / sliderWidth;

    if (onTrackClick) {
      onTrackClick(percentage);
    }
  };

  render({ min, max, value, id, label }: SliderProps) {
    const sliderLeft = (value / max) * 100;

    return (
      <div class="slider">
        <label htmlFor={id} id={`${id}-label`} class="slider__label">
          {label}
        </label>
        <div
          class="slider__track"
          ref={(c: any) => (this.track = c)}
          onClick={this.handleTrackClick}
        >
          <div
            id={id}
            class="slider__handle"
            role="slider"
            aria-labelledby={`${id}-label`}
            style={{
              width: sliderLeft + '%'
            }}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            tabIndex={0}
            onKeyDown={this.handleKeyDown}
          />
        </div>
      </div>
    );
  }
}

export default Slider;
