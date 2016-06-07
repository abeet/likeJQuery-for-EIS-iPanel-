if (window.HTMLElement && HTMLElement.prototype) {
	if (!HTMLElement.prototype.currentStyle) {
		HTMLElement.prototype.__defineGetter__("currentStyle", function() {
			return !!this.ownerDocument && this.ownerDocument.defaultView.getComputedStyle(this, null);
		});
	}
}

if (window.console) {
	window.iPanel=console;
}
if(!window.iPanel){
	iPanel={debug:function(){}};
}

$ = function(selector, context) {
	if(typeof selector == 'object' && selector===String(selector)){
		selector=''+selector;
		selector=''+selector;
		iPanel.debug(' ------------------ $ typeof selector+ '+ (typeof selector)+' '+selector)
	}
	if (typeof selector == 'function') {
		$(window).on('load', selector);
		return;
	}
	if (!(this instanceof $)) {
		return new $(selector, context);
	}
	var els = [];
	if (typeof selector =='undefined' || selector === null) {
		this.els = els;
		return;
	}
	if (typeof selector == 'string') {
		if (selector.indexOf('<') === 0) {
			els = $.htmlString2DomNode(selector, context);
		} else {
			els = $.selector.find(selector, context);
		}
	} else if (selector.nodeName && selector.nodeType) {
		if (!selector.id) {
			selector.id = 'elem' + (++$.uuid);
		}		
		els.push(selector);
	} else if (selector instanceof Array) {
		els = selector.slice(0);
	} else if (typeof selector.length == 'number' && !selector.location && !selector.nodeType) {
		//不是window，不是<select>
		for (var i = 0; i < selector.length; i++) {
			els.push(selector[i]);
		}
	} else {
		els.push(selector);
	}
	this.els = els;
};
$.trim = function(text) {
	return (text || "").replace(/^\s+|\s+$/g, "");
};
$.isFunction = function(o) {
	return !!o && typeof o === 'function';
};
$.isArray = function(o) {
	return !!o && (o instanceof Array);
};

$.browser = {};
$.browser.iPanel = /iPanel/i.test(navigator.userAgent);
$.browser.iPanelAdv = $.browser.iPanel && /advanced/i.test(navigator.userAgent);
$.browser.msie = /MSIE/i.test(navigator.userAgent); //iPanel3.0以以下版本使用MSIE
$.browser.trident = /trident/i.test(navigator.userAgent); //Trident为IE的内核
$.browser.webkit = /webkit/i.test(navigator.userAgent); //webkit为chrome及safari的内核
$.browser.poor = true;

$.extend = function(obj, srcObj) {
	for (var p in srcObj) {
		if (!srcObj.hasOwnProperty || srcObj.hasOwnProperty(p)) {
			obj[p] = srcObj[p];
		}
	}
	return obj;
};

$.prototype.extend = function(p) {
	return $.extend($.prototype, p);
};

$.makeArray = function(array) {
	if (array === null || array === undefined) {
		return [];
	} else if (array instanceof Array) {
		return array.slice(0);
	} else if (typeof array.length != 'number' || typeof array === "string" || array.call || array.setInterval) {
		return [array];
	} else if (typeof array.length == 'number') {
		var ret = [];
		for (var i = 0, len = array.length; i < len; i++) {
			ret[i] = array[i];
		}
		return ret;
	}
};


$.each = function(object, callback) {
	if (object.els && object.els instanceof Array) {
		object = object.els;
	}
	var isIterable=false;
	if (object instanceof Array) {
		isIterable=true;
	}else if(typeof object.length == 'number' && object.length>0 && typeof object[0] !='undefined'){
		//在iPanel下普通对象也有length属性
		isIterable=true;
	}
	if(isIterable){
		for (var i = 0,l=object.length; i < l; i++) {
			if (callback.call(object[i], i, object[i]) === false) {
				break;
			}
		}
	}else {
		for (var key in object) {
			if (callback.call(object[key], key, object[key]) === false) {
				break;
			}
		}
	}
	return object;
};

