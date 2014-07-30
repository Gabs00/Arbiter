

//A test class to use with Arbiter
var Ranger = function(x,y,name, arbiter){
    this.name = name;
    this.x = x;
    this.y = y;
    this.id = null;
    this.arbiter = arbiter;
    this.range = [[0, 200, 'attack']];
}

Ranger.prototype.attack = function(target){
    console.log('===ATTACK===')
    console.log(this.name + ' attacks ' + target.name);
    console.log('============');
}

Ranger.prototype.updateLocation = function(){
    this.x = Math.floor(Math.random()*400);
    this.y = Math.floor(Math.random()*400);
    this.arbiter.updateLocation({'id':this.id, 'location': [this.x, this.y]});    
}

Ranger.prototype.ranges = function(){
    return this.range;
}