function getChild(parent) {
    if (parent === null) {
        return null;
    }
    var children = $(parent).children();
    if (children.length === 0) {
        return null;
    }
    return children[0];
}

function parseSingleV4() {
    var dialog = $('div')
        .filter(function() {
            return this.className.match("dialog-.*");
        });
    if (dialog.length === 0) {
        return null;
    }
    var mainDiv = getChild(getChild(dialog[0]));
    if (mainDiv === null) {
        return null;
    }
    var obj = {};
    $(mainDiv).children('div').each(function(index, element) {
        if (element.className.match(/title.*/)) {
            obj.title = $(element).text().trim();
        }
        else if (element.className.match(/content.*/)) {
            obj.message = $(element).text().trim();
        }
        obj.time = Date.now();
    });
    if (obj.message === null || obj.message === undefined) {
        return null;
    }
	return obj;
}