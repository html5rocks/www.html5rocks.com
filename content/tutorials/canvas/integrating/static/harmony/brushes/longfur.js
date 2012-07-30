function longfur( context )
{
	this.init( context );
}

longfur.prototype =
{
	context: null,

	points: null, count: null,

	init: function( context )
	{
		this.context = context;
		this.context.globalCompositeOperation = 'source-over';
		
		this.points = new Array();
		this.count = 0;
	},

	destroy: function()
	{
	},

	strokeStart: function( mouseX, mouseY )
	{
	},

	stroke: function( mouseX, mouseY )
	{
		var i, size, dx, dy, d;

		this.points.push( [ mouseX, mouseY ] );
		
		this.context.lineWidth = BRUSH_SIZE;		
		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.05 * BRUSH_PRESSURE + ")";

		for (i = 0; i < this.points.length; i++)
		{
			size = -Math.random();
			dx = this.points[i][0] - this.points[this.count][0];
			dy = this.points[i][1] - this.points[this.count][1];
			d = dx * dx + dy * dy;

			if (d < 4000 && Math.random() > d / 4000)
			{
				this.context.beginPath();
				this.context.moveTo( this.points[this.count][0] + (dx * size), this.points[this.count][1] + (dy * size));
				this.context.lineTo( this.points[i][0] - (dx * size) + Math.random() * 2, this.points[i][1] - (dy * size) + Math.random() * 2);
				this.context.stroke();
			}
		}
		
		this.count ++;
	},

	strokeEnd: function()
	{
		
	}
}
