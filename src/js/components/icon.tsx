import { h, FunctionComponent } from 'preact';

interface IconProps {
  icon: string;
  className?: string;
}

const Icon: FunctionComponent<IconProps> = ({ icon, className, ...rest }) => (
  <svg className={`icon ${className}`} {...rest}>
    <use xlinkHref={`#icon-${icon}`} />
  </svg>
);

export default Icon;
