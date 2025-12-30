import { R as React, r as reactExports, j as jsxRuntimeExports, g as useParams, l as useSearchParams, u as useAppStore, a as useQuery, L as Link, X, b as axios } from "./index-BU6_V1I5.js";
import { T as Trigger, C as Close, a as Title, R as Root$1, P as Portal$1, b as Content$1, O as Overlay$1, D as Description } from "./index-BDJowwEI.js";
import { c as cn } from "./utils-DL4harQt.js";
import "./index-CrEQEmTZ.js";
import "./index-DB8nLaPh.js";
import "./index-dBPyfT2m.js";
function __insertCSS(code) {
  if (typeof document == "undefined") return;
  let head = document.head || document.getElementsByTagName("head")[0];
  let style = document.createElement("style");
  style.type = "text/css";
  head.appendChild(style);
  style.styleSheet ? style.styleSheet.cssText = code : style.appendChild(document.createTextNode(code));
}
const DrawerContext = React.createContext({
  drawerRef: {
    current: null
  },
  overlayRef: {
    current: null
  },
  onPress: () => {
  },
  onRelease: () => {
  },
  onDrag: () => {
  },
  onNestedDrag: () => {
  },
  onNestedOpenChange: () => {
  },
  onNestedRelease: () => {
  },
  openProp: void 0,
  dismissible: false,
  isOpen: false,
  isDragging: false,
  keyboardIsOpen: {
    current: false
  },
  snapPointsOffset: null,
  snapPoints: null,
  handleOnly: false,
  modal: false,
  shouldFade: false,
  activeSnapPoint: null,
  onOpenChange: () => {
  },
  setActiveSnapPoint: () => {
  },
  closeDrawer: () => {
  },
  direction: "bottom",
  shouldScaleBackground: false,
  setBackgroundColorOnScale: true,
  noBodyStyles: false,
  container: null,
  autoFocus: false
});
const useDrawerContext = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawerContext must be used within a Drawer.Root");
  }
  return context;
};
__insertCSS("[data-vaul-drawer]{touch-action:none;will-change:transform;transition:transform .5s cubic-bezier(.32, .72, 0, 1);animation-duration:.5s;animation-timing-function:cubic-bezier(0.32,0.72,0,1)}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=bottom][data-state=open]{animation-name:slideFromBottom}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=bottom][data-state=closed]{animation-name:slideToBottom}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=top][data-state=open]{animation-name:slideFromTop}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=top][data-state=closed]{animation-name:slideToTop}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=left][data-state=open]{animation-name:slideFromLeft}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=left][data-state=closed]{animation-name:slideToLeft}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=right][data-state=open]{animation-name:slideFromRight}[data-vaul-drawer][data-vaul-snap-points=false][data-vaul-drawer-direction=right][data-state=closed]{animation-name:slideToRight}[data-vaul-drawer][data-vaul-snap-points=true][data-vaul-drawer-direction=bottom]{transform:translate3d(0,100%,0)}[data-vaul-drawer][data-vaul-snap-points=true][data-vaul-drawer-direction=top]{transform:translate3d(0,-100%,0)}[data-vaul-drawer][data-vaul-snap-points=true][data-vaul-drawer-direction=left]{transform:translate3d(-100%,0,0)}[data-vaul-drawer][data-vaul-snap-points=true][data-vaul-drawer-direction=right]{transform:translate3d(100%,0,0)}[data-vaul-drawer][data-vaul-delayed-snap-points=true][data-vaul-drawer-direction=top]{transform:translate3d(0,var(--snap-point-height,0),0)}[data-vaul-drawer][data-vaul-delayed-snap-points=true][data-vaul-drawer-direction=bottom]{transform:translate3d(0,var(--snap-point-height,0),0)}[data-vaul-drawer][data-vaul-delayed-snap-points=true][data-vaul-drawer-direction=left]{transform:translate3d(var(--snap-point-height,0),0,0)}[data-vaul-drawer][data-vaul-delayed-snap-points=true][data-vaul-drawer-direction=right]{transform:translate3d(var(--snap-point-height,0),0,0)}[data-vaul-overlay][data-vaul-snap-points=false]{animation-duration:.5s;animation-timing-function:cubic-bezier(0.32,0.72,0,1)}[data-vaul-overlay][data-vaul-snap-points=false][data-state=open]{animation-name:fadeIn}[data-vaul-overlay][data-state=closed]{animation-name:fadeOut}[data-vaul-overlay][data-vaul-snap-points=true]{opacity:0;transition:opacity .5s cubic-bezier(.32, .72, 0, 1)}[data-vaul-overlay][data-vaul-snap-points=true]{opacity:1}[data-vaul-drawer]:not([data-vaul-custom-container=true])::after{content:'';position:absolute;background:inherit;background-color:inherit}[data-vaul-drawer][data-vaul-drawer-direction=top]::after{top:initial;bottom:100%;left:0;right:0;height:200%}[data-vaul-drawer][data-vaul-drawer-direction=bottom]::after{top:100%;bottom:initial;left:0;right:0;height:200%}[data-vaul-drawer][data-vaul-drawer-direction=left]::after{left:initial;right:100%;top:0;bottom:0;width:200%}[data-vaul-drawer][data-vaul-drawer-direction=right]::after{left:100%;right:initial;top:0;bottom:0;width:200%}[data-vaul-overlay][data-vaul-snap-points=true]:not([data-vaul-snap-points-overlay=true]):not(\n[data-state=closed]\n){opacity:0}[data-vaul-overlay][data-vaul-snap-points-overlay=true]{opacity:1}[data-vaul-handle]{display:block;position:relative;opacity:.7;background:#e2e2e4;margin-left:auto;margin-right:auto;height:5px;width:32px;border-radius:1rem;touch-action:pan-y}[data-vaul-handle]:active,[data-vaul-handle]:hover{opacity:1}[data-vaul-handle-hitarea]{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max(100%,2.75rem);height:max(100%,2.75rem);touch-action:inherit}@media (hover:hover) and (pointer:fine){[data-vaul-drawer]{user-select:none}}@media (pointer:fine){[data-vaul-handle-hitarea]:{width:100%;height:100%}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeOut{to{opacity:0}}@keyframes slideFromBottom{from{transform:translate3d(0,100%,0)}to{transform:translate3d(0,0,0)}}@keyframes slideToBottom{to{transform:translate3d(0,100%,0)}}@keyframes slideFromTop{from{transform:translate3d(0,-100%,0)}to{transform:translate3d(0,0,0)}}@keyframes slideToTop{to{transform:translate3d(0,-100%,0)}}@keyframes slideFromLeft{from{transform:translate3d(-100%,0,0)}to{transform:translate3d(0,0,0)}}@keyframes slideToLeft{to{transform:translate3d(-100%,0,0)}}@keyframes slideFromRight{from{transform:translate3d(100%,0,0)}to{transform:translate3d(0,0,0)}}@keyframes slideToRight{to{transform:translate3d(100%,0,0)}}");
const KEYBOARD_BUFFER = 24;
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? reactExports.useLayoutEffect : reactExports.useEffect;
function chain$1(...callbacks) {
  return (...args) => {
    for (let callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function isMac() {
  return testPlatform(/^Mac/);
}
function isIPhone() {
  return testPlatform(/^iPhone/);
}
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
function isIPad() {
  return testPlatform(/^iPad/) || // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
  isMac() && navigator.maxTouchPoints > 1;
}
function isIOS() {
  return isIPhone() || isIPad();
}
function testPlatform(re) {
  return typeof window !== "undefined" && window.navigator != null ? re.test(window.navigator.platform) : void 0;
}
const visualViewport = typeof document !== "undefined" && window.visualViewport;
function isScrollable(node) {
  let style = window.getComputedStyle(node);
  return /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY);
}
function getScrollParent(node) {
  if (isScrollable(node)) {
    node = node.parentElement;
  }
  while (node && !isScrollable(node)) {
    node = node.parentElement;
  }
  return node || document.scrollingElement || document.documentElement;
}
const nonTextInputTypes = /* @__PURE__ */ new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset"
]);
let preventScrollCount = 0;
let restore;
function usePreventScroll(options = {}) {
  let { isDisabled } = options;
  useIsomorphicLayoutEffect(() => {
    if (isDisabled) {
      return;
    }
    preventScrollCount++;
    if (preventScrollCount === 1) {
      if (isIOS()) {
        restore = preventScrollMobileSafari();
      }
    }
    return () => {
      preventScrollCount--;
      if (preventScrollCount === 0) {
        restore == null ? void 0 : restore();
      }
    };
  }, [
    isDisabled
  ]);
}
function preventScrollMobileSafari() {
  let scrollable;
  let lastY = 0;
  let onTouchStart = (e) => {
    scrollable = getScrollParent(e.target);
    if (scrollable === document.documentElement && scrollable === document.body) {
      return;
    }
    lastY = e.changedTouches[0].pageY;
  };
  let onTouchMove = (e) => {
    if (!scrollable || scrollable === document.documentElement || scrollable === document.body) {
      e.preventDefault();
      return;
    }
    let y = e.changedTouches[0].pageY;
    let scrollTop = scrollable.scrollTop;
    let bottom = scrollable.scrollHeight - scrollable.clientHeight;
    if (bottom === 0) {
      return;
    }
    if (scrollTop <= 0 && y > lastY || scrollTop >= bottom && y < lastY) {
      e.preventDefault();
    }
    lastY = y;
  };
  let onTouchEnd = (e) => {
    let target = e.target;
    if (isInput(target) && target !== document.activeElement) {
      e.preventDefault();
      target.style.transform = "translateY(-2000px)";
      target.focus();
      requestAnimationFrame(() => {
        target.style.transform = "";
      });
    }
  };
  let onFocus = (e) => {
    let target = e.target;
    if (isInput(target)) {
      target.style.transform = "translateY(-2000px)";
      requestAnimationFrame(() => {
        target.style.transform = "";
        if (visualViewport) {
          if (visualViewport.height < window.innerHeight) {
            requestAnimationFrame(() => {
              scrollIntoView(target);
            });
          } else {
            visualViewport.addEventListener("resize", () => scrollIntoView(target), {
              once: true
            });
          }
        }
      });
    }
  };
  let onWindowScroll = () => {
    window.scrollTo(0, 0);
  };
  let scrollX = window.pageXOffset;
  let scrollY = window.pageYOffset;
  let restoreStyles = chain$1(setStyle(document.documentElement, "paddingRight", `${window.innerWidth - document.documentElement.clientWidth}px`));
  window.scrollTo(0, 0);
  let removeEvents = chain$1(addEvent(document, "touchstart", onTouchStart, {
    passive: false,
    capture: true
  }), addEvent(document, "touchmove", onTouchMove, {
    passive: false,
    capture: true
  }), addEvent(document, "touchend", onTouchEnd, {
    passive: false,
    capture: true
  }), addEvent(document, "focus", onFocus, true), addEvent(window, "scroll", onWindowScroll));
  return () => {
    restoreStyles();
    removeEvents();
    window.scrollTo(scrollX, scrollY);
  };
}
function setStyle(element, style, value) {
  let cur = element.style[style];
  element.style[style] = value;
  return () => {
    element.style[style] = cur;
  };
}
function addEvent(target, event, handler, options) {
  target.addEventListener(event, handler, options);
  return () => {
    target.removeEventListener(event, handler, options);
  };
}
function scrollIntoView(target) {
  let root = document.scrollingElement || document.documentElement;
  while (target && target !== root) {
    let scrollable = getScrollParent(target);
    if (scrollable !== document.documentElement && scrollable !== document.body && scrollable !== target) {
      let scrollableTop = scrollable.getBoundingClientRect().top;
      let targetTop = target.getBoundingClientRect().top;
      let targetBottom = target.getBoundingClientRect().bottom;
      const keyboardHeight = scrollable.getBoundingClientRect().bottom + KEYBOARD_BUFFER;
      if (targetBottom > keyboardHeight) {
        scrollable.scrollTop += targetTop - scrollableTop;
      }
    }
    target = scrollable.parentElement;
  }
}
function isInput(target) {
  return target instanceof HTMLInputElement && !nonTextInputTypes.has(target.type) || target instanceof HTMLTextAreaElement || target instanceof HTMLElement && target.isContentEditable;
}
function setRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => refs.forEach((ref) => setRef(ref, node));
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
const cache = /* @__PURE__ */ new WeakMap();
function set(el, styles, ignoreCache = false) {
  if (!el || !(el instanceof HTMLElement)) return;
  let originalStyles = {};
  Object.entries(styles).forEach(([key, value]) => {
    if (key.startsWith("--")) {
      el.style.setProperty(key, value);
      return;
    }
    originalStyles[key] = el.style[key];
    el.style[key] = value;
  });
  if (ignoreCache) return;
  cache.set(el, originalStyles);
}
function reset(el, prop) {
  if (!el || !(el instanceof HTMLElement)) return;
  let originalStyles = cache.get(el);
  if (!originalStyles) {
    return;
  }
  {
    el.style[prop] = originalStyles[prop];
  }
}
const isVertical = (direction) => {
  switch (direction) {
    case "top":
    case "bottom":
      return true;
    case "left":
    case "right":
      return false;
    default:
      return direction;
  }
};
function getTranslate(element, direction) {
  if (!element) {
    return null;
  }
  const style = window.getComputedStyle(element);
  const transform = (
    // @ts-ignore
    style.transform || style.webkitTransform || style.mozTransform
  );
  let mat = transform.match(/^matrix3d\((.+)\)$/);
  if (mat) {
    return parseFloat(mat[1].split(", ")[isVertical(direction) ? 13 : 12]);
  }
  mat = transform.match(/^matrix\((.+)\)$/);
  return mat ? parseFloat(mat[1].split(", ")[isVertical(direction) ? 5 : 4]) : null;
}
function dampenValue(v) {
  return 8 * (Math.log(v + 1) - 2);
}
function assignStyle(element, style) {
  if (!element) return () => {
  };
  const prevStyle = element.style.cssText;
  Object.assign(element.style, style);
  return () => {
    element.style.cssText = prevStyle;
  };
}
function chain(...fns) {
  return (...args) => {
    for (const fn of fns) {
      if (typeof fn === "function") {
        fn(...args);
      }
    }
  };
}
const TRANSITIONS = {
  DURATION: 0.5,
  EASE: [
    0.32,
    0.72,
    0,
    1
  ]
};
const VELOCITY_THRESHOLD = 0.4;
const CLOSE_THRESHOLD = 0.25;
const SCROLL_LOCK_TIMEOUT = 100;
const BORDER_RADIUS = 8;
const NESTED_DISPLACEMENT = 16;
const WINDOW_TOP_OFFSET = 26;
const DRAG_CLASS = "vaul-dragging";
function useCallbackRef(callback) {
  const callbackRef = React.useRef(callback);
  React.useEffect(() => {
    callbackRef.current = callback;
  });
  return React.useMemo(() => (...args) => callbackRef.current == null ? void 0 : callbackRef.current.call(callbackRef, ...args), []);
}
function useUncontrolledState({ defaultProp, onChange }) {
  const uncontrolledState = React.useState(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = React.useRef(value);
  const handleChange = useCallbackRef(onChange);
  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value);
      prevValueRef.current = value;
    }
  }, [
    value,
    prevValueRef,
    handleChange
  ]);
  return uncontrolledState;
}
function useControllableState({ prop, defaultProp, onChange = () => {
} }) {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({
    defaultProp,
    onChange
  });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  const handleChange = useCallbackRef(onChange);
  const setValue = React.useCallback((nextValue) => {
    if (isControlled) {
      const setter = nextValue;
      const value2 = typeof nextValue === "function" ? setter(prop) : nextValue;
      if (value2 !== prop) handleChange(value2);
    } else {
      setUncontrolledProp(nextValue);
    }
  }, [
    isControlled,
    prop,
    setUncontrolledProp,
    handleChange
  ]);
  return [
    value,
    setValue
  ];
}
function useSnapPoints({ activeSnapPointProp, setActiveSnapPointProp, snapPoints, drawerRef, overlayRef, fadeFromIndex, onSnapPointChange, direction = "bottom", container, snapToSequentialPoint }) {
  const [activeSnapPoint, setActiveSnapPoint] = useControllableState({
    prop: activeSnapPointProp,
    defaultProp: snapPoints == null ? void 0 : snapPoints[0],
    onChange: setActiveSnapPointProp
  });
  const [windowDimensions, setWindowDimensions] = React.useState(typeof window !== "undefined" ? {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight
  } : void 0);
  React.useEffect(() => {
    function onResize() {
      setWindowDimensions({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isLastSnapPoint = React.useMemo(() => activeSnapPoint === (snapPoints == null ? void 0 : snapPoints[snapPoints.length - 1]) || null, [
    snapPoints,
    activeSnapPoint
  ]);
  const activeSnapPointIndex = React.useMemo(() => snapPoints == null ? void 0 : snapPoints.findIndex((snapPoint) => snapPoint === activeSnapPoint), [
    snapPoints,
    activeSnapPoint
  ]);
  const shouldFade = snapPoints && snapPoints.length > 0 && (fadeFromIndex || fadeFromIndex === 0) && !Number.isNaN(fadeFromIndex) && snapPoints[fadeFromIndex] === activeSnapPoint || !snapPoints;
  const snapPointsOffset = React.useMemo(() => {
    const containerSize = container ? {
      width: container.getBoundingClientRect().width,
      height: container.getBoundingClientRect().height
    } : typeof window !== "undefined" ? {
      width: window.innerWidth,
      height: window.innerHeight
    } : {
      width: 0,
      height: 0
    };
    var _snapPoints_map;
    return (_snapPoints_map = snapPoints == null ? void 0 : snapPoints.map((snapPoint) => {
      const isPx = typeof snapPoint === "string";
      let snapPointAsNumber = 0;
      if (isPx) {
        snapPointAsNumber = parseInt(snapPoint, 10);
      }
      if (isVertical(direction)) {
        const height = isPx ? snapPointAsNumber : windowDimensions ? snapPoint * containerSize.height : 0;
        if (windowDimensions) {
          return direction === "bottom" ? containerSize.height - height : -containerSize.height + height;
        }
        return height;
      }
      const width = isPx ? snapPointAsNumber : windowDimensions ? snapPoint * containerSize.width : 0;
      if (windowDimensions) {
        return direction === "right" ? containerSize.width - width : -containerSize.width + width;
      }
      return width;
    })) != null ? _snapPoints_map : [];
  }, [
    snapPoints,
    windowDimensions,
    container
  ]);
  const activeSnapPointOffset = React.useMemo(() => activeSnapPointIndex !== null ? snapPointsOffset == null ? void 0 : snapPointsOffset[activeSnapPointIndex] : null, [
    snapPointsOffset,
    activeSnapPointIndex
  ]);
  const snapToPoint = React.useCallback((dimension) => {
    var _snapPointsOffset_findIndex;
    const newSnapPointIndex = (_snapPointsOffset_findIndex = snapPointsOffset == null ? void 0 : snapPointsOffset.findIndex((snapPointDim) => snapPointDim === dimension)) != null ? _snapPointsOffset_findIndex : null;
    onSnapPointChange(newSnapPointIndex);
    set(drawerRef.current, {
      transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
      transform: isVertical(direction) ? `translate3d(0, ${dimension}px, 0)` : `translate3d(${dimension}px, 0, 0)`
    });
    if (snapPointsOffset && newSnapPointIndex !== snapPointsOffset.length - 1 && newSnapPointIndex !== fadeFromIndex && newSnapPointIndex < fadeFromIndex) {
      set(overlayRef.current, {
        transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
        opacity: "0"
      });
    } else {
      set(overlayRef.current, {
        transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
        opacity: "1"
      });
    }
    setActiveSnapPoint(snapPoints == null ? void 0 : snapPoints[Math.max(newSnapPointIndex, 0)]);
  }, [
    drawerRef.current,
    snapPoints,
    snapPointsOffset,
    fadeFromIndex,
    overlayRef,
    setActiveSnapPoint
  ]);
  React.useEffect(() => {
    if (activeSnapPoint || activeSnapPointProp) {
      var _snapPoints_findIndex;
      const newIndex = (_snapPoints_findIndex = snapPoints == null ? void 0 : snapPoints.findIndex((snapPoint) => snapPoint === activeSnapPointProp || snapPoint === activeSnapPoint)) != null ? _snapPoints_findIndex : -1;
      if (snapPointsOffset && newIndex !== -1 && typeof snapPointsOffset[newIndex] === "number") {
        snapToPoint(snapPointsOffset[newIndex]);
      }
    }
  }, [
    activeSnapPoint,
    activeSnapPointProp,
    snapPoints,
    snapPointsOffset,
    snapToPoint
  ]);
  function onRelease({ draggedDistance, closeDrawer, velocity, dismissible }) {
    if (fadeFromIndex === void 0) return;
    const currentPosition = direction === "bottom" || direction === "right" ? (activeSnapPointOffset != null ? activeSnapPointOffset : 0) - draggedDistance : (activeSnapPointOffset != null ? activeSnapPointOffset : 0) + draggedDistance;
    const isOverlaySnapPoint = activeSnapPointIndex === fadeFromIndex - 1;
    const isFirst = activeSnapPointIndex === 0;
    const hasDraggedUp = draggedDistance > 0;
    if (isOverlaySnapPoint) {
      set(overlayRef.current, {
        transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`
      });
    }
    if (!snapToSequentialPoint && velocity > 2 && !hasDraggedUp) {
      if (dismissible) closeDrawer();
      else snapToPoint(snapPointsOffset[0]);
      return;
    }
    if (!snapToSequentialPoint && velocity > 2 && hasDraggedUp && snapPointsOffset && snapPoints) {
      snapToPoint(snapPointsOffset[snapPoints.length - 1]);
      return;
    }
    const closestSnapPoint = snapPointsOffset == null ? void 0 : snapPointsOffset.reduce((prev, curr) => {
      if (typeof prev !== "number" || typeof curr !== "number") return prev;
      return Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev;
    });
    const dim = isVertical(direction) ? window.innerHeight : window.innerWidth;
    if (velocity > VELOCITY_THRESHOLD && Math.abs(draggedDistance) < dim * 0.4) {
      const dragDirection = hasDraggedUp ? 1 : -1;
      if (dragDirection > 0 && isLastSnapPoint) {
        snapToPoint(snapPointsOffset[snapPoints.length - 1]);
        return;
      }
      if (isFirst && dragDirection < 0 && dismissible) {
        closeDrawer();
      }
      if (activeSnapPointIndex === null) return;
      snapToPoint(snapPointsOffset[activeSnapPointIndex + dragDirection]);
      return;
    }
    snapToPoint(closestSnapPoint);
  }
  function onDrag({ draggedDistance }) {
    if (activeSnapPointOffset === null) return;
    const newValue = direction === "bottom" || direction === "right" ? activeSnapPointOffset - draggedDistance : activeSnapPointOffset + draggedDistance;
    if ((direction === "bottom" || direction === "right") && newValue < snapPointsOffset[snapPointsOffset.length - 1]) {
      return;
    }
    if ((direction === "top" || direction === "left") && newValue > snapPointsOffset[snapPointsOffset.length - 1]) {
      return;
    }
    set(drawerRef.current, {
      transform: isVertical(direction) ? `translate3d(0, ${newValue}px, 0)` : `translate3d(${newValue}px, 0, 0)`
    });
  }
  function getPercentageDragged(absDraggedDistance, isDraggingDown) {
    if (!snapPoints || typeof activeSnapPointIndex !== "number" || !snapPointsOffset || fadeFromIndex === void 0) return null;
    const isOverlaySnapPoint = activeSnapPointIndex === fadeFromIndex - 1;
    const isOverlaySnapPointOrHigher = activeSnapPointIndex >= fadeFromIndex;
    if (isOverlaySnapPointOrHigher && isDraggingDown) {
      return 0;
    }
    if (isOverlaySnapPoint && !isDraggingDown) return 1;
    if (!shouldFade && !isOverlaySnapPoint) return null;
    const targetSnapPointIndex = isOverlaySnapPoint ? activeSnapPointIndex + 1 : activeSnapPointIndex - 1;
    const snapPointDistance = isOverlaySnapPoint ? snapPointsOffset[targetSnapPointIndex] - snapPointsOffset[targetSnapPointIndex - 1] : snapPointsOffset[targetSnapPointIndex + 1] - snapPointsOffset[targetSnapPointIndex];
    const percentageDragged = absDraggedDistance / Math.abs(snapPointDistance);
    if (isOverlaySnapPoint) {
      return 1 - percentageDragged;
    } else {
      return percentageDragged;
    }
  }
  return {
    isLastSnapPoint,
    activeSnapPoint,
    shouldFade,
    getPercentageDragged,
    setActiveSnapPoint,
    activeSnapPointIndex,
    onRelease,
    onDrag,
    snapPointsOffset
  };
}
const noop = () => () => {
};
function useScaleBackground() {
  const { direction, isOpen, shouldScaleBackground, setBackgroundColorOnScale, noBodyStyles } = useDrawerContext();
  const timeoutIdRef = React.useRef(null);
  const initialBackgroundColor = reactExports.useMemo(() => document.body.style.backgroundColor, []);
  function getScale() {
    return (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
  }
  React.useEffect(() => {
    if (isOpen && shouldScaleBackground) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      const wrapper = document.querySelector("[data-vaul-drawer-wrapper]") || document.querySelector("[vaul-drawer-wrapper]");
      if (!wrapper) return;
      chain(setBackgroundColorOnScale && !noBodyStyles ? assignStyle(document.body, {
        background: "black"
      }) : noop, assignStyle(wrapper, {
        transformOrigin: isVertical(direction) ? "top" : "left",
        transitionProperty: "transform, border-radius",
        transitionDuration: `${TRANSITIONS.DURATION}s`,
        transitionTimingFunction: `cubic-bezier(${TRANSITIONS.EASE.join(",")})`
      }));
      const wrapperStylesCleanup = assignStyle(wrapper, {
        borderRadius: `${BORDER_RADIUS}px`,
        overflow: "hidden",
        ...isVertical(direction) ? {
          transform: `scale(${getScale()}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`
        } : {
          transform: `scale(${getScale()}) translate3d(calc(env(safe-area-inset-top) + 14px), 0, 0)`
        }
      });
      return () => {
        wrapperStylesCleanup();
        timeoutIdRef.current = window.setTimeout(() => {
          if (initialBackgroundColor) {
            document.body.style.background = initialBackgroundColor;
          } else {
            document.body.style.removeProperty("background");
          }
        }, TRANSITIONS.DURATION * 1e3);
      };
    }
  }, [
    isOpen,
    shouldScaleBackground,
    initialBackgroundColor
  ]);
}
let previousBodyPosition = null;
function usePositionFixed({ isOpen, modal, nested, hasBeenOpened, preventScrollRestoration, noBodyStyles }) {
  const [activeUrl, setActiveUrl] = React.useState(() => typeof window !== "undefined" ? window.location.href : "");
  const scrollPos = React.useRef(0);
  const setPositionFixed = React.useCallback(() => {
    if (!isSafari()) return;
    if (previousBodyPosition === null && isOpen && !noBodyStyles) {
      previousBodyPosition = {
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left,
        height: document.body.style.height,
        right: "unset"
      };
      const { scrollX, innerHeight } = window;
      document.body.style.setProperty("position", "fixed", "important");
      Object.assign(document.body.style, {
        top: `${-scrollPos.current}px`,
        left: `${-scrollX}px`,
        right: "0px",
        height: "auto"
      });
      window.setTimeout(() => window.requestAnimationFrame(() => {
        const bottomBarHeight = innerHeight - window.innerHeight;
        if (bottomBarHeight && scrollPos.current >= innerHeight) {
          document.body.style.top = `${-(scrollPos.current + bottomBarHeight)}px`;
        }
      }), 300);
    }
  }, [
    isOpen
  ]);
  const restorePositionSetting = React.useCallback(() => {
    if (!isSafari()) return;
    if (previousBodyPosition !== null && !noBodyStyles) {
      const y = -parseInt(document.body.style.top, 10);
      const x = -parseInt(document.body.style.left, 10);
      Object.assign(document.body.style, previousBodyPosition);
      window.requestAnimationFrame(() => {
        if (preventScrollRestoration && activeUrl !== window.location.href) {
          setActiveUrl(window.location.href);
          return;
        }
        window.scrollTo(x, y);
      });
      previousBodyPosition = null;
    }
  }, [
    activeUrl
  ]);
  React.useEffect(() => {
    function onScroll() {
      scrollPos.current = window.scrollY;
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  React.useEffect(() => {
    if (nested || !hasBeenOpened) return;
    if (isOpen) {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      !isStandalone && setPositionFixed();
      if (!modal) {
        window.setTimeout(() => {
          restorePositionSetting();
        }, 500);
      }
    } else {
      restorePositionSetting();
    }
  }, [
    isOpen,
    hasBeenOpened,
    activeUrl,
    modal,
    nested,
    setPositionFixed,
    restorePositionSetting
  ]);
  return {
    restorePositionSetting
  };
}
function Root({ open: openProp, onOpenChange, children, onDrag: onDragProp, onRelease: onReleaseProp, snapPoints, shouldScaleBackground = false, setBackgroundColorOnScale = true, closeThreshold = CLOSE_THRESHOLD, scrollLockTimeout = SCROLL_LOCK_TIMEOUT, dismissible = true, handleOnly = false, fadeFromIndex = snapPoints && snapPoints.length - 1, activeSnapPoint: activeSnapPointProp, setActiveSnapPoint: setActiveSnapPointProp, fixed, modal = true, onClose, nested, noBodyStyles, direction = "bottom", defaultOpen = false, disablePreventScroll = true, snapToSequentialPoint = false, preventScrollRestoration = false, repositionInputs = true, onAnimationEnd, container, autoFocus = false }) {
  var _drawerRef_current, _drawerRef_current1;
  const [isOpen = false, setIsOpen] = useControllableState({
    defaultProp: defaultOpen,
    prop: openProp,
    onChange: (o) => {
      onOpenChange == null ? void 0 : onOpenChange(o);
      if (!o && !nested) {
        restorePositionSetting();
      }
      setTimeout(() => {
        onAnimationEnd == null ? void 0 : onAnimationEnd(o);
      }, TRANSITIONS.DURATION * 1e3);
      if (o && !modal) {
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            document.body.style.pointerEvents = "auto";
          });
        }
      }
      if (!o) {
        document.body.style.pointerEvents = "auto";
      }
    }
  });
  const [hasBeenOpened, setHasBeenOpened] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [justReleased, setJustReleased] = React.useState(false);
  const overlayRef = React.useRef(null);
  const openTime = React.useRef(null);
  const dragStartTime = React.useRef(null);
  const dragEndTime = React.useRef(null);
  const lastTimeDragPrevented = React.useRef(null);
  const isAllowedToDrag = React.useRef(false);
  const nestedOpenChangeTimer = React.useRef(null);
  const pointerStart = React.useRef(0);
  const keyboardIsOpen = React.useRef(false);
  const previousDiffFromInitial = React.useRef(0);
  const drawerRef = React.useRef(null);
  const drawerHeightRef = React.useRef(((_drawerRef_current = drawerRef.current) == null ? void 0 : _drawerRef_current.getBoundingClientRect().height) || 0);
  const drawerWidthRef = React.useRef(((_drawerRef_current1 = drawerRef.current) == null ? void 0 : _drawerRef_current1.getBoundingClientRect().width) || 0);
  const initialDrawerHeight = React.useRef(0);
  const onSnapPointChange = React.useCallback((activeSnapPointIndex2) => {
    if (snapPoints && activeSnapPointIndex2 === snapPointsOffset.length - 1) openTime.current = /* @__PURE__ */ new Date();
  }, []);
  const { activeSnapPoint, activeSnapPointIndex, setActiveSnapPoint, onRelease: onReleaseSnapPoints, snapPointsOffset, onDrag: onDragSnapPoints, shouldFade, getPercentageDragged: getSnapPointsPercentageDragged } = useSnapPoints({
    snapPoints,
    activeSnapPointProp,
    setActiveSnapPointProp,
    drawerRef,
    fadeFromIndex,
    overlayRef,
    onSnapPointChange,
    direction,
    container,
    snapToSequentialPoint
  });
  usePreventScroll({
    isDisabled: !isOpen || isDragging || !modal || justReleased || !hasBeenOpened || !repositionInputs || !disablePreventScroll
  });
  const { restorePositionSetting } = usePositionFixed({
    isOpen,
    modal,
    nested,
    hasBeenOpened,
    preventScrollRestoration,
    noBodyStyles
  });
  function getScale() {
    return (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
  }
  function onPress(event) {
    var _drawerRef_current2, _drawerRef_current12;
    if (!dismissible && !snapPoints) return;
    if (drawerRef.current && !drawerRef.current.contains(event.target)) return;
    drawerHeightRef.current = ((_drawerRef_current2 = drawerRef.current) == null ? void 0 : _drawerRef_current2.getBoundingClientRect().height) || 0;
    drawerWidthRef.current = ((_drawerRef_current12 = drawerRef.current) == null ? void 0 : _drawerRef_current12.getBoundingClientRect().width) || 0;
    setIsDragging(true);
    dragStartTime.current = /* @__PURE__ */ new Date();
    if (isIOS()) {
      window.addEventListener("touchend", () => isAllowedToDrag.current = false, {
        once: true
      });
    }
    event.target.setPointerCapture(event.pointerId);
    pointerStart.current = isVertical(direction) ? event.pageY : event.pageX;
  }
  function shouldDrag(el, isDraggingInDirection) {
    var _window_getSelection, _lastTimeDragPrevented_current;
    let element = el;
    const highlightedText = (_window_getSelection = window.getSelection()) == null ? void 0 : _window_getSelection.toString();
    const swipeAmount = drawerRef.current ? getTranslate(drawerRef.current, direction) : null;
    const date = /* @__PURE__ */ new Date();
    if (element.hasAttribute("data-vaul-no-drag") || element.closest("[data-vaul-no-drag]")) {
      return false;
    }
    if (direction === "right" || direction === "left") {
      return true;
    }
    if (openTime.current && date.getTime() - openTime.current.getTime() < 500) {
      return false;
    }
    if (swipeAmount !== null) {
      if (direction === "bottom" ? swipeAmount > 0 : swipeAmount < 0) {
        return true;
      }
    }
    if (highlightedText && highlightedText.length > 0) {
      return false;
    }
    if (date.getTime() - ((_lastTimeDragPrevented_current = lastTimeDragPrevented.current) == null ? void 0 : _lastTimeDragPrevented_current.getTime()) < scrollLockTimeout && swipeAmount === 0) {
      lastTimeDragPrevented.current = date;
      return false;
    }
    if (isDraggingInDirection) {
      lastTimeDragPrevented.current = date;
      return false;
    }
    while (element) {
      if (element.scrollHeight > element.clientHeight) {
        if (element.scrollTop !== 0) {
          lastTimeDragPrevented.current = /* @__PURE__ */ new Date();
          return false;
        }
        if (element.getAttribute("role") === "dialog") {
          return true;
        }
      }
      element = element.parentNode;
    }
    return true;
  }
  function onDrag(event) {
    if (!drawerRef.current) {
      return;
    }
    if (isDragging) {
      const directionMultiplier = direction === "bottom" || direction === "right" ? 1 : -1;
      const draggedDistance = (pointerStart.current - (isVertical(direction) ? event.pageY : event.pageX)) * directionMultiplier;
      const isDraggingInDirection = draggedDistance > 0;
      const noCloseSnapPointsPreCondition = snapPoints && !dismissible && !isDraggingInDirection;
      if (noCloseSnapPointsPreCondition && activeSnapPointIndex === 0) return;
      const absDraggedDistance = Math.abs(draggedDistance);
      const wrapper = document.querySelector("[data-vaul-drawer-wrapper]");
      const drawerDimension = direction === "bottom" || direction === "top" ? drawerHeightRef.current : drawerWidthRef.current;
      let percentageDragged = absDraggedDistance / drawerDimension;
      const snapPointPercentageDragged = getSnapPointsPercentageDragged(absDraggedDistance, isDraggingInDirection);
      if (snapPointPercentageDragged !== null) {
        percentageDragged = snapPointPercentageDragged;
      }
      if (noCloseSnapPointsPreCondition && percentageDragged >= 1) {
        return;
      }
      if (!isAllowedToDrag.current && !shouldDrag(event.target, isDraggingInDirection)) return;
      drawerRef.current.classList.add(DRAG_CLASS);
      isAllowedToDrag.current = true;
      set(drawerRef.current, {
        transition: "none"
      });
      set(overlayRef.current, {
        transition: "none"
      });
      if (snapPoints) {
        onDragSnapPoints({
          draggedDistance
        });
      }
      if (isDraggingInDirection && !snapPoints) {
        const dampenedDraggedDistance = dampenValue(draggedDistance);
        const translateValue = Math.min(dampenedDraggedDistance * -1, 0) * directionMultiplier;
        set(drawerRef.current, {
          transform: isVertical(direction) ? `translate3d(0, ${translateValue}px, 0)` : `translate3d(${translateValue}px, 0, 0)`
        });
        return;
      }
      const opacityValue = 1 - percentageDragged;
      if (shouldFade || fadeFromIndex && activeSnapPointIndex === fadeFromIndex - 1) {
        onDragProp == null ? void 0 : onDragProp(event, percentageDragged);
        set(overlayRef.current, {
          opacity: `${opacityValue}`,
          transition: "none"
        }, true);
      }
      if (wrapper && overlayRef.current && shouldScaleBackground) {
        const scaleValue = Math.min(getScale() + percentageDragged * (1 - getScale()), 1);
        const borderRadiusValue = 8 - percentageDragged * 8;
        const translateValue = Math.max(0, 14 - percentageDragged * 14);
        set(wrapper, {
          borderRadius: `${borderRadiusValue}px`,
          transform: isVertical(direction) ? `scale(${scaleValue}) translate3d(0, ${translateValue}px, 0)` : `scale(${scaleValue}) translate3d(${translateValue}px, 0, 0)`,
          transition: "none"
        }, true);
      }
      if (!snapPoints) {
        const translateValue = absDraggedDistance * directionMultiplier;
        set(drawerRef.current, {
          transform: isVertical(direction) ? `translate3d(0, ${translateValue}px, 0)` : `translate3d(${translateValue}px, 0, 0)`
        });
      }
    }
  }
  React.useEffect(() => {
    var _window_visualViewport;
    function onVisualViewportChange() {
      if (!drawerRef.current || !repositionInputs) return;
      const focusedElement = document.activeElement;
      if (isInput(focusedElement) || keyboardIsOpen.current) {
        var _window_visualViewport2;
        const visualViewportHeight = ((_window_visualViewport2 = window.visualViewport) == null ? void 0 : _window_visualViewport2.height) || 0;
        const totalHeight = window.innerHeight;
        let diffFromInitial = totalHeight - visualViewportHeight;
        const drawerHeight = drawerRef.current.getBoundingClientRect().height || 0;
        const isTallEnough = drawerHeight > totalHeight * 0.8;
        if (!initialDrawerHeight.current) {
          initialDrawerHeight.current = drawerHeight;
        }
        const offsetFromTop = drawerRef.current.getBoundingClientRect().top;
        if (Math.abs(previousDiffFromInitial.current - diffFromInitial) > 60) {
          keyboardIsOpen.current = !keyboardIsOpen.current;
        }
        if (snapPoints && snapPoints.length > 0 && snapPointsOffset && activeSnapPointIndex) {
          const activeSnapPointHeight = snapPointsOffset[activeSnapPointIndex] || 0;
          diffFromInitial += activeSnapPointHeight;
        }
        previousDiffFromInitial.current = diffFromInitial;
        if (drawerHeight > visualViewportHeight || keyboardIsOpen.current) {
          const height = drawerRef.current.getBoundingClientRect().height;
          let newDrawerHeight = height;
          if (height > visualViewportHeight) {
            newDrawerHeight = visualViewportHeight - (isTallEnough ? offsetFromTop : WINDOW_TOP_OFFSET);
          }
          if (fixed) {
            drawerRef.current.style.height = `${height - Math.max(diffFromInitial, 0)}px`;
          } else {
            drawerRef.current.style.height = `${Math.max(newDrawerHeight, visualViewportHeight - offsetFromTop)}px`;
          }
        } else {
          drawerRef.current.style.height = `${initialDrawerHeight.current}px`;
        }
        if (snapPoints && snapPoints.length > 0 && !keyboardIsOpen.current) {
          drawerRef.current.style.bottom = `0px`;
        } else {
          drawerRef.current.style.bottom = `${Math.max(diffFromInitial, 0)}px`;
        }
      }
    }
    (_window_visualViewport = window.visualViewport) == null ? void 0 : _window_visualViewport.addEventListener("resize", onVisualViewportChange);
    return () => {
      var _window_visualViewport2;
      return (_window_visualViewport2 = window.visualViewport) == null ? void 0 : _window_visualViewport2.removeEventListener("resize", onVisualViewportChange);
    };
  }, [
    activeSnapPointIndex,
    snapPoints,
    snapPointsOffset
  ]);
  function closeDrawer(fromWithin) {
    cancelDrag();
    onClose == null ? void 0 : onClose();
    if (!fromWithin) {
      setIsOpen(false);
    }
    setTimeout(() => {
      if (snapPoints) {
        setActiveSnapPoint(snapPoints[0]);
      }
    }, TRANSITIONS.DURATION * 1e3);
  }
  function resetDrawer() {
    if (!drawerRef.current) return;
    const wrapper = document.querySelector("[data-vaul-drawer-wrapper]");
    const currentSwipeAmount = getTranslate(drawerRef.current, direction);
    set(drawerRef.current, {
      transform: "translate3d(0, 0, 0)",
      transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`
    });
    set(overlayRef.current, {
      transition: `opacity ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
      opacity: "1"
    });
    if (shouldScaleBackground && currentSwipeAmount && currentSwipeAmount > 0 && isOpen) {
      set(wrapper, {
        borderRadius: `${BORDER_RADIUS}px`,
        overflow: "hidden",
        ...isVertical(direction) ? {
          transform: `scale(${getScale()}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`,
          transformOrigin: "top"
        } : {
          transform: `scale(${getScale()}) translate3d(calc(env(safe-area-inset-top) + 14px), 0, 0)`,
          transformOrigin: "left"
        },
        transitionProperty: "transform, border-radius",
        transitionDuration: `${TRANSITIONS.DURATION}s`,
        transitionTimingFunction: `cubic-bezier(${TRANSITIONS.EASE.join(",")})`
      }, true);
    }
  }
  function cancelDrag() {
    if (!isDragging || !drawerRef.current) return;
    drawerRef.current.classList.remove(DRAG_CLASS);
    isAllowedToDrag.current = false;
    setIsDragging(false);
    dragEndTime.current = /* @__PURE__ */ new Date();
  }
  function onRelease(event) {
    if (!isDragging || !drawerRef.current) return;
    drawerRef.current.classList.remove(DRAG_CLASS);
    isAllowedToDrag.current = false;
    setIsDragging(false);
    dragEndTime.current = /* @__PURE__ */ new Date();
    const swipeAmount = getTranslate(drawerRef.current, direction);
    if (!shouldDrag(event.target, false) || !swipeAmount || Number.isNaN(swipeAmount)) return;
    if (dragStartTime.current === null) return;
    const timeTaken = dragEndTime.current.getTime() - dragStartTime.current.getTime();
    const distMoved = pointerStart.current - (isVertical(direction) ? event.pageY : event.pageX);
    const velocity = Math.abs(distMoved) / timeTaken;
    if (velocity > 0.05) {
      setJustReleased(true);
      setTimeout(() => {
        setJustReleased(false);
      }, 200);
    }
    if (snapPoints) {
      const directionMultiplier = direction === "bottom" || direction === "right" ? 1 : -1;
      onReleaseSnapPoints({
        draggedDistance: distMoved * directionMultiplier,
        closeDrawer,
        velocity,
        dismissible
      });
      onReleaseProp == null ? void 0 : onReleaseProp(event, true);
      return;
    }
    if (direction === "bottom" || direction === "right" ? distMoved > 0 : distMoved < 0) {
      resetDrawer();
      onReleaseProp == null ? void 0 : onReleaseProp(event, true);
      return;
    }
    if (velocity > VELOCITY_THRESHOLD) {
      closeDrawer();
      onReleaseProp == null ? void 0 : onReleaseProp(event, false);
      return;
    }
    var _drawerRef_current_getBoundingClientRect_height;
    const visibleDrawerHeight = Math.min((_drawerRef_current_getBoundingClientRect_height = drawerRef.current.getBoundingClientRect().height) != null ? _drawerRef_current_getBoundingClientRect_height : 0, window.innerHeight);
    var _drawerRef_current_getBoundingClientRect_width;
    const visibleDrawerWidth = Math.min((_drawerRef_current_getBoundingClientRect_width = drawerRef.current.getBoundingClientRect().width) != null ? _drawerRef_current_getBoundingClientRect_width : 0, window.innerWidth);
    const isHorizontalSwipe = direction === "left" || direction === "right";
    if (Math.abs(swipeAmount) >= (isHorizontalSwipe ? visibleDrawerWidth : visibleDrawerHeight) * closeThreshold) {
      closeDrawer();
      onReleaseProp == null ? void 0 : onReleaseProp(event, false);
      return;
    }
    onReleaseProp == null ? void 0 : onReleaseProp(event, true);
    resetDrawer();
  }
  React.useEffect(() => {
    if (isOpen) {
      set(document.documentElement, {
        scrollBehavior: "auto"
      });
      openTime.current = /* @__PURE__ */ new Date();
    }
    return () => {
      reset(document.documentElement, "scrollBehavior");
    };
  }, [
    isOpen
  ]);
  function onNestedOpenChange(o) {
    const scale = o ? (window.innerWidth - NESTED_DISPLACEMENT) / window.innerWidth : 1;
    const y = o ? -NESTED_DISPLACEMENT : 0;
    if (nestedOpenChangeTimer.current) {
      window.clearTimeout(nestedOpenChangeTimer.current);
    }
    set(drawerRef.current, {
      transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
      transform: `scale(${scale}) translate3d(0, ${y}px, 0)`
    });
    if (!o && drawerRef.current) {
      nestedOpenChangeTimer.current = setTimeout(() => {
        const translateValue = getTranslate(drawerRef.current, direction);
        set(drawerRef.current, {
          transition: "none",
          transform: isVertical(direction) ? `translate3d(0, ${translateValue}px, 0)` : `translate3d(${translateValue}px, 0, 0)`
        });
      }, 500);
    }
  }
  function onNestedDrag(_event, percentageDragged) {
    if (percentageDragged < 0) return;
    const initialScale = (window.innerWidth - NESTED_DISPLACEMENT) / window.innerWidth;
    const newScale = initialScale + percentageDragged * (1 - initialScale);
    const newTranslate = -NESTED_DISPLACEMENT + percentageDragged * NESTED_DISPLACEMENT;
    set(drawerRef.current, {
      transform: isVertical(direction) ? `scale(${newScale}) translate3d(0, ${newTranslate}px, 0)` : `scale(${newScale}) translate3d(${newTranslate}px, 0, 0)`,
      transition: "none"
    });
  }
  function onNestedRelease(_event, o) {
    const dim = isVertical(direction) ? window.innerHeight : window.innerWidth;
    const scale = o ? (dim - NESTED_DISPLACEMENT) / dim : 1;
    const translate = o ? -NESTED_DISPLACEMENT : 0;
    if (o) {
      set(drawerRef.current, {
        transition: `transform ${TRANSITIONS.DURATION}s cubic-bezier(${TRANSITIONS.EASE.join(",")})`,
        transform: isVertical(direction) ? `scale(${scale}) translate3d(0, ${translate}px, 0)` : `scale(${scale}) translate3d(${translate}px, 0, 0)`
      });
    }
  }
  return /* @__PURE__ */ React.createElement(Root$1, {
    defaultOpen,
    onOpenChange: (open) => {
      if (!dismissible && !open) return;
      if (open) {
        setHasBeenOpened(true);
      } else {
        closeDrawer(true);
      }
      setIsOpen(open);
    },
    open: isOpen
  }, /* @__PURE__ */ React.createElement(DrawerContext.Provider, {
    value: {
      activeSnapPoint,
      snapPoints,
      setActiveSnapPoint,
      drawerRef,
      overlayRef,
      onOpenChange,
      onPress,
      onRelease,
      onDrag,
      dismissible,
      handleOnly,
      isOpen,
      isDragging,
      shouldFade,
      closeDrawer,
      onNestedDrag,
      onNestedOpenChange,
      onNestedRelease,
      keyboardIsOpen,
      modal,
      snapPointsOffset,
      direction,
      shouldScaleBackground,
      setBackgroundColorOnScale,
      noBodyStyles,
      container,
      autoFocus
    }
  }, children));
}
const Overlay = /* @__PURE__ */ React.forwardRef(function({ ...rest }, ref) {
  const { overlayRef, snapPoints, onRelease, shouldFade, isOpen, modal } = useDrawerContext();
  const composedRef = useComposedRefs(ref, overlayRef);
  const hasSnapPoints = snapPoints && snapPoints.length > 0;
  if (!modal) {
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        document.body.style.pointerEvents = "auto";
      });
    }
    return null;
  }
  return /* @__PURE__ */ React.createElement(Overlay$1, {
    onMouseUp: onRelease,
    ref: composedRef,
    "data-vaul-overlay": "",
    "data-vaul-snap-points": isOpen && hasSnapPoints ? "true" : "false",
    "data-vaul-snap-points-overlay": isOpen && shouldFade ? "true" : "false",
    ...rest
  });
});
Overlay.displayName = "Drawer.Overlay";
const Content = /* @__PURE__ */ React.forwardRef(function({ onPointerDownOutside, style, onOpenAutoFocus, ...rest }, ref) {
  const { drawerRef, onPress, onRelease, onDrag, keyboardIsOpen, snapPointsOffset, modal, isOpen, direction, snapPoints, container, handleOnly, autoFocus } = useDrawerContext();
  const [delayedSnapPoints, setDelayedSnapPoints] = React.useState(false);
  const composedRef = useComposedRefs(ref, drawerRef);
  const pointerStartRef = React.useRef(null);
  const lastKnownPointerEventRef = React.useRef(null);
  const wasBeyondThePointRef = React.useRef(false);
  const hasSnapPoints = snapPoints && snapPoints.length > 0;
  useScaleBackground();
  const isDeltaInDirection = (delta, direction2, threshold = 0) => {
    if (wasBeyondThePointRef.current) return true;
    const deltaY = Math.abs(delta.y);
    const deltaX = Math.abs(delta.x);
    const isDeltaX = deltaX > deltaY;
    const dFactor = [
      "bottom",
      "right"
    ].includes(direction2) ? 1 : -1;
    if (direction2 === "left" || direction2 === "right") {
      const isReverseDirection = delta.x * dFactor < 0;
      if (!isReverseDirection && deltaX >= 0 && deltaX <= threshold) {
        return isDeltaX;
      }
    } else {
      const isReverseDirection = delta.y * dFactor < 0;
      if (!isReverseDirection && deltaY >= 0 && deltaY <= threshold) {
        return !isDeltaX;
      }
    }
    wasBeyondThePointRef.current = true;
    return true;
  };
  React.useEffect(() => {
    if (hasSnapPoints) {
      window.requestAnimationFrame(() => {
        setDelayedSnapPoints(true);
      });
    }
  }, []);
  function handleOnPointerUp(event) {
    pointerStartRef.current = null;
    wasBeyondThePointRef.current = false;
    onRelease(event);
  }
  return /* @__PURE__ */ React.createElement(Content$1, {
    "data-vaul-drawer-direction": direction,
    "data-vaul-drawer": "",
    "data-vaul-delayed-snap-points": delayedSnapPoints ? "true" : "false",
    "data-vaul-snap-points": isOpen && hasSnapPoints ? "true" : "false",
    "data-vaul-custom-container": container ? "true" : "false",
    ...rest,
    ref: composedRef,
    style: snapPointsOffset && snapPointsOffset.length > 0 ? {
      "--snap-point-height": `${snapPointsOffset[0]}px`,
      ...style
    } : style,
    onPointerDown: (event) => {
      if (handleOnly) return;
      rest.onPointerDown == null ? void 0 : rest.onPointerDown.call(rest, event);
      pointerStartRef.current = {
        x: event.pageX,
        y: event.pageY
      };
      onPress(event);
    },
    onOpenAutoFocus: (e) => {
      onOpenAutoFocus == null ? void 0 : onOpenAutoFocus(e);
      if (!autoFocus) {
        e.preventDefault();
      }
    },
    onPointerDownOutside: (e) => {
      onPointerDownOutside == null ? void 0 : onPointerDownOutside(e);
      if (!modal || e.defaultPrevented) {
        e.preventDefault();
        return;
      }
      if (keyboardIsOpen.current) {
        keyboardIsOpen.current = false;
      }
    },
    onFocusOutside: (e) => {
      if (!modal) {
        e.preventDefault();
        return;
      }
    },
    onPointerMove: (event) => {
      lastKnownPointerEventRef.current = event;
      if (handleOnly) return;
      rest.onPointerMove == null ? void 0 : rest.onPointerMove.call(rest, event);
      if (!pointerStartRef.current) return;
      const yPosition = event.pageY - pointerStartRef.current.y;
      const xPosition = event.pageX - pointerStartRef.current.x;
      const swipeStartThreshold = event.pointerType === "touch" ? 10 : 2;
      const delta = {
        x: xPosition,
        y: yPosition
      };
      const isAllowedToSwipe = isDeltaInDirection(delta, direction, swipeStartThreshold);
      if (isAllowedToSwipe) onDrag(event);
      else if (Math.abs(xPosition) > swipeStartThreshold || Math.abs(yPosition) > swipeStartThreshold) {
        pointerStartRef.current = null;
      }
    },
    onPointerUp: (event) => {
      rest.onPointerUp == null ? void 0 : rest.onPointerUp.call(rest, event);
      pointerStartRef.current = null;
      wasBeyondThePointRef.current = false;
      onRelease(event);
    },
    onPointerOut: (event) => {
      rest.onPointerOut == null ? void 0 : rest.onPointerOut.call(rest, event);
      handleOnPointerUp(lastKnownPointerEventRef.current);
    },
    onContextMenu: (event) => {
      rest.onContextMenu == null ? void 0 : rest.onContextMenu.call(rest, event);
      handleOnPointerUp(lastKnownPointerEventRef.current);
    }
  });
});
Content.displayName = "Drawer.Content";
const LONG_HANDLE_PRESS_TIMEOUT = 250;
const DOUBLE_TAP_TIMEOUT = 120;
const Handle = /* @__PURE__ */ React.forwardRef(function({ preventCycle = false, children, ...rest }, ref) {
  const { closeDrawer, isDragging, snapPoints, activeSnapPoint, setActiveSnapPoint, dismissible, handleOnly, isOpen, onPress, onDrag } = useDrawerContext();
  const closeTimeoutIdRef = React.useRef(null);
  const shouldCancelInteractionRef = React.useRef(false);
  function handleStartCycle() {
    if (shouldCancelInteractionRef.current) {
      handleCancelInteraction();
      return;
    }
    window.setTimeout(() => {
      handleCycleSnapPoints();
    }, DOUBLE_TAP_TIMEOUT);
  }
  function handleCycleSnapPoints() {
    if (isDragging || preventCycle || shouldCancelInteractionRef.current) {
      handleCancelInteraction();
      return;
    }
    handleCancelInteraction();
    if ((!snapPoints || snapPoints.length === 0) && dismissible) {
      closeDrawer();
      return;
    }
    const isLastSnapPoint = activeSnapPoint === snapPoints[snapPoints.length - 1];
    if (isLastSnapPoint && dismissible) {
      closeDrawer();
      return;
    }
    const currentSnapIndex = snapPoints.findIndex((point) => point === activeSnapPoint);
    if (currentSnapIndex === -1) return;
    const nextSnapPoint = snapPoints[currentSnapIndex + 1];
    setActiveSnapPoint(nextSnapPoint);
  }
  function handleStartInteraction() {
    closeTimeoutIdRef.current = window.setTimeout(() => {
      shouldCancelInteractionRef.current = true;
    }, LONG_HANDLE_PRESS_TIMEOUT);
  }
  function handleCancelInteraction() {
    window.clearTimeout(closeTimeoutIdRef.current);
    shouldCancelInteractionRef.current = false;
  }
  return /* @__PURE__ */ React.createElement("div", {
    onClick: handleStartCycle,
    onPointerCancel: handleCancelInteraction,
    onPointerDown: (e) => {
      if (handleOnly) onPress(e);
      handleStartInteraction();
    },
    onPointerMove: (e) => {
      if (handleOnly) onDrag(e);
    },
    // onPointerUp is already handled by the content component
    ref,
    "data-vaul-drawer-visible": isOpen ? "true" : "false",
    "data-vaul-handle": "",
    "aria-hidden": "true",
    ...rest
  }, /* @__PURE__ */ React.createElement("span", {
    "data-vaul-handle-hitarea": "",
    "aria-hidden": "true"
  }, children));
});
Handle.displayName = "Drawer.Handle";
function Portal(props) {
  const context = useDrawerContext();
  const { container = context.container, ...portalProps } = props;
  return /* @__PURE__ */ React.createElement(Portal$1, {
    container,
    ...portalProps
  });
}
const Drawer$1 = {
  Root,
  Content,
  Overlay,
  Trigger,
  Portal,
  Close,
  Title,
  Description
};
const Drawer = ({
  shouldScaleBackground = true,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Drawer$1.Root,
  {
    shouldScaleBackground,
    ...props
  }
);
Drawer.displayName = "Drawer";
const DrawerTrigger = Drawer$1.Trigger;
const DrawerPortal = Drawer$1.Portal;
const DrawerClose = Drawer$1.Close;
const DrawerOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Drawer$1.Overlay,
  {
    ref,
    className: cn("fixed inset-0 z-50 bg-black/80", className),
    ...props
  }
));
DrawerOverlay.displayName = Drawer$1.Overlay.displayName;
const DrawerContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Drawer$1.Content,
    {
      ref,
      className: cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-neutral-100 dark:bg-neutral-800" }),
        children
      ]
    }
  )
] }));
DrawerContent.displayName = "DrawerContent";
const DrawerHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("grid gap-1.5 p-4 text-center sm:text-left", className),
    ...props
  }
);
DrawerHeader.displayName = "DrawerHeader";
const DrawerTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Drawer$1.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DrawerTitle.displayName = Drawer$1.Title.displayName;
const DrawerDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Drawer$1.Description,
  {
    ref,
    className: cn("text-sm text-neutral-500 dark:text-neutral-400", className),
    ...props
  }
));
DrawerDescription.displayName = Drawer$1.Description.displayName;
const UV_Menu = () => {
  const { location_name } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  useAppStore((state) => state.add_to_cart);
  useAppStore((state) => state.set_cart_location);
  useAppStore((state) => state.set_fulfillment_method);
  const showToast = useAppStore((state) => state.show_toast);
  useAppStore((state) => state.cart_state.items);
  useAppStore((state) => state.cart_state.selected_location);
  const [view_mode, setViewMode] = reactExports.useState("grid");
  const [filter_drawer_open, setFilterDrawerOpen] = reactExports.useState(false);
  const [search_input, setSearchInput] = reactExports.useState(searchParams.get("search") || "");
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations`
      );
      return response.data;
    },
    staleTime: 6e4
  });
  const slugToLocationName = (slug) => {
    if (!locations) return slug;
    const location = locations.find(
      (loc) => loc.location_name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
    );
    return location ? location.location_name : slug;
  };
  const location_slug = location_name || "london-flagship";
  const current_location_name = slugToLocationName(location_slug);
  const current_fulfillment_method = searchParams.get("fulfillment") || null;
  const active_filters = reactExports.useMemo(() => {
    var _a;
    return {
      category: searchParams.get("category") || null,
      price_min: searchParams.get("price_min") ? parseFloat(searchParams.get("price_min")) : null,
      price_max: searchParams.get("price_max") ? parseFloat(searchParams.get("price_max")) : null,
      dietary_tags: ((_a = searchParams.get("dietary_tags")) == null ? void 0 : _a.split(",").filter(Boolean)) || [],
      availability_status: searchParams.get("availability_status") || null,
      search_query: searchParams.get("search") || ""
    };
  }, [searchParams]);
  const sort_config = reactExports.useMemo(() => ({
    sort_by: searchParams.get("sort_by") || "created_at",
    sort_order: searchParams.get("sort_order") || "desc"
  }), [searchParams]);
  const pagination_state = reactExports.useMemo(() => {
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    return {
      products_per_page: limit,
      current_page: Math.floor(offset / limit) + 1
    };
  }, [searchParams]);
  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["product-locations", current_location_name],
    queryFn: async () => {
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/product-locations`,
        {
          params: {
            location_name: current_location_name,
            limit: 1e3
          }
        }
      );
      return response.data;
    },
    staleTime: 6e4,
    // 1 minute
    refetchOnWindowFocus: false
  });
  const assigned_product_ids = reactExports.useMemo(() => {
    if (!assignmentsData) return [];
    const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || [];
    return assignments.map((a) => a.product_id);
  }, [assignmentsData]);
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useQuery({
    queryKey: [
      "products",
      current_location_name,
      active_filters,
      sort_config,
      pagination_state,
      assigned_product_ids
    ],
    queryFn: async () => {
      const params = {
        is_archived: false,
        limit: pagination_state.products_per_page,
        offset: (pagination_state.current_page - 1) * pagination_state.products_per_page,
        sort_by: sort_config.sort_by,
        sort_order: sort_config.sort_order
      };
      if (active_filters.search_query) params.query = active_filters.search_query;
      if (active_filters.category) params.category = active_filters.category;
      if (active_filters.availability_status) params.availability_status = active_filters.availability_status;
      if (active_filters.price_min !== null) params.min_price = active_filters.price_min;
      if (active_filters.price_max !== null) params.max_price = active_filters.price_max;
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products`,
        { params }
      );
      return response.data;
    },
    enabled: assigned_product_ids.length > 0,
    // Only fetch when assignments loaded
    staleTime: 3e4,
    // 30 seconds
    select: (data) => {
      let filtered = data.data || [];
      if (assigned_product_ids.length > 0) {
        filtered = filtered.filter((p) => assigned_product_ids.includes(p.product_id));
      }
      if (active_filters.dietary_tags.length > 0) {
        filtered = filtered.filter((product) => {
          if (!product.dietary_tags) return false;
          let productTags = [];
          try {
            productTags = JSON.parse(product.dietary_tags);
          } catch {
            productTags = product.dietary_tags.split(",").map((t) => t.trim());
          }
          const normalizedProductTags = productTags.map((t) => t.toLowerCase().replace(/_/g, "-"));
          const normalizedFilterTags = active_filters.dietary_tags.map((t) => t.toLowerCase().replace(/_/g, "-"));
          return normalizedFilterTags.every((filterTag) => normalizedProductTags.includes(filterTag));
        });
      }
      const transformedProducts = filtered.map((p) => ({
        ...p,
        price: Number(p.price || 0),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        stock_quantity: p.stock_quantity ? Number(p.stock_quantity) : null
      }));
      return {
        products: transformedProducts,
        total: data.total,
        limit: data.limit,
        offset: data.offset
      };
    }
  });
  const products = (productsData == null ? void 0 : productsData.products) || [];
  const total_products_count = (productsData == null ? void 0 : productsData.total) || 0;
  reactExports.useEffect(() => {
    const timer = setTimeout(() => {
      if (search_input !== active_filters.search_query) {
        updateFilter("search", search_input);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search_input]);
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === "price_min" || key === "price_max") {
      const currentMinPrice = key === "price_min" ? value : active_filters.price_min;
      const currentMaxPrice = key === "price_max" ? value : active_filters.price_max;
      if (currentMinPrice !== null && currentMaxPrice !== null && currentMinPrice > currentMaxPrice) {
        showToast("error", "Minimum price cannot be greater than maximum price");
        return;
      }
    }
    if (value === null || value === void 0 || value === "" || Array.isArray(value) && value.length === 0) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.set(key, value.join(","));
    } else {
      newParams.set(key, value.toString());
    }
    if (key !== "offset" && key !== "limit") {
      newParams.delete("offset");
    }
    setSearchParams(newParams);
  };
  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (current_fulfillment_method) {
      newParams.set("fulfillment", current_fulfillment_method);
    }
    setSearchParams(newParams);
    setSearchInput("");
  };
  const toggleDietaryTag = (tag) => {
    const current = active_filters.dietary_tags;
    const newTags = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    updateFilter("dietary_tags", newTags);
  };
  const goToPage = (page) => {
    const offset = (page - 1) * pagination_state.products_per_page;
    updateFilter("offset", offset);
  };
  const dietary_tag_options = [
    { value: "vegan", label: "Vegan" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "gluten_free", label: "Gluten Free" },
    { value: "dairy_free", label: "Dairy Free" },
    { value: "nut_free", label: "Nut Free" },
    { value: "organic", label: "Organic" }
  ];
  const total_pages = Math.ceil(total_products_count / pagination_state.products_per_page);
  const has_previous = pagination_state.current_page > 1;
  const has_next = pagination_state.current_page < total_pages;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-kake-cream-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-kake-caramel-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center space-x-2 text-sm text-kake-chocolate-400 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "hover:text-kake-caramel-500 transition-colors", children: "Home" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `/location/${location_slug}`, className: "hover:text-kake-caramel-500 transition-colors", children: current_location_name.charAt(0).toUpperCase() + current_location_name.slice(1) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-kake-chocolate-500 font-medium", children: "Menu" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl font-bold text-kake-chocolate-500", children: [
            current_location_name.charAt(0).toUpperCase() + current_location_name.slice(1),
            " Menu"
          ] }),
          current_fulfillment_method && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-400 mt-1", children: current_fulfillment_method === "delivery" ? "🚚 Delivery" : "🏪 Collection" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 bg-kake-cream-100 rounded-lg p-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("grid"),
              className: `px-4 py-2 rounded-lg text-sm font-medium transition-all ${view_mode === "grid" ? "bg-white text-kake-chocolate-500 shadow-soft" : "text-kake-chocolate-400 hover:text-kake-chocolate-500"}`,
              children: "Grid"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("list"),
              className: `px-4 py-2 rounded-lg text-sm font-medium transition-all ${view_mode === "list" ? "bg-white text-kake-chocolate-500 shadow-soft" : "text-kake-chocolate-400 hover:text-kake-chocolate-500"}`,
              children: "List"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search for desserts...",
            value: search_input,
            onChange: (e) => setSearchInput(e.target.value),
            className: "w-full px-4 py-3 pl-12 bg-kake-cream-50 border-2 border-kake-cream-300 rounded-xl focus:border-kake-caramel-500 focus:ring-4 focus:ring-kake-caramel-100 focus:outline-none transition-all text-kake-chocolate-500 placeholder:text-kake-chocolate-300"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            className: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-kake-chocolate-300",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              }
            )
          }
        ),
        search_input && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setSearchInput("");
              updateFilter("search", "");
            },
            className: "absolute right-4 top-1/2 -translate-y-1/2 text-kake-chocolate-300 hover:text-kake-chocolate-500",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-400", children: productsLoading || assignmentsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Loading products..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Showing ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-kake-chocolate-500", children: products.length }),
          " of",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-kake-chocolate-500", children: total_products_count }),
          " products",
          active_filters.search_query && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            ' for "',
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-kake-chocolate-500", children: active_filters.search_query }),
            '"'
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "sort", className: "text-sm text-kake-chocolate-400 hidden sm:block", children: "Sort by:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "sort",
              value: `${sort_config.sort_by}_${sort_config.sort_order}`,
              onChange: (e) => {
                const [sortBy, sortOrder] = e.target.value.split("_");
                updateFilter("sort_by", sortBy);
                updateFilter("sort_order", sortOrder);
              },
              className: "px-3 py-2 bg-white border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "created_at_desc", children: "Newest First" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "product_name_asc", children: "Name (A-Z)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "product_name_desc", children: "Name (Z-A)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_asc", children: "Price (Low to High)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_desc", children: "Price (High to Low)" })
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:grid lg:grid-cols-4 lg:gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Drawer, { open: filter_drawer_open, onOpenChange: setFilterDrawerOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "w-full flex items-center justify-between px-4 py-3 bg-white border border-kake-cream-300 rounded-xl text-sm font-medium text-kake-chocolate-500 hover:bg-kake-cream-50 transition-colors shadow-soft",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-kake-caramel-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" }) }),
                "Filters ",
                Object.values(active_filters).filter((v) => v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)).length > 0 && `(${Object.values(active_filters).filter((v) => v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)).length})`
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DrawerContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerTitle, { children: "Filter Products" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerClose, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-2 hover:bg-gray-100 rounded-full transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-y-auto max-h-[70vh] px-4 pb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
            Object.values(active_filters).some((v) => v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: clearAllFilters,
                className: "w-full px-4 py-2 bg-kake-caramel-500 text-white rounded-xl hover:bg-kake-caramel-600 transition-colors font-medium shadow-caramel",
                children: "Clear All Filters"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: ["pastries", "breads", "cakes", "corporate"].map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "radio",
                    name: "category-mobile",
                    checked: active_filters.category === cat,
                    onChange: () => updateFilter("category", active_filters.category === cat ? null : cat),
                    className: "h-4 w-4 text-kake-caramel-500 border-kake-cream-300 focus:ring-kake-caramel-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm text-kake-chocolate-400 capitalize", children: cat })
              ] }, cat)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Price Range" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "price_min_mobile", className: "text-xs text-kake-chocolate-400 block mb-1", children: "Min Price (€)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      id: "price_min_mobile",
                      min: "0",
                      step: "0.5",
                      value: active_filters.price_min || "",
                      onChange: (e) => updateFilter("price_min", e.target.value ? parseFloat(e.target.value) : null),
                      placeholder: "0.00",
                      className: "w-full px-3 py-2 border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "price_max_mobile", className: "text-xs text-kake-chocolate-400 block mb-1", children: "Max Price (€)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      id: "price_max_mobile",
                      min: "0",
                      step: "0.5",
                      value: active_filters.price_max || "",
                      onChange: (e) => updateFilter("price_max", e.target.value ? parseFloat(e.target.value) : null),
                      placeholder: "100.00",
                      className: "w-full px-3 py-2 border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Dietary Preferences" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: dietary_tag_options.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: active_filters.dietary_tags.includes(tag.value),
                    onChange: () => toggleDietaryTag(tag.value),
                    className: "h-4 w-4 text-kake-caramel-500 border-kake-cream-300 rounded focus:ring-kake-caramel-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm text-kake-chocolate-400", children: tag.label })
              ] }, tag.value)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Availability" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: active_filters.availability_status === "in_stock",
                    onChange: () => updateFilter("availability_status", active_filters.availability_status === "in_stock" ? null : "in_stock"),
                    className: "h-4 w-4 text-kake-caramel-500 border-kake-cream-300 rounded focus:ring-kake-caramel-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm text-kake-chocolate-400", children: "Hide Out of Stock" })
              ] })
            ] })
          ] }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden lg:block lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-soft-lg border border-kake-cream-200 p-6 sticky top-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-lg font-semibold text-kake-chocolate-500", children: "Filters" }),
          Object.values(active_filters).some((v) => v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: clearAllFilters,
              className: "text-sm text-kake-caramel-500 hover:text-kake-caramel-600 font-medium",
              children: "Clear All"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: ["pastries", "breads", "cakes", "corporate"].map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "radio",
                name: "category",
                checked: active_filters.category === cat,
                onChange: () => updateFilter("category", active_filters.category === cat ? null : cat),
                className: "h-4 w-4 text-kake-caramel-500 border-kake-cream-300 focus:ring-kake-caramel-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm text-kake-chocolate-400 capitalize", children: cat })
          ] }, cat)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Price Range" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "price_min", className: "text-xs text-kake-chocolate-400 block mb-1", children: "Min Price (€)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  id: "price_min",
                  min: "0",
                  step: "0.5",
                  value: active_filters.price_min || "",
                  onChange: (e) => updateFilter("price_min", e.target.value ? parseFloat(e.target.value) : null),
                  placeholder: "0.00",
                  className: "w-full px-3 py-2 border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "price_max", className: "text-xs text-kake-chocolate-400 block mb-1", children: "Max Price (€)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  id: "price_max",
                  min: "0",
                  step: "0.5",
                  value: active_filters.price_max || "",
                  onChange: (e) => updateFilter("price_max", e.target.value ? parseFloat(e.target.value) : null),
                  placeholder: "100.00",
                  className: "w-full px-3 py-2 border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Dietary Preferences" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: dietary_tag_options.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: active_filters.dietary_tags.includes(tag.value),
                onChange: () => toggleDietaryTag(tag.value),
                className: "h-4 w-4 text-kake-caramel-500 border-kake-cream-300 rounded focus:ring-kake-caramel-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm text-kake-chocolate-400", children: tag.label })
          ] }, tag.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-kake-chocolate-500 mb-3", children: "Availability" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: active_filters.availability_status === "in_stock",
                onChange: () => updateFilter("availability_status", active_filters.availability_status === "in_stock" ? null : "in_stock"),
                className: "h-4 w-4 text-kake-caramel-500 border-kake-cream-300 rounded focus:ring-kake-caramel-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm text-kake-chocolate-400", children: "Hide Out of Stock" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-3", children: [
        (productsLoading || assignmentsLoading) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-kake-caramel-500 mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-400", children: "Loading delicious treats..." })
        ] }) }),
        productsError && !productsLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-xl p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 mb-4", children: "Failed to load products. Please try again." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => refetchProducts(),
              className: "px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors",
              children: "Retry"
            }
          )
        ] }),
        !productsLoading && !assignmentsLoading && !productsError && products.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-soft-lg border border-kake-cream-200 p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              className: "mx-auto h-16 w-16 text-kake-chocolate-300 mb-4",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 1.5,
                  d: "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg font-semibold text-kake-chocolate-500 mb-2", children: "No desserts found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-400 mb-4", children: active_filters.search_query ? `No results for "${active_filters.search_query}"` : "Try adjusting your filters" }),
          Object.values(active_filters).some((v) => v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: clearAllFilters,
              className: "px-6 py-2 bg-kake-caramel-500 text-white rounded-xl hover:bg-kake-caramel-600 transition-colors font-medium shadow-caramel",
              children: "Clear Filters"
            }
          )
        ] }),
        !productsLoading && !assignmentsLoading && !productsError && products.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: view_mode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4",
              children: products.map((product) => {
                const is_out_of_stock = product.availability_status !== "in_stock";
                let dietary_tags_array = [];
                if (product.dietary_tags) {
                  try {
                    dietary_tags_array = JSON.parse(product.dietary_tags);
                  } catch {
                    dietary_tags_array = product.dietary_tags.split(",").map((t) => t.trim());
                  }
                }
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `bg-white rounded-2xl shadow-soft-lg border border-kake-cream-200 overflow-hidden transition-all hover:shadow-caramel ${is_out_of_stock ? "opacity-60" : ""} ${view_mode === "list" ? "flex" : "flex flex-col"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Link,
                        {
                          to: `/location/${location_slug}/product/${product.product_id}`,
                          className: `block ${view_mode === "list" ? "w-48 flex-shrink-0" : "w-full"}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "img",
                              {
                                src: product.primary_image_url,
                                alt: product.product_name,
                                loading: "lazy",
                                className: `w-full object-cover ${view_mode === "list" ? "h-full" : "aspect-square"}`
                              }
                            ),
                            product.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded", children: "Featured" }),
                            is_out_of_stock && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-red-600 text-white px-4 py-2 rounded-lg font-semibold", children: "Out of Stock" }) })
                          ] })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 flex flex-col ${view_mode === "list" ? "flex-1 justify-between" : "flex-1"}`, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Link,
                            {
                              to: `/location/${location_slug}/product/${product.product_id}`,
                              className: "block",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-base font-semibold text-kake-chocolate-500 hover:text-kake-caramel-500 transition-colors mb-1 line-clamp-1", children: product.product_name })
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-400 mb-3 line-clamp-2", children: product.short_description }),
                          dietary_tags_array.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 mb-3", children: [
                            dietary_tags_array.slice(0, 2).map((tag, idx) => {
                              const badgeColors = [
                                "bg-green-50 text-green-700 border border-green-200",
                                // sage green
                                "bg-pink-50 text-pink-700 border border-pink-200"
                                // soft pink
                              ];
                              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                {
                                  className: `px-2 py-0.5 ${badgeColors[idx % badgeColors.length]} text-xs rounded-full font-medium`,
                                  children: tag.replace("_", " ")
                                },
                                tag
                              );
                            }),
                            dietary_tags_array.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 bg-kake-cream-100 text-kake-chocolate-400 border border-kake-cream-200 text-xs rounded-full font-medium", children: [
                              "+",
                              dietary_tags_array.length - 2
                            ] })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mt-auto pt-3 border-t border-kake-cream-200", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold text-kake-chocolate-500", children: [
                              "€",
                              product.price.toFixed(2)
                            ] }),
                            product.compare_at_price && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-kake-chocolate-300 line-through", children: [
                              "€",
                              product.compare_at_price.toFixed(2)
                            ] })
                          ] }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Link,
                            {
                              to: is_out_of_stock ? "#" : `/location/${location_slug}/product/${product.product_id}`,
                              className: `px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center justify-center whitespace-nowrap min-h-[44px] ${is_out_of_stock ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-kake-caramel-500 text-white hover:bg-kake-caramel-600 shadow-caramel hover:shadow-caramel-lg active:scale-95"}`,
                              onClick: (e) => {
                                if (is_out_of_stock) {
                                  e.preventDefault();
                                }
                              },
                              children: is_out_of_stock ? "Out of Stock" : "Select"
                            }
                          )
                        ] })
                      ] })
                    ]
                  },
                  product.product_id
                );
              })
            }
          ),
          total_pages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => goToPage(pagination_state.current_page - 1),
                disabled: !has_previous,
                className: "px-4 py-2 bg-white border border-kake-cream-300 rounded-xl text-sm font-medium text-kake-chocolate-500 hover:bg-kake-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: "Previous"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-1", children: Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
              let page_num;
              if (total_pages <= 5) {
                page_num = i + 1;
              } else if (pagination_state.current_page <= 3) {
                page_num = i + 1;
              } else if (pagination_state.current_page >= total_pages - 2) {
                page_num = total_pages - 4 + i;
              } else {
                page_num = pagination_state.current_page - 2 + i;
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => goToPage(page_num),
                  className: `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${pagination_state.current_page === page_num ? "bg-kake-caramel-500 text-white shadow-caramel" : "bg-white border border-kake-cream-300 text-kake-chocolate-500 hover:bg-kake-cream-50"}`,
                  children: page_num
                },
                page_num
              );
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => goToPage(pagination_state.current_page + 1),
                disabled: !has_next,
                className: "px-4 py-2 bg-white border border-kake-cream-300 rounded-xl text-sm font-medium text-kake-chocolate-500 hover:bg-kake-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: "Next"
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
};
export {
  UV_Menu as default
};
