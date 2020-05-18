// We won´t use fs promises because in windows 10 and Ubuntu writefile breaks promises in node 12
// we will use the standard callback version and promisify it
// const fs = require('fs').promises;
const fs = require("fs");

const {promisify} = require("util");
const access = promisify(fs.access);

const REG_URL = /(\b(http|ftp|https|ftps):\/\/[-A-ZáéíóúÁÉÍÓÚ0-9+&@#\/%?=~_|!:,.;]*[-A-ZáéíóúÁÉÍÓÚ0-9+&@#\/%=~_|])/ig;

const TestUtils = {};


TestUtils.checkFileExists = async (filepath) => {
    try {
        await access(filepath, fs.F_OK);
        return true;
    } catch (err) {
        return false;
    }
};

TestUtils.to = (promise) => promise.
    then((data) => [
        null,
        data
    ]).
    catch((err) => [err]);

TestUtils.getURL = (string) => {
    const urls = string.match(REG_URL);
    let url = null;

    if (urls instanceof Array) {
        [url] = urls;
    }
    return url;
};

// eslint-disable-next-line no-undefined
TestUtils.exists = (thing) => thing !== undefined && thing !== null;

TestUtils.isString = (thing) => typeof thing === "string" || thing instanceof String;

TestUtils.isObject = (thing) => typeof thing === "object" || thing instanceof Object;

TestUtils.isNumber = (thing) => {
    let number = false;

    if (TestUtils.exists(thing)) {
        number = typeof parseInt(thing, 10) === "number";
    }
    return number;
};

TestUtils.isArray = (thing) => thing instanceof Array;

TestUtils.isURL = (thing) => {
    if (TestUtils.isString(thing)) {
        return REG_URL.test(thing);
    }
};

TestUtils.isRegExp = (thing) => thing instanceof RegExp;

TestUtils.isJSON = (thing) => {
    try {
        JSON.parse(thing);
        return true;
    } catch (e) {
        return false;
    }
};

TestUtils.search = (b, a) => {
    if (TestUtils.isRegExp(b)) {
        if (TestUtils.isString(a) && a.length > 0) {
            return b.test(a);
        }
        return false;
    }
    if (TestUtils.isArray(a)) {
        let result = false;

        for (const item in a) {
            if (TestUtils.search(b, a[item])) {
                result = true;
            }
        }
        return result;
    }
    if (TestUtils.isString(a.toString())) {
        return a.toString().toLowerCase().
            indexOf(b.toLowerCase()) > -1;
    }
};

module.exports = TestUtils;
