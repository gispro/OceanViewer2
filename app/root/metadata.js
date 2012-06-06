var JDBC = require("../jdbc");
var Request = require("ringo/webapp/request").Request;
var auth = require("../auth");
var ringoParameters = require("ringo/webapp/parameters");
var cr = require("../configurator");

//java.lang.System.out.println(JSON.stringify(cr.c.ringo.metaDataConfigs));

exports.app = function(env, pathInfo) {
    // TODO: make it so this is unnecessary
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
    return resp;    
};

var metaDataConfigs = cr.c.ringo.metaDataConfigs;

var handlers = {
    "GET": function(env) {
        //var resp;
        var queryParams = {};
        ringoParameters.parseParameters(env.queryString, queryParams, "utf-8");
        //var params = env.queryString.split("&");
        var codes = queryParams.code.split(",");
        var type = queryParams.type;
        var metaDataConfig = metaDataConfigs[type];
        if(!metaDataConfig){
            return {
                status: status || 400,
                headers: {
                    "Content-Type": "text/plain"
                },
                body: ["No such type:" + type]
            };
        }
        
        var conn = JDBC.connect(
        metaDataConfig.driver, 
        metaDataConfig.url, 
        {
            "user": metaDataConfig.user,
            "password": metaDataConfig.password
        });
        
        var fieldNames = "";
        for(var fn in metaDataConfig.metaDataFields){
            fieldNames = fieldNames + ", " + fn;
        }
        
        var sql = "select " + metaDataConfig.codeField +
            fieldNames + " from " + metaDataConfig.table + " where " +
            metaDataConfig.codeField + " in (";
        for(var i=0;i<codes.length;i++){
            if(i>0)
                sql = sql + ", ?";
            else
                sql = sql + "?";
        }
        sql = sql + ")";
        
        var ps = conn.prepareStatement(sql);
        for(var i=0;i<codes.length;i++){
            ps.setString(i+1, codes[i]);
        }
        var rs = ps.executeQuery();
        var ret = {};
        while(rs.next()){
            var tmp = {};
            ret[rs.getString(1)] = tmp;
            //var qryMd = rs.getMetaData();
            for(var fn in  metaDataConfig.metaDataFields){
                var rusName = metaDataConfig.metaDataFields[fn];
                tmp[rusName] = rs.getString(fn);
            }
        }
        rs.close();
        ps.close();
        conn.close();
        
        if(ret.length===0){
            return {
                status: 400,
                headers: {
                    "Content-Type": "text/plain"
                },
                body: ["No such codes: " + codes + " of type " + queryParams.type + " ("+sql+")"]
            };
        }else{
            return {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                body: [JSON.stringify(ret)]
            };
        }
    }
};

