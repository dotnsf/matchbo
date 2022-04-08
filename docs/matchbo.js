//. matchbo.js

class Matchbo{
  constructor( isvalid_doublezeros, isvalid_doublecalcs, isvalid_doubleequals, isvalid_onetoplus, isvalid_plustoone, isvalid_reverse, isvalid_plusminus, isvalid_fourtooneminusone, isvalid_fourtominusone ){
    this.isvalid_doublezeros = isvalid_doublezeros;
    this.isvalid_doublecalcs = isvalid_doublecalcs;
    this.isvalid_doubleequals = isvalid_doubleequals;
    this.isvalid_onetoplus = isvalid_onetoplus;
    this.isvalid_plustoone = isvalid_plustoone;
    this.isvalid_reverse = isvalid_reverse;
    this.isvalid_plusminus = isvalid_plusminus;
    this.isvalid_fourtooneminusone = isvalid_fourtooneminusone;
    this.isvalid_fourtominusone = isvalid_fourtominusone;

    //. 深さ優先
    this.cs = ['+','-','*','/'];

    this.transitions = [
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
    this.rev_transitions = [
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

    this.answers = [];
  }

  fullcheckFormula( formula ){
    this.answers = [];
  
    if( this.isvalid_onetoplus ){
      this.transitions[1][2] = [ '+' ];
      this.rev_transitions[1][2] = [ '+' ];
    }else{
      this.transitions[1][2] = [];
      this.rev_transitions[1][2] = [];
    }
    if( this.isvalid_plustoone ){
      this.transitions[12][2] = [ '1', '=' ];
      this.rev_transitions[12][2] = [ '1', '=' ];
    }else{
      this.transitions[12][2] = [ '=' ];
      this.rev_transitions[12][2] = [ '=' ];
    }

    this.checkFormula( formula, false );
    //. '1', '1' を '11' とみなせないか？
    if( formula.indexOf( '11' ) > -1 ){
      this.checkFormula( formula, true );
      if( formula.indexOf( '111' ) > -1 ){
        this.checkFormula( formula, false, true );
      }
    }

    //. #2 対応
    if( formula.indexOf( '-' ) > -1 ){
      this.checkFormulaFor2( formula, false );
      if( formula.indexOf( '11' ) > -1 ){
        this.checkFormulaFor2( formula, true );
        if( formula.indexOf( '111' ) > -1 ){
          this.checkFormulaFor2( formula, false, true );
        }
      }
    }

    //. #3 対応
    if( this.has2DigitNumber( formula ) >= 0 ){
      this.checkFormulaFor31( formula, false );
      if( formula.indexOf( '11' ) > -1 ){
        this.checkFormulaFor31( formula, true );
        if( formula.indexOf( '111' ) > -1 ){
          this.checkFormulaFor31( formula, false, true );
        }
      }

      this.checkFormulaFor32( formula );
      if( formula.indexOf( '11' ) > -1 ){
        this.checkFormulaFor32( formula, true );
        if( formula.indexOf( '111' ) > -1 ){
          this.checkFormulaFor32( formula, false, true );
        }
      }
    }

    //. #16 対応
    if( this.isvalid_plusminus ){
      //. '+8' => '±0' パターン
      var n1 = formula.indexOf( '+8' );
      if( n1 > -1 ){
        var c1 = '';
        if( formula.length > n1 + 2 ){
          c1 = formula.charAt( n1 + 2 );
        }
        if( formula.length == ( n1 + 2 ) || c1 == '=' ){
          //. 変換パターンが成立するのはこの時だけ
          var new_formula = formula.substr( 0, n1 ) + '±0' + formula.substr( n1 + 2 );
  
          var found = this.isValidFormula( new_formula );
          if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'plusminus' } ); }
        }
      }

      //. '=0' => '±0' パターン
      var tmp = formula.split( '=' );
      if( tmp.length > 2 ){
        var n1 = formula.indexOf( '=0' );
        while( n1 > -1 ){
          if( formula.length == n1 + 2 || ['+','-','*','/','='].indexOf( formula.charAt( n1 + 2 ) ) > -1 ){
            //. 変換パターンが成立するのはこの時だけ

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
                matches.push( { type: "num", kind: parseInt( c ), idx: parseInt( c ) } );
              }else{
                matches.push( { type: "else", kind: c, idx: -1 } );
              }
            }

            //. 最初の１文字目から調べる
            for( var i = 0; i < matches.length; i ++ ){
              if( i != n1 && i != ( n1 + 1 ) ){
                var m = matches[i];
                if( m.type == 'num' || m.type == 'calc' ){
                  var transition = this.transitions[m.idx];
    
                  //. 引いてできる数
                  for( var j = 0; j < transition[1].length; j ++ ){
                    //. 式の i 文字目を translation[1][j] に置き換える
                    var formula2 = this.subString( matches, 0, i ) + transition[1][j] + this.subString( matches, i + 1 );
                    var new_formula = formula2.substr( 0, n1 ) + '±0' + formula2.substr( n1 + 2 ); 
  
                    var found = this.isValidFormula( new_formula );
                    if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'plusminus' } ); }
                  }
                }
              }
            }

            //. '-' を抜いて作る
            var n2 = formula.indexOf( '-' );
            while( n2 > -1 ){
              //. 式の n2 文字目の '-' を消す
              var formula2 = formula.substr( 0, n1 ) + '±0' + formula.substr( n1 + 2 ); 
              var new_formula = formula2.substr( 0, n2 ) + formula2.substr( n2 + 1 ); 
  
              var found = this.isValidFormula( new_formula );
              if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'plusminus' } ); }

              n2 = formula.indexOf( '-', n2 + 1 );
            }
          }

          n1 = formula.indexOf( '=0', n1 + 2 );
        }
      }
    }

    //. #42 対応
    if( this.isvalid_fourtooneminusone ){
      //. '4' => '1-1' パターン
      this.checkFormulaFor421( formula );
    }
  
    if( this.isvalid_fourtominusone ){
      //. '4' => '-1' パターン
      this.checkFormulaFor422( formula );
    }

    if( this.isvalid_reverse ){
      //. #1 事前チェック
      var nrcs = this.NonReversibleChars( formula );
      if( nrcs.length <= 2 ){
        var matches = this.checkFormula1( formula );
  
        //. #1 対応
        switch( nrcs.length ){
        case 2:
          var idx1 = nrcs[0];
          var idx2 = nrcs[1];
  
          var m1 = matches[idx1];
          var m2 = matches[idx2];
          if( ( m1.type == 'num' || m1.type == 'calc' ) && ( m2.type == 'num' || m2.type == 'calc' ) ){
            var rev_transition1 = this.rev_transitions[m1.idx];
            var rev_transition2 = this.rev_transitions[m2.idx];
  
            //. idx1 から１本引いて、idx2 に１本足す
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              for( var k = 0; k < rev_transition2[0].length; k ++ ){
                // ↓文字を逆さにした状態で、右から足す必要がある点を修正
                var new_formula = '';
                for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 && idx3 != idx2 ){
                    var m3 = matches[idx3];
                    var rev_transition3 = this.rev_transitions[m3.idx];
                    new_formula += rev_transition3[3][0];
                  }else if( idx3 == idx1 ){
                    new_formula += rev_transition1[1][j];
                  }else{
                    new_formula += rev_transition2[0][k];
                  }
                }
                var found = this.isValidFormula( new_formula );
                if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
              }
            }
            
            //. idx2 から１本引いて、idx1 に１本足す
            for( var j = 0; j < rev_transition1[0].length; j ++ ){
              for( var k = 0; k < rev_transition2[1].length; k ++ ){
                var new_formula = '';
                for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 && idx3 != idx2 ){
                    var m3 = matches[idx3];
                    var rev_transition3 = this.rev_transitions[m3.idx];
                    new_formula += rev_transition3[3][0];
                  }else if( idx3 == idx1 ){
                    new_formula += rev_transition1[0][j];
                  }else{
                    new_formula += rev_transition2[1][k];
                  }
                }
                var found = this.isValidFormula( new_formula );
                if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
              }
            }
          }
          break;
        case 1:
          var idx1 = nrcs[0];
          var m1 = matches[idx1];
          if( m1.type == 'num' || m1.type == 'calc' ){
            var rev_transition1 = this.rev_transitions[m1.idx];
  
            //. idx1 から１本引いて、どこかの文字に１本足す
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              for( var idx2 = 0; idx2 < matches.length; idx2 ++ ){
                if( idx2 != idx1 ){
                  var m2 = matches[idx2];
                  var rev_transition2 = this.rev_transitions[m2.idx];
                  for( var k = 0; k < rev_transition2[0].length; k ++ ){
                    var new_formula = '';
                    for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                      if( idx3 != idx1 && idx3 != idx2 ){
                        var m3 = matches[idx3];
                        var rev_transition3 = this.rev_transitions[m3.idx];
                        new_formula += rev_transition3[3][0];
                      }else if( idx3 == idx1 ){
                        new_formula += rev_transition1[1][j];
                      }else{
                        new_formula += rev_transition2[0][k];
                      }
                    }
                    var found = this.isValidFormula( new_formula );
                    if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
                  }
                }
              }
            }
  
            //. 同じ所で数値を別のものにする
            for( var j = 0; j < rev_transition1[2].length; j ++ ){
              var new_formula = '';
              for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                if( idx3 != idx1 ){
                  var m3 = matches[idx3];
                  var rev_transition3 = this.rev_transitions[m3.idx];
                  new_formula += rev_transition3[3][0];
                }else{
                  new_formula += rev_transition1[2][j];
                }
              }
              var found = this.isValidFormula( new_formula );
              if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
            }
  
            //. idx1 から１本引いて、どこかにマイナス記号を１本足す
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              var new_formula1 = '';
              for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                if( idx3 != idx1 ){
                  var m3 = matches[idx3];
                  var rev_transition3 = this.rev_transitions[m3.idx];
                  new_formula1 += rev_transition3[3][0];
                }else{
                  new_formula1 += rev_transition1[1][j];
                }
              }

              for( var k = 0; k <= new_formula1.length; k ++ ){
                var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                var found = this.isValidFormula( new_formula2 );
                if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
              }
            }
  
            //. どこかから１本引いて、idx1 に１本足す
            for( var j = 0; j < rev_transition1[0].length; j ++ ){
              for( var idx2 = 0; idx2 < matches.length; idx2 ++ ){
                if( idx2 != idx1 ){
                  var m2 = matches[idx2];
                  var rev_transition2 = this.rev_transitions[m2.idx];
                  for( var k = 0; k < rev_transition2[1].length; k ++ ){
                    var new_formula = '';
                    for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                      if( idx3 != idx1 && idx3 != idx2 ){
                        var m3 = matches[idx3];
                        var rev_transition3 = this.rev_transitions[m3.idx];
                        new_formula += rev_transition3[3][0];
                      }else if( idx3 == idx1 ){
                        new_formula += rev_transition1[0][j];
                      }else{
                        new_formula += rev_transition2[1][k];
                      }
                    }
                    var found = this.isValidFormula( new_formula );
                    if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
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
                  var rev_transition3 = this.rev_transitions[m3.idx];
                  new_formula += rev_transition3[3][0];
                }else{
                  new_formula += rev_transition1[2][j];
                }
              }
              var found = this.isValidFormula( new_formula );
              if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
            }
            */
  
            //. マイナス記号を１本引いて、idx1 に１本足す
            if( formula.indexOf( '-' ) > -1 ){
              for( var j = 0; j < rev_transition1[0].length; j ++ ){
                var new_formula1 = '';
                for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 ){
                    var m3 = matches[idx3];
                    var rev_transition3 = this.rev_transitions[m3.idx];
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
                    var found = this.isValidFormula( new_formula2 );
                    if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
   
                    start ++;
                  }
                }while( start > -1 );
              }
            }
          }
          break;
        case 0:
          for( var idx1 = 0; idx1 < matches.length; idx1 ++ ){
            var m1 = matches[idx1];
            var rev_transition1 = this.rev_transitions[m1.idx];
  
            //. どこかから１本引いて、どこかの文字に１本足す
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              for( var idx2 = 0; idx2 < matches.length; idx2 ++ ){
                if( idx2 != idx1 ){
                  var m2 = matches[idx2];
                  var rev_transition2 = this.rev_transitions[m2.idx];
                  for( var k = 0; k < rev_transition2[0].length; k ++ ){
                    var new_formula = '';
                    for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                      if( idx3 != idx1 && idx3 != idx2 ){
                        var m3 = matches[idx3];
                        var rev_transition3 = this.rev_transitions[m3.idx];
                        new_formula += rev_transition3[3][0];
                      }else if( idx3 == idx1 ){
                        new_formula += rev_transition1[1][j];
                      }else{
                        new_formula += rev_transition2[0][k];
                      }
                    }
                    var found = this.isValidFormula( new_formula );
                    if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
                  }
                }
              }
            }
  
            //. 同じ所で数値を別のものにする
            for( var j = 0; j < rev_transition1[2].length; j ++ ){
              var new_formula = '';
              for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                if( idx3 != idx1 ){
                  var m3 = matches[idx3];
                  var rev_transition3 = this.rev_transitions[m3.idx];
                  new_formula += rev_transition3[3][0];
                }else{
                  new_formula += rev_transition1[2][j];
                }
              }
              var found = this.isValidFormula( new_formula );
              if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
            }
          }
  
          //. どこかから１本引いて、どこかにマイナス記号を１本足す
          for( var idx1 = 0; idx1 < matches.length; idx1 ++ ){
            var m1 = matches[idx1];
            var rev_transition1 = this.rev_transitions[m1.idx];
            for( var j = 0; j < rev_transition1[1].length; j ++ ){
              var new_formula1 = '';
              for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                if( idx3 != idx1 ){
                  var m3 = matches[idx3];
                  var rev_transition3 = this.rev_transitions[m3.idx];
                  new_formula1 += rev_transition3[3][0];
                }else{
                  new_formula1 += rev_transition1[1][j];
                }
              }

              for( var k = 0; k <= new_formula1.length; k ++ ){
                var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                var found = this.isValidFormula( new_formula2 );
                if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
              }
            }
          }

          if( formula.indexOf( '-' ) > -1 ){
            //. マイナス記号を１本引いて、どこかに１本足す
            for( var idx1 = 0; idx1 < matches.length; idx1 ++ ){
              var m1 = matches[idx1];
              var rev_transition1 = this.rev_transitions[m1.idx];
              for( var j = 0; j < rev_transition1[0].length; j ++ ){
                var new_formula1 = '';
                for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 ){
                    var m3 = matches[idx3];
                    var rev_transition3 = this.rev_transitions[m3.idx];
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
                    var found = this.isValidFormula( new_formula2 );
                    if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
  
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
                var new_formula1 = '';
                for( var idx3 = matches.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != start ){
                    var m3 = matches[idx3];
                    var rev_transition3 = this.rev_transitions[m3.idx];
                    new_formula1 += rev_transition3[3][0];
                  }
                }
  
                for( var k = 0; k <= new_formula1.length; k ++ ){
                  var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                  var found = this.isValidFormula( new_formula2 );
                  if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
                }
    
                start ++;
              }
            }while( start > -1 );
          }

          //. 今は１文字ずつしか見ていないので #9 に未対応
          if( formula.indexOf( '11' ) > -1 ){
            var matches11 = this.checkFormula1( formula, true );

            for( var idx1 = 0; idx1 < matches11.length; idx1 ++ ){
              var m1 = matches11[idx1];
              var rev_transition1 = this.rev_transitions[m1.idx];
  
              //. どこかから１本引いて、どこかの文字に１本足す
              for( var j = 0; j < rev_transition1[1].length; j ++ ){
                for( var idx2 = 0; idx2 < matches11.length; idx2 ++ ){
                  if( idx2 != idx1 ){
                    var m2 = matches11[idx2];
                    var rev_transition2 = this.rev_transitions[m2.idx];
                    for( var k = 0; k < rev_transition2[0].length; k ++ ){
                      var new_formula = '';
                      for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                        if( idx3 != idx1 && idx3 != idx2 ){
                          var m3 = matches11[idx3];
                          var rev_transition3 = this.rev_transitions[m3.idx];
                          new_formula += rev_transition3[3][0];
                        }else if( idx3 == idx1 ){
                          new_formula += rev_transition1[1][j];
                        }else{
                          new_formula += rev_transition2[0][k];
                        }
                      }
                      var found = this.isValidFormula( new_formula );
                      if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
                    }
                  }
                }
              }
    
              //. 同じ所で数値を別のものにする
              for( var j = 0; j < rev_transition1[2].length; j ++ ){
                var new_formula = '';
                for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 ){
                    var m3 = matches11[idx3];
                    var rev_transition3 = this.rev_transitions[m3.idx];
                    new_formula += rev_transition3[3][0];
                  }else{
                    new_formula += rev_transition1[2][j];
                  }
                }
                var found = this.isValidFormula( new_formula );
                if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
              }
            }
    
            //. どこかから１本引いて、どこかにマイナス記号を１本足す
            for( var idx1 = 0; idx1 < matches11.length; idx1 ++ ){
              var m1 = matches11[idx1];
              var rev_transition1 = this.rev_transitions[m1.idx];
              for( var j = 0; j < rev_transition1[1].length; j ++ ){
                var new_formula1 = '';
                for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 ){
                    var m3 = matches11[idx3];
                    var rev_transition3 = this.rev_transitions[m3.idx];
                    new_formula1 += rev_transition3[3][0];
                  }else{
                    new_formula1 += rev_transition1[1][j];
                  }
                }

                for( var k = 0; k <= new_formula1.length; k ++ ){
                  var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                  var found = this.isValidFormula( new_formula2 );
                  if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
                }
              }
            }
    
            if( formula.indexOf( '-' ) > -1 ){
              //. マイナス記号を１本引いて、どこかに１本足す
              for( var idx1 = 0; idx1 < matches11.length; idx1 ++ ){
                var m1 = matches11[idx1];
                var rev_transition1 = rev_transitions[m1.idx];
                for( var j = 0; j < rev_transition1[0].length; j ++ ){
                  var new_formula1 = '';
                  for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                    if( idx3 != idx1 ){
                      var m3 = matches11[idx3];
                      var rev_transition3 = this.rev_transitions[m3.idx];
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
                      var found = this.isValidFormula( new_formula2 );
                      if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
    
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
                  var new_formula1 = '';
                  for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                    if( idx3 != start ){
                      var m3 = matches11[idx3];
                      var rev_transition3 = this.rev_transitions[m3.idx];
                      new_formula1 += rev_transition3[3][0];
                    }
                  }
    
                  for( var k = 0; k <= new_formula1.length; k ++ ){
                    var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                    var found = this.isValidFormula( new_formula2 );
                    if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
                  }
    
                  start ++;
                }
              }while( start > -1 );
            }
          }

          //. #15
          if( formula.indexOf( '111' ) > -1 ){
            var matches11 = this.checkFormula1( formula, false, true );
  
            for( var idx1 = 0; idx1 < matches11.length; idx1 ++ ){
              var m1 = matches11[idx1];
              var rev_transition1 = this.rev_transitions[m1.idx];
  
              //. どこかから１本引いて、どこかの文字に１本足す
              for( var j = 0; j < rev_transition1[1].length; j ++ ){
                for( var idx2 = 0; idx2 < matches11.length; idx2 ++ ){
                  if( idx2 != idx1 ){
                    var m2 = matches11[idx2];
                    var rev_transition2 = this.rev_transitions[m2.idx];
                    for( var k = 0; k < rev_transition2[0].length; k ++ ){
                      var new_formula = '';
                      for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                        if( idx3 != idx1 && idx3 != idx2 ){
                          var m3 = matches11[idx3];
                          var rev_transition3 = this.rev_transitions[m3.idx];
                          new_formula += rev_transition3[3][0];
                        }else if( idx3 == idx1 ){
                          new_formula += rev_transition1[1][j];
                        }else{
                          new_formula += rev_transition2[0][k];
                        }
                      }
                      var found = this.isValidFormula( new_formula );
                      if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
                    }
                  }
                }
              }
    
              //. 同じ所で数値を別のものにする
              for( var j = 0; j < rev_transition1[2].length; j ++ ){
                var new_formula = '';
                for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 ){
                    var m3 = matches11[idx3];
                    var rev_transition3 = this.rev_transitions[m3.idx];
                    new_formula += rev_transition3[3][0];
                  }else{
                    new_formula += rev_transition1[2][j];
                  }
                }
                var found = this.isValidFormula( new_formula );
                if( found ){ this.answers.push( { formula: new_formula, rev: true, special_check: 'reverse' } ); }
              }
            }
    
            //. どこかから１本引いて、どこかにマイナス記号を１本足す
            for( var idx1 = 0; idx1 < matches11.length; idx1 ++ ){
              var m1 = matches11[idx1];
              var rev_transition1 = this.rev_transitions[m1.idx];
              for( var j = 0; j < rev_transition1[1].length; j ++ ){
                var new_formula1 = '';
                for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                  if( idx3 != idx1 ){
                    var m3 = matches11[idx3];
                    var rev_transition3 = this.rev_transitions[m3.idx];
                    new_formula1 += rev_transition3[3][0];
                  }else{
                    new_formula1 += rev_transition1[1][j];
                  }
                }
  
                for( var k = 0; k <= new_formula1.length; k ++ ){
                  var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                  var found = this.isValidFormula( new_formula2 );
                  if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
                }
              }
            }
    
            if( formula.indexOf( '-' ) > -1 ){
              //. マイナス記号を１本引いて、どこかに１本足す
              for( var idx1 = 0; idx1 < matches11.length; idx1 ++ ){
                var m1 = matches11[idx1];
                var rev_transition1 = this.rev_transitions[m1.idx];
                for( var j = 0; j < rev_transition1[0].length; j ++ ){
                  var new_formula1 = '';
                  for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                    if( idx3 != idx1 ){
                      var m3 = matches11[idx3];
                      var rev_transition3 = this.rev_transitions[m3.idx];
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
                      var found = this.isValidFormula( new_formula2 );
                      if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
    
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
                  var new_formula1 = '';
                  for( var idx3 = matches11.length - 1; idx3 >= 0; idx3 -- ){
                    if( idx3 != start ){
                      var m3 = matches11[idx3];
                      var rev_transition3 = this.rev_transitions[m3.idx];
                      new_formula1 += rev_transition3[3][0];
                    }
                  }
    
                  for( var k = 0; k <= new_formula1.length; k ++ ){
                    var new_formula2 = new_formula1.substr( 0, k ) + '-' + new_formula1.substr( k );
                    var found = this.isValidFormula( new_formula2 );
                    if( found ){ this.answers.push( { formula: new_formula2, rev: true, special_check: 'reverse' } ); }
                  }
    
                  start ++;
                }
              }while( start > -1 );
            }
          }
  
          break;
        }
      }
    }

    return this.answers;
  }

  //. #3
  checkFormulaFor31( formula, eleven, eleven2 ){
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
          if( eleven2 && c == '1' && i - 2 < formula.length && formula.charAt( i + 1 ) == '1' && formula.charAt( i + 2 ) == '1' ){
            //. #15
            matches.push( { type: "num", kind: 1, idx: 1 } );
            matches.push( { type: "num", kind: 11, idx: 11 } );
            i += 2;
          }else if( eleven && c == '1' && i - 1 < formula.length && formula.charAt( i + 1 ) == '1' ){
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
          var transition = this.transitions[m.idx];
  
          //. 引いてできる数
          for( var j = 0; j < transition[1].length; j ++ ){
            //. 式の i 文字目を translation[1][j] に置き換える
            var formula2 = this.subString( matches, 0, i ) + transition[1][j] + this.subString( matches, i + 1 );
  
            //. ２桁以上の数字の間に一本足して（引き算にして）成立するか？
            var idx = this.has2DigitNumber( formula2, 0 );
            while( idx >= 0 ){
              var new_formula = formula2.substr( 0, idx + 1 ) + '-' +  formula2.substr( idx + 1 );
              var found = this.isValidFormula( new_formula );
              if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'eleven' } ); }
  
              idx = this.has2DigitNumber( formula2, idx + 1 );
            }
          }
        }
      }
    }

    return r;
  }

  checkFormulaFor32( formula, eleven, eleven2 ){
    //. （マイナスから）１本とって前後の数字を連結してから、２桁以上の数字の間に入れて引き算
    var r = null;
  
    if( formula ){
      //. 式を一文字ずつ、種類に分けて分解
      for( var i = 0; i < formula.length; i ++ ){
        var c = formula.charAt( i );
        if( c == '-' ){
          //. この i 番目の '-' を抜いて、２桁以上の数字の間に一本足して（引き算にして）成立するか？
          var formula2 = formula.substr( 0, i ) + formula.substr( i + 1 );
          var idx = this.has2DigitNumber( formula2, 0 );
          while( idx >= 0 ){
            var new_formula = formula2.substr( 0, idx + 1 ) + '-' +  formula2.substr( idx + 1 );
            var found = this.isValidFormula( new_formula );
            if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'eleven' } ); }
  
            idx = this.has2DigitNumber( formula2, idx + 1 );
          }
        }
      }
    }

    return r;
  }

  checkFormulaFor2( formula, eleven, eleven2 ){
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
              if( eleven2 && d == '1' && j - 2 < formula2.length && formula2.charAt( j + 1 ) == '1' && formula2.charAt( j + 2 ) == '1' ){
                //. #15
                matches.push( { type: "num", kind: 1, idx: 1 } );
                matches.push( { type: "num", kind: 11, idx: 11 } );
                j += 2;
              }else if( eleven && d == '1' && j - 1 < formula2.length && formula2.charAt( j + 1 ) == '1' ){
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
              var transition = this.transitions[m.idx];

              //. 足してできる数
              for( var j = 0; j < transition[0].length; j ++ ){
                //. 式の ii 文字目を transitions[0][j] に置き換える
                var new_formula = this.subString( matches, 0, ii ) + transition[0][j] + this.subString( matches, ii + 1 );
                var found = this.isValidFormula( new_formula );
                if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'minus' } ); }
              }
            }
          }

          //. #12
          if( this.isvalid_doublecalcs ){
            //. 全ての隙間に '-' を入れる可能性を考慮する
            for( var iii = 0; iii <= matches.length; iii ++ ){
              var matches4 = [];
              for( var ii = 0; ii < matches.length; ii ++ ){
                if( iii == ii ){
                  matches4.push( { type: "calc", kind: '-', idx: 13 } );
                }
                matches4.push( matches[ii] );
              }
              if( iii == matches.length ){
                matches4.push( { type: "calc", kind: '-', idx: 13 } );
              }
              var new_formula = this.subString( matches4, 0 );
              var found = this.isValidFormula( new_formula );
              if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'minus' } ); }
            }
          }else{
            //. 左辺および右辺の最初の数字をマイナスにする
            //. 左辺
            var matches4 = [ { type: "calc", kind: '-', idx: 13 } ];
            for( var ii = 0; ii < matches.length; ii ++ ){
              matches4.push( matches[ii] );
            }
            var new_formula = this.subString( matches4, 0 );
            var found = this.isValidFormula( new_formula );
            if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'minus' } ); }
  
            //. 右辺
            matches4 = [];
            for( var ii = 0; ii < matches.length; ii ++ ){
              matches4.push( matches[ii] );
              if( matches[ii].type == 'calc' && matches[ii].idx == 16 ){
                matches4.push( { type: "calc", kind: '-', idx: 13 } );
              }
            }
            new_formula = this.subString( matches4, 0 );
            found = this.isValidFormula( new_formula );
            if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'minus' } ); }
          }
        }
      }
    }

    return r;
  }

  checkFormulaFor421( formula ){
    var r = null;

    if( formula ){
      //. 式を一文字ずつ、種類に分けて分解
      var fours = [];
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
          matches.push( { type: "num", kind: parseInt( c ), idx: parseInt( c ) } );
          if( c == '4' ){
            fours.push( i );
          }
        }else{
          matches.push( { type: "else", kind: c, idx: -1 } );
        }
      }

      if( fours.length > 0 ){
        for( var f = 0; f < fours.length; f ++ ){
          //. 最初の１文字目から調べる
          for( var i = 0; i < matches.length; i ++ ){
            if( fours[f] != i ){
              var m = matches[i];
              if( m.type == 'num' || m.type == 'calc' ){
                var transition = this.transitions[m.idx];

                //. 引いてできる数
                for( var j = 0; j < transition[1].length; j ++ ){
                  var new_formula = this.subString( matches, 0, i ) + transition[1][j] + this.subString( matches, i + 1 );
                  new_formula = new_formula.substr( 0, fours[f] ) + '1-1' + new_formula.substr( fours[f] + 1 );
                  var found = this.isValidFormula( new_formula );
                  if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'fourto' } ); }
                }
              }
            }
          }
        }
      }
    }

    return r;
  }

  checkFormulaFor422( formula ){
    var r = null;

    if( formula ){
      //. 式を一文字ずつ、種類に分けて分解
      var fours = [];
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
          matches.push( { type: "num", kind: parseInt( c ), idx: parseInt( c ) } );
          if( c == '4' ){
            fours.push( i );
          }
        }else{
          matches.push( { type: "else", kind: c, idx: -1 } );
        }
      }
  
      if( fours.length > 0 ){
        for( var f = 0; f < fours.length; f ++ ){
          //. 最初の１文字目から調べる
          for( var i = 0; i < matches.length; i ++ ){
            if( fours[f] != i ){
              var m = matches[i];
              if( m.type == 'num' || m.type == 'calc' ){
                var transition = this.transitions[m.idx];
  
                //. 足してできる数
                for( var j = 0; j < transition[0].length; j ++ ){
                  var new_formula = this.subString( matches, 0, i ) + transition[0][j] + this.subString( matches, i + 1 );
                  new_formula = new_formula.substr( 0, fours[f] ) + '-1' + new_formula.substr( fours[f] + 1 );
                  var found = this.isValidFormula( new_formula );
                  if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: 'fourto' } ); }
                }
              }
            }
          }
        }
      }
    }

    return r;
  }

  checkFormula( formula, eleven, eleven2 ){
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
          if( eleven2 && c == '1' && i - 2 < formula.length && formula.charAt( i + 1 ) == '1' && formula.charAt( i + 2 ) == '1' ){
            //. #15
            matches.push( { type: "num", kind: 1, idx: 1 } );
            matches.push( { type: "num", kind: 11, idx: 11 } );
            i += 2;
          }else if( eleven && c == '1' && i - 1 < formula.length && formula.charAt( i + 1 ) == '1' ){
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
          var transition = this.transitions[m.idx];
  
          //. 足してできる数
          for( var j = 0; j < transition[0].length; j ++ ){
            //. 式の i 文字目を transitions[0][j] に置き換える
            for( var k = i + 1; k < matches.length; k ++ ){
              if( i != k && ( matches[k].type == 'num' || matches[k].type == 'calc' ) ){
                var t = this.transitions[matches[k].idx];
                for( var l = 0; l < t[1].length; l ++ ){
                  //. 代わりに式の k 文字目を t[1][l] に置き換える
                  var new_formula = this.subString( matches, 0, i ) + transition[0][j] + this.subString( matches, i + 1, k ) + t[1][l] + this.subString( matches, k + 1 );
                  var found = this.isValidFormula( new_formula );
                  if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: '' } ); }
                }
              }
            }
          }

          //. 引いてできる数
          for( var j = 0; j < transition[1].length; j ++ ){
            //. 式の i 文字目を translation[1][j] に置き換える
            for( var k = i + 1; k < matches.length; k ++ ){
              if( i != k && matches[k].type == 'num' || matches[k].type == 'calc' ){
                var t = this.transitions[matches[k].idx];
                for( var l = 0; l < t[0].length; l ++ ){
                  //. 代わりに式の k 文字目を t[0][l] に置き換える
                  var new_formula = this.subString( matches, 0, i ) + transition[1][j] + this.subString( matches, i + 1, k ) + t[0][l] + this.subString( matches, k + 1 );
                  var found = this.isValidFormula( new_formula );
                  if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: '' } ); }
                }
              }
            }

            //. 式の i 文字目を translation[1][j] に置き換える
            var new_formula_ = this.subString( matches, 0, i ) + transition[1][j] + this.subString( matches, i + 1 );
  
            //. #12
            if( this.isvalid_doublecalcs ){
              //. 全ての隙間に '-' を入れる可能性を考慮する
              for( var k = 0; k <= new_formula_.length; k ++ ){
                var new_formula = new_formula_.substr( 0, k ) + '-' + new_formula_.substr( k );
                var found = this.isValidFormula( new_formula );
                if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: '' } ); }
              }
            }else{
              //. 各辺の頭に '-' をつける
              var tmp = new_formula_.split( '=' );
              if( tmp.length > 1 ){   //. '=' は２つ以上でも可とする
                for( var k = 0; k < tmp.length; k ++ ){
                  var f = JSON.parse( JSON.stringify( tmp ) );
                  if( f[k].indexOf( '-' ) != 0 ){
                    f[k] = '-' + f[k];
                    var new_formula = f.join( '=' );
                    var found = this.isValidFormula( new_formula );
                    if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: '' } ); }
                  }
                }
              }
            }
          }

          //. 置き換えてできる数
          for( var j = 0; j < transition[2].length; j ++ ){
            //. 式の i 文字目を translation[2][j] に置き換える
            var new_formula = this.subString( matches, 0, i ) + transition[2][j] + this.subString( matches, i + 1 );
            var found = this.isValidFormula( new_formula );
            if( found ){ this.answers.push( { formula: new_formula, rev: false, special_check: '' } ); }
          }
        }
      }
    }

    return r;
  }

  checkFormula1( formula, eleven, eleven2 ){
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
          //matches.push( { type: "num", kind: parseInt( c ), idx: parseInt( c ) } );
          if( eleven2 && c == '1' && i - 2 < formula.length && formula.charAt( i + 1 ) == '1' && formula.charAt( i + 2 ) == '1' ){
            //. #15
            matches.push( { type: "num", kind: 1, idx: 1 } );
            matches.push( { type: "num", kind: 11, idx: 11 } );
            i += 2;
          }else if( eleven && c == '1' && i - 1 < formula.length && formula.charAt( i + 1 ) == '1' ){
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
    }

    return matches;
  }

  isValidFormula( f ){
    var r = false;

    //. #16
    f = f.split( '±' ).join( '+' );
    
    var tmp = f.split( '=' );
    if( tmp.length > 1 ){   //. '=' は２つ以上でも可とする
      var b = true;
      for( var i = 0; i < tmp.length && b; i ++ ){
        b = this.isValidRuled( tmp[i] );
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

  isValidRuled( f ){
    //. (1) f に 0 で始まる２桁以上の数はないこと
    //. (2) f に符号が２つ以上繋がってないこと
    //. (3) f が式として成立していること #34
    var r = true;
    var prev_calc = false;
    var prev_zero = false;
  
    for( var i = 0; i < f.length && r; i ++ ){
      var c = f.charAt( i );
      if( '0' == c ){
        //. #29 １つ前が '0' であっても、その前が '0' 以外の数字だった場合はフラグを立てない
        if( !this.isvalid_doublezeros && ( prev_calc || i == 0 || prev_zero ) ){
          prev_zero = true;
        }else{
          prev_zero = false;
        }
        prev_calc = false;
      }else if( '1' <= c && c <= '9' ){
        if( !this.isvalid_doublezeros && prev_zero ){
          r = false;
        }
        prev_calc = false;
        prev_zero = false;
      }else if( '-' == c ){
        if( !this.isvalid_doublecalcs && prev_calc ){
          r = false;
        }
        prev_calc = true;
        prev_zero = false;
      }else{
        if( prev_calc ){
          r = false;
        }
        prev_calc = true;
        prev_zero = false;
      }
    }

    //. #34
    if( r ){
      try{
        var v = eval( f );
        if( v == undefined || v == Infinity ){
          r = false;
        }
      }catch( e ){
        r = false;
      }
    }

    return r;
  }

  //. #17(出題としての正当性判断)
  isValidQuiz( q ){
    var r = false;

    //q = q.split( '±' ).join( '+' );

    var tmp = q.split( '=' );
    if( tmp.length == 2 ){   //. '=' は１つのみとする
      var b = true;
      for( var i = 0; i < tmp.length && b; i ++ ){
        b = this.isValidRuledQuiz( tmp[i] );
      }

      try{
        var v0 = eval( tmp[0] );
        if( v0 != undefined ){
          /*
          for( var i = 1; i < tmp.length && b; i ++ ){
            var v1 = eval( tmp[i] );
            b = ( v0 !== v1 );  //. 出題時点で成立していてはいけない場合にのみ必要
          }
          */
    
          r = b;
        }
      }catch( e ){
        //console.log( tmp[0] );
        //console.log( e );
      }
    }
  
    return r;
  }

  isValidRuledQuiz( q ){
    //. (1) f に 0 で始まる２桁以上の数はないこと
    //. (2) f に符号が２つ以上繋がってないこと
    var r = true;
    var prev_calc = false;
    var prev_zero = false;
  
    for( var i = 0; i < q.length && r; i ++ ){
      var c = q.charAt( i );
      if( '0' == c ){
        if( prev_zero ){
          r = false;
        }
        prev_zero = true;
        prev_calc = false;
      }else if( '1' <= c && c <= '9' ){
        if( prev_zero ){
          r = false;
        }
        prev_calc = false;
        prev_zero = false;
      }else if( '-' == c ){
        if( prev_calc ){
          r = false;
        }
        prev_calc = true;
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

  subString( arr, s, e ){
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
  has2DigitNumber( f, start ){
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

  NonReversibleChars( f ){
    var r = [];
    for( var i = 0; i < f.length; i ++ ){
      var c = f.charAt( i );
      if( '0' <= c && c <= '9' ){
        var k = parseInt( c );
        var a = this.rev_transitions[k][3]
        if( a.length == 0 ){
          r.push( i );
        }
      }
    }

    return r;
  }

  recursive_generate_quiz( current, pattern, is_next ){
    if( current.length == pattern.length ){
      var c = current.charAt( current.length - 1 );
      current = current.substr( 0, current.length - 1 );
      if( c == '9' ){ //. 式の最後は数字のはず
        return this.recursive_generate_quiz( current, pattern, false );
      }else{
        var code = c.charCodeAt( 0 ) + 1;
        current += String.fromCharCode( code );
        return current;
      }
    }else{
      if( is_next ){
        var p = pattern[current.length];
        if( p == 'E' ){
          current += '=';
          return this.recursive_generate_quiz( current, pattern, true );
        }else if( p == 'N' ){
          current += '0';
          if( current.length == pattern.length ){
            return current;
          }else{
            return this.recursive_generate_quiz( current, pattern, true );
          }
        }else{
          // ['+','-','*','/']
          current += '+';
          return this.recursive_generate_quiz( current, pattern, true );
        }
      }else{
        var c = current.charAt( current.length - 1 );
        var p = pattern[current.length - 1];
        if( p == 'N' ){
          if( c != '9' ){
            current = current.substr( 0, current.length - 1 );
            var code = c.charCodeAt( 0 ) + 1;
            current += String.fromCharCode( code );
            return this.recursive_generate_quiz( current, pattern, true );
          }else{
            if( current.length > 0 ){
              current = current.substr( 0, current.length - 1 );
              return this.recursive_generate_quiz( current, pattern, false );
            }else{
              return null;
            }
          }
        }else if( p == 'C' ){
          // ['+','-','*','/']
          if( c != '/' ){
            current = current.substr( 0, current.length - 1 );
            var i = this.cs.indexOf( c );
            current += this.cs[i+1];
            return this.recursive_generate_quiz( current, pattern, true );
          }else{
            if( current.length > 0 ){
              current = current.substr( 0, current.length - 1 );
              return this.recursive_generate_quiz( current, pattern, false );
            }else{
              return null;
            }
          }
        }else{
          //. '='
          if( current.length > 0 ){
            current = current.substr( 0, current.length - 1 );
            return this.recursive_generate_quiz( current, pattern, false );
          }else{
            return null;
          }
        }
      }
    }
  }

  recursive_generate_computes( current, cs, length, is_next ){
    if( current.length == length ){
      var c = current[current.length - 1];
      var idx = cs.indexOf( c );
      current.splice( current.length - 1, 1 );
      if( idx == cs.length - 1 ){
        return this.recursive_generate_computes( current, cs, length, false );
      }else{
        current.push( cs[idx+1] );
        return current;
      }
    }else{
      if( is_next ){
        current.push( cs[0] );
        if( current.length == length ){
          return current;
        }else{
          return this.recursive_generate_computes( current, cs, length, true );
        }
      }else{
        if( current.length > 0 ){
          var c = current[current.length - 1];
          var idx = cs.indexOf( c );
          current.splice( current.length - 1, 1 );
          if( idx == cs.length - 1 ){
            return this.recursive_generate_computes( current, cs, length, false );
          }else{
            current.push( cs[idx+1] );
            return this.recursive_generate_computes( current, cs, length, true );
          }
        }else{
          return null;
        }
      }
    }
  }


  //. #23
  countDifficulty( f_question, f_answers, COUNT_ELEVEN, COUNT_VALID_MINUS, COUNT_MULTI_EQUAL, COUNT_MINUS_VALUE, COUNT_SPECIAL_CHECK ){
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
        var trans = this.transitions[idx];
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
        var trans1 = this.transitions[idx][1];
        for( var j = 0; j < trans1.length; j ++ ){
          var c1 = trans1[j];
          var new_formula = f_question.substr( 0, i ) + c1 + f_question.substr( i + 1 );
          var found = this.isValidFormula( new_formula );
          if( found ){ cnt += COUNT_VALID_MINUS; }
        }
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
        var tmp_f = tmp[0];
        tmp_f.split( '±0' ).join( '+0' );
        try{
          if( eval( tmp_f ) < 0 ){
            cnt += COUNT_MINUS_VALUE;
          }
        }catch( e ){
        }
      }
    }

    return cnt;
  }
};

if( typeof module === 'object' ){
  module.exports = Matchbo;
}
