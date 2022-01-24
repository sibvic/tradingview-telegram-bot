function parseMultiMessageV3(row) {
	var obj = {};
	$(row).children('div').each(function(index, element) {
        console.log(element.className);
        if (element.className.match(/.*timeCell.*/)) {
            obj.time = $(this).text().trim();
        } else if (element.className.match(/.*alertInfoCell.*/)) { 
            $(element).children('div').each(function(index, element) {
                if (element.className.match(/alertDescription.*/)) {
                    obj.message = $(this).text().trim();
                }
                else if (element.className.match(/alertName.*/)) {
                    obj.title = $(this).text().trim();
                }
            })
        } else if (element.className.match(/.*symbolCell.*/)) { 
            obj.symbol = $(this).text().trim();
        }
	});
            
	return obj;
}


function parseMultiMessagesV3Format() {
	var messages = [];
    var dialog = $('a')
        .filter(function() {
            return this.className.match("bodyRow-.*");
        });
	if (dialog.length === 0) {
		return messages;
	}

    for (var i = 0; i < dialog.length; ++i) {
		var message = parseMultiMessageV3(dialog[i]);
        if (message.message !== undefined) {
            messages.push(message);
        }
	}
	return messages;
}