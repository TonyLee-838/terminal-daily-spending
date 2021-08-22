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
    return `${today.getFullYear()}-${month}-${date}`;
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

function getDateString(date) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 9 ? "0" : ""
  }${date.getMonth() + 1}-${date.getDate() <= 9 ? "0" : ""}${date.getDate()}`;
}

module.exports = {
  autoCompleteDateInput,
  autoCompleteMonthInput,
  getDateString,
};
