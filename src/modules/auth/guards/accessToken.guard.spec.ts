import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenGuard } from './accessToken.gaurd';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@/shared/exceptions/unauthorized.exception';
import { Request } from 'express';

const createMockExecutionContext = (request: Partial<Request>): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
};

describe('AccessTokenGuard', () => {
  let accessTokenGuard: AccessTokenGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    accessTokenGuard = module.get<AccessTokenGuard>(AccessTokenGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(accessTokenGuard).toBeDefined();
  });

  describe('canActivate (Success)', () => {
    it('should return true and attach user to request if token is valid', async () => {
      const mockRequest = {
        cookies: {
          '__Host-access_token': 'valid_token',
        },
      };
      const mockPayload = { sub: 'user-id', role: 'USER' };
      const mockContext = createMockExecutionContext(mockRequest);

      const verifyAsyncSpy = jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      const result = await accessTokenGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockPayload);

      expect(verifyAsyncSpy).toHaveBeenCalledWith('valid_token', {
        secret: process.env.JWT_SECRET,
      });
    });
  });

  describe('canActivate (Failure)', () => {
    it('should throw UnauthorizedException if no token is provided', async () => {
      const mockRequest = { cookies: {} };
      const mockContext = createMockExecutionContext(mockRequest);

      await expect(accessTokenGuard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('인증 토큰이 쿠키에 존재하지 않습니다.'),
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockRequest = {
        cookies: {
          '__Host-access_token': 'invalid_token',
        },
      };
      const mockContext = createMockExecutionContext(mockRequest);
      const mockError = new Error('jwt expired');
      mockError.name = 'TokenExpiredError';

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(mockError);

      await expect(accessTokenGuard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('유효하지 않은 토큰입니다.', {
          errorType: mockError.name,
          errorMessage: mockError.message,
        }),
      );
    });
  });
});
