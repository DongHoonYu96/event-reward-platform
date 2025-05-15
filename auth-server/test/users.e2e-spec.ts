// auth-server/test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { UsersModule } from '../src/modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let mongoServer: MongoMemoryServer;
    let jwtToken: string;

    beforeAll(async () => {
        // 인메모리 MongoDB 서버 시작
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    // 테스트용 환경 변수 오버라이드
                    load: [() => ({
                        JWT_SECRET: 'test-secret',
                        JWT_EXPIRATION: '1h',
                    })],
                }),
                MongooseModule.forRoot(mongoUri),
                JwtModule.registerAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => ({
                        secret: configService.get<string>('JWT_SECRET'),
                        signOptions: {
                            expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
                        },
                    }),
                }),
                UsersModule,
                AppModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }));

        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe('/users/register (POST)', () => {
        it('should register a new user', () => {
            return request(app.getHttpServer())
                .post('/users/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'USER',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.username).toBe('testuser');
                    expect(res.body.email).toBe('test@example.com');
                    expect(res.body.role).toBe('USER');
                    expect(res.body).not.toHaveProperty('password');
                });
        });

        it('should return 400 for invalid input', () => {
            return request(app.getHttpServer())
                .post('/users/register')
                .send({
                    username: 'user2',
                    // email 누락
                    password: 'short', // 짧은 비밀번호
                    role: 'INVALID_ROLE', // 유효하지 않은 역할
                })
                .expect(400);
        });

        it('should return 409 for duplicate username', () => {
            return request(app.getHttpServer())
                .post('/users/register')
                .send({
                    username: 'testuser', // 이미 존재하는 사용자
                    email: 'another@example.com',
                    password: 'password123',
                    role: 'USER',
                })
                .expect(409);
        });
    });

    describe('/users/login (POST)', () => {
        it('should login and return JWT token', () => {
            return request(app.getHttpServer())
                .post('/users/login')
                .send({
                    username: 'testuser',
                    password: 'password123',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('accessToken');
                    expect(typeof res.body.accessToken).toBe('string');
                    // 토큰 저장 (다른 테스트에서 사용)
                    jwtToken = res.body.accessToken;
                });
        });

        it('should return 401 for invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/users/login')
                .send({
                    username: 'testuser',
                    password: 'wrongpassword',
                })
                .expect(401);
        });
    });

    describe('/users/profile (GET)', () => {
        it('should return user profile for authenticated user', () => {
            return request(app.getHttpServer())
                .get('/users/profile')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('_id');
                    expect(res.body.username).toBe('testuser');
                    expect(res.body.email).toBe('test@example.com');
                    expect(res.body.role).toBe('USER');
                });
        });

        it('should return 401 without authentication', () => {
            return request(app.getHttpServer())
                .get('/users/profile')
                .expect(401);
        });
    });

    describe('/users/admin-only (GET)', () => {
        it('should return 403 for non-admin users', () => {
            return request(app.getHttpServer())
                .get('/users/admin-only')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(403);
        });

        // ADMIN 권한을 가진 사용자 테스트는 별도로 구현
        // (사전에 ADMIN 역할로 사용자 생성 및 로그인 필요)
    });
});