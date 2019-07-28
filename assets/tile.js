
class Tile extends Glyph {
    constructor(properties={}) {
        // Call the Glyph constructor with our properties
        super(properties);
        // Set up the properties. We use false by default.
        this._isWalkable = properties['isWalkable'] || false;
        this._isDiggable = properties['isDiggable'] || false;
        this._blocksLight = (properties['blocksLight'] !== undefined) ?
            properties['blocksLight'] : true;
        this._description = properties['description'] || '';
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
    
    getDescription() {
        return this._description;
    }    
}

Tile.nullTile = new Tile({description: '(unknown)'});
Tile.floorTile = new Tile({
    character: '.',
    isWalkable: true,
    blocksLight: false,
    description: 'A cave floor'
});
Tile.wallTile = new Tile({
    character: '#',
    foreground: 'goldenrod',
    isDiggable: true,
    diggable: true,
    description: 'A cave wall'
});
Tile.stairsUpTile = new Tile({
    character: '<',
    foreground: 'white',
    isWalkable: true,
    blocksLight: false,
    description: 'A rock staircase leading upwards'
});
Tile.stairsDownTile = new Tile({
    character: '>',
    foreground: 'white',
    isWalkable: true,
    blocksLight: false,
    description: 'A rock staircase leading downwards'
});
Tile.holeToCavernTile = new Tile({
    character: 'O',
    foreground: 'white',
    isWalkable: true,
    blocksLight: false,
    description: 'A great dark hole in the ground'
});
Tile.waterTile = new Tile({
    character: '~',
    foreground: 'blue',
    isWalkable: false,
    blocksLight: false,
    description: 'Murky blue water'
});
