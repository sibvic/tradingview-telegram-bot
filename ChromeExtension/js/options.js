var userData =
{
    max_keys: 1,
    last_key: 0
};

function showError(message) {
    $('#error_message').css('display', 'inline');
    $('#error_message').addClass('warning');
    $('#error_message').removeClass('success');
    $('#error_message').html(message);
    setTimeout(function() {
        $('#error_message').css('display', 'none');
        $('#error_message').html('');
    }, 5000);
}

function showInfo(message) {
    $('#error_message').css('display', 'inline');
    $('#error_message').addClass('success');
    $('#error_message').removeClass('warning');
    $('#error_message').html(message);
    setTimeout(function() {
        $('#error_message').css('display', 'none');
        $('#error_message').html('');
    }, 5000);
}

/*****************************************************************************
* Options
*****************************************************************************/

// Saves options to chrome.storage
function save_options() {
    var additional_keys = [];
    var start_index = 1;
    var i = start_index;
    var element = document.getElementById('key' + i);
    var key_id_element = document.getElementById('key_id' + i);
    while (element !== undefined && element !== null) {
        additional_keys[i - start_index] = 
        {
            key: element.value,
            id: key_id_element.value
        }
        ++i;
        element = document.getElementById('key' + i);
        key_id_element = document.getElementById('key_id' + i);
    }
    var additional_options = {};
    additional_options.ignore_no_filter = $("#ignore_if_no_filter").prop("checked");
    additional_options.include_instrument = $("#include_instrument").prop("checked");
    additional_options.custom_format = $("#custom_format").val();
    additional_options.use_local_bot = $("#local_bot").prop("checked");
    additional_options.use_beta = $("#use_beta").prop("checked");
    chrome.storage.sync.set({
        key: '',
        key2: '',
        additionalKeys: JSON.stringify(additional_keys),
        additionalOptions: additional_options
    }, function() {
        showInfo(chrome.i18n.getMessage("OptionsSaved"));
    });
}

function restore_options() {
    chrome.storage.sync.get({
        key: '',
        key2: '',
        additionalKeys: '',
        additionalOptions: {},
        last_buy: null
    }, function(items) {
        console.log(items.last_buy);
        if (items.key !== '') {
            create_KeyField(items.key, '');
        }
        if (items.key2 !== '') {
            create_KeyField(items.key2, '');
        }
        if (items.additionalKeys !== undefined && items.additionalKeys !== '') {
            var keys = JSON.parse(items.additionalKeys);
            for (var i = 0; i < keys.length; ++i) {
                create_KeyField(keys[i].key, keys[i].id);
            }
        }
        if (items.additionalOptions.ignore_no_filter === true) {
            $('#ignore_if_no_filter').prop('checked', true);
        }
        if (items.additionalOptions.include_instrument === true || items.additionalOptions.include_instrument === undefined) {
            $('#include_instrument').prop('checked', true);
        }
        if (items.additionalOptions.custom_format === undefined) {
            $('#custom_format').val("({{symbol}}, {{timeframe}}): {{message}}");
        }
        else {
            $('#custom_format').val(items.additionalOptions.custom_format);
        }
        if (items.additionalOptions.use_beta === true) {
            $('#use_beta').prop('checked', true);
        }
        if (items.additionalOptions.use_local_bot === true) {
            $('#local_bot').prop('checked', true);
        }
        else {
            $('#pr_bot').prop('checked', true);
        }
    });
}

/*****************************************************************************
* Test message
*****************************************************************************/

function send_test_message_to_user(user_key, key_id, field, url) {
    var test_message = $('#test_message').val();
    if (test_message === '') {
        test_message = "Test";
    }
    var message = ParseMessageText(test_message);
    if (!message.HasFilter && $("#ignore_if_no_filter").prop("checked")) {
        $(field).css('display', 'inline');
        $(field).addClass('warning');
        $(field).removeClass('success');
        $(field).html(chrome.i18n.getMessage("NoFilterIgnoreMessage"));
        return;
    }
    if (message.PassFilter(key_id)) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                console.log("ProfitRobots test message response: " + xhr.status, xhr);
                $(field).css('display', 'inline');
                if (xhr.status === 404) {
                    $(field).addClass('warning');
                    $(field).removeClass('success');
                    $(field).html(chrome.i18n.getMessage("TestFailed"));
                }
                else if (xhr.status === 0) {
                    $(field).addClass('warning');
                    $(field).removeClass('success');
                    $(field).html(chrome.i18n.getMessage("TestFailed"));
                }
                else {
                    $(field).addClass('success');
                    $(field).removeClass('warning');
                    $(field).html(chrome.i18n.getMessage("TestSuccess"));
                }
            }
        }
        if ($("#include_instrument").prop("checked")) {
            var formattedMessage = $("#custom_format").val();
            formattedMessage = formattedMessage.replace("{{symbol}}", 'symbol');
            formattedMessage = formattedMessage.replace("{{timeframe}}", 'timeframe');
            message.Message = formattedMessage.replace("{{message}}", message.Message);
        }
        var obj = {
            key: user_key,
            strategyname: "",
            platform: "TradingView",
            notifications: [ {
                text: message.Message,
                instrument: '',
                timeframe: ''
            } ]
        };
        var dataToSend = JSON.stringify(obj);
        xhr.send(dataToSend);
    }
    else {
        $(field).css('display', 'inline');
        $(field).addClass('warning');
        $(field).removeClass('success');
        $(field).html(chrome.i18n.getMessage("KeyIdDoNotMatch"));
    }
}

