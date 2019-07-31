import {vsprintf} from 'sprintf-js';

import {KEYS, Color} from 'rot-js';

import Utilities from './utilities';
import Entity from './entity';
import Geometry from './geometry';
import Builder from './builder';
import Cave from './maps/cave';
import {PlayerTemplate} from './entities';

const GameScreens = {};

class Screen {

    constructor(name, game) {
        this._name = name;
        this._game = game;
        this._subScreen = null;
    }

    getGame() {
        return this._game;
    }
    getName() {
        return this._name;
    }

    enter() {
        console.log("Enter [" + this.getName() + "] screen.");
    }
    exit() {
        console.log("Exit [" + this.getName() + "] screen.");
    }
    render(display) {
        display.drawText(1,1, "%c{yellow}"+ this.getName() +" Screen");
    }
    handleInput(inputType, inputData) {
        console.log("Handling input [" + this.getName() + "]", inputType, inputData); 
    }

    getSubScreen() {
        return this._subScreen;
    }

    setSubScreen(subScreen) {
        this._subScreen = subScreen;
        // Refresh screen on changing the subscreen
        this.getGame().refresh();
    }

}

class StartScreen extends Screen {

    constructor(game) {
        super("Start Screen", game);
    }

    render(display) {
        // Render our prompt to the screen
        display.drawText(1,1, "%c{yellow}Javascript Roguelike");
        display.drawText(1,2, "Press [Enter] to start!");
    }
    handleInput(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === KEYS.VK_RETURN) {
                this.getGame().switchScreen(new PlayScreen(this.getGame()));
            }
        }
    }
}

// Define our playing screen
class PlayScreen extends Screen {

    constructor(game) {
        super("Play screen", game);
        this._player = null;
        this._gameEnded = false;
    }
    enter() {  
        var map = [];
        // Create a map based on our size parameters
        var width = 100;
        var height = 48;
        var depth = 6;

        // Create our map from the tiles and player
        const playerTpl = Object.assign({}, PlayerTemplate, {
            game: this.getGame()
        });
        this._player = new Entity(playerTpl);
        var tiles = new Builder(width, height, depth).getTiles();
        var map = new Cave(tiles, this.getGame(), this._player);
        // Start the map's engine
        map.getEngine().start();
    }

    render(display) {
        // Render subscreen if there is one
        if (this.getSubScreen()) {
            this.getSubScreen().render(display);
            return;
        }
        var screenWidth = this.getGame().getScreenWidth();
        var screenHeight = this.getGame().getScreenHeight();

        // Render the tiles
        this.renderTiles(display);
        
        // Get the messages in the player's queue and render them
        var messages = this._player.getMessages();
        var messageY = 0;
        for (var i = 0; i < messages.length; i++) {
            // Draw each message, adding the number of lines
            messageY += display.drawText(
                0, 
                messageY,
                '%c{white}%b{black}' + messages[i]
            );
        }

        // Render player stats
        var stats = '%c{white}%b{black}';
        stats += vsprintf('HP: %d/%d L: %d XP: %d', 
            [this._player.getHp(), this._player.getMaxHp(),
             this._player.getLevel(), this._player.getExperience()]);
        display.drawText(0, screenHeight, stats);
        // Render hunger state
        var hungerState = this._player.getHungerState();
        display.drawText(screenWidth - hungerState.length, screenHeight, hungerState);
    }

