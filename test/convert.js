
const { convertToSarif } = require('../convert-action');

const DEFAULT_INPUT_FILE = 'results.json';
const DEFAULT_OUTPUT_FILE = 'veracode-results.sarif';

let outputFileName = DEFAULT_OUTPUT_FILE;
let inputFileName = DEFAULT_INPUT_FILE;

if (process.argv.length>=3){
    inputFileName = process.argv[2];;
}   
if (process.argv.length>=4) {
    outputFileName = process.argv[3];
} 

try {
    convertToSarif(inputFileName,outputFileName);
} catch (error) {
    console.log(error);
}

