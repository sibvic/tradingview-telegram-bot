
var userData =
{
    to_resend: [],
    last_url: ""
};

function updateToken(interactive) {
    console.log("updateToken");
    chrome.identity.getAuthToken({ 'interactive': interactive }, function(token) {
        if (token === undefined) {
            userData.updated = true;
            return;
        }
        userData.updated = true;
        userData.token = token;
        var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
        var req = new XMLHttpRequest();
        req.open('GET', CWS_LICENSE_API_URL + chrome.runtime.id);
        req.setRequestHeader('Authorization', 'Bearer ' + token);
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
            }
        }
        req.send();
    });
}
updateToken(false);

function sendNotification(user_key, instrument, timeframe, text, url) {
    if (user_key === undefined || user_key === null || user_key === '') {
        return;
    }
    var obj = {
        key: user_key,
        strategyname: "",
        platform: "TradingView",
        notifications: [ {
            text: text,
            instrument: instrument,
            timeframe: timeframe
        } ]
    };
    sendObject(obj, url);
}

function resendFailedAlerts() {
    if (userData.to_resend.length == 0) {
        return;
    }
    console.info("ProfitRobots: Resenging alerts");
    var toResend = userData.to_resend;
    userData.to_resend = [];
    for (var i = 0; i < toResend.length; ++i) {
        sendObject(toResend, userData.last_url);
    }
}

function sendObject(obj, url) {
    var dataToSend = JSON.stringify(obj);
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status === 404) {
                console.info("ProfitRobots: Key was not found");
            }
            else if (xhr.status !== 200) {
                console.info("ProfitRobots: Failed to send", obj);
                userData.to_resend.push(obj);
                userData.last_url = url;
            }
        }
    }
    xhr.send(dataToSend);
}

function send(target_key, target_id, instrument, timeframe, custom_format, text, ignoreIfNoFilter, url) {
    var message = ParseMessageText(text);
    if (!message.HasFilter && ignoreIfNoFilter) {
        console.log("ProfitRobots: " + target_key + "/" + target_id + ": message doesn't have a filter specified. Ignoring it");
        return;
    }
    if (message.PassFilter(target_id.trim())) {
        if (custom_format !== undefined && custom_format !== null && custom_format !== '') {
            var formattedMessage = custom_format;
            formattedMessage = formattedMessage.replace("{{symbol}}", instrument);
            formattedMessage = formattedMessage.replace("{{timeframe}}", timeframe);
            message.Message = formattedMessage.replace("{{message}}", message.Message);
            sendNotification(target_key, '', '', message.Message, url);
        }
        else {
            sendNotification(target_key, '', '', message.Message, url);
        }
        console.log("ProfitRobots: " + target_key + "/" + target_id + ": sent");
    }
    else {
        console.log("ProfitRobots: " + target_key + "/" + target_id + ": filtered out");
    }
}

function processNotifications(text, instrument, timeframe) {
    chrome.storage.sync.get({
        key: '',
        key2: '',
        additionalKeys: '',
        additionalOptions: {},
        last_buy: null
    }, function(items) {
        var usedKeysIds = [];
        function keyAlreadyUsed(id){
            for (var i = 0; i < usedKeysIds.length; ++i) {
                if (usedKeysIds[i] === id) {
                    return true;
                }
            }
            return false;
        }

        var url = GetUrl(items.additionalOptions.use_local_bot);
        var custom_format = undefined;
        var instrumentToSend = instrument;
        var timeframeToSend = timeframe;
        if (items.additionalOptions.include_instrument === true || items.additionalOptions.include_instrument === undefined) {
            custom_format = items.additionalOptions.custom_format;
        }
        if (items.key !== '') {
            send(items.key, '', instrumentToSend, timeframeToSend, custom_format, text, items.additionalOptions.ignore_no_filter, url, items.additionalOptions.use_local_bot);
            usedKeysIds.push(items.key);
        }
        
        if (items.key2 !== '' && !keyAlreadyUsed(items.key2)) {
            send(items.key2, '', instrumentToSend, timeframeToSend, custom_format, text, items.additionalOptions.ignore_no_filter, url, items.additionalOptions.use_local_bot);
            usedKeysIds.push(items.key2);
        }

        if (items.additionalKeys !== undefined && items.additionalKeys !== '') {
            var keys = JSON.parse(items.additionalKeys);
            for (var i = 0; i < keys.length; ++i) {
                if (!keyAlreadyUsed(keys[i].key)) {
                    send(keys[i].key, keys[i].id, instrumentToSend, timeframeToSend, custom_format, text, items.additionalOptions.ignore_no_filter, url, items.additionalOptions.use_local_bot);
                    usedKeysIds.push(keys[i].key);
                }
            }
        }
        if (!items.additionalOptions.use_local_bot) {
            userData.last_sent = Date.now();
        }
    });
    return true;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Processing a request:", request);
        if (request.type === "get_status") {
            if (userData.updated !== true) {
                sendResponse({result: "waiting"});
                return;
            }
            sendResponse({
                result: "done",
                token: userData.token
            });
            return;
        }
        if (request.type === "connect") {
            updateToken(true);
            sendResponse({result: "ok"});
            return;
        }

        var success = processNotifications(request.text, request.instrument, request.timeframe);
        sendResponse({
            result: success,
            message_text: request.text,
            message_instrument: request.instrument,
            message_timeframe: request.timeframe,
            message_time: request.time
        });
    }
);

