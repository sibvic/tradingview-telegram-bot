function parseSingleV1() {
	var message = $('.tv-alert-single-notification-dialog__message');
	var title = $('.tv-alert-single-notification-dialog__title');
	if (message !== undefined && message.html() !== undefined) {
        var obj = {};
        obj.message = message.text();
        obj.title = title.text();
        obj.time = Date.now();
		var okButton = $('.tv-alert-notification-dialog__button--ok');
		if (okButton !== undefined) {
			okButton.click();
		}
		return obj;
	}
	return null;
}