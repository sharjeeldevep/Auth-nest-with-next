import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JwtAuthService } from '../../../common/services/jwt-auth.service';
import { CommonModule } from '../common.module';
import { User, userSchema } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const envFilePath = `${process.cwd()}/.env`;

describe('AuthController', () => {
  let controller: AuthController;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, JwtAuthService],
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async () => {
            const mongod = await MongoMemoryServer.create();
            const uri = await mongod.getUri();
            return {
              uri: uri,
            };
          },
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
        CommonModule,
        UserModule,
        ConfigModule.forRoot({
          envFilePath,
          isGlobal: true,
        }),
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockUserData = {
    name: 'fazeel',
    password: '123456',
    phoneNumber: '0515575321',
    email: 'some-email@example.com',
    referralCode: '',
  };

  describe('Signup Scenarios', () => {
    it('should not signup user if user already exists', async () => {
      await userRepository.create({ ...mockUserData });

      await expect(
        controller.signup({
          password: '123456',
          phoneNumber: '0515575321',
          referralCode: '',
        }),
      ).rejects.toThrow('User with this phone number already exists');
    });

    it('should not signup user', async () => {
      await controller.signup({
        ...mockUserData,
      });

      const users = await userRepository.findAll({});

      expect(users.length).toBe(1);
      expect(users[0].phoneNumber).toBe(mockUserData.phoneNumber);
      expect(users[0].password).toBe(undefined);
    });

    it('should not signup user and gets password field', async () => {
      await controller.signup({
        ...mockUserData,
      });

      const users = await userRepository.findAll({
        fields: 'phoneNumber,password',
      });

      expect(users.length).toBe(1);
      expect(users[0].phoneNumber).toBe(mockUserData.phoneNumber);
      expect(users[0].password).not.toBe(undefined);
    });
  });

  describe('Login Scenarios', () => {
    it("should not let user login if user with provided number doesn't exist", async () => {
      await expect(
        controller.login({
          password: mockUserData.password,
          phoneNumber: mockUserData.phoneNumber,
        }),
      ).rejects.toThrow('Incorrect Password');
    });

    it('should not let user login if phoneNumber is not right', async () => {
      await controller.signup({
        ...mockUserData,
      });

      await expect(
        controller.login({
          password: mockUserData.password,
          phoneNumber: mockUserData.phoneNumber + '123',
        }),
      ).rejects.toThrow('Incorrect Password');
    });

    it('should not let user login if password,phoneNumber combinations is not right', async () => {
      await controller.signup({
        ...mockUserData,
      });

      await expect(
        controller.login({
          password: mockUserData.password + '123',
          phoneNumber: mockUserData.phoneNumber,
        }),
      ).rejects.toThrow('Incorrect Password');
    });

    it('should not let user login', async () => {
      await controller.signup({
        ...mockUserData,
      });

      const data = await controller.login({
        password: mockUserData.password,
        phoneNumber: mockUserData.phoneNumber,
      });

      expect(data.status).toBe('success');
    });
  });
});
