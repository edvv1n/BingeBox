import { GET as handle } from '../app/api/movies/route.js';
export function GET(request: Request) { return handle(request); }
