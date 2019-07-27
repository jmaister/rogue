
class Tile extends Glyph {
    constructor(properties={}) {
        // Call the Glyph constructor with our properties
        super(properties);
        // Set up the properties. We use false by default.
        this._isWalkable = properties['isWalkable'] || false;
        this._isDiggable = properties['isDiggable'] || false;
        this._blocksLight = (properties['blocksLight'] !== undefined) ?
            properties['blocksLight'] : true;
    }

    isWalkable() {
        return this._isWalkable;
    }

    isDiggable() {
        return this._isDiggable;
    }

    isBlockingLight() {
        return this._blocksLight;
    }    
}

Tile.nullTile = new Tile({});
Tile.floorTile = new Tile({
    character: '.',
    isWalkable: true,
    blocksLight: false
});
Tile.wallTile = new Tile({
    character: '#',
    foreground: 'goldenrod',
    isDiggable: true,
    diggable: true
});
Tile.stairsUpTile = new Tile({
    character: '<',
    foreground: 'white',
    isWalkable: true,
    blocksLight: false
});
Tile.stairsDownTile = new Tile({
    character: '>',
    foreground: 'white',
    isWalkable: true,
    blocksLight: false
});
