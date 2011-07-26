var connect = function(driverClass, url, options) {

    Packages.java.lang.Class.forName(driverClass);
    var info = new Packages.java.util.Properties();
    for (var key in options) {
        info.setProperty(key, String(options[key]));
    }

    var conn = Packages.java.sql.DriverManager.getConnection(url, info);

    return conn;

};

exports.connect = connect;
