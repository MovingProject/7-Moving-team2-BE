import { ConflictException } from './conflict.exception';


export class NicknameConflictException extends ConflictException {
  constructor() {
    super('이미 사용 중인 닉네임입니다.', 'NICKNAME_CONFLICT');
  }
}
