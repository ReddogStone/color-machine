var CM = (function(exports) {
	exports.Time = {
		now: function() {
			return performance.now();
		}
	};

	return exports;
})(CM || {});