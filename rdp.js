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
				if (current !== value) {
					current = value;
					for (var i = 0; i < callbacks.length; i++) {
						callbacks[i](current);
					}
				}
			},
			get: function() {
				return current;
			}
		};
	};

	function discrete(init, setter) {
		var current = init;
		var callbacks = [];

		function onValue(func) {
			callbacks.push(func);
		}

		if (setter) {
			setter(function(value) {
				if (current !== value) {
					current = value;
					var callbackCount = callbacks.length;
					for (var i = 0; i < callbackCount; i++) {
						callbacks[i](current);
					}
				}
			});
		}

		var res = function() {
			return current;
		};

		res.onValue = onValue;

		res.map = function(func) {
			return discrete(func(current), function(setValue) {
				onValue(function(value) {
					setValue(func(value));
				});
			});
		};

		res.buffer = function(size) {
			var init = new Array(size);
			init[size - 1] = current;
			var res = discrete(init, function(setValue) {
				onValue(function(value) {
					var curBuffer = res().slice(1);
					curBuffer.push(value);
					setValue(curBuffer);
				});
			});
			return res;
		};

		res.merge = function(other) {
			return discrete(current || other(), function(setValue) {
				if (other.onValue) {
					other.onValue(function(value) {
						setValue([current, value]);
					});
				}
				onValue(function(value) {
					setValue([value, other()]);
				});
			});
		};

		res.or = function(other) {
			return discrete(current || other(), function(setValue) {
				function set() {
					setValue(current || other());
				}
				if (other.onValue) {
					other.onValue(set);
				}
				onValue(set);
			});
		};

		return res;
	};
	exports.discrete = discrete;

	exports.merge = function(signals) {
		if (!Array.isArray(signals)) {
			signals = Array.prototype.slice.call(arguments);
		}

		function getValue() {
			return signals.map(function(signal) { return signal(); });
		}

		return discrete(getValue(), function(setValue) {
			for (var i = 0; i < signals.length; i++) {
				if (signals[i].onValue) {
					signals[i].onValue(function() {
						setValue(getValue());
					});
				}
			}
		});
	};

	exports.flatten = function(signals) {
		if (!Array.isArray(signals)) {
			signals = Array.prototype.slice.call(arguments);
		}

		return discrete(undefined, function(setValue) {
			for (var i = 0; i < signals.length; i++) {
				if (signals[i].onValue) {
					signals[i].onValue(setValue);
				}
			}
		});
	};

	return exports;
})();
