import { GET as handle } from '../app/api/movies/route';
export function GET(request: Request) { return handle(request); }
