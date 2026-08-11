import { createTLStore, defaultShapeUtils } from 'tldraw';
const store = createTLStore({ shapeUtils: defaultShapeUtils });
console.log(JSON.stringify(store.getSnapshot()));
