var len = 400;
var SLIDER_TICK_LEFT  = 6;
var SLIDER_TICK_TOP   = 12;
var SLIDER_TITLE_TOP  = 18;
var SLIDER_TITLE_LEFT = 4;
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function drawSliderScale(slider, component, scale)
{
	var cell = document.getElementById(component);
	var x1     = SLIDER_TITLE_LEFT;
	var y      = slider.y + SLIDER_TITLE_TOP;
	var count  = scale.length;
	var coord_div = document.createElement('div');
	coord_div.setAttribute('id', 'coordDiv');
	coord_div.innerHTML = "<div style='position:absolute;top:" + y + "px;left:" + x1 + 
	                      "px;font-size:9px;font-family:sans-serif;color:#aaa4a1'>" + scale[0] + "</div>";
	
	cell.appendChild(coord_div);

	var cnt  = (count - 1);
	var offs = len / cnt;
	x1 = x1 - 3;

//	alert ('drawScale : cnt = ' + cnt + ', len = ' + len + ', offs = ' + offs);

	for (var i = 0; i < cnt; i++)
	{
		coord_div = document.createElement('div');
		coord_div.setAttribute('id', 'coord' + i + 'Div');
		var x = x1 + offs * (i + 1);
		coord_div.innerHTML = "<div style='position:absolute;top:" + y + "px;left:" + x +
                              "px;font-size:10px;font-family:sans-serif;color:#aaa4a1'>" +
                              scale[i + 1] + "</div>";
		cell.appendChild(coord_div);
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function createImageDesc (x, y)
{
	return "<img src='script/images/tick.png' style='position:absolute;top:" + y + "px;left:" + x + "px;width:2px;height:6px'>";
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function drawSliderTicks(slider, component, count)
{
	var cell  = document.getElementById(component);
	var x1    = SLIDER_TICK_LEFT;
	var y     = slider.y  + SLIDER_TICK_TOP;

	var img1_div = document.createElement('div');
	img1_div.setAttribute('id', 'imgDiv');
	img1_div.innerHTML = createImageDesc (x1, y);
	cell.appendChild(img1_div);
	
	var xn = x1 + slider.width - 14;

//	alert ('drawSliderTicks : xn = ' + xn + ', ' + slider.width);

	var cnt = (count - 1) * 2;
	len = xn - x1;
	var offs = len / cnt;
	for (var i = 0; i < cnt; i++)
	{
		var img_div = document.createElement('div');
		img_div.setAttribute('id', 'img' + i + 'Div');
		var x = x1 + offs * (i + 1);
		img_div.innerHTML = createImageDesc (x, y);
		cell.appendChild(img_div);
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function removeSliderScale(component, count)
{
	var slider = document.getElementById(component);
	var cnt    = count - 1;
	for (var i = 0; i < cnt; i++)
	{
		var img = document.getElementById('coord' + i + 'Div');
		if (img != null)
			slider.removeChild(img);
	}
	slider.removeChild(document.getElementById('coordDiv'));
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function removeSliderTicks(component, count)
{
	var slider = document.getElementById(component);
	var cnt    = (count - 1) * 2;
	for (var i = 0; i < cnt; i++)
	{
		var img = document.getElementById('img' + i + 'Div');
		slider.removeChild(img);
	}
	slider.removeChild(document.getElementById('imgDiv'));
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
