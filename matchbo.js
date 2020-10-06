
var transitions = [
  //. [ 足してできる数, 引いてできる数, 置き換えてできる数 ]
  [ [ 8 ], [ ], [ 6, 9 ] ],         //. 0
  [ [], [], [] ],                   //. 1
  [ [], [], [ 3 ] ],                //. 2
  [ [ 9 ], [], [ 2, 5 ] ],          //. 3
  [ [], [], [ 7, 11 ] ],            //. 4
  [ [ 6, 9 ], [], [ 3 ] ],          //. 5
  [ [ 8 ], [ 5 ], [ 0, 9 ] ],       //. 6
  [ [], [], [ 4, 11 ] ],            //. 7
  [ [], [ 0, 6, 9 ], [] ],          //. 8
  [ [ 8 ], [ 3, 5 ], [ 0, 6 ] ],    //. 9
  [ [], [], [] ],                   //. 10
  [ [], [], [ 4, 7 ] ],             //. 11
  [ [], [ '-' ], [ '=' ] ],         //. +
  [ [ '+', '=' ], [], [] ],         //. -
  [ [], [], [] ],                   //. *
  [ [], [], [] ],                   //. /
  [ [], [ '-' ], [ '+' ] ]          //. =
];

$(function(){
  $('#input_form').submit( function( e ){
    e.preventDefault();

    $('#output_formula').val( '' );
    var formula = $('#input_formula').val();
    formula = formula.split(' ').join('');

    var new_formula = checkFormula( formula, false );
    showAnswer( new_formula );
    if( !new_formula ){
      //. '1', '1' を '11' とみなせないか？
      if( formula.indexOf( '11' ) > -1 ){
        var new_formula = checkFormula( formula, true );
        if( new_formula ){
          showAnswer( new_formula );
        }
      }

      //. #2 対応
      if( formula.indexOf( '-' ) > -1 ){
        var new_formula = checkFormulaFor2( formula, false );
        if( new_formula ){
          showAnswer( new_formula );
        }

        if( formula.indexOf( '11' ) > -1 ){
          var new_formula = checkFormulaFor2( formula, true );
          if( new_formula ){
            showAnswer( new_formula );
          }
        }
      }
    }
  });

  $('#input_formula').on( 'keyup', function(){
    onKeyup( 'input' );
  });
  onKeyup( 'input' );

  $('#input_formula').focus();
});

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

function formula2imgs( formula ){
  var imgs = '';

  if( formula ){
    for( var i = 0; i < formula.length; i ++ ){
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
        var img = '<img src="./imgs/' + idx + '.png"/>';
        imgs += img;
      }
    }
  }

  return imgs;
}

