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
  transition('* => isLeft', slideTo('left')),
  transition('* => isRight', slideTo('right')),
  transition('isRight => *', slideTo('left')),
  transition('isLeft => *', slideTo('right')),
]);

function slideTo(direction:any) {
  const optional = {optional: true};
  return[
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 60,
        [direction]: 0,
        width: '98.5%'
      })
    ], optional),
    query(':enter', [
      style({ [direction]: '-100%'})
    ]),
    group([
      query(':leave', [
        animate('600ms ease-in-out', style({ [direction]: '100%', opacity: 0}))
      ], optional),
      query(':enter', [
        animate('600ms ease-in-out', style({ [direction]: '0%'}))
      ])
    ])
  ];
};