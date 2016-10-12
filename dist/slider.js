import 'gsap/src/uncompressed/TweenLite';
import 'gsap/src/uncompressed/plugins/CSSPlugin';
import _ from 'underscore';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

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

// check browser capabilities
var browser = {
  addEventListener: !!window.addEventListener,
  touch: 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch,
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  transforms: function (temp) {
    var props = ['transform', 'msTransform', 'MozTransform', 'OTransform', 'WebkitTransform'];
    for (var i in props) {
      if (temp.style[props[i]] !== undefined) {
        return true;
      }
    }
    return false;
  }(document.createElement('swipe'))
};
// console.log("Browser Transform Support:", browser.transforms);


// CustomEvent Constructor Shim for IE9
function CustomEvent(event, params) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  var evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
  return evt;
}
CustomEvent.prototype = window.Event.prototype;

// Slider Base Module
var BaseSlider = function () {
  function BaseSlider(container, options) {
    var _this = this;

    classCallCheck(this, BaseSlider);

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
    window.addEventListener("resize", _.throttle(function () {
      return _this.width = window.innerWidth;
    }, 180));

    // sanity check
    // if(this.width === 0){
    //   console.error("Slider Error: Container width is 0. The Element should not be hidden!");
    // }
  }

  createClass(BaseSlider, [{
    key: 'update',
    value: function update() {
      var trigger = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this.slides = this.element.children;
      this.length = this.slides.length;
      this.index = Math.max(Math.min(this.index, this.length - 1), 0);
      if (trigger) this.triggerUpdate();
    }

    // animate to index

  }, {
    key: 'animate',
    value: function animate(to, time) {
      this.index = to;
      this.translate(0, time);
      this.triggerUpdate();
    }

    // create DOM CustomEvent

  }, {
    key: 'triggerUpdate',
    value: function triggerUpdate() {
      var detail = _.extend({
        index: this.index,
        length: this.length,
        left: this.index === 0,
        right: this.index === this.length - 1
      }, this.getUpdateParameters ? this.getUpdateParameters() : undefined);
      var event = new CustomEvent("update", { detail: detail });
      this.container.dispatchEvent(event);
    }

    // unimplemented translate(diff, time)

  }, {
    key: 'translate',
    value: function translate() {}
  }, {
    key: 'goTo',
    value: function goTo(to) {
      if (to >= 0 && to < this.length) {
        this.animate(+to, this.options.transitionTime);
      } else if (this.options.endless) {
        to = (+to + this.length) % this.length;
        this.animate(to, this.options.transitionTime);
      }
    }
  }, {
    key: 'next',
    value: function next() {
      this.goTo(this.index + 1);
    }
  }, {
    key: 'prev',
    value: function prev() {
      this.goTo(this.index - 1);
    }
  }]);
  return BaseSlider;
}();

