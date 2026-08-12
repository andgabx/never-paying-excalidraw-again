const { Editor } = require('tldraw');
console.log(Editor.prototype.zoomIn ? "zoomIn exists" : "zoomIn missing");
console.log(Editor.prototype.getViewportScreenCenter ? "getViewportScreenCenter exists" : "getViewportScreenCenter missing");
