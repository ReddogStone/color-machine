var CM = (function(exports) {
	exports.BallBody = {
		init: function(pos, radius) {
			this.pos = CM.V2.construct(pos);
			this.radius = radius ? radius : 1;
		}
	};

	return exports;
})(CM || {});