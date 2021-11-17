//Inititializing the global vars here
var Canvas= document.getElementById("drawArea");
var ctx= Canvas.getContext("2d");
var width, res, sqsize, nboxes, drawWhat=0, solved=false, animating=true;
res=0;
var path= new Array();

//init
document.getElementById('b0').classList.add("activeButton");
document.getElementById('b3').classList.add("activeButton");

//this will handle any resizing of the canvas, it is called onResize by body
function handleSize(){//CHANGE START AND END TO BE NULL ON RESIZE IF OUTSIDE BOUNDARY
	width= (window.innerWidth)*0.9;
	Canvas.width= width;
	Canvas.height= (width/9)*4;
	height= (width/9)*4;
	if(res==0){sqsize=width/27;nboxes=27;}
	else if(res==1){sqsize=width/54;nboxes=54;}
	else if(res==2){sqsize=width/72;nboxes=72;}
}
handleSize();

function animateToggle(){
	let sp= document.getElementById("animatespan");
	if(sp.innerHTML== "\u2713"){sp.innerText= "\u2717"; animating=false;}
	else{sp.innerText= "\u2713"; animating=true;}
}

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
	ctx.fillStyle= "#00f204";
	ctx.fillRect(start.x*sqsize, start.y*sqsize, sqsize, sqsize);}
	if(end!=null){
	ctx.fillStyle= "#D93A25";
	ctx.fillRect(end.x*sqsize, end.y*sqsize, sqsize, sqsize);}
	ctx.fillStyle= "#000000";
	for(const p of walls.arr){
		ctx.fillRect(p.x*sqsize, p.y*sqsize, sqsize, sqsize);
	}
}



//actual A* code

class Node{
	constructor(_walkable, _pos){
		this.walkable=_walkable;
		this.pos=_pos;
		this.heapIndex=0;
		this.parentNode=null;
		this.gCost=0;
		this.hCost=0;
	}
	
	fCost(){
		return this.gCost+ this.hCost;
	}
	
	heapParent(){
		return Math.floor((this.heapIndex-1)/2);
	}
	
	heapLeftChild(){
		return Math.floor(this.heapIndex*2 +1);
	}
	
	heapRightChild(){
		return Math.floor(this.heapIndex*2 +2);
	}
}

var grid;
function processGrid(){
	if(start==null || end==null){alert("mark the start and end");}
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
	calculatePath();
}

function getDistance(start, end){
	let x= Math.abs(start.pos.x-end.pos.x);
	let y= Math.abs(start.pos.y-end.pos.y);
	
	let min= x>y ? y : x;
	let max= x>y ? x : y;
	
	return min*14+(max-min)*10;
}

function calculatePath(){
	path=new Array();
	if(animating){
		calculatePatha();
	}
	else{calculatePathna();}
}

var openL, currentNode, closedL;
async function calculatePatha(){
	let startNode= new Node(true, start);
	let endNode= new Node(true, end);
	openL=new Heap((nboxes*nboxes*4)/9);
	closedL=new Array();
	
	openL.add(startNode);
	while(openL.size()>0){
		currentNode= openL.popTop();
		closedL.push(currentNode);
		if(equalNodes(currentNode, endNode)){
			retrace(startNode, currentNode);
			return;
		}
		for(let nbor of getNeighbors(currentNode)){
			if(!nbor.walkable || closedL.includes(nbor)){continue;}
			
			let newDistance= currentNode.gCost + getDistance(currentNode, nbor);
			/**if((newDistance< nbor.gcost) || !openL.contains(nbor)){
				nbor.gCost=newDistance;
				nbor.hCost=getDistance(nbor, endNode);
				nbor.parentNode=currentNode;
				if(!openL.contains(nbor)){
					openL.add(nbor);
			    }
				else{
					openL.update(nbor);
				}
			}**/
			if(!openL.contains(nbor)){
				nbor.gCost=newDistance;
				nbor.hCost=getDistance(nbor, endNode);
				nbor.parentNode=currentNode;
				openL.add(nbor);
			}
			else if(newDistance<= nbor.gCost){
				nbor.gCost=newDistance;
				nbor.hCost=getDistance(nbor, endNode);
				nbor.parentNode=currentNode;
				openL.update(nbor);
			}
		}
		await sleep(75);
	}
}

function calculatePathna(){
	let startNode= new Node(true, start);
	let endNode= new Node(true, end);
	openL=new Heap((nboxes*nboxes*4)/9);
	closedL=new Array();
	
	openL.add(startNode);
	while(openL.size()>0){
		currentNode= openL.popTop();
		closedL.push(currentNode);
		if(equalNodes(currentNode, endNode)){
			retrace(startNode, currentNode);
			return;
		}
		for(let nbor of getNeighbors(currentNode)){
			if(!nbor.walkable || closedL.includes(nbor)){continue;}
			
			let newDistance= currentNode.gCost + getDistance(currentNode, nbor);
			if(!openL.contains(nbor)){
				nbor.gCost=newDistance;
				nbor.hCost=getDistance(nbor, endNode);
				nbor.parentNode=currentNode;
				openL.add(nbor);
			}
			else if(newDistance<= nbor.gCost){
				nbor.gCost=newDistance;
				nbor.hCost=getDistance(nbor, endNode);
				nbor.parentNode=currentNode;
				openL.update(nbor);
			}
		}
	}
}

function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
   }

function retrace(start, end){
	let current= end;
	path=new Array();
	while(true){
		if(equalNodes(current.parentNode, start)){return;}
		path.push(current.parentNode);
		current=current.parentNode;
	}
}

function getNeighbors(n){
	let nbors= new Array();
	for(let i=-1; i<=1; i++){
		for(let j=-1; j<=1; j++){
			if(i==0 && j==0){continue;}
			if(n.pos.x+i<0 || n.pos.y+j<0){continue;}
			if(n.pos.x+i>nboxes-1 || n.pos.y+j>((nboxes*4)/9)-1){continue;}
			nbors.push(grid[n.pos.x+i][n.pos.y+j]);
		}
	}
	return nbors;
}

function equalNodes(m, n){
	if(m.pos.x==n.pos.x && m.pos.y==n.pos.y){return true;}
	else{return false;}
}


function drawPath(){
	ctx.fillStyle="#70ff99";
	if(openL!=null){
	for(let i=0; i<openL.currentItemIndex; i++){
		ctx.fillRect(openL.arr[i].pos.x*sqsize, openL.arr[i].pos.y*sqsize, sqsize, sqsize);
	}}
	ctx.fillStyle="#dddddd";
	if(closedL!=null)
	for(let i of closedL){
		ctx.fillRect(i.pos.x*sqsize, i.pos.y*sqsize, sqsize, sqsize);
	}
	ctx.fillStyle="#fff30a";
	if(currentNode!=null)
	ctx.fillRect(currentNode.pos.x*sqsize, currentNode.pos.y*sqsize, sqsize, sqsize);
	ctx.fillStyle="#e803fc";
	for(let i of path){
		ctx.fillRect(i.pos.x*sqsize, i.pos.y*sqsize, sqsize, sqsize);
	}
}

function draw(){
	drawGrid();
	drawPath();
	drawNodes();
}

setInterval(draw, 33);
