var CM = (function(exports) {
	var COLORS = [
		[1.0, 0.0, 0.0, 1.0],
		[0.0, 0.0, 1.0, 1.0],
		[0.0, 1.0, 0.0, 1.0]
	];

	var BALL_OFF_X = 50;
	var BALL_OFF_Y = 500;
	var BALL_RADIUS = 20;
	var BALL_MARGIN = 5;
	var BALL_FINAL_OFF_X = 1024 - 50;

	var BLOCK_OFF_X = 512;
	var BLOCK_OFF_Y = 400;
	var BLOCK_SX = 100;
	var BLOCK_SY = 50;
	var BLOCK_MARGIN = 5;

	var FREE_BLOCK_OFF_X = 80;
	var FREE_BLOCK_OFF_Y = 300;

	var BALL_SPEED = 200;
	var BLOCK_SPEED = 50;

	function initBall(index, id) {
		var body = CM.BallBody.construct(
			CM.V2.construct(BALL_OFF_X + index * (BALL_RADIUS * 2 + BALL_MARGIN), BALL_OFF_Y),
			BALL_RADIUS,
			COLORS[id]);
		return {
			id: id,
			body: body
		};
	}

	function initFreeBlock(index, state) {
		var id = Object.keys(state.transitions)[0];

		var body = CM.BlockBody.construct(
			[FREE_BLOCK_OFF_X, FREE_BLOCK_OFF_Y - index * (BLOCK_SY + BLOCK_MARGIN)],
			[BLOCK_SX, BLOCK_SY],
			COLORS[id]);
		return {
			state: state,
			body: body
		};
	}

	function blockPosition(index) {
		return CM.V2.construct([BLOCK_OFF_X, BLOCK_OFF_Y - index * (BLOCK_SY + BLOCK_MARGIN)]);
	}

	function positionBlock(index, block) {
		block.body.pos = CM.V2.construct([BLOCK_OFF_X, BLOCK_OFF_Y - index * (BLOCK_SY + BLOCK_MARGIN)]);
	}

	function nextBallBehavior(ball, beginT) {
		var pos = ball.pos;
		var duration = 1000 * (BLOCK_OFF_X - pos.x) / BALL_SPEED;
		return CM.Behaviors.linearV2(beginT, beginT + duration, pos, [BLOCK_OFF_X, BALL_OFF_Y]);
	}

	function finishBallBehavior(ball, index, beginT) {
		var finalX = BALL_FINAL_OFF_X - index * (BALL_RADIUS * 2 + BALL_MARGIN);
		var duration = 1000 * (finalX - BLOCK_OFF_X) / BALL_SPEED;
		return CM.Behaviors.linearV2(beginT, beginT + duration, [BLOCK_OFF_X, BALL_OFF_Y], 
			[finalX, BALL_OFF_Y]);
	}

	function shift(blocks, shift) {
		var res = blocks.slice();
		if (shift < 0) {
			for (var i = 0; i < -shift; i++) {
				res.push(res.shift());
			}
		} else {
			for (var i = 0; i < shift; i++) {
				res.unshift(res.pop());
			}
		}
		return res;
	}

	function step(id, blocks) {
		return blocks[0].state.transitions[id] || 0;
	}

	function appendBlockShiftBehaviors_old(blocks, shiftValue, beginT) {
		if (shiftValue !== 0) {
			var duration = 2000;
			for (var j = 0; j < blocks.length; j++) {
				var block = blocks[j];
				block.behaviors.push(CM.Behaviors.linearV2(beginT, 
					beginT + duration,
					blockPosition(j),
					blockPosition((blocks.length + j + shiftValue) % blocks.length)));
			}
		}
	}
	function appendBlockShiftBehaviors(blocks, shiftValue, beginT) {
		var duration = 1000;
		var blockCount = blocks.length;
		if (shiftValue >= 0) {
			for (var i = 0; i < shiftValue; i++) {
				var block = blocks[blockCount - 1];
				var beginPos = blockPosition(blockCount - 1);
				var endPos = CM.V2.construct(beginPos.x + BLOCK_SX + BLOCK_MARGIN, beginPos.y);
				block.behaviors.push(CM.Behaviors.linearV2(beginT,
					beginT + duration * 0.25,
					beginPos,
					endPos));

				beginPos = endPos;
				endPos = blockPosition(0);
				endPos = CM.V2.construct(endPos.x + BLOCK_SX + BLOCK_MARGIN, endPos.y);
				block.behaviors.push(CM.Behaviors.linearV2(beginT + duration * 0.25,
					beginT + duration * 0.75,
					beginPos,
					endPos));

				beginPos = endPos;
				endPos = blockPosition(0);
				block.behaviors.push(CM.Behaviors.linearV2(beginT + duration * 0.75,
					beginT + duration,
					beginPos,
					endPos));

				for (var j = 0; j < blockCount - 1; j++) {
					block = blocks[j];
					block.behaviors.push(CM.Behaviors.linearV2(beginT + duration * 0.25,
						beginT + duration * 0.75,
						blockPosition(j),
						blockPosition(j + 1)));
				}
				beginT += duration;
				blocks = shift(blocks, 1);
			}
		} else if (shiftValue < 0) {
			for (var i = 0; i < -shiftValue; i++) {
				var block = blocks[0];
				var beginPos = blockPosition(0);
				var endPos = CM.V2.construct(beginPos.x + BLOCK_SX + BLOCK_MARGIN, beginPos.y);
				block.behaviors.push(CM.Behaviors.linearV2(beginT,
					beginT + duration * 0.25,
					beginPos,
					endPos));

				beginPos = endPos;
				endPos = blockPosition(blockCount - 1);
				endPos = CM.V2.construct(endPos.x + BLOCK_SX + BLOCK_MARGIN, endPos.y);
				block.behaviors.push(CM.Behaviors.linearV2(beginT + duration * 0.25,
					beginT + duration * 0.75,
					beginPos,
					endPos));

				beginPos = endPos;
				endPos = blockPosition(blockCount - 1);
				block.behaviors.push(CM.Behaviors.linearV2(beginT + duration * 0.75,
					beginT + duration,
					beginPos,
					endPos));

				for (var j = 1; j < blockCount; j++) {
					block = blocks[j];
					block.behaviors.push(CM.Behaviors.linearV2(beginT + duration * 0.25,
						beginT + duration * 0.75,
						blockPosition(j),
						blockPosition(j - 1)));
				}
				beginT += duration;
				blocks = shift(blocks, -1);
			}
		} else {
			for (var i = 0; i < blockCount; i++) {
				block = blocks[j];
				block.behaviors.push(CM.Behaviors.static(blockPosition(i),
					beginT,
					beginT + duration));
			}
		}
	}

	exports.StateMachine = {
		init: function() {
			this.balls = [];
			this.boundBlocks = [];
			this.freeBlocks = [];
		},
		setBalls: function(ids) {
			for (var i = 0; i < ids.length; i++) {
				var id = ids[i];
				this.balls.push(initBall(i, id));
			}
		},
		setFreeBlocks: function(states) {
			for (var i = 0; i < states.length; i++) {
				var state = states[i];
				this.freeBlocks.push(initFreeBlock(i, state));
			}			
		},
		bindBlock: function(block, boundIndex) {
			boundIndex = boundIndex ? boundIndex : this.boundBlocks.length;
			this.freeBlocks.splice(this.freeBlocks.indexOf(block), 1);
			this.boundBlocks.splice(boundIndex, 0, block);
			positionBlock(boundIndex, block);
		},
		start: function() {
			var currentTime = CM.Time.now();
			var blocks = this.boundBlocks.map(function(block) {
				block.behaviors = [];
				return block;
			});

			for (var i = this.balls.length - 1; i >= 0; i--) {
				var ball = this.balls[i];
				var body = ball.body;
				var posBehavior = nextBallBehavior(body, currentTime);
				currentTime = posBehavior.endT;

				var shiftValue = step(ball.id, blocks);
				appendBlockShiftBehaviors(blocks, shiftValue, currentTime);
				
				if (shiftValue !== 0) {
					currentTime = blocks[0].behaviors[blocks[0].behaviors.length - 1].endT;
				}

				blocks = shift(blocks, shiftValue);
				var newId = blocks[0].state.id;

				currentTime += 500;
				var colorBehavior = CM.Behaviors.merge(
					CM.Behaviors.static(CM.Color.construct(COLORS[ball.id]), 0, currentTime),
					CM.Behaviors.static(CM.Color.construct(COLORS[newId]), currentTime)
				);

				currentTime += 500;
				posBehavior = CM.Behaviors.merge(
					posBehavior, 
					finishBallBehavior(body, this.balls.length - i - 1, currentTime)
				);

				Object.defineProperty(body, 'pos', {
					configurable: true,
					get: posBehavior
				});

				Object.defineProperty(body, 'color', {
					configurable: true,
					get: colorBehavior
				});	
			}

			for (var i = 0; i < blocks.length; i++) {
				var block = blocks[i];
				var body = block.body;
				Object.defineProperty(body, 'pos', {
					configurable: true,
					get: CM.Behaviors.merge(block.behaviors)
				});
			}
		}
	};

	return exports;
})(CM || {});
