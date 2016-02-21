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












Element.prototype.getTranslation = function() {
	
	var x = 0,
		y = 0;

	var attr = this.getAttribute('transform');

	if (~attr.indexOf('translate(')) {
		
		var sub = attr.substring(attr.indexOf('translate(') + 10);
		x = parseInt(sub.substring(0, sub.indexOf(',')));
		y = parseInt(sub.substring(sub.indexOf(',') + 1));

		return {x: x, y: y};

	} else {

		return {x: 0, y: 0};

	}

}

function getPosition(elements, index) {

	var position = [];

	if (typeof elements !== 'object') {
		elements = d3.selectAll('g');
	}

	if (Array.isArray(elements)) {

		while(elements.length === 1) {
			elements = elements[0];
		}

	} else {

		var array = [];
		array[0] = elements;
		elements = array;

	}

	if(index) {

		var element = [];
		element[0] = elements[index];
		elements = element;

	}

	elements.forEach(function(each, i) {

		position.push(

			{
				el: elements[i],
				top: elements[i].getBoundingClientRect().top,
				left: elements[i].getBoundingClientRect().left
			}

		);

	});

	return position;

}

function getRelativePosition(elements, index) {

	var position = getPosition(elements, index);

	position.forEach(function(each) {

		var el = each.el,
			parent;

		var x = 0,
			y = 0,
			translation;

		while(!!el.parentNode && el.parentNode !== document) {

			parent = el.parentNode;

			if(parent.hasAttribute('transform')) {
				var translation = parent.getTranslation();
				x += translation.x;
				y += translation.y;
			}

			el = parent;
		}
		each.top -= y;
		each.left -= x;
		console.log(x, y, each);
	});

	return position;

}







function render(tag, container, attr) {
	var obj = container.append(tag);
	
	for (property in attr) {
		obj.attr(property, attr[property])
	}

	return obj;
}


// SVG CREATION
var svg = d3.select('body').append('svg');


// SVG SIZING
svg.sizing = function() {
	this.attr({
		'width': window.innerWidth,
		'height': window.innerHeight
	});
};

window.onload = function(event) { svg.sizing(); };
window.onresize = function(event) {	svg.sizing(); };



var navigation = {


	position: {
		initial: {
			x: '50%',
			y: '75%'
		},

		stepDistance: {
			x: '50%',
			y: '0'
		},

		know_X: function(index) {
			
			var initial,
				translation,
				position;
			
			initial = parseInt(this.initial.x) * window.innerWidth / 100;
			
			translation = parseInt(this.stepDistance.x) * window.innerWidth / 100;

			position = Math.round(initial + (translation * index));

			return position;

		},

		know_Y: function(index) {

			var initial,
				translation,
				position;
			
			initial = parseInt(this.initial.y) * window.innerHeight / 100;

			translation = parseInt(this.stepDistance.y) * window.innerHeight / 100;

			position = Math.round(initial + translation * index);

			return position;

		},

		translate: function(index) {

			return 'translate(' + this.know_X(index) + ', ' + this.know_Y(index) + ')';

		}

	},



	steps: {},

	nodes: {},



	init: function (data) {

		this.createNodes.init(data.length-1);
		this.createSteps.init();

	},



	createSteps: {

		init: function(data) {

			this.container();

		},

		container: function() {

			navigation.steps.group = render('g', svg, {
				'id': 'steps',
				'transform': navigation.position.translate(0)
			});

		}

	},

	createNodes: {

		init: function(number) {
			
			this.setContainer();

			var nodes = this.nodes.render(number);

			this.nodes.lines.render(nodes);

		},

		setContainer: function() {		

			navigation.nodes.group = render('g', svg, {
				'id': 'nodes',
				'transform': navigation.position.translate(0)
			});

		},

		nodes: {

			attr: {
				className: 'node'
			},
				
			render: function(number) {

				var elements = []

				for(var i=0; i<number; i++) {

					var el = render('g', navigation.nodes.group, {
						'class': this.attr.className,
						'source': i,
						'target': i+1
					});
					elements.push(el);

				}

				return navigation.nodes.elements = d3.selectAll('.' + this.attr.className);

			},

			lines: {

				render: function(nodes) {

					this.create(nodes);
					this.position(nodes);

				},

				create: function(nodes) {
					console.log(nodes);
					console.log(d3.selectAll('.node'));
					nodes.each(function() {
						render('line', d3.select(this));
						render('line', d3.select(this));
					});
				},

				position: function(nodes) {

					nodes.each(function() {

						getRelativePosition(this);

						node = d3.select(this);

						var source = node.attr('source');
						var target = node.attr('target');

						var source_pos = navigation.position.know_X(source);
						var target_pos = navigation.position.know_X(target);
						// console.log(source_pos, target_pos);
						node.selectAll('lines')
							.first().attr({


							});

					})

				}
			},

			circles: {

				render: function() {

					this.create();
					this.position();

				},

				create: function() {

					navigation.nodes.elements.each(function() {
						render('circle', d3.select.each(this))
					})

				},

				position: function() {



				},

			}

		}


		// nodes
		


		// node circles

		// node lines
	}
};



