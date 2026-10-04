import type { JSX, ReactNode, RefObject } from 'react';
export interface ScrollFloatProps {
  children: ReactNode;
  as?: 'h2' | 'h3' | 'p' | 'div';
  scrollContainerRef?: RefObject<HTMLElement | null>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
}
export default function ScrollFloat(props: ScrollFloatProps): JSX.Element;