    renderTiles(display) {
        var screenWidth = this.getGame().getScreenWidth();
        var screenHeight = this.getGame().getScreenHeight();
        var offsets = this.getScreenOffsets();
        var topLeftX = offsets.x;
        var topLeftY = offsets.y;
        // This object will keep track of all visible map cells
        var visibleCells = {};
        // Store this._player.getMap() and player's z to prevent losing it in callbacks
        var map = this._player.getMap();
        var currentDepth = this._player.getZ();
        // Find all visible cells and update the object
        map.getFov(currentDepth).compute(
            this._player.getX(), this._player.getY(), 
            this._player.getSightRadius(), 
            function(x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;
                // Mark cell as explored
                map.setExplored(x, y, currentDepth, true);
            });
        // Render the explored map cells
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
            for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
                if (map.isExplored(x, y, currentDepth)) {
                    // Fetch the glyph for the tile and render it to the screen
                    // at the offset position.
                    var glyph = map.getTile(x, y, currentDepth);
                    var foreground = glyph.getForeground();
                    // If we are at a cell that is in the field of vision, we need
                    // to check if there are items or entities.
                    if (visibleCells[x + ',' + y]) {
                        // Check for items first, since we want to draw entities
                        // over items.
                        var items = map.getItemsAt(x, y, currentDepth);
                        // If we have items, we want to render the top most item
                        if (items) {
                            glyph = items[items.length - 1];
                        }
                        // Check if we have an entity at the position
                        if (map.getEntityAt(x, y, currentDepth)) {
                            glyph = map.getEntityAt(x, y, currentDepth);
                        }
                        // Update the foreground color in case our glyph changed
                        foreground = glyph.getForeground();
                    } else {
                        // Since the tile was previously explored but is not 
                        // visible, we want to change the foreground color to
                        // dark gray.
                        // foreground = 'darkGray';
                        foreground = '#333333';
                    }
                    display.draw(
                        x - topLeftX,
                        y - topLeftY,
                        glyph.getChar(), 
                        foreground, 
                        glyph.getBackground());
                }
            }
        }
    }
    
    getScreenOffsets() {
        // Make sure we still have enough space to fit an entire game screen
        var topLeftX = Math.max(0, this._player.getX() - (this.getGame().getScreenWidth() / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, this._player.getMap().getWidth() -
            this.getGame().getScreenWidth());
        // Make sure the y-axis doesn't above the top bound
        var topLeftY = Math.max(0, this._player.getY() - (this.getGame().getScreenHeight() / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.min(topLeftY, this._player.getMap().getHeight() - this.getGame().getScreenHeight());
        return {
            x: topLeftX,
            y: topLeftY
        };
    }

    handleInput(inputType, inputData) {
        // If the game is over, enter will bring the user to the losing screen.
        if (this._gameEnded) {
            if (inputType === 'keydown' && inputData.keyCode === KEYS.VK_RETURN) {
                this.getGame().switchScreen(new LoseScreen(this.getGame()));
            }
            // Return to make sure the user can't still play
            return;
        }
        // Handle subscreen input if there is one
        if (this.getSubScreen()) {
            this.getSubScreen().handleInput(inputType, inputData);
            return;
        }
        if (inputType === 'keydown') {
            // If enter is pressed, go to the win screen
            // If escape is pressed, go to lose screen
            if (inputData.keyCode === KEYS.VK_RETURN) {
                this.getGame().switchScreen(new WinScreen(this.getGame()));
            } else if (inputData.keyCode === KEYS.VK_ESCAPE) {
                this.getGame().switchScreen(new LoseScreen(this.getGame()));
            } else {
                // Movement
                if (inputData.keyCode === KEYS.VK_LEFT) {
                    this.move(-1, 0, 0);
                } else if (inputData.keyCode === KEYS.VK_RIGHT) {
                    this.move(1, 0, 0);
                } else if (inputData.keyCode === KEYS.VK_UP) {
                    this.move(0, -1, 0);
                } else if (inputData.keyCode === KEYS.VK_DOWN) {
                    this.move(0, 1, 0);
                } else if (inputData.keyCode === KEYS.VK_I) {
                    if (this._player.getItems().filter(function(x){return x;}).length === 0) {
                        // If the player has no items, send a message and don't take a turn
                        Utilities.sendMessage(this._player, "You are not carrying anything!");
                        this.getGame().refresh();
                    } else {
                        // Show the inventory
                        GameScreens.inventoryScreen.setup(this._game, this._player, this._player.getItems());
                        this.setSubScreen(GameScreens.inventoryScreen);
                    }
                    return;
                } else if (inputData.keyCode === KEYS.VK_D) {
                    if (this._player.getItems().filter(function(x){return x;}).length === 0) {
                        // If the player has no items, send a message and don't take a turn
                        Utilities.sendMessage(this._player, "You have nothing to drop!");
                        this.getGame().refresh();
                    } else {
                        // Show the drop screen
                        GameScreens.dropScreen.setup(this._game, this._player, this._player.getItems());
                        this.setSubScreen(GameScreens.dropScreen);
                    }
                    return;
                } else if (inputData.keyCode === KEYS.VK_E) {
                    // Show the eat screen
                    if (GameScreens.eatScreen.setup(this._game, this._player, this._player.getItems())) {
                        this.setSubScreen(GameScreens.eatScreen);
                    } else {
                        Utilities.sendMessage(this._player, "You have nothing to eat!");
                        this.getGame().refresh();
                    }
                    return;
                } else if (inputData.keyCode === KEYS.VK_W) {
                    if (inputData.shiftKey) {
                        // Show the wear screen
                        this.showItemsSubScreen(GameScreens.wearScreen, this._player.getItems(),
                            'You have nothing to wear.');
                    } else {
                        // Show the wield screen
                        this.showItemsSubScreen(GameScreens.wieldScreen, this._player.getItems(),
                            'You have nothing to wield.');
                    }
                    return;
                } else if (inputData.keyCode === KEYS.VK_X) {
                    // Show the drop screen
                    this.showItemsSubScreen(GameScreens.examineScreen, this._player.getItems(),
                       'You have nothing to examine.');
                    return;
                } else if (inputData.keyCode === KEYS.VK_COMMA) {
                    var items = this._player.getMap().getItemsAt(this._player.getX(), this._player.getY(), this._player.getZ());
                    // If there is only one item, directly pick it up
                    if (items && items.length === 1) {
                        var item = items[0];
                        if (this._player.pickupItems([0])) {
                            Utilities.sendMessage(this._player, "You pick up %s.", [item.describeA()]);
                        } else {
                            Utilities.sendMessage(this._player, "Your inventory is full! Nothing was picked up.");
                        }
                    } else {
                        this.showItemsSubScreen(GameScreens.pickupScreen, items,
                            'There is nothing here to pick up.');
                    } 
                } else {
                    // Not a valid key
                    return;
                }
                // Unlock the engine
                this._player.getMap().getEngine().unlock();
            }
        } else if (inputType === 'keypress') {
            var keyChar = String.fromCharCode(inputData.charCode);
            if (keyChar === '>') {
                this.move(0, 0, 1);
            } else if (keyChar === '<') {
                this.move(0, 0, -1);
            } else if (keyChar === ';') {
                // Setup the look screen.
                var offsets = this.getScreenOffsets();
                GameScreens.lookScreen.setup(this._game, this._player,
                    this._player.getX(), this._player.getY(),
                    offsets.x, offsets.y);
                this.setSubScreen(GameScreens.lookScreen);
                return;
            } else if (keyChar === '?') {
                // Setup the look screen.
                this.setSubScreen(GameScreens.helpScreen);
                return;
            } else {
                // Not a valid key
                return;
            }
            // Unlock the engine
            this._player.getMap().getEngine().unlock();
        } 
    }
    move(dX, dY, dZ) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        var newZ = this._player.getZ() + dZ;
        // Try to move to the new cell
        this._player.tryMove(newX, newY, newZ);
    }

    setGameEnded(gameEnded) {
        this._gameEnded = gameEnded;
    }
    
    showItemsSubScreen(subScreen, items, emptyMessage) {
        if (items && subScreen.setup(this._game, this._player, items) > 0) {
            this.setSubScreen(subScreen);
        } else {
            Utilities.sendMessage(this._player, emptyMessage);
            this.getGame().refresh();
        }
    }
}

// Define our winning screen
class WinScreen extends Screen {

    constructor(game) {
        super("Win screen", game);
    }

    render(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            // Generate random background colors
            var r = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var background = Color.toRGB([r, g, b]);
            display.drawText(2, i + 1, "%b{" + background + "}You win!");
        }
    }
    handleInput(inputType, inputData) {
        // Nothing to do here      
    }
}

