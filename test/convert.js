
const { convertToSarif } = require('../convert-action');

const DEFAULT_INPUT_FILE = 'results.json';
const DEFAULT_OUTPUT_FILE = 'veracode-results.sarif';

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
    convertToSarif(inputFileName,outputFileName);
} catch (error) {
    console.log(error);
}

