import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const { tasks } = await req.json();

  for (const task of tasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: { order: task.order },
    });
  }

  return Response.json({ success: true });
}