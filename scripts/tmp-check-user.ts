import { prisma } from "../lib/prisma";
const u = await prisma.user.findMany({
  where: { email: { startsWith: "claim-e2e-" } },
  select: { id:true, email:true, role:true, emailVerified:true, isActive:true,
    doctorProfile: { select: { id:true, slug:true, isActive:true } },
    claims: { select: { doctorId:true, status:true, documents:true } } },
  orderBy: { createdAt: "desc" }, take: 3,
});
console.log(JSON.stringify(u, null, 1));
await prisma.$disconnect();
