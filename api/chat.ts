import { POST as handle } from '../app/api/chat/route.js';
export function POST(request: Request) { return handle(request); }
