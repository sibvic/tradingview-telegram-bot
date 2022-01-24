function parseMultiMessageV2(row) {
	var obj = {};
	$(row).children('td').each(function(index, element) {
		switch (index)
		{
			case 1:
				obj.message = $(this).text().trim();
				break;
			case 0:
				obj.title = $(this).text().trim();
				break;
			case 3:
				obj.time = $(this).text().trim();
				break;
		}
	});
	return obj;
}

function parseMultiMessagesV2Format() {
	var messages = [];
	var dialog = $('.tv-alerts-multiple-notifications-dialog');
	if (dialog === undefined || dialog === null) {
		return messages;
	}

	if ($('.tv-alerts-multiple-notifications-dialog__table') !== undefined) {
		dialog.find('tr').each( function( index, element ){
			var message = parseMultiMessageV2(this);
			if (message.message !== undefined) {
				messages.push(message);
			}
		});
	}
	return messages;
}