// adds touch events to slider object
var addTouch = function addTouch(that) {

  // event lets
  var start = {};
  var delta = {};
  var isScrolling = void 0;

  var onStart = function onStart(event) {
    var touches = event.touches[0];

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

  var onMove = function onMove(event) {
    // ensure swiping with one touch and not pinching
    if (event.touches.length > 1 || event.scale && event.scale !== 1) {
      return;
    }

    var touches = event.touches[0];

    // measure change in x and y
    delta = {
      x: touches.pageX - start.x,
      y: touches.pageY - start.y
    };

    // determine if scrolling test has run - one time test
    if (typeof isScrolling === 'undefined') {
      isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
    }

    // if user is not trying to scroll vertically
    if (!isScrolling) {

      // prevent native scrolling
      event.preventDefault();

      // increase resistance if first or last slide
      delta.x = delta.x / (!that.index && delta.x > 0 || // if first slide and sliding left
      that.index === length - 1 && // or if last slide and sliding right
      delta.x < 0 // and if sliding at all
      ? Math.abs(delta.x) / that.width + 1 : // determine resistance level
      1); // no resistance if false

      // translate 1:1
      that.translate(delta.x, 0);
    }
  };

  var onEnd = function onEnd() {
    var duration = +new Date() - start.time;

    // determine if slide attempt triggers next/prev slide
    var isValidSlide = Number(duration) < 250 && // if slide duration is less than 250ms
    Math.abs(delta.x) > 20 || // and if slide amt is greater than 20px
    Math.abs(delta.x) > that.width / 2; // or if slide amt is greater than half the width

    // determine if slide attempt is past start and end
    var isPastBounds = !that.index && delta.x > 0 || // if first slide and slide amt is greater than 0
    that.index === that.length - 1 && delta.x < 0; // or if last slide and slide amt is less than 0

    // if not scrolling vertically
    if (!isScrolling) {
      if (isValidSlide && !isPastBounds) {
        //determine direction
        if (delta.x < 0) {
          that.animate(that.index + 1, that.options.transitionTime);
        } else {
          that.animate(that.index - 1, that.options.transitionTime);
        }

        // snap back to current slide
      } else {
        that.animate(that.index, that.options.transitionTime);
      }
    }

    // kill touchmove and touchend event listeners until touchstart called again
    that.element.removeEventListener('touchmove', that.handleTouch, false);
    that.element.removeEventListener('touchend', that.handleTouch, false);
  };

  // setup event capturing
  that.handleTouch = function (event) {
    switch (event.type) {
      case 'touchstart':
        onStart(event);break;
      case 'touchmove':
        onMove(event);break;
      case 'touchend':
        onEnd(event);break;
    }
  };

  // Create Event listener
  if (that.browser.addEventListener && that.browser.touch) {
    that.element.addEventListener('touchstart', that.handleTouch, false);
  }

  return that;
};

var Carousel = function (_BaseSlider) {
  inherits(Carousel, _BaseSlider);

  function Carousel(container, config) {
    classCallCheck(this, Carousel);


    // default config values
    var options = _.extend({
      transitionTime: 0.5,
      disableScroll: true
    }, config);

    // addTouch(this);
    var _this = possibleConstructorReturn(this, (Carousel.__proto__ || Object.getPrototypeOf(Carousel)).call(this, container, options));

    _this.updateWidths();

    var style = _this.element.style;
    style.webkitBackfaceVisibility = style.msBackfaceVisibility = style.mozBackfaceVisibility = style.backfaceVisibility = "hidden";

    // show first slide
    _this.active = {};
    if (_this.length > 0) {
      _this.active = { index: _this.index, slide: _this.slides[_this.index] };
      _this.active.slide.style.opacity = "1";
      _this.active.slide.style.zIndex = "5";
    }

    _this.triggerUpdate();
    container.style.visibility = "visible";
    return _this;
  }

  createClass(Carousel, [{
    key: "updateWidths",
    value: function updateWidths() {
      // scale parent element
      this.element.style.width = this.length * 100 + "%";

      // scale slide elements
      for (var i = 0; i < this.length; i++) {
        this.slides[i].style.width = 100 / this.length + "%";

        if (this.browser.transforms && !this.browser.isSafari) {
          this.slides[i].style.transform = "translate3d(-" + i * 100 + "%, 0, 0)";
        } else {
          this.slides[i].style.left = -(i * 100 / this.length) + "%";
        }
      }
    }
  }, {
    key: "update",
    value: function update() {
      get(Carousel.prototype.__proto__ || Object.getPrototypeOf(Carousel.prototype), "update", this).call(this);
      // this.updateWidths();
    }

    // create animation function
    // @override moves the slider to current index + offset

  }, {
    key: "translate",
    value: function translate(diff, time) {
      if (this.index == this.active.index) return;

      // prepare next slide
      var current = this.active.slide;
      var next = this.slides[this.index];
      TweenLite.to(next, 0, { zIndex: 5, opacity: 0 });

      var hideCurrent = function () {
        if (current) {
          current.style.zIndex = "";
          current.style.opacity = "";
        }

        this.active = { slide: next, index: this.index };
      }.bind(this);

      // on transition end, layer next slide on top
      TweenLite.to(next, time, {
        opacity: 1,
        overwrite: "none",
        onComplete: hideCurrent
      });
    }
  }]);
  return Carousel;
}(BaseSlider);

/* eslint-disable */
// Single Element Slider

var AjaxSlider = function (_BaseSlider) {
  inherits(AjaxSlider, _BaseSlider);

  function AjaxSlider(container, config) {
    classCallCheck(this, AjaxSlider);

    // default config values
    var options = _.extend({
      transitionTime: 0.7,
      disableScroll: false,
      endless: true,
      template: "",
      index: 0
    }, config);

    var _this = possibleConstructorReturn(this, (AjaxSlider.__proto__ || Object.getPrototypeOf(AjaxSlider)).call(this, container, options));

    addTouch(_this);

    // get Slide Data
    var slides = window[$(_this.element).data("let")];
    if (!slides) {
      var _ret;

      return _ret = console.error("data-let not defined on slider-wrap"), possibleConstructorReturn(_this, _ret);
    }

    // Render Slide Items
    if (options.template === "") {
      var _ret2;

      return _ret2 = console.error("slider item template not specified"), possibleConstructorReturn(_this, _ret2);
    }

    var sliderHTML = "";
    for (var i = 0; i < slides.length; i++) {
      sliderHTML += "<li>";
      if (i !== options.index) {
        slides[i].partial = true;
      } else {
        slides[i].partial = false;
        sliderHTML += options.template(slides[i]);
      }
      slides[i].position = -1;
      sliderHTML += "</li>";
    }

    _this.element.innerHTML = sliderHTML;
    _this.slides = _this.element.children;
    _this.length = _this.slides.length;
    return _this;
  }

  // complete slide at index if partial


  createClass(AjaxSlider, [{
    key: "loadSlide",
    value: function loadSlide(index) {
      if (index > 0 && index < this.length && slides[index].partial) {
        slides[index].partial = false;
        this.slides[index].innerHTML = options.template(slides[index]);
        console.log("loading", index);
      }
    }
  }, {
    key: "positionSlide",
    value: function positionSlide(i, current, time, diff) {
      // left
      if (i < current && (i !== 0 || current !== this.length - 1) || i > current && i === this.length - 1 && current === 0) {
        this.slides[i].position = -1;
        // middle
      } else if (i === current) {
        this.slides[i].position = 0;
        // right
      } else {
        this.slides[i].position = 1;
      }

      var pos = -((i - this.slides[i].position) * 100 / this.length);
      if (this.browser.transforms) {
        var absolutePos = this.width * pos * this.length / 100;
        return TweenLite.to(this.slides[i], time, { x: absolutePos + diff, onComplete: function onComplete() {
            animating = null;
          } });
      } else {
        return TweenLite.to(this.slides[i], time, { left: pos + "%", onComplete: function onComplete() {
            animating = null;
          } });
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

  }]);
  return AjaxSlider;
}(BaseSlider);

// Multi Element Slider -> page Slider

var PageSlider = function (_BaseSlider) {
  inherits(PageSlider, _BaseSlider);

  function PageSlider(container, config) {
    classCallCheck(this, PageSlider);


    // default config values
    var options = _.extend({
      transitionTime: 0.7,
      disableScroll: false,
      breakpoints: [0, 480, 1050, 1200, 1600],
      pages: [1, 2, 3, 4, 5],
      pageGutter: 8, //percentage Value
      verticalBreakpoints: [0, 500],
      verticalPages: [1, 2],
      verticalPageGutter: 2,
      endless: false
    }, config);

    var _this = possibleConstructorReturn(this, (PageSlider.__proto__ || Object.getPrototypeOf(PageSlider)).call(this, container, options));

    addTouch(_this);

    _this.pageElements = 0;
    _this.containerWidth = container.offsetWidth;
    _this.containerHeight = container.offsetHeight;

    var style = _this.element.style;
    style.webkitBackfaceVisibility = style.msBackfaceVisibility = style.mozBackfaceVisibility = style.backfaceVisibility = "hidden";

    // keep translation constant on resize
    var debounced = _.debounce(_this.updatePages, 150).bind(_this);
    window.addEventListener("resize", function () {
      this.translate(0, 0);
      debounced();
    }.bind(_this));

    _this.updatePages();
    container.style.visibility = "visible";
    return _this;
  }

  createClass(PageSlider, [{
    key: "update",
    value: function update(vertical, index) {
      get(PageSlider.prototype.__proto__ || Object.getPrototypeOf(PageSlider.prototype), "update", this).call(this);
      this.updatePages(true, vertical, index);
    }

    // create animation function
    // @override moves the slider to current index + offset

  }, {
    key: "translate",
    value: function translate(diff, time) {
      if (this.browser.transforms) {
        var _TweenLite$to;

        var dynamicValue = "0%",
            dynamicProperty = this.vertical ? "yPercent" : "xPercent",
            staticProperty = this.vertical ? "x" : "y";
        if (this.length > 0) {
          dynamicValue = -(100 / this.length * this.index) + "%";
        }
        TweenLite.to(this.element, time, (_TweenLite$to = {}, defineProperty(_TweenLite$to, dynamicProperty, dynamicValue), defineProperty(_TweenLite$to, staticProperty, 0), defineProperty(_TweenLite$to, "ease", Power3.easeOut), _TweenLite$to));
      } else {
        var _TweenLite$to2;

        var _dynamicProperty = this.vertical ? "top" : "left";
        var _staticProperty = this.vertical ? "left" : "top";
        TweenLite.to(this.element, time, (_TweenLite$to2 = {}, defineProperty(_TweenLite$to2, _dynamicProperty, -(100 * this.index) + "%"), defineProperty(_TweenLite$to2, _staticProperty, 0), defineProperty(_TweenLite$to2, "ease", Power3.easeOut), _TweenLite$to2));
      }
    }
  }, {
    key: "getUpdateParameters",
    value: function getUpdateParameters() {
      return {
        pageSize: this.pageElements
      };
    }
  }, {
    key: "getPageElementCount",
    value: function getPageElementCount() {
      var size = this[this.vertical ? "containerHeight" : "containerWidth"],
          breakpoints = this.options[this.vertical ? "verticalBreakpoints" : "breakpoints"],
          pages = this.options[this.vertical ? "verticalPages" : "pages"];

      for (var i = breakpoints.length; i >= 0; i--) {
        if (size >= breakpoints[i]) {
          return pages[i];
        }
      }
    }
  }, {
    key: "updatePages",
    value: function updatePages(reset, vertical, index) {
      this.containerWidth = this.container.offsetWidth;
      this.containerHeight = this.container.offsetHeight;

      var saveIndex = this.pageElements * (index || this.index);
      var newPageElements = this.getPageElementCount();
      vertical = vertical === undefined ? this.vertical : vertical;

      // don't reposition Elements if not necessary
      if (!reset && newPageElements === this.pageElements && vertical === this.vertical) {
        return;
      }

      this.pageElements = newPageElements;
      this.length = Math.ceil(this.slides.length / this.pageElements);
      this.index = Math.floor(Math.min(saveIndex, this.slides.length - 1) / this.pageElements);

      var dynamicProperty = vertical ? "height" : "width",
          staticProperty = vertical ? "width" : "height",
          gutter = this.options[vertical ? "verticalPageGutter" : "pageGutter"],
          dynamicValue = "0%",
          border = 0;

      // scale parent element
      this.element.style[dynamicProperty] = this.length * 100 + "%";
      this.element.style[staticProperty] = "100%";

      // scale slide elements
      if (this.length) {
        dynamicValue = (100 - gutter * 2) / (this.length * this.pageElements) + "%";
      }
      for (var i = 0; i < this.slides.length; i++) {
        var slide = this.slides[i];
        slide.style[dynamicProperty] = dynamicValue;
        slide.style[staticProperty] = "100%";

        if (vertical) {
          var currentBorder = void 0;
          if (i === 0) {
            border += gutter / this.length;
          } else if (i % this.pageElements === 0) {
            border += gutter / this.length * 2;
          }
          slide.style.top = border + "%";
        } else {
          if (i === 0) {
            slide.style.marginLeft = gutter / this.length + "%";
          } else if (i % this.pageElements === 0) {
            slide.style.marginLeft = gutter / this.length * 2 + "%";
          } else {
            slide.style.marginLeft = "";
          }
        }
      }
      this.vertical = vertical;
      this.translate(0, 0);
      this.triggerUpdate({ pageSize: this.pageElements });
    }
  }]);
  return PageSlider;
}(BaseSlider);

// Single Element Slider

var ResponsiveSlider = function (_BaseSlider) {
  inherits(ResponsiveSlider, _BaseSlider);

  function ResponsiveSlider(container, config) {
    classCallCheck(this, ResponsiveSlider);


    // default config values
    var options = _.extend({
      transitionTime: 0.7,
      disableScroll: false,
      endless: true
    }, config);

    var _this = possibleConstructorReturn(this, (ResponsiveSlider.__proto__ || Object.getPrototypeOf(ResponsiveSlider)).call(this, container, options));

    addTouch(_this);

    _this.updateWidths();

    var style = _this.element.style;
    style.webkitBackfaceVisibility = style.msBackfaceVisibility = style.mozBackfaceVisibility = style.backfaceVisibility = "hidden";

    _this.triggerUpdate();
    container.style.visibility = "visible";
    return _this;
  }

  createClass(ResponsiveSlider, [{
    key: "updateWidths",
    value: function updateWidths() {
      // scale parent element
      this.element.style.width = this.length * 100 + "%";

      // scale slide elements
      for (var i = 0; i < this.length; i++) {
        this.slides[i].style.width = 100 / this.length + "%";
      }
    }
  }, {
    key: "update",
    value: function update() {
      get(ResponsiveSlider.prototype.__proto__ || Object.getPrototypeOf(ResponsiveSlider.prototype), "update", this).call(this);
      this.updateWidths();
    }

    // create animation function
    // @override moves the slider to current index + offset

  }, {
    key: "translate",
    value: function translate(diff, time) {
      if (this.browser.transforms) {
        var relativeDiff = diff !== 0 ? this.width / diff : 0;
        TweenLite.to(this.element, time, { xPercent: -(100 / this.length * (this.index + relativeDiff)) + "%", ease: Power3.easeOut });
      } else {
        TweenLite.to(this.element, time, { left: -(100 * this.index) + "%", ease: Power3.easeOut });
      }
    }
  }]);
  return ResponsiveSlider;
}(BaseSlider);

// needs TweenLite with cssplugin

export { BaseSlider, Carousel, AjaxSlider, PageSlider, ResponsiveSlider };

//# sourceMappingURL=slider.js.map