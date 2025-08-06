import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// JSON verisindeki string değerleri Prisma Enum'a dönüştürmek için yardımcı fonksiyon.
const toEnumCase = (value: string): string => {
  return value.toUpperCase().replace(' ', '_');
};

async function loadJsonData(filename: string) {
  const filePath = path.join(__dirname, 'seed-data', filename);
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return fileContent
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}

async function seed() {
  console.log('🌱 Starting Prisma seed...');

  try {
    // Önce ilişkili olan Task verilerini, sonra ana Column verilerini siler.
    await prisma.task.deleteMany();
    await prisma.column.deleteMany();
    console.log('📦 Cleared existing data');

    // JSON dosyalarından veriyi yükler
    // Not: JSON'daki veri yapıları Prisma'daki Column ve Task model'larına uymaktadır.
    const columnsData = await loadJsonData('columns.json');
    const tasksData = await loadJsonData('tasks.json');

    // columns.json dosyasından okunan veriyi database'e ekler.
    // JSON'daki field isimleri (@map ile eşleşenler) Prisma tarafından otomatik olarak dönüştürülür.
    for (const column of columnsData) {
      await prisma.column.create({
        data: {
          id: column.id,
          title: column.title,
          description: column.description,
          order: column.order,
          deletedAt: column.deleted_at ? new Date(column.deleted_at) : null,
          createdAt: new Date(column.created_at),
          updatedAt: new Date(column.updated_at),
        },
      });
    }
    console.log(`✅ Inserted ${columnsData.length} columns`);

    // tasks.json dosyasından okunan veriyi database'e ekler.
    for (const task of tasksData) {
      await prisma.task.create({
        data: {
          id: task.id,
          title: task.title,
          description: task.description,
          order: task.order,
          // JSON verisindeki küçük harfli string'leri Enum'a dönüştürür.
          priority: toEnumCase(task.priority) as 'LOW' | 'MEDIUM' | 'HIGH',
          status: toEnumCase(task.status) as 'TODO' | 'IN_PROGRESS' | 'DONE',
          assigneeId: task.assignee_id,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          deletedAt: task.deleted_at ? new Date(task.deleted_at) : null,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
          // 'columnId' field'ı için 'column' ilişkisini kurar.
          column: {
            connect: { id: task.column_id },
          },
        },
      });
    }
    console.log(`✅ Inserted ${tasksData.length} tasks`);

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
