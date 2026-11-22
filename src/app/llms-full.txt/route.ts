import {
  agentDocumentResponse,
  brandKitMarkdown,
  studioMarkdown,
} from "@/lib/agent-documents";

export const dynamic = "force-static";

export function GET() {
  return agentDocumentResponse(`${studioMarkdown()}\n---\n\n${brandKitMarkdown()}`);
}
