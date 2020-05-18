// Separamos este código de checks.js para poder lanzarlo limpiamente en preinstall (sin dependencias)
//

// We won´t use fs promises because in windows 10 and Ubuntu writefile breaks promises in node 12
// we will use the standard callback version and promisify it
// const fs = require('fs').promises;
const fs = require("fs");
const path = require("path");

const {promisify} = require("util");
const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);


const path_assignment = path.resolve(path.join(__dirname, ".."));


function user_data() {
    return path.join(path_assignment, 'user.json');
}

function read_models() {
    let data = fs.readFileSync(path.join(__dirname, 'tests-data'))
    return new JSON.parse(Buffer(data).toString('base64'));
}

function read_models(){
    return fs.readFileSync(path.join(__dirname, "tests-data"))
        .toString('utf-8')
        .split('\n').reduce((obj, line) => {
            let tokens = line.split(":");
            if(tokens.length < 3) {
                return obj;
            }
            obj.push({
                modelo: (new Buffer.from(tokens[0], 'base64')).toString('utf-8'),
                enunciado: (new Buffer.from(tokens[1], 'base64')),
                config: JSON.parse((new Buffer.from(tokens[2], 'base64')).toString('utf-8')),
            });
            return obj;
        }, []);
}


let modelos = read_models();


const secret = 2;

function model_for_user (email) {
    var id = secret;
    for(const ix in email){
        id += email.charCodeAt(ix);
    }

    // JS is stupid and it can't easily work with keys
    let keys = Object.keys(modelos);
    id = id % keys.length;

    return modelos[keys[id]];
};

function modelSync() {
    let user_email = JSON.parse((fs.readFileSync(user_data())).toString('utf8'))['email'].toLowerCase();
    return model_for_user(user_email);
};


function prepare(email) {
    let model;

    if(process.env.MODEL_NAME && process.env.MODEL_CONFIG){
        return {
            modelo: process.env.MODEL_NAME,
            config: JSON.parse(process.env.MODEL_CONFIG)
        };
    }

    // email provided
    if(email) {
        model = model_for_user(email);
    } else {
        model = modelSync();
    }


    // Ahora usamos user.json, así que este paso no es necesario
    // await writeFile(user_data(), email);

    fs.writeFileSync(path.join(path_assignment, 'Enunciado.pdf'), model.enunciado);

    process.env.MODEL_CONFIG = JSON.toString(model.config);

    return model;
};

module.exports = prepare();
