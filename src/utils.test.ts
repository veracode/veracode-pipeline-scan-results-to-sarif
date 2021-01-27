import {setupSourceReplacement, sliceReportLevels} from "./utils";
import test from "ava";


test('can slice levels 4:1:0', t => {
    let actual = sliceReportLevels('4:1:0');
    let expected = new Map()
    expected.set(0, "note")
    expected.set(1, "warning")
    expected.set(2, "warning")
    expected.set(3, "warning")
    expected.set(4, "error")
    expected.set(5, "error")
    for (let key of expected.keys()) {
        t.deepEqual(actual.get(key), expected.get(key))
    }
})

test('can slice levels 3:0:0', t => {
    let actual = sliceReportLevels('3:0:0');
    let expected = new Map()
    expected.set(0, "warning")
    expected.set(1, "warning")
    expected.set(2, "warning")
    expected.set(3, "error")
    expected.set(4, "error")
    expected.set(5, "error")
    for (let key of expected.keys()) {
        t.deepEqual(actual.get(key), expected.get(key))
    }
})

test('can slice levels 4:3:0', t => {
    let actual = sliceReportLevels('4:3:0');
    let expected = new Map()
    expected.set(0, "note")
    expected.set(1, "note")
    expected.set(2, "note")
    expected.set(3, "warning")
    expected.set(4, "error")
    expected.set(5, "error")
    for (let key of expected.keys()) {
        t.deepEqual(actual.get(key), expected.get(key))
    }
})

test('can slice levels 3:1:0', t => {
    let actual = sliceReportLevels('3:1:0');
    let expected = new Map()
    expected.set(0, "note") 
    expected.set(1, "warning")
    expected.set(2, "warning")
    expected.set(3, "error")
    expected.set(4, "error")
    expected.set(5, "error")
    for (let key of expected.keys()) {
        t.deepEqual(actual.get(key), expected.get(key))
    }
})

test('can replace paths', t => {
    const sub1 = "^com\/veracode:src\/main\/java\/com\/veracode";
    const sub2 = "^WEB-INF:src\/main\/webapp\/WEB-INF";
    let actual = setupSourceReplacement(sub1, sub2);
    let expected = [
        {
            regex: new RegExp("^com\/veracode"),
            value: "src\/main\/java\/com\/veracode"
        },
        {
            regex: new RegExp("^WEB-INF"),
            value: "src\/main\/webapp\/WEB-INF"
        }
    ]
    for (let i = 1; i < actual.length; i++) {
        t.deepEqual(actual[i], expected[i])
    }
})