function send_test_message() {
    var url = GetUrl($("#local_bot").prop("checked"));

    var i = 1;
    var element = document.getElementById('key' + i);
    while (element !== undefined && element !== null) {
        var key = element.value;
        var id = document.getElementById('key_id' + i).value;
        if (key !== '') {
            if (i <= userData.max_keys) {
                send_test_message_to_user(key, id.trim(), '#status' + i, url);
            }
            else {
                var status = $('#status' + i);
                status.css('display', 'inline');
                status.html(chrome.i18n.getMessage("KeyLimitIsHit"));
            }
        }
        element = document.getElementById('key' + ++i);
    }
    
    setTimeout(function() {
        var ii = 1;
        while (ii < i) {
            var status = $('#status' + ii);
            status.css('display', 'none');
            status.html('');
            ++ii;
        }
    }, 3000);
}

/*****************************************************************************
* Restores select box and checkbox state using the preferences stored in chrome.storage.
*****************************************************************************/
function create_KeyField(value, key_id) {
    var index = userData.last_key + 1;

    var baseDiv = document.createElement('div');
    baseDiv.className = 'four fields';
    document.getElementById('keys').appendChild(baseDiv);

    var field1Div = document.createElement('div');
    field1Div.id = 'additional_key_' + index;
    field1Div.className = 'field';

    var label = document.createElement("label");
    label.id = 'key_label_' + index;
    label.innerText = chrome.i18n.getMessage("key_label") + index;
    field1Div.appendChild(label);

    var input = document.createElement('input');
    input.type = 'text';
    input.name = 'key' + index;
    input.placeholder = '1234567890:t123456789';
    input.id = 'key' + index;
    input.value = value;
    field1Div.appendChild(input);
    baseDiv.appendChild(field1Div);

    var field2Div = document.createElement('div');
    field2Div.className = 'field';

    var label2 = document.createElement("label");
    label2.id = 'key_id_label_' + index;
    label2.innerText = chrome.i18n.getMessage("key_id_label") + index;
    field2Div.appendChild(label2);

    var input2 = document.createElement('input');
    input2.type = 'text';
    input2.name = 'key_id' + index;
    input2.placeholder = '*';
    input2.id = 'key_id' + index;
    input2.value = key_id === undefined || key_id === null ? '' : key_id;
    field2Div.appendChild(input2);
    baseDiv.appendChild(field2Div);
    
    var messageDiv = document.createElement('div');
    messageDiv.id = 'status' + index;
    messageDiv.className = 'ui warning message';
    $('#status' + index).css('display', 'none');
    baseDiv.appendChild(messageDiv);

    userData.last_key = index;
}

/*****************************************************************************
* Update/handle the user interface actions
*****************************************************************************/
function add_key() {
    create_KeyField('', '');
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('add_button').addEventListener('click', add_key);
document.getElementById('save_button').addEventListener('click', save_options);
document.getElementById('test_button').addEventListener('click', send_test_message);
$('#add_button').html(chrome.i18n.getMessage("add_button"));
$('#save_button').html(chrome.i18n.getMessage("save_button"));
$('#test_button').html(chrome.i18n.getMessage("test_button"));
$('#key_key_info').html(chrome.i18n.getMessage("key_key_info"));
$('#name_caption').html(chrome.i18n.getMessage("name_caption"));
$('#desc_caption').html(chrome.i18n.getMessage("desc_caption"));
$('#price_caption').html(chrome.i18n.getMessage("price_caption"));
$('#ignore_if_no_filter_label').html(chrome.i18n.getMessage("ignore_if_no_filter_label"));
$('#include_instrument_label').html(chrome.i18n.getMessage("include_instrument_label"));
$('#use_beta_label').html(chrome.i18n.getMessage("use_beta_label"));
$('#bot_hosting').html(chrome.i18n.getMessage("bot_hosting"));
$('#pr_bot_label').html(chrome.i18n.getMessage("pr_bot_label"));
$('#local_bot_label').html(chrome.i18n.getMessage("local_bot_label"));
$('#pr_bot_desc').html(chrome.i18n.getMessage("pr_bot_desc"));
$('#local_bot_desc').html(chrome.i18n.getMessage("local_bot_desc"));
$('#keys_title').html(chrome.i18n.getMessage("keys_title"));
$('#test_title').html(chrome.i18n.getMessage("test_title"));
$('#beta_features_title').html(chrome.i18n.getMessage("beta_features_title"));
$('#external_execution').html(chrome.i18n.getMessage("external_execution"));
$('#test_message_label').html(chrome.i18n.getMessage("test_message_label"));
$('.ui.radio.checkbox').checkbox();
$('.menu .item').tab();