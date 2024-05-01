export class CustomExtractJwt {
  static fromCookie() {
    return function cookieExtractor(req) {
      let token = null;
      if (req && req.signedCookies && req.signedCookies.token) {
        token = req.signedCookies['token'];
      }
      return token;
    };
  }
}
