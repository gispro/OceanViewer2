var fs = require("fs");

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
exports.app = function(request)
{
	if (request.params.service === "rss")
		addRSSRecord(request);
	else if (request.params.service === "arcgis")
		addArcGisRecord(request);
	var resp = 
	{
		status: 200,
		headers: {
			"Content-Type": "text/plain"
		},
		body: []
	};
    return resp;    
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function addRSSRecord(request)
{
	var file = java.io.File("app/static/rss.json");
	if (file.exists())
	{
		var content = readFileContent (file.getAbsolutePath());

		var jsonObject = JSON.parse (content);

		jsonObject.layers.push ({
			"timer" : 5,
			"name" : request.params.name,
			"title" : request.params.title,
			"icon" : request.params.icon,
			"url" : request.params.url
		});
		writeFileContent (file.getAbsolutePath(), JSON.stringify (jsonObject));
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function addArcGisRecord(request)
{
	var file = java.io.File("app/static/arcgis.json");
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
