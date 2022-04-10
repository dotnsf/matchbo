//. generator.js
var request = require( 'request' );
var fs = require( 'fs' );

var Matchbo = require( './matchbo' );

var matchbodb_url = "https://matchbodb.herokuapp.com";

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
var COUNT_MINUS_VALUE = 'COUNT_MINUS_VALUE' in process.env ? parseInt( process.env.COUNT_MINUS_VALUE ) : counts.COUNT_MINUS_VALUE;  //. #43
var COUNT_SPECIAL_CHECK = 'COUNT_SPECIAL_CHECK' in process.env ? parseInt( process.env.COUNT_SPECIAL_CHECK ) : counts.COUNT_SPECIAL_CHECK;  //. #46
var COUNT_MINUS_MULTI_DIVIDE = 'COUNT_MINUS_MULTI_DIVIDE' in process.env ? parseInt( process.env.COUNT_MINUS_MULTI_DIVIDE ) : counts.COUNT_MINUS_MULTI_DIVIDE;  //. #56

var matchbo = new Matchbo( isvalid_doublezeros, isvalid_doublecalcs, isvalid_doubleequals, isvalid_onetoplus, isvalid_plustoone, isvalid_reverse, isvalid_plusminus, isvalid_fourtooneminusone, isvalid_fourtominusone );

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
          var dif = matchbo.countDifficulty( quiz, quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_SPECIAL_CHECK, COUNT_MINUS_MULTI_DIVIDE );
          if( quizs_d.length < min_formulas ){
            quizs_d.push( { formula: quiz, num: dif } );
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
      resolve( { quizs_d: quizs_d, num_d: quizs_d.length, length_d: max_num_d, quizs_v: quizs_v, num_v: quizs_v.length, length_v: max_num_v } );
    }
  });
}

//. #49
async function generate_daily_quiz(){
  return new Promise( async function( resolve, reject ){
    var cs = [ '', '+', '-', '*', '/' ];
    var days = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    var cnt = 0;
    var k = 0;
    for( var m = 0; m < 12; m ++ ){
      var _m = m + 1;
      var Mm = ( _m < 10 ? '0' : '' ) + _m;
      for( var _d = 1; _d <= days[m]; _d ++ ){
        var Dd = ( _d < 10 ? '0' : '' ) + _d;
        var quizs = [];

        //. "M c m = D c d" 形式の問題を作成する(c : 演算記号)
        for( var i = 0; i < cs.length; i ++ ){
          for( var j = 0; j < cs.length; j ++ ){
            var quiz = Mm.charAt( 0 ) + cs[i] + Mm.charAt( 1 )
              + '=' + Dd.charAt( 0 ) + cs[j] + Dd.charAt( 1 );

            if( matchbo.isValidQuiz( quiz ) ){  //. 出題としての Validation は別にするべき
              //. check
              var quiz_answers = matchbo.fullcheckFormula( quiz );

              if( quiz_answers.length > 0 ){
                var dif = matchbo.countDifficulty( quiz, quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_MINUS_MULTI_DIVIDE );
                quizs.push( { formula: quiz, num: dif } );
              }
            }
          }
        }

        if( quizs.length > 0 ){
          cnt ++;
          var id = Mm + Dd + '-dailyquiz';
          //console.log( id, quizs );

          if( !no_updatedb ){
            var result_data = await getDataFromDB( id );
            if( result_data && result_data.length > 0 ){
              //. 更新登録
              var option = {
                url: matchbodb_url + '/api/db/quiz/' + id,
                method: 'PUT',
                json: { data: JSON.stringify( quizs ), num: quizs.length, length: 0 },
                headers: { 'Accept': 'application/json' }
              };
              request( option, async ( err, res, body ) => {
                k ++;
                if( err ){
                  console.log( { err } );
                }else{
                  console.log( { body } );
                }

                if( k == 339 ){
                  resolve( cnt );
                }
              });
            }else{
              //. 新規登録
              var option = {
                url: matchbodb_url + '/api/db/quiz',
                method: 'POST',
                json: { id: id, data: JSON.stringify( quizs ), num: quizs.length, length: 0 },
                headers: { 'Accept': 'application/json' }
              };
              request( option, async ( err, res, body ) => {
                k ++;
                if( err ){
                  console.log( { err } );
                }else{
                  console.log( { body } );
                }

                if( k == 339 ){
                  resolve( cnt );
                }
              });
            }
          }else{
            k ++;
            if( k == 339 ){
              resolve( cnt );
            }
          }
        }
      }
    }
    //resolve( cnt );
  });
}

