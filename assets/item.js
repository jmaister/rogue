
class Item extends DynamicGlyph {
    
    constructor(properties={}) {
        // Call the glyph's construtor with our set of properties
        super(properties);
        // Instantiate any properties from the passed object
        this._name = properties['name'] || '';
    }

    describe() {
        return this._name;
    }    

    describeA(capitalize) {
        // Optional parameter to capitalize the a/an.
        var prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
        var string = this.describe();
        var firstLetter = string.charAt(0).toLowerCase();
        // If word starts by a vowel, use an, else use a. Note that this is not perfect.
        var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
    
        return prefixes[prefix] + ' ' + string;
    }
}
