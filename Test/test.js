

//Where the objects added to Arbiter will be held
var container = [];
var arb = new Arbiter(container);

var r1 = new Ranger(100,100,'John Rango',arb);

r1.id = container.length;
container.push(r1);

//Adds ranges to Arbiter, Ranges are used to pick an action for the object based
//on the range. //Ex. 200-300 do Object.hug() 100-200 do Object.tickle()
arb.addRanges(r1.id, r1.ranges());

arb.addObject(r1.id, r1.x, r1.y);


var r2 = new Ranger(100,100, 'Jimmy Horn',arb);

r2.id = container.length;
container.push(r2);

arb.addRanges(r2.id, r2.ranges());
arb.addObject(r2.id, r2.x, r2.y);

//Change handle to true to stop the below setInterval
var handle = false;

//listen() tells Arbiter to watch its queue
arb.listen();

//Updates the two ranger classes locations, reduce the timer for 
//more frequent updates
var g = setInterval(function(){
    if(handle){
        console.log('stopping');
        clearInterval(g);
    }
    r1.updateLocation();
    r2.updateLocation();
    
    console.log('help() for help');
}, 10000);

function help(){
    console.log('Explore the classes: ');
    console.log('\t[ Arbiter ] the Location Keeper');
    console.log('\t[ Ranger ] the ever vigilant test class');
    console.log('Instances:');
    console.log('\t[ arb ] the Arbiter object');
    console.log('\t[ container ] the container object');
    console.log('\t[ r1 ] and [ r2 ] the Ranger Objects');
    console.log('Try: [ arb.getMap() ] or [ arb.getAll() ]');
    console.log('Use [ handle = true ] to disable location updates');
}



