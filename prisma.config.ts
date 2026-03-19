import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { defineConfig } from '@prisma/config';

console.log('Using DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')); // mask password
export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