$.prototype.each = function(fn) {
	$.each(this.els, fn);
	return this;
};

$.prototype.html = function(val) {
	if (typeof val == 'undefined') {
		return this.els[0].innerHTML;
	}
	return this.each(function() {
		this.innerHTML = val;
	});
};

$.prototype.prop = function(propName, propVal) {
	if (typeof propVal == 'undefined') {
		return this.els[0][propName];
	}
	return this.each(function() {
		this[propName] = propVal;
	});
};
$.prototype.removeProp = function(propName) {
	return this.each(function() {
		try {
			this[propName] = undefined;
			delete this[propName];
		} catch (e) {}
	});
};
$.prototype.get = function(i) {
	if (typeof i == 'undefined') {
		return this.els;
	}
	return this.els[i];
};
$.prototype.setArray = function(els) {
	thie.els = els;
	return this;
};
$.prototype.pushStack = function(elems) {
	var ret = $(elems);
	ret.prevObject = this;
	return ret;
};
$.prototype.end = function() {
	return this.prevObject || $([]);
};
$.prototype.add = function(els) {
	if (typeof els == 'string') {
		els = $(els).get();
	} else if (typeof els.length == 'undefined' || els.nodeName) {
		els = [els];
	}
	return this.pushStack($.merge(this.get(), els));
};
$.prototype.children = function() {
	var ret=[];
	this.each(function () {
		for(var i=0,len=this.childNodes.length;i<len;i++){
			var n = this.childNodes[i];
			if(n.nodeType === 1){
				ret.push(n);
			}
		}
	})
	return this.pushStack($.unique(ret));
};

