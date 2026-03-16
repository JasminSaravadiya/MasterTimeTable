import { build } from 'vite';
import fs from 'fs';
build().catch(e => {
    fs.writeFileSync('vite_error.json', JSON.stringify({
        message: e.message,
        id: e.id,
        loc: e.loc,
        frame: e.frame
    }, null, 2));
});
