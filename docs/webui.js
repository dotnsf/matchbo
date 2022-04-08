//. webui.js
var matchbo = null;

var matchbodb_url = "https://matchbodb.herokuapp.com";

//. #39
var COUNT_ELEVEN = 2;
var COUNT_VALID_MINUS = 100;
var COUNT_MULTI_EQUAL = 100;
var COUNT_MINUS_VALUE = 50;  //. #43
var COUNT_SPECIAL_CHECK = 50;  //. #46

function getParam( name, url ){
  if( !url ) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if( !results ) return null;
  if( !results[2] ) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var alpha_function = getParam( 'alpha' );
var beta_function = getParam( 'beta' );
var gamma_function = getParam( 'gamma' );

var _matchbodb_url = getParam( 'matchbodb_url' );
if( _matchbodb_url ){
  matchbodb_url = _matchbodb_url;
}
while( matchbodb_url.endsWith( '/' ) ){
  matchbodb_url = matchbodb_url.substr( 0, matchbodb_url.length - 1 );
}

var formula = getParam( 'formula' );
if( formula && formula.indexOf( ' ' ) > -1 ){
  formula = formula.split( ' ' ).join( '+' );
}

var isvalid_doublezeros = true;
var isvalid_doublecalcs = false;
var isvalid_doubleequals = true;
var isvalid_onetoplus = false;
var isvalid_plustoone = false;
var isvalid_reverse = false;
var isvalid_plusminus = false;
var isvalid_fourtooneminusone = false;
var isvalid_fourtominusone = false;

var quiz_pattern = [];

$(function(){
  if( !alpha_function ){
    $('#options_div_alpha').addClass( 'display_none' );
  }else{
    //. #26
    $.ajax({
      url: matchbodb_url + '/',
      type: 'GET',
      success: function( result ){},
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
      }
    });
  }

  if( !beta_function ){
    $('#options_div_beta').addClass( 'display_none' );
  }

  if( !gamma_function ){
    $('#options_div_gamma').addClass( 'display_none' );
  }else{
    $.ajax({
      url: matchbodb_url + '/',
      type: 'GET',
      success: function( result ){},
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
      }
    });
  }

  if( formula ){
    $('#input_formula').val( formula );
    onKeyup( 'input' );
  }

  $('#doublezeros_check').change( function(){
    isvalid_doublezeros = $('#doublezeros_check').prop( 'checked' );
  });
  $('#doublecalcs_check').change( function(){
    isvalid_doublecalcs = $('#doublecalcs_check').prop( 'checked' );
  });
  $('#doubleequals_check').change( function(){
    isvalid_doubleequals = $('#doubleequals_check').prop( 'checked' );
  });
  $('#onetoplus_check').change( function(){
    isvalid_onetoplus = $('#onetoplus_check').prop( 'checked' );
  });
  $('#plustoone_check').change( function(){
    isvalid_plustoone = $('#plustoone_check').prop( 'checked' );
  });
  $('#reverse_check').change( function(){
    isvalid_reverse = $('#reverse_check').prop( 'checked' );
  });
  $('#plusminus_check').change( function(){
    isvalid_plusminus = $('#plusminus_check').prop( 'checked' );
  });
  $('#fourtooneminusone_check').change( function(){
    isvalid_fourtooneminusone = $('#fourtooneminusone_check').prop( 'checked' );
  });
  $('#fourtominusone_check').change( function(){
    isvalid_fourtominusone = $('#fourtominusone_check').prop( 'checked' );
  });


  $('#input_form').submit( function( e ){
    e.preventDefault();

    var formula = $('#input_formula').val();
    formula = formula.split(' ').join('');

    matchbo = new Matchbo( isvalid_doublezeros, isvalid_doublecalcs, isvalid_doubleequals, isvalid_onetoplus, isvalid_plustoone, isvalid_reverse, isvalid_plusminus, isvalid_fourtooneminusone, isvalid_fourtominusone );

    $('#answers_list').html( '' );
    $('#output_formula').val( '' );
    var answers = matchbo.fullcheckFormula( formula );
    showAnswers( answers, formula );

    return false;
  });

  $('#input_formula').on( 'keyup', function(){
    onKeyup( 'input' );
  });
  onKeyup( 'input' );

  //. #17
  $('#quiz_pattern').html( '' );
  var pattern_labels = {
    'N': '数',
    'C': '記',
    'E': '＝'
  };

  $.ajax({
    type: 'GET',
    url: './quiz_pattern.json',
    success: function( r ){
      quiz_pattern = JSON.parse( JSON.stringify( r ) );
      for( var i = 0; i < quiz_pattern.length; i ++ ){
        var pattern = quiz_pattern[i];
        var v = '';
        for( var j = 0; j < pattern.length; j ++ ){
          v += pattern_labels[pattern[j]];
        }
        var option = '<option value="' + i + '">' + v + '</option>';
        $('#quiz_pattern').append( option );
      }
    },
    error: function( e0, e1, e2 ){
      console.log( e0, e1, e2 );
    }
  });

  //. #47
  $.ajax({
    type: 'GET',
    url: './counts.json',
    success: function( r ){
      var counts = JSON.parse( JSON.stringify( r ) );
      if( counts.COUNT_ELEVEN ){
        COUNT_ELEVEN = counts.COUNT_ELEVEN;
      }
      if( counts.COUNT_VALID_MINUS ){
        COUNT_VALID_MINUS = counts.COUNT_VALID_MINUS;
      }
      if( counts.COUNT_MULTI_EQUAL ){
        COUNT_MULTI_EQUAL = counts.COUNT_MULTI_EQUAL;
      }
      if( counts.COUNT_MINUS_VALUE ){
        COUNT_MINUS_VALUE = counts.COUNT_MINUS_VALUE;
      }
      if( counts.COUNT_SPECIAL_CHECK ){
        COUNT_SPECIAL_CHECK = counts.COUNT_SPECIAL_CHECK;
      }
    },
    error: function( e0, e1, e2 ){
      console.log( e0, e1, e2 );
    }
  });


  $('#input_formula').focus();
});

