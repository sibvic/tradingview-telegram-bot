
var local_url = "http://localhost:5000/api/v1/notification";
var public_url = "https://profitrobots.com/api/v1/notification";

function GetUrl(use_local) {
    return use_local === true ? local_url : public_url;
}

function ParseMessageText(text) {
    var idPattern = /\[([^\]]+)\]((.|\n|\r)+)?/g;
    var match = idPattern.exec(text);
    var res = {};
    res.PassFilter = function (id) {
        if (id === '') {
            return true;
        }
        for (var i = 0; i < this.Ids.length; ++i) {
            var currentId = this.Ids[i].trim().toUpperCase();
            if (currentId === '*' || currentId === id.toUpperCase()) {
                return true;
            }
        }
        return false;
    };

    if (match !== null) {
        res.HasFilter = true;
        res.Ids = match[1].split(",");
        if (match[2] === undefined) {
            res.Message = "";
        }
        else {
            res.Message = match[2];
        }
        return res;
    }
    res.HasFilter = false;
    res.Ids = ['*'];
    res.Message = text;
    return res;
}