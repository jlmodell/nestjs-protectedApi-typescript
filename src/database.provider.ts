import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(
        'mongodb+srv://bussejlmodell:5T1aBQa7!!!@busse-dev-l5jop.mongodb.net/nestjs?retryWrites=true&w=majority',
      ),
  },
];