// Define our winning screen
class LoseScreen extends Screen {
    constructor(game) {
        super("Lose screen", game);
    }
    render(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            display.drawText(2, i + 1, "%b{red}You lose! :(");
        }
    }
    handleInput(inputType, inputData) {
        // Nothing to do here      
    }
}

class ItemListScreen {
    constructor(template) {
        // Set up based on the template
        this._caption = template['caption'];
        this._okFunction = template['ok'];
        // By default, we use the identity function
        this._isAcceptableFunction = template['isAcceptable'] || function(x) {
            return x;
        }
        // Whether the user can select items at all.
        this._canSelectItem = template['canSelect'];
        // Whether the user can select multiple items.
        this._canSelectMultipleItems = template['canSelectMultipleItems'];
        // Whether a 'no item' option should appear.
        this._hasNoItemOption = template['hasNoItemOption'];
    }

    setup(game, player, items) {
        this._game = game;
        this._player = player;
        // Should be called before switching to the screen.
        var count = 0;
        // Iterate over each item, keeping only the aceptable ones and counting
        // the number of acceptable items.
        var that = this;
        this._items = items.map(function(item) {
            // Transform the item into null if it's not acceptable
            if (that._isAcceptableFunction(item)) {
                count++;
                return item;
            } else {
                return null;
            }
        });
        // Clean set of selected indices
        this._selectedIndices = {};
        return count;
    }

