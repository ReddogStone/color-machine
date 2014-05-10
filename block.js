var CM = (function(exports) {
	exports.BlockBody = {
		init: function(pos, size, color) {
			this.pos = CM.V2.construct(pos);
			this.size = CM.V2.construct(size);
			this.color = CM.Color.construct(color);
		},
		rect: function() {
			var pos = this.pos;
			var size = this.size;
			return {
				x: pos.x - 0.5 * size.x,
				y: pos.y - 0.5 * size.y,
				sx: size.x,
				sy: size.y
			};
		},
		pointInside: function(point) {
			return pointInRect(point, this.rect());
		}
	};

	return exports;
})(CM || {});