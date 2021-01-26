"use strict";

function GetInstrument(str) {
    if (str === undefined) {
        return "";
    }

    var myRegexp = /Alert on (.+)/g;
    var match = myRegexp.exec(str);
    if (match === null) {
        return str;
    }
    return match[1];
}

function sendOldFormat() {
	var message = $('.tv-alert-single-notification-dialog__message');
	var title = $('.tv-alert-single-notification-dialog__title');
	if (message !== undefined && message.html() !== undefined) {
		window.AlertSender.sendAlert(message.text(), GetInstrument(title.text()), '', Date.now());

		var okButton = $('.tv-alert-notification-dialog__button--ok');
		if (okButton !== undefined) {
			okButton.click();
		}
		return true;
	}
	return false;
}

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

function sendNewFormat() {
	var message = $('.tv-alert-notification-dialog__subtitle');
	var title = $('.tv-alert-notification-dialog__title');
	if (message !== undefined && message.html() !== undefined && message.text() !== "") {
		window.AlertSender.sendAlert(message.text(), GetInstrument(title.text()), '', Date.now());

		var okButton = getNewFromatOKButton(message);
		if (okButton !== null && okButton !== undefined) {
			okButton.click();
		}
		return true;
	}
	return false;
}

function sendScreenerAlert() {
	var dialogTitle = $('.tv-alert-notification-dialog__head');
	if (dialogTitle === undefined || dialogTitle === null) {
		return false;
	}
	var dialog = dialogTitle.parent();
	var subtitle = dialogTitle.find(".tv-alert-notification-dialog__subtitle").text().trim();
	if (subtitle === undefined || subtitle === "" || subtitle === null) {
		return false;
	}
	var symbols = dialog.find(".tv-alert-notification-dialog__symbol");
    var s = "";
    for (let index = 0; index < symbols.length; index++) {
        const element = symbols[index];
        var symbol = $(element).text().trim();
        if (s === "") {
            s += symbol;
        }
        else {
            s += ", " + symbol;
        }
    }
	window.AlertSender.sendAlert(subtitle, s, '', Date.now());

	var okButton = getNewFromatOKButton(dialog);
	if (okButton !== null && okButton !== undefined) {
		okButton.click();
	}
	
	return true;
}

function getMultiScreenerSymbols(cell) {
	return $(cell).text().trim()
}

function sendV3Format() {
	var dialog = FindDialogV3();
	if (dialog != undefined && dialog != null) {
		var symbolTag = FindTag(dialog.children, "a", "js-symbol");
		if (symbolTag === undefined || symbolTag === null) {
			return false;
		}
		var symbolAttr = symbolTag.getAttribute("data-symbol");
		if (symbolAttr === undefined || symbolAttr === null) {
			return false;
		}
		var contentTag = FindTag(dialog.children, "p", "content");
		if (contentTag === undefined || contentTag === null) {
			return false;
		}
		var content = contentTag.textContent;
		var okButton = FindTag(dialog.children, "button", "appearance-default-");
		window.AlertSender.sendAlert(content, symbolAttr, '', Date.now());
		if (okButton !== undefined) {
			okButton.click();
		}
		return true;
	}
	return false;
}

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

function parseScreenerMultiMessages() {
	var messages = [];
    var container = $('.js-alerts-multiple-notifications-dialog__table-container');
	if (container === undefined || container === null) {
        return messages;
    }
    var rows = container.find("tr");
    if (rows === undefined || rows === null) {
        return messages;
    }
    for (var i = 0; i < rows.length; ++i) {
        var row = rows[i];
        var cells = $(row).find("td");
        if (cells !== undefined && cells !== null && cells.length === 5) {
            var message = {};
			message.symbol = getMultiScreenerSymbols(cells[0]);
			message.message = $(cells[1]).text().trim();
			message.time = $(cells[4]).text().trim();
			messages.push(message);
        }
    }
	return messages;
}

function sendScreenerMulti() {
	var messages = parseScreenerMultiMessages();
	for (var i = 0; i < messages.length; i++) {
		window.AlertSender.sendAlert(messages[i].message, messages[i].symbol, '', messages[i].time);
	}
	return messages.length > 0;
}

