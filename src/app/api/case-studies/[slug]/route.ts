import { json, jsonError, handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { caseStudyDetailSelect } from "@/lib/selects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const item = await prisma.caseStudy.findFirst({
      where: { slug, published: true },
      select: caseStudyDetailSelect,
    });

    if (!item) {
      return jsonError("Not found", 404);
    }

    return json(item);
  } catch (error) {
    return handleRouteError(error);
  }
}
