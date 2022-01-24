function parseMultiMessageV1(row) {
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

function parseMultiMessagesV1Format() {
	var messages = [];
	if ($('.tv-alerts-multiple-notifications-dialog__table') !== undefined) {
		$('.tv-alerts-multiple-notifications-dialog__row').each( function( index, element ){
			var message = parseMultiMessageV1(this);
			messages.push(message);
		});
	}
	return messages;
}