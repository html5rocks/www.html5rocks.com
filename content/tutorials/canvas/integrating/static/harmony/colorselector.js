function ColorSelector( gradient )
{
	this.init( gradient );
}

ColorSelector.prototype =
{
	container: null,
	color: [0, 0, 0],

	hueSelector: null,
	luminosity: null,
	luminosityData: null,	
	luminositySelector: null,
	luminosityPosition: null,

	dispatcher: null,
	changeEvent: null,
	
	init: function(gradient)
	{
		var scope = this, context, hue, hueData;

		this.container = document.createElement('div');
		this.container.style.position = 'absolute';
		this.container.style.width = '250px';
		this.container.style.height = '250px';
		this.container.style.visibility = 'hidden';
		this.container.style.cursor = 'pointer';
		this.container.addEventListener('mousedown', onMouseDown, false);
		this.container.addEventListener('touchstart', onTouchStart, false);

		hue = document.createElement("canvas");
		hue.width = gradient.width;
		hue.height = gradient.height;
		
		context = hue.getContext("2d");
		context.drawImage(gradient, 0, 0, hue.width, hue.height);

		hueData = context.getImageData(0, 0, hue.width, hue.height).data;	
		
		this.container.appendChild(hue);
		
		this.luminosity = document.createElement("canvas");
		this.luminosity.style.position = 'absolute';
		this.luminosity.style.left = '0px';
		this.luminosity.style.top = '0px';
		this.luminosity.width = 250;
		this.luminosity.height = 250;

		this.container.appendChild(this.luminosity);

		this.hueSelector = document.createElement("canvas");
		this.hueSelector.style.position = 'absolute';
		this.hueSelector.style.left = ((hue.width - 15) / 2 ) + 'px';
		this.hueSelector.style.top = ((hue.height - 15) / 2 ) + 'px';
		this.hueSelector.width = 15;
		this.hueSelector.height = 15;
		
		context = this.hueSelector.getContext("2d");
		context.lineWidth = 2;
		context.strokeStyle = "rgba(0, 0, 0, 0.5)";
		context.beginPath();
		context.arc(8, 8, 6, 0, Math.PI * 2, true);
		context.stroke();
		context.strokeStyle = "rgba(256, 256, 256, 0.8)";
		context.beginPath();
		context.arc(7, 7, 6, 0, Math.PI * 2, true);
		context.stroke();

		this.container.appendChild( this.hueSelector );
		
		this.luminosityPosition = [ (gradient.width - 15), (gradient.height - 15) / 2 ];
		
		this.luminositySelector = document.createElement("canvas");
		this.luminositySelector.style.position = 'absolute';
		this.luminositySelector.style.left = (this.luminosityPosition[0] - 7) + 'px';
		this.luminositySelector.style.top = (this.luminosityPosition[1] - 7) + 'px';
		this.luminositySelector.width = 15;
		this.luminositySelector.height = 15;
		
		context = this.luminositySelector.getContext("2d");
		context.drawImage(this.hueSelector, 0, 0, this.luminositySelector.width, this.luminositySelector.height);
		
		this.container.appendChild(this.luminositySelector);
		
		this.dispatcher = document.createElement('div'); // this could be better handled...
		
		this.changeEvent = document.createEvent('Events');
		this.changeEvent.initEvent('change', true, true);
		
		//
		
		function onMouseDown( event )
		{
			window.addEventListener('mousemove', onMouseMove, false);
			window.addEventListener('mouseup', onMouseUp, false);
			
			update( event.clientX - scope.container.offsetLeft, event.clientY - scope.container.offsetTop );
		}
		
		function onMouseMove( event )
		{
			update( event.clientX - scope.container.offsetLeft, event.clientY - scope.container.offsetTop );
		}

		function onMouseUp( event )
		{
			window.removeEventListener('mousemove', onMouseMove, false);
			window.removeEventListener('mouseup', onMouseUp, false);
		
			update( event.clientX - scope.container.offsetLeft, event.clientY - scope.container.offsetTop );
		}
		
		function onTouchStart( event )
		{
			if(event.touches.length == 1)
			{
				event.preventDefault();

				window.addEventListener('touchmove', onTouchMove, false);
				window.addEventListener('touchend', onTouchEnd, false);
		
				update( event.touches[0].pageX - scope.container.offsetLeft, event.touches[0].pageY - scope.container.offsetTop );
			}
		}

		function onTouchMove( event )
		{
			if(event.touches.length == 1)
			{
				event.preventDefault();
			
				update( event.touches[0].pageX - scope.container.offsetLeft, event.touches[0].pageY - scope.container.offsetTop );
			}
		}

		function onTouchEnd( event )
		{
			if(event.touches.length == 0)
			{
				event.preventDefault();
			
				window.removeEventListener('touchmove', onTouchMove, false);
				window.removeEventListener('touchend', onTouchEnd, false);
			}
		}
		
		//
		
		function update(x, y)
		{
			var dx, dy, d, nx, ny;
			
			dx = x - 125;
			dy = y - 125;
			d = Math.sqrt( dx * dx + dy * dy );

			if (d < 90)
			{
				scope.hueSelector.style.left = (x - 7) + 'px';
				scope.hueSelector.style.top = (y - 7) + 'px';
				scope.updateLuminosity( [ hueData[(x + (y * 250)) * 4], hueData[(x + (y * 250)) * 4 + 1], hueData[(x + (y * 250)) * 4 + 2] ] );
			}
			else if (d > 100)
			{
				nx = dx / d;
				ny = dy / d;
			
				scope.luminosityPosition[0] = (nx * 110) + 125;
				scope.luminosityPosition[1] = (ny * 110) + 125;
			
				scope.luminositySelector.style.left = ( scope.luminosityPosition[0] - 7) + 'px';
				scope.luminositySelector.style.top = ( scope.luminosityPosition[1] - 7) + 'px';
			}
			
			x = Math.floor(scope.luminosityPosition[0]);
			y = Math.floor(scope.luminosityPosition[1]);
		
			scope.color[0] = scope.luminosityData[(x + (y * 250)) * 4];
			scope.color[1] = scope.luminosityData[(x + (y * 250)) * 4 + 1];
			scope.color[2] = scope.luminosityData[(x + (y * 250)) * 4 + 2];			
		
			scope.dispatchEvent( scope.changeEvent );
		}
	},
	
	
	//
	
	show: function()
	{
		this.container.style.visibility = 'visible';
	},
	
	hide: function()
	{
		this.container.style.visibility = 'hidden';		
	},
	
	getColor: function()
	{
		return this.color;
	},
	
	setColor: function( color )
	{
		// Ok, this is super dirty. The whole class needs some refactoring, again! :/
		
		var hsb, angle, distance, rgb, degreesToRadians = Math.PI / 180
	
		this.color = color;
		
		hsb = RGB2HSB(color[0] / 255, color[1] / 255, color[2] / 255);

		angle = hsb[0] * degreesToRadians;
		distance = (hsb[1] / 100) * 90;

		this.hueSelector.style.left = ( ( Math.cos(angle) * distance + 125 ) - 7 ) + 'px';
		this.hueSelector.style.top = ( ( Math.sin(angle) * distance + 125 ) - 7 ) + 'px';

		rgb = HSB2RGB(hsb[0], hsb[1], 100);
		rgb[0] *= 255; rgb[1] *= 255; rgb[2] *= 255;
		
		this.updateLuminosity( rgb );
		
		angle = (hsb[2] / 100) * 360 * degreesToRadians;
		
		this.luminosityPosition[0] = ( Math.cos(angle) * 110 ) + 125;
		this.luminosityPosition[1] = ( Math.sin(angle) * 110 ) + 125;
		
		this.luminositySelector.style.left = ( this.luminosityPosition[0] - 7 ) + 'px';
		this.luminositySelector.style.top = ( this.luminosityPosition[1] - 7 ) + 'px';
		
		this.dispatchEvent( this.changeEvent );
	},
	
	//
	
	updateLuminosity: function( color )
	{
		var context, angle, angle_cos, angle_sin, shade, offsetx, offsety,
		inner_radius = 100, outter_radius = 120, i, count = 1080 / 2, oneDivCount = 1 / count, degreesToRadians = Math.PI / 180,
		countDiv360 = (count / 360);
	
		offsetx = this.luminosity.width / 2;
		offsety = this.luminosity.height / 2;
	
		context = this.luminosity.getContext("2d");
		context.lineWidth = 3;
		context.clearRect(0, 0, this.luminosity.width, this.luminosity.height);
	
		for(i = 0; i < count; i++)
		{
			angle = i / countDiv360 * degreesToRadians;
			angle_cos = Math.cos(angle);
			angle_sin = Math.sin(angle);

			shade = 255 - (i * oneDivCount /* / count */) * 255;
		
			context.strokeStyle = "rgb(" + Math.floor( color[0] - shade ) + "," + Math.floor( color[1] - shade ) + "," + Math.floor( color[2] - shade ) + ")";
			context.beginPath();
			context.moveTo(angle_cos * inner_radius + offsetx, angle_sin * inner_radius + offsety);
			context.lineTo(angle_cos * outter_radius + offsetx, angle_sin * outter_radius + offsety);
			context.stroke();
		}
		
		this.luminosityData = context.getImageData(0, 0, this.luminosity.width, this.luminosity.height).data;	
	},
	
	//
	
	addEventListener: function( type, listener, useCapture )
	{
		this.dispatcher.addEventListener(type, listener, useCapture);
	},
	
	dispatchEvent: function( event )
	{
		this.dispatcher.dispatchEvent(event);
	},
	
	removeEventListener: function( type, listener, useCapture )
	{
		this.dispatcher.removeEventListener(type, listener, useCapture);
	}
}
