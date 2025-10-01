import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from './interface/users.repository.interface';
import type { IUserRepository } from './interface/users.repository.interface';
import { NotFoundException, UnauthorizedException,  } from '@/shared/exceptions';
import { BaseUpdateUserDto } from './dto/user.update.Dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}
  //NestJS에서 의존성 주입(Dependency Injection, DI)**을 위해 쓰는 문법
  //constructor(...) : 클래스가 생성될 때 필요한 의존 객체를 받는 자리
  //@Inject(USER_REPOSITORY) : NestJS의 커스텀 토큰을 통해 의존성을 주입하겠다는 표시
  //private readonly userRepository: IUserRepository : 생성자에서 받은 인자를 클래스 멤버로 선언
  //결과 → UsersService 안에서 this.userRepository.findById(...) 같은 호출 가능

  async getUserWithProfile(userId: string) {
    const user = await this.userRepository.getProfileById(userId);

    if (!user) throw new NotFoundException('유저를 찾을수 없습니다.');

    return user;
  }

  async updateUserProfile(userId: string, dto: BaseUpdateUserDto) {
    const user = await this.userRepository.getProfileById(userId);

    if (!user) throw new NotFoundException('유저를 찾을수 없습니다.');
    if (!dto.password) {
      throw new UnauthorizedException('현재 비밀번호를 입력해야 수정할 수 있습니다.'); 
    }
  }
}
