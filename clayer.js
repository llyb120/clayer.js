/**
 * clay
 *
 * @author Bin
 * @version 0.02
 */


;~function (win, undefined) {
    var count = 0;
    var cache_list = {};

    var doc = win.document;

    var config = {
        msg_padding_top : 15,
        msg_padding_left : 25
    }

    var get_default_options = function() {
        return {
            time : 2000,
            success : null,
            callback : null,
            mask : null,
            color : null
        }
    };

    var layer = {

        /**
         * 只是普通的消息而已，禁止遮罩
         *
         * msg在同一时间只能存在一个
         *
         * @param msg
         * @param options
         */
        msg: function (msg,options) {
            layer.closeAll('msg');

            var ins = new msg_class(options);
            ins.setText(msg);
            ins.show();
        },

        /**
         * 通过index关闭一个弹层
         * @param index
         */
        close: function (index) {
            if(cache_list[index]){
                cache_list[index].destroy();
            }

        },

        /**
         * 关闭所有的弹层
         */
        closeAll : function(type) {
            for(var i in cache_list) {
                //如果指定了类型
                if(type && cache_list[i].type == type || !type) {
                    cache_list[i].destroy();
                }
            }
        },


        /**
         * loading
         * 可以有遮罩
         */
        load : function(options) {
            var ins = new loading_class(options);
            ins.show();
        }
    }



    function msg_class(options) {
        this.timer = null;
        this.element = null;
        this.init_options(options);
        this.type = 'msg';
    }

    msg_class.prototype = {
        constructor: msg_class,

        setText: function (text) {
            this.text = text;
        },

        init_options : function(options){
            var default_options = get_default_options();
            if(typeof options == 'function'){
                default_options.callback = options;
            }
            else if(options){
                for(var i in default_options) {
                    if(options && options.hasOwnProperty(i)){
                        default_options[i] = options[i];
                    }
                }
            }
            this.options = default_options;
        },

        show: function () {
            var element = this.element = doc.createElement('div');
            element.style.padding = config.msg_padding_top + 'px ' + config.msg_padding_left + 'px';
            element.className = 'clayer_msg_enter clayer clayer_need_to_resize';
            element.innerHTML = this.text;
            element.style.background = 'rgba(0,0,0,.8)';
            element.style.color = '#fff';
            element.style.borderRadius = '6px';
            element.style.fontFamily = 'Microsoft Yahei';
            element.style.fontSize = '14px';
            element.style.lineHeight = '20px';
            element.style.textAlign = 'center';
            element.style.animation = 'clayer_msg_enter 320ms ease-out';

            doc.body.appendChild(element);
            resize(element);

            //缓存该元素
            return this.complete();

        },

        /**
         * show完后调用的方法，有关的options在这里处理
         */
        complete : function () {
            var options = this.options;
            if(options.time > 0) {
                var _this = this;
                this.timer = setTimeout(function () {
                    _this.destroy();
                    if(options.callback) {
                        options.callback.call(null, _this.index);
                    }
                }, options.time);
            }
            var index = this.index = cache_list.length;
            cache_list[index] = this;
            return index;
        },

        destroy : function() {
            if(this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            if(this.element) {
                //为了防止视觉出错，先设置不可见
                this.element.style.visibility = 'hidden';
                this.element.parentNode.removeChild(this.element);
            }
            delete cache_list[this.index];
        }
    }


    function loading_class(options) {
        this.element = null;
        this.timer = null;
        this.type = 'load';
        this.init_options(options);

        //如果没有设置时间，那么load层的默认时间是0
        if(options && !options.time || !options) {
            this.options.time = 0;
        }
    }

    loading_class.prototype = new msg_class();

    /**
     * 重写show方法
     */
    loading_class.prototype.show = function() {
        var element = this.element = doc.createElement('table');
        var tr = doc.createElement("tr");
        var td = doc.createElement("td");
        element.appendChild(tr);
        tr.appendChild(td);
        td.align = 'center';
        td.valign = 'center';

        //如果需要遮罩
        if(this.options.mask) {
            td.style.background = this.options.mask;
        }

        //中心定位
        element.className = 'clayer';
        element.style.left = 0;
        element.style.top = 0;
        element.style.width = '100%';
        element.style.height = '100%';

        //最外面包的一层
        var par = doc.createElement("div");
        par.style.position = 'relative';
        par.style.width = '60px';
        par.style.height = '60px';
        td.appendChild(par);

        //color
        var color;
        if(this.options.color) {
            color = this.options.color;
        }
        else{
            color = '#f90';
        }

        //里面的绝对定位
        var children = [];
        for(var i = 0; i < 2; i++) {
            var child = children[i] = doc.createElement("div");
            with(child.style){
                width = '100%';
                height = '100%';
                borderRadius = '50%';
                opacity = '0.6';
                position = 'absolute';
                top = 0;
                left = 0;
                animation = 'clayer_bounce 2.0s infinite ease-in-out';
            }

            //颜色单独处理
            child.style.background = color;
            par.appendChild(child);
        }
        //例外的处理
        children[1].style.animationDelay = '-1.0s';

        doc.body.appendChild(element);

        //此时不再需要resize
        // resize(element);

        return this.complete();

    };





    var get_height = function(text) {
        var box = doc.createElement("div");
        box.style.float = 'left';
        box.style.maxWidth = (0.5 * win.innerWidth) + 'px';
        box.innerHTML = text;
        doc.body.appendChild(box);
        var w = box.offsetWidth;
        var h = box.offsetHeight;
        doc.body.removeChild(box);
        return [w, h];
    };

    var get_mask = function () {
        var div = document.createElement("div");
        with (div.style) {
            width = '100%';
            height = '100%';
            position = 'fixed';
            zIndex = '1000000000000000';
            background = "rgba(0,0,0,1)";
        }
    };

    var make_element = function(str) {
        var div = doc.createElement('div');
        div.innerHTML = str;
        return div.childNodes[0];
    };




    var resize = function(elem) {
        elem.style.maxWidth = (0.5 * win.innerWidth) + 'px';
        var sw = win.innerWidth;
        var sh =  win.innerHeight;
        var rw = elem.offsetWidth;
        var rh = elem.offsetHeight;
        var top = (sh - rh) / 2;
        var left = (sw - rw) / 2;
        console.log(rw,rh);
        elem.style.left = left + 'px';
        elem.style.top = top + 'px';
    };

    document.write("<style>.clayer{position:fixed;z-index: 10000000000000000} .clayer_need_to_resize{} @keyframes clayer_msg_enter {from{transform: scale(0.4)} to{transform: scale(1)}} .clayer_msg_enter{} @keyframes clayer_bounce{0%,100%{transform: scale(0.0);} 50%{transform: scale(1.0);}} </style>");

    var resize_handler = function() {
        var elems = doc.querySelectorAll(".clayer_need_to_resize");
        for(var i = 0; i < elems.length; i++) {
            resize(elems[i]);
        }
    };

    (window.addEventListener || window.attachEvent)(window.addEventListener ? "resize" : 'onresize',resize_handler);

    win.clay = layer;



}(window);