//. #49
async function generate_daily_quiz_49_1(){
  return new Promise( async function( resolve, reject ){
    var cs = [ '', '+', '-', '*', '/' ];
    var Ms = [ '0', '1', '1', '1', '1' ];
    var ms = [ '7', '0', '1', '1', '2' ];
    var Ds = [ '2', '1', '1', '2', '1' ];
    var ds = [ '7', '4', '5', '7', '6' ];
    var cnt = 0;
    var k = 0;
    for( var idx = 0; idx < 5; idx ++ ){
      var _M = Ms[idx];
      var _m = ms[idx];
      var _D = Ds[idx];
      var _d = ds[idx];

      var quizs = [];

      for( var i = 0; i < cs.length; i ++ ){
        for( var j = 0; j < cs.length; j ++ ){
          //. "M = m c D c d" 形式の問題を作成する(c : 演算記号)
          var quiz1 = _M + '=' + _m + cs[i] + _D + cs[j] + _d;

          if( matchbo.isValidQuiz( quiz1 ) ){  //. 出題としての Validation は別にするべき
            //. check
            var quiz_answers = matchbo.fullcheckFormula( quiz1 );

            if( quiz_answers.length > 0 ){
              var dif = matchbo.countDifficulty( quiz1, quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_MINUS_MULTI_DIVIDE );
              quizs.push( { formula: quiz1, num: dif } );
            }
          }

          //. "M c m c D = d" 形式の問題を作成する(c : 演算記号)
          var quiz2 = _M + cs[i] + _m + cs[j] + _D + '=' + _d;

          if( matchbo.isValidQuiz( quiz2 ) ){  //. 出題としての Validation は別にするべき
            //. check
            var quiz_answers = matchbo.fullcheckFormula( quiz2 );

            if( quiz_answers.length > 0 ){
              var dif = matchbo.countDifficulty( quiz2, quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_MINUS_MULTI_DIVIDE );
              quizs.push( { formula: quiz2, num: dif } );
            }
          }
        }
      }

      if( quizs.length > 0 ){
        cnt ++;
        var id = _M + _m + _D + _d + '-dailyquiz';
        //console.log( id, quizs );

        if( !no_updatedb ){
          var result_data = await getDataFromDB( id );
          if( result_data && result_data.length > 0 ){
            //. 更新登録
            var option = {
              url: matchbodb_url + '/api/db/quiz/' + id,
              method: 'PUT',
              json: { data: JSON.stringify( quizs ), num: quizs.length, length: 0 },
              headers: { 'Accept': 'application/json' }
            };
            request( option, async ( err, res, body ) => {
              k ++;
              if( err ){
                console.log( { err } );
              }else{
                console.log( { body } );
              }

              if( k == 5 ){
                resolve( cnt );
              }
            });
          }else{
            //. 新規登録
            var option = {
              url: matchbodb_url + '/api/db/quiz',
              method: 'POST',
              json: { id: id, data: JSON.stringify( quizs ), num: quizs.length, length: 0 },
              headers: { 'Accept': 'application/json' }
            };
            request( option, async ( err, res, body ) => {
              k ++;
              if( err ){
                console.log( { err } );
              }else{
                console.log( { body } );
              }

              if( k == 5 ){
                resolve( cnt );
              }
            });
          }
        }else{
          k ++;
          if( k == 5 ){
            resolve( cnt );
          }
        }
      }else{
        resolve( 0 );
      }
    }
    //resolve( cnt );
  });
}

