window.onload = function() {
	i18nTemplate.process(document);
	addlinks();

	var img = document.getElementsByTagName("img");
	document.body.oncontextmenu = img[0].onmousedown = img[1].onmousedown =
		function() {
		
		return false;
	}
	document.querySelector(".icon").onclick =
		document.querySelector(".title").onclick = expand;
	document.getElementsByTagName("button")[0].onclick = function() {
		history.back();
	}
}

function expand() {
	var expanded = ($("nopeplayerparent").style.display == "");
	$("nopeplayerparent").style.display = expanded ? "block" : "";
	$("nopeplayer").src = expanded ?
		"http://www.youtube.com/embed/gvdf5n-zI14?rel=0&amp;autoplay=1" : "";
}

var map = {};

function addlinks() {
	var strings = location.hash.substr(1).split("&");
	for (var i = 0; i < strings.length; i++) {
		var x = strings[i].split("=");
		map[x[0]] = decodeURIComponent(x[1]);
	}
	
	$("linktext1").textContent = map.text;
	$("linkhref1").textContent = map.href;

	$("linktext2").textContent = map.text;
	$("searchlinktext").href = "http://www.google.com/search?q=" +
		encodeURIComponent(map.text);
	$("linkhref2").textContent = map.href;
	$("linkhref2").href = "http://www.google.com/search?q=" +
		encodeURIComponent(map.href);
	
	$("linktext3").textContent = parseURL(map.text).hostname;
	$("linkhref3").textContent = parseURL(map.href).hostname;
	
	$("linktext4").href = map.text;
	$("linkhref4").href = map.href;
}
