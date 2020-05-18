/* eslint-disable no-invalid-this*/
/* eslint-disable no-undef*/
// IMPORTS
var {modelo, config} = require('./configuration');

const path = require("path");
const Utils = require("./testutils");
const spawn = require("child_process").spawn;
const fs = require("fs");

const process = require("process");


const DEBUG =  typeof process.env.DEBUG !== "undefined";
const LOG_SERVER =  typeof process.env.LOG_SERVER !== "undefined";
const WAIT =  typeof process.env.WAIT !== "undefined"?parseInt(process.env.WAIT):50000;
const TIMEOUT =  typeof process.env.TIMEOUT !== "undefined"?parseInt(process.env.TIMEOUT):2000;
const TEST_PORT =  typeof process.env.TEST_PORT !== "undefined"?parseInt(process.env.TEST_PORT):3001;

const SEQUELIZE_CMD =  typeof process.env.SEQUELIZE_CMD !== "undefined"?process.env.SEQUELIZE_CMD:"npx sequelize";

const FILTER = new RegExp(process.env.TESTFILTER, "i");


const path_assignment = path.resolve(typeof process.env.PATH_ASSIGNMENT !== "undefined"?process.env.PATH_ASSIGNMENT:path.join(__dirname, ".."));
const URL = `file://${path_assignment.replace("%", "%25")}`;
const browser = new Browser({"waitDuration": WAIT, "silent": true, "runScripts": false });

console.log(`Trabajando en: ${path_assignment}`);

// CRITICAL ERRORS. Si hay errores críticos, el resto de tests no se lanzan.
let error_critical = null;
let error_any = null;

// Hay que cambiar los IDs si cambia el seeder
const groups = {
    "1": [1, 2, 3, 4], // Geography
    "2":  [5, 6],      // Math
};

const questions = [
    {
        question: 'Capital of Italy',
        answer: 'Rome',
    }, {
        question: 'Captal of Portugal',
        answer: 'Lisbon',
    }, {
        question: 'Capital of Spain',
        answer: 'Madrid',
    }, {
        question: 'Capital of France',
        answer: 'Paris',
    }, {
        question: '1+1=?',
        answer: '2',
    }, {
        question: '5^2=?',
        answer: '25',
    }
];

if(!config) {
    throw Error(`Modelo de examen desconocido!`);
}

// TODO: Integrar bien con un logger
function log() {
    if(DEBUG) {console.log.apply(this, arguments );}
}


var num_tests = 1;

function soloPara(filtro, func) {
    if(filtro.includes(modelo)) {
        func();
    }
}

console.log('Modelo actual:', modelo);

function comprueba(msg, score, func) {
    msg = `${num_tests}: ${msg}`;
    num_tests++;
    return it(msg, async function () {
        let critical = score < 0;
        this.score = critical? 0 :score;
        this.msg_ok = null;
        this.msg_err = null;
        if(error_critical) {
            this.msg_err = "Un test crítico ha fallado, no podemos continuar hasta que pasen todos los tests críticos.";
            throw Error(this.msg_err);
        } 
        if(FILTER && !(FILTER.test(msg) || FILTER.test(id))) {
            console.log(`Ignorando este test, de acuerdo con los filtros de test: ${FILTER}`);
            return;
        }

        try {
            let res = await func.apply(this, []);
            if (!this.msg_ok){
                this.msg_ok =  "¡Enhorabuena!";
            }
            return;
        } catch(e){
            log("Exception in test:", e);
            error_any = true;
            if (!this.msg_err){
                this.msg_err =  `Ha habido un fallo: ${e.message}`;
            }
            if (critical) {
                console.log('Se ha producido un error crítico, se cancelan el resto de tests.')
                error_critical = this.msg_err;
            }
            throw(e);
        }
    });
};


