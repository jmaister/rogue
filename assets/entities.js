import Repository from './repository';
import EntityMixins from './entitymixins';
import Entity from './entity';

// Player template
const PlayerTemplate = {
    name: 'human (you)',
    character: '@',
    foreground: 'white',
    background: 'black',
    maxHp: 40,
    attackValue: 10,
    sightRadius: 15,
    inventorySlots: 22,
    mixins: [
        EntityMixins.PlayerActor,
        EntityMixins.Attacker,
        EntityMixins.Destructible,
        EntityMixins.InventoryHolder,
        EntityMixins.FoodConsumer,
        EntityMixins.Sight,
        EntityMixins.MessageRecipient,
        EntityMixins.Equipper,
        EntityMixins.ExperienceGainer,
        EntityMixins.PlayerStatGainer
    ]
};

class EntityRepository extends Repository {

    constructor(game) {
        super('entities', Entity);
        this._game = game;

        this.define('fungus', {
            name: 'fungus',
            character: 'F',
            foreground: 'green',
            maxHp: 10,
            speed: 250,
            mixins: [
                EntityMixins.FungusActor,
                EntityMixins.Destructible,
                EntityMixins.ExperienceGainer,
                EntityMixins.RandomStatGainer
            ]
        });
        
        this.define('bat', {
            name: 'bat',
            character: 'B',
            foreground: 'white',
            maxHp: 5,
            attackValue: 4,
            speed: 2000,
            mixins: [
                EntityMixins.TaskActor,
                EntityMixins.Attacker,
                EntityMixins.Destructible,
                EntityMixins.CorpseDropper,
                EntityMixins.ExperienceGainer,
                EntityMixins.RandomStatGainer
            ]
        });
        
        this.define('newt', {
            name: 'newt',
            character: ':',
            foreground: 'yellow',
            maxHp: 3,
            attackValue: 2,
            mixins: [
                EntityMixins.TaskActor, 
                EntityMixins.Attacker,
                EntityMixins.Destructible,
                EntityMixins.CorpseDropper,
                EntityMixins.ExperienceGainer,
                EntityMixins.RandomStatGainer
            ]
        });
        
        
        this.define('kobold', {
            name: 'kobold',
            character: 'k',
            foreground: 'white',
            maxHp: 6,
            attackValue: 4,
            sightRadius: 5,
            tasks: ['hunt', 'wander'],
            mixins: [
                EntityMixins.TaskActor,
                EntityMixins.Sight,
                EntityMixins.Attacker,
                EntityMixins.Destructible,
                EntityMixins.CorpseDropper,
                EntityMixins.ExperienceGainer,
                EntityMixins.RandomStatGainer
            ]
        });
        
        this.define('giant zombie', {
            name: 'giant zombie', 
            character: 'Z',
            foreground: 'teal',
            maxHp: 30,
            attackValue: 8,
            defenseValue: 5,
            level: 5,
            sightRadius: 6,
            mixins: [
                EntityMixins.GiantZombieActor,
                EntityMixins.Sight,
                EntityMixins.Attacker,
                EntityMixins.Destructible,
                EntityMixins.CorpseDropper,
                EntityMixins.ExperienceGainer
            ]
        }, {
            disableRandomCreation: true
        });
        
        this.define('slime', {
            name: 'slime',
            character: 's',
            foreground: 'lightGreen',
            maxHp: 10,
            attackValue: 5,
            sightRadius: 3,
            tasks: ['hunt', 'wander'],
            mixins: [
                EntityMixins.TaskActor,
                EntityMixins.Sight,
                EntityMixins.Attacker,
                EntityMixins.Destructible,
                EntityMixins.CorpseDropper,
                EntityMixins.ExperienceGainer,
                EntityMixins.RandomStatGainer
            ]
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
    PlayerTemplate,
    EntityRepository
};
