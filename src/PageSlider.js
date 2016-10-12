import _ from "underscore";
import {BaseSlider} from "./Base";
import {add as addTouch} from "./Touch";

// Multi Element Slider -> page Slider
class PageSlider extends BaseSlider{
  constructor(container, config){

    // default config values
    let options= _.extend({
      transitionTime: 0.7,
      disableScroll: false,
      breakpoints: [0, 480, 1050, 1200, 1600],
      pages: [1, 2, 3, 4, 5],
      pageGutter: 8, //percentage Value
      verticalBreakpoints: [0, 500],
      verticalPages: [1, 2],
      verticalPageGutter: 2,
      endless: false,
    }, config);

    super(container, options);
    addTouch(this);

    this.pageElements= 0;
    this.containerWidth= container.offsetWidth;
    this.containerHeight= container.offsetHeight;

    let style= this.element.style;
    style.webkitBackfaceVisibility =
    style.msBackfaceVisibility =
    style.mozBackfaceVisibility =
    style.backfaceVisibility = "hidden";

    // keep translation constant on resize
    let debounced= _.debounce(this.updatePages, 150).bind(this);
    window.addEventListener("resize", function(){
      this.translate(0,0);
      debounced();
    }.bind(this));

    this.updatePages();
    container.style.visibility = "visible";
  }

  update(vertical, index){
    super.update();
    this.updatePages(true, vertical, index);
  }

  // create animation function
  // @override moves the slider to current index + offset
  translate(diff, time){
    if(this.browser.transforms){
      let dynamicValue= "0%",
      dynamicProperty= this.vertical ? "yPercent" : "xPercent",
      staticProperty= this.vertical ? "x" : "y";
      if(this.length > 0){
        dynamicValue= -(100/this.length * this.index) + "%";
      }
      TweenLite.to(this.element, time, {
        [dynamicProperty]: dynamicValue,
        [staticProperty]: 0,
        ease: Power3.easeOut
      });
    }else{
      let dynamicProperty= this.vertical ? "top" : "left";
      let staticProperty= this.vertical ? "left" : "top";
      TweenLite.to(this.element, time, {
        [dynamicProperty]: -(100 * this.index) + "%",
        [staticProperty]: 0,
        ease: Power3.easeOut
      });
    }
  }

  getUpdateParameters(){
    return {
      pageSize: this.pageElements
    };
  }

  getPageElementCount(){
    let size= this[this.vertical ? "containerHeight" : "containerWidth"],
    breakpoints= this.options[this.vertical ? "verticalBreakpoints" : "breakpoints"],
    pages= this.options[this.vertical ? "verticalPages" : "pages"];

    for(let i= breakpoints.length; i >= 0; i--){
      if(size >= breakpoints[i]){
        return pages[i];
      }
    }
  }

  updatePages(reset, vertical, index){
    this.containerWidth= this.container.offsetWidth;
    this.containerHeight= this.container.offsetHeight;

    let saveIndex= this.pageElements * (index || this.index);
    let newPageElements= this.getPageElementCount();
    vertical= vertical === undefined ? this.vertical : vertical;

    // don't reposition Elements if not necessary
    if(!reset && newPageElements === this.pageElements && vertical === this.vertical){
      return;
    }

    this.pageElements= newPageElements;
    this.length= Math.ceil(this.slides.length / this.pageElements);
    this.index= Math.floor(Math.min(saveIndex, this.slides.length - 1) / this.pageElements);

    let dynamicProperty= vertical ? "height" : "width",
    staticProperty= vertical ? "width" : "height",
    gutter= this.options[vertical ? "verticalPageGutter" : "pageGutter"],
    dynamicValue= "0%",
    border= 0;

    // scale parent element
    this.element.style[dynamicProperty]= (this.length * 100) + "%";
    this.element.style[staticProperty]= "100%";

    // scale slide elements
    if(this.length){
      dynamicValue= (100 - gutter * 2) / (this.length * this.pageElements) + "%";
    }
    for(let i= 0; i<this.slides.length; i++){
      let slide= this.slides[i];
      slide.style[dynamicProperty]= dynamicValue;
      slide.style[staticProperty]= "100%";

      if(vertical){
        let currentBorder;
        if(i === 0){
          border+= gutter / this.length;
        }else if(i % this.pageElements === 0){
          border+= (gutter / this.length) * 2;
        }
        slide.style.top= border + "%";
      }else{
        if(i === 0){
          slide.style.marginLeft= gutter / this.length + "%";
        }else if(i % this.pageElements === 0){
          slide.style.marginLeft= (gutter / this.length) * 2 + "%";
        }else{
          slide.style.marginLeft= "";
        }
      }
    }
    this.vertical= vertical;
    this.translate(0, 0);
    this.triggerUpdate({pageSize: this.pageElements});
  }
}

export {PageSlider}
