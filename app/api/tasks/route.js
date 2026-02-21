import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const task = await prisma.task.findUnique({
    where: { id: params.id },
  });

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: {
      completed: !task.completed,
    },
  });

  return Response.json(updated);
}

export async function DELETE(req, { params }) {
  await prisma.task.delete({
    where: { id: params.id },
  });

  return Response.json({ success: true });
}

export async function POST(req) {
  const body = await req.json();

  const lastTask = await prisma.task.findFirst({
    orderBy: { order: "desc" },
  });

  const task = await prisma.task.create({
    data: {
      title: body.title,
      order: lastTask ? lastTask.order + 1 : 1,
    },
  });

  return Response.json(task);
}