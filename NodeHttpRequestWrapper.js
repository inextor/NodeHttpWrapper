/*
*
	var httpRequestWrapper = require('nodeHttpRequestWrapper');

	httpRequestWrapper
	({
		url				: 'https://google.com'
		,debug			: false
		,post			: {'Hello' : 'World' } // OR null
		,headers		: {'Accept-Language'	: 'en-US'}
		,proxy			: 'http://myproxy.com'
		,proxyPort		: 8080
		,maxRedirects	: 10
		,success		: function( data ) //set if you spect string data
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

var Iconv		= require('iconv').Iconv;

function httpRequest(obj)
{
	var colors			= null;

	if( obj.debug )
		colors        = require('colors/safe');

	const url			= require('url');
	const querystring	= require('querystring');

	var urlObj			= url.parse( obj.url );

	var http			=  urlObj.protocol === 'http:' ? require('http') : require('https');
	var method			= 'GET';
	var postData		= '';
	var headers	 		= {};
	var charset			= 'utf-8';

	for(var i in obj.headers )
	{
		headers[ i ] = obj.headers[ i ];
	}

	if( obj.post )
	{
		method						= 'POST';
	   	postData					= querystring.stringify( obj.post );
		headers['Content-Type']		= 'application/x-www-form-urlencoded';
		headers['Content-Length']	= postData.length;
	}


	if( obj.debug )
	{
		for(var j in headers )
		{
			console.log(colors.magenta( j +' :'),colors.cyan( headers[ j ] ) );
		}
	}

	var port		=  urlObj.port;

	if( ! port )
	{
   		port	= urlObj.protocol === 'https:' ? 443 : 80;
	}

	if( obj.debug )
		console.log(colors.magenta( 'Port: '),colors.cyan( port) );

	var agent	= null;

	if( obj.proxy )
	{

		var HttpProxyAgent = null;
		var HttpsProxyAgent = null;

		if( urlObj.protocol == 'http:' )
			HttpProxyAgent = require('https-proxy-agent');
		else
			HttpsProxyAgent = require('http-proxy-agent');

		var proxyPort	= obj.proxyPort || 80;

		if( urlObj.protocol === 'http:' )
			agent =  new HttpProxyAgent( 'http://'+obj.proxy+':'+proxyPort );
		else
			agent = new HttpsProxyAgent( 'https://'+obj.proxy+':'+proxyPort );

	}

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
		console.log
		(
			colors.magenta(  method )
			,' ',colors.red( urlObj.protocol )+colors.green( urlObj.hostname )+colors.blue( urlObj.path)
		);



	var req = http.request(options, (res) =>
	{
		if( obj.debug ) console.log( colors.blue('STATUS: '), colors.green( res.statusCode) );

		for(var i in res.headers)
		{
			if( obj.debug )
				console.log( colors.cyan.bold(i+' :'), colors.green(res.headers[i]));

			if( i == 'content-type' )
			{
				if(  res.headers[i].match( /charset=/ ) )
				{
					charset	= res.headers[ i ].replace(/.*charset=/,'');
					if( obj.debug ) console.log( colors.red('SET charset'),colors.green.bold( charset) );
				}
				else
				{
					if( obj.debug ) console.log( colors.red('SET utf-8 AS default CHARSET') );
				}

			}
		}


		if( res.statusCode  >= 300 && res.statusCode < 400 )
		{
			req.abort();
			if( obj.debug )
			{
				console.log( colors.red.bold('Redirecting to: '), colors.green.bold( res.headers.location ) );
			}
			var newRequestObject 		= {};

			for(var j in obj)
			{
				newRequestObject[ j ]	= obj[j];
				obj[j]					= null;
			}

			newRequestObject.url	= res.headers.location;
			httpRequest( newRequestObject );
			return;
		}


		var data		=	'';
		var chunks		= [];
		var totallength	= 0;

		res.on('data', (chunk) =>
		{
			if( obj.debug ) console.log(colors.yellow('CHUNK Arrived'),colors.magenta( chunk.length ));

			 totallength += chunk.length;

			if( obj.onData )
			{
				obj.onData( chunk );
			}
			else
			{
				chunks.push( chunk );
			}
		});

		res.on('end', () =>
		{
			if( obj.debug ) console.log( colors.cyan.bold( 'Read Bytes'),colors.green.bold( totallength ));
			if( obj.debug ) console.log( colors.red( 'No more data in response.'));

			if( obj.success )
			{
				var results = new Buffer(totallength);
				var pos		= 0;

				for (var i = 0; i < chunks.length; i++)
				{
					chunks[ i ].copy( results, pos );
					pos += chunks[ i ].length;
				}

				var data	= null;

				if( charset.toLowerCase() == 'utf-8' || charset.toLowerCase() == 'utf8' )
				{
					data  = results.toString('utf8');
				}
				else
				{
					var iconv		= new Iconv( charset , 'UTF8');
					var converted	= iconv.convert(results);
					data		= converted.toString('utf8');
				}

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
	{
		req.on('socket', function (socket)
		{
			socket.setTimeout( obj.timeout );
			socket.on('timeout', function()
			{
				req.abort();
			});
		});
	}

	req.on('error', (e) =>
	{
	 	if( obj.debug ) console.log(colors.blue('problem with request:'),colors.red( e.message ));
		if( obj.error ) obj.error(e);
	});

	if( obj.debug ) console.log(colors.blue('post dat length is:'), colors.red( postData.length ) );

	// write data to request body
	if( method == 'POST' )
	{
		req.write(postData);
	}

	req.end();
}

module.exports = httpRequest;
