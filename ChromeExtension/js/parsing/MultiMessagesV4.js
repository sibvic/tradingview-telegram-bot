function parseMultiMessageV4(row) {
	var obj = {};
	var items = $(row).children('div');
    for (var i = 0; i < items.length; ++i) {
        if (items[i].className.match(/.*alertInfoCell-.*/)) {
            $(items[i]).children('div').each(function(index, element) {
                if (element.className.match(/.*alertDescription.*/)) {
                    obj.message = $(element).text().trim();
                }
                else if (element.className.match(/.*alertName.*/)) {
                    obj.title = $(element).text().trim();
                }
            })
        }
        else if (items[i].className.match(/.*timeCell.*/)) {
            obj.time = $(items[i]).text().trim();
        }
        else if (items[i].className.match(/.*symbolCell-.*/)) {
            obj.symbol = $(items[i]).text().trim();
        }
    }
            
	return obj;
}

function parseMultiMessagesV4Format() {
	var messages = [];
    var dialog = $('div')
        .filter(function() {
            return this.className.match("bodyRow-.*");
        });
	if (dialog.length === 0) {
		return messages;
	}

    for (var i = 0; i < dialog.length; ++i) {
		var message = parseMultiMessageV4(dialog[i]);
        if (message.message !== undefined) {
            messages.push(message);
        }
	}
	return messages;
}