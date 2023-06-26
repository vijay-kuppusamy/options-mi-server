const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 File Format
 Row:
 First Row Indics Heading
 2 to 5  - Index
 Sixth Row  Individual Securities Heading
 7 to Rest of the rows - Individual Security
 Column:
 1 - Underlying
 2 - Symbol
 3 - LotSize
 */

const file = path.join(__dirname, '/data/fo_mktlots.csv');

function getSecurity(row, count) {
  let security = {
    underlying: '',
    symbol: '',
    lotSize: '',
    underlyingType: '',
    qtyFrezze: '',
    stepValue: ''
  };

  let type = 'company';
  if (count < 5) type = 'index';
  if (row) {
    security.underlying = row[0].trim();
    security.symbol = row[1].trim();
    security.lotSize = row[2].trim();
    security.underlyingType = type;
  }
  return security;
}

function readFoMktLots() {
  let mktLotsList = [];
  try {
    const records = parse(fs.readFileSync(file), {
      skip_empty_lines: true
    });
    //console.log(records.length);
    for (let index = 0; index < records.length; index++) {
      const row = records[index];
      if (!(index === 0) && !(index === 5)) {
        let security = getSecurity(row, index);
        mktLotsList.push(security);
      }
    }
  } catch (error) {
    console.log(error);
  }
  //console.log(mktLotsList.length);
  return { data: mktLotsList };
}

module.exports = { readFoMktLots };
