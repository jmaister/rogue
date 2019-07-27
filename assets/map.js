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
        this._entities = {};
        // Create a table which will hold the items
        this._items = {};        
        // create the engine and scheduler
        this._scheduler = new ROT.Scheduler.Simple();
        this._engine = new ROT.Engine(this._scheduler);

        // add the player
        this.addEntityAtRandomPosition(player, 0);
        // Add random entities and items to each floor.
        for (var z = 0; z < this._depth; z++) {
            // 15 entities per floor
            for (var i = 0; i < 15; i++) {
                // Add a random entity
                this.addEntityAtRandomPosition(Game.EntityRepository.createRandom(), z);
            }
            // 10 items per floor
            for (var i = 0; i < 15; i++) {
                // Add a random entity
                this.addItemAtRandomPosition(Game.ItemRepository.createRandom(), z);
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
            this._tiles[z][x][y] = Tile.floorTile;
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
        for (var key in this._entities) {
            var entity = this._entities[key];
            if (entity.getX() >= leftX && entity.getX() <= rightX && 
                entity.getY() >= topY && entity.getY() <= bottomY &&
                entity.getZ() == centerZ) {
                results.push(entity);
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
        // Get the entity based on position key 
        return this._entities[x + ',' + y + ',' + z];
    }

    addEntity(entity) {
        // Update the entity's map
        entity.setMap(this);
        // Update the map with the entity's position
        this.updateEntityPosition(entity);
        // Check if this entity is an actor, and if so add
        // them to the scheduler
        if (entity.hasMixin('Actor')) {
        this._scheduler.add(entity, true);
        }
    }

    removeEntity(entity) {
        // Remove the entity from the map
        var key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
        if (this._entities[key] == entity) {
            delete this._entities[key];
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

    updateEntityPosition(entity, oldX, oldY, oldZ) {
        // Delete the old key if it is the same entity and we have old positions.
        if (oldX) {
            var oldKey = oldX + ',' + oldY + ',' + oldZ;
            if (this._entities[oldKey] == entity) {
                delete this._entities[oldKey];
            }
        }
        // Make sure the entity's position is within bounds
        if (entity.getX() < 0 || entity.getX() >= this._width ||
            entity.getY() < 0 || entity.getY() >= this._height ||
            entity.getZ() < 0 || entity.getZ() >= this._depth) {
            throw new Error("Entity's position is out of bounds.");
        }
        // Sanity check to make sure there is no entity at the new position.
        var key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
        if (this._entities[key]) {
            throw new Error('Tried to add an entity at an occupied position.');
        }
        // Add the entity to the table of entities
        this._entities[key] = entity;
    }
    
    getItemsAt(x, y, z) {
        return this._items[x + ',' + y + ',' + z];
    }    

    setItemsAt(x, y, z, items) {
        // If our items array is empty, then delete the key from the table.
        var key = x + ',' + y + ',' + z;
        if (items.length === 0) {
            if (this._items[key]) {
                delete this._items[key];
            }
        } else {
            // Simply update the items at that key
            this._items[key] = items;
        }
    }

    addItem(x, y, z, item) {
        // If we already have items at that position, simply append the item to the 
        // list of items.
        var key = x + ',' + y + ',' + z;
        if (this._items[key]) {
            this._items[key].push(item);
        } else {
            this._items[key] = [item];
        }
    }

    addItemAtRandomPosition(item, z) {
        var position = this.getRandomFloorPosition(z);
        this.addItem(position.x, position.y, position.z, item);
    }    
}
