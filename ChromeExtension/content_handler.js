
function init() {
	window.localStorage.setItem("PrivateChannel", window.user.private_channel);
}

document.addEventListener("DOMContentLoaded", init);