//. この結果は「１つも見つからない」
async function generate_daily_quiz_49_2(){
  return new Promise( async function( resolve, reject ){
    var cs = [ '', '+', '-', '*', '/' ];
    var MDs = [ '0', '7', '2', '7' ];
    var cnt = 0;
    var k = 0;

    var _M = MDs[0];
    var _m = MDs[1];
    var _D = MDs[2];
    var _d = MDs[3];

    var quizs = [];

    for( var i = 0; i < cs.length; i ++ ){
      for( var j = 0; j < cs.length; j ++ ){
        //. "M c m = - D c d" 形式の問題を作成する(c : 演算記号)
        var quiz1 = _M + cs[i] + _m + '=-' + _D + cs[j] + _d;
        if( matchbo.isValidQuiz( quiz1 ) ){  //. 出題としての Validation は別にするべき
          //. check
          var quiz_answers = matchbo.fullcheckFormula( quiz1 );

          if( quiz_answers.length > 0 ){
            var dif = matchbo.countDifficulty( quiz1, quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_MINUS_MULTI_DIVIDE );
            quizs.push( { formula: quiz1, num: dif } );
          }
        }

        //. "M = - m c D c d" 形式の問題を作成する(c : 演算記号)
        var quiz2 = '-' + _M + '=-' + _m + cs[i] + _D + cs[j] + _d;
        if( matchbo.isValidQuiz( quiz2 ) ){  //. 出題としての Validation は別にするべき
          //. check
          var quiz_answers = matchbo.fullcheckFormula( quiz2 );

          if( quiz_answers.length > 0 ){
            var dif = matchbo.countDifficulty( quiz2, quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_MINUS_MULTI_DIVIDE );
            quizs.push( { formula: quiz2, num: dif } );
          }
        }

        //. "M c m c D = - d" 形式の問題を作成する(c : 演算記号)
        var quiz3 = _M + cs[i] + _m + cs[j] + _D + '=-' + _d;
        if( matchbo.isValidQuiz( quiz3 ) ){  //. 出題としての Validation は別にするべき
          //. check
          var quiz_answers = matchbo.fullcheckFormula( quiz3 );

          if( quiz_answers.length > 0 ){
            var dif = matchbo.countDifficulty( quiz3, quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_MINUS_MULTI_DIVIDE );
            quizs.push( { formula: quiz3, num: dif } );
          }
        }
      }

      if( quizs.length > 0 ){
        cnt ++;
        var id = _M + _m + _D + _d + '-dailyquiz';
        //console.log( id, quizs );

        if( !no_updatedb ){
          var result_data = await getDataFromDB( id );
          if( result_data && result_data.length > 0 ){
            //. 更新登録
            var option = {
              url: matchbodb_url + '/api/db/quiz/' + id,
              method: 'PUT',
              json: { data: JSON.stringify( quizs ), num: quizs.length, length: 0 },
              headers: { 'Accept': 'application/json' }
            };
            request( option, async ( err, res, body ) => {
              k ++;
              if( err ){
                console.log( { err } );
              }else{
                console.log( { body } );
              }

              if( k == 5 ){
                resolve( cnt );
              }
            });
          }else{
            //. 新規登録
            var option = {
              url: matchbodb_url + '/api/db/quiz',
              method: 'POST',
              json: { id: id, data: JSON.stringify( quizs ), num: quizs.length, length: 0 },
              headers: { 'Accept': 'application/json' }
            };
            request( option, async ( err, res, body ) => {
              k ++;
              if( err ){
                console.log( { err } );
              }else{
                console.log( { body } );
              }

              if( k == 5 ){
                resolve( cnt );
              }
            });
          }
        }else{
          k ++;
          if( k == 5 ){
            resolve( cnt );
          }
        }
      }else{
        resolve( 0 );
      }
    }
    //resolve( cnt );
  });
}

