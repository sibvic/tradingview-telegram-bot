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

function parseSingleV5() {
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
        else if (element.className.match(/iconWrapper.*/)) {
            //ignore
        }
        obj.time = Date.now();
    });
    var forms = $(dialog).children('form');
    if (forms == null || forms == undefined || forms.length == 0) {
        return null;
    }
    $(forms[0]).children('div').each(function(index, element) {
        if (element.className.match(/content.*/)) {
            obj.message = $(element).text().trim();
        }
    });
    if (obj.message === null || obj.message === undefined) {
        return null;
    }
    var okButton = $('button')
        .filter(function() {
            var spans = $(this).children("span").filter(function() {
                return $(this).text() == "Ok";
            })
            return spans.length == 1;
        });
    if (okButton.length == 1) {
        okButton[0].click();
    }
	return obj;
}