var Client = require("ringo/httpclient").Client
var client = new Client(10000,false);
var clientRequest = require("ringo/httpclient").request;
var Request = require("ringo/webapp/request").Request;
var Headers = require("ringo/utils/http").Headers;
var MemoryStream = require("io").MemoryStream;
var objects = require("ringo/utils/objects");
var responseForStatus = require("../util").responseForStatus;
//var AsyncResponse = require('ringo/webapp/async').AsyncResponse;

var URL = java.net.URL;

var app = exports.app = function(env) {
    var response;
    var request = new Request(env);
    var url = request.queryParams.url;
    if (url) {
        response = proxyPass({
            request: request, 
            url: url,
            allowAuth: true
        });
    } else {
        response = responseForStatus(400, "Request must contain url parameter.");
    }
    return response;
};

var pass = exports.pass = function(config) {
    if (typeof config == "string") {
        config = {url: config};
    }
    return function(env, match) {
        var request = new Request(env);
        var newUrl = config.url + match + (request.queryString ? "?" + request.queryString : "");
        return proxyPass(objects.merge({
            request: request, 
            url: newUrl
        }, config));
    };
};

var getUrlProps = exports.getUrlProps = function(url) {
    var o, props;
    try {
        o = new URL(url);
    } catch(err) {
        // pass
    }
    if (o) {
        var username, password;
        var userInfo = o.getUserInfo();
        if (userInfo) {
            // this could potentially be removed if the following ticket is closed
            // https://github.com/ringo/ringojs/issues/issue/121
            // but, it could make sense to keep it here as well
            [username, password] = userInfo.split(":");
            url = url.replace(userInfo + "@", "");
        }
        var port = o.getPort();
        if (port < 0) {
            port = null;
        }
        props = {
            url: url,
            scheme: o.getProtocol(),
            username: username || null,
            password: password || null,
            host: o.getHost(),
            port: port,
            path: o.getPath() || "/",
            query: o.getQuery(),
            hash: o.getRef()
        };
    }
    return props;
};

var createProxyRequestProps = exports.createProxyRequestProps = function(config) {
    var props;
    var request = config.request;
    var url = config.url;
    var urlProps = getUrlProps(url);
    if (urlProps) {
        var headers = new Headers(objects.clone(request.headers));
        if (!config.preserveHost) {
            headers.set("Host", urlProps.host + (urlProps.port ? ":" + urlProps.port : ""));
        }
        if (!config.allowAuth) {
            // strip authorization and cookie headers
            headers.unset("Authorization");
            headers.unset("Cookie");
        }
        props = {
            url: urlProps.url,
            method: request.method,
            scheme: urlProps.scheme,
            username: urlProps.username,
            password: urlProps.password,
            headers: headers,
            data: request.contentLength && request.input
        };
    }

    return props;
}

function unpathSetCookie(head) {
  var t = head.split("\n")
  var s = []
  for(var i=0,len=t.length; i<len; i++){
    s.push(t[i].split('; ')[0])
  }
  return s.join("\n")
}

function locCookie(head, loc) {
  s = []
  if(head){
    var t = head.split("\n")
    for(var i=0,len=t.length; i<len; i++){
      var tt = t[i].split('; ')
      tt[0] = loc + '$$$' + tt[1].slice(5, tt[1].length) + '$$$' + tt[0]
      s.push(tt[0])
    }
  }
  return s
}

function cookie2hash(head, loc) {
  h = {}
  if(head){
    var s = head.split('; ')
    for(var i = 0, len = s.length; i<len ; i++){
      var t = s[i].split('$$$')
      if(t.length == 3){

        try {
          if(!h[t[0]]) h[t[0]] = {}
          if(!h[t[0]][t[1]]){
            h[t[0]][t[1]] = []
          }
          h[t[0]][t[1]].push(t[2])

        } catch(err) {
            // pass
        }

      }
    }
  }
  return h
}

function SetCookie2Cookie(head, j) {
  s = []
  if(head){
    var t = head.split("\n")
    for(var i=0,len=t.length; i<len; i++){
      s.push(t[i].split('; ')[0])
    }
  }
  return s.join("; ")
}

function filterCookieByPath(c,urlPath){
  cookies = []
  for(var path in c){
    var re1 = new RegExp("^"+ path)
    var re2 = new RegExp("^"+ urlPath)
    if( urlPath.match(re1) || path.match(re2) ){
      for(var i = 0, len = c[path].length; i<len; i++){
        cookies.push(c[path][i])
      }
    }
  }
  return cookies
}

