//. generator.js
var request = require( 'request' );
var fs = require( 'fs' );

var Matchbo = require( './matchbo' );

var matchbodb_url = "https://matchbodb.herokuapp.com";
//var matchbodb_url = "http://localhost:8080";

//. #31
var isvalid_doublezeros = 'DOUBLEZEROS' in process.env ? process.env.DOUBLEZEROS : false; //. #30
var isvalid_doublecalcs = 'DOUBLECALCS' in process.env ? process.env.DOUBLECALCS : false;
var isvalid_doubleequals = 'DOUBLEEQUALS' in process.env ? process.env.DOUBLEEQUALS : true;
var isvalid_onetoplus = 'ONETOPLUS' in process.env ? process.env.ONETOPLUS : false;
var isvalid_plustoone = 'PLUSTOONE' in process.env ? process.env.PLUSTOONE : false;
var isvalid_reverse = 'REVERSE' in process.env ? process.env.REVERSE : false;
var isvalid_plusminus = 'PLUSMINUS' in process.env ? process.env.PLUSMINUS : false;
var isvalid_fourtooneminusone = 'FOURTOONEMINUSONE' in process.env ? process.env.FOURTOONEMINUSONE : false;
var isvalid_fourtominusone = 'FOURTOMINUSONE' in process.env ? process.env.FOURTOMINUSONE : false;
var no_updatedb = 'NO_UPDATEDB' in process.env ? process.env.NO_UPDATEDB : false;  //. #32
var min_formulas = 'MIN_FORMULAS' in process.env ? parseInt( process.env.MIN_FORMULAS ) : 100;  //. #41

//. #47
var counts = JSON.parse( fs.readFileSync( './counts.json', 'utf8' ) );

//. #39
var COUNT_ELEVEN = 'COUNT_ELEVEN' in process.env ? parseInt( process.env.COUNT_ELEVEN ) : counts.COUNT_ELEVEN;
var COUNT_VALID_MINUS = 'COUNT_VALID_MINUS' in process.env ? parseInt( process.env.COUNT_VALID_MINUS ) : counts.COUNT_VALID_MINUS;
var COUNT_MULTI_EQUAL = 'COUNT_MULTI_EQUAL' in process.env ? parseInt( process.env.COUNT_MULTI_EQUAL ) : counts.COUNT_MULTI_EQUAL;
var COUNT_MINUS_VALUE = 'COUNT_MINUS_VALUE' in process.env ? parseInt( process.env.COUNT_MINUS_VALUE ) : counts.COUNT_MUNUS_VALUE;  //. #43
var COUNT_SPECIAL_CHECK = 'COUNT_SPECIAL_CHECK' in process.env ? parseInt( process.env.COUNT_SPECIAL_CHECK ) : counts.COUNT_SPECIAL_CHECK;  //. #46

var matchbo = new Matchbo( isvalid_doublezeros, isvalid_doublecalcs, isvalid_doubleequals, isvalid_onetoplus, isvalid_plustoone, isvalid_reverse, isvalid_plusminus, isvalid_fourtooneminusone, isvalid_fourtominusone );

//. #5
function unique( arr ){
  var new_arr = [];
  var new_arr_formula = [];
  var new_arr_rev = [];
  for( var i = 0; i < arr.length; i ++ ){
    var idx = new_arr_formula.indexOf( arr[i].formula );
    if( idx > -1 ){
      if( new_arr_rev[idx] != arr[i].rev ){
        new_arr_formula.push( arr[i].formula );
        new_arr_rev.push( arr[i].rev );
      }
    }else{
      new_arr_formula.push( arr[i].formula );
      new_arr_rev.push( arr[i].rev );
    }
  }

  for( var i = 0; i < new_arr_formula.length; i ++ ){
    new_arr.push( { formula: new_arr_formula[i], rev: new_arr_rev[i] } );
  }

  return new_arr;
}

