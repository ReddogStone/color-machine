var CM = (function(exports) {
	exports.Time = {
		multiplier: 1,
		now: function() {
			return this.multiplier * performance.now();
		}
	};

	return exports;
})(CM || {});