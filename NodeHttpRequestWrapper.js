/*
*
	var httpRequestWrapper = require('nodeHttpRequestWrapper');

	httpRequestWrapper
	({
		url		: 'https://google.com'
		,debug	: false
		,post	: {'Hello' : 'World' } // OR null
		,headers	: {'Accept-Language'	: 'en-US'}
		,success	: function( data ) //set if you spect string data
		{

		}
		,error	: function( xxx )
		{
			//
		}
		,onData		: function( chunk ) //Set if you spect binary data
		{

		}
		,onEnd		: function() //Set if you spect binary data
		{

		}
	});
*/
function httpRequest(obj)
{
	const url			= require('url');
	const querystring	= require('querystring');

	var urlObj			= url.parse( obj.url );

	var http			=  urlObj.protocol === 'http:' ? require('http') : require('https');
	var method			= 'GET';
	var postData		= '';
	var headers	 		= {};

	for(var i in obj.headers )
	{
		headers[ i ] = obj.headers[ i ];
	}

	if( obj.post )
	{
		method			= 'POST';
	   	postData		= querystring.stringify( obj.post );
		headers['Content-Type']		= 'application/x-www-form-urlencoded';
		headers['Content-Length']	= postData.length;
	}

	var port		=  urlObj.port;

	if( ! port )
	{
   		port	= urlObj.protocol === 'https:' ? 443 : 80;
	}

	if( obj.debug )
		console.log('Port: '+port );

	var options		=
	{
		hostname		: urlObj.hostname
		,port			: port
		,path			: urlObj.path
		,method			: method
		,headers		: headers
		,protocol		: urlObj.protocol
		,agent			: obj.agent
	};


	if( obj.debug )
		console.log( options );

	var req = http.request(options, (res) =>
	{
		if( obj.debug ) console.log(`STATUS: ${res.statusCode}`);
		if( obj.debug ) console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

		var data =	'';

		if( obj.success )
			res.setEncoding('utf8');

		res.on('data', (chunk) =>
		{
			if( obj.debug ) console.log(`BODY: ${chunk}`);

			if( obj.onData )
			{
				obj.onData( chunk );
			}

			if( obj.success )
			{
				data += chunk;
			}
		});

		res.on('end', () =>
		{
			if( obj.debug ) console.log('No more data in response.');

			if( obj.success )
			{
				if( obj.dataType != 'json' )
					obj.success( data );
				else
					obj.success( JSON.parse( data ) );
			}

			if( obj.end )
				obj.end();
		});
	});

	if( obj.timeout )
		req.setTimeout( obj.timeout );

	req.on('error', (e) =>
	{
	 	if( obj.debug ) console.log(`problem with request: ${e.message}`);
		obj.error(e);
	});

	if( obj.debug ) console.log('POST_DATA is', postData );

	// write data to request body
	if( method == 'POST' )
	{
		req.write(postData);
	}

	req.end();
}

module.exports = httpRequest;

