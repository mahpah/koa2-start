import jwt from 'jsonwebtoken';
import { TokenKey } from '../../config/key';
import { User } from '../../models/user.js';

const validate = async (username, password) => {
  if (!username || !password) {
    return false;
  }

  let user = await User.findByUsername(username);
  if (!user) {
    return false;
  }

  let isUserValid = await user.isPassword(password);
  return isUserValid ? user : false;
};

export const authenticate = (route) => {
  route.all('/authenticate', async (ctx) => {
    let { username, password } = ctx.request.body;
    let claim;
    let user = await validate(username, password);

    if (user) {
      claim = {
        id: user.id,
        username: user.username,
      };
      ctx.body = {
        access_token: jwt.sign(claim, TokenKey),
        username: user.username,
        id: user.id,
      };
      return;
    }

    ctx.status = 403;
    ctx.body = {
      message: 'Wrong username or password',
    };
    return;
  });

  route.get('/me', async (ctx) => {
    let authorization = ctx.get('authorization');
    if (!authorization.match(/^Bearer\s/)) {
      ctx.status = 401;
      return;
    }

    let token = authorization.slice(7);

    try {
      let payload = jwt.decode(token, TokenKey);
      let { id: userId } = payload;
      let { id, username } = await User.get(userId);
      ctx.body = {
        id,
        username,
      };
      return;
    } catch (e) {
      ctx.status = 401;
      if (e instanceof jwt.JsonWebTokenError) {
        ctx.body = {
          message: 'Invalid token',
        };
        return;
      }

      if (e instanceof jwt.TokenExpiredError) {
        ctx.body = {
          message: 'Token expired',
        };
        return;
      }

      ctx.body = e;
    }
  });
};
