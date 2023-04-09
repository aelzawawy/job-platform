import { animate, group, query, style, transition, trigger } from '@angular/animations';

export {
  trigger,
  transition,
  style,
  query,
  group,
  animateChild,
  animate,
  keyframes,
} from '@angular/animations';

export const fader = trigger('routeAnimations', [
  transition('*<=>*', [
   query(':enter', [
    style({
      // position: 'absolute',
      // left: 300,
      // with: '100%', 
      opacity: 0,
      // transform: 'translateY(100%)',
    }),
   ], {optional: true}),
   query(':enter', [
    animate('300ms ease-in', 
      style({
        opacity:1,
        // transform: 'scale(1) translateY(0)'
      })
    ),
   ], {optional: true})
  ])
]);

// Positioned

export const slider = trigger('routeAnimations', [
  // transition('* => isLeft', slideTo('left')),
  // transition('* => isRight', slideTo('right')),
  // transition('isRight => *', slideTo('left')),
  // transition('isHome => *', slideTo('left')),
  // transition('* => isHome', slideTo('right')),
  transition('isLogin => isSignup', slideTo('right')),
  transition('isSignup => isLogin', slideTo('left')),
]);

function slideTo(direction:any) {
  const optional = {optional: true};
  return[
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        [direction]: 0,
        width: '100%'
      })
    ], optional),
    query(':enter', [
      style({ [direction]: '100%'})
    ]),
    group([
      query(':leave', [
        animate('500ms cubic-bezier(0.075, 0.82, 0.165, 1)', style({ [direction]: '-100%', opacity: 0}))
      ], optional),
      query(':enter', [
        animate('500ms cubic-bezier(0.075, 0.82, 0.165, 1)', style({ [direction]: '0%'}))
      ])
    ])
  ];
};