//. #44
function getGeneratedFormula(){
  //. #37
	var obj = getBusyOverlay( 'viewport', { color: 'black', opacity: 0.5, text: 'ロード中', style: 'text-decoration:blink; font-weight: bold; font-size: 12px; color: white;' } );
  $.ajax({
    url: matchbodb_url + '/api/db/generated',
    type: 'GET',
    success: function( result ){
			obj.remove();
			obj = null;
      if( result && result.status ){
        var formula_list = result.results;

        var dt = new Date();
        var y = dt.getFullYear();
        var m = dt.getMonth() + 1;
        m = ( ( m < 10 ) ? '0' : '' ) + m;
        var d = dt.getDate();
        d = ( ( d < 10 ) ? '0' : '' ) + d;
        dt = new Date( y + '-' + m + '-' + d + ' 00:00:00' );

        var seed = dt.getTime();
        var random = new Random( seed );
        var value = random.nextInt( 0, formula_list.length );

        formula = formula_list[value].formula;
        $('#input_formula').val( formula );
        onKeyup( 'input' );
      }
    },
    error: function( e0, e1, e2 ){
			obj.remove();
			obj = null;
      console.log( e0, e1, e2 );
    }
  });
}

//. #49
function getTodaysFormula(){
  var dt = new Date();
  var m = dt.getMonth() + 1;
  var d = dt.getDate();
  var mmdd = ( m < 10 ? '0' : '' ) + m + ( d < 10 ? '0' : '' ) + d;
  var id = mmdd + '-dailyquiz';

	var obj = getBusyOverlay( 'viewport', { color: 'black', opacity: 0.5, text: 'ロード中', style: 'text-decoration:blink; font-weight: bold; font-size: 12px; color: white;' } );
  $.ajax({
    url: matchbodb_url + '/api/db/quiz/' + id,
    type: 'GET',
    success: function( result ){
			obj.remove();
			obj = null;
      if( result && result.status ){
        var data = JSON.parse( result.result.data );
        if( data && data.length ){
          //. 候補の中で最も難易度の高いもの
          data.sort( sortByNumRev );
          console.log( data );
          formula = data[0].formula;

          $('#input_formula').val( formula );
          onKeyup( 'input' );
        }
      }
    },
    error: function( e0, e1, e2 ){
			obj.remove();
			obj = null;
      console.log( e0, e1, e2 );
    }
  });
}

