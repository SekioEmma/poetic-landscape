import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 plugins:[react()],base:'./',
 resolve:{alias:[{find:/^maplibre-gl$/,replacement:fileURLToPath(new URL('./src/map/maplibre-compat.ts',import.meta.url))}]},
 // Let Vite process the bridge's worker URL, rather than feeding its query to
 // the dependency optimizer as a Windows filesystem name on a cold start.
 optimizeDeps:{exclude:['maplibre-gl']},
 build:{chunkSizeWarningLimit:2600},
});
