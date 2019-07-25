var Game = {
    _display: null,
    _currentScreen: null,
    _screenWidth: 80,
    _screenHeight: 24,

    init: function() {
        this._display = new ROT.Display({
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
        //bindEventToScreen('keypress');        
    },

    getDisplay() {
        return this._display;
    },
    getScreenWidth: function() {
        return this._screenWidth;
    },
    getScreenHeight: function() {
        return this._screenHeight;
    },
    
    switchScreen: function(screen) {
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
    },
    
    refresh: function() {
        // Clear the screen
        this._display.clear();
        // Render the screen
        this._currentScreen.render(this._display);
    },

    sendMessage: function(recipient, message, args) {
        // Make sure the recipient can receive the message 
        // before doing any work.
        if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
            // If args were passed, then we format the message, else
            // no formatting is necessary
            if (args) {
                message = vsprintf(message, args);
            }
            recipient.receiveMessage(message);
        }
    },

    sendMessageNearby: function(map, centerX, centerY, message, args) {
        // If args were passed, then we format the message, else
        // no formatting is necessary
        if (args) {
            message = vsprintf(message, args);
        }
        // Get the nearby entities
        const entities = map.getEntitiesWithinRadius(centerX, centerY, 5);
        // Iterate through nearby entities, sending the message if
        // they can receive it.
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].hasMixin(Game.Mixins.MessageRecipient)) {
                entities[i].receiveMessage(message);
            }
        }
    }    
}

window.onload = function() {
    // Initialize the game
    Game.init();
    // Add the container to our HTML page
    document.body.appendChild(Game.getDisplay().getContainer());
    // Load the start screen
    Game.switchScreen(Game.Screen.startScreen);
}
