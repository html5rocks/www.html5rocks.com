function Palette()

{

	var canvas, context, offsetx, offsety, radius = 90,
	count = 1080, oneDivCount = 1 / count, countDiv360 = count / 360, degreesToRadians = Math.PI / 180,

	i, angle, angle_cos, angle_sin, gradient;

	

	canvas = document.createElement("canvas");

	canvas.width = 500;

	canvas.height = 300;
	

	offsetx = canvas.width ;

	offsety = canvas.height ;

	

	context = canvas.getContext("2d");

	context.lineWidth = 1;

	

	// http://www.boostworthy.com/blog/?p=226

	

	for(i = 0; i < count; i++)

	{

		angle = i / countDiv360 * degreesToRadians;
		angle_cos = Math.cos(angle);
		angle_sin = Math.sin(angle);

		

		context.strokeStyle = "hsl(" + Math.floor( (i * oneDivCount) * 360 ) + ", 100%, 50%)";

		context.beginPath();

		context.moveTo(angle_cos + offsetx, angle_sin + offsety);

		context.lineTo(angle_cos * radius + offsetx, angle_sin * radius + offsety);

		context.stroke();

	}
	
	gradient = context.createRadialGradient(offsetx, offsetx, 0, offsetx, offsetx, radius);
	gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
	
	context.fillStyle = gradient;
	context.fillRect(0, 0, canvas.width, canvas.height);

	

	return canvas;

}
