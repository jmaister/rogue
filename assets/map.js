class Map  {

    constructor(tiles, player) {
        this._tiles = tiles;
        // cache the width and height based
        // on the length of the dimensions of
        // the tiles array
        this._depth = tiles.length
        this._width = tiles[0].length;
        this._height = tiles[0][0].length;

        // setup the field of visions
        this._fov = [];
        this.setupFov();
        // Setup the explored array
        this._explored = new Array(this._depth);
        this._setupExploredArray();
                
        // create a list which will hold the entities
        this._entities = [];
        // create the engine and scheduler
        this._scheduler = new ROT.Scheduler.Simple();
        this._engine = new ROT.Engine(this._scheduler);

        // add the player
        this.addEntityAtRandomPosition(player, 0);
        // add random fungi
        for (var z = 0; z < this._depth; z++) {
            for (var i = 0; i < 25; i++) {
                this.addEntityAtRandomPosition(new Entity(Game.FungusTemplate), z);
            }
        }
    }

    getDepth() {
        return this._depth;
    }
    getWidth() {
        return this._width;
    }
    getHeight() {
        return this._height;
    }
    // Gets the tile for a given coordinate set
    getTile(x, y, z) {
        // Make sure we are inside the bounds. If we aren't, return
        // null tile.
        if (x < 0 || x >= this._width 
            || y < 0 || y >= this._height
            || z < 0 || z >= this._depth) {
            return Tile.nullTile;
        } else {
            return this._tiles[z][x][y] || Tile.nullTile;
        }
    }

    dig(x, y, z) {
        // If the tile is diggable, update it to a floor
        if (this.getTile(x, y, z).isDiggable()) {
            this._tiles[z][x][y] = Game.Tile.floorTile;
        }
    }
    
    getRandomFloorPosition(z) {
        // Randomly generate a tile which is a floor
        var x, y;
        do {
            x = Math.floor(Math.random() * this._width);
            y = Math.floor(Math.random() * this._height);
        } while(!this.isEmptyFloor(x, y, z));
        return {x: x, y: y, z: z};
    }

    getEntitiesWithinRadius(centerX, centerY, centerZ, radius) {
        const results = [];
        // Determine our bounds
        var leftX = centerX - radius;
        var rightX = centerX + radius;
        var topY = centerY - radius;
        var bottomY = centerY + radius;
        // Iterate through our entities, adding any which are within the bounds
        for (var i = 0; i < this._entities.length; i++) {
            if (this._entities[i].getX() >= leftX &&
                this._entities[i].getX() <= rightX && 
                this._entities[i].getY() >= topY &&
                this._entities[i].getY() <= bottomY &&
                this._entities[i].getZ() == centerZ) {
                results.push(this._entities[i]);
            }
        }
        return results;
    }    

    getEngine() {
        return this._engine;
    }
    getEntities() {
        return this._entities;
    }
    getEntityAt(x, y, z){
        // Iterate through all entities searching for one with
        // matching position
        for (var i = 0; i < this._entities.length; i++) {
            if (this._entities[i].getX() == x
                && this._entities[i].getY() == y 
                && this._entities[i].getZ() == z) {
                return this._entities[i];
            }
        }
        return false;
    }

    addEntity(entity) {
        // Make sure the entity's position is within bounds
        if (entity.getX() < 0 || entity.getX() >= this._width ||
            entity.getY() < 0 || entity.getY() >= this._height ||
            entity.getZ() < 0 || entity.getZ() >= this._depth) {
            throw new Error('Adding entity out of bounds.');
        }
        // Update the entity's map
        entity.setMap(this);
        // Add the entity to the list of entities
        this._entities.push(entity);
        // Check if this entity is an actor, and if so add
        // them to the scheduler
        if (entity.hasMixin('Actor')) {
            this._scheduler.add(entity, true);
        }
    }

    removeEntity(entity) {
        // Find the entity in the list of entities if it is present
        for (var i = 0; i < this._entities.length; i++) {
            if (this._entities[i] == entity) {
                this._entities.splice(i, 1);
                break;
            }
        }
        // If the entity is an actor, remove them from the scheduler
        if (entity.hasMixin('Actor')) {
            this._scheduler.remove(entity);
        }
    }    

    addEntityAtRandomPosition(entity, z) {
        var position = this.getRandomFloorPosition(z);
        entity.setX(position.x);
        entity.setY(position.y);
        entity.setZ(position.z);
        this.addEntity(entity);
    }

    isEmptyFloor(x, y, z) {
        // Check if the tile is floor and also has no entity
        return this.getTile(x, y, z) === Tile.floorTile &&
            !this.getEntityAt(x, y, z);
    }

    setupFov() {
        // Keep this in 'map' variable so that we don't lose it.
        var map = this;
        // Iterate through each depth level, setting up the field of vision
        for (var z = 0; z < this._depth; z++) {
            // We have to put the following code in it's own scope to prevent the
            // depth variable from being hoisted out of the loop.
            (function() {
                // For each depth, we need to create a callback which figures out
                // if light can pass through a given tile.
                var depth = z;
                map._fov.push(
                    new ROT.FOV.DiscreteShadowcasting(function(x, y) {
                        return !map.getTile(x, y, depth).isBlockingLight();
                    }, {topology: 4}));
            })();
        }
    }

    getFov(depth) {
        return this._fov[depth];
    }

    _setupExploredArray() {
        for (var z = 0; z < this._depth; z++) {
            this._explored[z] = new Array(this._width);
            for (var x = 0; x < this._width; x++) {
                this._explored[z][x] = new Array(this._height);
                for (var y = 0; y < this._height; y++) {
                    this._explored[z][x][y] = false;
                }
            }
        }
    }
    setExplored(x, y, z, state) {
        // Only update if the tile is within bounds
        if (this.getTile(x, y, z) !== Tile.nullTile) {
            this._explored[z][x][y] = state;
        }
    }

    isExplored(x, y, z) {
        // Only return the value if within bounds
        if (this.getTile(x, y, z) !== Tile.nullTile) {
            return this._explored[z][x][y];
        } else {
            return false;
        }
    }

}
