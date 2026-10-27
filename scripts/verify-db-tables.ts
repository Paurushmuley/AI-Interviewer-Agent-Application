import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseTables() {
  console.log('--- Connecting to PostgreSQL / Supabase Database ---');
  try {
    const tables: Array<{ table_name: string }> = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name ASC;
    `;

    console.log('Tables found in database:');
    tables.forEach((t, i) => console.log(`  ${i + 1}. ${t.table_name}`));

    if (tables.length === 0) {
      console.log('No tables found! Running schema push...');
    } else {
      console.log(`\n✔ Database verification complete: ${tables.length} tables are present and active.`);
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseTables();
