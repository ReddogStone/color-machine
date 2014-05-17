var RDP = (function() {
	'use strict';

	var exports = {};

	function makeMap(callbacks, initValue) {
		return function(func) {
			return discreteObserver(func(initValue), function(setValue) {
				callbacks.push(function(value) {
					setValue(func(value));
				});
			});
		};
	}

	function makeBuffer(callbacks, initValue) {
		return function(size) {
			var buffer = new Array(size);
			buffer[size - 1] = initValue;
			return discreteObserver(buffer, function(setValue) {
				callbacks.push(function(value) {
					var current = buffer.slice(1);
					current.push(value);
					setValue(current);
				});
			});
		};
	}

	function makeStore(callbacks, initValue) {
		return function(explicitInit) {
			return discrete(explicitInit || initValue, function(setValue) {
				callbacks.push(setValue);
			});
		};
	}

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
			map: makeMap(callbacks, init),
			buffer: makeBuffer(callbacks, init),
			merge: function(other) {
				return exports.merge(this, other);
			},
			or: function(other) {
				return exports.prioritize(this, other);
			},
			store: makeStore(callbacks, init),
			disconnect: function() {
				callbacks.length = 0;
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

		res.map = makeMap(callbacks, current);
		res.buffer = makeBuffer(callbacks, current);
		res.merge = function(other) {
			return exports.merge(this, other);
		};
		res.or = function(other) {
			return exports.prioritize(this, other);
		};
		res.store = makeStore(callbacks, current);
		res.disconnect = function() {
			callbacks.length = 0;
		}		

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
