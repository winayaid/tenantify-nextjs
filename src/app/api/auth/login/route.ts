import bcrypt from "bcrypt";
import Cors from "cors";
import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize the CORS middleware
const cors = Cors({
  methods: ["POST", "OPTIONS"], // Allow POST and preflight OPTIONS
  origin: "*", // Allow requests from React app
});

// Helper to run middleware in Next.js
function runMiddleware(
  req: any,
  res: any,
  fn: {
    (
      req: Cors.CorsRequest,
      res: {
        statusCode?: number | undefined;
        setHeader(key: string, value: string): any;
        end(): any;
      },
      next: (err?: any) => any
    ): void;
    (arg0: any, arg1: any, arg2: (result: any) => void): void;
  }
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Define the POST handler
export async function POST(req: NextRequest) {
  try {
    const { username, password, domain } = await req.json();

    // Subdomain parsing (e.g., customer-a.example.com)
    const subdomain = domain.split(".")[0];

    const tenant = await prisma.tenant.findUnique({
      where: { domain: subdomain },
      include: { users: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 }
      );
    }

    const user = tenant.users.find((user) => user.username === username);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Login successful", role: user.role },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json(null, { status: 204 });
}
