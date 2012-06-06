var JDBC = require("../jdbc");
var Request = require("ringo/webapp/request").Request;
var auth = require("../auth");
var ringoParameters = require("ringo/webapp/parameters");
var cr = require("../configurator");

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

var symbolTranslateConfigs = cr.c.ringo.symbolTranslateConfigs;

var handlers = {
    "GET": function(env) {
        //var resp;
        var queryParams = {};
        ringoParameters.parseParameters(env.queryString, queryParams, "utf-8");
        //var params = env.queryString.split("&");
        var codes = queryParams.code.split(",");
        var type = queryParams.type;
        /*for(var i=0;i<params.length;i++){
            params[i] = params[i].split("=");
            if(params[i][0]==="type")
                type = params[i][1];
            else if(params[i][0]==="code")
                codes.push(params[i][1]);
        }*/
        
        var symbolTranslateConfig = symbolTranslateConfigs[type];
        if(!symbolTranslateConfig){
            return {
                status: status || 400,
                headers: {
                    "Content-Type": "text/plain"
                },
                body: ["No such type:" + type]
            };
        }
        
        var conn = JDBC.connect(
        symbolTranslateConfig.driver, 
        symbolTranslateConfig.url, 
        {
            "user": symbolTranslateConfig.user,
            "password": symbolTranslateConfig.password
        });
        
        var sql = "select " + symbolTranslateConfig.codeField + ", " +
            symbolTranslateConfig.translateField + " from " + symbolTranslateConfig.table + " where " +
            symbolTranslateConfig.codeField + " in (";
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
            ret[rs.getString(1)] = rs.getString(2);
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

