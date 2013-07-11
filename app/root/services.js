var JDBC = require("../jdbc");
var Request = require("ringo/webapp/request").Request;
var auth = require("../auth");
var cr = require("../configurator");

var System = Packages.java.lang.System;
var dbMapsTableCreated = false;
var dbMapsTableName = "maps";
var jdbcDriver;

var getDbConn = exports.getDbConn = function(request) {
    
    var jdbcParams;
    jdbcParams = cr.c.ringo.OCEANVIEWER_JDBC_PARAMS;

    var jdbcUrl = jdbcParams.url;
//    delete jdbcParams.url;
    jdbcDriver = jdbcParams.driver;
  //  delete jdbcParams.driver;
    if(jdbcParams.table){
        dbMapsTableName = jdbcParams.table;
    //    delete jdbcParams.table;
    }

    try {
        var connection = JDBC.connect(jdbcDriver, jdbcUrl, jdbcParams);
    } catch (err) {
        // TODO: nicer exception handling - this is hard for the user to find
        throw new Error("Can't open '"+ jdbcUrl + "': "+ err);
    }
        
    return connection;
}

var createResponse = function(o) {
    var data = o.data;
	var status = o.status;
	if (typeof data !== "string") {
        data = JSON.stringify(data);
    }
    return {
        status: status || 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: [data]
    };
};

var getCurrentUser = function() {
	return "admin";
}

var getCurrentDateExpr = function() {
	return "current_date + current_time";
}