//. #23
function countDifficulty( f_question, f_answers ){
  var cnt = 0;
  for( var i = 0; i < f_question.length; i ++ ){
    var c = f_question.charAt( i );
    var idx = -1;
    if( '0' <= c && c <= '9' ){
      idx = c - '0';
    }else{
      switch( c ){
      case '+':
        idx = 12;
        break;
      case '-':
        idx = 13;
        break;
      case '*':
        idx = 14;
        break;
      case '/':
        idx = 15;
        break;
      case '=':
        idx = 16;
        break;
      }
    }

    if( idx > -1 ){
      var trans = matchbo.transitions[idx];
      trans.forEach( function( t ){
        cnt += trans.length;
      });
    }
  }

  //. '11'
  var n = f_question.indexOf( '11' );
  while( n > -1 ){
    cnt += COUNT_ELEVEN;
    n = f_question.indexOf( '11', n + 1 );
  }

  //. #27
  for( var i = 0; i < f_question.length; i ++ ){
    var c = f_question.charAt( i );
    var idx = -1;
    if( '0' <= c && c <= '9' ){
      idx = c - '0';
    }else{
      switch( c ){
      case '+':
        idx = 12;
        break;
      case '-':
        idx = 13;
        break;
      case '*':
        idx = 14;
        break;
      case '/':
        idx = 15;
        break;
      case '=':
        idx = 16;
        break;
      }
    }

    //. 「１本抜くと成立する」場合は100ポイント
    if( idx > -1 ){
      var trans1 = matchbo.transitions[idx][1];
      trans1.forEach( function( c1 ){
        var new_formula = f_question.substr( 0, i ) + c1 + f_question.substr( i + 1 );
        var found = matchbo.isValidFormula( new_formula );
        if( found ){ cnt += COUNT_VALID_MINUS; }
      });
    }
  }

  if( f_answers && f_answers.length ){  //. f_answers.length == 1 のはず
    for( var i = 0; i < f_answers.length; i ++ ){
      //. #46
      if( f_answers[i].special_check ){
        cnt += COUNT_SPECIAL_CHECK;
      }

      //. 「イコールが複数存在する」場合は100ポイント
      var tmp = f_answers[i].formula.split( '=' );
      if( tmp.length > 2 ){
        cnt += ( tmp.length - 2 ) * COUNT_MULTI_EQUAL;
      }

      //. #43
      if( eval( tmp[0] ) < 0 ){
        cnt += COUNT_MINUS_VALUE;
      }
    }
  }

  return cnt;
}

function sortByNumRev( a, b ){
  var r = 0;
  if( a.num < b.num ){
    r = 1;
  }else if( a.num > b.num ){
    r = -1;
  }

  return r;
}

//. #17
var quiz_pattern = JSON.parse( fs.readFileSync( './quiz_pattern.json', 'utf8' ) );

async function getDataFromDB( id ){
  return new Promise( function( resolve, reject ){
    var option = {
      url: matchbodb_url + '/api/db/quiz/' + id,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };
    request( option, ( err, res, body ) => {
      if( err ){
        console.log( { err } );
        resolve( [] );
      }else{
        body = JSON.parse( body );
        console.log( { body } );
        if( body && body.status && body.result && body.result.data ){
          resolve( JSON.parse( body.result.data ) );
        }else{
          resolve( [] );
        }
      }
    });
  });
}

