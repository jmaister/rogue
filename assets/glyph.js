class Glyph {
    constructor(properties) {
        // Instantiate properties to default if they weren't passed
        properties = properties || {};
        this._char = properties['character'] || ' ';
        this._foreground = properties['foreground'] || 'white';
        this._background = properties['background'] || 'black';
    }

    // Create standard getters for glyphs
    getChar() { 
        return this._char; 
    }
    getBackground() {
        return this._background;
    }
    getForeground() { 
        return this._foreground; 
    }

}