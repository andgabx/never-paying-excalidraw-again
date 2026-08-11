import { createTLStore, defaultShapeUtils, getSnapshot } from 'tldraw';
const store = createTLStore({ shapeUtils: defaultShapeUtils });
console.log(JSON.stringify(getSnapshot(store)));
