//. dchecker.js(#65)
var fs = require( 'fs' );
var Matchbo = require( './docs/matchbo' );

require( 'dotenv' ).config();

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
var counts = JSON.parse( fs.readFileSync( './docs/counts.json', 'utf8' ) );

//. #39
var COUNT_ELEVEN = 'COUNT_ELEVEN' in process.env ? parseInt( process.env.COUNT_ELEVEN ) : counts.COUNT_ELEVEN;
var COUNT_VALID_MINUS = 'COUNT_VALID_MINUS' in process.env ? parseInt( process.env.COUNT_VALID_MINUS ) : counts.COUNT_VALID_MINUS;
var COUNT_MULTI_EQUAL = 'COUNT_MULTI_EQUAL' in process.env ? parseInt( process.env.COUNT_MULTI_EQUAL ) : counts.COUNT_MULTI_EQUAL;
var COUNT_MINUS_VALUE = 'COUNT_MINUS_VALUE' in process.env ? parseInt( process.env.COUNT_MINUS_VALUE ) : counts.COUNT_MINUS_VALUE;  //. #43
var COUNT_SPECIAL_CHECK = 'COUNT_SPECIAL_CHECK' in process.env ? parseInt( process.env.COUNT_SPECIAL_CHECK ) : counts.COUNT_SPECIAL_CHECK;  //. #46
var COUNT_CHANGED_ANSWER = 'COUNT_CHANGED_ANSWER' in process.env ? parseInt( process.env.COUNT_CHANGED_ANSWER ) : counts.COUNT_CHANGED_ANSWER;  //. #57
var COUNT_MINUS_MULTI_ANSWERS = 'COUNT_MINUS_MULTI_ANSWERS' in process.env ? parseInt( process.env.COUNT_MINUS_MULTI_ANSWERS ) : counts.COUNT_MINUS_MULTI_ANSWERS;  //. #58
var COUNT_MINUS_MULTI_DIVIDE = 'COUNT_MINUS_MULTI_DIVIDE' in process.env ? parseInt( process.env.COUNT_MINUS_MULTI_DIVIDE ) : counts.COUNT_MINUS_MULTI_DIVIDE;  //. #56

var matchbo = new Matchbo( isvalid_doublezeros, isvalid_doublecalcs, isvalid_doubleequals, isvalid_onetoplus, isvalid_plustoone, isvalid_reverse, isvalid_plusminus, isvalid_fourtooneminusone, isvalid_fourtominusone );

function sortByDif( a, b ){
  var r = 0;
  if( a.dif < b.dif ){
    r = -1;
  }else if( a.dif > b.dif ){
    r = 1;
  }

  return r;
}

function dif_check( quiz ){
  var dif = -1;
  if( quiz ){
    if( matchbo.isValidQuiz( quiz ) ){
      //. check
      var quiz_answers = matchbo.fullcheckFormula( quiz );

      //. 重複排除
      quiz_answers = Array.from(
        new Map( quiz_answers.map( ( q ) => [ q.quiz, q ] ) ).values()
      );

      //. difficulty
      if( quiz_answers.length == 1 ){
        dif = matchbo.countDifficulty( quiz, quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_SPECIAL_CHECK, COUNT_CHANGED_ANSWER, COUNT_MINUS_MULTI_ANSWERS, COUNT_MINUS_MULTI_DIVIDE );
      }else{
      }
    }
  }

  return dif;
}


function show_usage(){
  console.log( 'Usage: $ node dcheck quiz0( quiz1 quiz2 .. )' );
  console.log( '  - quiz0 = "quiz formula"' );
}


try{
  var q = [];
  if( process.argv.length > 2 ){
    for( var i = 2; i < process.argv.length; i ++ ){
      var quiz = process.argv[i];
      var dif = dif_check( quiz );

      q.push( { quiz: quiz, dif: dif } );
    }
  }else{
    var dchecklist = JSON.parse( fs.readFileSync( './dchecklist.json', 'utf8' ) );
    for( var i = 0; i < dchecklist.length; i ++ ){
      var quiz = dchecklist[i];
      var dif = dif_check( quiz );

      q.push( { quiz: quiz, dif: dif } );
    }
  }

  q.sort( sortByDif );

  for( var i = 0; i < q.length; i ++ ){
    console.log( q[i] );
  }
}catch( e ){
  console.log( e );
}
