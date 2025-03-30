import {
  animate,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

export {
  animate,
  animateChild,
  keyframes,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const fader = trigger('routeAnimations', [
  transition('*<=>*', [
    query(
      ':enter',
      [
        style({
          opacity: 0,
        }),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        animate(
          '300ms ease-in-out',
          style({
            opacity: 1,
          })
        ),
      ],
      { optional: true }
    ),
  ]),
]);