$.merge = function(first, second) {
	for (var i = 0; second[i]; i++) {
		first.push(second[i]);
	}
	return first;
};
$.prototype.index = function(elem) {
	var ret = -1;
	return $.inArray((elem && elem.length ? elem[0] : elem), this);
};
$.inArray = function(elem, array) {
	for (var i = 0, len = array.els.length; i < len; i++) {
		if (array.els[i] === elem || (elem.uniqueID && elem.uniqueID == array.els[i].uniqueID)) {
			return i;
		}
	}
	return -1;
};
$.string = {
	match: function(str, re) {
		if ('a1'.match(/((\w)(\d))/g).length !== 1) { //iPanel下的bug，match结果不如预期
			var arr, ret = [];
			while ((arr = re.exec(str)) !== null) {
				ret.push(arr[0]);
			}
			return ret.length ? ret : null;
		} else {
			return str.match(re);
		}
	},
	//abc-def to abcDef
	camelize: function(s) {
		var strArr;
		if (s.indexOf("-") !== -1) {
			strArr = s.split("-") || [];
			for (var i = 0, j = 0, l=strArr.length; i < l; i++) {
				if (strArr[i]) {
					if (j) {
						strArr[i] = strArr[i].substring(0, 1).toUpperCase() + strArr[i].substring(1, strArr[i].length);
					}
					j++;
				}
			}
			s = strArr.join('');
		}
		return s;
	},
	//abcDef to abc-def
	decamelize: function(s) {
		var strArr = s.split('');
		for (var i = 0, j = 0, l=strArr.length; i < l; i++) {
			if (strArr[i].charCodeAt(0) <= 90 && strArr[i].charCodeAt(0) >= 65 ) {
				strArr[i] = '-' + strArr[i].toLowerCase();
			}
		}
		s = strArr.join('');
		return s;
	}
};
$.htmlString2DomNode = function(str, context) {
	context = context || document;
	if (typeof context.createElement == 'undefined') {
		if (context.ownerDocument) {
			context = context.ownerDocument;
		} else if (context[0] && context[0].ownerDocument) {
			context = context[0].ownerDocument;
		} else {
			context = document;
		}
	}
	var match = /^<(\w+)\s*\/?>(?:<\/\1>)?$/i.exec(str);
	if (match) { // 如果是单一的标签
		return [context.createElement(match[1])];
	}
	var s = $.trim(str).toLowerCase();
	var tempDiv = context.createElement("div");
	var wrap = [0, "", ""];
	if (!s.indexOf("<opt")) {
		wrap = [1, "<select multiple='multiple'>", "</select>"];
	} else if (s.match(/^<(thead|tbody|tfoot|colg|cap)/)) {
		wrap = [1, "<table>", "</table>"];
	} else if (!s.indexOf("<tr")) {
		wrap = [2, "<table><tbody>", "</tbody></table>"];
	} else if (!s.indexOf("<td") || !s.indexOf("<th")) {
		wrap = [3, "<table><tbody><tr>", "</tr></tbody></table>"];
	} else if (!s.indexOf("<col")) {
		wrap = [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"];
	}
	tempDiv.innerHTML = wrap[1] + str + wrap[2];
	while (wrap[0]--) {
		tempDiv = tempDiv.lastChild;
	}
	return $.makeArray(tempDiv.childNodes); // 转换成数组
};
$.prototype.append = function(elems) { // 这儿如果是字符串，都作为textNode而不识别为元素选择器
	var clone = false;

	if (elems.nodeType && elems.nodeName) {
		elems = [elems];
	} else if (typeof elems == 'string') {
		elems = $.htmlString2DomNode(elems /*,this.els[0].ownerDocument*/ );
	}
	return this.each(function(i, me) {
		$.each(elems, function() {
			var elem = clone ? this.cloneNode(true) : this;
			if (me.nodeType === 1) {
				me.appendChild(elem);
				clone = true;
			}
		});
	});
};
$.prototype.appendTo = function(container) {
	$(container).append(this);
	return this;
};
$.prototype.prepend = function(elems) { // 这儿如果是字符串，都作为textNode而不识别为元素选择器
	var clone = false;

	if (elems.nodeType && elems.nodeName) {
		elems = [elems];
	} else if (typeof elems == 'string') {
		elems = $.htmlString2DomNode(elems /*,this.els[0].ownerDocument*/ );
	}
	this.each(function(i, me) {
		$.each(elems, function() {
			var elem = clone ? this.cloneNode(true) : this;
			if (me.nodeType === 1) {
				me.insertBefore(elem, me.firstChild);
				clone = true;
			}
		});
	});
	return this;
};
$.prototype.prependTo = function(container) {
	$(container).prepend(this);
	return this;
};


$.css = function(elem, attr, val) {
	var prop;
	if (attr.indexOf('-') != -1) {
		prop = $.string.camelize(attr);
	} else {
		prop = attr;
	}
	var re;
	var result;
	var cssText;
	var match;
	if (typeof val == 'undefined' || val === true) { //jQuery里第三个参数可能为true的用法
		result = elem.currentStyle[prop];
		if (typeof result == 'undefined') {
			//说明页面还没有渲染完，只能访问到cssText里的样式
			attr = $.string.decamelize(prop);
			re = new RegExp('(^|\\s|\\b)' + attr + '\\s*:\\s*([^;]*)\\s*;+(\\s|\\b|$)');
			cssText = elem.style.cssText;
			match = re.exec(cssText);
			if (match && match.length > 2) {
				return match[2];
			} else {
				return undefined;
			}
		} else {
			if (prop == 'height' && !result) { //在没有设置height样式时，iPanel中样式值为0，但实际上是有高度的
				result = elem.offsetHeight + 'px';
			}else if (prop == 'width' && !result) { //在没有设置height样式时，iPanel中样式值为undefined，但实际上是有高度的
				result = elem.offsetWidth + 'px';
			}
			return result;
		}
		return elem.style[prop];
	}
	if (typeof document.body.currentStyle.display == 'undefined') {
		//说明页面还没有渲染完，只能访问到cssText里的样式,无法设置style属性
		//经测试在模拟器中无法 运行replace(new RegExp(),'')
		attr = $.string.decamelize(prop);
		re = new RegExp('(^|\\s|\\b)' + attr + '\\s*:\\s*([^;]*)\\s*;+(\\s|\\b|$)');
		cssText = elem.style.cssText;
		match = re.exec(cssText);
		if (match) {
			var index = match.index;
			var lastIndex = match[0].length + index;
			cssText = cssText.substr(0, index) + cssText.substr(lastIndex);
		}
		if (cssText.length && cssText.substr(cssText.length - 2) !== ';') {
			cssText += ';';
		}
		elem.style.cssText = cssText + attr + ':' + val + ';';
	} else {
		elem.style[prop] = val;
	}
	return elem;
};
$.prototype.css = function(attr, val) {
	if (val === undefined) {
		return $.css(this.els[0], attr);
	}
	return this.each(function() {
		$.css(this, attr, val);
	});
};
$.prototype.hide = function() {
	return this.each(function() {
		this.display_bak = $.css(this, 'display');
		$.css(this, 'display', 'none');
	});
};
$.prototype.show = function() {
	return this.each(function() {
		$.css(this, 'display', this.display_bak && this.display_bak !== 'none' ? this.display_bak : '');
	});
};

$.string.replaceAll = function(str, substr) {
	var index = str.indexOf(substr);
	while (index !== -1) {
		var lastIndex = substr.length + index;
		str = str.substr(0, index + 1) + str.substr(lastIndex);
		index = str.indexOf(substr);
	}
	return str;
};
$.hasClass=function (el, className) {
	if(!el.className){
		return false;
	}
	return (' ' + el.className + ' ').indexOf(' ' + className + ' ') != -1;
}
$.prototype.hasClass = function(className) {
	if (!this.els[0].className) {
		return false;
	}
	return $.hasClass(this.els[0], className);
};
$.prototype.addClass = function(className) {
	return this.each(function() {
		this.className = this.className || '';
		var className2 = ' ' + this.className + ' ';
		if (className2.indexOf(' ' + className + ' ') == -1) {
			this.className = this.className + (this.className.length ? ' ' : '') + className;
		}
	});
};
$.prototype.removeClass = function(className) {
	className = ' ' + className + ' ';
	return this.each(function() {
		this.className = this.className || '';
		var className2 = ' ' + this.className + ' ';
		className2 = $.string.replaceAll(className2, className);
		while (className2.charCodeAt(0) == 32) { //去掉前后空格
			className2 = className2.substr(1);
		}
		while (className2.charCodeAt(className2.length - 1) == 32) { //去掉前后空格
			className2 = className2.substr(0, className2.length - 1);
		}
		if (this.className !== className2) {
			this.className = className2;
		}
	});
};
$.prototype.offset = function(v) {
	var x = 0,
		y = 0;

	if (typeof v == 'undefined') {
		var elem = this.els[0];
		var doc = elem.ownerDocument;
		if (!$.browser.poor && elem.getBoundingClientRect) { //IE,FF3
			var box = elem.getBoundingClientRect();
			var scrollTop = Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
			var scrollLeft = Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);
			x = box.left + scrollLeft - doc.documentElement.clientLeft - doc.body.clientLeft;
			y = box.top + scrollTop - doc.documentElement.clientTop - doc.body.clientTop;
		} else {
			var parent = elem.parentNode,
				offsetChild = elem,
				offsetParent = elem.offsetParent;
			var fixed = $.css(elem, "position") == "fixed";
			x += elem.offsetLeft || 0;
			y += elem.offsetTop || 0;
			while (offsetParent) {
				x += offsetParent.offsetLeft || 0;
				y += offsetParent.offsetTop || 0;

				if (!fixed && $.css(offsetParent, "position") == "fixed") {
					fixed = true;
				}

				offsetChild = offsetParent.tagName=='BODY' ? offsetChild : offsetParent;
				offsetParent = offsetParent.offsetParent;
			}
			while (parent && parent.tagName && parent.tagName != 'BODY' && parent.tagName != 'HTML') {
				var display=$.css(parent, "display");
				if (!(display.indexOf('inline') == 0 || display.indexOf('table') == 0)) {
					x -= parent.scrollLeft || 0;
					y -= parent.scrollTop || 0;
				}

				parent = parent.parentNode;
			}
			if (fixed) {
				x += Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft) || 0;
				y += Math.max(doc.documentElement.scrollTop, doc.body.scrollTop) || 0;
			}
		}
		return {
			left: x,
			top: y
		};
	}

	return this.each(function() {
		if (v.left !== undefined && v.left !== null) {
			$.css(this, 'left', v.left + 'px');
		}
		if (v.top !== undefined && v.top !== null) {
			$.css(this, 'top', v.top + 'px');
		}
	});
};
$.prototype.width = function(v) { //
	if (typeof v == 'undefined') {
		return typeof this.els[0].offsetWidth == 'number' ? this.els[0].offsetWidth : parseInt($.css(this.els[0], 'width'), 10);
	}
	return this.each(function() {
		$.css(this, 'width', typeof v == 'number' ? v + 'px' : v);
	});
};
$.prototype.height = function(v) { //
	if (typeof v == 'undefined') {
		return typeof this.els[0].offsetHeight == 'number' ? this.els[0].offsetHeight : parseInt($.css(this.els[0], 'height'), 10);
	}
	return this.each(function() {
		$.css(this, 'height', typeof v == 'number' ? v + 'px' : v);
	});
};
$.prototype.isVisible = function() { //不可靠，样式要写在元素上，没有判断父元素隐藏情况
	if ($.css(this.els[0], 'display') === 'none') {
		return false;
	} else if (this.els[0].offsetWidth === 0 && this.els[0].offsetHeight === 0 && this.els[0].tagName !== "TR") {
		return false;
	}
	return true;
};

