var CM = (function(exports) {
	exports.BallBody = {
		init: function(pos, radius) {
			this.pos = CM.V2.construct(pos);
			this.radius = radius ? radius : 1;
		},
		pointInside: function(point) {
			var dx = point.x - this.pos.x;
			var dy = point.y - this.pos.y;
			var radius = this.radius;
			return (dx * dx + dy * dy) < (radius * radius);
		}
	};

	return exports;
})(CM || {});