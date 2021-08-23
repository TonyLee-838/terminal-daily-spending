const inquirer = require("inquirer");
const chalk = require("chalk");

const {
  getDateString,
  autoCompleteDateInput,
  autoCompleteMonthInput,
  autoCompleteDescription,
} = require("./util");

const { startup } = require("./startup");

const { keyDB, dateDB, memoDB } = startup();

async function run() {
  const answers = await askQuestions();

  switch (answers.operation) {
    case "list":
      handleListRecord(answers.listingRange, answers.showDailyReport);
      break;
    case "add":
      handleAddRecord(answers.date, answers.description, answers.value);
      break;
    case "update":
      handleUpdateRecord(answers.updateId, answers.date, {
        id: +answers.updateId,
        msg: answers.description,
        val: answers.value,
      });
      break;
    case "delete":
      handleDeleteRecord(answers.deleteId);

      break;
  }
}

run();

function askQuestions() {
  return inquirer.prompt([
    {
      type: "list",
      name: "operation",
      message: "小帳本👏 選擇操作：",
      choices: ["list", "add", "update", "delete"],
    },
    {
      type: "input",
      name: "listingRange",
      message: "查詢日期？",
      default: "All",
      when(answer) {
        return answer.operation === "list";
      },
      transformer(input) {
        return autoCompleteMonthInput(input, memoDB);
      },
    },
    {
      type: "confirm",
      name: "showDailyReport",
      message: "展示每日收支統計？ (N)",
      default: false,
      when(answer) {
        return answer.operation === "list";
      },
    },
    {
      type: "input",
      name: "date",
      message: "添加日期？",
      default: getDateString(new Date()),
      when(answer) {
        return answer.operation === "add";
      },
      transformer(input) {
        return autoCompleteDateInput(input);
      },
    },
    {
      type: "input",
      name: "description",
      message: "描述",
      when(answer) {
        return answer.operation === "add";
      },
      transformer(input) {
        return autoCompleteDescription(input, memoDB);
      },
    },
    {
      type: "input",
      name: "value",
      message: "金額",
      when(answer) {
        return answer.operation === "add";
      },
      default: 0,
    },
    {
      type: "input",
      name: "updateId",
      message: "更新記錄id",
      when(answer) {
        return answer.operation === "update";
      },
    },
    {
      type: "input",
      name: "date",
      message: "添加日期？",
      default: getDateString(new Date()),
      when(answer) {
        return answer.operation === "update" && keyDB.get(answer.updateId);
      },
      default(answer) {
        return keyDB.get(answer.updateId);
      },
    },
    {
      type: "input",
      name: "description",
      message: "描述",
      when(answer) {
        return answer.operation === "update" && keyDB.get(answer.updateId);
      },
      default(answer) {
        return dateDB
          .get(keyDB.get(answer.updateId))
          .find((record) => record.id == answer.updateId).msg;
      },
    },
    {
      type: "input",
      name: "value",
      message: "金額",
      when(answer) {
        return answer.operation === "update" && keyDB.get(answer.updateId);
      },
      default(answer) {
        return dateDB
          .get(keyDB.get(answer.updateId))
          .find((record) => record.id == answer.updateId).val;
      },
    },
    {
      type: "input",
      name: "deleteId",
      message: "刪除記錄id",
      when(answer) {
        return answer.operation === "delete";
      },
    },
  ]);
}

function handleListRecord(query, showDailyReport) {
  const transformedQuery = autoCompleteMonthInput(query);
  const result = findEligibleRecords(transformedQuery);
  printRecords(result, transformedQuery, showDailyReport);
}