function parseMultiMessage(row) {
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

function parseMultiMessage(row) {
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

function parseMultiMessagesOldFormat() {
	var messages = [];
	if ($('.tv-alerts-multiple-notifications-dialog__table') !== undefined) {
		$('.tv-alerts-multiple-notifications-dialog__row').each( function( index, element ){
			var message = parseMultiMessage(this);
			messages.push(message);
		});
	}
	return messages;
}

function parseMultiMessagesNewFormat() {
	var messages = [];
	var dialog = $('.tv-alerts-multiple-notifications-dialog');
	if (dialog === undefined || dialog === null) {
		return messages;
	}

	if ($('.tv-alerts-multiple-notifications-dialog__table') !== undefined) {
		dialog.find('tr').each( function( index, element ){
			var message = parseMultiMessage(this);
			if (message.message !== undefined) {
				messages.push(message);
			}
		});
	}
	return messages;
}

function sendMulti() {
	var messages = parseMultiMessagesOldFormat();
	if (messages.length == 0) {
		messages = parseMultiMessagesNewFormat();
	}
	for (var i = 0; i < messages.length; i++) {
		window.AlertSender.sendAlert(messages[i].message, GetInstrument(messages[i].title), '', messages[i].time);
	}
	return messages.length > 0;
}

window.AlertSender = {
	lastMessages: {
		containsMessage: function(message, title, time) {
			for (var i = 0; i < this.messages.length; i++) {
				if (this.messages[i].message == message && this.messages[i].time == time) {
					return true;
				}
			}
			return false;
		},
		addMessage: function(message) {
			this.messages.push(message);
		},
		messages: []
	},

	toResend: [],
	resendOldAlerts: function () {
		var toSend = this.toResend;
		this.toResend = [];
		for (var i = 0; i < toSend.length; i++) {
			this.sendAlertForced(toSend[i].message, toSend[i].instrument, toSend[i].timeframe, toSend[i].time);
		}
	},

	sendAlertForced: function (message, symbol, timeframe, time) {
		chrome.runtime.sendMessage(
			{
				text: message,
				instrument: symbol,
				timeframe: timeframe,
				time: time
			},
			function(response) {
				var message = {
					message: response.message_text,
					instrument: response.message_instrument,
					timeframe: response.message_timeframe,
					time: response.message_time
				};
				if (response.result === true) {
					window.AlertSender.lastMessages.addMessage(message);
				}
				else {
					window.AlertSender.toResend.push(message);
				}
			}
		);
	},

	sendAlert: function (message, symbol, timeframe, time) {
		if (this.lastMessages.containsMessage(message, symbol, time)) {
			return;
		}
		this.sendAlertForced(message, symbol, timeframe, time);
	}
};

function updateOptions() {
	chrome.storage.sync.get({
		key: '',
		key2: '',
		additionalKeys: '',
		additionalOptions: {},
		last_buy: null
	}, function (item){
		window.IsBeta = item.additionalOptions.use_beta === true;
	});

	var privateChannel = window.localStorage.getItem("PrivateChannel")
	if (privateChannel !== undefined && privateChannel !== null && privateChannel !== '' && privateChannel !== window.PrivateChannel) {
		chrome.storage.sync.set({
			privateChannel: privateChannel
		}, function (item) {});
		window.PrivateChannel = privateChannel;
	}
}

function onWindowLoad() {
	var timerId = setInterval(function() {
		updateOptions();
		window.AlertSender.resendOldAlerts();
		if (sendV3Format()) {
			return;
		}
		if (sendOldFormat()) {
			return;
		}
		if (sendNewFormat()) {
			return;
		}
		if (sendMulti()) {
			return;
		}
		if (sendScreenerMulti()) {
		 	return;
		}
		if (sendScreenerAlert()) {
			return;
		}
	}, 1000);
}

function resource(filename) {
	let script = document.createElement("script");
	script.src = chrome.extension.getURL(filename);
	script.type = "text/javascript";

	return script;
}

const element = document.body || document.head || document.documentElement;
const manifest = chrome.runtime.getManifest();
const resources = manifest.web_accessible_resources;

for (let i = 0; i < resources.length; i++) {
	let filename = resources[i];
	let script = resource(filename);

	if (!element.querySelector("script[src*='" + filename + "']")) {
		element.appendChild(script);
	}
}

window.onload = onWindowLoad;