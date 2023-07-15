//. webui.js
var matchbo = null;

var matchbodb_url = "https://matchbodb.yellowmix.net";

//. #39
var COUNT_ELEVEN = 4;
var COUNT_VALID_MINUS = 5;
var COUNT_MULTI_EQUAL = 1;
var COUNT_MINUS_VALUE = 2;
var COUNT_SPECIAL_CHECK = 1;
var COUNT_CHANGED_ANSWER = 5;
var COUNT_MINUS_MULTI_ANSWERS = 5;
var COUNT_MINUS_MULTI_DIVIDE = 2;
var COUNT_8x0 = 10;  //. #75

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
var delta_function = getParam( 'delta' );

//. #74
var date_param = getParam( 'date' );

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
  //. #81
  drawRules();

  //. #69
  getGeneratedFormula( date_param );

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

  if( !delta_function ){
    $('#options_div_delta').addClass( 'display_none' );
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

  $('#select_function').change( function(){
    var v = $('#select_function').val();
    if( v == 'generate_formula_from_nums' ){
      $('#answer_formula').val( '' );
      $('#answer_formula').prop( 'placeholder', '問題を作る時に使う数字（最大４桁、例 1234）' );
    }else if( v == 'counter_generated_quizs' ){
      $('#answer_formula').val( '' );
      $('#answer_formula').prop( 'placeholder', '正解の式（例 6-8=1-3）' );
    }
  });

  $('#answer_formula').on( 'keyup', function(){
    var v0 = $('#select_function').val();
    if( v0 == 'generate_formula_from_nums' ){
      var v = $('#answer_formula').val();
      if( v.length > 4 ){
        $('#answer_formula').val( v.substr( 0, 4 ) );
      }
    }
  });

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

      //. #60
      var dt = new Date();
      var m = dt.getMonth() + 1;
      var d = dt.getDate();
      var mmdd = ( m < 10 ? '0' : '' ) + m + '/' + ( d < 10 ? '0' : '' ) + d;
      $('#quiz_pattern').append( '<option value="-1">「今日の日付」(' + mmdd + ')の問題</option>' );

      $('#quiz_pattern').change( function( e ){
        var v = parseInt( $('#quiz_pattern').val() );
        if( v == -1 ){
          $('#quiz_priority').css( 'display', 'none' );
        }else{
          $('#quiz_priority').css( 'display', 'block' );
        }
      });
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
      if( counts.COUNT_CHANGED_ANSWER ){
        COUNT_CHANGED_ANSWER = counts.COUNT_CHANGED_ANSWER;
      }
      if( counts.COUNT_MINUS_MULTI_ANSWERS ){
        COUNT_MINUS_MULTI_ANSWERS = counts.COUNT_MINUS_MULTI_ANSWERS;
      }
      if( counts.COUNT_MINUS_MULTI_DIVIDE ){
        COUNT_MINUS_MULTI_DIVIDE = counts.COUNT_MINUS_MULTI_DIVIDE;
      }
    },
    error: function( e0, e1, e2 ){
      console.log( e0, e1, e2 );
    }
  });

  //. #79
  $('#hint_button').click( function(){
    var formula = $('#input_formula').val();
    formula = formula.split(' ').join('');
    matchbo = new Matchbo( isvalid_doublezeros, isvalid_doublecalcs, isvalid_doubleequals, isvalid_onetoplus, isvalid_plustoone, isvalid_reverse, isvalid_plusminus, isvalid_fourtooneminusone, isvalid_fourtominusone );
    var answers = matchbo.fullcheckFormula( formula );
    //console.log( {answers} );  //. [ { formula: 'xxxx=yyyy', .. }, .. ]
    
    var len = answers.length;
    if( len > 0 ){
      var hint1 = 'ヒント１: ' 
        + ( len == 1 ? '答は１通りしかありません。' : '答は ' + len + ' 通りあります。' )
        + '　次のヒントを開きますか？';
      if( confirm( hint1 ) ){
        var hint2 = 'ヒント２: ';
        if( len == 1 ){
          var position = answers[0].position;
          var c = formula.charAt( position );
          hint2 += '左から' + ( position + 1 ) + '番目の「' + c + '」から１本取ります。';
        }else{
          var tmp2 = [];
          for( var i = 0; i < len; i ++ ){
            var position = answers[i].position;
            var c = formula.charAt( position );
            tmp2.push( ( position + 1 ) + '番目の「' + c + '」' );
          }
          hint2 += '左から' + tmp2.join( '、又は' ) + 'から１本取ります。';
        }
        hint2 += '　最終ヒントを開きますか？';
        if( confirm( hint2 ) ){
          var hint3 = '最終ヒント: ';
          var values = [];
          for( var i = 0; i < len; i ++ ){
            var f = answers[i].formula;
            var tmp = f.split( '=' );
            var v = eval( tmp[0] );
            values.push( v );
          }

          if( len == 1 ){
            hint3 += '正しい式の値は ' + values[0] + ' です。';
          }else{
            hint3 += '正しい式の値はそれぞれ ' + values.join( '、' ) + ' です。';
          }
          alert( hint3 );
        }
      }
    }else{
      alert( 'マッチ棒１本だけ動かして成立する答は存在していません。' );
    }

    return false;
  });

  $('#input_formula').focus();
});


