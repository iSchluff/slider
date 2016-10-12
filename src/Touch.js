// adds touch events to slider object
let addTouch= function(that){

  // event lets
  let start = {};
  let delta = {};
  let isScrolling;

  let onStart= function(event){
    let touches = event.touches[0];

    // initial position and time
    start = {
      x: touches.pageX,
      y: touches.pageY,
      time: +new Date()
    };

    // used for testing first move event
    isScrolling = undefined;

    // reset delta and end measurements
    delta = {
      x: 0,
      y: 0
    };

    // attach touchmove and touchend listeners
    that.element.addEventListener('touchmove', that.handleTouch, false);
    that.element.addEventListener('touchend', that.handleTouch, false);
  };

  let onMove= function(event){
    // ensure swiping with one touch and not pinching
    if ( event.touches.length > 1 || event.scale && event.scale !== 1){ return; }

    let touches = event.touches[0];

    // measure change in x and y
    delta = {
      x: touches.pageX - start.x,
      y: touches.pageY - start.y
    };

    // determine if scrolling test has run - one time test
    if ( typeof isScrolling === 'undefined') {
      isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
    }

    // if user is not trying to scroll vertically
    if (!isScrolling) {

      // prevent native scrolling
      event.preventDefault();

      // increase resistance if first or last slide
      delta.x =
      delta.x /
      ( (!that.index && delta.x > 0 ||         // if first slide and sliding left
        that.index === length - 1 &&    // or if last slide and sliding right
        delta.x < 0                      // and if sliding at all
      ) ?
      ( Math.abs(delta.x) / that.width + 1 )   // determine resistance level
      : 1 );                              // no resistance if false

      // translate 1:1
      that.translate(delta.x, 0);
    }
  };

  let onEnd= function(){
    let duration = +new Date() - start.time;

    // determine if slide attempt triggers next/prev slide
    let isValidSlide =
    Number(duration) < 250 &&         // if slide duration is less than 250ms
    Math.abs(delta.x) > 20 ||        // and if slide amt is greater than 20px
    Math.abs(delta.x) > that.width/2;     // or if slide amt is greater than half the width

    // determine if slide attempt is past start and end
    let isPastBounds =
    !that.index && delta.x > 0 ||                      // if first slide and slide amt is greater than 0
    that.index === that.length - 1 && delta.x < 0;   // or if last slide and slide amt is less than 0

    // if not scrolling vertically
    if (!isScrolling) {
      if (isValidSlide && !isPastBounds) {
        //determine direction
        if(delta.x < 0){
          that.animate(that.index +1, that.options.transitionTime);
        }else{
          that.animate(that.index -1, that.options.transitionTime);
        }

        // snap back to current slide
      }else{
        that.animate(that.index, that.options.transitionTime);
      }
    }

    // kill touchmove and touchend event listeners until touchstart called again
    that.element.removeEventListener('touchmove', that.handleTouch, false);
    that.element.removeEventListener('touchend', that.handleTouch, false);
  };

  // setup event capturing
  that.handleTouch= function(event){
    switch (event.type) {
      case 'touchstart': onStart(event); break;
      case 'touchmove': onMove(event); break;
      case 'touchend': onEnd(event); break;
    }
  };

  // Create Event listener
  if(that.browser.addEventListener && that.browser.touch){
    that.element.addEventListener('touchstart', that.handleTouch, false);
  }

  return that;
};

// unbinds touch event handlers and removes touch property
let removeTouch= function(that){
  if(that.browser.addEventListener && that.browser.touch){
    that.element.removeEventListener('touchstart', that.handleTouch, false);
  }

  delete that.handleTouch;
  return that;
};

export {addTouch as add};
export {removeTouch as remove};
