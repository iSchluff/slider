import _ from "underscore";
import {BaseSlider} from "./Base";
import {add as addTouch} from "./Touch";

class Carousel extends BaseSlider {
  constructor(container, config) {

    // default config values
    var options= _.extend({
      transitionTime: 0.5,
      disableScroll: true
    }, config);

    super(container, options);
    // addTouch(this);
    this.updateWidths();

    let style = this.element.style;
    style.webkitBackfaceVisibility =
    style.msBackfaceVisibility =
    style.mozBackfaceVisibility =
    style.backfaceVisibility = "hidden";

    // show first slide
    this.active = {};
    if (this.length > 0) {
      this.active = {index: this.index, slide: this.slides[this.index]};
      this.active.slide.style.opacity = "1";
      this.active.slide.style.zIndex = "5";
    }

    this.triggerUpdate();
    container.style.visibility = "visible";
  }

  updateWidths() {
    // scale parent element
    this.element.style.width = (this.length * 100) + "%";

    // scale slide elements
    for(let i = 0; i < this.length; i++) {
      this.slides[i].style.width= (100 / this.length) + "%";

      if (this.browser.transforms && !this.browser.isSafari) {
        this.slides[i].style.transform = `translate3d(-${(i * 100)}%, 0, 0)`;
      } else {
        this.slides[i].style.left = -(i * 100 / this.length) + "%";
      }
    }
  }

  update() {
    super.update();
    // this.updateWidths();
  }

  // create animation function
  // @override moves the slider to current index + offset
  translate(diff, time) {
    if (this.index == this.active.index)
      return;

    // prepare next slide
    const current = this.active.slide;
    const next = this.slides[this.index];
    TweenLite.to(next, 0, {zIndex: 5, opacity: 0});

    const hideCurrent = function() {
      if (current){
        current.style.zIndex = "";
        current.style.opacity = "";
      }

      this.active = {slide: next, index: this.index};
    }.bind(this)

    // on transition end, layer next slide on top
    TweenLite.to(next, time, {
      opacity: 1,
      overwrite: "none",
      onComplete: hideCurrent
    });
  }
}

export {Carousel}
