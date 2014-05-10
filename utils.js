Object.prototype.construct = function() {
	var res = Object.create(this);
	if (res.init) {
		res.init.apply(res, arguments);
	}
	return res;
};
