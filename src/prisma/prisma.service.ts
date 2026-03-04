import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

  async onModuleInit() {
    await this.$connect();
  }

  withTenant(clinicId: string, role: string) {
    if (role === 'SUPER_ADMIN') {
      return this;
    }

    return this.$extends({
      query: {
        $allModels: {
          async findMany({ args, query }) {
            args.where = {
              ...args.where,
              clinicId,
            };
            return query(args);
          },

          async findFirst({ args, query }) {
            args.where = {
              ...args.where,
              clinicId,
            };
            return query(args);
          },

          async update({ args, query }) {
            args.where = {
              ...args.where,
              clinicId,
            };
            return query(args);
          },

          async delete({ args, query }) {
            args.where = {
              ...args.where,
              clinicId,
            };
            return query(args);
          }
        },
      },
    });
  }
}