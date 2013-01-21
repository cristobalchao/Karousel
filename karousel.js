/**
 * Karousel v0.9
 * 
 *
 * Copyright (c) 2012 Cristobal Chao
 * MIT License
 **/
(function( window, $, undefined ){


    if ( !$.cssHooks ) {

        throw("jQuery 1.4.3+ is needed for this plugin to work");
        return;
    }
    
    function styleSupport( prop ) {
        var vendorProp, supportedProp,
        capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
        prefixes = [ "Moz", "Webkit", "O", "ms" ],
        newprefixes = [ "-moz-", "-webkit-", "-o-", "-ms-" ]
        div = document.createElement( "div" );

        if ( prop in div.style ) {
            supportedProp = prop;
        } else {
            for ( var i = 0; i < prefixes.length; i++ ) {
                vendorProp = prefixes[i] + capProp;
                if ( vendorProp in div.style ) {
                    supportedProp = newprefixes[i]+prop;
                    break;
                }
            }
        }

        div = null;
        $.support[ prop ] = supportedProp
        return supportedProp;
    }

    var carousel = styleSupport( "transform" );

    $.cssHooks.translate = {
        get: function( elem, computed, extra ) {
            return elem.style[ carousel ];
        },
        set: function( elem, value) {
            var _x = value[0];
            var _y = value[1];
            elem.style[ carousel ] = "translate("+_x+"px,"+_y+"px) ";
        }
    };

   

    $.fn.enableEffectTransition = function(){
        $this = this;
        $this.removeClass('notransition').addClass('transition');
        /*var _transition = 'all 800ms cubic-bezier(1, 0.835, 0, 0.945)';
        //cubic-bezier(0.99,0,0.75,0.75)
        this.css({transition:_transition});*/
        return $this;
    }

     $.fn.disableEffectTransition = function(){
        $this = this;
        $this.removeClass('transition').addClass('notransition');
        /*$this.css({transition:'none'});*/
        return $this;
    }


    Array.prototype.iniArrayPositions = function(){
        var j = $karousel.numElemToMove*-1;
        for (var i=0;i<$karousel.totalElements;i++) {
            this.push(j++*$karousel.displayElement);
        }
    }

    Array.prototype.iniArraySlider = function(){
        for (i=0;i<$karousel.totalElements;i++) {this.push(i);}
    }

    Array.prototype.moveArrayLeft = function(times){
        (!times)?times=1:null;
        for (var i=0;i<times;i++){
            last_elem = this[0];
            for (var j=0;j<this.length;j++){
                this[j] = this[j + 1];
            }
            this.pop();
            this.push(last_elem);
        }
    }

    Array.prototype.moveArrayRight = function(times){
        (!times)?times=1:null;
        for (var i=0;i<times;i++){
            first_elem = this[this.length-1];
            for (var j=this.length-1;j>0;j--){
                this[j] = this[j-1];
            }
            this[0] = first_elem;
        }
    }

    function posArraySliderRight(num){
        (!num)?num=1:null;
        (!first)?arraySlider.moveArrayRight(num):null;
    }

    function posArraySliderLeft(num){
        (!num)?num=1:null;
        (!first)?arraySlider.moveArrayLeft(num):null;
    }

    function animateSlider(num){
        (!num)?num=1:null;
        for(var i=0;i<$karousel.totalElements;i++){
            var posToGo = arrayPos[i];
            var nElem = arraySlider[i];
            if (!first & i>=$karousel.totalElements-num){
                $karousel.element.eq(nElem).disableEffectTransition().css({translate:[posToGo,0]}).delay(300).queue(function(){
                    $(this).enableEffectTransition().dequeue();
                });
            }else{
                $karousel.element.eq(nElem).css({translate:[posToGo,0]});
            }
        }
        first = false;
    }

    function animateRSlider(num){
        (!num)?num=1:null;
        for(var i=0;i<$karousel.totalElements;i++){
            var posToGo = arrayPos[i];
            var nElem = arraySlider[i];
            if (!first & i==0){
                $karousel.element.eq(nElem).disableEffectTransition().css({translate:[posToGo,0]}).delay(500).queue(function(){
                    $(this).enableEffectTransition().dequeue();
                });
            }else{
                $karousel.element.eq(nElem).css({translate:[posToGo,0]});
            }
        }
        first = false;
    }

    function animate(){
        posArraySliderLeft($karousel.numElemToMove);
        animateSlider($karousel.numElemToMove)
    }

    function start() {
        $karousel.element.enableEffectTransition();
        resume();
    }

    function resume(){
        (!stop)?(animate()):null;
        setTimeout(resume, 2000)
    }

    function resumeStopEffect(){
        stopEff = false;
    }

    var first = true;
    var stopEff = false;
    var arraySlider = new Array();
    var arrayPos = new Array();

    // boot up the first call
    var timer;

    var stop = false;

    $.fn.karousel = function(args) {
        $this = this;

        if (args.hasOwnProperty('options')) {
            var _elemsSlide = (!args.options.hasOwnProperty('elemsPerSlide'))?1:args.options.elemsPerSlide;
            var _numElem = (!args.options.hasOwnProperty('numElemToMove'))?1:args.options.numElemToMove;
        } else {
            var _elemsSlide = 1;
            var _numElem = 1; 
        }

        var oWidth = parseInt($(args.slides).outerWidth())+parseInt($(args.slides).css('margin-left'))+parseInt($(args.slides).css('margin-right'));
        var oHeight = $(args.slides).outerHeight();

        $this.css({'width':oWidth*_elemsSlide,height:oHeight});

        var cont = 0;
        $(args.slides).each(function(){
            x = cont++*oWidth;
            y = 0;
            $(this).css({translate:[x,y]});
        });

        $karousel = null;

        $karousel = {
            container : $this,
            element : $(args.slides),
            slideScreen: $(args.slideScreen),
            elemsPerSlide: _elemsSlide,
            numElemToMove: _numElem,
            displayElement: oWidth,
            directions: args.options.directions,
            totalElements: $(args.slides).length
        }


        arraySlider.iniArraySlider();
        arrayPos.iniArrayPositions();
        
        $karousel.slideScreen.bind('mouseenter',function() {
            ($karousel.element.not(":animated"))?stop = true:null;
            //$karousel.element.addClass('lessopacity');
            $($karousel.directions).css({opacity:1});
        }).mouseleave(function() {
            if ($karousel.element.not(":animated")){
                //$karousel.element.removeClass('lessopacity');
                $(directions.directions).css({opacity:0});
                stop = false;
            }
        });

        $('#scrollRight').unbind().bind('click',function(){
            if (!stopEff){
                stopEff = true;
                posArraySliderLeft();
                animateSlider();
                setTimeout(resumeStopEffect, 800);
            }
        });

        $('#scrollLeft').unbind().bind('click',function(){
            if (!stopEff){
                stopEff = true;
                posArraySliderRight();
                animateRSlider();
                setTimeout(resumeStopEffect, 800);
            }
        });

        timer = setTimeout(start, 2000);
    }
})( window, jQuery );