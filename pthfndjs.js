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
function Point(x, y){
	this.x=x;
	this.y=y;
}

var start, end;

function drawThis(i){
	document.getElementById('b'+(drawWhat+3)).classList.remove("activeButton");
	drawWhat=i; //0 for start, 1 for end, 2 for obstacle
	document.getElementById('b'+(drawWhat+3)).classList.add("activeButton");
}
var isDragging, oldP;

Canvas.addEventListener("click", markNodes);
Canvas.addEventListener("mousedown", function (){isDragging=true; oldP= new Point(Math.floor(event.offsetX/sqsize), Math.floor(event.offsetY/sqsize));});
Canvas.addEventListener("mousemove", dragDraw);
Canvas.addEventListener("mouseup", function (){isDragging=false;});
Canvas.addEventListener("mouseleave", function (){isDragging=false;});

class PSet{
	constructor(){
		this.arr=new Array();
		this.size=0;
	}
	
	add(p){
		if(!this.has(p)){this.arr.push(p); this.size++;}
	}
	
	has(p){
		for(var px of this.arr){
			if((px.x == p.x) && (px.y == p.y)){
				return true;
			}
		}
		return false;
	}
	
	remove(p){
		for(let i=0; i<this.arr.length; i++){
			if(this.arr[i].x==p.x && this.arr[i].y==p.y){
				let t=this.arr[this.arr.length-1];
				this.arr[this.arr.length-1]=this.arr[i];
				this.arr[i]=t;
				this.arr.pop();
			}
		}
	}
}

var walls= new PSet();

function markNodes(event){
	let p= new Point(Math.floor(event.offsetX/sqsize), Math.floor(event.offsetY/sqsize));
	if(drawWhat==0){
		start=p;
	}
	else if(drawWhat==1){
		end=p;
	}
	else{
		if(walls.has(p)){walls.remove(p)}
		else{walls.add(p);}
	}
}

function dragDraw(event){
	if(drawWhat!=2 || !isDragging){return;}
	let p= new Point(Math.floor(event.offsetX/sqsize), Math.floor(event.offsetY/sqsize));
    if(oldP.x==p.x && oldP.y==p.y){return;}
    oldP=p;
	if(walls.has(p)){walls.remove(p)}
	else{walls.add(p);}
}

function drawNodes(){
	if(start!=null){
	ctx.fillStyle= "#00FF00";
	ctx.fillRect(start.x*sqsize, start.y*sqsize, sqsize, sqsize);}
	if(end!=null){
	ctx.fillStyle= "#FFFF00";
	ctx.fillRect(end.x*sqsize, end.y*sqsize, sqsize, sqsize);}
	ctx.fillStyle= "#000000";
	for(const p of walls.arr){
		ctx.fillRect(p.x*sqsize, p.y*sqsize, sqsize, sqsize);
	}
}



//actual A* code

function Node(_walkable, _pos){
	this.walkable=_walkable;
	this.pos=_pos;
}

var grid;
function processGrid(){
	grid= new Array();
	let arr;
	for(let x=0; x<nboxes; x++){
		arr= new Array();
		for(let y=0; y<(nboxes*4)/9; y++){
			p= new Point(x, y);
			arr.push(new Node(!(walls.has(p)), p));
		}
		grid.push(arr);
	}
}



function draw(){
	drawGrid();
	drawNodes();
}

setInterval(draw, 33);
