//Inititializing the global vars here
var Canvas= document.getElementById("drawArea");
var ctx= Canvas.getContext("2d");
var width, res, sqsize, nboxes, drawWhat=0;
res=0;

//init
document.getElementById('b0').classList.add("activeButton");
document.getElementById('b3').classList.add("activeButton");

//this will handle any resizing of the canvas, it is called onResize by body
function handleSize(){
	width= (window.innerWidth)*0.9;
	Canvas.width= width;
	Canvas.height= (width/9)*4;
	height= (width/9)*4;
	if(res==0){sqsize=width/27;nboxes=27;}
	else if(res==1){sqsize=width/54;nboxes=54;}
	else if(res==2){sqsize=width/72;nboxes=72;}
}
handleSize();

//handling grid resolution now

function drawRes(i){
	document.getElementById('b'+res).classList.remove("activeButton");
	res=i;
	document.getElementById('b'+res).classList.add("activeButton");
	if(res==0){sqsize=width/27;nboxes=27;}
	else if(res==1){sqsize=width/54;nboxes=54;}
	else if(res==2){sqsize=width/72;nboxes=72;}
}

function drawGrid(){
	ctx.clearRect(0,0, width, height);
	ctx.lineWidth=0.5;
	ctx.strokeStyle="#606060";
	ctx.beginPath();
	ctx.moveTo(sqsize,0);
	for(let i=0; i<nboxes; i++){
		ctx.lineTo(sqsize*(i+1), height);
		ctx.moveTo(0, sqsize*(i+1));
		ctx.lineTo(width, sqsize*(i+1));
		ctx.moveTo(sqsize*(i+2), 0);
	}
	ctx.stroke();
	ctx.closePath();
}

//draw the things into the grid now
function drawThis(i){
	document.getElementById('b'+(drawWhat+3)).classList.remove("activeButton");
	drawWhat=i; //0 for start, 1 for end, 2 for obstacle
	document.getElementById('b'+(drawWhat+3)).classList.add("activeButton");
}


function draw(){
	drawGrid();
}

setInterval(draw, 33);