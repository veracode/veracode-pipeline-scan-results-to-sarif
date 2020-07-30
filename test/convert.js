
const { convertToSarif,setupSourceReplacement } = require('../convert-action');

const DEFAULT_INPUT_FILE = 'results.json';
const DEFAULT_OUTPUT_FILE = 'veracode-results.sarif';
const sub1 = "^com\/veracode:src\/main\/java\/com\/veracode";
const sub2 = "^WEB-INF:src\/main\/webapp\/WEB-INF";

let outputFileName = DEFAULT_OUTPUT_FILE;
let inputFileName = DEFAULT_INPUT_FILE;

let args = process.argv;

if (args.length>=3){
    inputFileName = args[2];
}   
if (args.length>=4) {
    outputFileName = args[3];
} 

try {
    setupSourceReplacement(sub1,sub2);
    convertToSarif(inputFileName,outputFileName);
} catch (error) {
    console.log(error);
}