$.uuid = 0;
$.cache = {};
$.expando = '__expando';
$.id = function(el) {
	var $id = el.id;
	if (!$id) {
		$id = el.id = 'elem' + (++$.uuid);
	}
	return $id;
};
$.prototype.id = function() {
	return $.id(this.els[0]);
};
$.data = function(el, name, data) {
	var $id = el.id;
	if (!$id) {
		$id = el.id = 'elem' + (++$.uuid);
	}
	if (name && !$.cache[$id]) {
		$.cache[$id] = {};
	}
	if (data !== undefined) {
		$.cache[$id][name] = data;
	}
	return name ? $.cache[$id][name] : $id;
};
$.removeData = function(el, name) {
	var $id = el.id;
	if (name) {
		if ($.cache[$id]) {
			delete $.cache[$id][name];
		}
	} else {
		$.cache[$id] = {};
	}
};
$.prototype.data = function(key, val) {
	if (val === undefined) {
		return $.data(this.els[0], key);
	}
	return this.each(function() {
		$.data(this, key, val);
	});
};
$.prototype.removeData = function(key) {
	this.each(function() {
		$.removeData(this, key);
	});
	return this;
};


$.event = {};
$.guid = 0;
$.event.global = {};
//注意，不能注册以空格分开的方法
$.event.add = function(elem, type, handler) {
	if (!handler.guid) {
		handler.guid = $.guid++; //给一个唯一id
	}
	var events = $.data(elem, "events") || $.data(elem, "events", {}),
		handle = $.data(elem, "handle") || $.data(elem, "handle", function() {
			var val;
			if (typeof $ == 'undefined' || $.event.triggered) {
				return val;
			}
			return $.event.handle.apply(arguments.callee.elem, arguments);
		});
	handle.elem = elem;

	var parts = type.split(".");
	type = parts[0];
	handler.type = parts[1];

	var handlers = events[type];
	if (!handlers) {
		handlers = events[type] = [];
	}
	handlers.push(handler);
	$.event.global[type] = true; //此事件已经有注册过
	elem = null; //IE下防止内存泄漏
};
$.event.remove = function(elem, type, handler) {
	var events = $.data(elem, "events"),
		ret, index;
	if (events) {
		if (!type) { //没有传入事件名，移除所有事件
			for (var t in events) {
				$.event.remove(elem, t);
			}
		} else {
			var parts = type.split(".");
			type = parts[0];
			if (events[type]) {
				var handlers = events[type];
				var i;
				if (handler) {
					for (i = handlers.length - 1; i >= 0; i--) {
						if (handlers[i].guid == handler.guid) {
							handlers.splice(i, 1);
							break;
						}
					}
					//delete events[type][handler.guid];
				} else {
					for (i = handlers.length - 1; i >= 0; i--) {
						if (!parts[1] || handlers[i].type == parts[1]) {
							handlers.splice(i, 1);
						}
					}
				}
			}
		}
	}
};
$.event.trigger = function(type, data, element) {
	data = $.makeArray(data || []);
	if (!element) {
		if ($.event.global[type]) {
			$.each($.cache, function() {
				if (this.events && this.events[type]) {
					$.event.trigger(type, data, this.handle.elem);
				}
			});
		}
	} else {
		var val, ret, isFn = typeof(element[type] || null) == 'function';

		// Pass along a fake event
		var event = !data[0] || !data[0].preventDefault;
		if (event) {
			data.unshift($.event.fix({
				type: type,
				target: element
			}));
		}
		data[0].type = type; //必须修复，比如在keydown事件里发送出onup,ondown事件时
		// Trigger the event
		var handle = $.data(element, "handle");
		if (handle) {
			handle.apply(element, data);
		}
/* 在iPanel里事件都通过document.onkeypress触发，所以不要再返回去调用onkeypress
            以免造成死循环
            if (!isFn && element["on"+type] && element["on"+type].apply( element, data ) === false ){
                val = false;
            }
            */

		if (isFn && val !== false && element.nodeName !== 'A' && type == "click") {
			$.event.triggered = true;
			try {
				element[type]();
			} catch (e) {}
		}

		$.event.triggered = false;
		return val;
	}
};
$.event.handle = function(event) {
	var val;
	event = $.event.fix(event || window.event || {});

	var parts = event.type.split(".");
	event.type = parts[0];

	var args = $.makeArray(arguments).slice(1);
	args.unshift(event);

	var handlers = $.data(this, "events") && $.data(this, "events")[event.type];
	if (handlers) {
		for (var i = 0, l = handlers.length; i < l; i++) {
			if (!parts[1] || handlers[i].type == parts[1]) {
				var tmp = handlers[i].apply(this, args);
				if (val !== false) {
					val = tmp;
				}
				if (tmp === false) { //如果上一个方法返回false，则取消事件冒泡
					event.preventDefault();
					event.stopPropagation();
				}
			}
		}
	}

	return val;
};
$.event.props = "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" ");
$.event.fix = function(evt) {
	if (evt && evt[$.expando]) {
		return evt;
	}
	var originalEvent = evt || window.event;
	evt = {};
	if (!originalEvent) {
		return;
	}
	for (var i = $.event.props.length - 1; i >= 0; i--) {
		prop = $.event.props[i];
		evt[prop] = originalEvent[prop];
	}
	evt.originalEvent = originalEvent;
	evt.type = originalEvent.type;
	//evt.timeStamp = (new Date()).getTime();
	evt[$.expando] = true;
	evt.preventDefault = function() {
		if (originalEvent.preventDefault) {
			originalEvent.preventDefault();
		} else {
			originalEvent.returnValue = false;
		}
		evt.returnValue = false;
	};
	evt.stopPropagation = function() {
		if (originalEvent.stopPropagation) {
			originalEvent.stopPropagation();
		} else {
			originalEvent.cancelBubble = true;
		}
		evt.cancelBubble = true;
	};

	if (!evt.target) {
		evt.target = evt.srcElement || document; // Fixes #1925 where srcElement might not be defined either
	}

	if (evt.target.nodeType === 3) {
		evt.target = evt.target.parentNode;
	}

	if (!evt.relatedTarget && evt.fromElement) {
		evt.relatedTarget = evt.fromElement == evt.target ? evt.toElement : evt.fromElement;
	}

	if (!evt.which && ((evt.charCode || evt.charCode === 0) ? evt.charCode : evt.keyCode)) {
		evt.which = evt.charCode || evt.keyCode;
	}

	if (!evt.metaKey && evt.ctrlKey) {
		evt.metaKey = evt.ctrlKey;
	}
	if (!evt.which && evt.button) {
		evt.which = (evt.button & 1 ? 1 : (evt.button & 2 ? 3 : (evt.button & 4 ? 2 : 0)));
	}
	return evt;
};
$.prototype.on = function(type, func) {
	return this.each(function() {
		$.event.add(this, type, func);
	});
};
$.prototype.off = function(type, func) {
	return this.each(function() {
		$.event.remove(this, type, func);
	});
};

