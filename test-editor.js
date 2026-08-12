const { Editor, createTLStore, defaultShapeUtils } = require('tldraw');
const store = createTLStore({ shapeUtils: defaultShapeUtils });
const editor = new Editor({ store });
console.log(Object.keys(editor));
