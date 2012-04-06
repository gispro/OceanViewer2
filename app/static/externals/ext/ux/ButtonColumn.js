/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux.grid');

/**
 * @class Ext.ux.grid.ButtonColumn
 * @extends Ext.grid.Column
 * <p>A Column subclass which renders a button in each column cell.</p>
 * <p><b>Note. As of ExtJS 3.3 this no longer has to be configured as a plugin of the GridPanel.</b></p>
 * <p>Example usage:</p>
 * <pre><code>
var cm = new Ext.grid.ColumnModel([{
       header: 'Foo',
       ...
    },{
       xtype: 'buttoncolumn',
       header: 'Indoor?',
       dataIndex: 'indoor',
       width: 55
    }
]);

// create the grid
var grid = new Ext.grid.EditorGridPanel({
    ...
    colModel: cm,
    ...
});
 * </code></pre>
 * In addition to toggling a Boolean value within the record data, this
 * class toggles a css class between <tt>'x-grid3-check-col'</tt> and
 * <tt>'x-grid3-check-col-on'</tt> to alter the background image used for
 * a column.
 */
Ext.ux.grid.ButtonColumn = Ext.extend(Ext.grid.Column, {
    constructor : function(){
      Ext.ux.grid.ButtonColumn.superclass.constructor.apply(this, arguments);
    },

    renderer : function(value, id, r) {
      var id = Ext.id();
      this.createGridButton.defer(1, this, ['...', id, r]);
      return('<div id="' + id + '"></div>');
    },

    createGridButton : function(value, id, record) {
      new Ext.Button({
        text: value
        ,record: record
        ,handler : this.handler
      }).render(document.body, id);
    },

    // Deprecate use as a plugin. Remove in 4.0
    init: Ext.emptyFn
});

// register ptype. Deprecate. Remove in 4.0
Ext.preg('buttoncolumn', Ext.ux.grid.ButtonColumn);

// backwards compat. Remove in 4.0
Ext.grid.ButtonColumn = Ext.ux.grid.ButtonColumn;

// register Column xtype
Ext.grid.Column.types.buttoncolumn = Ext.ux.grid.ButtonColumn;
