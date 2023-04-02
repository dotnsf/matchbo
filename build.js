//. build.js
var fs = require( 'fs' ),
    request = require( 'request' );

var matchbodb_url = "https://matchbodb.yellowmix.net";
var option = {
  url: matchbodb_url + '/api/db/generated',
  method: 'GET',
  headers: { 'Accept': 'application/json' }
};
request( option, ( err, res, body ) => {
  if( err ){
    console.log( { err } );
  }else{
    if( typeof body == 'string' ){ body = JSON.parse( body ); }
    //console.log( { body } );
    fs.writeFileSync( 'docs/generated.json', JSON.stringify( body, null, 2 ) );
    console.log( 'done.' );
  }
});