function GenerateQuizs(){
  var v = $('#select_function').val();
  if( v == 'generate_formula_from_nums' ){
    generateFormulaFromNums();
  }else if( v == 'counter_generated_quizs' ){
    counterGenerateQuizs();
  }
}

//. #44
function getGeneratedFormula( date_param ){
  //. #37
	var obj = getBusyOverlay( 'viewport', { color: 'black', opacity: 0.5, text: 'ロード中', style: 'text-decoration:blink; font-weight: bold; font-size: 12px; color: white;' } );
  $.ajax({
    //. #70
    //url: matchbodb_url + '/api/db/generated',
    url: './generated.json',
    type: 'GET',
    success: function( result ){
			obj.remove();
			obj = null;
      //console.log({result});
      if( result && result.status ){
        var formula_list = result.results;

        var dt = new Date();
        if( date_param && isValidDate( date_param ) ){
          //. #74
          dt = new Date( date_param + ' 00:00:00' );
        }else{
          var y = dt.getFullYear();
          var m = dt.getMonth() + 1;
          m = ( ( m < 10 ) ? '0' : '' ) + m;
          var d = dt.getDate();
          d = ( ( d < 10 ) ? '0' : '' ) + d;
          dt = new Date( y + '-' + m + '-' + d + ' 00:00:00' );
        }

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

//. #74
function isValidDate( str ){
  var r = false;
  if( str.length == 10 ){
    var b = true;
    for( var i = 0; i < str.length && b; i ++ ){
      var c = str.charAt( i );
      switch( i ){
      case 0:
      case 1:
      case 2:
      case 3:
      case 6:
      case 9:
        b = ( '0' <= c && c <= '9' );
        break;
      case 4:
      case 7:
        b = ( '-' == c );
        break;
      case 5:
        b = ( '0' <= c && c <= '1' );
        break;
      case 8:
        b = ( '0' <= c && c <= '3' );
        break;
      }
    }
    r = b;
  }

  return r;
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
        var quizs = JSON.parse( result.result.data );
        if( quizs && quizs.length ){
          //. 候補の中で最も難易度の高いもの
          quizs.sort( sortByNumRev );

          //. #60
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

//. #54
function generateFormulaFromNums(){
  var str_nums = $('#answer_formula').val();
  if( str_nums ){
    $('#input_formula').val( '' );
    $('#counter_generated_quizs').html( '<option value="">（１つ選択してください）</option>' );

    generate_quiz_from_nums( str_nums ).then( function( quizs ){
      if( quizs.length > 0 ){
        quizs.sort( sortByNumRev );

        for( var i = 0; i < quizs.length; i ++ ){
          var o = '<option value="' + quizs[i].formula + '">' + quizs[i].formula + '</option>';
          $('#counter_generated_quizs').append( o );
        }
    
        $('#counter_generated_quizs').change( function(){
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

        $('#counter_generated_quizs').css( 'display', 'block' );
      }else{
        console.log( 'No formulas can be generated for "' + str_nums + '".' );
      }
    });

  }
}

//. #62
async function counterGenerateQuizs(){
  var answer_formula = $('#answer_formula').val();
  if( answer_formula ){
    $('#input_formula').val( '' );
    $('#counter_generated_quizs').html( '<option value="">（１つ選択してください）</option>' );

    var quizs = await counter_generate_quizs( answer_formula );
    for( var i = 0; i < quizs.length; i ++ ){
      var o = '<option value="' + quizs[i].formula + '">' + quizs[i].formula + '</option>';
      $('#counter_generated_quizs').append( o );
    }
    
    $('#counter_generated_quizs').change( function(){
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

    $('#counter_generated_quizs').css( 'display', 'block' );
  }
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
      answers[i].difficulty = matchbo.countDifficulty( formula, [ answer ], COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_SPECIAL_CHECK, COUNT_CHANGED_ANSWER, COUNT_MINUS_MULTI_ANSWERS, COUNT_MINUS_MULTI_DIVIDE, COUNT_8x0 );
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
    
    if( idx == -1 ){
      getTodaysFormula();
    }else{
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

//. #54
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
      }

      computes = matchbo.recursive_generate_computes( computes, cs, nums.length - 1, false );
    }

    for( var i = 0; i < answers.length; i ++ ){
      var quiz_answers = matchbo.fullcheckFormula( answers[i] );
      var dif = matchbo.countDifficulty( answers[i], quiz_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_SPECIAL_CHECK, COUNT_CHANGED_ANSWER, COUNT_MINUS_MULTI_ANSWERS, COUNT_MINUS_MULTI_DIVIDE, COUNT_8x0 );
      quizs.push( { formula: answers[i], num: dif } );
    }

    resolve( quizs );
  });
}

//. #62
async function counter_generate_quizs( answer_formula ){
  return new Promise( async function( resolve, reject ){
    var quizs = [];
    matchbo = new Matchbo( isvalid_doublezeros, isvalid_doublecalcs, isvalid_doubleequals, isvalid_onetoplus, isvalid_plustoone, isvalid_reverse, isvalid_plusminus, isvalid_fourtooneminusone, isvalid_fourtominusone );

    //. 最初に解が１つだけの場合で検索し、１つも見つからなければ複数回を認める
    var tf = [ true, false ];
    for( var idx = 0; idx < 2 && quizs.length == 0; idx ++ ){
      //. quizs に問題文を全て代入する
      var _quizs = matchbo.fullcheckQuizs( answer_formula, tf[idx] );
    
      //. この時点では難易度や回答数が考慮されていない順に並んでいる
      for( var i = 0; i < _quizs.length; i ++ ){
        if( _quizs[i].formula.split( '=' ).length > 1 ){
          var answers = matchbo.fullcheckFormula( _quizs[i].formula );
          if( answers && answers.length > 0 ){
            var dif = matchbo.countDifficulty( _quizs[i].formula, answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_SPECIAL_CHECK, COUNT_CHANGED_ANSWER, COUNT_MINUS_MULTI_ANSWERS, COUNT_MINUS_MULTI_DIVIDE, COUNT_8x0 );
      
            _quizs[i].num = answers.length;
            _quizs[i].dif = dif;
            quizs.push( _quizs[i] );
          }
        }
      }
    }

    //. 難易度高い順 -> 回答数少ない順　でソート
    if( quizs.length > 0 ){
      quizs.sort( sortByDifficultyRev );
      quizs.sort( sortByNum );
    }

    resolve( quizs );
  });
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

function sortByDifficultyRev( a, b ){
  var r = 0;
  if( a.difficulty < b.difficulty ){
    r = 1;
  }else if( a.difficulty > b.difficulty ){
    r = -1;
  }

  return r;
}

function sortByNum( a, b ){
  var r = 0;
  if( a.num < b.num ){
    r = -1;
  }else if( a.num > b.num ){
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

//. #81
function drawRules(){
  var text = 'マッチ棒を１本だけ動かして、式を成立させてください<br/>ただし使える数字および記号は以下のものだけとします<br/>';
  for( var i = 0; i < 18; i ++ ){
    if( i != 10 && i != 11 && i != 17 ){
      var img = '<img src="./imgs/' + i + '.png" height="50"/>';
      if( i == 9 ){ img += '<br/>'; }
      text += img;
    }
  }
  $('#rules-div').html( text );
};

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