function checkFormulaFor2( formula, eleven ){
  var r = null;

  if( formula ){
    //. 式を一文字ずつ、種類に分けて分解
    var matches = [];
    for( var i = 0; i < formula.length; i ++ ){
      var c = formula.charAt( i );
      if( c == '-' ){
        //. この i 番目の '-' を抜いて、どこかに一本足して成立するか？
        var formula2 = formula.substr( 0, i ) + formula.substr( i + 1 );
        var matches = [];
        for( var j = 0; j < formula2.length; j ++ ){
          var d = formula2.charAt( j );
          if( ['+','-','*','/','='].indexOf( d ) > -1 ){
            var idx = 0;
            switch( d ){
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
            matches.push( { type: "calc", kind: d, idx: idx } );
          }else if( '0' <= d && d <= '9' ){
            if( eleven && d == '1' && j - 1 < formula2.length && formula2.charAt( j + 1 ) == '1' ){
              matches.push( { type: "num", kind: 11, idx: 11 } );
              j ++;
            }else{
              matches.push( { type: "num", kind: parseInt( d ), idx: parseInt( d ) } );
            }
          }else{
            matches.push( { type: "else", kind: d, idx: -1 } );
          }
        }

        //. 最初の１文字目から調べる
        var found = false;
        for( var ii = 0; ii < matches.length && !found; ii ++ ){
          var m = matches[ii];
          if( m.type == 'num' || m.type == 'calc' ){
            var transition = transitions[m.idx];

            //. 足してできる数
            for( var j = 0; j < transition[0].length && !found; j ++ ){
              //. 式の ii 文字目を transitions[0][j] に置き換える
              var new_formula = subString( matches, 0, ii ) + transition[0][j] + subString( matches, ii + 1 );
              found = isValidFormula( new_formula );
              if( found ){ r = new_formula; }
            }
          }
        }
      }
    }
  }

  return r;
}

function checkFormula( formula, eleven ){
  var r = null;

  if( formula ){
    //. 式を一文字ずつ、種類に分けて分解
    var matches = [];
    for( var i = 0; i < formula.length; i ++ ){
      var c = formula.charAt( i );
      if( ['+','-','*','/','='].indexOf( c ) > -1 ){
        var idx = 0;
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
        matches.push( { type: "calc", kind: c, idx: idx } );
      }else if( '0' <= c && c <= '9' ){
        if( eleven && c == '1' && i - 1 < formula.length && formula.charAt( i + 1 ) == '1' ){
          matches.push( { type: "num", kind: 11, idx: 11 } );
          i ++;
        }else{
          matches.push( { type: "num", kind: parseInt( c ), idx: parseInt( c ) } );
        }
      }else{
        matches.push( { type: "else", kind: c, idx: -1 } );
      }
    }
    //console.log( matches );

    //. 最初の１文字目から調べる
    var found = false;
    for( var i = 0; i < matches.length && !found; i ++ ){
      var m = matches[i];
      if( m.type == 'num' || m.type == 'calc' ){
        var transition = transitions[m.idx];

        //. 足してできる数
        for( var j = 0; j < transition[0].length && !found; j ++ ){
          //. 式の i 文字目を transitions[0][j] に置き換える
          for( var k = i + 1; k < matches.length && !found; k ++ ){
            if( i != k && ( matches[k].type == 'num' || matches[k].type == 'calc' ) ){
              var t = transitions[matches[k].idx];
              for( var l = 0; l < t[1].length && !found; l ++ ){
                //. 代わりに式の k 文字目を t[1][l] に置き換える
                var new_formula = subString( matches, 0, i ) + transition[0][j] + subString( matches, i + 1, k ) + t[1][l] + subString( matches, k + 1 );
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
            if( i != k && matches[k].type == 'num' || matches[k].type == 'calc' ){
              var t = transitions[matches[k].idx];
              for( var l = 0; l < t[0].length && !found; l ++ ){
                //. 代わりに式の k 文字目を t[0][l] に置き換える
                var new_formula = subString( matches, 0, i ) + transition[1][j] + subString( matches, i + 1, k ) + t[0][l] + subString( matches, k + 1 );
                found = isValidFormula( new_formula );
                if( found ){ r = new_formula; }
              }
            }
          }

          //. 式の i 文字目を translation[1][j] に置き換える
          var new_formula_ = subString( matches, 0, i ) + transition[1][j] + subString( matches, i + 1 );
          //. 各辺の頭に '-' をつける
          var tmp = new_formula_.split( '=' );
          if( tmp.length > 1 ){   //. '=' は２つ以上でも可とする
            for( var k = 0; k < tmp.length && !found; k ++ ){
              var f = JSON.parse( JSON.stringify( tmp ) );
              if( f[k].indexOf( '-' ) != 0 ){
                f[k] = '-' + f[k];
                var new_formula = f.join( '=' );
                found = isValidFormula( new_formula );
                if( found ){ r = new_formula; }
              }
            }
          }
        }

        //. 置き換えてできる数
        for( var j = 0; j < transition[2].length && !found; j ++ ){
          //. 式の i 文字目を translation[2][j] に置き換える
          var new_formula = subString( matches, 0, i ) + transition[2][j] + subString( matches, i + 1 );
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
  if( tmp.length > 1 ){   //. '=' は２つ以上でも可とする
    var v0 = eval( tmp[0] );
    if( v0 != undefined ){
      var b = true;
      for( var i = 1; i < tmp.length && b; i ++ ){
        var v1 = eval( tmp[i] );
        b = ( v0 === v1 );
      }

      r = b;
    }
  }

  return r;
}

function subString( arr, s, e ){
  var r = '';

  if( e != undefined ){
    if( arr.length > 0 && arr.length >= e && 0 <= s && s < e ){
      for( var i = s; i < e; i ++ ){
        r += arr[i].kind;
      }
    }
  }else{
    if( arr.length > 0 && 0 <= s ){
      for( var i = s; i < arr.length; i ++ ){
        r += arr[i].kind;
      }
    }
  }

  return r;
}

function showAnswer( answer ){
  if( answer ){
    $('#output_formula').val( answer );
    onKeyup( 'output' );
  }else{
    $('#output_formula').val( '無理っす' );
    $('#output_imgs').html( '' );
  }
}