function proxyPass(config) {
    var response;
    var outgoing = createProxyRequestProps(config);
    var incoming = config.request;
    var urlObj = getUrlProps(outgoing.url)
    var pathCookies = filterCookieByPath(cookie2hash(outgoing.headers.get('Cookie'))[urlObj.host], urlObj.path).join('; ')
    //var pathCookies = cookie2hash(outgoing.headers.get('Cookie'))["oceanviewer.ru"]['/user'].join('; ')
    var jossoCookie = ''
    try {
      jossoCookie = cookie2hash(outgoing.headers.get('Cookie'))["oceanviewer.ru"]['/josso'].join('; ')
    } catch(err) {
        // pass
    }
    java.lang.System.out.println('================')
    java.lang.System.out.println('================')
    java.lang.System.out.println('proxyPass')
    java.lang.System.out.println('================')
    java.lang.System.out.println(outgoing.method)
    java.lang.System.out.println(outgoing.url)
    java.lang.System.out.println('===all=cookie===')
    if(outgoing.headers.get('Cookie')) java.lang.System.out.println(outgoing.headers.get('Cookie'))
    java.lang.System.out.println('================')
    java.lang.System.out.println('=current=cookie=')
    java.lang.System.out.println(pathCookies)
    java.lang.System.out.println('==josso=cookie==')
    java.lang.System.out.println(jossoCookie)
    java.lang.System.out.println('================')
    outgoing.headers.unset('Cookie')
    outgoing.headers.set('Cookie', pathCookies)


    if (!outgoing || outgoing.scheme !== incoming.scheme) {
        response = responseForStatus(400, "The url parameter value must be absolute url with same scheme as request.");
    } else {

        // re-issue request
        var exchange = client.request({
            url: outgoing.url,
            method: outgoing.method,
            username: outgoing.username,
            password: outgoing.password,
            headers: outgoing.headers,
            data: outgoing.data,
            async: false
        });
    }
    java.lang.System.out.println(exchange.status)
    exchange.wait();
    var headers = new Headers(objects.clone(exchange.headers));
    var cookieStore

    //josson redirect
    if(exchange.status == 302){

      java.lang.System.out.println('-----------------')
      java.lang.System.out.println(exchange.status)
      java.lang.System.out.println('--')

      var headers2 = new Headers(objects.clone(exchange.headers));
      java.lang.System.out.println(JSON.stringify(headers2))
      var url = headers2.get('Location')
      var c = SetCookie2Cookie(headers2.get('Set-Cookie'))
      if(jossoCookie)headers2.set('Cookie', jossoCookie)
      headers2.unset('Location')
      headers2.unset('Set-Cookie')

      var exchange2 = client.request({
          url: url,
          method: 'get',
          headers: headers2,
          async: false
      });
      exchange2.wait();
      java.lang.System.out.println('-----------------')
      java.lang.System.out.println(exchange2.status)
      java.lang.System.out.println(url)
      java.lang.System.out.println('--')


      var headers3 = new Headers(objects.clone(exchange2.headers));
      java.lang.System.out.println(JSON.stringify(headers3))
      url = headers3.get('Location')
      headers3.unset('Location')

      var exchange3 = client.request({
          url: url,
          method: 'get',
          headers: headers3,
          async: false
      });
      exchange3.wait();
      java.lang.System.out.println('-----------------')
      java.lang.System.out.println(exchange3.status)
      java.lang.System.out.println(url)
      java.lang.System.out.println('--')


      var headers4 = new Headers(objects.clone(exchange3.headers));
      java.lang.System.out.println(JSON.stringify(headers4))
      java.lang.System.out.println(JSON.stringify(outgoing.headers))

      java.lang.System.out.println('--')
      c = SetCookie2Cookie(headers4.get('Set-Cookie'))
      cookieStore = locCookie(headers4.get('Set-Cookie'), outgoing.url.split('/')[2]) //new cookie!!
      java.lang.System.out.println('new cookie')
      java.lang.System.out.println(JSON.stringify(cookieStore))
      java.lang.System.out.println('--')

      outgoing.headers.set('Cookie', c)
      outgoing.headers.unset("accept-encoding")
      url = headers4.get('Location')
      //headers4.unset('Location')
      //headers4.unset('Set-Cookie')

      if(outgoing.method == 'GET'){

        var exchange4 = client.request({
            url: outgoing.url,
            method: outgoing.method,
            username: outgoing.username,
            password: outgoing.password,
            headers: outgoing.headers,
            data: outgoing.data,
            async: false
        });
        exchange4.wait();
        java.lang.System.out.println('-----------------')
        java.lang.System.out.println(exchange4.status)
        if( url ) java.lang.System.out.println(url)
        java.lang.System.out.println('--')


        var headers5 = new Headers(objects.clone(exchange4.headers));
        java.lang.System.out.println(JSON.stringify(headers5))

        exchange = exchange4

      }


    } else {

      java.lang.System.out.println('--')
      cookieStore = locCookie(headers.get('Set-Cookie'), outgoing.url.split('/')[2])  //new cookie!!
      java.lang.System.out.println('new cookie')
      java.lang.System.out.println(JSON.stringify(cookieStore))
      java.lang.System.out.println('--')

    }

    //saving cookie!!
    headers.unset('Set-Cookie')
    if(cookieStore){
      for(var i = 0, len = cookieStore.length; i < len; i ++){
        headers.add('Set-Cookie', cookieStore[i])
      }
    }


    return {
        status: exchange.status,
        headers: headers,
        body: new MemoryStream(exchange.contentBytes)
    };
}
    
function proxyPassNew(config) {
    var response;
    var outgoing = createProxyRequestProps(config);
    var incoming = config.request;
    if (!outgoing || outgoing.scheme !== incoming.scheme) {
        response = responseForStatus(400, "The url parameter value must be absolute url with same scheme as request.");
    } else {
        // re-issue request

        var exchange = clientRequest({
            url: outgoing.url,
            method: outgoing.method,
            username: outgoing.username,
            password: outgoing.password,
            headers: outgoing.headers,
            data: outgoing.data,
            async: false
        });
        
        exchange.wait();
        var headers = new Headers(objects.clone(exchange.headers));
        if (!config.allowAuth) {
            // strip out authorization and cookie headers
            headers.unset("WWW-Authenticate");
            headers.unset("Set-Cookie");
        }
        return {
            status: exchange.status,
            headers: headers,
            body: new MemoryStream(exchange.contentBytes)
        };
    }
}
