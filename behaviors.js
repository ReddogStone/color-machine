var CM = (function(exports) {
	exports.Behaviors = {
		static: function(value, beginT, endT) {
			var res = function() {
				return value;
			};
			res.beginT = beginT || 0;
			res.endT = endT || Number.POSITIVE_INFINITY;
			return res;
		},
		linearV2: function(beginT, endT, beginValue, endValue) {
			beginValue = CM.V2.construct(beginValue);
			endValue = CM.V2.construct(endValue);

			var duration = endT - beginT;
			var res = function() {
				var now = Math.min(Math.max(CM.Time.now(), beginT), endT);
				var percentage = (now - beginT) / duration;
				return CM.V2.construct(
					beginValue.x * (1 - percentage) + endValue.x * percentage,
					beginValue.y * (1 - percentage) + endValue.y * percentage
				);
			};
			res.beginT = beginT;
			res.endT = endT;
			return res;
		},
		merge: function(behaviors) {
			if (!Array.isArray(behaviors)) {
				behaviors = Array.prototype.slice.call(arguments);
			}
			behaviors.sort(function(b1, b2) {
				return b1.beginT - b2.beginT;
			});
			var absoluteBegin = behaviors[0].beginT;
			var absoluteEnd = behaviors[behaviors.length - 1].endT;
			var current = 0;
			var res = function() {
				var now = Math.min(Math.max(CM.Time.now(), absoluteBegin), absoluteEnd);
				while (current < (behaviors.length - 1) && (now > behaviors[current + 1].beginT)) {
					current++;
				}
				var behavior = behaviors[current];
				return behavior();
			}
			res.beginT = absoluteBegin;
			res.endT = absoluteEnd;
			return res;
		}
	};

	return exports;
})(CM || {});