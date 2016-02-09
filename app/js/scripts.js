d3.selection.prototype.first = function() {
	return d3.select(this[0][0]);
};

d3.selection.prototype.last = function() {
	var last = this.size() - 1;
	return d3.select(this[0][last]);
};

function positioning(x_pos, y_pos) {
	return [window.innerWidth * x_pos, window.innerHeight * y_pos];
}

// Returns transform:translate values
function translatePos(x_pos, y_pos, index) {
	var p = positioning(x_pos, y_pos);
	if (index !== undefined) {
		return "translate(" + p[0]*index + ", " + p[1] + ")";
	} else {
		return "translate(" + p[0] + ", " + p[1] + ")";	
	}
}

function getStepsPos(i) {
	var pos = [];
	d3.selectAll('.step').select('circle').each(function(el, i) {
		pos.push(parseInt(this.getAttribute('cx')));
	});
	return (i !== undefined) ? pos[i] : pos;
}

function createSteps() {
	d3.json('data.json', function(error, data) {
		dataViz(data.steps);
	});

	function dataViz(data) {

		// SVG CREATION
		d3.select('body').append('svg')
		var svg = d3.select('svg');

		// SVG SIZING
		svg.sizing = function() {
			this.attr({
				'width': window.innerWidth,
				'height': window.innerHeight
			});
		};

		// CREATION NODE CONTAINER 
		svg
			.append('g')
			.attr({
				'id': 'nodes',
				'transform': function () {
					return translatePos(.5, .75);
				}
			});
		var nodesG = d3.select('g#nodes');

		// CREATING STEP CONTAINER
		svg
			.append('g')
			.attr({
				'id': 'steps',
				'transform': function () {
					return translatePos(.5, .75);
				}
			});
		var group = d3.select('g#steps');
			

		// CREATING NODES
		nodesG
			.selectAll('g')
			.data(data)
			.enter()
			.append('g')
			.attr({
				'travel': function(d,i) {return [ i+1, i+2] },
				'class': 'node'
			})
			.last()
			.remove();
		var nodes = d3.selectAll('g.node');

		// CREATING NODE LINES
		nodes.append('line');
		nodes.append('line');
		d3.selectAll('.node').selectAll('lines')
			.attr('class', 'nodeL');
		var nodesL = d3.selectAll('.nodeL');

		// CREATING NODE CIRCLES
		nodes
			.append('circle')
			.attr({
				'class': 'nodeC',
				'r': 5,			
			});
		var nodesC = d3.selectAll('.nodeC');
		
		
		// CREATING STEPS
		group
			.selectAll('g')
			.data(data)
			.enter()
			.append('g')
			.attr({
				'id': function(d,i) {return d.id},
				'class': 'step'
			})
		var steps = d3.selectAll('g.step');

		// CREATING CIRCLES
		steps
			.append('circle')
			.attr({
				'r': 10,
				'class': 'stepC'
			});
		var stepsC = steps.selectAll('.stepC');

		// POSITIONING STEPS
		steps.each(function(el, i) {
			var stepC = d3.select(this).select('circle');
			var x_pos = window.innerWidth / 2 * i;
			stepC.attr('cx', Math.round(x_pos));
		});

		// POSITIONING NODE-CIRCLES
		nodes.each(function(el, i) {
			var nodeC = d3.select(this).select('circle');
			var x_pos = (getStepsPos(i+1) - getStepsPos(i)) / 2 + getStepsPos(i);
			nodeC.attr('cx', function () {
				return Math.round(x_pos);
			});
		})

		// POSITIONING NODE-LINES
		nodes.each(function(el, i) {
			var line1 = d3.select(this).selectAll('line').first();
			var line2 = d3.select(this).selectAll('line').last();
			line1.attr({
				'x1': getStepsPos(i),
				'x2': (getStepsPos(i+1) - getStepsPos(i)) / 2 + getStepsPos(i),
			});
			line2.attr({
				'x1': (getStepsPos(i+1) - getStepsPos(i)) / 2 + getStepsPos(i),
				'x2': getStepsPos(i+1)
			});
		})

		// d3.selectAll('g#nodes, g#steps').attr('transform', translatePos(0, .75));

		window.onload = function(event) { svg.sizing(); };
		window.onresize = function(event) {	svg.sizing(); };



		var circles = d3.selectAll('circle');
		console.log(circles);
		circles
		.call(d3.behavior.drag().on('drag', function (d) {
			console.log(d3.event);
			d3.select(this).attr("transform", function(d,i){

                return "translate(" + [ d3.event.x,d3.event.y ] + ")"
            })
		}));

	}

}

createSteps();


var cursorX,
	cursorY;
document.onmousemove = function(e){
    cursorX = e.pageX;
    cursorY = e.pageY;
}




var interval = null;
var seps_pos = {}
steps_pos = {
	'x': function() { return positioning(.5, .75)[0] }(),
	'y': function() { return positioning(.5, .75)[1] }(),
	'currentX': function() { return positioning(.5, .75)[0] }(),
	'direction': null
};

var initial = true;
	changeStep = false;
	direction = null
function moveSteps() {
	if(initial) {
		cursor_ini = cursorX;
		initial = false;
	}
	var x_var = parseInt(cursorX - cursor_ini),
		x_interaction = 0;
	if (steps_pos.direction === null && x_var<0) {
		steps_pos.direction = 'neg';
	} else if (steps_pos.direction === null && x_var>0) {
		steps_pos.direction = 'pos';
	}

	if (Math.abs(x_var)>320 || changeStep) {
		changeStep = true;
	}
	if(Math.abs(x_var) < 320 && !changeStep) {
		if (steps_pos.direction == 'neg') {
			x_interaction = x_var * (1.046762 + 0.00139874 * x_var);
		} else if (steps_pos.direction == 'pos') {
			x_interaction = x_var * (1.046762 - 0.00139874 * x_var);
		} else {
			x_interaction = x_var;
		}
	} else {
		if (steps_pos.direction == 'neg') {
			x_interaction = 0.15 * x_var - 144;	
		} else if (steps_pos.direction == 'pos') {
			x_interaction = 0.15 * x_var + 144;
		} else {
			x_interaction = x_var;
		}	
	}

	d3.selectAll('g#steps, g#nodes')
	.transition()
	.duration(500)
	.ease('linear')
	.attr('transform', function () {
		return 'translate(' + (steps_pos.x+x_interaction) + ',' + steps_pos.y + ')';
	});
	steps_pos.currentX = steps_pos.x + x_interaction;
}


function changingStep() {
	console.log('hola');
}


var variation = 0,
	init2 = true;

document.onmousedown = function(event) {
	if(event.target.tagName == 'circle') {

	} else {
		interval = setInterval("moveSteps()", 50);
	}
}

document.onmouseup = function(event) {
	clearInterval(interval);
	
	if(changeStep) {
		changingStep();
	} else {

	}
	steps_pos.x = steps_pos.currentX;
	
	initial = true;
	
	changeStep = false;
	steps_pos.direction = null;
}
