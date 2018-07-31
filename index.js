// Made by: 	Quincy Jacobs
// Start date:	2018-01-25

var splitArray = [];
var canvas;
var ctx;
var minSize = 50; // TODO: minimum size of a block

$(document).ready(function()
{
	canvas = document.getElementById("canvas");
	var width = canvas.width;
	var height = canvas.height;
	ctx = canvas.getContext("2d");

	splitArray.push(new Line(0, 0, width, 0));
	splitArray.push(new Line(width, 0, width, height));
	splitArray.push(new Line(width, height, 0, height));
	splitArray.push(new Line(0, height, 0, 0));

	for(var i = 0; i<splitArray.length; i++)
	{
		splitArray[i].draw();
	}

	$(".button").click(function()
	{

		var lineAmount = parseInt(document.getElementById("draw_line_amount").value);
		minSize = parseInt(document.getElementById("min_block_size").value);

		for(var i=0; i<lineAmount;i++)
		{
			drawLine();
		}
		redrawCanvas();
	});
});

function Line(x0, y0, x1, y1)
{
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.color = "#000000";
}
Line.prototype.draw = function()
{
	ctx.beginPath();
	ctx.strokeStyle = this.color;
	ctx.moveTo(this.x0, this.y0);
	ctx.lineTo(this.x1, this.y1);
	ctx.stroke();
}
Line.prototype.getProximity = function(line)
{
	var result;
	if(line.isHorizontal())
	{
		result = this.y0 - line.y0;
	}
	else
	{
		result = this.x0 - line.x0;
	}
	return Math.abs(result);
}
Line.prototype.isHorizontal = function() 
{
	return (Math.abs(this.y0) - Math.abs(this.y1) == 0);
}
Line.prototype.isInRange = function(line)
{
	var sizesLine = line.getHighLow();
	var sizesThis = this.getHighLow();

	if(line.isHorizontal())
	{
		if(this.x0 <= sizesLine[0] && this.x0 >= sizesLine[1])
		{
			if (line.y0 <= sizesThis[0] && line.y0 >= sizesThis[1])
			{
				return true;
			}
		}
	}
	else if (this.y0 <= sizesLine[0] && this.y0 >= sizesLine[1])
	{
		if(line.x0 <= sizesThis[0] && line.x0 >= sizesThis[1])
		{
			return true;
		}
	}
	return false;
}
Line.prototype.willRunInto = function(line)
{
	var sizesLine = line.getHighLow();

	if(line.isHorizontal())
	{
		if(this.x0 <= sizesLine[0] && this.x0 >= sizesLine[1])
		{
			return true;
		}
	}
	else if (this.y0 <= sizesLine[0] && this.y0 >= sizesLine[1])
	{
		return true;
	}
	return false;
}
Line.prototype.getHighLow = function()
{
	var high, low;
	if(this.isHorizontal())
	{
		if(this.x0 > this.x1)
		{
			high = this.x0;
			low = this.x1;
		}
		else
		{ 
			high = this.x1;
			low = this.x0;
		}
	}
	else
	{
		if(this.y0 > this.y1)
		{ 
			high = this.y0;
			low = this.y1;
		}
		else
		{
			high = this.y1;
			low = this.y0;
		}
	}
	return [high, low];
}
Line.prototype.getLength = function()
{
	var sizes = this.getHighLow();
	return sizes[0]-sizes[1];
}
Line.prototype.getNewLine = function(lineArray)
{
	//console.log("####################################################");
	var line;
	var sizes = this.getHighLow();

	var max = sizes[0]-minSize;
	var min = sizes[1]+minSize;

	var arraySize = (this.isHorizontal() ? canvas.width : canvas.height);

	//console.log("max: " + max);
	//console.log("min: " + min);

	// array holding all valid positions to draw from the baseline
	var positions = [];
	for(var i = 0; i < arraySize; i++)
	{
		if(i < min)
		{
			positions.push(false);
		} 
		else if(i >= (max))
		{
			positions.push(false);
		}
		else 
		{
			positions.push(true);
		}
	}
	var hold = positions;

	//console.log(hold);
	//console.log(this);

	// find lines drawn from baseline (this line)
	for(var i = 0; i<lineArray.length; i++) 
	{
		// line is not parallel to baseline
		if(lineArray[i].isHorizontal() != this.isHorizontal())
		{
			// check if line is in range of baseline
			if(this.isInRange(lineArray[i]))
			{
				// put invalid positions around line to false
				var touchPosition = 0;
				if(lineArray[i].isHorizontal())
				{
					touchPosition = lineArray[i].y0;
				}
				else 
				{
					touchPosition = lineArray[i].x0;
				}

				// if startPos < 0, set to 0
				var startPos = ((touchPosition-minSize < 0) ? 0 : (touchPosition-minSize)); 
				var endPos = (touchPosition-minSize)+((2*minSize)+1);

				if(endPos > sizes[0])
				{
					endPos = sizes[0];
				}

				//console.log(startPos);
				//console.log(endPos);

				for(var j = startPos; j < endPos; j++)
				{
					positions[j] = false;
				}  

				//console.log("touchposition: " + touchPosition);
			}
		}
	}

	// create an array with all valid positions left.
	var validPositions = [];
	for(var i = 0; i < positions.length; i++)
	{
		if(positions[i]){
			validPositions.push((i + sizes[1]));
		}
	}

	if(validPositions.length == 0){
		return 0;
	}
	//console.log(positions);
	//console.log(validPositions);
	//console.log("total valid options: " + validPositions.length);

	var randomNumber = validPositions[(getRandomNumber(0, validPositions.length))-1];

	//console.log("random coord: " + randomNumber);

	if(this.isHorizontal())
	{
		line = new Line(randomNumber, this.y0, randomNumber, 0);
	}
	else 
	{
		line = new Line(this.x0, randomNumber, 0, randomNumber);
	}

	var targetLine = line.getClosestLineFromArray(this, lineArray);

	if(this.isHorizontal())
	{
		line.y1 = targetLine.y1;
	}
	else 
	{
		line.x1 = targetLine.x1;
	}

	return line;
}
Line.prototype.getClosestLineFromArray = function(baseLine, lineArray)
{
	var closestParallelLine;
	var closestProximity;

	//TODO use side indicator to find a line in that direction

	for(var i = 0; i<lineArray.length; i++) 
	{
		// if array line is parallel to base line
		if(lineArray[i].isHorizontal() == baseLine.isHorizontal()) 
		{
			// check if the line range is in the same range of the line to draw
			if(this.willRunInto(lineArray[i]))
			{
				// check if the line is not the base line
				if(lineArray[i] !== baseLine)
				{
					// get proximity to each other
					var proximity = this.getProximity(lineArray[i]);
					// if first line or closest proxomity
					if(closestProximity == null || proximity < closestProximity)
					{
						closestProximity = proximity;
						closestParallelLine = lineArray[i];
					}
				}
			}
		}
	}
	return closestParallelLine;
}
Line.prototype.getSideIndicator = function()
{
	// if the line travels down or right the line will travel in the positive direction so:
	// up or left = 0
	// down or right = 1;

	// lines drawn from border lines are special, otherwise pick a random direction
	if((this.isHorizontal() && this.x0 == 0) || (!this.isHorizontal() && this.y0 == 0))
	{
		return 0;
	}
	else if ((this.isHorizontal() && this.x0 == canvas.height) || (!this.isHorizontal() && this.y0 == canvas.width))
	{
		return 1;
	}
	return getRandomNumber(0, 1);
}

function drawLine()
{
	var baseLine = new Line(0,0,0,0);

	// TODO: improve this while to check for x times and then move on to new line
	var i = 0;
	while(baseLine.getLength() < 2*minSize)
	{
		// get random line to start drawing from
		var baseLine = splitArray[getRandomNumber(0, splitArray.length-1)];
		i++;

		//TODO: review this limit
		if(i == 1000)
		{
			console.log("Error finding valid lines");
			return null;
		}
	}

	// grab random position on line
	var newLine = baseLine.getNewLine(splitArray); // returns 0 on fail
	
	if(newLine)
	{
		splitArray.push(newLine);
		newLine.draw();
	}
	
}

function getRandomNumber(min, max) 
{
	var result = Math.floor(Math.random() * Math.floor(max+1-min));
	return result + min;
}

function redrawCanvas()
{
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(var i = 0; i < splitArray.length; i++)
	{
		splitArray[i].draw();
	}
}

// TODO:
//
// timeout on automatic drawing to show lines being drawn one by one
// set constraints for lines (how close to one another is acceptable)
// set constraint for amount of lines (when does the drawing stop)
// decide up front which direction the line will be drawn to from the baseline (now it always chooses the closest line in whatever direction)
// ...