//. #54, #55
async function generate_quiz_from_nums( str_nums ){
  return new Promise( async function( resolve, reject ){
    var cs = [ '', '+', '-', '*', '/', '=' ];
    var answers = [];
    var quizs = [];

    //. 数字だけを取り出して配列化
    var nums = [];
    for( var i = 0; i < str_nums.length; i ++ ){
      try{
        nums.push( parseInt( str_nums.charAt( i ) ) );
      }catch( e ){
      }
    }

    var min_answers = 0;
    matchbo = new Matchbo( isvalid_doublezeros, isvalid_doublecalcs, isvalid_doubleequals, isvalid_onetoplus, isvalid_plustoone, isvalid_reverse, isvalid_plusminus, isvalid_fourtooneminusone, isvalid_fourtominusone );
    var computes = matchbo.recursive_generate_computes( [], cs, nums.length - 1, true );
    while( computes !== null ){
      var quiz = '';
      for( var i = 0; i < computes.length; i ++ ){
        quiz += nums[i];
        quiz += computes[i];
      }
      quiz += nums[nums.length-1];

      if( matchbo.isValidQuiz( quiz ) ){  //. 出題としての Validation
        var tmp = quiz.split( '=' );
        var formulas = [];
        formulas.push( tmp[0] + '=' + tmp[1] );
        formulas.push( '-' + tmp[0] + '=' + tmp[1] );
        formulas.push( tmp[0] + '=-' + tmp[1] );
        formulas.push( '-' + tmp[0] + '=-' + tmp[1] );

        //. check
        for( var i = 0; i < formulas.length; i ++ ){
          var quiz_answers = matchbo.fullcheckFormula( formulas[i] );
          if( quiz_answers.length > 0 ){
            if( min_answers == 0 || quiz_answers.length < min_answers ){
              min_answers = quiz_answers.length;
              answers = [ formulas[i] ];
            }else if( min_answers > 0 && quiz_answers.length == min_answers ){
              answers.push( formulas[i] );
            }
          }
        }

        for( var i = 0; i < answers.length; i ++ ){
          var quiz_answers = matchbo.fullcheckFormula( answers[i] );
          var dif = matchbo.countDifficulty( answers[i], quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_SPECIAL_CHECK, COUNT_MINUS_MULTI_DIVIDE );
          quizs.push( { formula: answers[i], num: dif } );
        }
      }

      computes = matchbo.recursive_generate_computes( computes, cs, nums.length - 1, false );
    }

    resolve( quizs );
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
    }else if( process.argv[2].length > 2 ){
      var str_nums = process.argv[2];
      generate_quiz_from_nums( str_nums ).then( function( quizs ){
        if( quizs.length > 0 ){
          quizs.sort( sortByNumRev );
          if( quizs.length > 10 ){
            quizs.splice( 10, quizs.length - 10 );
          }
          console.log( JSON.stringify( quizs, null, 2 ) );

          formula = quizs[0].formula;
          console.log( 'formula = ' + formula );
        }else{
          console.log( 'No formulas can be generated for "' + str_nums + '".' );
        }
      });
    }else if( n == -1 ){
      //. #49, #55
      var ts1 = ( new Date() ).getTime();
      generate_daily_quiz().then( function( count ){
        //console.log( 'count = ' + count );
        generate_daily_quiz_49_1().then( function( count ){
          //console.log( 'count = ' + count );
          //generate_daily_quiz_49_2().then( function( count ){} );
          var ts2 = ( new Date() ).getTime();
          var ts = Math.floor( ( ts2 - ts1 ) / 1000 );

          var ts_min = Math.floor( ts / 60 );
          var ts_sec = ( ts % 60 );

          console.log( ' ... ' + ts + ' sec (' + ts_min + ' min ' + ts_sec + ' sec)' );
        });
      });
    }else if( -2 >= n && n > -1 * quiz_pattern.length ){
      n *= -1;
      n = 5;  //. NCN=NCN
      //n = 3;  //. NCN=N
      var ts1 = ( new Date() ).getTime();
      no_updatedb = 1;  //. DB 更新はしない

      //. #48
      var default_COUNT_ELEVEN = COUNT_ELEVEN;
      var default_COUNT_VALID_MINUS = COUNT_VALID_MINUS;
      var default_COUNT_MULTI_EQUAL = COUNT_MULTI_EQUAL;
      var default_COUNT_MINUS_VALUE = COUNT_MINUS_VALUE;
      var default_COUNT_SPECIAL_CHECK = COUNT_SPECIAL_CHECK;

      var cnt = 0;
      for( var i = 0; i < 13; i ++ ){
        switch( i ){
        case 0:
          COUNT_ELEVEN = default_COUNT_ELEVEN;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK;
          break;
        case 1:
          COUNT_ELEVEN = default_COUNT_ELEVEN / 2;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK;
          break;
        case 2:
          COUNT_ELEVEN = default_COUNT_ELEVEN * 2;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK;
          break;
        case 3:
          COUNT_ELEVEN = default_COUNT_ELEVEN;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS / 2;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK;
          break;
        case 4:
          COUNT_ELEVEN = default_COUNT_ELEVEN;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS * 2;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK;
          break;
        case 5:
          COUNT_ELEVEN = default_COUNT_ELEVEN;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL / 2;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK;
          break;
        case 6:
          COUNT_ELEVEN = default_COUNT_ELEVEN;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL * 2;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK;
          break;
        case 7:
          COUNT_ELEVEN = default_COUNT_ELEVEN;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE / 2;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK;
          break;
        case 8:
          COUNT_ELEVEN = default_COUNT_ELEVEN;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE * 2;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK;
          break;
        case 9:
          COUNT_ELEVEN = default_COUNT_ELEVEN;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK / 2;
          break;
        case 10:
          COUNT_ELEVEN = default_COUNT_ELEVEN;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK * 2;
          break;
        case 11:
          COUNT_ELEVEN = default_COUNT_ELEVEN / 2;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS / 2;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL / 2;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE / 2;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK / 2;
          break;
        case 12:
          COUNT_ELEVEN = default_COUNT_ELEVEN * 2;
          COUNT_VALID_MINUS = default_COUNT_VALID_MINUS * 2;
          COUNT_MULTI_EQUAL = default_COUNT_MULTI_EQUAL * 2;
          COUNT_MINUS_VALUE = default_COUNT_MINUS_VALUE * 2;
          COUNT_SPECIAL_CHECK = default_COUNT_SPECIAL_CHECK * 2;
          break;
        }

        generate_quiz( n ).then( function( quizs ){
          var resultname = 'result-' + n + '-' + cnt;

          var result_d = { quizs: quizs.quizs_d, num: quizs.num_d, length: quizs.length_d };
          var result_v = { quizs: quizs.quizs_v, num: quizs.num_v, length: quizs.length_v };

          fs.writeFileSync( resultname + '-d.json', JSON.stringify( result_d, null, 2 ) );
          fs.writeFileSync( resultname + '-v.json', JSON.stringify( result_v, null, 2 ) );

          var ts2 = ( new Date() ).getTime();
          var ts = Math.floor( ( ts2 - ts1 ) / 1000 );

          var ts_min = Math.floor( ts / 60 );
          var ts_sec = ( ts % 60 );

          cnt ++;
          console.log( cnt + '/13 finished ... ' + ts + ' sec (' + ts_min + ' min ' + ts_sec + ' sec)' );
        });
      }

    }else{
      console.log( 'Usage: $ node generator [n]' );
      console.log( '  n : 0 <= n < ' + quiz_pattern.length );
      var ts1 = ( new Date() ).getTime();
    }
  }else{
    console.log( 'Usage: $ node generator [n]' );
    console.log( '  n : 0 <= n < ' + quiz_pattern.length );
  }
}catch( e ){
  console.log( e );
}