$.prototype.trigger = function(type, data) {
	return this.each(function() {
		$.event.trigger(type, data, this);
	});
};



$.noop = function() {};


$.unique = function(array) {
	var ret = [],
		done = {};
	try {
		for (var i = 0, len = array.length; i < len; i++) {
			var id = $.data(array[i]);
			if (!done[id]) {
				done[id] = true;
				ret.push(array[i]);
			}
		}
	} catch (e) {
		ret = array;
	}

	return ret;
};
$.prototype.find = function(expr) {
	var result = [];
	this.each(function() {
		var found = $.selector.find(expr, this);
		for (var i = 0, l = found.length; i < l; i++) {
			result.push(found[i]);
		}
	});

	return this.pushStack($.unique(result));
};
$.prototype.filter = function(expr) {
	return this.pushStack($.selector.filter(expr, this));
};
$.prototype.slice = function(i, l) {
	return this.pushStack(this.els.slice(i, l));
};
$.prototype.push = function(item) {
	this.els.push(item);
	return this;
};
$.prototype.sort = function(fn) {
	this.els.sort(fn);
	return this;
};
$.prototype.splice = function(i, l) {
	this.els.splice(i, l);
	return this;
};
$.prototype.eq = function(i) {
	return this.slice(i, i + 1);
};
$.prototype.first = function () {
	return this.slice(0, 1);
};
$.prototype.last = function () {
	return this.slice(this.els.length-1, this.els.length);
};

$.queue = function(elem, type, data) {
	var q;
	if (elem) {

		type = (type || "fx") + "queue";

		q = $.data(elem, type);

		if (!q || $.isArray(data)) {
			q = $.data(elem, type, $.makeArray(data));
		} else if (data) {
			q.push(data);
		}

	}
	return q;
};
$.dequeue = function(elem, type) {
	var queue = $.queue(elem, type),
		fn = queue.shift();

	if (!type || type === "fx") {
		fn = queue[0];
	}

	if (fn !== undefined) {
		fn.call(elem);
	}
};
$.prototype.queue = function(type, data) {
	if (typeof type !== "string") {
		data = type;
		type = "fx";
	}

	if (data === undefined) {
		return $.queue(this.els[0], type);
	}

	return this.each(function() {
		var queue = $.queue(this, type, data);

		if (type == "fx" && queue.length == 1) {
			queue[0].call(this);
		}
	});
};
$.prototype.dequeue = function(type) {
	return this.each(function() {
		$.dequeue(this, type);
	});
};

