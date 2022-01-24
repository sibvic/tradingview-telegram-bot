function getNewFromatOKButton(message) {
	var dialog = message;
	while (dialog !== null && dialog !== undefined) {
		dialog = dialog.parent();
		if (dialog.hasClass('tv-dialog')) {
			return dialog.find('.tv-button--primary');
		}
	}
	return null;
}

function parseSingleV2() {
	var message = $('.tv-alert-notification-dialog__subtitle');
	var title = $('.tv-alert-notification-dialog__title');
	if (message !== undefined && message.html() !== undefined && message.text() !== "") {
        var obj = {};
        obj.message = message.text();
        obj.title = title.text();
        obj.time = Date.now();
		var okButton = getNewFromatOKButton(message);
		if (okButton !== null && okButton !== undefined) {
			okButton.click();
		}
		return obj;
	}
	return null;
}