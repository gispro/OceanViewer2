var JDBC = require("../jdbc");
var Request = require("ringo/webapp/request").Request;
var auth = require("../auth");
var ringoParameters = require("ringo/webapp/parameters");
var cr = require("../configurator");

exports.app = function(env, pathInfo) {
    /*// TODO: make it so this is unnecessary
    env.pathInfo = pathInfo || "";
    var resp;
    var method = env.method;
    var handler = handlers[method];
    if (handler) {
        try {
            resp = handler(env);            
        } catch (x) {
            resp = 
            {
                status: 500,
                headers: {
                    "Content-Type": "text/plain"
                },
                body: [x.message + ": line " + x.lineNumber]
            };
        }
    } else {
        resp = 
        {
            status: 405,
            headers: {
                "Content-Type": "text/plain"
            },
            body: ["Not allowed: " + method]
        };
    }
    return resp;    */
	
        resp = 
        {
            status: 200,
            headers: {
                "Content-Type": "text/plain"
            },
            body: ["Helloworld!"]
        };
    
    return resp;    
};


var handlers = {
    "GET": function(env) {
        //var resp;
        var queryParams = {};
        ringoParameters.parseParameters(env.queryString, queryParams, "utf-8");        
        
        var conn = JDBC.connect(
        symbolTranslateConfig.driver, 
        symbolTranslateConfig.url, 
        {
            "user": symbolTranslateConfig.user,
            "password": symbolTranslateConfig.password
        });
        
        var sql = "SELECT gid, nodeid, nodename, resourceid, layername, stylename, serverpath, servicepath, servicetype, parentnode, isservice, islayer, workspace FROM admin.toc";
        
        var ps = conn.prepareStatement(sql);        
        var rs = ps.executeQuery();
        var layers = [];
		var getParentNode = function(child) {
			for (var i=0; i<layers.length; i++) {
				if (layers[i].nodeid == child.parentnode)
					return i;
			}
		}
        while(rs.next()){
            parsed = {
				gid: rs.getString("gid"),
				nodeid: rs.getString("nodeid"),
				nodename: rs.getString("nodename"),
				resourceid: rs.getString("resourceid"),
				layername: rs.getString("layername"),
				stylename: rs.getString("stylename"),
				serverpath: rs.getString("serverpath"),
				servicepath: rs.getString("servicepath"),
				servicetype: rs.getString("servicetype"),
				parentnode: rs.getString("parentnode"),
				isservice: rs.getString("isservice"),
				islayer: rs.getString("islayer"),
				workspace: rs.getString("workspace"),
				children: []
			};
			if (getParentNode(parsed.nodeid)) {
				layers[i].children.push(parsed);
			}
			else {
				layers.push(parsed);
			}
			
        }
        rs.close();
        ps.close();
        conn.close();
        
        if(layers.length===0){
            return {
                status: 500,
                headers: {
                    "Content-Type": "text/plain"
                },
                body: ["Can't get layers data"]
            };
        }else{
            return {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                body: [JSON.stringify(layers)]
            };
        }
    }
};

