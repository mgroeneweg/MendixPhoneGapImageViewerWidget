/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console, document, Camera, FileUploadOptions, FileTransfer, navigator,  */
/*mendix */
/*
    PhoneGapImageViewerWidget
    ========================

    @file      : PhoneGapImageViewerWidget.js
    @version   : 1.0
    @author    : Marcel Groeneweg
    @date      : Thu, 21 May 2015 06:38:55 GMT
    @copyright : 
    @license   : Apache 2

    Documentation
    ========================
    View image on the device.
*/

// Pinch zoom utility uses jQuery
require({
    packages: [
        { name: 'jquery', location: '../../widgets/PhoneGapImageViewerWidget/lib', main: 'jquery-1.10.2.min' }
    ]
}, [
    'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_TemplatedMixin', 'jquery', 
    'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/dom-construct', 'dojo/_base/array', 'dojo/_base/lang', 'dojo/text', 'dojo/html', 'dojo/_base/event', 'dojo/text!PhoneGapImageViewerWidget/widget/template/PhoneGapImageViewerWidget.html'
], function (declare, _WidgetBase, _TemplatedMixin, $, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, html, event, widgetTemplate) {
    'use strict';

    // Declare widget's prototype.
    return declare('PhoneGapImageViewerWidget.widget.PhoneGapImageViewerWidget', [_WidgetBase, _TemplatedMixin], {


        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,
        
        // Parameters configured in the Modeler.
        buttonClass: 'wx-mxwx-button-extra',
        buttonText: 'activate camera',
        imageContainerClass: 'wx-mxwx-imagecontainer-extra',
        imageWidth: 150,
        imageHeight: 150,
        imageLocation: 'Right',
        maxzoom: 4, //set maximum zoom level (from 1x)
        

        //internal variables
        magnifyicons: [
            '<img src="widgets/PhoneGapImageViewerWidget/widget/ui/magnify.gif" class="zoomcontrols" style="right:40px; bottom: 5px;" />', 
            '<img src="widgets/PhoneGapImageViewerWidget/widget/ui/magnify2.gif" class="zoomcontrols" style="right:5px; bottom: 5px;" />'
        ],

        _imageUrl: null,
        _previewNode: null,
        _imgNode: null,

        constructor: function () {
        },

        postCreate: function () {
            // postCreate
            console.log('PhoneGapImageViewerWidget - postCreate');
            // Setup widgets
            this._setupWidget();
            // Create childnodes
            this._createChildNodes();
        },

        uninitialize: function () {
            //clean up window events here
        },

        /**
         * Building methods
         * =================
         */

        _setupWidget: function () {
            domClass.add(this.domNode, 'wx-PhoneGapImageViewerWidget-container');
            
        },

        _createChildNodes: function () {
            console.log('PhoneGapImageViewerWidget - createChildNodes events');

            var button = null,
                preview = null,
                tableHtml = null,
                trTop = null,
                trBottom = null,
                tdTop = null,
                tdBottom = null,
                trTable = null,
                tdLeft = null,
                tdRight = null;
            
            // Only show button if camera can be used.
//            if (!navigator.camera) {
//                return;
//            }

            button = this._setupButton();
            preview = this._setupPreview();

            tableHtml = domConstruct.create('table', {
                'class': 'wx-PhoneGapImageViewerWidget-table'
            });

            switch (this.imageLocation) {

            case 'Above':
                trTop = domConstruct.create('tr', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-tr'
                });
                tdTop = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-td'
                });

                trBottom = domConstruct.create('tr', {
                    'class': 'wx-PhoneGapImageViewerWidget-bottom-tr'
                });
                tdBottom = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-bottom-td'
                });

                tdTop.appendChild(preview);
                trTop.appendChild(tdTop);

                tdBottom.appendChild(button);
                trBottom.appendChild(tdBottom);

                tableHtml.appendChild(trTop);
                tableHtml.appendChild(trBottom);
                break;
            case 'Below':

                trTop = domConstruct.create('tr', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-tr'
                });
                tdTop = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-td'
                });

                trBottom = domConstruct.create('tr', {
                    'class': 'wx-PhoneGapImageViewerWidget-bottom-tr'
                });
                tdBottom = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-bottom-td'
                });

                tdTop.appendChild(button);
                trTop.appendChild(tdTop);

                tdBottom.appendChild(preview);
                trBottom.appendChild(tdBottom);

                tableHtml.appendChild(trTop);
                tableHtml.appendChild(trBottom);

                break;
            case 'Left':
                trTable = domConstruct.create('tr', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-tr'
                });
                tdLeft = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-td'
                });
                tdRight = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-td'
                });

                tdLeft.appendChild(preview);
                trTable.appendChild(tdLeft);

                tdRight.appendChild(button);
                trTable.appendChild(tdRight);

                tableHtml.appendChild(trTable);
                break;
            case 'Right':
                trTable = domConstruct.create('tr', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-tr'
                });
                tdLeft = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-td'
                });
                tdRight = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-td'
                });

                tdLeft.appendChild(button);
                trTable.appendChild(tdLeft);

                tdRight.appendChild(preview);
                trTable.appendChild(tdRight);

                tableHtml.appendChild(trTable);
                break;
            default:
                trTable = domConstruct.create('tr', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-tr'
                });
                tdLeft = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-td'
                });
                tdRight = domConstruct.create('td', {
                    'class': 'wx-PhoneGapImageViewerWidget-top-td'
                });

                tdLeft.appendChild(button);
                trTable.appendChild(tdLeft);

                tdRight.appendChild(preview);
                trTable.appendChild(tdRight);

                tableHtml.appendChild(trTable);
                break;
            }

            this.domNode.appendChild(tableHtml);

        },

        _setupButton: function () {
            var button = dom.create('button', {
                'type': 'button',
                'class': 'btn btn-primary wx-PhoneGapImageViewerWidget-button ' + this.buttonClass
            }, this.buttonText);

            this.connect(button, 'click', '_getPicture');
            return button;
        },

        _setupPreview: function () {
            var actualImageWidth,
                actualImageHeight,
                width = this.imageWidth ? this.imageWidth + 'px' : '100px',
                height = this.imageHeight ? this.imageHeight + 'px' : '100px';
            
            this._previewNode = dom.create('div', {
                'class': 'pancontainer',
                'data-orient': 'center',
                'data-canzoom': 'yes'
            });
            domStyle.set(this._previewNode, {
                'width': width,
                'height': height
            });
            this._imgNode = dom.create('img');
            this._imgNode.src = 'https://dl.dropboxusercontent.com/u/98807681/Game%202013-12-08.JPG';
            domStyle.set(this._imgNode, {
                'width': '3264px',
                'height': '2448px'
            });
            this._previewNode.appendChild(this._imgNode);
            this.attachToDiv();
            return this._previewNode;
        },


        /**
         * Interaction widget methods.
         * ======================
         */

        _setPicture: function (url) {
            this._imageUrl = url;
            this._setThumbnail(url);
        },

        _setThumbnail: function (url) {
            var actualImageWidth,
                actualImageHeight,
                urlDisplay = url ? '' : 'none',
                width = this.imageWidth ? this.imageWidth + 'px' : '100px',
                height = this.imageHeight ? this.imageHeight + 'px' : '100px',
                background = url ? 'url(' + url + ')' : 'none';

            this._imgNode.src = url;
            actualImageHeight = this._imgNode.height ? this._imgNode.height + 'px' : '1000px';
            actualImageWidth = this._imgNode.width ? this._imgNode.width  + 'px': '1000px';
            
            domStyle.set(this._imgNode, {
                'width': actualImageWidth,
                'height': actualImageHeight
            });
            
            domStyle.set(this._previewNode, {
                'display': urlDisplay,
                'width': width,
                'height': height
            });


        },

        _getPicture: function () {
            var success = null,
                error = null,
                self = this;

            if (!navigator.camera) {
                mx.ui.error('Unable to detect camera.');
                return;
            }

            success = function (url) {
                self._setPicture(url);
            };

            error = function (e) {
                if (typeof e.code !== 'undefined') {
                    mx.ui.error('Retrieving image from camera failed with error code ' + e.code);
                }
            };

            navigator.camera.getPicture(success, error, {
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                destinationType: Camera.DestinationType.FILE_URL,
                correctOrientation: true
            });
        },
        
        /**
         * Taken from Dynamic Drive
         * http://www.dynamicdrive.com/dynamicindex4/imagepanner.htm
         * ======================
         */        
        
	init:function($, $img, options){
		var s=options
		s.imagesize=[$img.width(), $img.height()]
		s.oimagesize=[$img.width(), $img.height()] //always remember image's original size
		s.pos=(s.pos=="center")? [-(s.imagesize[0]/2-s.wrappersize[0]/2), -(s.imagesize[1]/2-s.wrappersize[1]/2)] : [0, 0] //initial coords of image
		s.pos=[Math.floor(s.pos[0]), Math.floor(s.pos[1])]
		$img.css({position:'absolute', left:s.pos[0], top:s.pos[1]})
		if (s.canzoom=="yes"){ //enable image zooming?
			s.dragcheck={h: (s.wrappersize[0]>s.imagesize[0])? false:true, v:(s.wrappersize[1]>s.imagesize[1])? false:true} //check if image should be draggable horizon and vertically
			s.$statusdiv=$('<div style="position:absolute;color:white;background:#353535;padding:2px 10px;font-size:12px;visibility:hidden">1x Magnify</div>').appendTo(s.$pancontainer) //create DIV to show current magnify level
			s.$statusdiv.css({left:0, top:s.wrappersize[1]-s.$statusdiv.outerHeight(), display:'none', visibility:'visible'})
			this.zoomfunct($, $img, s)
		}
		this.dragimage($, $img, s)
	},

	dragimage:function($, $img, s){
		$img.bind('mousedown touchstart', function(e){
			var e = (e.type.indexOf('touch') != -1)? e.originalEvent.changedTouches[0] : e
			s.pos=[parseInt($img.css('left')), parseInt($img.css('top'))]
			var xypos=[e.clientX, e.clientY]
			$img.bind('mousemove.dragstart touchmove.dragstart', function(e){
				var e = (e.type.indexOf('touch') != '-1')? e.originalEvent.changedTouches[0] : e
				var pos=s.pos, imagesize=s.imagesize, wrappersize=s.wrappersize
				var dx=e.clientX-xypos[0] //distance to move horizontally
				var dy=e.clientY-xypos[1] //vertically
				s.dragcheck={h: (wrappersize[0]>imagesize[0])? false:true, v:(wrappersize[1]>imagesize[1])? false:true}
				if (s.dragcheck.h==true) //allow dragging horizontally?
					var newx=(dx>0)? Math.min(0, pos[0]+dx) : Math.max(-imagesize[0]+wrappersize[0], pos[0]+dx) //Set horizonal bonds. dx>0 indicates drag right versus left
				if (s.dragcheck.v==true) //allow dragging vertically?
					var newy=(dy>0)? Math.min(0, s.pos[1]+dy) : Math.max(-imagesize[1]+wrappersize[1], pos[1]+dy) //Set vertical bonds. dy>0 indicates drag downwards versus up
				$img.css({left:(typeof newx!="undefined")? newx : pos[0], top:(typeof newy!="undefined")? newy : pos[1]})
				return false //cancel default drag action
			})
			return false //cancel default drag action
		})
		$(document).bind('mouseup touchend', function(e){
			var e = (e.type.indexOf('touch') != -1)? e.originalEvent.changedTouches[0] : e
			$img.unbind('mousemove.dragstart touchmove.dragstart')
		})
	},

	zoomfunct:function($, $img, s){
		var magnifyicons=this.magnifyicons,
            self = this;
		var $zoomimages = $(magnifyicons.join(''))
			.css({zIndex:1000, cursor:'pointer', opacity:0.7})
			.attr("title", "Zoom Out")
			.appendTo(s.$pancontainer)
		$zoomimages.eq(0).css({opacity:1})
			.attr("title", "Zoom In")
		$zoomimages.click(function(e){ //assign click behavior to zoom images
			var $zimg=$(this) //reference image clicked on
			var curzoom=s.curzoom //get current zoom level
			var zoomtype=($zimg.attr("title").indexOf("In")!=-1)? "in" : "out"
			if (zoomtype=="in" && s.curzoom==self.maxzoom || zoomtype=="out" && s.curzoom==1) //exit if user at either ends of magnify levels
				return
			var basepos=[s.pos[0]/curzoom, s.pos[1]/curzoom]
			var newzoom=(zoomtype=="out")? Math.max(1, curzoom-1) : Math.min(self.maxzoom, curzoom+1) //get new zoom level
			$zoomimages.css("opacity", 1)
			if (newzoom==1) //if zoom level is 1x, dim "zoom out" image
				$zoomimages.eq(1).css("opacity", 0.7)
			else if (newzoom==self.maxzoom) //if zoom level is max level, dim "zoom in" image
				$zoomimages.eq(0).css("opacity", 0.7)
			clearTimeout(s.statustimer)
			s.$statusdiv.html(newzoom+"x Magnify").show() //show current zoom status/level
			var nd=[s.oimagesize[0]*newzoom, s.oimagesize[1]*newzoom]
			var newpos=[basepos[0]*newzoom, basepos[1]*newzoom]
			newpos=[(zoomtype=="in" && s.wrappersize[0]>s.imagesize[0] || zoomtype=="out" && s.wrappersize[0]>nd[0])? s.wrappersize[0]/2-nd[0]/2 : Math.max(-nd[0]+s.wrappersize[0], newpos[0]),
				(zoomtype=="in" && s.wrappersize[1]>s.imagesize[1] || zoomtype=="out" && s.wrappersize[1]>nd[1])? s.wrappersize[1]/2-nd[1]/2 : Math.max(-nd[1]+s.wrappersize[1], newpos[1])]
			$img.animate({width:nd[0], height:nd[1], left:newpos[0], top:newpos[1]}, function(){
				s.statustimer=setTimeout(function(){s.$statusdiv.hide()}, 500)
			})
			s.imagesize=nd
			s.curzoom=newzoom
			s.pos=[newpos[0], newpos[1]]
		})
	},
    
    attachToDiv : function () {
		var $this=$(this._previewNode).css({position:'relative', overflow:'hidden', cursor:'move'})
		var options={$pancontainer:$this, pos:$this.attr('data-orient'), curzoom:1, canzoom:$this.attr('data-canzoom'), wrappersize:[$this.width(), $this.height()]}
        var $imgref=$(this._imgNode)
        if (parseInt(this._imgNode.style.width)>0 && parseInt(this._imgNode.style.height)>0) //if image has explicit CSS width/height defined
            this.init($, $imgref, options)
        else if (this._imgNode.complete){ //account for IE not firing image.onload
            this.init($, $imgref, options)
        }
        else{
            $imgref.bind('load', function(){
                this.init($, $imgref, options)
            })
        }

    }
        

    });
});