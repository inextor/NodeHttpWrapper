



```js
var cookiejar		= new tough.CookieJar();
HttpProxyAgent		= require('http-proxy-agent');

httpRequest
({
    debug       	: true
    ,url        	: "http://google.com"
    ,agent      	: new HttpProxyAgent( 'http://'+ip.ipAddress+':'+ip.port ) // OR
	//,proxy		: '192.168.1.59' //Best because dectect http or https agent
	//,proxyPort	: 8080
    ,timeout    	: 5000
	,method			: 'POST'
	,cookiejar		: cookiejar //Set the cookies via a cookiejar
	//Setting the cookie via header
    ,headers    	: { 'Accept-Language':'en-US', 'Cookie': 'pmaUser-1=O1Wztglp7FLLwFFj7Jf2LA%3D%3D; pma_lang=en; pma_collation_connection=utf8_general_ci' }
    ,error      	: function(e)
    {
		console.log( e );
    }
	,onData			: function( chunk ){ } //Set for binary Data
    ,success    	: function( data, responseHeaders, cookiejar )
    {

	}
});
```


##All Options

**debug**      	: true
**url**        	: "http://google.com"<br>
**agent**      	: new HttpProxyAgent( 'http://'+ip.ipAddress+':'+ip.port ) // OR<br>
**proxy**		: '192.168.1.59' //Best because dectect http or https agent<br>
**proxyPort**	: 8080<br>
**timeout**    	: 5000<br>
**method**		: 'POST'<br>
**cookiejar**	: cookiejar //Set the cookies via a cookiejar<br>
**headers**    	: { 'Accept-Language':'en-US', 'Cookie': 'pmaUser-1=O1Wztglp7FLLwFFj7Jf2LA%3D%3D; pma_lang=en; pma_collation_connection=utf8_general_ci' }<br>
**error**   	: function(e)<br>
**onData**		: function( chunk ){ } //Set for binary Data<br>
**success**  	: function( data, responseHeaders, cookiejar )<br>

