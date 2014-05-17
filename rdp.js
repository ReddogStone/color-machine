var RDP = (function() {
	'use strict';

	var exports = {};

	function discreteObserver(init, setter) {
		var callbacks = [];
		if (setter) {
			setter(function(value) {
				var count = callbacks.length;
				for (var i = 0; i < count; i++) {
					callbacks[i](value);
				}
			});
		}

		return {
			map: function(func) {
				return discreteObserver(func(init), function(setValue) {
					callbacks.push(function(value) {
						setValue(func(value));
					});
				});
			},
			buffer: function(size) {
				var buffer = new Array(size);
				buffer[size - 1] = init;
				return discreteObserver(buffer, function(setValue) {
					callbacks.push(function(value) {
						var current = buffer.slice(1);
						current.push(value);
						setValue(current);
					});
				});
			},
			merge: function(other) {
				return exports.merge(this, other);
			},
			or: function(other) {
				return exports.prioritize(this, other);
			},
			store: function(initValue) {
				return discrete(initValue || init, function(setValue) {
					callbacks.push(setValue);
				});
			}
		};
	}
	exports.discreteObserver = discreteObserver;

	function discrete(init, setter) {
		var current = init;
		var callbacks = [];

		if (setter) {
			setter(function(value) {
				if (current !== value) {
					current = value;
					var count = callbacks.length;
					for (var i = 0; i < count; i++) {
						callbacks[i](current);
					}
				}
			});
		}

		var res = function() {
			return current;
		};

		res.map = function(func) {
			return discreteObserver(func(current), function(setValue) {
				callbacks.push(function(value) {
					setValue(func(value));
				});
			});
		};
		res.buffer = function(size) {
			var buffer = new Array(size);
			buffer[size - 1] = current;
			return discreteObserver(buffer, function(setValue) {
				callbacks.push(function(value) {
					var current = buffer.slice(1);
					current.push(value);
					setValue(current);
				});
			});
		};
		res.merge = function(other) {
			return exports.merge(this, other);
		};
		res.or = function(other) {
			return exports.prioritize(this, other);
		};
		res.store = function(initValue) {
			return discrete(current || initValue, function(setValue) {
				callbacks.push(setValue);
			});
		};

		return res;
	};
	exports.discrete = discrete;

	function createValueSetter(values, setValue, index) {
		return function(value) {
			values[index] = value;
			setValue(values);
		};
	}

	exports.merge = function(signals) {
		if (!Array.isArray(signals)) {
			signals = Array.prototype.slice.call(arguments);
		}

		var values = signals.map(function(signal) {
			if (typeof signal === 'function') {
				return signal();
			} else {
				return signal.store()();
			}
		});

		return discreteObserver(values, function(setValue) {
			for (var i = 0; i < signals.length; i++) {
				signals[i].map(createValueSetter(values, setValue, i));
			}
		});
	};

	exports.flatten = function(signals) {
		if (!Array.isArray(signals)) {
			signals = Array.prototype.slice.call(arguments);
		}

		return discreteObserver(undefined, function(setValue) {
			for (var i = 0; i < signals.length; i++) {
				signals[i].map(setValue);
			}
		});
	};

	exports.prioritize = function() {
		return exports.merge.apply(null, arguments).map(function(values) {
			for (var i = 0; i < values.length; i++) {
				if (values[i]) {
					return values[i];
				}
			}
		});
	};

	return exports;
})();
