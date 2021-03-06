var fs = require("fs");

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
exports.app = function(request)
{
	var appDir = "webapps/OceanViewer2/WEB-INF/";

//	system.print ("app.debug = " + java.lang.System.getProperty("app.debug"));
	
	if (!(java.lang.System.getProperty("app.debug")) && (java.lang.System.getProperty("os.name").indexOf("Windows") == -1))
		appDir = "/home/tomcat/opt/tomcat-cluster/tomcat-1/webapps/OceanViewer2/WEB-INF/";
	else if (java.lang.System.getProperty("app.debug"))
		appDir = "";

	var content;
	var statusCode = 200;

//	system.print ("save.js : service = " + request.params.service + ", action = " + request.params.action + ", appDir = " + appDir);

    if (request.params.service === "rss") {
		statusCode = transRSSRecord(request, appDir);
		if (statusCode !== 200)
		{
			if (statusCode === 409)
				content = {note : "doubled"};
		} else
			content = {result : "OK"};
		content = JSON.stringify(content);
	} else if (request.params.service === "wms") {
		// addArcGisRecord(request, appDir);
		statusCode = transWMSRecord(request, appDir);
		if (statusCode !== 200)
		{
			if (statusCode === 409)
				content = {note : "doubled"};
		} else
			content = {result : "OK"};
		content = JSON.stringify(content);
	} else if (request.params.service === "arcgis") {
		addArcGisRecord(request, appDir);
	}
	var resp = 
	{
		status: statusCode,
		headers: {
			"Content-Type": "application/json"
		},
		body: [content]
	};
    return resp;    
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getRssRecordID (json, request)
{
	var result = -1;
	if (json.layers.length > 0)
	{
		for (var i = 0; i < json.layers.length; i++)
		{
//			if ((json.layers[i].title === request.params.title) &&
//				(json.layers[i].url   === request.params.url  ) &&
//				(json.layers[i].owner === request.params.owner))
			if ((json.layers[i].url   === request.params.url  ) &&
				(json.layers[i].owner === request.params.owner))
			{
				result = i;
				break;
			}
		}
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getWMSRecordID (json, request)
{
	var result = -1;
	if (json.services.length > 0)
	{
		for (var i = 0; i < json.services.length; i++)
		{
			if ((json.services[i].url   === request.params.url  ) &&
				(json.services[i].owner === request.params.owner))
			{
				result = i;
				break;
			}
		}
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function isDoubledRssRecord (json, url)
{
	var result = false;
	if (json.layers.length > 0)
	{
		for (var i = 0; i < json.layers.length; i++)
		{
			if (json.layers[i].url === url) 
			{
				result = true;
				break;
			}
		}
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function isDoubledWMSRecord (json, url)
{
	var result = false;
	if (json.services.length > 0)
	{
		for (var i = 0; i < json.services.length; i++)
		{
			if (json.services[i].url === url) 
			{
				result = true;
				break;
			}
		}
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function transRSSRecord(request, dir)
{
	var result = 200;
	var file = java.io.File(dir + "app/static/rss.json");
	if (file.exists())
	{
		var content    = readFileContent (file.getAbsolutePath());
		var jsonObject = JSON.parse (content);

		if (request.params.action === 'remove') {
			var idx = getRssRecordID (jsonObject, request);
			if (idx >= 0) {
				jsonObject.layers.splice(idx, 1);
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
			}
		} else if (request.params.action === 'update') {
			var idx = getRssRecordID (jsonObject, request);
			if ((jsonObject.layers[idx].url !== request.params.url_new) &&
			    isDoubledRssRecord (jsonObject, request.params.url_new))
				result = 409;
			else {
				if (idx >= 0) {
					jsonObject.layers[idx].title  = request.params.title_new;
					jsonObject.layers[idx].name   = request.params.name     ;
					jsonObject.layers[idx].url    = request.params.url_new  ;
					jsonObject.layers[idx].icon   = request.params.icon     ;
					jsonObject.layers[idx].access = request.params.access   ;
					writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
				}
			}
		} else if (request.params.action === 'add') {
			if (isDoubledRssRecord (jsonObject, request.params.url))
				result = 409;
			else {
				jsonObject.layers.push ({
					"timer" : 5,
					"name" : request.params.name,
					"title" : request.params.title,
					"icon" : request.params.icon,
					"url" : request.params.url,
					"owner" : request.params.owner,
					"access" : request.params.access
				});
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
			}
		}
	} else {
		system.print ("transRSSRecord : file not found, path = " + dir + "app/static/rss.json");
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function transWMSRecord(request, dir)
{
	var result = 200;
	var file = java.io.File(dir + "app/static/wms.json");
	if (file.exists())
	{
		var content    = readFileContent (file.getAbsolutePath());
		var jsonObject = JSON.parse (content);

		if (request.params.action === 'remove') {
			var idx = getWMSRecordID (jsonObject, request);
			if (idx >= 0) {
				jsonObject.services.splice(idx, 1);
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
			}
		} else if (request.params.action === 'update') {
			var idx = getWMSRecordID (jsonObject, request);
			if ((jsonObject.services[idx].url !== request.params.url_new) &&
			    isDoubledWMSRecord (jsonObject, request.params.url_new))
				result = 409;
			else {
				if (idx >= 0) {
					jsonObject.services[idx].serverName = request.params.serverName_new;
					jsonObject.services[idx].url        = request.params.url_new       ;
					jsonObject.services[idx].access     = request.params.access        ;
					writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
				}
			}
		} else if (request.params.action === 'add') {
			if (isDoubledWMSRecord (jsonObject, request.params.url))
				result = 409;
			else {
				jsonObject.services.push ({
					"serverName" : request.params.serverName,
					"url"        : request.params.url       ,
					"owner"      : request.params.owner     ,
					"access"     : request.params.access
				});
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
			}
		}
	} else {
		system.print ("transWMSRecord : file not found, path = " + dir + "app/static/rss.json");
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function addArcGisRecord(request, dir)
{
	var file = java.io.File(dir + "app/static/arcgis.json");
//  system.print ("debug saving : " + file.exists() + ", " + file.getPath());
	if (file.exists())
	{
		var content = readFileContent (file.getAbsolutePath());

		var jsonObject = JSON.parse (content);

		jsonObject.arcgis.servers.push ({
			"title" : request.params.title,
			"url" : request.params.url
		});
		writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function readFileContent (file_path)
{
	return fs.read (file_path);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function writeFileContent (file_path, content)
{
	fs.write (file_path, content);
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