    getGame() {
        return this._game;
    }

    render(display) {
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        // Render the caption in the top row
        display.drawText(0, 0, this._caption);
        // Render the no item row if enabled
        if (this._hasNoItemOption) {
            display.drawText(0, 1, '0 - no item');
        }
        var row = 0;
        for (var i = 0; i < this._items.length; i++) {
            // If we have an item, we want to render it.
            if (this._items[i]) {
                // Get the letter matching the item's index
                var letter = letters.substring(i, i + 1);
                // If we have selected an item, show a +, else show a dash between
                // the letter and the item's name.
                var selectionState = (this._canSelectItem && this._canSelectMultipleItems &&
                    this._selectedIndices[i]) ? '+' : '-';
                // Check if the item is worn or wielded
                var suffix = '';
                if (this._items[i] === this._player.getArmor()) {
                    suffix = ' (wearing)';
                } else if (this._items[i] === this._player.getWeapon()) {
                    suffix = ' (wielding)';
                }
                // Render at the correct row and add 2.
                display.drawText(0, 2 + row,  letter + ' ' + selectionState + ' ' +
                    this._items[i].describe() + suffix);
                row++;
            }
        }
    }

    executeOkFunction() {
        // Gather the selected items.
        var selectedItems = {};
        for (var key in this._selectedIndices) {
            selectedItems[key] = this._items[key];
        }
        // Switch back to the play screen.
        this._game.getCurrentScreen().setSubScreen(undefined);
        // Call the OK function and end the player's turn if it return true.
        if (this._okFunction(selectedItems)) {
            this._player.getMap().getEngine().unlock();
        }
    }

