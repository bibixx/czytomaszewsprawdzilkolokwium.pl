const { basicAuth } = require('./utils/basicAuth');
const getNonExerciseMarks = require('./utils/crawler');
const clientFactory = require("./utils/redis");

module.exports = basicAuth(async (req, res) => {
  const client = clientFactory();
  const marks = await getNonExerciseMarks();

  const currentMarksNo = marks.length;

  await client.setAsync("currentMarksNo", currentMarksNo);
  await client.setAsync("isChecked", false);

  res.end(JSON.stringify(marks));
  client.end(true);
});
