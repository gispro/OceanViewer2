
Ext.namespace("gxp.plugins");

gxp.plugins.OverviewGxpTool = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_measure */
    ptype: "gxp_overviewgxptool",

    config: null,
    overviewGxpTool: null,
    map: null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.OverviewGxpTool.superclass.constructor.apply(this, arguments);
        this.config = config;
    },
    
    init: function(target) {
        var ths = this;
        //target.on("ready", function()
        {
            //ths.config.controlOptions.layers = [target.mapPanel.map.layers[0].clone()];
            ths.overviewGxpTool = new OpenLayers.Control.OverviewMap(ths.config.controlOptions);
            ths.map = target.mapPanel.map;
            ths.map.addControl(ths.overviewGxpTool);
            
            
            gxp.plugins.OverviewGxpTool.superclass.init.apply(ths, arguments);
        }
        //;
    },
    

    /** private: method[destroy]
     */
    destroy: function() {
        this.overviewGxpTool.destroy();
        this.overviewGxpTool = null;
        this.map = null;
        gxp.plugins.OverviewGxpTool.superclass.destroy.apply(this, arguments);
    }
});

Ext.preg(gxp.plugins.OverviewGxpTool.prototype.ptype, gxp.plugins.OverviewGxpTool);

