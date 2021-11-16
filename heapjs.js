class Heap{
	
	constructor(maxSize){
		this.arr= new Array(maxSize);
		this.currentItemIndex=0;
	}
	
	root(){
		return this.arr[0];
	}
	
	contains(n){
		return n==this.arr[n.heapIndex];
	}
	
	add(n){
		this.arr[this.currentItemIndex]=n;
		n.heapIndex=this.currentItemIndex;
		this.sortUp(n);
		this.currentItemIndex++;
	}
	
	popTop(){
		let t=this.arr[0];
		this.swap(this.arr[0], this.arr[this.currentItemIndex-1])
		this.arr[this.currentItemIndex]=null;
		this.currentItemIndex--;
		if(this.currentItemIndex>0){
			this.sortDown(this.arr[0]);
		}
		return t;
	}
	
	update(t){
		this.sortDown(t);
	}
	
	size(){
		return this.currentItemIndex+1;
	}
	
	sortDown(n){
		let swapIndex;
		while(true){
			if(n.heapLeftChild()< this.currentItemIndex){
				swapIndex=n.heapLeftChild();
				
				if(n.heapRightChild()< this.currentItemIndex){
					if(this.compare(this.arr[n.heapLeftChild()],this.arr[n.heapRightChild()])<0){
						swapIndex=n.heapRightChild();
					}
				}
				
				if(this.compare(n, this.arr[swapIndex])>0){
					this.swap(n, this.arr[swapIndex]);
				}
				else{return;}
			}
			else{return;}
		}
	}
	
	sortUp(n){
		while(true){
			if(n.heapIndex==0){
				return;
			}
			else{
				if(this.compare(n, this.arr[n.heapParent()])<0){
					this.swap(this.arr[n.heapParent()],n);
				}
				else{return;}
			}
		}
	}
	
	swap(a, b){
		this.arr[a.heapIndex]=b;
		this.arr[b.heapIndex]=a;
		let t=a.heapIndex;
		a.heapIndex=b.heapIndex;
		b.heapIndex=t;
	}
	
	compare(m, n){ //1 if m>n, 0 if m==n, -1 if m<n
		if(m.fCost()> n.fCost()){
			return 1;
		}
		else if(m.fCost()== n.fCost() && m.hCost < n.hCost){
			return 1;
		}
		else if(m.fCost()== n.fCost() && m.hCost == n.hCost){
			return 0;
		}
		else{
			return -1;
		}
	}
}