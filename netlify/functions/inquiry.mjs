// Netlify Function (v2): POST /api/inquiry. Env vars are set in the Netlify dashboard (see DEPLOYMENT.md).
import { handleInquiry } from '../../server/inquiry-core.mjs';
import templates from '../../server/generated/email-templates.json';

export default (request) => handleInquiry(request, process.env, templates);
export const config = { path: '/api/inquiry' };
