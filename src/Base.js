/*
* html structure:
*   .slider
*     .slider-wrap
*       div
*       div
*       div
*
* parameters:
*   container - html node
*   options - slider options
*
*/

import _ from "underscore";

// check browser capabilities
const browser = {
  addEventListener: !!window.addEventListener,
  touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  transforms: ((temp) => {
    const props = ['transform', 'msTransform', 'MozTransform', 'OTransform', 'WebkitTransform'];
    for (let i in props){
      if (temp.style[props[i]] !== undefined){
        return true;
      }
    }
    return false;
  })(document.createElement('swipe'))
};
// console.log("Browser Transform Support:", browser.transforms);


// CustomEvent Constructor Shim for IE9
function CustomEvent ( event, params ) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  let evt = document.createEvent( 'CustomEvent' );
  evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
  return evt;
}
CustomEvent.prototype = window.Event.prototype;


// Slider Base Module
export class BaseSlider {
  constructor(container, options) {
    this.container = container;
    this.options = options;
    this.index = 0;

    // set up self-referencing members
    this.element = this.container.children[0];
    this.slides = this.element.children;
    this.length = this.slides.length;
    this.width = this.container.offsetWidth;
    this.browser = browser;

    // update width
    window.addEventListener("resize", _.throttle(() => this.width= window.innerWidth, 180));

    // sanity check
    // if(this.width === 0){
    //   console.error("Slider Error: Container width is 0. The Element should not be hidden!");
    // }
  }

  update(trigger = false) {
    this.slides = this.element.children;
    this.length = this.slides.length;
    this.index = Math.max(Math.min(this.index, this.length - 1), 0);
    if(trigger)
      this.triggerUpdate();
  }

  // animate to index
  animate(to, time) {
    this.index = to;
    this.translate(0, time);
    this.triggerUpdate();
  }

  // create DOM CustomEvent
  triggerUpdate() {
    let detail = _.extend({
      index: this.index,
      length: this.length,
      left: (this.index === 0),
      right: (this.index === this.length-1)
    }, this.getUpdateParameters ? this.getUpdateParameters() : undefined);
    let event = new CustomEvent("update", {detail});
    this.container.dispatchEvent(event);
  }

  // unimplemented translate(diff, time)
  translate(){}

  goTo(to) {
    if (to >= 0 && to < this.length) {
      this.animate(+to, this.options.transitionTime);
    } else if(this.options.endless) {
      to = (+to + this.length) % this.length;
      this.animate(to, this.options.transitionTime);
    }
  }

  next() {
    this.goTo(this.index+1);
  }

  prev() {
    this.goTo(this.index-1);
  }
}
