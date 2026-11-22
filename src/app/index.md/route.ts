import { agentDocumentResponse, studioMarkdown } from "@/lib/agent-documents";

export const dynamic = "force-static";

export function GET() {
  return agentDocumentResponse(studioMarkdown(), {
    markdown: true,
    canonicalPath: "/",
  });
}
