import bcrypt from 'bcrypt';
import configs from '../configs';

const { salt, pepper } = configs;

export const hash = async (password: string) =>
  await bcrypt.hash(`${pepper}${password}${pepper}`, salt);

export const compare = async (password: string, hash: string) =>
  await bcrypt.compare(`${pepper}${password}${pepper}`, hash);
