import 'babel-polyfill';
import { expect } from 'chai';
import { User, TableName } from '../../app/models/user';
import r from '../../app/lib/rethink';

describe('User model', () => {
  after(async () => {
    try {
      await r.table(TableName)
        .delete()
        .run();
    } catch (e) {
      // eslint-disable-next-line
      console.log('Error when clear', e);
    }
  });

  beforeEach(async () => {
    await r.table(TableName)
      .delete()
      .run();
  });

  it('should create user', async () => {
    let user = new User();
    expect(typeof user).to.equal('object');
  });

  it('should store user data', async () => {
    let user = new User({ name: 'john' });
    expect(user.name).to.equal('john');
  });

  it('should create user id', async () => {
    let username = 'john';
    let password = 'secret';
    let user = new User({
      username,
      password,
    });
    await user.save();
    expect(user.id).to.exist;
  });

  it('should find user by username', async () => {
    let username = 'john';
    let password = 'secret';
    let user = new User({ username, password });
    await user.save();

    let userFound = await User.findByUsername(username);
    expect(userFound.username).to.equal(username);

    let doe = await User.findByUsername('doe');
    expect(doe).not.to.exist;
  });

  it('shoud update userdata', async () => {
    let johnName = 'john';
    let kristinName = 'kristin';
    let password = 'secret';
    let john;
    let kristin;
    let user = new User({ username: johnName, password });
    await user.save();

    john = await User.findByUsername(johnName);
    expect(john).to.exist;

    user.username = kristinName;
    await user.save();

    john = await User.findByUsername(johnName);
    kristin = await User.findByUsername(kristinName);
    expect(john).not.to.exist;
    expect(kristin).to.exist;
  });

  it('should create user password hash when save', async () => {
    let username = 'john';
    let password = 'secret';
    let user = new User({ username, password });
    await user.save();
    expect(user.password).not.to.equal(password);
  });

  it('should validate correct password', async () => {
    let username = 'john';
    let password = 'secret';
    let user = new User({ username, password });
    await user.save();

    expect(await user.isPassword(password)).to.be.true;
  });

  it('should not validate incorrect password', async () => {
    let username = 'john';
    let password = 'secret';
    let user = new User({ username, password });
    await user.save();

    expect(await user.isPassword('password000')).to.be.false;
  });

  it('shoud get user by id', async () => {
    let username = 'john';
    let password = 'secret';
    let user = new User({ username, password });
    await user.save();

    let john = await User.get(user.id);
    expect(john instanceof User).to.be.true;
    expect(john.username).to.eql(user.username);
  });

  it('shoud remove user', async () => {
    let username = 'john';
    let password = 'secret';
    let user = new User({ username, password });
    await user.save();

    let result = await User.remove(user.id);
    expect(result).to.be.true;
    expect(await User.get(user.id)).not.to.exist;
  });
});
