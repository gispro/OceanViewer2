var fs = require("fs");
var objects = require("ringo/utils/objects");

var content = fs.read('src/main/webapp/WEB-INF/web.xml'); //SED
//system.print(ringoHome);
var servelets = {};
var serveletsArr = content.split('<servlet>');

for(var i=1; i<serveletsArr.length; i++){
  var servlet = serveletsArr[i].split('</servlet>')[0];
  var servletName = servlet.match(/<servlet-name>(.+)<\/servlet-name>/)[1];
  servelets[ servletName ] = {};

  var initParamArr = servlet.split("<init-param>");

  for(var j=1; j<initParamArr.length; j++){
    
    var param = initParamArr[j].split('</init-param>')[0];
    var paramName = param.match(/<param-name>(.+)<\/param-name>/)[1];
    var paramValue = param.split('<param-value>')[1].split('</param-value>')[0];

    try {
      servelets[ servletName ][paramName] = eval( '(' + paramValue + ')' );
    } catch (x) {
      servelets[ servletName ][paramName] = paramValue;
    }

  }

}

exports.c = servelets;
