import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({
              access_token: 'fake-jwt-token',
            }),
          },
        },
        // ✅ Ajouter AuthGuard
        AuthGuard,
        // ✅ Mock JwtService
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({
              sub: 1,
              username: 'test',
              role: 'PARTENAIRE',
            }),
            signAsync: jest.fn().mockResolvedValue('fake-jwt-token'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('Retourne un statut 200 et stock le jwt dans le httpOnly', async () => {
    const mockResponse = {
      cookie: jest.fn().mockReturnThis(), 
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;

    const result = await controller.login(
      {
        email: 'john@mail.com',
        password: 'password',
      },
      mockResponse
    );

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'access_token',
      'fake-jwt-token',
      expect.objectContaining({
        httpOnly: true,
      })
    );
    expect(result).toEqual({ message: 'Connexion réussie' });
    expect(authService.login).toHaveBeenCalled();
  });

});