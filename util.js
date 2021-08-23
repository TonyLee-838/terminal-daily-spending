function autoCompleteDateInput(input) {
  if (input.match(/^[0-9]{1,2}$/) && +input <= 31) {
    const today = new Date();
    return `${today.getFullYear()}-${
      today.getMonth() + 1 < 9 ? "0" : ""
    }${today.getMonth() + 1}-${input <= 9 ? "0" : ""}${input}`;
  }

  if (input.match(/^[0-9]{1,2}\-[0-9]{1,2}$/)) {
    const today = new Date();
    const [month, date] = input.split("-");
    return `${today.getFullYear()}-${
      month.length < 2 ? "0" : ""
    }${month}-${date}`;
  }

  return input;
}

function autoCompleteMonthInput(input) {
  if (input.match(/^[0-9]{1,2}$/) && +input <= 31) {
    const today = new Date();
    return `${today.getFullYear()}-${input.length < 2 ? "0" : ""}${input}`;
  }

  return input;
}
function autoCompleteDescription(input, memoDB) {
  if (input.match(/^![a-z0-9]+$/i)) {
    const query = memoDB.get(input.slice(1));
    if (query) return query;
  }

  if (input.match(/^![a-z0-9]+ \S+$/i)) {
    const [, query, additionalMsg] = input.split(/!| /);

    const found = memoDB.get(query);
    return found ? found + " " + additionalMsg : additionalMsg;
  }

  return input;
}

function getDateString(date) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 9 ? "0" : ""
  }${date.getMonth() + 1}-${date.getDate() <= 9 ? "0" : ""}${date.getDate()}`;
}

module.exports = {
  autoCompleteDateInput,
  autoCompleteMonthInput,
  autoCompleteDescription,
  getDateString,
};
