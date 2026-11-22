import { agentDocumentResponse, llmsIndex } from "@/lib/agent-documents";

export const dynamic = "force-static";

export function GET() {
  return agentDocumentResponse(llmsIndex());
}
