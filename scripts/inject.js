String.prototype.startsWith = function(text) {
  return this.substr(0, text.length) == text;
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

function transformLinks(e) {
	removeListeners();

	var element = e.target;
	if (element.nodeName.toLowerCase() == "a") {
		checkLink(element);
	}
	if (element.getElementsByTagName) {
		var a = element.getElementsByTagName("a");
		for (var i = a.length; i--; ) {
			checkLink(a[i]);
		}
	}
	
	addListeners();
}

function checkLink(link) {
	var text = link.textContent.toLowerCase().replace(" ", "");
	var href = link.href.toLowerCase().replace(" ", "");
	
	if (text === href) {
		return;
	}
	
	if (text.indexOf("://") == -1 || href.indexOf("://") == -1) {
		return;
	}
	
	text = parseURL(text);
	href = parseURL(href);
	
	if ((text.protocol != "http" && text.protocol != "https") || !text.hostname) {	
		return;
	}
	if ((href.protocol != "http" && href.protocol != "https") || !href.hostname) {	
		return;
	}
	
	if (text.hostname == href.hostname && text.username == href.username &&
		text.password == href.password) {
		
		return;
	}
	
	// Temp whitelist
	if (href.hostname == "i.imgur.com") {
		return;
	}
	
	link.href = chrome.extension.getURL("/warning.html#text=" +
		encodeURIComponent(link.textContent) + "&href=" + encodeURIComponent(link.href));
}

function addListeners() {
	// These two don't seem to work
	//document.addEventListener("DOMAttrModified", transformLinks, false);
	//document.addEventListener("DOMNodeInsertedIntoDocument", transformLinks, false);
	document.addEventListener("DOMSubtreeModified", transformLinks, false);
}

function removeListeners() {
	document.removeEventListener("DOMSubtreeModified", transformLinks, false);
}

document.addEventListener("load", transformLinks, false);
addListeners();
transformLinks({target: document});