var stepsInfo = {};

function createSteps() {
	d3.json('data.json', function(error, data) {
		viz(data.steps);
	});

	function viz(data) {
		
		
		navigation.init(data);


		var group = d3.select('g#steps');
		var nodesG = navigation.nodes.group;
		var nodes = navigation.nodes.elements;



		// // CREATING NODE LINES
		// nodes.append('line');
		// nodes.append('line');
		// d3.selectAll('.node').selectAll('lines')
		// 	.attr('class', 'nodeL');
		// var nodesL = d3.selectAll('.nodeL');


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
		steps.each(function(d, i) {
			var stepC = d3.select(this).select('circle');
			var x_pos = window.innerWidth / 2 * i;
			stepC
				.attr('cx', function() {
					return this.x = Math.round(x_pos);
				})
				.attr('cy', function() {
					return this.x = 0;
				});
		});


		// POSITIONING NODE-CIRCLES
		d3.selectAll('.node').each(function(d, i) {
			
			var nodeC = d3.select(this).select('circle');
			var x_pos = (getStepsPos(i+1) - getStepsPos(i)) / 2 + getStepsPos(i);
			nodeC.attr('cx', function (el) {
				return this.x = Math.round(x_pos);
			});
		});


		// // POSITIONING NODE-LINES
		// nodes.each(function(el, i) {
		// 	var line1 = d3.select(this).selectAll('line').first();
		// 	var line2 = d3.select(this).selectAll('line').last();
		// 	line1.attr({
		// 		'x1': function() {
		// 			return el.x1 = getStepsPos(i);
		// 		},
		// 		'x2': function() {
		// 			return el.x2 = (getStepsPos(i+1) - getStepsPos(i)) / 2 + getStepsPos(i);
		// 		}
		// 	});
		// 	line2.attr({
		// 		'x1': function() {
		// 			return el.x1 = (getStepsPos(i+1) - getStepsPos(i)) / 2 + getStepsPos(i);
		// 		},
		// 		'x2': function() {
		// 			return el.x2 = getStepsPos(i+1);
		// 		}
		// 	});
		// });

		// d3.selectAll('g#nodes, g#steps').attr('transform', translatePos(0, .75));

		



	// 	var circles = d3.selectAll('circle');
	// 	circles
	// 		.call(d3.behavior.drag()
	// 				.inertia(true)
	// 				.on("drag", dragmove));

	// 	function dragmove(d) {
	// 		d3.select(this)
	// 		.attr("cx", d.x = d3.event.x)
	// 		.attr("cy", d.y = d3.event.y);
	// 	}

	// moveSteps();
	// document.onmousedown = function(e) {
	// 	attraction(e);
	// };

	}

}

createSteps();



// moveSteps
function moveSteps() {
	d3.select('body').call(
		d3.behavior.drag()
			.inertia(true)
			.on("drag", function(d) {
				d3.selectAll('#steps,#nodes')
					.transition()
					.duration(250)
					.ease('circle-out')
					.attr('transform', function (d) {
						stepsInfo.pos[0] += d3.event.dx /4;
						return 'translate(' + stepsInfo.pos[0] + ',' + stepsInfo.pos[1] + ')';
					})
			
			})	
	);
}

// // steps attraction
// function attraction(e) {
// 	var cursor = {};
//     	cursor.x = e.pageX;
//     	cursor.y = e.pageY;

//     var scale = d3.scale.pow().exponent(.3)
//     	.domain([0, window.innerWidth])
//     	.range([-10, 0]).clamp(true);


//     d3.selectAll('.step').each(function(d) {
//     	var circle = d3.select(this).select('circle');
//     	var cx = circle.attr('cx');
//     	var cy = circle.attr('cy');
//     	d.x = stepsInfo.pos[0] + parseInt(cx);
//     	d.y = parseInt(cy);
//     	var x = d.x - cursor.x;
//     	var y = stepsInfo.pos[1] - cursor.y;
//     	var hip = Math.sqrt(x*x + y*y);
//     	var angle = Math.atan2(x, y);
//     	var hip = scale(hip);
//     	var x = hip * Math.sin(angle);
//     	var y = hip * Math.cos(angle);

//     	circle.attr('cx', function() {
//     		return ;
//     	})
//     		// attr('cx', function)
//     	console.log(d.x, d.y, d);
//     })
//     // console.log(cursor);
// }
