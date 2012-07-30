function HSB2RGB(hue, sat, val)
{
	var red, green, blue,
	i, f, p, q, t;

	if (val == 0)
		return [ 0, 0, 0 ];
	
	hue *= 0.016666667; // /= 60;
	sat *= 0.01; // /= 100;
	val *= 0.01; // /= 100;
		
	i = Math.floor(hue);
	f = hue - i;
	p = val * (1 - sat);
	q = val * (1 - (sat * f));
	t = val * (1 - (sat * (1 - f)));
	
	switch(i)
	{
		case 0: red = val; green = t; blue = p; break;
		case 1: red = q; green = val; blue = p; break;
		case 2: red = p; green = val; blue = t; break;
		case 3: red = p; green = q; blue = val; break;
		case 4: red = t; green = p; blue = val; break;
		case 5: red = val; green = p; blue = q; break;
	}
	
	return [red, green, blue];
}

function RGB2HSB(red, green, blue)
{
	var x, f, i, hue, sat, val;

	x = Math.min( Math.min( red, green ), blue );
	val = Math.max( Math.max( red, green ), blue );

	if (x==val)
		return [0, 0, val*100];

	f = (red == x) ? green - blue : ((green == x) ? blue - red : red - green);
	i = (red == x) ? 3 : ((green == x) ? 5 : 1);
	
	hue = Math.floor((i - f / (val - x)) * 60) % 360;
	sat = Math.floor(((val - x) / val) * 100);
	val = Math.floor(val * 100);
	
	return [hue, sat, val];
}
