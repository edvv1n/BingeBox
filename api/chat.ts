import { POST as handle } from '../app/api/chat/route';
export function POST(request: Request) { return handle(request); }
