import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export class CategoryService {
  /**
   * 取得所有分類 (包含停用，供後台管理使用)
   */
  static async listAllCategories() {
    return prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        questions: {
          include: {
            versions: { orderBy: { version: 'desc' } },
            options: {
              include: { versions: { orderBy: { version: 'desc' } } },
            },
          },
        },
      },
    });
  }

  /**
   * 新增分類
   */
  static async createCategory(data: { key: string; name: string; sortOrder?: number }) {
    const id = `cat_${data.key.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
    const category = await prisma.category.create({
      data: {
        id,
        key: data.key,
        name: data.name,
        sortOrder: data.sortOrder ?? 10,
        enabled: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        id: `audit_${uuidv4().substring(0, 8)}`,
        action: 'CREATE_CATEGORY',
        entityType: 'Category',
        entityId: category.id,
        after: JSON.stringify(category),
      },
    });

    return category;
  }

  /**
   * 更新分類
   */
  static async updateCategory(
    id: string,
    data: { name?: string; sortOrder?: number; enabled?: boolean }
  ) {
    const before = await prisma.category.findUnique({ where: { id } });
    const category = await prisma.category.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        id: `audit_${uuidv4().substring(0, 8)}`,
        action: 'UPDATE_CATEGORY',
        entityType: 'Category',
        entityId: id,
        before: JSON.stringify(before),
        after: JSON.stringify(category),
      },
    });

    return category;
  }
}
