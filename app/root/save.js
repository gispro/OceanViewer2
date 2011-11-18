var fs = require("fs");

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
exports.app = function(request)
{
    var appDir = "webapps/OceanViewer2/WEB-INF/";
    if (!(java.lang.System.getProperty("app.debug")) && (java.lang.System.getProperty("os.name").indexOf("Windows") == -1))
        appDir = "/home/tomcat/opt/tomcat-cluster/tomcat-1/webapps/OceanViewer2/WEB-INF/";
    system.print ("os.name = " + java.lang.System.getProperty("os.name") + ", appDir = " + appDir);
    //system.print ("app.debug = " + java.lang.System.getProperty("app.debug") + ", appDir = " + appDir);

    if (request.params.service === "rss")
        addRSSRecord(request, appDir);
    else if (request.params.service === "arcgis")
        addArcGisRecord(request, appDir);
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
function addRSSRecord(request, dir)
{
    var file = java.io.File(dir + "app/static/rss.json");
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
function addArcGisRecord(request, dir)
{
    var file = java.io.File(dir + "app/static/arcgis.json");
    //        system.print ("debug saving : " + file.exists() + ", " + file.getPath());
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
