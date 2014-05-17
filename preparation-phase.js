var CM = (function(exports) {
	function squareDist(from, to) {
		var dx = to.x - from.x;
		var dy = to.y - from.y;
		return dx * dx + dy * dy;
	}

	function offset(stateSignal, mousePosSignal, object) {
		var storedMousePos = mousePosSignal.store({x: 0, y: 0});
		return stateSignal.buffer(2).map(function(buffer) {
			var previous = buffer[0];
			var current = buffer[1];
			if ((previous == 'up') && (current == 'down')) {
				var mousePos = storedMousePos();
				if (object.pointInside(mousePos)) {
					var objPos = object.pos;
					return {
						x: objPos.x - mousePos.x,
						y: objPos.y - mousePos.y
					};
				}
			}
			return undefined;
		});
	}

	function drag(mousePosSignal, offsetSignal) {
		return mousePosSignal.merge(offsetSignal).map(function(value) {
			var mousePos = value[0];
			var offset = value[1];
			if (offset) {
				return {
					x: mousePos.x + offset.x,
					y: mousePos.y + offset.y
				};
			}
		});
	}

	function ballIndexes(dragSignals, initial, getPosition, proximity) {
		var indexes = initial.slice();
		var res = RDP.discrete(initial, function(setValue) {
			RDP.merge(dragSignals).map(function(dragValues) {
				for (var i = 0; i < indexes.length; i++) {
					var dragIndex = indexes[i];
					var dragValue = dragValues[dragIndex];
					if (dragValue) {
						for (var j = 0; j < indexes.length; j++) {
							var targetPos = getPosition(j);
							if ((j !== i) && (squareDist(dragValue, targetPos) < proximity * proximity)) {
								indexes.splice(i, 1);
								indexes.splice(j, 0, dragIndex);
								setValue(indexes.slice());
								return;
							}
						}
					}
				}
			});
		});
		return res;
	}

	function returnPos(indexesSignal, myIndex, getPosition) {
		return indexesSignal.map(function(value) {
			var myPosIndex = value.indexOf(myIndex);
			if (myPosIndex >= 0) {
				return getPosition(myPosIndex);
			}			
		});
	}

	function shownIndexes(indexesSignal, dragSignals, getPosition, proximity) {
		return RDP.merge(dragSignals).map(function(dragValues) {
			var res = [];
			var indexes = indexesSignal();
			for (var i = 0; i < indexes.length; i++) {
				var dragIndex = indexes[i];
				var dragValue = dragValues[dragIndex];
				var returnPos = getPosition(i);
				if (!dragValue || (squareDist(returnPos, dragValue) < proximity * proximity)) {
					res.push(indexes[i]);
				}
			}
			return res;
		});
	}

	function follow(init, dragSignal, targetSignal) {
		return CM.Behaviors.followTargetV2(init,
			function() { return targetSignal(); },
			function() { return dragSignal() ? 0.001 : 0.1; });
	}

	function bindPositions(objects, mousePosSignal, mouseStateSignal, onReorder, getPosition, proximity) {
		var originalObjects = objects.slice();
		var dragSignals = objects.map(function(object) {
			var offsetSignal = offset(mouseStateSignal, mousePosSignal, object.body);
			return drag(mousePosSignal, offsetSignal).store();
		});

		var indexes = objects.map(function(_, index) { return index; });
		var indexesSignal = ballIndexes(dragSignals, indexes, getPosition, proximity);
		var shownIndexesSignal = shownIndexes(indexesSignal, dragSignals, getPosition, proximity);

		RDP.flatten(dragSignals).map(function(value) {
			if (value === undefined) {
				var indexes = indexesSignal();
				var newObjects = indexes.map(function(index) { return originalObjects[index]; });
				onReorder(newObjects);
			}
		});

		for (var i = 0; i < dragSignals.length; i++) {
			var object = objects[i];
			var body = object.body;
			var dragSignal = dragSignals[i];
			var currentPosSignal = returnPos(shownIndexesSignal, i, getPosition);
			var returnPosSignal = returnPos(indexesSignal, i, getPosition);
			var targetSignal = RDP.prioritize(dragSignal, currentPosSignal, returnPosSignal).store();
			Object.defineProperty(object.body, 'pos', {
				configurable: true,
				get: follow(body.pos, dragSignal, targetSignal)
			});
		}
	}	

	var PreparationPhase = {
		start: function(stateMachine, mousePos, buttonState) {
			function reorderBalls(newBalls) {
				stateMachine.reorderBalls(newBalls);
			}

			function getBallPosition(index) {
				return stateMachine.ballPosition(index);
			}

			function reorderBlocks(newBlocks) {
				stateMachine.reorderBlocks(newBlocks);
			}

			function getBlockPosition(index) {
				return stateMachine.blockPosition(index);
			}

			bindPositions(stateMachine.balls,
				mousePos, buttonState, reorderBalls, getBallPosition, 25);
			bindPositions(stateMachine.boundBlocks,
				mousePos, buttonState, reorderBlocks, getBlockPosition, 50);			
		}
	};
	exports.PreparationPhase = PreparationPhase;

	return exports;
})(CM || {});