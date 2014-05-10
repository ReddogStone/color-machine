var CM = (function(exports) {
	exports.V2 = {
		init: function(x, y) {
			if (Array.isArray(x)) {
				y = x[1];
				x = x[0];
			} else if (CM.V2.isPrototypeOf(x)) {
				y = x.y;
				x = x.x;
			}
			this.x = x || 0;
			this.y = y || 0;
		}
	};

	return exports;
})(CM || {});