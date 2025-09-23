export interface IHashingService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export const HASHING_SERVICE = 'IHashingService';
