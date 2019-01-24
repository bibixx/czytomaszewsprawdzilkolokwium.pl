const { basicAuth } = require('./utils/basicAuth');
const clientFactory = require("./utils/redis");
const getNonExerciseMarks = require('./utils/crawler');

module.exports = basicAuth(async (req, res) => {
  const client = clientFactory();

  const currentMarksNo = Number(await client.getAsync("currentMarksNo"));

  const marks = await getNonExerciseMarks();
  const areMarksDifferent = marks.length === currentMarksNo;

  if (marks.length !== currentMarksNo) {
    await client.setAsync("isChecked", true);
  }

  res.end(String(areMarksDifferent));
  client.end(true);
});
