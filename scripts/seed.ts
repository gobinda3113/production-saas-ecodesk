import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminRole = await prisma.role.upsert({
    where: { code: "SUPER_ADMIN" },
    update: {},
    create: { code: "SUPER_ADMIN", name: "Super Admin", description: "Full system access" },
  });

  const clientRole = await prisma.role.upsert({
    where: { code: "CLIENT" },
    update: {},
    create: { code: "CLIENT", name: "Client", description: "Merchant dashboard access" },
  });

  const permissions = [
    { code: "rules:read", resource: "rules", action: "read", description: "Read keyword rules" },
    { code: "rules:create", resource: "rules", action: "create", description: "Create keyword rules" },
    { code: "rules:update", resource: "rules", action: "update", description: "Update keyword rules" },
    { code: "rules:delete", resource: "rules", action: "delete", description: "Delete keyword rules" },
    { code: "connections:read", resource: "connections", action: "read", description: "Read platform connections" },
    { code: "connections:connect", resource: "connections", action: "connect", description: "Connect platforms" },
    { code: "billing:read", resource: "billing", action: "read", description: "Read billing info" },
    { code: "billing:purchase", resource: "billing", action: "purchase", description: "Purchase credits" },
    { code: "activity:read", resource: "activity", action: "read", description: "Read activity logs" },
    { code: "settings:update", resource: "settings", action: "update", description: "Update settings" },
    { code: "admin:clients:read", resource: "admin.clients", action: "read", description: "Read client list" },
    { code: "admin:clients:update", resource: "admin.clients", action: "update", description: "Update clients" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@echodesk.com" },
    update: {},
    create: {
      email: "admin@echodesk.com",
      passwordHash: hashSync("admin123", 10),
      name: "EchoDesk Admin",
      status: "ACTIVE",
      userRoles: { create: { roleId: adminRole.id } },
    },
  });

  const client = await prisma.client.upsert({
    where: { slug: "aama-ko-pasal" },
    update: {},
    create: {
      businessName: "Aama Ko Pasal",
      slug: "aama-ko-pasal",
      contactEmail: "owner@aama.com",
      plan: "GROWTH",
      creditWallet: { create: { balance: 87 } },
    },
  });

  await prisma.user.upsert({
    where: { email: "owner@aama.com" },
    update: {},
    create: {
      email: "owner@aama.com",
      passwordHash: hashSync("password123", 10),
      name: "Raju Bhai",
      clientId: client.id,
      status: "ACTIVE",
      userRoles: { create: { roleId: clientRole.id } },
    },
  });

  const merchant2 = await prisma.client.upsert({
    where: { slug: "thamel-threads" },
    update: {},
    create: {
      businessName: "Thamel Threads",
      slug: "thamel-threads",
      contactEmail: "ops@threads.com",
      plan: "STARTER",
      creditWallet: { create: { balance: 18 } },
    },
  });

  await prisma.user.upsert({
    where: { email: "ops@threads.com" },
    update: {},
    create: {
      email: "ops@threads.com",
      passwordHash: hashSync("password123", 10),
      name: "Threads Ops",
      clientId: merchant2.id,
      status: "ACTIVE",
      userRoles: { create: { roleId: clientRole.id } },
    },
  });

  console.log("Seed complete!");
  console.log("  Admin: admin@echodesk.com / admin123");
  console.log("  Client: owner@aama.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
