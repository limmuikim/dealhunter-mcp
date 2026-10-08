/**
 * Vercel Serverless Function: POST /api/ideas
 * Sibling of package.json at PROJECT ROOT.
 */

import { handleIdeas } from "../lib/ideasHandler.ts";

export default async function handler(req: any, res: any) {
  return handleIdeas(req, res);
}
