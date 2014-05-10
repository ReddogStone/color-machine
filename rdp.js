var RDP = (function() {
	'use strict';

	var exports = {};

	exports.signal = function(init) {
		var current = init;
		var callbacks = [];

		return {
			onValue: function(callback) {
				callbacks.push(callback);
			},
			set: function(value) {
				current = value;
				for (var i = 0; i < callbacks.length; i++) {
					callbacks[i](current);
				}
			},
			get: function() {
				return current;
			}
		};
	};

	return exports;
})();
