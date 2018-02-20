// Made by: 	Quincy Jacobs
// Start date:	2018-01-25

var splitArray = [];
var canvas;
var ctx;
var minSize = 50; // TODO: minimum size of a block

$(document).ready(function() {
	canvas = document.getElementById("canvas");
	var width = canvas.width;
	var height = canvas.height;
	ctx = canvas.getContext("2d");

	splitArray.push(new Line(0, 0, width, 0));
	splitArray.push(new Line(width, 0, width, height));
	splitArray.push(new Line(width, height, 0, height));
	splitArray.push(new Line(0, height, 0, 0));

	for(var i = 0; i<splitArray.length; i++){
		splitArray[i].draw();
	}

	$(".button").click(function(){

		var lineAmount = parseInt(document.getElementById("draw_line_amount").value);
		minSize = parseInt(document.getElementById("min_block_size").value);

		for(var i=0; i<lineAmount;i++){
			drawLine();
		}
		redrawCanvas();
	});
});

function Line(x0, y0, x1, y1){
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.color = "#000000";
}
Line.prototype.draw = function() {
	ctx.beginPath();
	ctx.strokeStyle = this.color;
	ctx.moveTo(this.x0, this.y0);
	ctx.lineTo(this.x1, this.y1);
	ctx.stroke();
}
Line.prototype.getProximity = function(line){
	var result;
	if(line.isHorizontal()){
		result = this.y0 - line.y0;
	}
	else {
		result = this.x0 - line.x0;
	}
	return Math.abs(result);
}
Line.prototype.isHorizontal = function() {
	return (this.y0 - this.y1 == 0);
}
Line.prototype.isInRange = function(line){
	var result = false;
	var sizesLine = line.getHighLow();

	if(line.isHorizontal()){
		if(this.x0 <= sizesLine[0] && this.x0 >= sizesLine[1]){ 
			return true;
		}
	}
	else if (this.y0 <= sizesLine[0] && this.y0 >= sizesLine[1]){ 
			return true;

	}
}
Line.prototype.getHighLow = function() {
	var high, low;
	if(this.isHorizontal()){
		if(this.x0 > this.x1){ 
			high = this.x0;
			low = this.x1;
		}
		else { 
			high = this.x1;
			low = this.x0;
		}
	}
	else {
		if(this.y0 > this.y1){ 
			high = this.y0;
			low = this.y1;
		}
		else { 
			high = this.y1;
			low = this.y0;
		}
	}
	return [high, low];
}
Line.prototype.getLength = function() {
	var sizes = this.getHighLow();
	return sizes[0]-sizes[1];
}
Line.prototype.getRandomPosition = function() {
	var line;
	var sizes = this.getHighLow();
	var randomNumber = getRandomNumber(sizes[1]+minSize, sizes[0]-minSize);

	if(this.isHorizontal()){
		line = new Line(randomNumber, this.y0, randomNumber, 0);
	}
	else {
		line = new Line(this.x0, randomNumber, 0, randomNumber);
	}
	return line;
}
Line.prototype.getClosestLineFromArray = function(baseLine, lineArray) {
	var closestParallelLine;
	var closestProximity;

	for(var i = 0; i<lineArray.length; i++) {
		// if array line doesn't parallel base line
		if(lineArray[i].isHorizontal() == baseLine.isHorizontal()) {
			// check if the line range is in the same range of the line to draw
			if(this.isInRange(lineArray[i])){
				// check if the line is not the base line
				if(lineArray[i] !== baseLine){
					// get proximity to each other
					var proximity = this.getProximity(lineArray[i]);
					// if first line or closest proxomity
					if(closestProximity == null || proximity < closestProximity){
						closestProximity = proximity;
						closestParallelLine = lineArray[i];
					}
				}
			}
		}
	}
	return closestParallelLine;
}

function drawLine(){
	var baseLine = new Line(0,0,0,0);

	// TODO: improve this while to check for x times and then move on to new line
	var i = 0;
	while(baseLine.getLength() < 2*minSize){
		// get random line to start drawing from
		var baseLine = splitArray[getRandomNumber(0, splitArray.length-1)];
		i++;

		//TODO: review this limit
		if(i == 1000){
			console.log("Error finding valid lines");
			return null;
		}
	}

	// grab random position on line
	var newLine = baseLine.getRandomPosition();
	var targetLine = newLine.getClosestLineFromArray(baseLine, splitArray);

	if(baseLine.isHorizontal()){
		newLine.y1 = targetLine.y1;
	}
	else {
		newLine.x1 = targetLine.x1;
	}
	splitArray.push(newLine);
	newLine.draw();
}

function getRandomNumber(min, max) {
	var result = Math.floor(Math.random() * Math.floor(max+1-min));
	return result + min;
}

function redrawCanvas(){
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for(var i = 0; i < splitArray.length; i++){
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