function onKeyup( x ){
  var formula = $('#' + x + '_formula').val();
  formula = formula.split(' ').join('');
  if( formula ){
    var imgs = formula2imgs( formula );
    if( imgs ){
      $('#' + x + '_imgs').html( imgs );
    }
  }
}

function showAnswers( answers, formula ){
  answers = unique( answers );
  if( answers && answers.length > 0 ){
    $('#answers_list').append( '<ol id="answers_list_ol"></ol>' );

    //. #19 難易度順に（易しい順に）ソート
    for( var i = 0; i < answers.length; i ++ ){
      var answer = answers[i];
      var answer_formula = answer.formula;
      //. この結果が返ってこない？？
      //answers[i].difficulty = countDifficulties( formula, answer_formula );  //. #19
      answers[i].difficulty = matchbo.countDifficulty( formula, [ answer ], COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_SPECIAL_CHECK );
    }
    answers.sort( sortByDifficulty );

    for( var i = 0; i < answers.length; i ++ ){
      var answer = answers[i];
      var answer_formula = answer.formula;
      var difficulty = answer.difficulty;  //. #19

      var answer_rev = answer.rev;

      var img = ( answer_rev ? formula2imgs_rev( answer_formula ) : formula2imgs( answer_formula ) );
      var li = '<li>'
        + ( answer_rev ? '（逆さに見る）' : '' )
        + '<form><input type="text" class="blue" id="output_formula_' + i + '" value="' + answer_formula + '" readonly/></form>' 
        + '<span id="output_imgs_' + i + '" title="' + difficulty + '">' + img + '</span>'  //. #19
        + '</li>';
      $('#answers_list_ol').append( li );
    }
  }else{
    var ul = '<ul><li>無理っす</li><ul>';
    $('#answers_list').append( ul );
    //$('#output_formula').val( '無理っす' );
    //$('#output_imgs').html( '' );
  }
}

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

//. #18
function countDifficulties( f_question, f_answer ){
  var parts_question = this.divideParts( f_question );
  var parts_answer = this.divideParts( f_answer );

  var cnt = Math.abs( parts_question.length - parts_answer.length );

  for( var i = 0, j = 0; i < parts_question.length && j < parts_answer.length; i ++, j ++ ){
    if( parts_question[i] != parts_answer[j] ){
      cnt ++;
      if( parts_question.length <= parts_answer.length ){
        i --;
      }else{
        j --;
      }
    }
  }

  return cnt;
}

function divideParts( f ){
  var parts = [];

  for( var i = 0; i < f.length; i ++ ){
    var c = f.charAt( i );
    if( '0' <= c && c <= '9' ){
      parts.push( 'N' );
    }else{
      parts.push( 'C' );
    }
  }

  return parts;
}

function formula2imgs( formula ){
  var imgs = '';
  
  if( formula ){
    for( var i = 0; i < formula.length; i ++ ){
      var c = formula.charAt( i );
      var idx = -1;
      if( ['+','-','*','/','=','±'].indexOf( c ) > -1 ){
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
        case '±':
          idx = 17;
          break;
        }
      }else{
        try{
          idx = parseInt( c );
        }catch( e ){
        }
      }

      if( idx > -1 ){
        var img = '<img src="./imgs/' + idx + '.png"/>';
        imgs += img;
      }
    }
  }

  return imgs;
}

function formula2imgs_rev( formula ){
  var imgs = '';
  
  if( formula ){
    for( var i = formula.length - 1; i >= 0; i -- ){
      var c = formula.charAt( i );
      var idx = -1;
      if( ['+','-','*','/','='].indexOf( c ) > -1 ){
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
      }else{
        try{
          idx = parseInt( c );
        }catch( e ){
        }
      }

      if( idx > -1 ){
        var img = '<img src="./imgs/' + idx + '.png" class="rev_img"/>';
        imgs += img;
      }
    }
  }

  return imgs;
}

