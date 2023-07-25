const { errorCodeModel } = require('../utils/errorCode');
const CONFIG = require('../config/config');
const https = require('https');
const jwt = require('jsonwebtoken');
const jwtconfig = require('../config/JWTconfig');
const axios = require("axios");
const qs = require('qs');
const CryptoJS = require("crypto-js");


module.exports = class Common {

    /**
     * Handle showing log data
     */
    static logData(message, req) {
        if (CONFIG.isShowLog === 1) {
            let datetime = this.getDateString(2);
            if (req != null && JSON.stringify(req.body) != '{}') {
                console.log('| ' + datetime + ' | body : ' + JSON.stringify(req.body), );
            }
            if (req != null && JSON.stringify(req.params) != '{}') {
                console.log('| ' + datetime + ' | param: ' + JSON.stringify(req.params), );
            }
            if (req != null && JSON.stringify(req.query) != '{}') {
                console.log('| ' + datetime + ' | query: ' + JSON.stringify(req.query), );
            }
            if (message != null && message != '') {
                console.log('| ' + datetime + ' | ' + message, );
            }
        }
    }
    static errorCheck(err, message) {
        if (CONFIG.isShowLog == 1) {
            if (err != null) {
                let datetime = this.getDateString(2);
                console.log('| ' + datetime + ' | 🔴 : ' + message );
                console.log('| ' + datetime + ' | 🔴 : ' + err );
            }
        }
    }

    /**
     * Handle return result error with set header
     * 
     * @param {*} res 
     * @param {*} statusCode 
     * @param {*} message 
     */
    static errorResultSetHeaderStatus(res, statusCode, message) {
        if (res != undefined)
            return res.status(statusCode).send(message);
    }

    /**
     * Cook json data for error result wuth status code is success
     *
     * @param {*} res
     * @param {*} message
     */
    static errorResult(res, data = {}, errorCode = 'ERR', statusCode = 500, locale = 'kr') {
        let result = {};
        this.logData(errorCode);
        result.code = errorCodeModel.hasOwnProperty(errorCode) ? errorCodeModel[errorCode].code : 10000;

        if (data.hasOwnProperty('error_message')) {
            result.message = data.error_message;

        }else{
            result.message = errorCodeModel.hasOwnProperty(errorCode) ? errorCodeModel[errorCode].message[locale] : 'ERROR';
        }
        result.data = data;
        return res.status(statusCode).json(result);
    }

    /**
     * handle success send message
     */
    static successResult(res, data, message, code) {
        if (data == undefined || data == null) {
            data = {};
        }
        if (message == undefined || message == null) {
            message = '요청 성공';
        }
        if (code == undefined || code == null) {
            code = 20000;
        }

        let result = {
            code: code,
            message: message,
            data: data,
        };
        return res.json(result);
    }



    /**
     * Upper case first character of string
     * 
     * @param {*} string 
     * @returns 
     */
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Handle random number between min and max
     * 
     * @param {*} min 
     * @param {*} max 
     */
    static getMathFloorRandom(min, max) {
        return min + Math.floor(Math.random() * (max - min));
    }

    /**
     * handle calculate quality
     * 
     * @param {*} attack 
     * @param {*} health 
     * @param {*} critChance 
     * @param {*} critRate 
     * @param {*} evasionChance 
     * @param {*} regeneration 
     */
    static handleCalculateQuality(attack, health, critChance, critRate, evasionChance, regeneration) {
        let quality = 1000 + 5 * (attack - 100)
            + 0.5 * (health - 400)
            + 0.25 * (critChance - 100)
            + 0.25 * (critRate - 100)
            + 0.625 * (evasionChance - 100)
            + 5 * (regeneration - 20);
        return parseInt(quality.toFixed(0));
    }


    /**
     * handle client send message
     * 
     * @param {*} client 
     * @param {*} onMessage 
     * @param {*} cmd 
     */
    static handleClientSendMessage(client, onMessage, cmd) {
        client.send(onMessage, cmd);
    }

    /**
     * Handle check array object is duplicate item
     * 
     * @param {*} arrayObj 
     * @param {*} keyObj
     */
    static checkArrayObjectIsDuplicateItem(arrayObj, keyObj) {
        let valueObjItem = arrayObj.map(function (item) { return item[keyObj] });
        let isDuplicate = valueObjItem.some(function (item, idx) {
            return valueObjItem.indexOf(item) != idx
        });
        return isDuplicate;
    }

    /**
     * Handle get random item in array object
     * 
     * @param {*} inputArr
     * @param {*} numberItem 
     */
    static getRandomItemInArrayObject(inputArr, numberItem) {
        let result = new Array(numberItem),
            len = inputArr.length,
            taken = new Array(len);
        if (numberItem > len)
            throw new RangeError("Can't get random: more elements taken than available");
        while (numberItem--) {
            let randomItem = Math.floor(Math.random() * len);
            result[numberItem] = inputArr[randomItem in taken ? taken[randomItem] : randomItem];
            taken[randomItem] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    /**
     * Handle get random id with length
     * 
     * @param {*} length
     */
    static makeId(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * Handle get random number with length
     *
     * @param {*} length
     */
    static makeNumber(length) {
        let result = '';
        let characters = '0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * Handle get random id with length
     * 
     * @param {*} length
     */
    static makeAddress(length) {
        let result = '';
        let characters = 'abcdef0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * handle call POST API
     * 
     */

    static async get(url, sessionToken, data) {
        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + sessionToken
            },
            timeout: 60000, // in ms
        }

        for (let key of Object.keys(data)) {
            url = url.replace(":" + key, data[key]);
        }

        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                if (res.statusCode < 200 || res.statusCode > 299) {
                    return reject(new Error(`HTTP status code ${res.statusCode}`))
                }

                const body = []
                res.on('data', (chunk) => body.push(chunk))
                res.on('end', () => {
                    const resString = Buffer.concat(body).toString()
                    resolve(resString)
                })
            })

            req.on('error', (err) => {
                reject(err)
            })

            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Request time out'))
            })
            req.end()
        })
    }

    /**
     * handle call POST API
     * 
     */

    static async post(url, sessionToken, data) {
        const dataString = JSON.stringify(data)

        const options = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + sessionToken,
                'Content-Type': 'multipart/form-data',
                'Content-Length': dataString.length,
            },
            timeout: 60000, // in ms
        }

        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                if (res.statusCode < 200 || res.statusCode > 299) {
                    return reject(new Error(`HTTP status code ${res.statusCode}`))
                }

                const body = []
                res.on('data', (chunk) => body.push(chunk))
                res.on('end', () => {
                    const resString = Buffer.concat(body).toString()
                    resolve(resString)
                })
            })

            req.on('error', (err) => {
                reject(err)
            })

            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Request time out'))
            })

            req.write(dataString)
            req.end()
        })
    }

    /**
     * handle get monday
     * 
     */

    static #getMonday(d) {
        d = new Date(d);
        let day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }


    /**
     * handle extract token
     *
     */

    static async extractToken(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }


    /**
     * handle valid access token
     *
     */
    static async isAccessTokenFit(request) {
        let result = { isValid: true, id: '' };
        // if (CONFIG.app == 'dev')
        //     return result;
        let bearerToken = await Common.extractToken(request);
        let decoded = jwt.verify(bearerToken, jwtconfig.secret);
        result.id = decoded.payload.id;
        result.iat = decoded.iat;
        return result;
    }

    /**
     * getDateString
     * 1) YYYY-MM-DD
     * 2) YYYY-MM-DD h:i:s
     * 3) h:i:s
     * 4) YYYYMMDD_hhiiss
     * 5) YYYY-MM
     * 6) YYYY-MM-DD h:00:00
     */
    static getDateString(type = 1, date = new Date()){
        const yyyy = date.getFullYear();
        const mm = date.getMonth() + 1;
        const dd = date.getDate();
        const h = date.getHours();
        const i = date.getMinutes();
        const s = date.getSeconds();

        if (type == 1)
            return `${yyyy}-${mm < 10 ? '0'+mm : mm}-${dd < 10 ? '0'+dd : dd}`;
        if (type == 2)
            return `${yyyy}-${mm < 10 ? '0'+mm : mm}-${dd < 10 ? '0'+dd : dd} ${h < 10 ? '0'+h:h}:${i< 10 ? '0'+i:i}:${s< 10 ? '0'+s:s}`;
        if (type == 3)
            return `${h < 10 ? '0'+h:h}:${i< 10 ? '0'+i:i}:${s< 10 ? '0'+s:s}`;
        if (type == 4)
            return `${yyyy}${mm < 10 ? '0'+mm : mm}${dd < 10 ? '0'+dd : dd}_${h < 10 ? '0'+h:h}${i< 10 ? '0'+i:i}${s< 10 ? '0'+s:s}`;
        if (type == 5)
            return `${yyyy}-${mm < 10 ? '0'+mm : mm}`;
        if (type == 6)
            return `${yyyy}-${mm < 10 ? '0'+mm : mm}-${dd < 10 ? '0'+dd : dd} ${h < 10 ? '0'+h:h}:00:00`;
    }

    static convertDateFormat(input) {
        const year = input.substring(0,4);
        const month = input.substring(4,6);
        const day = input.substring(6,8);
        const hour = input.substring(8,10);
        const minute = input.substring(10,12);
        const second = input.substring(12,14);
        const output = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
        return output;
    }

    static getNowAndDateDiffToDays(diffDay) {
        const now = new Date(); // 현재 시간
        const diffDate = new Date(diffDay); // 비교하려는 날짜와 시간
        const diffInTime = now > diffDate ? now.getTime() - diffDate.getTime() : diffDate.getTime() - now.getTime();
        const diffInDays = diffInTime / (1000 * 60 * 60 * 24); // 밀리초를 일로 변환
        return Math.ceil(diffInDays);
    }
    static getADayAndBDayDiffToDays(ADay, BDay) {
        const now = new Date(ADay); // 현재 시간
        const diffDate = new Date(BDay); // 비교하려는 날짜와 시간
        const diffInTime = now > diffDate ? now.getTime() - diffDate.getTime() : diffDate.getTime() - now.getTime();
        const diffInDays = diffInTime / (1000 * 60 * 60 * 24); // 밀리초를 일로 변환
        return Math.ceil(diffInDays);
    }

    /**
     * 연속일수 구하기
     */
    static getMaxConsecutiveDays(dates){
        // 날짜를 오름차순으로 정렬
        dates.sort((a, b) => a - b);
        let maxConsecutiveDays = 0;
        let currentConsecutiveDays = 1;
        for (let i = 1; i < dates.length; i++) {
            let diff = Common.getADayAndBDayDiffToDays(dates[i], dates[i - 1]);
            if (diff === 1) {
                currentConsecutiveDays++;
                if (currentConsecutiveDays > maxConsecutiveDays) {
                    maxConsecutiveDays = currentConsecutiveDays;
                }
            } else if (diff > 1) {
                currentConsecutiveDays = 1;
            }
        }
        return maxConsecutiveDays;
    }

    /**
     * 한글, 영문 대소문자, 숫자만 허용 체크
     */

    static isKrEnNumInputCheck(input) {
        const regex = /^[A-Za-z0-9가-힣]+$/;
        return regex.test(input);
    }

    /**
     * 영문 대소문자, 숫자만 허용 체크
     */

    static isEnNumInputCheck(input) {
        const regex = /^[A-Za-z0-9]+$/;
        return regex.test(input);
    }

    /**
     * 단어 뒤에 이어지는 알파벳이 있는지 체크
     */

    static isWordCheck(input, word) {
        if ( input[input.indexOf(word) + word.length] === ' '
            || input[input.indexOf(word) + word.length] === ','
            || input[input.indexOf(word) + word.length] === '.'
            || input[input.indexOf(word) + word.length] === '~'
            || input[input.indexOf(word) + word.length] === '!'
            || input[input.indexOf(word) + word.length] === '-'
            || input[input.indexOf(word) + word.length] === '"'
            || input[input.indexOf(word) + word.length] === '<'
            || input[input.indexOf(word) + word.length] === '>'
        ) {
            return true;
        }
        return false;
    }

    static isDatetimeCheck(dateTime){
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        return regex.test(dateTime);
    }

    /**
     * 배열 단위수로 끊기
     */
    static chunkArray(array, chunkSize, startIndex) {
        const chunkedArray = [];
        const length = array.length - startIndex;
        let index = startIndex;

        while (index < length) {
            chunkedArray.push(array.slice(index, index + chunkSize));
            index += chunkSize;
        }

        return chunkedArray;
    }

    /**
     * String 앞에 N 자리만큼 지우기
     */
    static replaceOrRemovePrefix(str, num) {
        if (str.length <= num) {
            return "";
        } else {
            return str.substr(num);
        }
    }
    /**
     * Array 앞에서 N개 남기고 지우기
     */
    static sliceArray(arr, num) {
        if (arr.length > num) {
            return arr.slice(0, num);
        } else {
            return arr;
        }
    }

    /**
     * 단어 자르고 랜덤으로 N 개만큼 반환
     */
    static sliceArrayRandomReturn(str, num) {
        let arr = str.split(',');
        let result = [];

        for(let i = 0; i < num; i++) {
            let index = Math.floor(Math.random() * arr.length);
            result.push(arr[index]);
            arr.splice(index, 1);
        }
        return result;
    }


    /**
     * leadingZeros
     * 1) 00001 (str1: 1, str2: 0, cnt: 4)
     * 2) 100 (str1: 1, str2: 0, cnt: 2)
     */
    static leadingZeros(n, digits) {
        let zero = '';
        n = n.toString();

        if (n.length < digits) {
            for (let i = 0; i < digits - n.length; i++)
                zero += '0';
        }
        return zero + n;
    }

    static async axiosPost(url, data) {
        const options = {
            method: 'post',
            maxBodyLength: Infinity,
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            data : JSON.stringify(data)
        };

        const response = await axios.request(options);
        return response.data;
    }
    static async axiosGet(url, query) {
        const options = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url + '?' + query,
            headers: {
                'Content-Type': 'application/json'
            },
        };

        const response = await axios.request(options);
        return response.data;
    }
    /**
     * 핸드폰번호 정규식 체크 +821012341234 형식
     */
    static returnPhoneNumberCheck(phoneNumber){
        const regex = /^\+82[0-9]{9,10}$/;
        return regex.test(phoneNumber);
    }


    /**
     * 핸드폰번호 국가코드 / 010 형태 반환
     * type 1: 010-XXXX-XXXX
     * type 2: 01012341234
     */
    static returnCountryCodeAndPhoneNumber(phoneNumber, type = 1){
        const countryCode = phoneNumber.slice(0, 3);
        let localNumber= '0' + phoneNumber.slice(3, 5);
        if (type === 1) {
            localNumber += '-' + phoneNumber.slice(5,9) + '-' +  phoneNumber.slice(9,13);
        }
        if (type === 2) {
            localNumber += phoneNumber.slice(5,9) + phoneNumber.slice(9,13);
        }
        return [countryCode, localNumber]; //+82, 010~
    }
}

