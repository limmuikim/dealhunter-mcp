/**
 * Vercel Serverless Function: GET /api/health
 * Sibling of package.json at PROJECT ROOT.
 */

import { handleHealth } from "../lib/healthHandler.ts";

export default async function handler(req: any, res: any) {
  return handleHealth(req, res);
}
