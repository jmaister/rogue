
class Repository {
    constructor(name, ctor) {
        this._name = name;
        this._templates = {};
        this._ctor = ctor;
    }

    define(name, template) {
        this._templates[name] = template;
    }

    create(name) {
        // Make sure there is a template with the given name.
        var template = this._templates[name];
    
        if (!template) {
            throw new Error("No template named '" + name + "' in repository '" +
                this._name + "'");
        }
    
        // Create the object, passing the template as an argument
        return new this._ctor(template);
    }

    createRandom() {
        // Pick a random key and create an object based off of it.
        return this.create(Object.keys(this._templates).random());
    }    
}