const NOT_STARTED = 0;
const STARTED = 1;
window.AlertSource = {
    status: NOT_STARTED,
    toResend: [],
	resendOldAlerts: function () {
		var toSend = this.toResend;
		this.toResend = [];
		for (var i = 0; i < toSend.length; i++) {
			this.sendAlert(toSend[i].message, toSend[i].instrument, toSend[i].timeframe);
		}
	},
	parseResolution: function(res) {
		if (res === null || res === undefined) {
			return "";
		}
		switch (res)
		{
			case "1":
				return "m1";
			case "2":
				return "m2";
			case "3":
				return "m3";
			case "5":
				return "m5";
			case "15":
				return "m15";
			case "30":
				return "m30";
			case "45":
				return "m45";
			case "60":
				return "H1";
			case "120":
				return "H2";
			case "180":
				return "H3";
			case "D":
				return "D1";
			case "W":
				return "W1";
		}
		return res;
    },
    sendAlert: function(text, instrument, timeframe) {
        const success = processNotifications(text, instrument, timeframe);
        if (!success) {
            var message = {
                message: text,
                instrument: instrument,
                timeframe: timeframe
            };
            toResend.push(message);
        }
    },
	start: function (privateChannel) {
		if (this.status !== NOT_STARTED) {
			return;
		}
		console.info("ProfitRobots: Starting alert listener");
		this.status = STARTED;
		this.privateChannel = privateChannel;
		const lastEventId = window.localStorage.getItem("last_event_id") || "";
		const url = "https://pushstream.tradingview.com"
			+ "/message-pipe-es/public/"
			+ "private_" + this.privateChannel
			+ "?_=" + Math.floor(Date.now() / 1000)
			+ "&tag="
			+ "&time="
			+ "&eventid=" + lastEventId

		this.eventSource = new EventSource(url)
		this.eventSource.onerror = (e) => {
			console.info("ProfitRobots: Error", e);
			if (e.target.readyState === EventSource.CLOSED) {
				this.status = NOT_STARTED;
			}
		}
		this.eventSource.onmessage = (e) => {
			try {
				const data = JSON.parse(e.data);
				if (typeof data !== "object" || data === null) {
					return;
				}
				if (data.channel !== "private_" + this.privateChannel) {
					return;
				}
				const response = JSON.parse(data.text.content);
				if (typeof response !== "object" || response === null) {
					return;
				}
				if (response.m !== "event") {
					return;
				}
				window.localStorage.setItem("last_event_id", response.p.id);
                console.info("ProfitRobots: Message detected", response.p.desc);
                this.sendAlert(response.p.desc, response.p.sym, this.parseResolution(response.p.res));
			}
			catch(e) {
			}
		}
		this.eventSource.onopen = () => {
		}
	},
	stop: function() {
		if (this.status !== STARTED) {
			return;
		}
		console.info("ProfitRobots: Stopping alert listener");
		this.status = NOT_STARTED;
		this.eventSource.close();
		this.eventSource = null;
	}
};

function updateOptions() {
	chrome.storage.sync.get({
		key: '',
		key2: '',
		additionalKeys: '',
		additionalOptions: {},
        last_buy: null,
        privateChannel: ''
	}, function (item){
        window.IsBeta = item.additionalOptions.use_beta === true;
        window.PrivateChannel = item.privateChannel;
	});
}

function isValidPrivateChannel(privateChannel) {
    return privateChannel !== undefined && privateChannel !== null && privateChannel !== "";
}

function onWindowLoad() {
    var timerId = setInterval(function() {
        updateOptions();
        const privateChannel = window.PrivateChannel;
        if (isValidPrivateChannel(privateChannel)) {
            if (window.AlertSource.status !== STARTED) {
                window.AlertSource.start(privateChannel);
            }
            else if (window.AlertSource.privateChannel !== privateChannel) {
                window.AlertSource.stop();
                window.AlertSource.start(privateChannel);
            }
		}
		else {
			if (window.AlertSource.status !== NOT_STARTED) {
				window.AlertSource.stop();
			}
        }
        window.AlertSource.resendOldAlerts();
        resendFailedAlerts();
	}, 1000);
}

window.onload = onWindowLoad;