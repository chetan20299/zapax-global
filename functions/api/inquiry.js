// Cloudflare Pages Function: POST /api/inquiry. Env vars are set in Pages → Settings → Variables (see DEPLOYMENT.md).
import { handleInquiry } from '../../server/inquiry-core.mjs';
import templates from '../../server/generated/email-templates.json';

export const onRequest = ({ request, env }) => handleInquiry(request, env, templates);
