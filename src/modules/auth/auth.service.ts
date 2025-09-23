import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '../users/interface/users.repository.interface'; // 경로 변경 (UserRepository 사용 시)
import { IAuthService } from './interface/auth.service.interface';
import { SignUpInput } from './schema/signup.schema';
import { UserAlreadyExistsException } from '@/shared/exceptions/user.exception';
import { HASHING_SERVICE, type IHashingService } from '@/shared/hashing/hashing.service.interface';
import { UserResponseDto } from '@/modules/users/DTO/user.response.dto'; // DTO import
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly authRepository: IUserRepository,

    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  async signUp(signUpInput: SignUpInput) {
    const { email, password } = signUpInput;

    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    const hashedPassword = await this.hashingService.hash(password);

    const user = await this.authRepository.createUser(signUpInput, hashedPassword);

    return UserResponseDto.fromUser(user);
  }
}
