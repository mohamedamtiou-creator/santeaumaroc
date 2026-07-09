import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
config();
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const d = await p.doctor.findFirst({ where:{isActive:true,slug:{not:null}}, select:{slug:true} });
console.log(d.slug);
await p.$disconnect();
