import {
  animate,
  createTimeline,
  createScope,
  stagger,
  spring,
} from "animejs";
import { useEffect, useRef, useCallback } from "react";

export { animate, createTimeline, createScope, stagger, spring };

export function useAnimeScope() {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    return () => {
      scope.current?.revert();
    };
  }, []);

  const initScope = useCallback(
    (fn: (self: NonNullable<ReturnType<typeof createScope>>) => void) => {
      if (!root.current) return;
      const s = createScope({ root: root.current });
      s.add((self) => {
        fn(self as NonNullable<ReturnType<typeof createScope>>);
      });
      scope.current = s;
    },
    []
  );

  return { root, scope, initScope };
}

export function fadeInUp(
  selector: string,
  delay = 0,
  duration = 500,
  ease = "outExpo"
) {
  return animate(selector, {
    opacity: [0, 1],
    translateY: [20, 0],
    delay,
    duration,
    ease,
  });
}

export function fadeIn(
  selector: string,
  delay = 0,
  duration = 400,
  ease = "outExpo"
) {
  return animate(selector, {
    opacity: [0, 1],
    delay,
    duration,
    ease,
  });
}

export function fadeInLeft(
  selector: string,
  delay = 0,
  duration = 500,
  ease = "outExpo"
) {
  return animate(selector, {
    opacity: [0, 1],
    translateX: [-20, 0],
    delay,
    duration,
    ease,
  });
}

export function scaleIn(
  selector: string,
  delay = 0,
  duration = 500,
  ease = "outExpo"
) {
  return animate(selector, {
    opacity: [0, 1],
    scale: [0.9, 1],
    delay,
    duration,
    ease,
  });
}

export function staggerFadeInUp(
  selector: string,
  baseDelay = 0,
  staggerTime = 50,
  duration = 500
) {
  return animate(selector, {
    opacity: [0, 1],
    translateY: [20, 0],
    delay: stagger(staggerTime, { start: baseDelay }),
    duration,
    ease: "outExpo",
  });
}

export function gachaReveal(selector: string, tier: string) {
  const tl = createTimeline();

  tl.add(selector, {
    scale: [
      { to: 0, duration: 0 },
      { to: 1.3, duration: 300, ease: "outBack" },
      { to: 1, duration: 200, ease: "outQuad" },
    ],
    opacity: [
      { to: 0, duration: 0 },
      { to: 1, duration: 200 },
    ],
    rotate: tier === "legendary" ? [0, 10, -5, 0] : [0],
    filter:
      tier === "legendary"
        ? [
            { to: "brightness(1)", duration: 0 },
            { to: "brightness(2.5)", duration: 200 },
            { to: "brightness(1)", duration: 400 },
          ]
        : [],
  });

  if (tier === "epic") {
    tl.add(
      selector,
      {
        filter: [
          { to: "brightness(1)", duration: 0 },
          { to: "brightness(1.8)", duration: 200 },
          { to: "brightness(1)", duration: 300 },
        ],
      },
      0
    );
  }

  if (tier === "legendary" || tier === "mythic") {
    tl.add(
      selector,
      {
        rotate: [0, 360],
        duration: 2000,
        loop: true,
        ease: "linear",
      },
      0
    );
  }

  return tl;
}

export function pulseGlow(selector: string, color = "#00e5ff") {
  return animate(selector, {
    boxShadow: [
      `0 0 5px ${color}33`,
      `0 0 20px ${color}80, 0 0 40px ${color}33`,
      `0 0 5px ${color}33`,
    ],
    duration: 2000,
    loop: true,
    ease: "inOutSine",
  });
}

export function floatAnimation(selector: string) {
  return animate(selector, {
    translateY: [0, -8, 0],
    duration: 3000,
    loop: true,
    ease: "inOutSine",
  });
}

export function cardHoverEffect(el: HTMLElement, enter: boolean) {
  if (enter) {
    animate(el, {
      translateY: -3,
      scale: 1.02,
      duration: 300,
      ease: "outQuad",
    });
  } else {
    animate(el, {
      translateY: 0,
      scale: 1,
      duration: 300,
      ease: "outQuad",
    });
  }
}

export function spinLoader(selector: string) {
  return animate(selector, {
    rotate: 360,
    duration: 1000,
    loop: true,
    ease: "linear",
  });
}

export function progressFill(selector: string, widthPercent: number) {
  return animate(selector, {
    width: `${widthPercent}%`,
    duration: 1200,
    ease: "outExpo",
  });
}
