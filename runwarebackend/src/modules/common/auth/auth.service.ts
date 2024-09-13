import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as querystring from 'querystring';
import * as crypto from 'crypto';
@Injectable()
export class AuthService {
  generateOtp = async function () {
    return await crypto.randomInt(100000, 999999);
  };

  comparePassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

  createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
  };

  signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

  createToken = (user) => {
    const token = this.signToken(user._id);

    return token;
  };

  encodeLink = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return payload;
  };

  generateEncodedLink(baseURL: string, data: string): string {
    const queryParams = querystring.stringify({ data });
    return `${baseURL}?${queryParams}`;
  }
}
