const clientFactory = require("./utils/redis");

module.exports = async (req, res) => {
  const client = clientFactory();

  const isChecked = await client.getAsync("isChecked") === 'true';
  const yesOrNo = isChecked ? 'tak' : 'nie';

  const data = `<p style="font-size: 30rem; margin: 0 3rem; font-family: 'Times';">${yesOrNo}</p>`;

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': data.length
  });

  res.write(data);
  res.end();
  client.end(true);
}
