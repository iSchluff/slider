import _ from "underscore";
import {BaseSlider} from "./Base";
import {add as addTouch} from "./Touch";

// Single Element Slider
class ResponsiveSlider extends BaseSlider{
  constructor(container, config){

    // default config values
    let options= _.extend({
      transitionTime: 0.7,
      disableScroll: false,
      endless: true,
    }, config);

    super(container, options);
    addTouch(this);

    this.updateWidths();

    let style= this.element.style;
    style.webkitBackfaceVisibility =
    style.msBackfaceVisibility =
    style.mozBackfaceVisibility =
    style.backfaceVisibility = "hidden";

    this.triggerUpdate();
    container.style.visibility = "visible";
  }

  updateWidths(){
    // scale parent element
    this.element.style.width= (this.length * 100) + "%";

    // scale slide elements
    for(let i=0; i<this.length; i++){
      this.slides[i].style.width= (100 / this.length) + "%";
    }
  }

  update(){
    super.update();
    this.updateWidths();
  }

  // create animation function
  // @override moves the slider to current index + offset
  translate(diff, time){
    if(this.browser.transforms){
      let relativeDiff= diff !== 0 ? this.width / diff : 0;
      TweenLite.to(this.element, time, {xPercent: -(100 / this.length * (this.index + relativeDiff)) + "%", ease:Power3.easeOut});
    }else{
      TweenLite.to(this.element, time, {left: -(100 * this.index) + "%", ease:Power3.easeOut});
    }
  }
}

export {ResponsiveSlider}
