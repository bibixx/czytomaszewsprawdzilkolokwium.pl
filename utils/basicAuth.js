const return401 = (res) => () => {
  const data = `<h1 style="text-align: center;">401 Unauthorized</h1>`;
  
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic',
    'Content-Type': 'text/html',
    'Content-Length': data.length
  });

  res.write(data);
  res.end();

  return false;
}

module.exports = {
  basicAuth: (cb) => async (req, res, ...rest) => {
    const ret = return401(res);

    if (!req.headers.authorization) {
      return ret();
    }

    const data = req.headers.authorization.split(' ')[1];
    const buff = new Buffer.from(data, 'base64');  
    const [login, password] = buff.toString('utf-8').split(':');

    if (!login || !password) {
      return ret();
    }

    const { RESET_LOGIN, RESET_PASSWORD } = process.env;

    if (RESET_LOGIN !== login || RESET_PASSWORD !== password) {
      return ret();
    }

    return cb(req, res, ...rest);
  }
}
