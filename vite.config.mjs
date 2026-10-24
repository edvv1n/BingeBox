import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},esbuild:{jsx:'automatic'},build:{target:['chrome109','safari15.6']}});
