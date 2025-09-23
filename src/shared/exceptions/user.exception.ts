import { ConflictException } from './conflict.exception';

export class UserAlreadyExistsException extends ConflictException {
  constructor() {
    super('이미 사용 중인 이메일입니다.');
  }
}
