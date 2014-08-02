var Arbiter = function(ObjectContainer){
    this.objects = ObjectContainer;
    this.locations = {};
    this.length = 0;
    this.ranges = {};
    this.queue = [];
    this._MAX = 0;
    this.processed = 0;
};

Arbiter.prototype = {};

//omit is a list of object ids for this object to ignore when checking ranges
Arbiter.prototype.addObject = function(id, x, y, omit){
    if(id === undefined || x === undefined || y === undefined){
        return  false;
    }
    this.locations[id] = [x, y];
    if(omit !== undefined && Array.isArray(omit)){
        this.locations[id].push(omit);
    }

    this.checkDistance(id);
    this.length = Object.keys(this.locations).length;

    return true;
};
Arbiter.prototype.removeObject = function(id){
    delete this.locations[id];
    this.length--;
};

Arbiter.prototype.updateLocation = function(obj){
    this.queue.push(obj);
};
Arbiter.prototype.listen = function(){
    if(this.queue.length > 0){
        this.processed++;
        var item = this.queue.shift();
        if(item['add-range']){
            this.addRanges(item['id'], item['add-range']);
        }
        if(item['location']){
            this.addObject(item['id'], item['location'][0], item['location'][1]);
        }
    }
    var self = this;
    setTimeout(function(){
        self.listen();
    }, 100);
};
Arbiter.prototype.addRanges = function(id, ranges){
    /*
        ranges = [[min, max, functionName]]
    */
    var self = this;
    ranges.forEach(function(v){
        if(!self.ranges[v[0]]){
            self.ranges[v[0]] = {};
        }
        if(self._MAX < v[1]){
            self._MAX = v[1];
        }
        if(!self.ranges[v[0]][v[1]]){
            self.ranges[v[0]][v[1]] = [];
        }
        self.ranges[v[0]][v[1]].push([id, v[2]]);
    });
};

Arbiter.prototype.checkDistance = function(id){
    //How do we check this distances?
        //locate the coordinates of provided id
        var coords = this.locations[id];
        var x = coords[0];
        var y = coords[1];
        var omit;
        
        var tgKeys = Object.keys(this.locations);
        if(coords[2]){
            omit = coords[2];
            tgKeys = filter(tgKeys, function(v){
                v = parseInt(v);
                for(var i = 0; i < omit.length; i++){
                    if(typeof omit[i] === 'function'){
                        if(omit[i](v)){
                            return false;
                        }
                    } else if(v === omit[i] || id === omit[i]){
                        return false;
                    }
                }
                return true;
            });
        }
            //for all coordinates in locations
        for(var i = 0; i < tgKeys.length; i++){

            if(id !== parseInt(tgKeys[i])){
                var target = this.locations[tgKeys[i]];
                var x2 = target[0];
                var y2 = target[1];
            //check if the difference between x or y is
                
                if(Arbiter.maxDiff(x,x2, this._MAX) && Arbiter.maxDiff(y,y2, this._MAX)){
                //greater than the max range
                
                    //if it is not greater, calculate the distance
                    //once distance is calculated add to alert objects
                    var self = this;
                    var distance = Arbiter.getDistance(coords, target);
                    var safe_i = i;
                    var safe_id = id;
                    var safe_distance = distance;
                    setTimeout(function(){
                        
                        var rangeList = self.getMin(safe_distance);
                        
                        self.alertObjects(rangeList, safe_id, parseInt(tgKeys[safe_i]));
                    },1);
                }
            }
        }
};
Arbiter.prototype.getMin = function(dist){
    dist = Math.round(dist/100)*100;
    var minKeys = Object.keys(this.ranges);
    var self = this;
    var min = [];
    minKeys.forEach(function(v){
        if(parseInt(v) <= dist){
            min.push(v);
        }
    });
    return this.getMax(dist,min);
};

Arbiter.prototype.getMax = function(dist, min){
    var toAlert = [];
    var self = this;
    min.forEach(function(v){
        var keys = Object.keys(self.ranges[v]);
        keys.forEach(function(v2){
            
            if(v2 > dist){
                toAlert.push(self.ranges[v][v2]);
            }
        });
    });
    return toAlert;
};

Arbiter.prototype.alertObjects = function(alertList, id1,id2){
    
    for(var i = 0; i < alertList.length; i++){
        for(var j = 0; j < alertList[i].length; j++){
            var id = alertList[i][j][0];
            var target;
            var origin;
            var action = alertList[i][j][1];
            if(id === id1){
                target = this.objects[id2];
                origin = this.objects[id1];            
            }
            else if(id === id2){
                target = this.objects[id1];
                origin = this.objects[id2];
            }
            if(target){
                origin[action](target);
            }
        }
    }
};

Arbiter.prototype.getByDistanceX = function(callerId, distance){
    if(callerId === undefined || distance === undefined || this.locaitons[callerId] === undefined){
        return;
    }
    var keys = Object.keys(this.locations);
    var results = [];
    for(var i = 0; i < keys.length; i++){
        if(callerId !== parseInt(keys[i])){
            var dist = this.getDistanceById(callerId, keys[i]);
            if(dist <= distance){
                var item = this.getAllById(keys[i]);
                item['distance'] = dist;
                results.push(item);
            }
        }
    }
    return (results.length) ? results:undefined;
};

Arbiter.prototype.getDistanceById = function(callerId, targetId){
    if(callerId === undefined || targetId === undefined || !this.locations[targetId]){
        return;
    }
    var caller;
    //If the caller does not send an id, it must send a an array with its coords
    if(Array.isArray(callerId)){
            caller = callerId;
    } else {
        caller = this.locations[callerId];
        if(!caller){
            return;
        }
    }


    return Arbiter.getDistance(caller, this.locations[targetId]);
};

Arbiter.prototype.getById = function(id){
    if(id !== undefined && this.locations[id]){
        return this.locations[id];
    }
};

Arbiter.prototype.getAllById = function(id){
    if(id !== undefined && this.locations[id]){
        return {
            id: id,
            coords: this.getById(id),
            object: this.objects[id]
        };
    }
};

Arbiter.getDistance = function(coord1, coord2){
    var x= coord1[0] - coord2[0];
    var y= coord1[1] - coord2[1];
    return Math.floor(
        Math.sqrt(Math.pow(x,2) + Math.pow(y,2))
    );
};
Arbiter.maxDiff = function(p1, p2, MAX){
    var test = (p1 >= p2) ? p1-p2:p2-p1;
    return test < MAX;
};

Arbiter.prototype.getAll = function(){
    var ids = Object.keys(this.locations);
    var result = [];
    for(var i = 0; i < ids.length; i++){
        var item = {};
        item.id = ids[i];
        item.coords = this.locations[i];
        item.object = this.objects[i];
        result.push(item);
    }
    return result;
};
//truth test is a callback
function filter(array, truthtest){
    var results = [];
    array.forEach(function(v,i,c){
        if(truthtest(v,i,c)){
            results.push(v);
        }
    });
    return results;
}