function handleAddRecord(date, msg, val) {
  const realDate = autoCompleteDateInput(date);
  const transformedDescription = autoCompleteDescription(msg, memoDB);

  const count = dateDB.get("count");
  const record = { id: count + 1, msg: transformedDescription, val };

  const recordForDate = dateDB.get(realDate);
  if (!recordForDate) {
    dateDB.set(realDate, [record]);
  } else {
    dateDB.set(realDate, [...recordForDate, record]);
  }

  keyDB.set(`${count + 1}`, realDate);
  dateDB.set("count", count + 1);

  console.log(
    chalk.cyanBright(
      "Record has been inserted!",
      JSON.stringify(record, null, 1)
    )
  );
}

function handleUpdateRecord(id, newDate, record) {
  const date = keyDB.get(id);
  const filtered = dateDB.get(date).filter((record) => record.id != id);

  dateDB.set(date, filtered);

  const recordForDate = dateDB.get(newDate);
  if (!recordForDate) {
    dateDB.set(newDate, [record]);
  } else {
    dateDB.set(newDate, [...recordForDate, record]);
  }
  console.log(
    chalk.cyanBright(
      "Record has been updated!",
      JSON.stringify(record, null, 1)
    )
  );
}

function handleDeleteRecord(id) {
  const date = keyDB.get(id);
  const filtered = dateDB.get(date).filter((record) => record.id != id);

  dateDB.set(date, filtered);
  console.log(chalk.greenBright("deleted!"));
}

function findEligibleRecords(query) {
  if (query === "All") {
    return dateDB.JSON();
  }

  const json = dateDB.JSON();

  const keys = Object.keys(json).filter((key) => !!key.match(query));
  return keys.reduce((result, key) => {
    result[key] = json[key];
    return result;
  }, {});
}

function printRecords(result, query, showDailyReport) {
  if (query !== "All") console.log(chalk.blue(`${query} 收支情況：`));

  let income = 0;
  let incomeCount = 0;
  let spends = 0;
  let spendsCount = 0;

  console.log(chalk.cyanBright("日期\t\tid\t\t金額\t\t\t描述"));

  const sorted = Object.entries(result).sort(
    (a, b) => new Date(a[0]) - new Date(b[0])
  );

  sorted.forEach(([date, records]) => {
    let localIncome = 0;
    let localSpends = 0;
    if (date === "count") return;
    console.log(
      chalk.cyanBright(
        date +
          " ------------------------------------------------------------------"
      )
    );

    records.forEach((record, i) => {
      if (record.val > 0) {
        income += +record.val;
        localIncome += +record.val;
        incomeCount++;
      } else {
        spends += +record.val;
        spendsCount++;
        localSpends += +record.val;
      }

      console.log(
        `-${i + 1}-\t\t${record.id}\t\t${
          record.val >= 0
            ? chalk.greenBright("+" + record.val)
            : chalk.redBright(record.val)
        }${record.val.length < 10 ? "\t\t" : "\t\t\t"}\t${record.msg}`
      );
    });

    if (showDailyReport)
      console.log(
        chalk.cyanBright("收：  ") +
          chalk.greenBright(localIncome.toFixed(2)) +
          chalk.cyanBright(" 支：  ") +
          chalk.redBright(localSpends.toFixed(2))
      );
  });

  console.log(
    chalk.blue(`${sorted[1][0]} - ${sorted[sorted.length - 1][0]}\t統計：`)
  );
  console.log(
    chalk.redBright(`支出:\t   ${spends.toFixed(2)} \t共${spendsCount} 筆`)
  );
  console.log(
    chalk.greenBright(`收入:\t   ${income.toFixed(2)}  \t共${incomeCount} 筆`)
  );

  if (showDailyReport) {
    console.log(
      chalk.yellowBright(
        `日均支出:  ${(spends / Object.keys(result).length).toFixed(2)}`
      )
    );
  }
}

function syncKeys() {
  const json = dateDB.JSON();
  delete json.count;

  let result = {};

  Object.entries(json).forEach(([date, records]) => {
    records.forEach(({ id }) => {
      result[id] = date;
    });
  });

  keyDB.set("", result);
}
