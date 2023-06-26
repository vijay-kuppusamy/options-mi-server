const dString = "01.01.2018";
const days = 30;

let [day, month, year] = dString.split(".");

// month - 1 as month in the Date constructor is zero indexed
const now = new Date(year, month - 1, day);

let loopDay = now;
for (let i = 0; i <= days; i++) {
  loopDay.setDate(loopDay.getDate() + 1);
  console.log("Day: " + loopDay.toISOString().split("T")[0]);
}
