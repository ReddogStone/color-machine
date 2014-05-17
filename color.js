var CM = (function(exports) {
	function saturate(value) {
		return Math.min(Math.max(value, 0.0), 1.0);
	}

	exports.Color = {
		init: function(r, g, b, a) {
			if (Array.isArray(r)) {
				g = r[1];
				b = r[2];
				a = r[3];
				r = r[0];
			} else if (CM.Color.isPrototypeOf(r)) {
				g = r.g;
				b = r.b;
				a = r.a;
				r = r.r;
			} else if ((typeof r === 'string') && (r.charAt(0) == '#')) {
				g = parseInt(r.substr(3, 2), 16) / 255.0;
				b = parseInt(r.substr(5, 2), 16) / 255.0;
				r = parseInt(r.substr(1, 2), 16) / 255.0;
			}
			this.r = r || 0;
			this.g = g || 0;
			this.b = b || 0;
			this.a = a ? a : 1;
		},
		scale: function(factor) {
			return CM.Color.construct(this.r * factor, this.g * factor, this.b * factor, this.a);
		},
		invert: function() {
			return CM.Color.construct(1.0 - this.r, 1.0 - this.g, 1.0 - this.b, this.a);
		},
		interpolate: function(other, alpha) {
			return CM.Color.construct(
				(1 - alpha) * this.r + alpha * other.r,
				(1 - alpha) * this.g + alpha * other.g,
				(1 - alpha) * this.b + alpha * other.b,
				this.a);
		},
		toCSS: function() {
			var r = Math.floor(saturate(this.r) * 255);
			var g = Math.floor(saturate(this.g) * 255);
			var b = Math.floor(saturate(this.b) * 255);
			var a = saturate(this.a);
			return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
		},
		get white() {
			return CM.Color.construct(1.0, 1.0, 1.0, 1.0);
		},
		get black() {
			return CM.Color.construct(0.0, 0.0, 0.0, 1.0);
		}
	};

	return exports;
})(CM || {});