    handleInput(inputType, inputData) {
        if (inputType === 'keydown') {
            // If the user hit escape, hit enter and can't select an item, or hit
            // enter without any items selected, simply cancel out
            if (inputData.keyCode === KEYS.VK_ESCAPE || 
                (inputData.keyCode === KEYS.VK_RETURN && 
                    (!this._canSelectItem || Object.keys(this._selectedIndices).length === 0))) {
                this._game.getCurrentScreen().setSubScreen(undefined);
            // Handle pressing return when items are selected
            } else if (inputData.keyCode === KEYS.VK_RETURN) {
                this.executeOkFunction();
            // Handle pressing zero when 'no item' selection is enabled
            } else if (this._canSelectItem && this._hasNoItemOption && inputData.keyCode === KEYS.VK_0) {
                this._selectedIndices = {};
                this.executeOkFunction();
            // Handle pressing a letter if we can select
            } else if (this._canSelectItem && inputData.keyCode >= KEYS.VK_A &&
                inputData.keyCode <= KEYS.VK_Z) {
                // Check if it maps to a valid item by subtracting 'a' from the character
                // to know what letter of the alphabet we used.
                var index = inputData.keyCode - KEYS.VK_A;
                if (this._items[index]) {
                    // If multiple selection is allowed, toggle the selection status, else
                    // select the item and exit the screen
                    if (this._canSelectMultipleItems) {
                        if (this._selectedIndices[index]) {
                            delete this._selectedIndices[index];
                        } else {
                            this._selectedIndices[index] = true;
                        }
                        // Redraw screen
                        this.getGame().refresh();
                    } else {
                        this._selectedIndices[index] = true;
                        this.executeOkFunction();
                    }
                }
            }
        }
    }    
}

GameScreens.inventoryScreen = new ItemListScreen({
    caption: 'Inventory',
    canSelect: false
});

GameScreens.pickupScreen = new ItemListScreen({
    caption: 'Choose the items you wish to pickup',
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems) {
        // Try to pick up all items, messaging the player if they couldn't all be
        // picked up.
        if (!this._player.pickupItems(Object.keys(selectedItems))) {
            Utilities.sendMessage(this._player, "Your inventory is full! Not all items were picked up.");
        }
        return true;
    }
});

GameScreens.dropScreen = new ItemListScreen({
    caption: 'Choose the item you wish to drop',
    canSelect: true,
    canSelectMultipleItems: false,
    ok: function(selectedItems) {
        // Drop the selected item
        this._player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});

GameScreens.eatScreen = new ItemListScreen({
    caption: 'Choose the item you wish to eat',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin('Edible');
    },
    ok: function(selectedItems) {
        // Eat the item, removing it if there are no consumptions remaining.
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        Utilities.sendMessage(this._player, "You eat %s.", [item.describeThe()]);
        item.eat(this._player);
        if (!item.hasRemainingConsumptions()) {
            this._player.removeItem(key);
        }
        return true;
    }
});

GameScreens.wieldScreen = new ItemListScreen({
    caption: 'Choose the item you wish to wield',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        return item && item.hasMixin('Equippable') && item.isWieldable();
    },
    ok: function(selectedItems) {
        // Check if we selected 'no item'
        var keys = Object.keys(selectedItems);
        if (keys.length === 0) {
            this._player.unwield();
            Utilities.sendMessage(this._player, "You are empty handed.")
        } else {
            // Make sure to unequip the item first in case it is the armor.
            var item = selectedItems[keys[0]];
            this._player.unequip(item);
            this._player.wield(item);
            Utilities.sendMessage(this._player, "You are wielding %s.", [item.describeA()]);
        }
        return true;
    }
});

GameScreens.wearScreen = new ItemListScreen({
    caption: 'Choose the item you wish to wear',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
    isAcceptable: function(item) {
        return item && item.hasMixin('Equippable') && item.isWearable();
    },
    ok: function(selectedItems) {
        // Check if we selected 'no item'
        var keys = Object.keys(selectedItems);
        if (keys.length === 0) {
            this._player.unwield();
            Utilities.sendMessage(this._player, "You are not wearing anthing.")
        } else {
            // Make sure to unequip the item first in case it is the weapon.
            var item = selectedItems[keys[0]];
            this._player.unequip(item);
            this._player.wear(item);
            Utilities.sendMessage(this._player, "You are wearing %s.", [item.describeA()]);
        }
        return true;
    }
});