var services = {
	abstractService : {
		_fillObjectByRs: function(rs,o){
			// o = {fields:[],types:[]} - options. contains fields and types for them
			var obj = {};
			for (var i=0; i<o.fields.length; i++){
				obj[o.fields[i]] = o.types[i]=="int"? rs.getInt(o.fields[i]) : 
									o.types[i]=="array"? rs.getString(o.fields[i]).split(",") : 
									  o.types[i]=="json"? JSON.parse(rs.getString(o.fields[i])) : 	
										rs.getString(o.fields[i]);
				//obj[o.fields[i]] = rs.getString(o.fields[i]);
			}
			return obj;
		},
		getList: function(o) {
			var code = 200;
			var rs,ps,conn;
			try {
				conn = getDbConn();
				var sql = "select "+o.fields.join(",")+" from "+ o.table;
				ps = conn.prepareStatement(sql);        
				rs = ps.executeQuery();
				var result = {};
				result[o.root] = [];
				while(rs.next()){
					result[o.root].push(this._fillObjectByRs(rs,o));
				}
								
				return {data:result,code:code}
			}
			catch (e) {
				return{data:{error: "Internal server error: "+ e.toString() + "; SQL: "+ sql}, status: 501}
			}
			finally {
				ps && ps.close();
				rs && rs.close();				
				conn && conn.close();
			}
		},
		getSingle: function(env,o){
			var code = 200;
			var rs,ps,conn;
			try {
				conn = getDbConn();
				var sql = "select "+o.fields.join(",")+" from "+ o.table+ " where "+ o.id + "='"+ env.params[o.id] + "'";
				ps = conn.prepareStatement(sql);        
				rs = ps.executeQuery();
				var result = {};
				result[o.root] = [];
				while(rs.next()){
					result[o.root].push(this._fillObjectByRs(rs,o));
				}
								
				return {data:result,code:code}
			}
			catch (e) {
				return{data:{error: "Internal server error: "+ e.toString()}, status: 501}
			}
			finally {
				ps && ps.close();
				rs && rs.close();				
				conn && conn.close();
			}
		},
		insert: function(env,o){
			var code = 200;
			var rs,ps,conn;
			try {
				conn = getDbConn();
				var arr = [];
				if (typeof (env.params.data)=="string") 
					env.params.jsonData = JSON.parse(env.params.data); 
				else 
					env.params.jsonData = env.params.data;				
				for (var i in o.fields) {
					if (o.fields[i]!=o.id) arr.push(env.params.jsonData[o.fields[i]]);
				}				
				var sql = "insert into "+ o.table + "("+o.fields.filter(function(el){return el!=o.id}).join(",") + ") VALUES ('"+ arr.join("','")+"')";
				ps = conn.prepareStatement(sql);        
				rs = ps.executeUpdate();		
				return {data:{result: "OK"},code:code}
			}
			catch (e) {
				return{data:{error: "Internal server error: "+ e.toString() + "; SQL: "+ sql + "; JSON: "+ env.params.data}, status: 501}
			}
			finally {
				ps && ps.close();
				conn && conn.close();
			}
		},
		update: function(env,o){
			var code = 200;
			var rs,ps,conn;
			try {
				conn = getDbConn();
				var setExpression = [];				
				if (typeof (env.params.data)=="string") env.params.jsonData = JSON.parse(env.params.data); else env.params.jsonData = env.params.data;
				if (!env.params.jsonData[o.id]) {return{data:{error: o.id+ "value must be specified"}, status: 501}}
				for (var i in o.fields) {
					if (env.params.jsonData[o.fields[i]]+1) {
						setExpression.push(o.fields[i] + " = '"+ env.params.jsonData[o.fields[i]] + "' ");
					}
				}				
				var sql = "update "+ o.table + " SET "+ setExpression.join(",") + " where "+ o.id + " = '"+ env.params.jsonData[o.id]+"'";
				ps = conn.prepareStatement(sql);        
				rs = ps.executeUpdate();		
				return {data:{result: "OK"},code:code}
			}
			catch (e) {
				return{data:{error: "Internal server error: "+ e.toString() + "; SQL: "+ sql + "; JSON: "+ env.params.data}, status: 501}
			}
			finally {
				ps && ps.close();
				conn && conn.close();
			}
		},
		remove: function(env,o){
			var code = 200;
			var rs,ps,conn;
			try {
				conn = getDbConn();
				var sql = "delete from "+ o.table+ " where "+ o.id + " ='"+ env.params[o.id] + "'";
				ps = conn.prepareStatement(sql);        
				rs = ps.executeUpdate();								
				return {data:{result: "OK"},code:code}
			}
			catch (e) {
				return{data:{error: "Internal server error: "+ e.toString() + "; SQL: "+ sql}, status: 501}
			}
			finally {
				ps && ps.close();
				conn && conn.close();
			}
		}
	},
	
	config:{
		fields: ["key", "value"],
		types: ["string", "string"],
		table: "admin.config_table",
		root: 'options',
		id: 'key',
		getList: function() {					
			return services.abstractService.getList(services.config);
		},		
		getSingle: function(env){
			return services.abstractService.getSingle(env,services.config);
		},
		insert: function(env){			
			return services.abstractService.insert(env,services.config);
		},
		update: function(env){
			return services.abstractService.update(env,services.config);
		},
		remove: function(env){
			return services.abstractService.remove(env,services.config);
		}
	},
	animation: {
		fields: ["anim_id", "url", "title", "layers", "x_axis"], /*, "user_created", "user_modified", "date_created", "date_modified"],*/
		types: ["int", "string", "string", "array", "array", "string", "string", "string", "string"],
		table: "admin.ov_animation_catalog",
		root: 'layers',
		id: 'anim_id',
		getList: function() {		
			return services.abstractService.getList(services.animation);
		},
		getSingle: function(env){
			return services.abstractService.getSingle(env,services.animation);						
		},
		insert: function(env){
			return services.abstractService.insert(env,services.animation);
		},
		update: function(env){
			return services.abstractService.update(env,services.animation);
		},
		remove: function(env){
			return services.abstractService.remove(env,services.animation);
		}
	},
	charts: {
		fields: ["chart_id", "url", "is_default", "title", "layers", "x_axis", "y_axis"], /*, "user_created", "user_modified", "date_created", "date_modified"],*/
		types: ["int", "string", "boolean", "string", "array", "array", "array", "string", "string", "string", "string"],
		table: "admin.ov_charts_catalog",
		root: 'charts',
		id: 'chart_id',
		getList: function() {		
			return services.abstractService.getList(services.charts);
		},
		getSingle: function(env){
			return services.abstractService.getSingle(env,services.charts);
		},
		insert: function(env){
			env.params.data = JSON.parse(env.params.data);
			env.params.data.is_default = env.params.data.is_default ? true : false;
			return services.abstractService.insert(env,services.charts);
		},
		update: function(env){
			return services.abstractService.update(env,services.charts);
		},
		updateDefault : function(env){
			var code = 200;
			var o = services.charts;
			var rs,ps,conn;
			try {
				conn = getDbConn();					
				var sql = "update "+ o.table + " SET is_default=false";
				ps = conn.prepareStatement(sql);        
				rs = ps.executeUpdate();		
				sql = "update "+ o.table + " SET is_default='true' where "+ o.id + "="+env.params[o.id];
				ps = conn.prepareStatement(sql);        
				rs = ps.executeUpdate();		
				return {data:{result: "OK"},code:code}
			}
			catch (e) {
				return{data:{error: "Internal server error: "+ e.toString() + "; SQL: "+ sql + "; JSON: "+ env.params.data}, status: 501}
			}
			finally {
				ps && ps.close();
				conn && conn.close();
			}
		},
		remove: function(env){
			return services.abstractService.remove(env,services.charts);
		}
	},
	wms:{
		fields: ["id", "url", "rest_url", "server_name"], /*, "user_created", "user_modified", "date_created", "date_modified"],*/
		types: ["id", "string", "string", "string", "string", "string", "string", "string"],
		table: "admin.ov_wms_catalog",
		root: 'services',
		id: 'id',
		getList: function() {	
			return services.abstractService.getList(services.wms);
		},
		getSingle: function(env){
			return services.abstractService.getSingle(env,services.wms);
		},
		insert: function(env){
			return services.abstractService.insert(env,services.wms);
		},
		update: function(env){
			return services.abstractService.update(env,services.wms);
		},
		remove: function(env){
			return services.abstractService.remove(env,services.wms);
		}
	},
	arcgis:{	
		fields: ["id", "url", "title"], /*, "user_created", "user_modified", "date_created", "date_modified"],*/
		types: ["int", "string", "string", "string", "string", "string", "string"],
		table: "admin.ov_arcgis_catalog",
		root: 'servers',
		id: 'id',
		getList: function() {					
			return services.abstractService.getList(services.arcgis);
		},
		getSingle: function(id){
			return services.abstractService.getSingle(env,services.arcgis);
		},
		insert: function(env){
			return services.abstractService.insert(env,services.arcgis);
		},
		update: function(env){
			return services.abstractService.update(env,services.arcgis);
		},
		remove: function(env){
			return services.abstractService.remove(env,services.arcgis);
		}
	},
	rss:{	
		fields: ["id", "url",/* "timer", */"icon", "name", "access"], /*, "user_created", "user_modified", "date_created", "date_modified"],*/
		types: ["int", "string", /*"int",*/ "string", "string", "string", "string", "string", "string", "string"],
		table: "admin.ov_rss_catalog",
		root: 'services',
		id: 'id',
		getList: function() {					
			return services.abstractService.getList(services.rss);
		},
		getSingle: function(id){
			return services.abstractService.getSingle(env,services.rss);
		},
		insert: function(env){
			return services.abstractService.insert(env,services.rss);
		},
		update: function(env){
			return services.abstractService.update(env,services.rss);
		},
		remove: function(env){
			return services.abstractService.remove(env,services.rss);
		}
	},
	rubricator:{
		fields: ["gid", "nodeid", "nodename", "resourceid", "layername", "stylename","serverpath", "servicepath","servicetype", "parentnode","isservice", "islayer", "workspace"/*, "user_created", "user_modified", "date_created", "date_modified"*/],
		types: ["string", "string", "string", "string", "string", "string","string", "string","string", "string","string", "string", "string"],
		table: "admin.toc",
		root: 'layers',
		id: 'gid',
		getTree: function() {
			var allNodes = {};
			var code = 200;
			var rs,ps,conn,sql;
			try {
				var getParentNode = function(node) {					
					return allNodes[node.parentnode];
				}
				conn = getDbConn();
				sql = "SELECT "+ services.rubricator.fields.join(",") + " FROM "+ services.rubricator.table + " order by nodeid asc";				
				ps = conn.prepareStatement(sql);        
				rs = ps.executeQuery();
				var layers = {children: []};
				
				var i = 0;
				var ch =0;
				var par = 0;
				
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
					
					allNodes[parsed.nodeid]=parsed;
					//var parent = getParentNode(layers, parsed.parentnode)
					var parent = getParentNode(parsed);
			//		system.print(parent);
					if (parent) {
						parent.children.push(parsed);		
						par++;			
					}
					else {
						if (parsed.parentnode=="."){
							layers.children.push(parsed);				
						}
						ch++;
					}
					i++;
				}
				
				return {data:layers,code:code}
			}
			catch (e) {
				return{data:{error: "Internal server error: "+ e.toString() + "; SQL : " + sql}, status: 501}
			}
			finally{
				rs && rs.close && rs.close();
				ps && ps.close && ps.close();
				conn && conn.close && conn.close();				
			}			
		},
		getList: function() {		
			return services.abstractService.getList(services.rubricator);
		},
		getSingle: function(env){
			return services.abstractService.getSingle(env,services.rubricator);
		},
		insert: function(env){
			return services.abstractService.insert(env,services.rubricator);
		},
		update: function(env){
			return services.abstractService.update(env,services.rubricator);
		},
		remove: function(env){
			return services.abstractService.remove(env,services.rubricator);
		}
	}	
}
exports.app = function(env, pathInfo) {
    // TODO: make it so this is unnecessary
    env.pathInfo = pathInfo || "";
    var resp;
    var method = env.method;
	if (!env.params.username) {
		//resp = createResponse({data:{error: "'username' parameter is missing - authentification required"}, status: 403});
	} //else 
	try {
		if (services[env.params.service]) {
			resp = createResponse(services[env.params.service][env.params.action].call(this,env));
		}
		else {
			resp = createResponse({data:{error: "Not found: "+ env.params.service}, status: 404});
		}
	}
	catch(e){
		resp = createResponse({data:{error: "Internal server error: "+ e.toString()}, status: 501});
	}
    return resp;    
};
