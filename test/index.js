import 'babel-polyfill';
import { expect } from 'chai';

const promiser = () =>
  new Promise(resolve => {
    setTimeout(resolve.bind(null, 200), 500);
  });

describe('test promise', () => {
  it('should wait for promise to resolve', async () => {
    let ret = await promiser();
    expect(ret).to.equal(200);
  });
});
