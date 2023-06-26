const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '/data/sos_scheme.xls');

function readSosScheme() {
  try {
    //console.log(file);
    const sos_scheme = xlsx.readFile(file);
    let data = [];
    const sheets = sos_scheme.SheetNames;
    const temp = xlsx.utils.sheet_to_json(sos_scheme.Sheets[sheets[0]]);
    temp.forEach((res) => {
      data.push(res);
    });
    // Printing data
    var stringData = JSON.stringify(data).replace(/\s/g, '');
    data = JSON.parse(stringData);
    return data;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { readSosScheme };