GameScreens.gainStatScreen = {
    setup: function(game, entity) {
        // Must be called before rendering.
        this._game = game;
        this._entity = entity;
        this._options = entity.getStatOptions();
    },
    render: function(display) {
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        display.drawText(0, 0, 'Choose a stat to increase: ');

        // Iterate through each of our options
        for (var i = 0; i < this._options.length; i++) {
            display.drawText(0, 2 + i, 
                letters.substring(i, i + 1) + ' - ' + this._options[i][0]);
        }

        // Render remaining stat points
        display.drawText(0, 4 + this._options.length,
            "Remaining points: " + this._entity.getStatPoints());   
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            // If a letter was pressed, check if it matches to a valid option.
            if (inputData.keyCode >= KEYS.VK_A && inputData.keyCode <= KEYS.VK_Z) {
                // Check if it maps to a valid item by subtracting 'a' from the character
                // to know what letter of the alphabet we used.
                var index = inputData.keyCode - KEYS.VK_A;
                if (this._options[index]) {
                    // Call the stat increasing function
                    this._options[index][1].call(this._entity);
                    // Decrease stat points
                    this._entity.setStatPoints(this._entity.getStatPoints() - 1);
                    // If we have no stat points left, exit the screen, else refresh
                    if (this._entity.getStatPoints() == 0) {
                        this._game.getCurrentScreen().setSubScreen(undefined);
                    } else {
                        this.getGame().refresh();
                    }
                }
            }
        }
    }
};

GameScreens.examineScreen = new ItemListScreen({
    caption: 'Choose the item you wish to examine',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return true;
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        if (keys.length > 0) {
            var item = selectedItems[keys[0]];
            Utilities.sendMessage(this._player, "It's %s (%s).", 
                [
                    item.describeA(false),
                    item.details()
                ]);
        }
        return true;
    }
});

class TargetBasedScreen {
    constructor(template={}) {
        // By default, our ok return does nothing and does not consume a turn.
        this._isAcceptableFunction = template['isAcceptable'] || function(item) {
            return false;
        };
        // OK ??
        this._okFunction = template['ok'] || function(items) {
            // Do not finish turn
            return false;
        };
        // The defaut caption function simply returns an empty string.
        this._captionFunction = template['captionFunction'] || function(x, y) {
            return '';
        }
    }

    setup(game, player, startX, startY, offsetX, offsetY) {
        this._game = game;
        this._player = player;
        // Store original position. Subtract the offset to make life easy so we don't
        // always have to remove it.
        this._startX = startX - offsetX;
        this._startY = startY - offsetY;
        // Store current cursor position
        this._cursorX = this._startX;
        this._cursorY = this._startY;
        // Store map offsets
        this._offsetX = offsetX;
        this._offsetY = offsetY;
        // Cache the FOV
        var visibleCells = {};
        this._player.getMap().getFov(this._player.getZ()).compute(
            this._player.getX(), this._player.getY(), 
            this._player.getSightRadius(), 
            function(x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;
            });
        this._visibleCells = visibleCells;
    }

    getGame() {
        return this._game;
    }

