var CM = (function(exports) {
	exports.State = {
		init: function(id, transitions) {
			this.id = id;
			this.transitions = transitions || {};
		},
		setTransition: function(input, shift) {
			this.transitions[input] = shift;
		},
		removeTransition: function(input) {
			delete this.transitions[input];
		}
	};

	return exports;
})(CM || {});