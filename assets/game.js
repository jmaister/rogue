
import {Display} from 'rot-js';

import {EntityRepository} from './entities';
import {ItemRepository} from './items';

import {StartScreen} from './screens';


class Game {

    constructor() {
        this._display = null;
        this._currentScreen = null,
        this._screenWidth = 80;
        this._screenHeight = 24;
        this._entityRepository = new EntityRepository(this);
        this._itemRepository = new ItemRepository(this);
    }

    init() {
        this._display = new Display({
            width: this._screenWidth,
            height: this._screenHeight + 1
        });

        // Create a helper function for binding to an event
        // and making it send it to the screen
        var game = this; // So that we don't lose this
        var bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                // When an event is received, send it to the
                // screen if there is one
                if (game._currentScreen !== null) {
                    // Send the event type and data to the screen
                    game._currentScreen.handleInput(event, e);
                }
            });
        }
        // Bind keyboard input events
        bindEventToScreen('keydown');
        //bindEventToScreen('keyup');
        bindEventToScreen('keypress');    
    }

    getDisplay() {
        return this._display;
    }
    getScreenWidth() {
        return this._screenWidth;
    }
    getScreenHeight() {
        return this._screenHeight;
    }
    getEntityRepository() {
        return this._entityRepository;
    }
    getItemRepository() {
        return this._itemRepository;
    }
    getCurrentScreen() {
        return this._currentScreen;
    }
    
    switchScreen(screen) {
        // If we had a screen before, notify it that we exited
        if (this._currentScreen !== null) {
            this._currentScreen.exit();
        }
        // Clear the display
        this.getDisplay().clear();
        // Update our current screen, notify it we entered
        // and then render it
        this._currentScreen = screen;
        if (!this._currentScreen !== null) {
            this._currentScreen.enter();
            this.refresh();
        }
    }
    
    refresh() {
        // Clear the screen
        this._display.clear();
        // Render the screen
        this._currentScreen.render(this._display);
    }

}


Array.prototype.randomize = function randomize() {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
};

Array.prototype.random = function random() {
    const i = Math.floor(Math.random() * this.length);
    return this[i];
};

window.onload = function() {
    // Initialize the game
    const game = new Game();
    console.log("game created 1", game);
    //console.log("game created 2", Game.getInstance());

    game.init();
    // Add the container to our HTML page
    document.body.appendChild(game.getDisplay().getContainer());
    // Load the start screen
    game.switchScreen(new StartScreen(game));
}

export default Game;