    render(display) {
        PlayScreen.prototype.renderTiles.call(this._game.getCurrentScreen(), display);
    
        // Draw a line from the start to the cursor.
        var points = Geometry.getLine(this._startX, this._startY, this._cursorX,
            this._cursorY);
    
        // Render stars along the line.
        for (var i = 0, l = points.length; i < l; i++) {
            display.drawText(points[i].x, points[i].y, '%c{magenta}*');
        }
    
        // Render the caption at the bottom.
        display.drawText(0, this.getGame().getScreenHeight() - 1, 
            this._captionFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY));
    }    

    handleInput(inputType, inputData) {
        // Move the cursor
        if (inputType == 'keydown') {
            if (inputData.keyCode === KEYS.VK_LEFT) {
                this.moveCursor(-1, 0);
            } else if (inputData.keyCode === KEYS.VK_RIGHT) {
                this.moveCursor(1, 0);
            } else if (inputData.keyCode === KEYS.VK_UP) {
                this.moveCursor(0, -1);
            } else if (inputData.keyCode === KEYS.VK_DOWN) {
                this.moveCursor(0, 1);
            } else if (inputData.keyCode === KEYS.VK_ESCAPE) {
                this._game.getCurrentScreen().setSubScreen(undefined);
            } else if (inputData.keyCode === KEYS.VK_RETURN) {
                this.executeOkFunction();
            }
        }
        this.getGame().refresh();
    }

    moveCursor(dx, dy) {
        // Make sure we stay within bounds.
        this._cursorX = Math.max(0, Math.min(this._cursorX + dx, this.getGame().getScreenWidth()));
        // We have to save the last line for the caption.
        this._cursorY = Math.max(0, Math.min(this._cursorY + dy, this.getGame().getScreenHeight() - 1));
    }

    executeOkFunction() {
        // Switch back to the play screen.
        this._game.getCurrentScreen().setSubScreen(undefined);
        // Call the OK function and end the player's turn if it return true.
        if (this._okFunction(this._cursorX + this._offsetX, this._cursorY + this._offsetY)) {
            this._player.getMap().getEngine().unlock();
        }
    }
}

GameScreens.lookScreen = new TargetBasedScreen({
    captionFunction: function(x, y) {
        var z = this._player.getZ();
        var map = this._player.getMap();
        // If the tile is explored, we can give a better capton
        if (map.isExplored(x, y, z)) {
            // If the tile isn't explored, we have to check if we can actually 
            // see it before testing if there's an entity or item.
            if (this._visibleCells[x + ',' + y]) {
                var items = map.getItemsAt(x, y, z);
                // If we have items, we want to render the top most item
                if (items) {
                    var item = items[items.length - 1];
                    return vsprintf('%s - %s (%s)', [
                        item.getRepresentation(),
                        item.describeA(true),
                        item.details()
                    ]);
                // Else check if there's an entity
                } else if (map.getEntityAt(x, y, z)) {
                    var entity = map.getEntityAt(x, y, z);
                    return vsprintf('%s - %s (%s)', [
                        entity.getRepresentation(),
                        entity.describeA(true),
                        entity.details()
                    ]);
                }
            }
            // If there was no entity/item or the tile wasn't visible, then use
            // the tile information.
            return vsprintf('%s - %s', [
                map.getTile(x, y, z).getRepresentation(),
                map.getTile(x, y, z).getDescription()
            ]);

        } else {
            // If the tile is not explored, show the null tile description.
            return vsprintf('%s - %s', [
                Tile.nullTile.getRepresentation(),
                Tile.nullTile.getDescription()
            ]);
        }
    }
});

// Define our help screen
GameScreens.helpScreen = {
    render: function(display) {
        var text = 'jsrogue help';
        var border = '-------------';
        var y = 0;
        display.drawText(this.getGame().getScreenWidth() / 2 - text.length / 2, y++, text);
        display.drawText(this.getGame().getScreenWidth() / 2 - text.length / 2, y++, border);
        display.drawText(0, y++, 'The villagers have been complaining of a terrible stench coming from the cave.');
        display.drawText(0, y++, 'Find the source of this smell and get rid of it!');
        y += 3;
        display.drawText(0, y++, '[,] to pick up items');
        display.drawText(0, y++, '[d] to drop items');
        display.drawText(0, y++, '[e] to eat items');
        display.drawText(0, y++, '[w] to wield items');
        display.drawText(0, y++, '[W] to wield items');
        display.drawText(0, y++, '[x] to examine items');
        display.drawText(0, y++, '[;] to look around you');
        display.drawText(0, y++, '[?] to show this help screen');
        y += 3;
        text = '--- press any key to continue ---';
        display.drawText(this.getGame().getScreenWidth() / 2 - text.length / 2, y++, text);
    },
    handleInput: function(inputType, inputData) {
        this._game.getCurrentScreen().setSubScreen(null);
    }
};

export {
    StartScreen,
    PlayScreen,
    WinScreen,
    GameScreens
}
