const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '/data/qtyfreeze.xls');

function readQtyFreeze() {
  try {
    //console.log(file);
    const qtyfreeze = xlsx.readFile(file);
    let data = [];
    const sheets = qtyfreeze.SheetNames;
    const temp = xlsx.utils.sheet_to_json(qtyfreeze.Sheets[sheets[0]]);
    temp.forEach((res) => {
      data.push(res);
    });
    // Printing data
    var stringData = JSON.stringify(data).replace(/\s/g, '');
    data = JSON.parse(stringData);
    //console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { readQtyFreeze };
