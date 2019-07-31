
class Glyph {
    constructor(properties={}) {
        // Instantiate properties to default if they weren't passed
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
        if (typeof this._foreground === 'function') {
            return this._foreground();
        }
        return this._foreground; 
    }

    getRepresentation() {
        return '%c{' + this._foreground + '}%b{' + this._background + '}' + this._char +
            '%c{white}%b{black}';
    }
}

export default Glyph;