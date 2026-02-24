const pkg = require('react-resizable-panels');
console.log('Exports:', Object.keys(pkg));
console.log('Group type:', typeof pkg.Group);
console.log('Panel type:', typeof pkg.Panel);
console.log('Separator type:', typeof pkg.Separator);
console.log('PanelResizeHandle:', pkg.PanelResizeHandle);
const fs = require('fs');
console.log('Package JSON version:', require('react-resizable-panels/package.json').version);