// present y absent son listados de expresiones regulares que deben (o no) encontrarse en el fichero
function comprueba_fichero(fpath, present, absent) {
    present = present || [];
    absent = absent || [];
    let file = path.join(path_assignment, fpath);
    this.msg_err = 'No se puede leer el fichero ${file}.';
    let templ = fs.readFileSync(file, "utf8");
    for(let reg of present) {
            if(!reg.test(templ)) {
                throw Error(`${fpath} no incluye algún elemento importante. Falla con la expresión: ${reg}`);
            };
    }
    for(let reg of absent){
        if(reg.test(templ)) {
            throw Error( `${fpath} incluye ${e}, pero debería haberse borrado`);
        };
    }
}


describe("Tests examen", async function() {
    after(function () {

        if(!DEBUG && (error_any || error_critical)) {
            console.log(`Algún error de Javascript ha sido suprimido. Puedes obtener más información de los errores lanzando el autocorector con la variable DEBUG. Por ejemplo:

  DEBUG=1 autocorector

Cuando preguntes en el foro, asegúrate de incluir esa información para que podamos ayudarte.
`);
        }
    });

    // Ahora mismo estos se lanzan para todos los modelos

    // Tests que no puntúan, pero sus fallos son CRITICAL. Es un sanity check antes de los tests de verdad.
    describe("Prechecks", function () {
        comprueba("Comprobando que existe el directorio de la entrega...",
                  -1,
                  async function () {
                      this.msg_ok = `Encontrado el directorio '${path_assignment}'`;
                      this.msg_err = `No se encontró el directorio '${path_assignment}'`;
                      const fileexists = await Utils.checkFileExists(path_assignment);

                      fileexists.should.be.equal(true);
                  });


    });

    // Guardar tests para el futuro
    // Equivalente a comentarlos :)
    soloPara([], function() {

        comprueba(`Comprobar que la migración y el seeder existen`,
                  -1,
                  async function () {

                      let files = [
                          ['migrations', '-CreateGroupsTable.js'],
                          ['migrations', '-CreateGroupQuizzesTable.js'],
                          ['seeders', '-FillGroupsTable.js'],
                      ];
                      for (var [folder, suffix] of files) {
                          this.msg_err = `La carpeta ${folder} no tiene un fichero acabado en ${suffix}`;
                          let file = fs.readdirSync(path.join(path_assignment, folder)).filter(fn => fn.endsWith(suffix));
                          (file.length).should.be.equal(1);
                      }
                  });

        comprueba(`Comprobar que los controladores existen`,
                  -1,
                  async function () {
                      this.msg_err = "No se incluye el controlador de groups";

                      let quiz = require(path.resolve(path.join(path_assignment, 'controllers', 'group')));
                      quiz.index.should.not.be.undefined;
                  })
        comprueba(`Comprobar que las plantillas express-partials tienen los componentes adecuados`,
                  0,
                  async function () {
                      this.msg_err = 'No se ha encontrado todos los elementos necesarios. Revisa las plantillas.';
                      let checks = {
                          "views/layout.ejs": {
                              true: [/<%- body %>/g, /<header/, /<\/header>/, /<nav/, /<\/nav>/, /<footer/, /<\/footer>/]
                          },
                          [path.join("views", "groups", "index.ejs")]: {
                              true: [/<h1>[ \n\t\r^M]*Groups:[ \n\t\r^M]*<\/h1>/],
                          },
                          [path.join("views", "groups", "edit.ejs")]: {
                              true: [/Configure Group/],
                          },
                          [path.join("views", "groups", "new.ejs")]: {
                              true: [/<form method="post" action="\/groups">/]
                          },
                          [path.join("views", "groups", "random_play.ejs")]: {
                              true: [/Group Play/],
                          },
                          [path.join("views", "groups", "random_nomore.ejs")]: {
                              true: [/End of Group Play/],
                          },
                          [path.join("views", "groups", "random_result.ejs")]: {
                              true: [/You have succeeded/, /You have failed/],
                          },
                      };

                      for (let fpath in checks) {
                          try{
                              comprueba_fichero(fpath, checks[fpath]['true'], checks[fpath]['false']);
                          }catch(e){
                              this.msg_err = e.message;
                              throw e;
                          }
                      }
                  });
            comprueba("La lista de grupos incluye un enlace para jugar",
                      1,
                      async function(){ 
                          await browser.visit("/groups/");
                          browser.assert.status(200);
                          this.msg_err = "No se muestra enlace para Geography";
                          browser.assert.text('a[href="/groups/1/randomplay"]', "Geography");
                          this.msg_err = "No se muestra enlace para Math";
                          browser.assert.text('a[href="/groups/2/randomplay"]', "Math");
                      });

            comprueba("Los quizzes se eligen aleatoriamente",
                      1,
                      async function () {
                          // Lanzamos 10 intentos de partida, sin cookies. Debería haber más de 2 preguntas diferentes
                          this.msg_err = `Se repite el orden de los quizzes`;

                          let visited = {};
                          let num = 0;

                          for(var i=0; i<10; i++) {
                              await browser.visit("/groups/1/randomplay");
                              browser.assert.status(200);
                              let att = browser.query('form');
                              if(!visited[att.action]) {
                                  visited[att.action] = 1;
                                  num++;
                              } else {
                                  visited[att.action]++;
                              }
                              browser.deleteCookies();
                          }

                          num.should.be.above(1);
                      });

            comprueba("No se repiten los quizzes",
                      1,
                      async function () {
                          // Hacer dos partidas, comprobar que el orden de las preguntas es diferente

                          let visited = {};
                          browser.deleteCookies();


                          for (var group in groups) {
                              for(var i=0; i<groups[group].length; i++) {
                                  this.msg_err = `Error al intentar jugar en el grupo ${group}`;
                                  let url = `/groups/${group}/randomplay`;
                                  await browser.visit(url);
                                  browser.assert.status(200);
                                  let att = browser.query('form');
                                  if(!visited[att.action]) {
                                      visited[att.action] = 1;
                                  } else{
                                      this.msg_err = `Quiz repetido: ${att.action}`;
                                      throw Error(this.msg_err);
                                      visited[att.action]++;
                                  }
                                  let tokens = att.action.split("/");
                                  let id = parseInt(tokens[tokens.length-1]);
                                  let q = questions[id-1];
                                  let answer = q.answer;
                                  url = `/groups/${group}/randomcheck/${id}?answer=${answer}`;
                                  await browser.visit(url);
                              }
                          }
                      });

            comprueba("Se termina si no quedan más quizzes",
                      1,
                      async function () {
                          this.msg_err = "Se han respondido todas las preguntas, pero el juego continúa";

                          await browser.visit(`/groups/2/randomplay`); // TODO: Actualizar si se meten más grupos, o usar el diccionario.
                          browser.assert.text("section>h1", "End of Group Play: Math");
                      });

            comprueba("Si se responde bien, continúa el juego",
                      1,
                      async function () {
                          browser.deleteCookies();

                          for(var i=0; i< 10; i++) {
                              await browser.visit("/groups/1/randomplay");
                              browser.assert.status(200);
                              let att = browser.query('form');
                              let tokens = att.action.split("/");
                              const id = parseInt(tokens[tokens.length-1]);
                              let question = questions[id-1];
                              let answer = question.answer;
                              await browser.visit(`/groups/1/randomcheck/${id}?answer=${answer}`);
                              this.msg_err = `No acepta la respuesta correcta para ${question}`;
                              browser.assert.status(200);
                              this.msg_err = `Se acepta la respuesta, pero hay un error al continuar`;
                              await browser.visit("/groups/1/randomplay");
                              att = browser.query('form');
                              tokens = att.action.split("/");
                              let new_id = parseInt(tokens[tokens.length-1]);
                              this.msg_err = "Se repite la pregunta";
                              id.should.not.be.equal(new_id);
                              browser.deleteCookies();
                          }
                      });

            comprueba("Al fallar se termina el juego",
                      1,
                      async function () {
                          this.msg_err = "Al fallar hay un error";

                          browser.deleteCookies();
                          await browser.visit("/groups/1/randomplay");
                          browser.assert.status(200);
                          await browser.visit("/groups/1/randomcheck/1?answer=This answer is wrong");
                          browser.assert.status(200);

                          this.msg_err = "Al fallar una pregunta no muestra la pantalla correcta";
                          browser.assert.text("section>h1", "Group Play: Geography");
                          browser.text().includes("You have failed").should.equal(true);
                      });

            comprueba("Se puntúa bien el número de aciertos",
                      1,
                      async function () {

                          // Repetimos dos veces, para asegurarnos.
                          for(var j=0; j<2; j++){
                              browser.deleteCookies();
                              for(var i=0; i< groups["1"].length; i++) {
                                  this.msg_err = "Hay un error con la petición a randomplay";
                                  await browser.visit("/groups/1/randomplay");
                                  browser.assert.status(200);
                                  let att = browser.query('form');
                                  let tokens = att.action.split("/");
                                  const id = parseInt(tokens[tokens.length-1]);
                                  let question = questions[id-1];
                                  let answer = question.answer;
                                  this.msg_err = `No acepta la respuesta correcta para ${question}`;
                                  await browser.visit(`/groups/1/randomcheck/${id}?answer=${answer}`);
                                  browser.assert.status(200);
                                  const body = browser.text();
                                  let expected = `Successful answers = ${i+1}`;
                                  this.msg_err = `No se muestra el número de aciertos correctamente. Esperaba encontrar: ${expected}`;
                                  body.includes(expected).should.equal(true);
                              }
                          }
                      });


            comprueba("La lista de grupos sólo muestra opciones de edición al admin",
                      0.75,
                      async function() {
                          var ctx = this;
                          return allUsers(async function(user) {
                              await browser.visit("/groups");
                              ctx.msg_err = `El usuario ${user.username} no puede ver la lista de grupos correctamente`;
                              browser.assert.text("#mainHeader > div.right > a:nth-child(1)", user.username);
                              let expected = user.admin? 1 : 0;
                              ctx.msg_err = `El usuario ${user.username} ${user.admin?'sí':'no'} debería poder editar`;
                              browser.assert.elements('a[href="/groups/1/edit"]', expected);
                              browser.assert.elements('a[href="/groups/1?_method=DELETE"]', expected);
                          });
                      });

            comprueba("Sólo un admin puede crear nuevos grupos",
                      0.75,
                      async function() {
                          var ctx = this;
                          return allUsers(async function(user) {
                              try{
                                  await browser.visit("/groups/new");
                              } catch(e){}

                              ctx.msg_err = `El usuario ${user.username} ${user.admin?'sí':'no'} debería poder crear nuevos grupos`;

                              if(!user.admin) {
                                  browser.assert.status(403);
                                  return;
                              }
                              browser.assert.status(200);

                              await browser.fill('name', `prueba_${user.username}`);
                              await browser.pressButton('Save');
                              browser.assert.status(200);
                          });
                      });

            comprueba("Sólo un admin puede editar un grupo",
                      0.75,
                      async function() {
                          var ctx = this;
                          return allUsers(async function(user) {
                              try{
                                  await browser.visit("/groups/1/edit");
                              } catch(e){}

                              ctx.msg_err = `El usuario ${user.username} ${user.admin?'sí':'no'} debería poder editar grupos`;

                              if(!user.admin) {
                                  browser.assert.status(403);
                                  return;
                              }
                              browser.assert.status(200);
                              await browser.pressButton('Save');
                              browser.assert.status(200);
                          });
                      });

            comprueba("Sólo un admin puede eliminar un grupo",
                      0.75,
                      async function() {
                          var ctx = this;
                          return allUsers(async function(user) {
                              try{
                                  await browser.visit("/groups/1/?_method=DELETE");
                              } catch(e){}

                              ctx.msg_err = `El usuario ${user.username} ${user.admin?'sí':'no'} debería poder eliminar grupos`;

                              if(!user.admin) {
                                  browser.assert.status(403);
                                  return;
                              }

                              browser.assert.status(200);
                          });
                      });
    });

    describe("Funcionales", function(){

            // Hay que dejar al admin el último para la operación de DELETE
            var users = [
                {
                    username: 'pepe',
                    password: '5678',
                    admin: false,
                },
                {
                    username: 'admin',
                    password: '1234',
                    admin: true,
                },
            ];
            const cookie_name = 'connect.sid';
            var cookies = {};

            var server;
            const db_file = path.join(path_assignment, 'quiz_for_tests.sqlite');



            async function asUser(username, fn) {
                browser.deleteCookies();
                let user = users.find(u => u.username == username);

                await browser.visit("/login/");
                await browser.fill('username', user.username);
                await browser.fill('password', user.password);
                await browser.pressButton('Login');

                try{
                    await fn.apply(this, []);
                }catch(e){
                    // Esta parte sólo funciona si se usa asUsers.apply(this, [argumentos]) siempre.
                    // y allUsers.apply, si se usa dentro de esa función.
                    if(!this.msg_err) {
                        this.msg_err = `Fallo con el usuario ${username}`;
                    } else {
                        this.msg_err += `, con el usuario ${username}`;
                    }
                    throw(e);
                }
                browser.deleteCookie(cookie_name);
            }

            async function allUsers(fn) {
                for(var user of users) {
                    await asUser.apply(this, [user.username, async function () {
                        return fn.apply(this, [users[name]]);
                    }]);
                }
            }

            after(async function() {
                if(server) {
                    await server.kill();
                    // Borrar base de datos
                    if(!DEBUG){
                        fs.unlinkSync(db_file);
                    }
                }
            });

        before(async function() {

            let err = null;
            try{
                // Crear base de datos nueva y poblarla antes de los tests funcionales. por defecto, el servidor coge quiz.sqlite del CWD
                err = `Existe una base de datos en ${db_file}, pero no hemos podido borrarla.`;
                if (fs.existsSync(db_file)) {
                    fs.unlinkSync(db_file);
                }
                err = "No hemos podido crear la base de datos";
                fs.closeSync(fs.openSync(db_file, 'w'));

                err = "No hemos podido lanzar las migraciones";
                await exec(`${SEQUELIZE_CMD} db:migrate --url "sqlite://${db_file}" --migrations-path ${path.join(path_assignment, "migrations")}`);
                err = "No hemos podido lanzar las seeds";
                await exec(`${SEQUELIZE_CMD} db:seed:all --url "sqlite://${db_file}" --seeders-path ${path.join(path_assignment, "seeders")}`);

                let bin_path = path.join(path_assignment, "bin", "www");

                err = `Parece que no se puede lanzar el servidor con el comando "node ${bin_path}".`;
                server = spawn('node', [bin_path], {env: {PORT: TEST_PORT,
                                                          DATABASE_URL: `sqlite://${db_file}`,
                                                          MODEL_CONFIG: process.env.MODEL_CONFIG,
                                                         }
                                                   });

                // Hay un issue extraño que hace que el servidor deje de funcionar en algún momento de los tests.
                // Añadir el callback aquí, aunque no se ejecute, parece arreglar el problema.
                server.stdout.on('data', function(data) {
                    if(LOG_SERVER) {
                        log('\t\tServer: ', data.toString()); 
                    }
                });

                server.stderr.on('data', function(data) {
                    console.log('\t\tError en el servidor: ', data.toString()); 
                });

                await new Promise(resolve => setTimeout(resolve, TIMEOUT));

                // The exit code should be null while the server is running
                if(server.exitCode) {
                    throw Error("El servidor se ha parado.");
                }

                browser.site = `http://localhost:${TEST_PORT}/`;
                await browser.visit("/");
                browser.assert.status(200);

            } catch(e) {
                console.log(err);
                console.log();
                console.log('Este es un error crítico, así que no podemos realizar el resto de tests.');
                console.log();
                log(e);
                error_critical = err;
            }
        });

        beforeEach(async function() {
            await browser.deleteCookies();
        });

        soloPara(["Simulacro-1"], function() {
            comprueba(`La página principal incluye un enlace para ${config.middlewareName} si estás logueado`,
                      1,
                      async function(){ 
                          await browser.visit("/");
                          browser.assert.status(200);
                          await asUser('pepe', async function() {
                              this.msg_err = "No se muestra enlace para el Total";
                              browser.assert.elements(`a[href="${config.requestPath}"]`, 1);
                          });

                      });

        });
    });
});

