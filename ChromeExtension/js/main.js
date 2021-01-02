function hasValidKey(key, additionalKeys) {
	if (key !== undefined && key !== '') {
		return true;
	}
	if (additionalKeys !== undefined && additionalKeys !== '') {
		var keys = JSON.parse(additionalKeys);
		return keys.length > 0;
	}
	return false;
}

function onWindowLoad() {
	$('#extension_title').html(chrome.i18n.getMessage("extension_title"));
	$('#chrome_account').html(chrome.i18n.getMessage("chrome_account"));
	$('#feedback').html(chrome.i18n.getMessage("feedback"));
	$('#account_status_loading').html(chrome.i18n.getMessage("account_status_loading"));
	$('#account_status_login').html(chrome.i18n.getMessage("account_status_login"));
	$('#key_info_set').html(chrome.i18n.getMessage("key_info_set"));
	$('#alerts_status_fail').html(chrome.i18n.getMessage("alerts_status_fail"));
	$('#alerts_status_ok').html(chrome.i18n.getMessage("alerts_status_ok"));
	$('#max_keys').html(chrome.i18n.getMessage("max_keys"));
	$('#doesnt_work').html(chrome.i18n.getMessage("doesnt_work"));
	$('#add_alert').html(chrome.i18n.getMessage("add_alert"));
	$('#youtube_link').attr("title", chrome.i18n.getMessage("youtube_link_text"));

	setTimeout(function() { updateState(); }, 1000);
	chrome.storage.sync.get({
		key: '',
		additionalKeys: ''
    }, function(items) {
        if (!hasValidKey(items.key, items.additionalKeys)) {
			$("#key_info_set").css('display', 'inline');
			$("#key_info_ok").css('display', 'none');
		}
		else {
			$("#key_info_set").css('display', 'none');
			$("#key_info_ok").css('display', 'inline');
		}
    });
}

var state;

function updateAlertsListenersStatus(){
	var queryInfo = {
		url: "https://*.tradingview.com/*"
	};
	chrome.tabs.query(queryInfo, function (result) {
		if (result.length > 0) {
			$("#alerts_status_fail_block").css('display', 'none');
			$("#alerts_status_ok_block").css('display', 'inline');
		}
		else {
			$("#alerts_status_fail_block").css('display', 'inline');
			$("#alerts_status_ok_block").css('display', 'none');
		}
	});
}

function updateGeneralStatus() {
	chrome.runtime.sendMessage( {
		type: "get_status"
	},
	function(response) {
		console.log("Response to get_status", response);
		if (response.result === "waiting") {
			setTimeout(function() { updateState(); }, 1000);
		}
		else {
			if (response.token === undefined) {
				$("#account_status_loading").css('display', 'none');
				$("#account_status_login").css('display', 'inline');
				$("#account_status_login").click(function () {
					chrome.runtime.sendMessage( {
							type: "connect"
						},
						function(response) {
							updateState();
						}
					);
				});
			}
			else {
				$("#account_status_loading").css('display', 'none');
			}
			$("#max_keys_value").text(response.max_keys);
		}
	});
}

function updateState() {
	updateAlertsListenersStatus();
	updateGeneralStatus();
}

window.onload = onWindowLoad;