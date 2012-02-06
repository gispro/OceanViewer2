/**
 * Copyright (c) 2008-2010 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/**
 * DOGG include GeoExt/widgets/MapPanel.js
 */

/** api: (define)
 *  module = GeoExt
 *  class = OverviewMap
 *  base_link = `Ext.Window <http://dev.sencha.com/deploy/dev/docs/?class=Ext.Window>`_
 */
Ext.namespace("GeoExt");

/** api: example
 *  Sample code to create a popup anchored to a feature:
 * 
 *  .. code-block:: javascript
 *     
 *      var popup = new GeoExt.OverviewMap({
 *          title: "My Overview Map",
 *          width: 200,
 *          height: 200,
 *          collapsible: true
 *      });
 */

/** api: constructor
 *  .. class:: Popup(config)
 *   
 *      Popups are a specialized Window that supports anchoring
 *      to a particular location in a MapPanel.  When a popup
 *      is anchored to a location, that means that the popup
 *      will visibly point to the location on the map, and move
 *      accordingly when the map is panned or zoomed.
 */
GeoExt.OverviewMap = Ext.extend(Ext.Window, {

    /** api: config[map]
     *  ``OpenLayers.Map`` or :class:`GeoExt.MapPanel`
     *  The map this popup will be anchored to (only required if ``anchored``
     *  is set to true and the map cannot be derived from the ``location``'s
     *  layer.
     */
    map: null,

    /**
     * Some Ext.Window defaults need to be overriden here
     * because some Ext.Window behavior is not currently supported.
     */    

    /** private: config[animCollapse]
     *  ``Boolean`` Animate the transition when the panel is collapsed.
     *  Default is ``false``.  Collapsing animation is not supported yet for
     *  popups.
     */
    animCollapse: false,

    /** private: config[shadow]
     *  ``Boolean`` Give the popup window a shadow.  Defaults to ``false``
     *  because shadows are not supported yet for popups (the shadow does
     *  not look good with the anchor).
     */
    shadow: false,

    /** api: config[popupCls]
     *  ``String`` CSS class name for the popup DOM elements.  Default is
     *  "gx-overview_map".
     */
    popupCls: "gx-overview_map",

    /** api: config[ancCls]
     *  ``String``  CSS class name for the popup's anchor.
     */
    ancCls: null,

    /** private: method[initComponent]
     *  Initializes the popup.
     */
    initComponent: function() {
        
        var ol = new OpenLayers.Layer.WMS(
            "Blanck", 
            "http://oceanviewer.ru/cache/service/wms",
            {
                layers: 'eko_merge'
            }
        );        
        
        this.omc = new OpenLayers.Control.OverviewMap( {maximized: true, 
            mapOptions: {
                    projection: new OpenLayers.Projection("EPSG:900913"),
                    units: "m",
                    maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)
            }, layers: [ol]})
        this.map.addControl(this.omc)
        this.contentEl = this.omc.div
        this.omc.div.style.position = 'static'
        this.omc.minimizeDiv.style.display = 'none'
        this.omc.maximizeDiv.style.display = 'none'
        //this.map.baseLayer.events.on( {loadstart: this.init_set_xy, scope: this} )
        GeoExt.Popup.superclass.initComponent.call(this)
    },

    /** private: method[setXY]
     *  Executes when map is loaded.
     */
    /*init_set_xy: function() {
        this.show()
        if(this.map.size.w != 1){
            var offset = Ext.fly(this.map.div).getBox()
            this.setPosition( offset.x, offset.y )
        }
        this.map.baseLayer.events.un( {loadstart: this.init_set_xy, scope: this} )
    },*/

    /** api: method[setSize]
     *  :param w: ``Integer``
     *  :param h: ``Integer``
     *  
     *  Sets the size of the popup, taking into account the size of the anchor.
     */
    setSize: function(w, h) {
        GeoExt.Popup.superclass.setSize.call(this, w, h);
        this.omc.mapDiv.style.height = this.body.getHeight()
        this.omc.mapDiv.style.width = this.body.getWidth()
    },

    /** private: method[beforeDestroy]
     *  Cleanup events before destroying the popup.
     */
    beforeDestroy: function() {
        this.omc.destroy()
        GeoExt.Popup.superclass.beforeDestroy.call(this);
    }
});

/** api: xtype = gx_popup */
Ext.reg('gx-overview_map', GeoExt.Popup); 
