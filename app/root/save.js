var fs = require("fs");

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
exports.app = function(request)
{
	var appDir = "webapps/OceanViewer2/WEB-INF/";
	/*var appDir = "/home/tomcat/opt/tomcat-cluster/tomcat-1/webapps/OceanViewer2/WEB-INF/"; // для дебага
	var appDir = " /opt/OceanViewer/webapps/OceanViewer2/WEB-INF";  // для стэндэлона
	var appDir = "/opt/jboss-portal-esimo/server/default/deploy/OceanViewerTest.war!/WEB-INF/"; // для потрлета
	*/
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
	} else if (request.params.service === "animation") {
		statusCode = transAnimationRecord(request, appDir);
		if (statusCode !== 200)
		{
			if (statusCode === 409)
				content = {note : "doubled"};
		} else
			content = {result : "OK"};
		content = JSON.stringify(content);
	} else if (request.params.service === "charts") {
		statusCode = transChartRecord(request, appDir);
		if (statusCode !== 200)
		{
			if (statusCode === 409)
				content = {note : "doubled"};
		} else
			content = {result : "OK"};
		content = JSON.stringify(content);
	}
	
	else if (request.params.service === "arcgis") {
		//addArcGisRecord(request, appDir);
		statusCode = transArcGisRecord(request, appDir);
		if (statusCode !== 200)
		{
			if (statusCode === 409)
				content = {note : "doubled"};
		} else
			content = {result : "OK"};
		content = JSON.stringify(content);		
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
function getAnimationRecordID (json, request)
{
	var result = -1;
	if (json.layers.length > 0)
	{
		for (var i = 0; i < json.layers.length; i++)
		{
			if (json.layers[i].animId === request.params.animId)
			{
				result = i;
				break;
			}
		}
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getChartRecordID (json, request)
{
	var result = -1;
	if (json.charts.length > 0)
	{
		for (var i = 0; i < json.charts.length; i++)
		{
			if (json.charts[i].chartId === request.params.chartId)
			{
				result = i;
				break;
			}
		}
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function getArcGisRecordID (json, request)
{
	var result = -1;
	if (json.arcgis.servers.length > 0)
	{
		for (var i = 0; i < json.arcgis.servers.length; i++)
		{
			if ((json.arcgis.servers[i].url === request.params.url)&&(json.arcgis.servers[i].title === request.params.title))
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
function isDoubledArcGisRecord (json, url)
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
function isDoubledAnimationRecord (json, animId)
{
	var result = false;
	if (json.layers.length > 0)
	{
		for (var i = 0; i < json.layers.length; i++)
		{
			if (json.layers[i].animId === animId)				
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
	var file = java.io.File("app/static/rss.json");
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
	var file = java.io.File("app/static/wms.json");
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
					jsonObject.services[idx].restUrl    = request.params.restUrl       ;
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
					"restUrl"    : request.params.restUrl   ,
					"owner"      : request.params.owner     ,
					"access"     : request.params.access
				});
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
			}
		}
	} else {
		// ".../rss.json"  replaced with .../wms.json" 
		system.print ("transWMSRecord : file not found, path = " + dir + "app/static/wms.json");
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function transAnimationRecord(request, dir)
{
	var result = 200;
	var file = java.io.File("app/static/animation.json");
	if (file.exists())
	{
		var content    = readFileContent (file.getAbsolutePath());
		var jsonObject = JSON.parse (content);		
		if (request.params.action === 'remove') {
			var idx = getAnimationRecordID (jsonObject, request);
			if (idx >= 0) {
				jsonObject.layers.splice(idx, 1);
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
			}
		} else if (request.params.action === 'update') {
			var idx = getAnimationRecordID (jsonObject, request);
				if (idx >= 0) {
					// deseiralize strings
					var x_axis = request.params.x_axis.split(",");
					var layers = request.params.layers.split(",");
					jsonObject.layers[idx].title 		= request.params.title;
					jsonObject.layers[idx].url   		= request.params.url;
					jsonObject.layers[idx].animId       = request.params.animId;
					jsonObject.layers[idx].owner     	= request.params.owner;
					jsonObject.layers[idx].x_axis     	= x_axis;
					jsonObject.layers[idx].layers     	= layers;

					writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));				
				}
		} else if (request.params.action === 'add') {
			if (isDoubledAnimationRecord(jsonObject, request.params.animId))
				result = 409;
			else {
				var x_axis = request.params.x_axis.split(",");
				var layers = request.params.layers.split(",");
				jsonObject.layers.push ({
					"title" 	: request.params.title,
					"url"       : request.params.url,
					"animId"	:request.params.animId,
					"owner"		:request.params.owner,
					"x_axis"    : x_axis,
					"layers"    : layers
				});
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
			}
		}
	} else {
		system.print ("transAnimationRecord : file not found, path = " + dir + "app/static/animation.json");
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function transChartRecord(request, dir)
{
	var result = 200;
	var file = java.io.File("app/static/charts.json");
	if (file.exists())
	{
		var content    = readFileContent (file.getAbsolutePath());
		var jsonObject = JSON.parse (content);		
		if (request.params.action === 'remove') {
			var idx = getChartRecordID (jsonObject, request);
			if (idx >= 0) {
				jsonObject.charts.splice(idx, 1);
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
			}
		} else if (request.params.action === 'update') {
			var idx = getChartRecordID (jsonObject, request);
				if (idx >= 0) {
					// deseiralize strings					
					var layers = request.params.layers.split(",");
					jsonObject.charts[idx].name 		= request.params.name;
					jsonObject.charts[idx].url   		= request.params.url;
					jsonObject.charts[idx].chartId      = request.params.chartId;
					jsonObject.charts[idx].x_axis     	= request.params.x_axis;
					jsonObject.charts[idx].y_axis     	= request.params.y_axis;
					jsonObject.charts[idx].isDefault  	= jsonObject.charts[idx].isDefault 
					jsonObject.charts[idx].layers		= layers;
					if (jsonObject.charts[idx].isDefault=="true") 
						jsonObject.lastUpdate = (new Date()).getTime();
					writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));				
				}
		} else if (request.params.action === 'add') {
			var layers = request.params.layers.split(",");
			jsonObject.charts.push ({
				"name" 		: request.params.name,
				"url"       : request.params.url,
				"chartId"	: request.params.chartId,
				"x_axis"    : request.params.x_axis,
				"y_axis"    : request.params.y_axis,
				"isDefault" : jsonObject.charts.length==0,
				"layers"    : layers
			});
			writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));			
		} else if (request.params.action === 'setDefault') {
			var idx = getChartRecordID (jsonObject, request);
			if (idx >= 0) {	
				jsonObject.lastUpdate = (new Date()).getTime();
				for (var i=0; i<jsonObject.charts.length; i++) {
					jsonObject.charts[i].isDefault = jsonObject.charts[i].chartId==request.params.chartId;
				}
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));		
			}
		}
	} else {
		system.print ("transChartRecord : file not found, path = " + dir + "app/static/charts.json");
	}
	return result;
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function transArcGisRecord(request, dir)
{
	var result = 200;
	var file = java.io.File(dir + "app/static/arcgis.json");
	if (file.exists())
	{
		var content    = readFileContent (file.getAbsolutePath());
		var jsonObject = JSON.parse (content);		
		if (request.params.action === 'remove') {
			var idx = getArcGisRecordID (jsonObject, request);
			if (idx >= 0) {
				jsonObject.arcgis.servers.splice(idx, 1);
				writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
			}
		} else if (request.params.action === 'update') {
			var idx = getArcGisRecordID (jsonObject, request);
				if (idx >= 0) {
					// deseiralize strings					
					jsonObject.arcgis.servers[idx].title 		= request.params.title;
					jsonObject.arcgis.servers[idx].url   		= request.params.url_new;
					writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));				
				}
		} else if (request.params.action === 'add') {	
			jsonObject.arcgis.servers.push ({
				"title" 		: request.params.title,
				"url"       	: request.params.url
			});
			writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));			
		}
	} else {
		system.print ("transChartRecord : file not found, path = " + dir + "app/static/arcgis.json");
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
