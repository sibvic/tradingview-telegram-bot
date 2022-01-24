function ClassStartsWith(item, name) {
	var classAttr = item.getAttribute("class");
	return classAttr != undefined && classAttr != null && classAttr.includes(name);
}

function FindDialogV3() {
	var items = document.getElementsByTagName("div");
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (ClassStartsWith(item, "popupDialog")) {
			return item;
		}
	}
	return null;
}

function FindTag(tags, tagName, className) {
	for (var i = 0; i < tags.length; i++) {
		var item = tags[i];
		if (item.tagName.toLowerCase() == tagName && ClassStartsWith(item, className)) {
			return item;
		}
		var childItem = FindTag(item.children, tagName, className);
		if (childItem != null) {
			return childItem;
		}
	}
	return null;
}

function parseSingleV3() {
	var dialog = FindDialogV3();
	if (dialog != undefined && dialog != null) {
		var symbolTag = FindTag(dialog.children, "a", "js-symbol");
		if (symbolTag === undefined || symbolTag === null) {
			return null;
		}
		var symbolAttr = symbolTag.getAttribute("data-symbol");
		if (symbolAttr === undefined || symbolAttr === null) {
			return null;
		}
		var contentTag = FindTag(dialog.children, "p", "content");
		if (contentTag === undefined || contentTag === null) {
			return null;
		}
		
		var subtitle = FindTag(dialog.children, "p", "subTitle");
		var content = "";
		if (subtitle !== undefined && subtitle !== null) {
			content = subtitle.textContent + "\n";
		}
		content += contentTag.textContent;
		var okButton = FindTag(dialog.children, "button", "appearance-default-");
        var obj = {};
        obj.message = content;
        obj.title = symbolAttr;
        obj.time = Date.now();
		if (okButton !== undefined && okButton !== null) {
			okButton.click();
		}
		return obj;
	}
	return null;
}