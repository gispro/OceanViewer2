var userHelp;

function menuOnCheckHelpWindow(cmp, checked){
	if( Ext.getCmp('helpWindowCheckButton')){

		if(checked){
			openHelpWindow();
		}
		else{
			if(userHelp)
				userHelp.hide();
			Ext.getCmp('helpWindowToggleButton').toggle(false);
			Ext.getCmp('helpWindowCheckButton').setChecked(false);
		}
	}
}

function showHelpPage(id){
	userHelp.addTabWithId(id);
}
function openHelpWindow(){
	var checkMenuItem = Ext.getCmp('helpWindowCheckButton'),
		toggleButton = Ext.getCmp('helpWindowToggleButton');
	if(!userHelp){
		if(!appOptions.helpInfoRef){
			alert('В конфигурации не найдена секция помощи '+helpInfoRef);
			return;
		}
		toggleButton.disable();
		checkMenuItem.disable();
		loadJsonFile('Загрузка структуры документации',
					appOptions.helpInfoRef,
					true,
					function(helpInfoObject){
						userHelp=new HelpObject(helpInfoObject, 'Справка');
						userHelp.on('hide',
									function(wnd){
										menuOnCheckHelpWindow(userHelp, false);
									});
						userHelp.show();
						toggleButton.enable();
						checkMenuItem.enable();
						toggleButton.toggle(true);
						checkMenuItem.setChecked(true);
					},
					function(message){ // on error
						toggleButton.enable();
						checkMenuItem.enable();
						toggleButton.toggle(false);
						checkMenuItem.setChecked(false);
						return message;
					});
	}
	else{
		userHelp.show();
		toggleButton.toggle(true);
		checkMenuItem.setChecked(true);
	}
}