
function getParam( name, url ){
  if( !url ) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if( !results ) return null;
  if( !results[2] ) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
var beta_function = getParam( 'beta' );

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

//. #1 （逆さにして）[ 足してできる数, 引いてできる数, 置き換えてできる数, そのままで成立する数 ]
var rev_transitions = [
  [ [ 8 ], [], [ 6, 9 ], [ 0 ] ],          //. 0
  [ [], [], [], [ 1 ] ],                   //. 1
  [ [], [], [ 3 ], [ 2 ] ],                //. 2
  [ [ 6 ], [], [ 2, 5 ], [] ],             //. 3
  [ [], [], [ 11 ], [] ],                  //. 4
  [ [ 6, 9 ], [], [ 3, 6, 9 ], [ 5 ] ],    //. 5
  [ [ 8 ], [ 3, 5 ], [ 0, 6 ], [ 9 ] ],    //. 6
  [ [], [], [ 11 ], [] ],                  //. 7
  [ [], [ 0, 6, 9 ], [], [ 8 ] ],          //. 8
  [ [ 8 ], [ 3, 5 ], [ 0, 9 ], [ 6 ] ],    //. 9
  [ [], [], [], [ 1 ] ],                   //. 10
  [ [], [], [ 4, 7 ], [ 11 ] ],            //. 11
  [ [], [ '-' ], [ '=' ], [ '+' ] ],       //. +
  [ [ '+', '=' ], [], [], [ '-' ] ],       //. -
  [ [], [], [], [ '*' ] ],                 //. *
  [ [], [], [], [ '/' ] ],                 //. /
  [ [], [ '-' ], [ '+' ], [ '=' ] ]        //. =
];

var answers = [];

$(function(){
  if( !beta_function ){
    $('#beta_reverse').addClass( 'display_none' );
  }

  $('#input_form').submit( function( e ){
    e.preventDefault();

    answers = [];
    $('#answers_list').html( '' );

    var reverse_check = $('#reverse_check').prop( 'checked' );

    $('#output_formula').val( '' );
    var formula = $('#input_formula').val();
    formula = formula.split(' ').join('');

    checkFormula( formula, false );
    //. '1', '1' を '11' とみなせないか？
    if( formula.indexOf( '11' ) > -1 ){
      checkFormula( formula, true );
    }

    //. #2 対応
    if( formula.indexOf( '-' ) > -1 ){
      checkFormulaFor2( formula, false );
      if( formula.indexOf( '11' ) > -1 ){
        checkFormulaFor2( formula, true );
      }
    }

    //. #3 対応
    if( has2DigitNumber( formula ) >= 0 ){
      checkFormulaFor31( formula, false );
      if( formula.indexOf( '11' ) > -1 ){
        checkFormulaFor31( formula, true );
      }

      checkFormulaFor32( formula );
      if( formula.indexOf( '11' ) > -1 ){
        checkFormulaFor32( formula, true );
      }
    }

    if( reverse_check ){
      //. #1 事前チェック
      var nrcs = NonReversibleChars( formula );
      if( nrcs.length <= 2 ){
        var matches = checkFormula1( formula );
  
        //. #1 対応
        switch( nrcs.length ){
        case 2:
          var idx1 = nrcs[0];
          var idx2 = nrcs[1];
  
          var m1 = matches[idx1];
          var m2 = matches[idx2];
          if( ( m1.type == 'num' || m1.type == 'calc' ) && ( m2.type == 'num' || m2.type == 'calc' ) ){
            var rev_transition1 = rev_transitions[m1.idx];
            var rev_transition2 = rev_transitions[m2.idx];
  
            //. idx1 から１本引いて、idx2 に１本足す
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              for( var k = 0; k < rev_transition2[0].length; k ++ ){
                // ↓文字を逆さにした状態で、右から足す必要がある点を修正
                var new_formula = '';
                for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 && idx3 != idx2 ){
                    var m3 = matches[idx3];
                    var rev_transition3 = rev_transitions[m3.idx];
                    new_formula += rev_transition3[3][0];
                  }else if( idx3 == idx1 ){
                    new_formula += rev_transition1[1][j];
                  }else{
                    new_formula += rev_transition2[0][k];
                  }
                }
                var found = isValidFormula( new_formula );
                if( found ){ answers.push( { formula: new_formula, rev: true } ); }
              }
            }
          
            //. idx2 から１本引いて、idx1 に１本足す
            for( var j = 0; j < rev_transition1[0].length; j ++ ){
              for( var k = 0; k < rev_transition2[1].length; k ++ ){
                var new_formula = '';
                for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 && idx3 != idx2 ){
                    var m3 = matches[idx3];
                    var rev_transition3 = rev_transitions[m3.idx];
                    new_formula += rev_transition3[3][0];
                  }else if( idx3 == idx1 ){
                    new_formula += rev_transition1[0][j];
                  }else{
                    new_formula += rev_transition2[1][k];
                  }
                }
                var found = isValidFormula( new_formula );
                if( found ){ answers.push( { formula: new_formula, rev: true } ); }
              }
            }
          }
          break;
        case 1:
          var idx1 = nrcs[0];
          var m1 = matches[idx1];
          if( m1.type == 'num' || m1.type == 'calc' ){
            var rev_transition1 = rev_transitions[m1.idx];
  
            //. idx1 から１本引いて、どこかの文字に１本足す
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              for( var idx2 = 0; idx2 < formula.length; idx2 ++ ){
                if( idx2 != idx1 ){
                  var m2 = matches[idx2];
                  var rev_transition2 = rev_transitions[m2.idx];
                  for( var k = 0; k < rev_transition2[0].length; k ++ ){
                    var new_formula = '';
                    for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                      if( idx3 != idx1 && idx3 != idx2 ){
                        var m3 = matches[idx3];
                        var rev_transition3 = rev_transitions[m3.idx];
                        new_formula += rev_transition3[3][0];
                      }else if( idx3 == idx1 ){
                        new_formula += rev_transition1[1][j];
                      }else{
                        new_formula += rev_transition2[0][k];
                      }
                    }
                    var found = isValidFormula( new_formula );
                    if( found ){ answers.push( { formula: new_formula, rev: true } ); }
                  }
                }
              }
            }
  
            //. 同じ所で数値を別のものにする
            for( var j = 0; j < rev_transition1[2].length; j ++ ){
              var new_formula = '';
              for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                if( idx3 != idx1 ){
                  var m3 = matches[idx3];
                  var rev_transition3 = rev_transitions[m3.idx];
                  new_formula += rev_transition3[3][0];
                }else{
                  new_formula += rev_transition1[2][j];
                }
              }
              var found = isValidFormula( new_formula );
              if( found ){ answers.push( { formula: new_formula, rev: true } ); }
            }
  
            //. idx1 から１本引いて、どこかにマイナス記号を１本足す
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              var new_formula1 = '';
              for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                if( idx3 != idx1 ){
                  var m3 = matches[idx3];
                  var rev_transition3 = rev_transitions[m3.idx];
                  new_formula1 += rev_transition3[3][0];
                }else{
                  new_formula1 += rev_transition1[1][j];
                }
              }
  
              for( var k = 0; k <= new_formula1.length; k ++ ){
                var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                var found = isValidFormula( new_formula2 );
                if( found ){ answers.push( { formula: new_formula2, rev: true } ); }
              }
            }
  
            //. どこかから１本引いて、idx1 に１本足す
            for( var j = 0; j < rev_transition1[0].length; j ++ ){
              for( var idx2 = 0; idx2 < formula.length; idx2 ++ ){
                if( idx2 != idx1 ){
                  var m2 = matches[idx2];
                  var rev_transition2 = rev_transitions[m2.idx];
                  for( var k = 0; k < rev_transition2[1].length; k ++ ){
                    var new_formula = '';
                    for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                      if( idx3 != idx1 && idx3 != idx2 ){
                        var m3 = matches[idx3];
                        var rev_transition3 = rev_transitions[m3.idx];
                        new_formula += rev_transition3[3][0];
                      }else if( idx3 == idx1 ){
                        new_formula += rev_transition1[0][j];
                      }else{
                        new_formula += rev_transition2[1][k];
                      }
                    }
                    var found = isValidFormula( new_formula );
                    if( found ){ answers.push( { formula: new_formula, rev: true } ); }
                  }
                }
              }
            }
  
            //. 同じ所で数値を別のものにする（上で同じことをやっているので不要）
            /*
            for( var j = 0; j < rev_transition1[2].length; j ++ ){
              var new_formula = '';
              for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                if( idx3 != idx1 ){
                  var m3 = matches[idx3];
                  var rev_transition3 = rev_transitions[m3.idx];
                  new_formula += rev_transition3[3][0];
                }else{
                  new_formula += rev_transition1[2][j];
                }
              }
              var found = isValidFormula( new_formula );
              if( found ){ answers.push( { formula: new_formula, rev: true } ); }
            }
            */
  
            //. マイナス記号を１本引いて、idx1 に１本足す
            if( formula.indexOf( '-' ) > -1 ){
              for( var j = 0; j < rev_transition1[0].length; j ++ ){
                var new_formula1 = '';
                for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 ){
                    var m3 = matches[idx3];
                    var rev_transition3 = rev_transitions[m3.idx];
                    new_formula1 += rev_transition3[3][0];
                  }else{
                    new_formula1 += rev_transition1[0][j];
                  }
                }
  
                var start = 0;
                do{
                  start = new_formula1.indexOf( '-', start );
                  if( start > -1 ){
                    var new_formula2 = new_formula1.substr( 0, start ) + new_formula1.substr( start + 1 );
                    var found = isValidFormula( new_formula2 );
                    if( found ){ answers.push( { formula: new_formula2, rev: true } ); }
  
                    start ++;
                  }
                }while( start > -1 );
              }
            }
          }
          break;
        case 0:
          for( var idx1 = 0; idx1 < formula.length; idx1 ++ ){
            var m1 = matches[idx1];
            var rev_transition1 = rev_transitions[m1.idx];
  
            //. どこかから１本引いて、どこかの文字に１本足す
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              for( var idx2 = 0; idx2 < formula.length; idx2 ++ ){
                if( idx2 != idx1 ){
                  var m2 = matches[idx2];
                  var rev_transition2 = rev_transitions[m2.idx];
                  for( var k = 0; k < rev_transition2[0].length; k ++ ){
                    var new_formula = '';
                    for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                      if( idx3 != idx1 && idx3 != idx2 ){
                        var m3 = matches[idx3];
                        var rev_transition3 = rev_transitions[m3.idx];
                        new_formula += rev_transition3[3][0];
                      }else if( idx3 == idx1 ){
                        new_formula += rev_transition1[1][j];
                      }else{
                        new_formula += rev_transition2[0][k];
                      }
                    }
                    var found = isValidFormula( new_formula );
                    if( found ){ answers.push( { formula: new_formula, rev: true } ); }
                  }
                }
              }
            }
  
            //. 同じ所で数値を別のものにする
            for( var j = 0; j < rev_transition1[2].length; j ++ ){
              var new_formula = '';
              for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                if( idx3 != idx1 ){
                  var m3 = matches[idx3];
                  var rev_transition3 = rev_transitions[m3.idx];
                  new_formula += rev_transition3[3][0];
                }else{
                  new_formula += rev_transition1[2][j];
                }
              }
              var found = isValidFormula( new_formula );
              if( found ){ answers.push( { formula: new_formula, rev: true } ); }
            }
          }
  
          //. どこかから１本引いて、どこかにマイナス記号を１本足す
          for( var idx1 = 0; idx1 < formula.length; idx1 ++ ){
            var m1 = matches[idx1];
            var rev_transition1 = rev_transitions[m1.idx];
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              var new_formula1 = '';
              for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                if( idx3 != idx1 ){
                  var m3 = matches[idx3];
                  var rev_transition3 = rev_transitions[m3.idx];
                  new_formula1 += rev_transition3[3][0];
                }else{
                  new_formula1 += rev_transition1[1][j];
                }
              }
  
              for( var k = 0; k <= new_formula1.length; k ++ ){
                var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                var found = isValidFormula( new_formula2 );
                if( found ){ answers.push( { formula: new_formula2, rev: true } ); }
              }
            }
          }
  
          if( formula.indexOf( '-' ) > -1 ){
            //. マイナス記号を１本引いて、どこかに１本足す
            for( var idx1 = 0; idx1 < formula.length; idx1 ++ ){
              var m1 = matches[idx1];
              var rev_transition1 = rev_transitions[m1.idx];
              for( var j = 0; j < rev_transition1[0].length; j ++ ){
                var new_formula1 = '';
                for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 ){
                    var m3 = matches[idx3];
                    var rev_transition3 = rev_transitions[m3.idx];
                    new_formula1 += rev_transition3[3][0];
                  }else{
                    new_formula1 += rev_transition1[0][j];
                  }
                }
  
                var start = 0;
                do{
                  start = new_formula1.indexOf( '-', start );
                  if( start > -1 ){
                    var new_formula2 = new_formula1.substr( 0, start ) + new_formula1.substr( start + 1 );
                    var found = isValidFormula( new_formula2 );
                    if( found ){ answers.push( { formula: new_formula2, rev: true } ); }
  
                    start ++;
                  }
                }while( start > -1 );
              }
            }
  
            //. マイナス記号を１本引いて、どこかにマイナス記号を１本足す
            var start = 0;
            do{
              start = formula.indexOf( '-', start );
              if( start > -1 ){
                var new_formula1 = formula.substr( 0, start ) + formula.substr( start + 1 );
                var new_formula1 = '';
                for( var idx3 = formula.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != start ){
                    var m3 = matches[idx3];
                    var rev_transition3 = rev_transitions[m3.idx];
                    new_formula1 += rev_transition3[3][0];
                  }
                }
  
                for( var k = 0; k <= new_formula1.length; k ++ ){
                  var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                  var found = isValidFormula( new_formula2 );
                  if( found ){ answers.push( { formula: new_formula2, rev: true } ); }
                }
  
                start ++;
              }
            }while( start > -1 );
          }
          break;
        }
      }
    }

    showAnswers( answers );

    return false;
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

