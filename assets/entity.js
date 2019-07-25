
class Entity extends Glyph {

    constructor(properties) {
        properties = properties || {};
        super(properties);
        // Call the glyph's construtor with our set of properties
        // Game.Glyph.call(this, properties);
        // Instantiate any properties from the passed object
        this._name = properties['name'] || '';
        this._x = properties['x'] || 0;
        this._y = properties['y'] || 0;
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
}
