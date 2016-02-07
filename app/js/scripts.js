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
};

function log(x) {
	return (x < 0)	? -(Math.log1p(-x)*Math.log1p(-x)*Math.log10(-x)*Math.log10(-x))
					: Math.log1p(x)*Math.log1p(x)*Math.log10(x)*Math.log10(x);
}

var initial = true;
function moveSteps() {
	if(initial) {
		cursor_ini = cursorX;
	}
	var x_var = parseInt(cursorX - cursor_ini);
	if(x_var !== 0) x_var = log(x_var);
	
	d3.selectAll('g#steps, g#nodes')
	.attr('transform', function () {
		return 'translate(' + (steps_pos.x+x_var) + ',' + steps_pos.y + ')';
	});
	steps_pos.currentX = steps_pos.x + x_var;
	initial = false;

}


document.onmousedown = function(event) {
	if(event.target.tagName == 'circle') {
	} else {
		interval = setInterval("moveSteps()", 5);
	}
}

document.onmouseup = function(event) {
	if(interval !== null) {
		clearInterval(interval)
	}
	steps_pos.x = steps_pos.currentX;
	interval = null;
	initial = true;
}