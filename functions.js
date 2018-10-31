module.exports = {
	generateRandomString : function() {
		const set = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
		const output = [];
		for (let i = 0; i < 6; i++) {
			output.push(set[Math.floor(Math.random() * 36)]);
		}
		return output.join('');
	},
	validateEmail: function (email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}
};