async function getDataFromDB( id ){
  return new Promise( function( resolve, reject ){
    $.ajax({
      url: matchbodb_url + '/api/db/quiz/' + id,
      type: 'GET',
      success: function( result ){
        if( result && result.status && result.result && result.result.data ){
          resolve( JSON.parse( result.result.data ) );
        }else{
          resolve( [] );
        }
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
        resolve( [] );
      }
    });
  });
}

async function generate_quiz( idx ){
  return new Promise( async function( resolve, reject ){
    var quizs = [];
    var max_num = 0;
    var pattern = quiz_pattern[idx];
    var cnt = 0;

    var priority = $('#quiz_priority').val();
    $('#generated_quizs').css( 'display', 'none' );

    var pattern_str = pattern.join( '' );
    var result_data = await getDataFromDB( pattern_str + '-' + priority );

    if( result_data && result_data.length > 0 ){
      quizs = result_data;
    }else{
      /*
      var quiz = recursive_generate_quiz( '', pattern, true );
      while( quiz !== null ){
        if( isValidQuiz( quiz ) ){  //. 出題としての Validation は別にするべき
          cnt ++;
  
          //. check
          var quiz_answers = fullcheckFormula( quiz );
          if( priority == 'difficulty' ){
            if( quiz_answers.length == 1 ){
              for( var i = 0; i < quiz_answers.length; i ++ ){
                var answer = quiz_answers[i];
                var dif = countDifficulties( quiz, answer );
                //console.log( cnt, quiz, answer.formula, dif );
                if( dif > max_num ){
                  max_num = dif;
                  quizs = [ quiz ];
                }else if( dif == max_num ){
                  quizs.push( quiz );
                }
              }
            }
          }else if( priority == 'variety' ){
            if( quiz_answers.length > max_num ){
              max_num = quiz_answers.length;
              quizs = [ quiz ];
            }else if( quiz_answers.length == max_num ){
              quizs.push( quiz );
            }
          }
        }

        quiz = recursive_generate_quiz( quiz, pattern, false );
      }

      //. 登録
      console.log( '#quizs = ' + quizs.length );
      $.ajax({
        url: matchbodb_url + '/api/db/quiz',
        type: 'POST',
        data: { id: pattern_str + '-' + priority, data: JSON.stringify( quizs ) },
        success: function( result ){
          console.log( { result } );
        },
        error: function( e0, e1, e2 ){
          console.log( e0, e1, e2 );
        }
      });
      */
    }

    $('#generated_quizs').css( 'display', 'block' );
    if( quizs.length > 0 ){
      $('#generated_quizs').html( '<option value="">（１つ選択してください）</option>' );

      for( var i = 0; i < quizs.length; i ++ ){
        var o = '<option value="' + quizs[i].formula + '">' + quizs[i].formula + '</option>';
        $('#generated_quizs').append( o );
      }
      $('#generated_quizs').change( function(){
        var selected_quiz = $(this).val();
        if( selected_quiz ){
          $('#input_formula').val( selected_quiz );
          var imgs = formula2imgs( selected_quiz );
          if( imgs ){
            $('#input_imgs').html( imgs );
          }
  
          //. #25
          $('#answers_list').html( '' );
        }
      });
    }else{
      $('#generated_quizs').html( '<option value="">（このタイプの出題はまだ用意できていません）</option>' );
    }

    resolve( true );
  });
}

function generate_quiz_btn(){
  var v = $('#quiz_pattern').val();
  if( v ){
    v = parseInt( v );
    generate_quiz( v );
  }
}

function sortByDifficulty( a, b ){
  var r = 0;
  if( a.difficulty < b.difficulty ){
    r = -1;
  }else if( a.difficulty > b.difficulty ){
    r = 1;
  }

  return r;
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

//. #37 : https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
class Random {
  constructor(seed = 19681106) {
    this.x = 31415926535;
    this.y = 8979323846;
    this.z = 2643383279;
    this.w = seed;
  }
  
  // XorShift
  next() {
    let t;
 
    t = this.x ^ (this.x << 11);
    this.x = this.y; this.y = this.z; this.z = this.w;
    return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)); 
  }
  
  // min以上max以下の乱数を生成する
  nextInt(min, max) {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }
}
