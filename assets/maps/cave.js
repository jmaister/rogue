class Cave extends Map {

    constructor(tiles, player) {
        // Call the Map constructor
        super(tiles);
        // Add the player
        this.addEntityAtRandomPosition(player, 0);
        // Add random entities and items to each floor.
        for (var z = 0; z < this._depth; z++) {
            // 15 entities per floor
            for (var i = 0; i < 15; i++) {
                var entity = Game.EntityRepository.createRandom();
                // Add a random entity
                this.addEntityAtRandomPosition(entity, z);
                // Level up the entity based on the floor
                if (entity.hasMixin('ExperienceGainer')) {
                    for (var level = 0; level < z; level++) {
                        entity.giveExperience(entity.getNextLevelExperience() -
                            entity.getExperience());
                    }
                }
            }
            // 15 items per floor
            for (var i = 0; i < 15; i++) {
                // Add a random entity
                this.addItemAtRandomPosition(Game.ItemRepository.createRandom(), z);
            }
        }
        // Add weapons and armor to the map in random positions and floors
        var templates = ['dagger', 'sword', 'staff', 
            'tunic', 'chainmail', 'platemail'];
        for (var i = 0; i < templates.length; i++) {
            this.addItemAtRandomPosition(Game.ItemRepository.create(templates[i]),
                Math.floor(this._depth * Math.random()));
        }
        // Add a hole to the final cavern on the last level.
        var holePosition = this.getRandomFloorPosition(this._depth - 1);
        // this._tiles[this._depth - 1][holePosition.x][holePosition.y] = Tile.holeToCavernTile;
        this._tiles[this._depth - 1][5][5] = Tile.holeToCavernTile;
    }
}

