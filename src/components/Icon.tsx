import { UserIcon } from '@phosphor-icons/react/dist/csr/User';
import { ChatCircleDotsIcon } from '@phosphor-icons/react/dist/csr/ChatCircleDots';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/csr/EnvelopeSimple';
import { XLogoIcon } from '@phosphor-icons/react/dist/csr/XLogo';
import { LinkedinLogoIcon } from '@phosphor-icons/react/dist/csr/LinkedinLogo';
import { InfoIcon } from '@phosphor-icons/react/dist/csr/Info';
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { CornersInIcon } from '@phosphor-icons/react/dist/csr/CornersIn';
import { AirplaneTiltIcon } from '@phosphor-icons/react/dist/csr/AirplaneTilt';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/csr/SpinnerGap';
import { MouseScrollIcon } from '@phosphor-icons/react/dist/csr/MouseScroll';
import type { IconProps } from '@phosphor-icons/react';

const icons = {
  person: UserIcon, chat: ChatCircleDotsIcon, back: CaretLeftIcon, mail: EnvelopeSimpleIcon,
  x: XLogoIcon, linkedin: LinkedinLogoIcon, info: InfoIcon, external: ArrowUpRightIcon,
  collapse: CornersInIcon, plane: AirplaneTiltIcon, check: CheckIcon, spinner: SpinnerGapIcon,
  scroll: MouseScrollIcon,
};

export function Icon({ name, ...props }: IconProps & { name: keyof typeof icons }) {
  const Component = icons[name];
  return <Component size={16} weight="regular" aria-hidden="true" {...props}/>;
}
