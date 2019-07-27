
class Entity extends Glyph {

    constructor(properties={}) {
        // Call the glyph's construtor with our set of properties
        super(properties);
        // Instantiate any properties from the passed object
        this._name = properties['name'] || '';
        this._x = properties['x'] || 0;
        this._y = properties['y'] || 0;
        this._z = properties['z'] || 0;
        this._map = null;

        // Create an object which will keep track what mixins we have
        // attached to this entity based on the name property
        this._attachedMixins = {};
        // Create a similar object for groups
        this._attachedMixinGroups = {};
        // Setup the object's mixins
        var mixins = properties['mixins'] || [];
        for (var i = 0; i < mixins.length; i++) {
            // Copy over all properties from each mixin as long
            // as it's not the name or the init property. We
            // also make sure not to override a property that
            // already exists on the entity.
            for (var key in mixins[i]) {
                if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
                    this[key] = mixins[i][key];
                }
            }
            // Add the name of this mixin to our attached mixins
            this._attachedMixins[mixins[i].name] = true;
            // If a group name is present, add it
            if (mixins[i].groupName) {
                this._attachedMixinGroups[mixins[i].groupName] = true;
            }
            // Finally call the init function if there is one
            if (mixins[i].init) {
                mixins[i].init.call(this, properties);
            }
        }
    }

    hasMixin(obj) {
        // Allow passing the mixin itself or the name / group name as a string
        if (typeof obj === 'object') {
            return this._attachedMixins[obj.name];
        } else {
            return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
        }
    }

    setName(name) {
        this._name = name;
    }
    setX(x) {
        this._x = x;
    }
    setY(y) {
        this._y = y;
    }
    setMap(map) {
        this._map = map;
    }
    getName() {
        return this._name;
    }
    getX() {
        return this._x;
    }
    getY() {
        return this._y;
    }
    getMap() {
        return this._map;
    }
    setZ(z) {
        this._z = z;
    }
    getZ() {
        return this._z;
    }

    setPosition(x, y, z) {
        var oldX = this._x;
        var oldY = this._y;
        var oldZ = this._z;
        // Update position
        this._x = x;
        this._y = y;
        this._z = z;
        // If the entity is on a map, notify the map that the entity has moved.
        if (this._map) {
            this._map.updateEntityPosition(this, oldX, oldY, oldZ);
        }
    }

    tryMove(x, y, z, map) {
        var map = this.getMap();
        // Must use starting z
        var tile = map.getTile(x, y, this.getZ());
        var target = map.getEntityAt(x, y, this.getZ());
        // If our z level changed, check if we are on stair
        if (z < this.getZ()) {
            if (tile != Tile.stairsUpTile) {
                Game.sendMessage(this, "You can't go up here!");
            } else {
                Game.sendMessage(this, "You ascend to level %d!", [z + 1]);
                this.setPosition(x, y, z);
            }
        } else if (z > this.getZ()) {
            if (tile != Tile.stairsDownTile) {
                Game.sendMessage(this, "You can't go down here!");
            } else {
                this.setPosition(x, y, z);
                Game.sendMessage(this, "You descend to level %d!", [z + 1]);
            }
        // If an entity was present at the tile
        } else if (target) {
            // An entity can only attack if the entity has the Attacker mixin and 
            // either the entity or the target is the player.
            if (this.hasMixin('Attacker') && 
                (this.hasMixin(Game.Mixins.PlayerActor) ||
                target.hasMixin(Game.Mixins.PlayerActor))) {
                this.attack(target);
                return true;
            } 
            // If not nothing we can do, but we can't 
            // move to the tile
            return false; 
        // Check if we can walk on the tile
        // and if so simply walk onto it
        } else if (tile.isWalkable()) {        
            // Update the entity's position
            this.setPosition(x, y, z);
            return true;
        // Check if the tile is diggable, and
        // if so try to dig it
        } else if (tile.isDiggable()) {
            // Only dig if the the entity is the player
            if (this.hasMixin(Game.Mixins.PlayerActor)) {
                map.dig(x, y, z);
                return true;
            }
            // If not nothing we can do, but we can't 
            // move to the tile
            return false;
        }
        return false;
    }    
}
