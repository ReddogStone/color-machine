var CM = (function(exports) {
	exports.BallBody = {
		init: function(pos, radius, color) {
			this.pos = CM.V2.construct(pos);
			this.radius = radius ? radius : 1;
			this.color = CM.Color.construct(color);
		}
	};

	return exports;
})(CM || {});