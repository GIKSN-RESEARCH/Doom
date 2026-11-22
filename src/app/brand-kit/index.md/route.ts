import { agentDocumentResponse, brandKitMarkdown } from "@/lib/agent-documents";

export const dynamic = "force-static";

export function GET() {
  return agentDocumentResponse(brandKitMarkdown(), {
    markdown: true,
    canonicalPath: "/brand-kit",
  });
}
