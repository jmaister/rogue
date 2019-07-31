
import Repository from './repository';
import ItemMixins from './itemmixins';
import Item from './item';

class ItemRepository extends Repository {

    constructor(game) {
        super('items', Item);
        this._game = game;

        this.define('rock', {
            name: 'rock',
            character: '*',
            foreground: 'white'
        });
        
        this.define('apple', {
            name: 'apple',
            character: '%',
            foreground: 'red',
            foodValue: 50,
            mixins: [ItemMixins.Edible]
        });
        
        this.define('melon', {
            name: 'melon',
            character: '%',
            foreground: 'lightGreen',
            foodValue: 35,
            consumptions: 4,
            mixins: [ItemMixins.Edible]
        });
        
        this.define('corpse', {
            name: 'corpse',
            character: '%',
            foodValue: 75,
            consumptions: 1,
            mixins: [ItemMixins.Edible]
        }, {
            disableRandomCreation: true
        });
        
        this.define('pumpkin', {
            name: 'pumpkin',
            character: '%',
            foreground: 'orange',
            foodValue: 50,
            attackValue: 2,
            defenseValue: 2,
            wearable: true,
            wieldable: true,
            mixins: [
                ItemMixins.Edible,
                ItemMixins.Equippable
            ]
        });
        
        // Weapons
        this.define('dagger', {
            name: 'dagger',
            character: ')',
            foreground: 'gray',
            attackValue: 5,
            wieldable: true,
            mixins: [ItemMixins.Equippable]
        }, {
            disableRandomCreation: true
        });
        
        this.define('sword', {
            name: 'sword',
            character: ')',
            foreground: 'white',
            attackValue: 10,
            wieldable: true,
            mixins: [ItemMixins.Equippable]
        }, {
            disableRandomCreation: true
        });
        
        this.define('staff', {
            name: 'staff',
            character: ')',
            foreground: 'yellow',
            attackValue: 5,
            defenseValue: 3,
            wieldable: true,
            mixins: [ItemMixins.Equippable]
        }, {
            disableRandomCreation: true
        });
        
        // Wearables
        this.define('tunic', {
            name: 'tunic',
            character: '[',
            foreground: 'green',
            defenseValue: 2,
            wearable: true,
            mixins: [ItemMixins.Equippable]
        }, {
            disableRandomCreation: true
        });
        
        this.define('chainmail', {
            name: 'chainmail',
            character: '[',
            foreground: 'white',
            defenseValue: 4,
            wearable: true,
            mixins: [ItemMixins.Equippable]
        }, {
            disableRandomCreation: true
        });
        
        this.define('platemail', {
            name: 'platemail',
            character: '[',
            foreground: 'aliceblue',
            defenseValue: 6,
            wearable: true,
            mixins: [ItemMixins.Equippable]
        }, {
            disableRandomCreation: true
        });
    }

    getGame() {
        return this._game;
    }

    create(name, extraProperties) {
        return super.create(name, Object.assign({
            ...extraProperties,
            game: this.getGame()
        }));
    }
}

export {
    ItemRepository
};
