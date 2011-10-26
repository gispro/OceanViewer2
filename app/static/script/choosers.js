var chooseOcean;

var	aquaStore = new Ext.data.JsonStore({ 
    url       : 'aqua.json',
    root      : 'features',
    fields    : ['name', 'lon', 'lat', 'zoom'],
    listeners :
    {
        loadexception : function(o, arg, nul, e)
        {
            alert("aquaStore.listeners - LoadException : " + e);
        } 
    }
});

function openAddressSearch(){
    new Ext.Window({
        title         : 'Поиск по адресу', 
        modal         : false,
        border        : true,
        bodyStyle     : "padding: 10px",
        layout        : 'fit',
        width         : 800,
        height        : 110,
        labelWidth    : 100,
        autoWidth     : false,
        autoHeight    : false,
        closeAction   : 'close',
        items         : [
        {
            xtype: "gxp_googlegeocodercombo",
            leaf : true,
            width: 200,
            listeners: {
                select: function(combo, record) {
                    var bounds = record.get("viewport").transform(
                    new OpenLayers.Projection("EPSG:4326"), this.mapPanel.map.getProjectionObject());
                    this.mapPanel.map.zoomToExtent(bounds, true);
                },
                scope: app
            }
        }
            
        ]
    }).show();
};

function openChooserOcean()
{ 
    if (!chooseOcean)
    {
        var oceanSelector = new Ext.form.ComboBox({
            //					fieldLabel: "Океаны, моря",
            emptyText: "Введите или выберите акваторию",
            displayField: 'name',
            valueField: 'name',
            editable: true,
            triggerAction: 'all',
            mode: 'local',
            store: aquaStore,
            anchor: '100%'
        });

        chooseOcean = new Ext.Window({
            title         : 'Выбор акватории', 
            modal         : false,
            border        : true,
            bodyStyle     : "padding: 10px",
            layout        : 'fit',
            width         : 800,
            height        : 110,
            labelWidth    : 100,
            autoWidth     : false,
            autoHeight    : false,
            closeAction   : 'hide',
            items         : oceanSelector,
            buttons: [
            {
                text:'Перейти',
                handler: function()
                {
                    if (aquaStore.data.length > 0)
                    {
                        for (var idx = 0; idx < aquaStore.data.length; idx++)
                        {
                            if (oceanSelector.getValue() === aquaStore.data.items[idx].get('name'))
                            {
                                var proj  = new OpenLayers.Projection ("EPSG:4326");
                                var point = new OpenLayers.LonLat (aquaStore.data.items[idx].get('lon' ),
                                    aquaStore.data.items[idx].get('lat' ));
                                point.transform(proj, app.mapPanel.map.getProjectionObject());
                                app.mapPanel.map.setCenter(point, aquaStore.data.items[idx].get('zoom'));

                                chooseOcean.hide();
                                break;
                            }
                        }
                    }
                }
            },{
                text: 'Закрыть',
                handler: function()
                {
                    chooseOcean.hide();
                }
            }]
        });
    };
    chooseOcean.show();
}
