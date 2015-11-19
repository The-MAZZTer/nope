// Borrowed from chrome://newtab/ to aid in i18n...
// Modified to work with Extension i18n API.
			
var i18nTemplate = (function() {
	/**
	 * This provides the handlers for the templating engine. The key is used as
	 * the attribute name and the value is the function that gets called for every
	 * single node that has this attribute.
	 * @type {Object}
	 */
	var handlers = {
		/**
		 * This handler sets the textContent of the element.
		 */
		'i18n-content': function(element, attributeValue) {
			element.textContent = chrome.i18n.getMessage(attributeValue);
		},
 
		/**
		 * This is used to set HTML attributes and DOM properties,. The syntax is:
		 *   attributename:key;
		 *   .domProperty:key;
		 *   .nested.dom.property:key
		 */
		'i18n-values': function(element, attributeValue) {
			var parts = attributeValue.replace(/\s/g, '').split(/;/);
			for (var j = 0; j < parts.length; j++) {
				var a = parts[j].match(/^([^:]+):(.+)$/);
				if (a) {
					var propName = a[1];
					var propExpr = a[2];
 
					var value = chrome.i18n.getMessage(propExpr);
					
					// Ignore missing properties
					if (value) {
						if (propName.charAt(0) == '.') {
							var path = propName.slice(1).split('.');
							var object = element;
							while (object && path.length > 1) {
								object = object[path.shift()];
							}
							if (object) {
								object[path] = value;
								// In case we set innerHTML (ignoring others) we need to
								// recursively check the content
								if (path == 'innerHTML') {
									process(element, obj);
								}
							}
						} else {
							element.setAttribute(propName, value);
						}
					} else {
						console.warn('i18n-values: Missing value for "' + propExpr + '"');
					}
				}
			}
		}
	};
 
	var attributeNames = [];
	for (var key in handlers) {
		attributeNames.push(key);
	}
	var selector = '[' + attributeNames.join('],[') + ']';
 
	/**
	 * Processes a DOM tree with the {@code obj} map.
	 */
	function process(node) {
		var elements = node.querySelectorAll(selector);
		for (var element, i = 0; element = elements[i]; i++) {
			for (var j = 0; j < attributeNames.length; j++) {
				var name = attributeNames[j];
				var att = element.getAttribute(name);
				if (att != null) {
					handlers[name](element, att);
				}
			}
		}
	}
 
	return {
		process: process
	};
})();

function $(a) {
	return document.getElementById(a);
}

function parseURL(url) {
	var ret = {
		protocol: null,
		username: null,
		password: null,
		hostname: null,
		path: null,
		query: null,
		hash: null,
		toString: function() {
			return this.protocol + "://" +
				(this.username ? this.username +
				(this.password ? ":" + this.password : "") + "@" : "") +
				this.hostname +
				this.path +
				(this.query ? "?" + this.query : "") +
				(this.hash ? "#" + this.hash : "");
		}
	};
	
	var endOfProtocol = url.indexOf(":");
	if (endOfProtocol > -1) {
		ret.protocol = url.substr(0, endOfProtocol);
		url = url.substr(endOfProtocol + 1);
	}
	
	if (url.substr(0, 2) == "//") {
		url = url.substr(2);
	} else if (url.substr(0, 1) == "/") {
		url = url.substr(1);
	}
	
	var afterHostname = url.indexOf("/");
	if (afterHostname == -1) {
		afterHostname = url.length;
	}
	var hostname = url.substr(0, afterHostname == -1 ? url.length : afterHostname);
	url = url.substr(afterHostname);
	
	var beforeHostname = hostname.lastIndexOf("@");
	ret.hostname = hostname.substr(beforeHostname + 1);
	if (beforeHostname > -1) {
		hostname = hostname.substr(0, beforeHostname);
		var beforePassword = hostname.indexOf(":");
		if (beforePassword > -1) {
			ret.username = hostname.substr(0, beforePassword);
			ret.password = hostname.substr(beforePassword + 1);
		} else {
			ret.username = hostname;
		}
	}
	
	var beforeQuery = url.indexOf("?");
	if (beforeQuery > -1) {
		ret.path = url.substr(0, beforeQuery);
		url = url.substr(beforeQuery + 1);
		
		var beforeHash = url.indexOf("#");
		if (beforeHash > -1) {
			ret.query = url.substr(0, beforeHash);
			ret.hash = url.substr(beforeHash + 1);
		} else {
			ret.query = url;
		}
	} else {
		var beforeHash = url.indexOf("#");
		if (beforeHash > -1) {
			ret.path = url.substr(0, beforeHash);
			ret.hash = url.substr(beforeHash + 1);
		} else {
			ret.path = url;
		}
	}
	
	return ret;
}