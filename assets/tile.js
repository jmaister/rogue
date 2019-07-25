
class Tile extends Glyph {
    constructor(properties) {
        properties = properties || {};
        super(properties);
        // Call the Glyph constructor with our properties
        //Glyph.call(this, properties);
        // Set up the properties. We use false by default.
        this._isWalkable = properties['isWalkable'] || false;
        this._isDiggable = properties['isDiggable'] || false;
    }

    isWalkable() {
        return this._isWalkable;
    }

    isDiggable() {
        return this._isDiggable;
    }
}

Tile.nullTile = new Tile({});
Tile.floorTile = new Tile({
    character: '.',
    isWalkable: true
});
Tile.wallTile = new Tile({
    character: '#',
    foreground: 'goldenrod',
    isDiggable: true
});
