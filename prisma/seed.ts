import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create an admin account
  const adminPassword = await bcrypt.hash("adminpassword", 10);
  const admin = await prisma.user.upsert({
    where: { username: "admin@example.com" },
    update: {},
    create: {
      username: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin account created:", admin);

  // ## 1 ##
  // Create a tenant for a customer
  const customerTenant = await prisma.tenant.upsert({
    where: { domain: "customer-a" },
    update: {},
    create: {
      name: "Customer A",
      domain: "customer-a",
    },
  });

  // Create a customer account
  const customerPassword = await bcrypt.hash("1231231231", 10);
  const customer = await prisma.user.create({
    data: {
      username: "customer-1-a",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      tenant: {
        connect: { id: customerTenant.id },
      },
    },
  });

  console.log("Customer 1 Tenant A account created", customer);

  // ## 2 ##
  // Create a tenant for a customer
  const customerTenant2 = await prisma.tenant.upsert({
    where: { domain: "customer-a" },
    update: {},
    create: {
      name: "Customer A",
      domain: "customer-a",
    },
  });

  // Create a customer account
  const customerPassword2 = await bcrypt.hash("1231231231", 10);
  const customer2 = await prisma.user.create({
    data: {
      username: "customer-2-a",
      passwordHash: customerPassword2,
      role: "CUSTOMER",
      tenant: {
        connect: { id: customerTenant2.id },
      },
    },
  });

  console.log("Customer 2 Tenant A account created:", customer2);

  // ## 3 ##
  // Create a tenant for a customer
  const customerTenant3 = await prisma.tenant.upsert({
    where: { domain: "customer-b" },
    update: {},
    create: {
      name: "Customer B",
      domain: "customer-b",
    },
  });

  // Create a customer account
  const customerPassword3 = await bcrypt.hash("1231231231", 10);
  const customer3 = await prisma.user.create({
    data: {
      username: "customer-1-b",
      passwordHash: customerPassword3,
      role: "CUSTOMER",
      tenant: {
        connect: { id: customerTenant3.id },
      },
    },
  });

  console.log("Customer 3 Tenant B account created:", customer3);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
