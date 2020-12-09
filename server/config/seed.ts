import User from '../src/entity/User';

const seed = async (): Promise<void> => {
  await User.create({
    username: 'root',
    email: '1@1.com',
    password: '123456',
  }).save();

  await User.create({
    username: 'andrew',
    email: '1@2.com',
    password: '123456',
  }).save();
};

export default seed;