async function generate_quiz( idx ){
  return new Promise( async function( resolve, reject ){
    var quizs_d = [];
    var quizs_v = [];
    var max_num_d = 0;
    var max_num_v = 0;
    var pattern = quiz_pattern[idx];
    var cnt = 0;

    var quiz = matchbo.recursive_generate_quiz( '', pattern, true );
    while( quiz !== null ){
      if( matchbo.isValidQuiz( quiz ) ){  //. 出題としての Validation は別にするべき
        cnt ++;
  
        //. check
        var quiz_answers = matchbo.fullcheckFormula( quiz );

        //. difficulty
        if( quiz_answers.length == 1 ){
          //var dif = countDifficulty( quiz, quiz_answers );
          var dif = matchbo.countDifficulty( quiz, quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE );
          if( quizs_d.length < min_formulas ){
            quizs_d.push( { formula: quiz, num: dif } );
            //quizs_d.sort( sortByNumRev );
          }else if( dif >= quizs_d[min_formulas-1].num ){
            quizs_d.push( { formula: quiz, num: dif } );
            quizs_d.sort( sortByNumRev );

            if( quizs_d[min_formulas-1].num > quizs_d[quizs_d.length-1].num ){
              var _idx = -1;
              for( _idx = min_formulas; _idx < quizs_d.length && quizs_d[_idx].num == quizs_d[min_formulas-1].num; _idx ++ ){}
              quizs_d.splice( _idx, quizs_d.length - _idx );
            }
          }

          if( dif > max_num_d ){
            max_num_d = dif;
          }
        }

        //. variety
        if( quiz_answers.length > 1 ){
          var dif = quiz_answers.length;
          if( quizs_v.length < min_formulas ){
            quizs_v.push( { formula: quiz, num: dif } );
            //quizs_v.sort( sortByNumRev );
          }else if( dif >= quizs_v[min_formulas-1].num ){
            quizs_v.push( { formula: quiz, num: dif } );
            quizs_v.sort( sortByNumRev );

            if( quizs_v[min_formulas-1].num > quizs_v[quizs_v.length-1].num ){
              var _idx = -1;
              for( _idx = min_formulas; _idx < quizs_v.length && quizs_v[_idx].num == quizs_v[min_formulas-1].num; _idx ++ ){}
              quizs_v.splice( _idx, quizs_d.length - _idx );
            }
          }

          if( dif > max_num_v ){
            max_num_v = dif;
          }
        }
      }

      quiz = matchbo.recursive_generate_quiz( quiz, pattern, false );
    }

    console.log( '#quizs_d = ' + quizs_d.length + ' (' + max_num_d + ')' );
    console.log( '#quizs_v = ' + quizs_v.length + ' (' + max_num_v + ')' );

    if( !no_updatedb ){
      var pattern_str = pattern.join( '' );
      var result_data_d = await getDataFromDB( pattern_str + '-difficulty' );
      if( result_data_d && result_data_d.length > 0 ){
        //. 更新登録(#28)
        //quizs = result_data;
        var option_d = {
          url: matchbodb_url + '/api/db/quiz/' + pattern_str + '-difficulty',
          method: 'PUT',
          json: { data: JSON.stringify( quizs_d ), num: quizs_d.length, length: max_num_d },
          headers: { 'Accept': 'application/json' }
        };
        request( option_d, async ( err, res, body ) => {
          if( err ){
            console.log( { err } );
            resolve( false );
          }else{
            console.log( { body } );

            var result_data_v = await getDataFromDB( pattern_str + '-variety' );
            if( result_data_v && result_data_v.length > 0 ){
              var option_v = {
                url: matchbodb_url + '/api/db/quiz/' + pattern_str + '-variety',
                method: 'PUT',
                json: { data: JSON.stringify( quizs_v ), num: quizs_v.length, length: max_num_v },
                headers: { 'Accept': 'application/json' }
              };
              request( option_v, ( err, res, body ) => {
                if( err ){
                  console.log( { err } );
                  resolve( false );
                }else{
                  console.log( { body } );
                  resolve( true );
                }
              });
            }else{
              //. 新規登録
              var option_v = {
                url: matchbodb_url + '/api/db/quiz',
                method: 'POST',
                json: { id: pattern_str + '-variety', data: JSON.stringify( quizs_v ), num: quizs_v.length, length: max_num_v },
                headers: { 'Accept': 'application/json' }
              };
              request( option_v, ( err, res, body ) => {
                if( err ){
                  console.log( { err } );
                  resolve( false );
                }else{
                  console.log( { body } );
                  resolve( true );
                }
              });
            }
          }
        });
      }else{
        //. 新規登録
        var option_d = {
          url: matchbodb_url + '/api/db/quiz',
          method: 'POST',
          json: { id: pattern_str + '-difficulty', data: JSON.stringify( quizs_d ), num: quizs_d.length, length: max_num_d },
          headers: { 'Accept': 'application/json' }
        };
        request( option_d, async ( err, res, body ) => {
          if( err ){
            console.log( { err } );
            resolve( false );
          }else{
            console.log( { body } );

            var result_data_v = await getDataFromDB( pattern_str + '-variety' );
            if( result_data_v && result_data_v.length > 0 ){
              var option_v = {
                url: matchbodb_url + '/api/db/quiz/' + pattern_str + '-variety',
                method: 'PUT',
                json: { data: JSON.stringify( quizs_v ), num: quizs_v.length, length: max_num_v },
                headers: { 'Accept': 'application/json' }
              };
              request( option_v, ( err, res, body ) => {
                if( err ){
                  console.log( { err } );
                  resolve( false );
                }else{
                  console.log( { body } );
                  resolve( true );
                }
              });
            }else{
              //. 新規登録
              var option_v = {
                url: matchbodb_url + '/api/db/quiz',
                method: 'POST',
                json: { id: pattern_str + '-variety', data: JSON.stringify( quizs_v ), num: quizs_v.length, length: max_num_v },
                headers: { 'Accept': 'application/json' }
              };
              request( option_v, ( err, res, body ) => {
                if( err ){
                  console.log( { err } );
                  resolve( false );
                }else{
                  console.log( { body } );
                  resolve( true );
                }
              });
            }
          }
        });
      }
    }else{
      console.log( { data: JSON.stringify( quizs_d ) } );
      console.log( { data: JSON.stringify( quizs_v ) } );
      resolve( true );
    }
  });
}

try{
  if( process.argv.length > 2 ){
    var n = parseInt( process.argv[2] );
    if( 0 <= n && n < quiz_pattern.length ){
      var ts1 = ( new Date() ).getTime();
      generate_quiz( n ).then( function(){
        var ts2 = ( new Date() ).getTime();
        var ts = Math.floor( ( ts2 - ts1 ) / 1000 );

        var ts_min = Math.floor( ts / 60 );
        var ts_sec = ( ts % 60 );

        console.log( ' ... ' + ts + ' sec (' + ts_min + ' min ' + ts_sec + ' sec)' );
      });
    }else{
      console.log( 'Usage: $ node generator [n]' );
      console.log( '  n : 0 <= n < ' + quiz_pattern.length );
    }
  }else{
    console.log( 'Usage: $ node generator [n]' );
    console.log( '  n : 0 <= n < ' + quiz_pattern.length );
  }
}catch( e ){
  console.log( e );
}
