import prisma from "@/backend/database/prisma";

export default async function Hola() {
  const users = await prisma.user.findMany();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      
    </div>
  );
}