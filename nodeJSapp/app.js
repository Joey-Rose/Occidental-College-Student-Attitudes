var express = require('express'); // Web Framework
var app = express();
var mysql = require('mysql');
var cors = require('cors');
const path = require('path');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
//prepare mysql login credentials
var sqlconfig = {
  /* enter mySQL login credentials here */
};
const connection = mysql.createPool(sqlconfig);
app.keepAliveTimeout = 30000;
// Start server and listen on http://127.0.0.1:49153/
app.listen(49153, '127.0.0.1', function (req, res) {

  console.log('app listening on port 49153');

});

connection.getConnection(err => {
  if (err) {
    console.error('An error occurred while connecting to the DB');
    throw err;
  }
  else {
    console.log('connected');
  }
});

//get user input, search all posts that contain user input, renders posts and user input  to client side-- some error checking along the way
app.post('/confessionsproject/search/', function (req, res) {
  connection.getConnection(function (err, connection) {
    //if word is contraction, make it have two apostrophes so sql server renders apostrophe
    req.body.oxytopic = (req.body.oxytopic).replace(/\'/g, "''");

    var condition1 = '% ' + req.body.oxytopic + ' %';
    var condition2 = '% ' + req.body.oxytopic + "." + ' %';
    var condition3 = '% ' + req.body.oxytopic + "!" + ' %';
    var condition4 = '% ' + req.body.oxytopic + "?" + ' %';
    var condition5 = '% ' + req.body.oxytopic + "," + ' %';
    var condition6 = '% ' + req.body.oxytopic + "\'\'" + '%';
    var condition7 = '% ' + req.body.oxytopic + ")" + ' %';
    var condition8 = '% ' + "(" + req.body.oxytopic + ' %';

    var stringRequest = mysql.format(
      `SELECT DISTINCT YourSQLcolumn 
       FROM YourSQLtable
       WHERE YourSQLcolumn LIKE \'${condition1}\'
       OR YourSQLcolumn LIKE \'${condition2}\'
       OR YourSQLcolumn LIKE \'${condition3}\'
       OR YourSQLcolumn LIKE \'${condition4}\'
       OR YourSQLcolumn LIKE \'${condition5}\'
       OR YourSQLcolumn LIKE \'${condition6}\'
       OR YourSQLcolumn LIKE \'${condition7}\'
       OR YourSQLcolumn LIKE \'${condition8}\'`);

    console.log(stringRequest);
    //make it so apostrophes aren't escaped
    stringRequest = (stringRequest).replace(/\\'/g, "'");

    connection.query(stringRequest, (error, result, fields) => {
      if (error) {
        console.error('An error occurred while executing the query');
        throw error;
      }
      console.log(result);

      var posts = "";
      try {
        userInput = req.body.oxytopic;

        //clean up posts and make them one big string rather than a dictionary
        for (var k = 0; k < result.length; k++) {
          if ((result[k].YourSQLcolumn).includes('\"')) {
            (result[k].YourSQLcolumn) = (result[k].YourSQLcolumn).replace(/\"/g, '');
          }
          posts += (result[k].YourSQLcolumn + '<br/>' + '<br/>');
        }
        console.log(posts);
        //if query returns nothing, render stuff that will produce error message. If it doesn't, render stuff per usual
        if (JSON.stringify(result) == '[]') {
          res.render('index', { uI: '', error: 'there is an error', posts: '' });
          console.log(err);
        }
        else {
          res.render('index', { uI: userInput, error: 'no error', posts: posts });
        }
      }
      //if there's an error raised, render stuff that will produce error message
      catch (err) {
        res.render('index', { uI: '', error: 'there is an error', posts: '' });
        console.log(err);
      }
      finally {
        //disconnect from mysql
        connection.release();
      }
    });
  });
});


