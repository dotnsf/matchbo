/*
   -1-
  |   |
  8   32
  |   |
   -2-
  |   |
  16  64
  |   |
   -4-
*/
var match2num = [
  125,  //. 01111101
  80,   //. 01010000
  55,   //. 00110111
  103,  //. 01100111
  106,  //. 01101010
  79,   //. 01001111
  95,   //. 01011111
  105,  //. 01101001
  127,  //. 01111111
  111,  //. 01101111
  -1,   //.
  120   //. 01111000
];

var transitions = [
  //. [ 足してできる数, 引いてできる数, 置き換えてできる数 ]
  [ [ 8 ], [ ], [ 6, 9 ] ],
  [ [], [], [] ],
  [ [], [], [ 3 ] ],
  [ [ 9 ], [], [ 2, 5 ] ],
  [ [], [], [ 7, 11 ] ],
  [ [ 6, 9 ], [], [ 3 ] ],
  [ [ 8 ], [ 5 ], [ 0, 9 ] ],
  [ [], [], [ 4, 11 ] ],
  [ [], [ 0, 6, 9 ], [] ],
  [ [ 8 ], [ 3, 5 ], [ 0, 6 ] ],
  [ [], [], [] ],
  [ [], [], [ 4, 7 ] ]
];

$(function(){
  $('#input_form').submit( function( e ){
    e.preventDefault();

    $('#output_formula').val( '' );
    var formula = $('#input_formula').val();
    formula = formula.split(' ').join('');
    //alert( formula );

    var new_formula = checkFormula( formula, false );
    if( new_formula ){
      console.log( ' -> ' + new_formula );
      showAnswer( new_formula );
    }else{
      //. '1', '1' を '11' とみなせないか？
      if( formula.indexOf( '11' ) > -1 ){
        var new_formula = checkFormula( formula, true );
        if( new_formula ){
          showAnswer( new_formula );
        }
      }
    }
  });
});

function checkFormula( formula, eleven ){
  var r = null;

  if( formula ){
    //. 式を一文字ずつ、種類に分けて分解
    var matches = [];
    for( var i = 0; i < formula.length; i ++ ){
      var c = formula.charAt( i );
      if( ['+','-','*','/'].indexOf( c ) > -1 ){
        matches.push( { type: "calc", kind: c } );
      }else if( '0' <= c && c <= '9' ){
        if( eleven && c == '1' && i - 1 < formula.length && formula.charAt( i + 1 ) == '1' ){
          matches.push( { type: "num", kind: 11 } );
          i ++;
        }else{
          matches.push( { type: "num", kind: parseInt( c ) } );
        }
      }else{
        matches.push( { type: "else", kind: c } );
      }
    }

    //. 最初の１文字目から調べる
    var found = false;
    for( var i = 0; i < matches.length && !found; i ++ ){
      var m = matches[i];
      if( m.type == 'num' ){
        var transition = transitions[m.kind];

        //. 足してできる数
        for( var j = 0; j < transition[0].length && !found; j ++ ){
          //. 式の i 文字目を transitions[0][j] に置き換える
          for( var k = i + 1; k < matches.length && !found; k ++ ){
            if( i != k && matches[k].type == 'num' ){
              var t = transitions[matches[k].kind];
              for( var l = 0; l < t[1].length && !found; l ++ ){
                //. 代わりに式の k 文字目を t[1][l] に置き換える
                var new_formula = subString( formula, 0, i ) + transition[0][j] + subString( formula, i + 1, k ) + t[1][l] + subString( formula, k + 1 );
                found = isValidFormula( new_formula );
                if( found ){ r = new_formula; }
              }
            }
          }
        }

        //. 引いてできる数
        for( var j = 0; j < transition[1].length && !found; j ++ ){
          //. 式の i 文字目を translation[1][j] に置き換える
          for( var k = i + 1; k < matches.length && !found; k ++ ){
            if( i != k && matches[k].type == 'num' ){
              var t = transitions[matches[k].kind];
              for( var l = 0; l < t[0].length && !found; l ++ ){
                //. 代わりに式の k 文字目を t[0][l] に置き換える
                var new_formula = subString( formula, 0, i ) + transition[1][j] + subString( formula, i + 1, k ) + t[0][l] + subString( formula, k + 1 );
                found = isValidFormula( new_formula );
                if( found ){ r = new_formula; }
              }
            }
          }
        }

        //. 置き換えてできる数
        for( var j = 0; j < transition[2].length && !found; j ++ ){
          //. 式の i 文字目を translation[2][j] に置き換える
          var new_formula = subString( formula, 0, i ) + transition[2][j] + subString( formula, i + 1 );
          found = isValidFormula( new_formula );
          if( found ){ r = new_formula; }
        }
      }
    }
  }

  return r;
}

function isValidFormula( f ){
  var r = false;

  var tmp = f.split( '=' );
  if( tmp.length == 2 ){
    var v0 = eval( tmp[0] );
    var v1 = eval( tmp[1] );

    r = ( v0 == v1 );
    //console.log( f + ' -> ' + r );
  }

  return r;
}

function subString( arr, s, e ){
  var r = '';

  if( e ){
    if( arr.length > 0 && arr.length >= e && 0 <= s && s < e ){
      for( var i = s; i < e; i ++ ){
        r += arr[i];
      }
    }
  }else{
    if( arr.length > 0 && 0 <= s ){
      for( var i = s; i < arr.length; i ++ ){
        r += arr[i];
      }
    }
  }

  return r;
}

var b = true;
function moveArms(){
  b = !b;
  if( b ){
    $('#arm1').removeClass( 'hide' );
    $('#arm2').removeClass( 'hide' );
    $('#arm3').addClass( 'hide' );
    $('#arm4').addClass( 'hide' );
  }else{
    $('#arm1').addClass( 'hide' );
    $('#arm2').addClass( 'hide' );
    $('#arm3').removeClass( 'hide' );
    $('#arm4').removeClass( 'hide' );
  }
}

function showAnswer( answer ){
  var ii = setInterval( moveArms, 500 );
  setTimeout( function(){
    clearTimeout( ii );
    if( answer ){
      //alert( answer );
      $('#output_formula').val( answer );
    }else{
      //alert( '無理っす' );
      $('#output_formula').val( '無理っす' );
    }
  }, 2000 );  //. ここが実行されてから中が実行されるまでの間に output_formula が消える！？
}
