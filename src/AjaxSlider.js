/* eslint-disable */
import _ from "underscore";
import {BaseSlider} from "./Base";
import {add as addTouch} from "./Touch";

// Single Element Slider
class AjaxSlider extends BaseSlider{
  constructor(container, config){
    // default config values
    let options= _.extend({
      transitionTime: 0.7,
      disableScroll: false,
      endless: true,
      template: "",
      index: 0,
    }, config);

    super(container, options);
    addTouch(this);

    // get Slide Data
    let slides= window[$(this.element).data("let")];
    if(!slides){
      return console.error("data-let not defined on slider-wrap");
    }

    // Render Slide Items
    if(options.template === ""){
      return console.error("slider item template not specified");
    }

    let sliderHTML= "";
    for(let i=0; i < slides.length; i++){
      sliderHTML+= "<li>";
      if(i !== options.index){
        slides[i].partial= true;
      }else{
        slides[i].partial= false;
        sliderHTML+= options.template(slides[i]);
      }
      slides[i].position= -1;
      sliderHTML+="</li>";
    }

    this.element.innerHTML= sliderHTML;
    this.slides= this.element.children;
    this.length= this.slides.length;
  }

  // complete slide at index if partial
  loadSlide(index){
    if(index>0 && index<this.length && slides[index].partial){
      slides[index].partial= false;
      this.slides[index].innerHTML= options.template(slides[index]);
      console.log("loading", index);
    }
  }

  positionSlide(i, current, time, diff){
    // left
    if(i < current && (i !== 0 || current !== this.length-1) ||
       i > current && (i === this.length-1 && current === 0)){
      this.slides[i].position= -1;
    // middle
    }else if(i === current){
      this.slides[i].position= 0;
    // right
    }else{
      this.slides[i].position= 1;
    }

    let pos= -((i-this.slides[i].position)*100/this.length);
    if(this.browser.transforms){
      let absolutePos= this.width*pos*this.length/100;
      return TweenLite.to(this.slides[i], time, {x: absolutePos + diff, onComplete: function(){
        animating= null;
      }});
    }else{
      return TweenLite.to(this.slides[i], time, {left: pos + "%", onComplete: function(){
        animating= null;
      }});
    }
  }

  // TODO: port to new classes
  // //apply initial styles
  // for(let i=0; i<this.length; i++){
  //   positionSlide(i, options.index, 0, 0);
  // }
  //
  // // @override animation function
  // this.animate= function(to, time){
  //   let direction= 0;
  //   if((to > this.index && (this.index !== 0 || to !== this.length-1)) ||
  //      (to < this.index && (this.index === this.length-1 && to === 0))){
  //     direction= 1;
  //   }else{
  //     direction= -1;
  //   }
  //
  //   loadSlide(to);
  //   this.translate(0, time, direction);
  //
  //   this.index= to;
  //   this.container.trigger("update", {
  //     index: this.index,
  //     length: this.length,
  //     left: (this.index === 0),
  //     right: (this.index === this.length-1)
  //   });
  // };
  //
  // let parseTransformMatrix= function(string){
  //   let inner= string.match(/\((.*)\)/)[1];
  //   let parsed= inner.split(",");
  //   for(let i=0; i<parsed.length; i++){
  //     parsed[i]= Number(parsed[i]);
  //   }
  //   return parsed;
  // }
  //
  // // @override translate: moves the slider to current index + offset
  // this.translate = function(diff, time, direction){
  //   direction= direction || Math.sign(diff);
  //   let index= this.index;
  //   let nextIndex= (index + direction + this.length) % this.length;
  //
  //   if(animating){
  //     let pos= -this.width*index;
  //     let val= parseTransformMatrix(this.slides[index].style.transform)[4];
  //
  //     console.log("still animating next", animating.tween.duration()- animating.tween.time());
  //     positionSlide(animating.prev, animating.next, 0, 0);
  //     positionSlide(nextIndex, index, 0, (val-pos)*0.5);
  //
  //   }else if(this.slides[nextIndex].position !== direction){
  //     positionSlide(nextIndex, index, 0, 0);
  //   };
  //
  //
  //
  //   positionSlide(index, nextIndex, time, diff);
  //   let ref= positionSlide(nextIndex, nextIndex, time, diff);
  //
  //   if(time !== 0){
  //     animating= {
  //       prev: index,
  //       next: nextIndex,
  //       direction: direction,
  //       tween: ref
  //     }
  //   }
  // };
  //
  // // scale parent element
  // this.element.style.width= (this.length * 100) + "%";
  //
  // // scale slide elements
  // for(let i=0; i < this.length; i++){
  //   let s= $(this.slides[i]);
  //   s.width((100 / this.length) + "%");
  // }
  //
  // let style= this.element.style;
  // style.webkitBackfaceVisibility=
  // style.msBackfaceVisibility=
  // style.mozBackfaceVisibility=
  // style.backfaceVisibility= "hidden";
  //
  // // keep translation constant on resize
  // $(window).resize(function(){
  //   this.width= this.container.width();
  //   for(let i=0; i<this.length; i++){
  //     positionSlide(i, this.index, 0, 0);
  //   }
  // });
  //
  // this.container.trigger("update", {
  //   index: this.index,
  //   length: this.length,
  //   left: (this.index === 0),
  //   right: (this.index === this.length-1)
  // });
  //
  // container.style.visibility= "visible";
  //
  // return this;
}

export {AjaxSlider};