//. #3
function checkFormulaFor31( formula, eleven ){
  //. （数字から）１本とって別の数字になるか、（プラスから）１本とってマイナスにしてから、２桁以上の数字の間に入れて引き算
  var r = null;

  if( formula ){
    //. 式を一文字ずつ、種類に分けて分解
    var matches = [];
    for( var i = 0; i < formula.length; i ++ ){
      var c = formula.charAt( i );
      if( c == '+' ){
        var idx = 12;
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

    //. 最初の１文字目から調べる
    for( var i = 0; i < matches.length; i ++ ){
      var m = matches[i];
      if( m.type == 'num' || m.type == 'calc' ){
        var transition = transitions[m.idx];

        //. 引いてできる数
        for( var j = 0; j < transition[1].length; j ++ ){
          //. 式の i 文字目を translation[1][j] に置き換える
          var formula2 = subString( matches, 0, i ) + transition[1][j] + subString( matches, i + 1 );

          //. ２桁以上の数字の間に一本足して（引き算にして）成立するか？
          var idx = has2DigitNumber( formula2, 0 );
          while( idx >= 0 ){
            var new_formula = formula2.substr( 0, idx + 1 ) + '-' +  formula2.substr( idx + 1 );
            var found = isValidFormula( new_formula );
            if( found ){ answers.push( { formula: new_formula, rev: false } ); }
  
            idx = has2DigitNumber( formula2, idx + 1 );
          }
        }
      }
    }
  }

  return r;
}

function checkFormulaFor32( formula, eleven ){
  //. （マイナスから）１本とって前後の数字を連結してから、２桁以上の数字の間に入れて引き算
  var r = null;

  if( formula ){
    //. 式を一文字ずつ、種類に分けて分解
    for( var i = 0; i < formula.length; i ++ ){
      var c = formula.charAt( i );
      if( c == '-' ){
        //. この i 番目の '-' を抜いて、２桁以上の数字の間に一本足して（引き算にして）成立するか？
        var formula2 = formula.substr( 0, i ) + formula.substr( i + 1 );
        var idx = has2DigitNumber( formula2, 0 );
        while( idx >= 0 ){
          var new_formula = formula2.substr( 0, idx + 1 ) + '-' +  formula2.substr( idx + 1 );
          var found = isValidFormula( new_formula );
          if( found ){ answers.push( { formula: new_formula, rev: false } ); }

          idx = has2DigitNumber( formula2, idx + 1 );
        }
      }
    }
  }

  return r;
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
        for( var ii = 0; ii < matches.length; ii ++ ){
          var m = matches[ii];
          if( m.type == 'num' || m.type == 'calc' ){
            var transition = transitions[m.idx];

            //. 足してできる数
            for( var j = 0; j < transition[0].length; j ++ ){
              //. 式の ii 文字目を transitions[0][j] に置き換える
              var new_formula = subString( matches, 0, ii ) + transition[0][j] + subString( matches, ii + 1 );
              var found = isValidFormula( new_formula );
              if( found ){ answers.push( { formula: new_formula, rev: false } ); }
            }
          }
        }

        //. 左辺および右辺の最初の数字をマイナスにする

        //. 左辺
        var matches4 = [ { type: "calc", kind: '-', idx: 13 } ];
        for( var ii = 0; ii < matches.length; ii ++ ){
          matches4.push( matches[ii] );
        }
        var new_formula = subString( matches4, 0 );
        var found = isValidFormula( new_formula );
        if( found ){ answers.push( { formula: new_formula, rev: false } ); }

        //. 右辺
        matches4 = [];
        for( var ii = 0; ii < matches.length; ii ++ ){
          matches4.push( matches[ii] );
          if( matches[ii].type == 'calc' && matches[ii].idx == 16 ){
            matches4.push( { type: "calc", kind: '-', idx: 13 } );
          }
        }
        new_formula = subString( matches4, 0 );
        found = isValidFormula( new_formula );
        if( found ){ answers.push( { formula: new_formula, rev: false } ); }
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
    for( var i = 0; i < matches.length; i ++ ){
      var m = matches[i];
      if( m.type == 'num' || m.type == 'calc' ){
        var transition = transitions[m.idx];

        //. 足してできる数
        for( var j = 0; j < transition[0].length; j ++ ){
          //. 式の i 文字目を transitions[0][j] に置き換える
          for( var k = i + 1; k < matches.length; k ++ ){
            if( i != k && ( matches[k].type == 'num' || matches[k].type == 'calc' ) ){
              var t = transitions[matches[k].idx];
              for( var l = 0; l < t[1].length; l ++ ){
                //. 代わりに式の k 文字目を t[1][l] に置き換える
                var new_formula = subString( matches, 0, i ) + transition[0][j] + subString( matches, i + 1, k ) + t[1][l] + subString( matches, k + 1 );
                var found = isValidFormula( new_formula );
                if( found ){ answers.push( { formula: new_formula, rev: false } ); }
              }
            }
          }
        }

        //. 引いてできる数
        for( var j = 0; j < transition[1].length; j ++ ){
          //. 式の i 文字目を translation[1][j] に置き換える
          for( var k = i + 1; k < matches.length; k ++ ){
            if( i != k && matches[k].type == 'num' || matches[k].type == 'calc' ){
              var t = transitions[matches[k].idx];
              for( var l = 0; l < t[0].length; l ++ ){
                //. 代わりに式の k 文字目を t[0][l] に置き換える
                var new_formula = subString( matches, 0, i ) + transition[1][j] + subString( matches, i + 1, k ) + t[0][l] + subString( matches, k + 1 );
                var found = isValidFormula( new_formula );
                if( found ){ answers.push( { formula: new_formula, rev: false } ); }
              }
            }
          }

          //. 式の i 文字目を translation[1][j] に置き換える
          var new_formula_ = subString( matches, 0, i ) + transition[1][j] + subString( matches, i + 1 );
          //. 各辺の頭に '-' をつける
          var tmp = new_formula_.split( '=' );
          if( tmp.length > 1 ){   //. '=' は２つ以上でも可とする
            for( var k = 0; k < tmp.length; k ++ ){
              var f = JSON.parse( JSON.stringify( tmp ) );
              if( f[k].indexOf( '-' ) != 0 ){
                f[k] = '-' + f[k];
                var new_formula = f.join( '=' );
                var found = isValidFormula( new_formula );
                if( found ){ answers.push( { formula: new_formula, rev: false } ); }
              }
            }
          }
        }

        //. 置き換えてできる数
        for( var j = 0; j < transition[2].length; j ++ ){
          //. 式の i 文字目を translation[2][j] に置き換える
          var new_formula = subString( matches, 0, i ) + transition[2][j] + subString( matches, i + 1 );
          var found = isValidFormula( new_formula );
          if( found ){ answers.push( { formula: new_formula, rev: false } ); }
        }
      }
    }
  }

  return r;
}

function checkFormula1( formula ){
  var matches = [];

  if( formula ){
    //. 式を一文字ずつ、種類に分けて分解
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
        matches.push( { type: "num", kind: parseInt( c ), idx: parseInt( c ) } );
      }else{
        matches.push( { type: "else", kind: c, idx: -1 } );
      }
    }
    //console.log( matches );
  }

  return matches;
}

