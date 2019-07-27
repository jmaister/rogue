
class Item extends Glyph {
    
    constructor(properties={}) {
        // Call the glyph's construtor with our set of properties
        super(properties);
        // Instantiate any properties from the passed object
        this._name = properties['name'] || '';
    }

}