function isValidFormula( f ){
  var r = false;

  var tmp = f.split( '=' );
  if( tmp.length > 1 ){   //. '=' は２つ以上でも可とする
    var b = true;
    for( var i = 0; i < tmp.length && b; i ++ ){
      b = isValidRuled( tmp[i] );
    }

    try{
      var v0 = eval( tmp[0] );
      if( v0 != undefined ){
        for( var i = 1; i < tmp.length && b; i ++ ){
          var v1 = eval( tmp[i] );
          b = ( v0 === v1 );
        }

        r = b;
      }
    }catch( e ){
      //console.log( tmp[0] );
      //console.log( e );
    }
  }

  return r;
}

function isValidRuled( f ){
  //. (1) f に 0 で始まる２桁以上の数はないこと
  //. (2) f に符号が２つ以上繋がってないこと
  var r = true;
  var prev_calc = false;
  var prev_zero = false;

  for( var i = 0; i < f.length && r; i ++ ){
    var c = f.charAt( i );
    if( '0' == c ){
      if( prev_zero ){
        r = false;
      }
      if( prev_calc ){
        prev_zero = true;
      }else{
        prev_zero = false;
      }
      prev_calc = false;
    }else if( '1' <= c && c <= '9' ){
      if( prev_zero ){
        r = false;
      }
      prev_calc = false;
      prev_zero = false;
    }else{
      if( prev_calc ){
        r = false;
      }
      prev_calc = true;
      prev_zero = false;
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

//. #3 対応
function has2DigitNumber( f, start ){
  var r = -1;
  if( !start || start < 0 ){ start = 0; }
  for( var i = start; i < f.length - 1 && r == -1; i ++ ){
    var c1 = f.charAt( i );
    var c2 = f.charAt( i + 1 );

    if( '0' <= c1 && c1 <= '9' && '0' <= c2 && c2 <= '9' ){
      r = i;
    }
  }
  
  return r;
}

function NonReversibleChars( f ){
  var r = [];
  for( var i = 0; i < f.length; i ++ ){
    var c = f.charAt( i );
    if( '0' <= c && c <= '9' ){
      var k = parseInt( c );
      var a = rev_transitions[k][3]
      if( a.length == 0 ){
        r.push( i );
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

function showAnswers( answers ){
  answers = unique( answers );
  //console.log( answers );
  if( answers && answers.length > 0 ){
    $('#answers_list').append( '<ol id="answers_list_ol"></ol>' );
    for( var i = 0; i < answers.length; i ++ ){
      var answer = answers[i];
      var answer_formula = answer.formula;
      var answer_rev = answer.rev;
      //. 現行仕様では $('#output_formula') に答の式を１つだけ表示して、その下の $('#output_imgs') に正解画像を１つ表示することになっている。この仕様のままでは難しい。
      //. 式0 <br/> 画像0 <hr/> 式1 <br/> 画像1 <hr/> 式2 <br/> 画像2 <hr/> ・・・ のようにしたい
      var img = formula2imgs( answer_formula );
      var li = '<li>'
        + ( answer_rev ? '（逆さに見る）' : '' )
        + '<form><input type="text" class="blue" id="output_formula_' + i + '" value="' + answer_formula + '" readonly/></form>' 
        + '<span id="output_imgs_' + i + '">' + img + '</span>'
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
