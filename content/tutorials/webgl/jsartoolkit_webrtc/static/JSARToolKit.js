/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * For further information please contact.
 *   ilmari.heikkinen@gmail.com
 *
 */

if (!window.console) console = { log : function(){} };

ASVector = function(elements) {
  elements = elements || 0;
  if (elements.length) {
    this.length = elements.length;
    for (var i=0; i<elements.length; i++)
      this[i] = elements[i];
  } else {
    this.length = elements;
    for (var i=0; i<elements; i++)
      this[i] = 0;
  }
}
ASVector.prototype = {};
ASVector.prototype.set = function(idx, val) {
  if (idx.length)
    ASVector.call(this, idx);
  else
    this[idx] = val;
}

if (typeof Float32Array == 'undefined') {
  FloatVector = ASVector;
  IntVector = ASVector;
  UintVector = ASVector;
} else {
  FloatVector = Float32Array;
  IntVector = Int32Array;
  UintVector = Uint32Array;
}

toInt = Math.floor;

Object.extend = function(dst, src) {
  for (var i in src) {
    try{ dst[i] = src[i]; } catch(e) {}
  }
  return dst;
}

toArray = function(obj) {
  var a = new Array(obj.length);
  for (var i=0; i<obj.length; i++)
    a[i] = obj[i];
  return a;
}

Klass = (function() {
  var c = function() {
    if (this.initialize)
      this.initialize.apply(this, arguments);
  }
  c.ancestors = toArray(arguments);
  c.prototype = {};
  for(var i = 0; i<arguments.length; i++) {
    var a = arguments[i];
    if (a.prototype) {
      Object.extend(c.prototype, a.prototype);
    } else {
      Object.extend(c.prototype, a);
    }
  }
  Object.extend(c, c.prototype);
  return c;
})

Object.asCopy = function(obj) {
  if (typeof obj != 'object') {
    return obj;
  } else if (obj instanceof FloatVector) {
    var v = new FloatVector(obj.length);
    for (var i=0; i<v.length; i++)
      v[i] = obj[i];
    return v;
  } else if (obj instanceof IntVector) {
    var v = new IntVector(obj.length);
    for (var i=0; i<v.length; i++)
      v[i] = obj[i];
    return v;
  } else if (obj instanceof UintVector) {
    var v = new UintVector(obj.length);
    for (var i=0; i<v.length; i++)
      v[i] = obj[i];
    return v;
  } else if (obj instanceof Array) {
    return obj.map(Object.asCopy);
  } else {
    var newObj = {};
    for (var i in obj) {
      var v = obj[i];
      if (typeof v == 'object') {
        v = Object.asCopy(v);
      }
      newObj[i] = v;
    }
    return newObj;
  }
}

ASKlass = (function(name) {
  var c = function() {
    var cc = this.__copyObjects__;
    for (var i=0; i<cc.length; i++)
      this[cc[i]] = Object.asCopy(this[cc[i]])
    if (this.initialize)
      this.initialize.apply(this, arguments);
  }
  c.ancestors = toArray(arguments).slice(1);
  c.prototype = {};
  for(var i = 1; i<arguments.length; i++) {
    var a = arguments[i];
    if (a.prototype) {
      Object.extend(c.prototype, a.prototype);
    } else {
      Object.extend(c.prototype, a);
    }
  }
  c.prototype.className = name;
  c.prototype.initialize = c.prototype[name];
  c.prototype.__copyObjects__ = [];
  for (var i in c.prototype) {
    var v = c.prototype[i];
    if (i != '__copyObjects__') {
      if (typeof v == 'object') {
        c.prototype.__copyObjects__.push(i);
      }
    }
  }
  Object.extend(c, c.prototype);
  return c;
})


/**
 * A partial implementation of the ActionScript3 BitmapData class.
 * See: http://www.adobe.com/livedocs/flash/9.0/ActionScriptLangRefV3/flash/display/BitmapData.html
 */
BitmapData = Klass({
  initialize : function(i_width, i_height, transparent, fill) {
    this.width = i_width;
    this.height = i_height;
    this.transparent = (transparent == null ? true : transparent);
    this.fill = (fill == null ? 0xffffffff : fill);
    this.data = new UintVector(i_width*i_height);
    for (var i=0; i<this.data.length; i++) {
      this.data[i] = fill;
    }
    this.rect = new Rectangle(0,0,this.width, this.height);
  },
  fillRect : function(rect, value) {
    var stride = this.width;
    var y = Math.clamp(rect.y,0,this.height)*stride
      , y2 = Math.clamp(rect.y+rect.height,0,this.height)*stride
      , x = Math.clamp(rect.x,0,this.width)
      , x2 = Math.clamp(rect.x+rect.width,0,this.width);
    var d = this.data;
    for (var y1=y;y1<y2; y1+=stride)
      for (var x1=x;x1<x2; x1++)
        d[y1+x1] = value;
  },
  getPixel32 : function(x,y) {
    return this.data[y*this.width + x];
  },
  setPixel32 : function(x,y,v) {
    return this.data[y*this.width + x] = v;
  },
  getPixel : function(x,y) {
    return this.data[y*this.width + x] & 0x00ffffff;
  },
  setPixel : function(x,y,v) {
    return this.data[y*this.width + x] = v | (this.data[y*this.width + x] & 0xff000000);
  },
  getWidth : function () { return this.width; },
  getHeight : function () { return this.height; },
  copyPixels : function(source, rect, offset) {
    var tstride = this.width;
    var stride = source.width;
    var d = source.data;
    var td = this.data;
    var ty = Math.clamp(offset.y,0,this.height)*tstride
      , ty2 = Math.clamp(offset.y+rect.height,0,this.height)*tstride
      , tx = Math.clamp(offset.x,0,this.width)
      , tx2 = Math.clamp(offset.x+rect.width,0,this.width);
    var y = Math.clamp(rect.y,0,source.height)*stride
      , y2 = Math.clamp(rect.y+rect.height,0,source.height)*stride
      , x = Math.clamp(rect.x,0,source.width)
      , x2 = Math.clamp(rect.x+rect.width,0,source.width);
    for (var y1=y,ty1=ty; y1<y2 && ty1<ty2; y1+=stride,ty1+=tstride)
      for (var x1=x,tx1=tx; x1<x2 && tx1<tx2; x1++,tx1++)
        td[ty1+tx1] = d[y1+x1];
  },
  getColorBoundsRect : function(mask, color, findColor) {
    if (findColor) {
      return this.getColorBoundsRect_true(mask, color);
    } else {
      return this.getColorBoundsRect_false(mask, color);
    }
  },
  getColorBoundsRect_true : function(mask, color) {
    var minX=this.width, minY=this.height, maxX=0, maxY=0;
    var w = this.width; h=this.height;
    var d = this.data;
    var m = 0, off = 0;
    minYfor: for (var y=0; y<h; y++) {
      off = y*w-1;
      for (var x=0; x<w; x++) {
        m = (d[++off] & mask) - color;
        if (!m) {
          minX = maxX = x;
          minY = maxY = y;
          break minYfor;
        }
      }
    }
    maxYfor: for (var y=h-1; y>minY; y--) {
      off = y*w-1;
      for (var x=0; x<w; x++) {
        m = (d[++off] & mask) - color;
        if (!m) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          maxY = y;
          break maxYfor;
        }
      }
    }
    for (var y=minY; y<=maxY; y++) {
      off = y*w-1;
      for (var x=0; x<minX; x++) {
        m = (d[++off] & mask) - color;
        if (!m) {
          minX = x;
          break;
        }
      }
      off = y*w+w;
      for (var x=w-1; x>maxX; x--) {
        m = (d[--off] & mask) - color;
        if (!m) {
          maxX = x;
          break;
        }
      }
    }
    return new Rectangle(minX, minY, Math.max(0,maxX-minX), Math.max(0,maxY-minY));
  },
  getColorBoundsRect_false : function(mask, color) {
    var minX=this.width, minY=this.height, maxX=0, maxY=0;
    var w = this.width; h=this.height;
    var d = this.data;
    minYfor: for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
        var m = (d[y*w+x] & mask) - color;
        if (m) {
          minX = maxX = x;
          minY = maxY = y;
          break minYfor;
        }
      }
    }
    maxYfor: for (var y=h-1; y>minY; y--) {
      for (var x=0; x<w; x++) {
        var m = (d[y*w+x] & mask) - color;
        if (m) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          maxY = y;
          break maxYfor;
        }
      }
    }
    for (var y=minY; y<=maxY; y++) {
      for (var x=0; x<minX; x++) {
        var m = (d[y*w+x] & mask) - color;
        if (m) {
          minX = x;
          break;
        }
      }
      for (var x=h-1; x>maxX; x--) {
        var m = (d[y*w+x] & mask) - color;
        if (m) {
          maxX = x;
          break;
        }
      }
    }
    return new Rectangle(minX, minY, Math.max(0,maxX-minX), Math.max(0,maxY-minY));
  },
  putImageData : function(imageData, x,y, w,h) {
    w = Math.clamp(w,0,imageData.width), h = Math.clamp(h,0,imageData.height);
    var stride = this.width;
    var d = this.data;
    var td = imageData.data;
    var y = Math.clamp(y,0,this.height)*stride
      , y2 = Math.clamp(y+h,0,this.height)*stride
      , x = Math.clamp(x,0,this.width)
      , x2 = Math.clamp(x+w,0,this.width);
    for (var y1=y,ty1=0; y1<y2; y1+=stride,ty1+=imageData.width*4) {
      for (var x1=x,tx1=0; x1<x2; x1++,tx1+=4) {
        d[y1+x1] = ( // transform canvas pixel to 32-bit ARGB int
          (td[ty1+tx1] << 16) |
          (td[ty1+tx1+1] << 8) |
          (td[ty1+tx1+2]) |
          (td[ty1+tx1+3] << 24)
        );
      }
    }
  },
  drawCanvas : function(canvas, x,y,w,h) {
    this.putImageData(canvas.getContext('2d').getImageData(0,0,w,h),x,y,w,h);
  },
  drawOnCanvas : function(canvas) {
    var ctx = canvas.getContext('2d');
    var id = ctx.getImageData(0,0,this.width,this.height);
    var stride = this.width;
    var length = this.height*stride;
    var d = this.data;
    var td = id.data;
    for (var y=0; y<length; y+=stride) {
      for (var x=0; x<stride; x++) {
        var base = 4*(y+x);
        var c = d[y+x];
        td[base] = (c >> 16) & 0xff;
        td[++base] = (c >> 8) & 0xff;
        td[++base] = (c) & 0xff;
        td[++base] = (c >> 24) & 0xff;
      }
    }
    ctx.putImageData(id, 0,0);
  },
  floodFill : function(x, y, nv) {
    var l=0, x1=0, x2=0, dy=0;
    var ov=0; /* old pixel value */
    var stack = [];
    var w = this.width, h = this.height;
    var stride = this.width;
    var data = this.data;

    ov = data[y*stride + x];
    if (ov==nv || x<0 || x>=w || y<0 || y>=h) return;
    stack.push([y, x, x, 1]);     /* needed in some cases */
    stack.push([y+1, x, x, -1]);    /* seed segment (popped 1st) */

    while (stack.length > 0) {
      /* pop segment off stack and fill a neighboring scan line */
      var a = stack.pop();
      y = a[0]+a[3], x1 = a[1], x2 = a[2], dy = a[3];
      /*
      * segment of scan line y-dy for x1<=x<=x2 was previously filled,
      * now explore adjacent pixels in scan line y
      */
      for (x=x1; x>=0 && data[y*stride + x]==ov; x--)
        data[y*stride + x] = nv;
      if (x<x1) {
        l = x+1;
        if (l<x1) stack.push([y, l, x1-1, -dy]);    /* leak on left? */
        x = x1+1;
        for (; x<w && data[y*stride + x]==ov; x++)
          data[y*stride + x] = nv;
        stack.push([y, l, x-1, dy]);
        if (x>x2+1) stack.push([y, x2+1, x-1, -dy]);  /* leak on right? */
      }
      for (x++; x<=x2 && data[y*stride + x]!=ov; x++)
        null;
      l = x;
      while (x<=x2) {
        for (; x<w && data[y*stride + x]==ov; x++)
          data[y*stride + x] = nv;
        stack.push([y, l, x-1, dy]);
        if (x>x2+1) stack.push([y, x2+1, x-1, -dy]);  /* leak on right? */
        for (x++; x<=x2 && data[y*stride + x]!=ov; x++)
          null;
        l = x;
      }
    }
  }
})

Rectangle = Klass({
  initialize : function(x,y,w,h){
    this.x = x; this.y = y;
    this.top = y; this.left = x;
    this.bottom = y+h; this.right = x+w;
    this.width = w; this.height = h;
    this.updateCalc();
  },
  updateCalc : function() {
    this.top = this.y;
    this.left = this.x;
    this.bottom = this.y+this.height;
    this.right = this.x+this.width;
  },
  clone : function() {
    return new Rectangle(this.x, this.y, this.width, this.height);
  },
  inflate : function(dx,dy) {
    this.x -= dx;
    this.y -= dy;
    this.width += 2 * dx;
    this.height += 2 * dy;
    this.updateCalc();
  },
  isEmpty : function() {
    return (this.width <= 0 && this.height <= 0)
  }
})

/**
  * The Exception object used by NyARToolkit.
  */
NyARException = Klass(Error,
{
  initialize : function(m)
  {
    Error.call(this,m);
  },
  trap : function(m)
  {
    throw new NyARException("trap:" + m);
  },

  notImplement : function()
  {
    throw new NyARException("Not Implement!");
  }
})

NyAS3Const_Inherited = Klass({
})

NyAS3Utils = Klass(
{
  assert : function(e, mess)
  {
    if(!e){throw new Error("NyAS3Utils.assert:"+mess!=null?mess:"");}
  }
})

NyARVec = Klass(
{
  clm : null,
  v : null,

  initialize : function(i_clm)
  {
    this.v = new FloatVector(i_clm);
    this.clm = i_clm;
  },

  getClm : function()
  {
    return this.clm;
  },
  getArray : function()
  {
    return this.v;
  }
})

/**
  * ARMat構造体に対応するクラス typedef struct { double *m; int row; int clm; }ARMat;
  *
  */
NyARMat = Klass(
{
  /**
    * 配列サイズと行列サイズは必ずしも一致しないことに注意 返された配列のサイズを行列の大きさとして使わないこと！
    *
    */
  m : null,
  __matrixSelfInv_nos : null,

  clm : null,
  row : null,

  initialize : function(i_row,i_clm)
  {
    this.m = new Array(i_row);
    for (var i=0; i<i_row; i++) {
      this.m[i] = new FloatVector(i_clm);
      for (var j=0; j<i_clm; j++)
        this.m[i][j] = 0.0;
    }
    this.__matrixSelfInv_nos=new FloatVector(i_row);
    this.clm = i_clm;
    this.row = i_row;
    return;
  }
  /**
    * 行列の列数を返します。
    * @return
    */
  ,getClm : function()
  {
    return this.clm;
  }
  /**
    * 行列の行数を返します。
    * @return
    */
  ,getRow : function()
  {
    return this.row;
  }
  ,getArray : function()
  {
    return this.m;
  }
  /**
    * 逆行列を計算して、thisへ格納します。
    * @throws NyARException
    */
  ,matrixSelfInv : function()
  {
    var ap = this.m;
    var dimen = this.row;
    var dimen_1 = dimen - 1;
    var ap_n, ap_ip, ap_i;// wap;
    var j, ip, nwork;
    var nos = this.__matrixSelfInv_nos;//ワーク変数
    // double epsl;
    var p, pbuf, work;

    /* check size */
    switch (dimen) {
    case 0:
      throw new NyARException();
    case 1:
      ap[0][0] = 1.0 / ap[0][0];// *ap = 1.0 / (*ap);
      return true;/* 1 dimension */
    }
    var n;
    for (n = 0; n < dimen; n++) {
      nos[n] = n;
    }

    /*
      * nyatla memo ipが定まらないで計算が行われる場合があるので挿入。 ループ内で0初期化していいかが判らない。
      */
    ip = 0;
    // For順変更禁止
    for (n = 0; n < dimen; n++) {
      ap_n = ap[n];// wcp = ap + n * rowa;
      p = 0.0;
      for (var i = n; i < dimen; i++) {
        if (p < (pbuf = Math.abs(ap[i][0]))) {
          p = pbuf;
          ip = i;
        }
      }
      // if (p <= matrixSelfInv_epsl){
      if (p == 0.0) {
        return false;
        // throw new NyARException();
      }

      nwork = nos[ip];
      nos[ip] = nos[n];
      nos[n] = nwork;

      ap_ip = ap[ip];
      for (j = 0; j < dimen; j++) {// for(j = 0, wap = ap + ip * rowa,
                      // wbp = wcp; j < dimen ; j++) {
        work = ap_ip[j]; // work = *wap;
        ap_ip[j] = ap_n[j];
        ap_n[j] = work;
      }

      work = ap_n[0];
      for (j = 0; j < dimen_1; j++) {
        ap_n[j] = ap_n[j + 1] / work;// *wap = *(wap + 1) / work;
      }
      ap_n[j] = 1.0 / work;// *wap = 1.0 / work;
      for (i = 0; i < dimen; i++) {
        if (i != n) {
          ap_i = ap[i];// wap = ap + i * rowa;
          work = ap_i[0];
          for (j = 0; j < dimen_1; j++) {// for(j = 1, wbp = wcp,work = *wap;j < dimen ;j++, wap++, wbp++)
            ap_i[j] = ap_i[j + 1] - work * ap_n[j];// wap = *(wap +1) - work *(*wbp);
          }
          ap_i[j] = -work * ap_n[j];// *wap = -work * (*wbp);
        }
      }
    }

    for (n = 0; n < dimen; n++) {
      for (j = n; j < dimen; j++) {
        if (nos[j] == n) {
          break;
        }
      }
      nos[j] = nos[n];
      for (i = 0; i < dimen; i++) {
        ap_i = ap[i];
        work = ap_i[j];// work = *wap;
        ap_i[j] = ap_i[n];// *wap = *wbp;
        ap_i[n] = work;// *wbp = work;
      }
    }
    return true;
  }
})

ArrayUtils = ASKlass('ArrayUtils',
{
  create2dInt : function(height, width)
  {
    var r = new Array(height);
    for (var i = 0; i < height; i++){
      r[i] = new IntVector(width);
    }
    return r;
  }
  ,create2dNumber : function(height, width)
  {
    var r = new Array(height);
    for (var i = 0; i < height; i++){
      r[i] = new FloatVector(width);
    }
    return r;
  }
  ,copyInt : function(src, srcPos, dest, destPos, length) {
    for (var i = 0; i < length; i++) {
      dest[destPos + i] = src[srcPos + i];
    }
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this framework; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
ArrayUtil = ASKlass('ArrayUtil', {
  createJaggedArray : function(len) {
    var arr = new Array(len);
    var args = toArray(arguments).slice(1);
    while (len--) {
      arr[len] = args.length ? this.createJaggedArray.apply(null, args) : 0;
    }
    return arr;
  }
  ,create2d : function(height, width) {
    return this.createJaggedArray(height, width);
  }
  ,create3d : function(depth, height, width) {
    return this.createJaggedArray(depth, height, width);
  }
  ,copy : function(src, srcPos, dest, destPos, length) {
    for (var i = 0; i < length; i++) {
      dest[destPos + i] = src[srcPos + i];
    }
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this framework; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARException = ASKlass('FLARException', NyARException,
{
  FLARException : function(m)
  {
    NyARException.initialize.call(this,m||'');
  }
  ,trap : function(m)
  {
    throw new FLARException("trap:" + m);
  }
  ,notImplement : function()
  {
    throw new FLARException("Not Implement!");
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARMat = NyARMat;
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARRgbPixelReader_BitmapData = ASKlass('FLARRgbPixelReader_BitmapData',
{
  _ref_bitmap : null
  ,FLARRgbPixelReader_BitmapData : function(i_buffer)
  {
    this._ref_bitmap = i_buffer;
  }
  ,getPixel : function(i_x, i_y, o_rgb)
  {
    var c = this._ref_bitmap.getPixel(i_x, i_y);
    o_rgb[0] = (c >> 16) & 0xff;// R
    o_rgb[1] = (c >> 8) & 0xff;// G
    o_rgb[2] = c & 0xff;// B
    return;
  }
  ,getPixelSet : function(i_x, i_y, i_num, o_rgb)
  {
    var bmp = this._ref_bitmap;
    var c;
    var i;
    for (i = 0; i < i_num; i++) {
      c = bmp.getPixel(i_x[i], i_y[i]);
      o_rgb[i*3+0] = (c >> 16) & 0xff;
      o_rgb[i*3+1] = (c >> 8) & 0xff;
      o_rgb[i*3+2] = c & 0xff;
    }
  }
  ,setPixel : function(i_x, i_y, i_rgb)
  {
    NyARException.notImplement();
  }
  ,setPixels : function(i_x, i_y, i_num, i_intrgb)
  {
    NyARException.notImplement();
  }
  ,switchBuffer : function(i_ref_buffer)
  {
    NyARException.notImplement();
  }
})
FLARGrayPixelReader_BitmapData = ASKlass('FLARGrayPixelReader_BitmapData',
{
  _ref_bitmap : null
  ,FLARGrayPixelReader_BitmapData : function(i_buffer)
  {
    this._ref_bitmap = i_buffer;
  }
  ,getPixel : function(i_x, i_y, i_num, o_gray)
  {
    NyARException.notImplement();
    var w = this._ref_bitmap.getWidth();
    var d = this._ref_bitmap.getBuffer();
    o_gray[0] = o_gray[1] = o_gray[2] = ~d(i_x + w*i_y) & 0xff;
  }
  ,getPixelSet : function(i_x, i_y, i_num, o_gray)
  {
    var w = this._ref_bitmap.getWidth();
    var d = this._ref_bitmap.data;
    for (var i = 0; i < i_num; i++) {
      o_gray[i] = ~d[i_x[i] + w*i_y[i]] & 0xff;
    }
  }
  ,setPixel : function(i_x, i_y, i_rgb)
  {
    NyARException.notImplement();
  }
  ,setPixels : function(i_x, i_y, i_num, i_intrgb)
  {
    NyARException.notImplement();
  }
  ,switchBuffer : function(i_ref_buffer)
  {
    NyARException.notImplement();
  }
})/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */
INyARHistogramAnalyzer_Threshold = ASKlass('INyARHistogramAnalyzer_Threshold',
{
  getThreshold : function(i_histgram){}
})
NyARHistogramAnalyzer_SlidePTile = ASKlass('NyARHistogramAnalyzer_SlidePTile', INyARHistogramAnalyzer_Threshold,
{
  _persentage : 0,
  NyARHistogramAnalyzer_SlidePTile : function(i_persentage)
  {
    NyAS3Utils.assert (0 <= i_persentage && i_persentage <= 50);
    //初期化
    this._persentage=i_persentage;
  }
  ,getThreshold : function(i_histgram)
  {
    //総ピクセル数を計算
    var n=i_histgram.length;
    var sum_of_pixel=i_histgram.total_of_data;
    var hist=i_histgram.data;
    // 閾値ピクセル数確定
    var th_pixcels = sum_of_pixel * this._persentage / 100;
    var th_wk;
    var th_w, th_b;
    // 黒点基準
    th_wk = th_pixcels;
    for (th_b = 0; th_b < n-2; th_b++) {
      th_wk -= hist[th_b];
      if (th_wk <= 0) {
        break;
      }
    }
    // 白点基準
    th_wk = th_pixcels;
    for (th_w = n-1; th_w > 1; th_w--) {
      th_wk -= hist[th_w];
      if (th_wk <= 0) {
        break;
      }
    }
    // 閾値の保存
    return (th_w + th_b) / 2;
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */
INyARPca2d = ASKlass('INyARPca2d',
{
  /**
   * 通常のPCA
   * @param i_v1
   * @param i_v2
   * @param i_start
   * @param i_number_of_point
   * @param o_evec
   * 要素2の変数を指定してください。
   * @param o_ev
   * 要素2の変数を指定してください。
   * @param o_mean
   * @throws NyARException
   */
  pca : function(i_v1, i_v2, i_number_of_point, o_evec, o_ev, o_mean){}
})
NyARPca2d_MatrixPCA_O2 = ASKlass('NyARPca2d_MatrixPCA_O2', INyARPca2d,
{
  PCA_EPS : 1e-6, // #define EPS 1e-6
  PCA_MAX_ITER : 100, // #define MAX_ITER 100
  PCA_VZERO : 1e-16, // #define VZERO 1e-16
  /**
   * static int QRM( ARMat *a, ARVec *dv )の代替関数
   *
   * @param a
   * @param dv
   * @throws NyARException
   */
  PCA_QRM : function(o_matrix,dv)
  {
    var w, t, s, x, y, c;
    var ev1;
    var dv_x,dv_y;
    var mat00,mat01,mat10,mat11;
    // <this.vecTridiagonalize2d(i_mat, dv, ev);>
    dv_x = o_matrix.m00;// this.m[dim - 2][dim - 2];// d.v[dim-2]=a.m[dim-2][dim-2];//d->v[dim-2]=a->m[(dim-2)*dim+(dim-2)];
    ev1 = o_matrix.m01;// this.m[dim - 2][dim - 1];// e.v[dim-2+i_e_start]=a.m[dim-2][dim-1];//e->v[dim-2] = a->m[(dim-2)*dim+(dim-1)];
    dv_y = o_matrix.m11;// this.m[dim - 1][dim - 1];// d.v[dim-1]=a_array[dim-1][dim-1];//d->v[dim-1] =a->m[(dim-1)*dim+(dim-1)];
    // 単位行列にする。
    mat00 = mat11 = 1;
    mat01 = mat10 = 0;
    // </this.vecTridiagonalize2d(i_mat, dv, ev);>
    // int j = 1;
    // // while(j>0 && fabs(ev->v[j])>EPS*(fabs(dv->v[j-1])+fabs(dv->v[j])))
    // while (j > 0 && Math.abs(ev1) > PCA_EPS * (Math.abs(dv.x) + Math.abs(dv.y))) {
    // j--;
    // }
    // if (j == 0) {
    var iter = 0;
    do {
      iter++;
      if (iter > this.PCA_MAX_ITER) {
        break;
      }
      w = (dv_x - dv_y) / 2;// w = (dv->v[h-1] -dv->v[h]) / 2;//ここ？
      t = ev1 * ev1;// t = ev->v[h] * ev->v[h];
      s = Math.sqrt(w * w + t);
      if (w < 0) {
        s = -s;
      }
      x = dv_x - dv_y + t / (w + s);// x = dv->v[j] -dv->v[h] +t/(w+s);
      y = ev1;// y = ev->v[j+1];
      if (Math.abs(x) >= Math.abs(y)) {
        if (Math.abs(x) > this.PCA_VZERO) {
          t = -y / x;
          c = 1 / Math.sqrt(t * t + 1);
          s = t * c;
        } else {
          c = 1.0;
          s = 0.0;
        }
      } else {
        t = -x / y;
        s = 1.0 / Math.sqrt(t * t + 1);
        c = t * s;
      }
      w = dv_x - dv_y;// w = dv->v[k] -dv->v[k+1];
      t = (w * s + 2 * c * ev1) * s;// t = (w * s +2 * c *ev->v[k+1]) *s;
      dv_x -= t;// dv->v[k] -= t;
      dv_y += t;// dv->v[k+1] += t;
      ev1 += s * (c * w - 2 * s * ev1);// ev->v[k+1]+= s * (c* w- 2* s *ev->v[k+1]);
      x = mat00;// x = a->m[k*dim+i];
      y = mat10;// y = a->m[(k+1)*dim+i];
      mat00 = c * x - s * y;// a->m[k*dim+i] = c * x - s* y;
      mat10 = s * x + c * y;// a->m[(k+1)*dim+i] = s* x + c * y;
      x = mat01;// x = a->m[k*dim+i];
      y = mat11;// y = a->m[(k+1)*dim+i];
      mat01 = c * x - s * y;// a->m[k*dim+i] = c * x - s* y;
      mat11 = s * x + c * y;// a->m[(k+1)*dim+i] = s* x + c * y;
    } while (Math.abs(ev1) > this.PCA_EPS * (Math.abs(dv_x) + Math.abs(dv_y)));
    // }
    t = dv_x;// t = dv->v[h];
    if (dv_y > t) {// if( dv->v[i] > t ) {
      t = dv_y;// t = dv->v[h];
      dv_y = dv_x;// dv->v[h] = dv->v[k];
      dv_x = t;// dv->v[k] = t;
      // 行の入れ替え
      o_matrix.m00 = mat10;
      o_matrix.m01 = mat11;
      o_matrix.m10 = mat00;
      o_matrix.m11 = mat01;
    } else {
      // 行の入れ替えはなし
      o_matrix.m00 = mat00;
      o_matrix.m01 = mat01;
      o_matrix.m10 = mat10;
      o_matrix.m11 = mat11;
    }
    dv[0]=dv_x;
    dv[1]=dv_y;
    return;
  }
  /**
   * static int PCA( ARMat *input, ARMat *output, ARVec *ev )
   *
   * @param output
   * @param o_ev
   * @throws NyARException
   */
  ,PCA_PCA : function(i_v1,i_v2,i_number_of_data,o_matrix,o_ev,o_mean)
  {
    var i;
    // double[] mean_array=mean.getArray();
    // mean.zeroClear();
    //PCA_EXの処理
    var sx = 0;
    var sy = 0;
    for (i = 0; i < i_number_of_data; i++) {
      sx += i_v1[i];
      sy += i_v2[i];
    }
    sx = sx / i_number_of_data;
    sy = sy / i_number_of_data;
    //PCA_CENTERとPCA_xt_by_xを一緒に処理
    var srow = Math.sqrt((i_number_of_data));
    var w00, w11, w10;
    w00 = w11 = w10 = 0.0;// *out = 0.0;
    for (i = 0; i < i_number_of_data; i++) {
      var x = (i_v1[i] - sx) / srow;
      var y = (i_v2[i] - sy) / srow;
      w00 += (x * x);// *out += *in1 * *in2;
      w10 += (x * y);// *out += *in1 * *in2;
      w11 += (y * y);// *out += *in1 * *in2;
    }
    o_matrix.m00=w00;
    o_matrix.m01=o_matrix.m10=w10;
    o_matrix.m11=w11;
    //PCA_PCAの処理
    this.PCA_QRM(o_matrix, o_ev);
    // m2 = o_output.m;// m2 = output->m;
    if (o_ev[0] < this.PCA_VZERO) {// if( ev->v[i] < VZERO ){
      o_ev[0] = 0.0;// ev->v[i] = 0.0;
      o_matrix.m00 = 0.0;// *(m2++) = 0.0;
      o_matrix.m01 = 0.0;// *(m2++) = 0.0;
    }
    if (o_ev[1] < this.PCA_VZERO) {// if( ev->v[i] < VZERO ){
      o_ev[1] = 0.0;// ev->v[i] = 0.0;
      o_matrix.m10 = 0.0;// *(m2++) = 0.0;
      o_matrix.m11 = 0.0;// *(m2++) = 0.0;
    }
    o_mean[0]=sx;
    o_mean[1]=sy;
    // }
    return;
  }
  ,pca : function(i_v1,i_v2,i_number_of_point,o_evec,o_ev,o_mean)
  {
    this.PCA_PCA(i_v1,i_v2,i_number_of_point,o_evec, o_ev,o_mean);
    var sum = o_ev[0] + o_ev[1];
    // For順変更禁止
    o_ev[0] /= sum;// ev->v[i] /= sum;
    o_ev[1] /= sum;// ev->v[i] /= sum;
    return;
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */

/**
 * R8G8B8でピクセルを読み出すインタフェイス
 *
 */
INyARRgbPixelReader = ASKlass('INyARRgbPixelReader', {
  /**
   * 1ピクセルをint配列にして返します。
   *
   * @param i_x
   * @param i_y
   * @param o_rgb
   */
  getPixel : function(i_x, i_y, o_rgb){},
  /**
   * 複数のピクセル値をi_rgbへ返します。
   *
   * @param i_x
   * xのインデックス配列
   * @param i_y
   * yのインデックス配列
   * @param i_num
   * 返すピクセル値の数
   * @param i_rgb
   * ピクセル値を返すバッファ
   */
  getPixelSet : function(i_x, i_y, i_num, o_rgb){},
  /**
   * 1ピクセルを設定します。
   * @param i_x
   * @param i_y
   * @param i_rgb
   * @throws NyARException
   */
  setPixel : function(i_x, i_y, i_rgb){},
  /**
   * 複数のピクセル値をint配列から設定します。
   * @param i_x
   * @param i_y
   * @param i_num
   * @param i_intrgb
   * @throws NyARException
   */
  setPixels : function(i_x, i_y, i_num, i_intrgb){},
  switchBuffer : function(i_ref_buffer){}
})
NyARRgbPixelReader_INT1D_X8R8G8B8_32 = ASKlass('NyARRgbPixelReader_INT1D_X8R8G8B8_32', INyARRgbPixelReader,
{
  _ref_buf : null,
  _size : null,
  NyARRgbPixelReader_INT1D_X8R8G8B8_32 : function(i_buf, i_size)
  {
    this._ref_buf = i_buf;
    this._size = i_size;
  }
  ,getPixel : function(i_x,i_y,o_rgb)
  {
    var rgb= this._ref_buf[i_x + i_y * this._size.w];
    o_rgb[0] = (rgb>>16)&0xff;// R
    o_rgb[1] = (rgb>>8)&0xff;// G
    o_rgb[2] = rgb&0xff;// B
    return;
  }
  ,getPixelSet : function(i_x,i_y,i_num, o_rgb)
  {
    var width = this._size.w;
    var ref_buf = this._ref_buf;
    for (var i = i_num - 1; i >= 0; i--) {
      var rgb=ref_buf[i_x[i] + i_y[i] * width];
      o_rgb[i * 3 + 0] = (rgb>>16)&0xff;// R
      o_rgb[i * 3 + 1] = (rgb>>8)&0xff;// G
      o_rgb[i * 3 + 2] = rgb&0xff;// B
    }
    return;
  }
  ,setPixel : function(i_x,i_y,i_rgb)
  {
    this._ref_buf[i_x + i_y * this._size.w]=((i_rgb[0]<<16)&0xff)|((i_rgb[1]<<8)&0xff)|((i_rgb[2])&0xff);
  }
  ,setPixels : function(i_x,i_y, i_num,i_intrgb)
  {
    throw new NyARException();
  }
  /**
   * 参照しているバッファをi_ref_bufferへ切り替えます。
   * 内部パラメータのチェックは、実装依存です。
   * @param i_ref_buffer
   * @throws NyARException
   */
  ,switchBuffer : function(i_ref_buffer)
  {
    NyAS3Utils.assert(i_ref_buffer.length>=this._size.w*this._size.h);
    this._ref_buf = (i_ref_buffer);
  }
})


NyARRgbPixelReader_Canvas2D = ASKlass("NyARRgbPixelReader_Canvas2D", INyARRgbPixelReader,
{
  _ref_canvas: null,
  _data : null,

  NyARRgbPixelReader_Canvas2D : function(i_canvas)
  {
    this._ref_canvas = i_canvas;
  },

  getData : function() {
    if (this._ref_canvas.changed || !this._data) {
      var canvas = this._ref_canvas;
      var ctx = canvas.getContext('2d');
      this._data = ctx.getImageData(0,0,canvas.width,canvas.height);
      this._ref_canvas.changed = false;
    }
    return this._data;
  },

  getPixel: function(i_x, i_y, o_rgb)
  {
    var idata = this.getData();
    var w = idata.width;
    var h = idata.height;
    var d = idata.data;
    o_rgb[0] = d[i_y*w+i_x];// R
    o_rgb[1] = d[i_y*w+i_x+1];// G
    o_rgb[2] = d[i_y*w+i_x+2];// B
    return;
  },

  getPixelSet: function(i_x, i_y, i_num, o_rgb)
  {
    var idata = this.getData();
    var w = idata.width;
    var h = idata.height;
    var d = idata.data;
    for (var i = 0; i < i_num; i++) {
      var idx = i_y[i]*w*4 + i_x[i]*4;
      o_rgb[i*3+0] = d[idx+0];
      o_rgb[i*3+1] = d[idx+1];
      o_rgb[i*3+2] = d[idx+2];
    }
  },

  setPixel: function(i_x, i_y, i_rgb)
  {
    NyARException.notImplement();
  },
  setPixels: function(i_x, i_y, i_num, i_intrgb)
  {
    NyARException.notImplement();
  },
  switchBuffer:function(i_canvas)
  {
    NyARException.notImplement();
  }

})

/*
* JSARToolkit
* --------------------------------------------------------------------------------
* This work is based on the original ARToolKit developed by
*   Hirokazu Kato
*   Mark Billinghurst
*   HITLab, University of Washington, Seattle
* http://www.hitl.washington.edu/artoolkit/
*
* And the NyARToolkitAS3 ARToolKit class library.
*   Copyright (C)2010 Ryo Iizuka
*
* JSARToolkit is a JavaScript port of NyARToolkitAS3.
*   Copyright (C)2010 Ilmari Heikkinen
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* For further information please contact.
*   ilmari.heikkinen@gmail.com
*
*/




INyARDoubleMatrix = Klass({

  /**
    * 配列の内容を行列に設定する。
    * 遅いので余り使わないでね。
    * @param o_value
    */
  setValue : function(o_value){}, // double[]

  /**
    * 行列の内容を配列に返す。
    * 遅いので余り使わないでね。
    * @param o_value
    */
  getValue : function(o_value){} // double[]
})



NyARDoubleMatrix22 = Klass(INyARDoubleMatrix,
{
  m00 : 0,
  m01 : 0,
  m10 : 0,
  m11 : 0,
  /**
    * 遅いからあんまり使わないでね。
    */
  setValue : function(i_value)
  {
    this.m00=i_value[0];
    this.m01=i_value[1];
    this.m10=i_value[3];
    this.m11=i_value[4];
    return;
  }
  /**
    * 遅いからあんまり使わないでね。
    */
  ,getValue : function(o_value)
  {
    o_value[0]=this.m00;
    o_value[1]=this.m01;
    o_value[3]=this.m10;
    o_value[4]=this.m11;
    return;
  }
  ,inverse : function(i_src)
  {
    var a11,a12,a21,a22;
    a11=i_src.m00;
    a12=i_src.m01;
    a21=i_src.m10;
    a22=i_src.m11;
    var det=a11*a22-a12*a21;
    if(det==0){
      return false;
    }
    det=1/det;
    this.m00=a22*det;
    this.m01=-a12*det;
    this.m10=-a21*det;
    this.m11=a11*det;
    return true;
  }
})







NyARDoubleMatrix33 = Klass( INyARDoubleMatrix,
{
  m00 : 0,
  m01 : 0,
  m02 : 0,
  m10 : 0,
  m11 : 0,
  m12 : 0,
  m20 : 0,
  m21 : 0,
  m22 : 0,
  createArray : function(i_number)
  {
    var ret=new Array(i_number);
    for(var i=0;i<i_number;i++)
    {
      ret[i]=new NyARDoubleMatrix33();
    }
    return ret;
  }
  /**
    * 遅いからあんまり使わないでね。
    */
  ,setValue : function(i_value)
  {
    this.m00=i_value[0];
    this.m01=i_value[1];
    this.m02=i_value[2];
    this.m10=i_value[3];
    this.m11=i_value[4];
    this.m12=i_value[5];
    this.m20=i_value[6];
    this.m21=i_value[7];
    this.m22=i_value[8];
    return;
  }
  ,setValue_NyARDoubleMatrix33 : function(i_value)
  {
    this.m00=i_value.m00;
    this.m01=i_value.m01;
    this.m02=i_value.m02;
    this.m10=i_value.m10;
    this.m11=i_value.m11;
    this.m12=i_value.m12;
    this.m20=i_value.m20;
    this.m21=i_value.m21;
    this.m22=i_value.m22;
    return;
  }
  /**
    * 遅いからあんまり使わないでね。
    */
  ,getValue : function(o_value)
  {
    o_value[0]=this.m00;
    o_value[1]=this.m01;
    o_value[2]=this.m02;
    o_value[3]=this.m10;
    o_value[4]=this.m11;
    o_value[5]=this.m12;
    o_value[6]=this.m20;
    o_value[7]=this.m21;
    o_value[8]=this.m22;
    return;
  }
  ,inverse : function(i_src)
  {
    var a11,a12,a13,a21,a22,a23,a31,a32,a33;
    var b11,b12,b13,b21,b22,b23,b31,b32,b33;
    a11=i_src.m00;a12=i_src.m01;a13=i_src.m02;
    a21=i_src.m10;a22=i_src.m11;a23=i_src.m12;
    a31=i_src.m20;a32=i_src.m21;a33=i_src.m22;

    b11=a22*a33-a23*a32;
    b12=a32*a13-a33*a12;
    b13=a12*a23-a13*a22;

    b21=a23*a31-a21*a33;
    b22=a33*a11-a31*a13;
    b23=a13*a21-a11*a23;

    b31=a21*a32-a22*a31;
    b32=a31*a12-a32*a11;
    b33=a11*a22-a12*a21;

    var det_1=a11*b11+a21*b12+a31*b13;
    if(det_1==0){
      return false;
    }
    det_1=1/det_1;

    this.m00=b11*det_1;
    this.m01=b12*det_1;
    this.m02=b13*det_1;

    this.m10=b21*det_1;
    this.m11=b22*det_1;
    this.m12=b23*det_1;

    this.m20=b31*det_1;
    this.m21=b32*det_1;
    this.m22=b33*det_1;

    return true;
  }
  /**
    * この関数は、0-PIの間で値を返します。
    * @param o_out
    */
  ,getZXYAngle : function(o_out)
  {
    var sina = this.m21;
    if (sina >= 1.0) {
      o_out.x = Math.PI / 2;
      o_out.y = 0;
      o_out.z = Math.atan2(-this.m10, this.m00);
    } else if (sina <= -1.0) {
      o_out.x = -Math.PI / 2;
      o_out.y = 0;
      o_out.z = Math.atan2(-this.m10, this.m00);
    } else {
      o_out.x = Math.asin(sina);
      o_out.z = Math.atan2(-this.m01, this.m11);
      o_out.y = Math.atan2(-this.m20, this.m22);
    }
  }
  ,setZXYAngle_NyARDoublePoint3d : function(i_angle)
  {
    this.setZXYAngle_Number(i_angle.x,i_angle.y,i_angle.z);
    return;
  }
  ,setZXYAngle_Number : function(i_x,i_y,i_z)
  {
    var sina = Math.sin(i_x);
    var cosa = Math.cos(i_x);
    var sinb = Math.sin(i_y);
    var cosb = Math.cos(i_y);
    var sinc = Math.sin(i_z);
    var cosc = Math.cos(i_z);
    this.m00 = cosc * cosb - sinc * sina * sinb;
    this.m01 = -sinc * cosa;
    this.m02 = cosc * sinb + sinc * sina * cosb;
    this.m10 = sinc * cosb + cosc * sina * sinb;
    this.m11 = cosc * cosa;
    this.m12 = sinc * sinb - cosc * sina * cosb;
    this.m20 = -cosa * sinb;
    this.m21 = sina;
    this.m22 = cosb * cosa;
    return;
  }
  /**
    * 回転行列を適応して座標変換します。
    * @param i_angle
    * @param o_out
    */
  ,transformVertex_NyARDoublePoint3d : function(i_position,o_out)
  {
    transformVertex_double(i_position.x,i_position.y,i_position.z,o_out);
    return;
  }

  ,transformVertex_double : function(i_x,i_y,i_z,o_out)
  {
    o_out.x=this.m00*i_x+this.m01*i_y+this.m02*i_z;
    o_out.y=this.m10*i_x+this.m11*i_y+this.m12*i_z;
    o_out.z=this.m20*i_x+this.m21*i_y+this.m22*i_z;
    return;
  }
})





NyARDoubleMatrix34 = Klass( INyARDoubleMatrix,
{

  m00 : 0,
  m01 : 0,
  m02 : 0,
  m03 : 0,
  m10 : 0,
  m11 : 0,
  m12 : 0,
  m13 : 0,
  m20 : 0,
  m21 : 0,
  m22 : 0,
  m23 : 0,

  setValue : function(i_value)
  {
    this.m00 = i_value[0];
    this.m01 = i_value[1];
    this.m02 = i_value[2];
    this.m03 = i_value[3];
    this.m10 = i_value[4];
    this.m11 = i_value[5];
    this.m12 = i_value[6];
    this.m13 = i_value[7];
    this.m20 = i_value[8];
    this.m21 = i_value[9];
    this.m22 = i_value[10];
    this.m23 = i_value[11];
    return;
  }
  ,setValue_NyARDoubleMatrix34 : function(i_value)
  {
    this.m00=i_value.m00;
    this.m01=i_value.m01;
    this.m02=i_value.m02;
    this.m03=i_value.m03;
    this.m10=i_value.m10;
    this.m11=i_value.m11;
    this.m12=i_value.m12;
    this.m13=i_value.m13;
    this.m20=i_value.m20;
    this.m21=i_value.m21;
    this.m22=i_value.m22;
    this.m23=i_value.m23;
    return;
  }

  ,getValue : function(o_value)
  {
    o_value[0] = this.m00;
    o_value[1] = this.m01;
    o_value[2] = this.m02;
    o_value[3] = this.m03;
    o_value[4] = this.m10;
    o_value[5] = this.m11;
    o_value[6] = this.m12;
    o_value[7] = this.m13;
    o_value[8] = this.m20;
    o_value[9] = this.m21;
    o_value[10] = this.m22;
    o_value[11] = this.m23;
    return;
  }
})



NyARDoubleMatrix44 = Klass( INyARDoubleMatrix,
{
  m00 : 0,
  m01 : 0,
  m02 : 0,
  m03 : 0,
  m10 : 0,
  m11 : 0,
  m12 : 0,
  m13 : 0,
  m20 : 0,
  m21 : 0,
  m22 : 0,
  m23 : 0,
  m30 : 0,
  m31 : 0,
  m32 : 0,
  m33 : 0,
  createArray : function(i_number)
  {
    var ret=new Array(i_number);
    for(var i=0;i<i_number;i++)
    {
      ret[i]=new NyARDoubleMatrix44();
    }
    return ret;
  }
  /**
    * 遅いからあんまり使わないでね。
    */
  ,setValue : function(i_value)
  {
    this.m00=i_value[ 0];
    this.m01=i_value[ 1];
    this.m02=i_value[ 2];
    this.m03=i_value[ 3];
    this.m10=i_value[ 4];
    this.m11=i_value[ 5];
    this.m12=i_value[ 6];
    this.m13=i_value[ 7];
    this.m20=i_value[ 8];
    this.m21=i_value[ 9];
    this.m22=i_value[10];
    this.m23=i_value[11];
    this.m30=i_value[12];
    this.m31=i_value[13];
    this.m32=i_value[14];
    this.m33=i_value[15];
    return;
  }
  /**
    * 遅いからあんまり使わないでね。
    */
  ,getValue : function(o_value)
  {
    o_value[ 0]=this.m00;
    o_value[ 1]=this.m01;
    o_value[ 2]=this.m02;
    o_value[ 3]=this.m03;
    o_value[ 4]=this.m10;
    o_value[ 5]=this.m11;
    o_value[ 6]=this.m12;
    o_value[ 7]=this.m13;
    o_value[ 8]=this.m20;
    o_value[ 9]=this.m21;
    o_value[10]=this.m22;
    o_value[11]=this.m23;
    o_value[12]=this.m30;
    o_value[13]=this.m31;
    o_value[14]=this.m32;
    o_value[15]=this.m33;
    return;
  }
  ,inverse : function(i_src)
  {
    var a11,a12,a13,a14,a21,a22,a23,a24,a31,a32,a33,a34,a41,a42,a43,a44;
    var b11,b12,b13,b14,b21,b22,b23,b24,b31,b32,b33,b34,b41,b42,b43,b44;
    var t1,t2,t3,t4,t5,t6;
    a11=i_src.m00;a12=i_src.m01;a13=i_src.m02;a14=i_src.m03;
    a21=i_src.m10;a22=i_src.m11;a23=i_src.m12;a24=i_src.m13;
    a31=i_src.m20;a32=i_src.m21;a33=i_src.m22;a34=i_src.m23;
    a41=i_src.m30;a42=i_src.m31;a43=i_src.m32;a44=i_src.m33;

    t1=a33*a44-a34*a43;
    t2=a34*a42-a32*a44;
    t3=a32*a43-a33*a42;
    t4=a34*a41-a31*a44;
    t5=a31*a43-a33*a41;
    t6=a31*a42-a32*a41;

    b11=a22*t1+a23*t2+a24*t3;
    b21=-(a23*t4+a24*t5+a21*t1);
    b31=a24*t6-a21*t2+a22*t4;
    b41=-(a21*t3-a22*t5+a23*t6);

    t1=a43*a14-a44*a13;
    t2=a44*a12-a42*a14;
    t3=a42*a13-a43*a12;
    t4=a44*a11-a41*a14;
    t5=a41*a13-a43*a11;
    t6=a41*a12-a42*a11;

    b12=-(a32*t1+a33*t2+a34*t3);
    b22=a33*t4+a34*t5+a31*t1;
    b32=-(a34*t6-a31*t2+a32*t4);
    b42=a31*t3-a32*t5+a33*t6;

    t1=a13*a24-a14*a23;
    t2=a14*a22-a12*a24;
    t3=a12*a23-a13*a22;
    t4=a14*a21-a11*a24;
    t5=a11*a23-a13*a21;
    t6=a11*a22-a12*a21;

    b13=a42*t1+a43*t2+a44*t3;
    b23=-(a43*t4+a44*t5+a41*t1);
    b33=a44*t6-a41*t2+a42*t4;
    b43=-(a41*t3-a42*t5+a43*t6);

    t1=a23*a34-a24*a33;
    t2=a24*a32-a22*a34;
    t3=a22*a33-a23*a32;
    t4=a24*a31-a21*a34;
    t5=a21*a33-a23*a31;
    t6=a21*a32-a22*a31;

    b14=-(a12*t1+a13*t2+a14*t3);
    b24=a13*t4+a14*t5+a11*t1;
    b34=-(a14*t6-a11*t2+a12*t4);
    b44=a11*t3-a12*t5+a13*t6;

    var det_1=(a11*b11+a21*b12+a31*b13+a41*b14);
    if(det_1==0){
      return false;
    }
    det_1=1/det_1;

    this.m00=b11*det_1;
    this.m01=b12*det_1;
    this.m02=b13*det_1;
    this.m03=b14*det_1;

    this.m10=b21*det_1;
    this.m11=b22*det_1;
    this.m12=b23*det_1;
    this.m13=b24*det_1;

    this.m20=b31*det_1;
    this.m21=b32*det_1;
    this.m22=b33*det_1;
    this.m23=b34*det_1;

    this.m30=b41*det_1;
    this.m31=b42*det_1;
    this.m32=b43*det_1;
    this.m33=b44*det_1;

    return true;
  }
})





/**
  * スタック型の可変長配列。
  * 配列には実体を格納します。
  *
  * 注意事項
  * JavaのGenericsの制限突破を狙ったものの、Vector.&lt;*&gt;では、不具合が多いため、Vector.&lt;Object&gt;に変更
  * いくつかの場所でエラーがでる場合がありますが、コンパイルオプションなどで、
  * strict = false を設定して回避してください。
  * 根本修正は次バージョン以降で対応する予定です。
  */
NyARObjectStack = Klass(
{
  _items : null,

  _length : 0,

  /**
    * 最大ARRAY_MAX個の動的割り当てバッファを準備する。
    *
    *
    * @param i_array
    * @param i_element_type
    */
  initialize : function(i_length)
  {
    //領域確保
    i_length = toInt(i_length);
    this._items = this.createArray(i_length);
    //使用中個数をリセット
    this._length = 0;
    return;
  }

  /**
    * どのような配列(Vector)を格納するかを決める場所。
    * この関数を上書きしてください。
    *
    */
  ,createArray : function(i_length)
  {
    throw new NyARException();
  }

  /**
    * 新しい領域を予約します。
    * @return
    * 失敗するとnull
    * @throws NyARException
    */
  ,prePush : function()
  {
    // 必要に応じてアロケート
    if (this._length >= this._items.length){
      return null;
    }
    // 使用領域を+1して、予約した領域を返す。
    var ret = this._items[this._length];
    this._length++;
    return ret;
  }

  /**
    * スタックを初期化します。
    * @param i_reserv_length
    * 使用済みにするサイズ
    * @return
    */
  ,init : function(i_reserv_length)
  {
    // 必要に応じてアロケート
    if (i_reserv_length >= this._items.length){
      throw new NyARException();
    }
    this._length=i_reserv_length;
  }

  /**
    * 見かけ上の要素数を1減らして、そのオブジェクトを返します。
    * 返却したオブジェクトの内容は、次回のpushまで有効です。
    * @return
    */
  ,pop : function()
  {
    NyAS3Utils.assert(this._length>=1);
    this._length--;
    return this._items[this._length];
  }

  /**
    * 見かけ上の要素数をi_count個減らします。
    * @param i_count
    * @return
    */
  ,pops : function(i_count)
  {
    NyAS3Utils.assert(this._length>=i_count);
    this._length-=i_count;
    return;
  }

  /**
    * 配列を返します。
    *
    * @return
    */
  ,getArray : function()
  {
    return this._items;
  }

  ,getItem : function(i_index)
  {
    return this._items[i_index];
  }

  /**
    * 配列の見かけ上の要素数を返却します。
    * @return
    */
  ,getLength : function()
  {
    return this._length;
  }

  /**
    * 見かけ上の要素数をリセットします。
    */
  ,clear : function()
  {
    this._length = 0;
  }
})

/**
  * ...
  * @author
  */
NyARIntPointStack = Klass( NyARObjectStack,
{
  initialize : function(i_length)
  {
    NyARObjectStack.initialize.call(this, i_length);
  }
  ,createArray : function(i_length)
  {
    var ret= new Array(i_length);
    for (var i =0; i < i_length; i++){
      ret[i] = new NyARIntPoint2d();
    }
    return ret;
  }

})







//	import jp.nyatla.nyartoolkit.as3.core.types.*;

NyARIntRectStack = Klass( //NyARObjectStack,
{
  _items : null,

  _length : null,

  initialize : function(i_length)
  {
    //領域確保
    this._items = this.createArray(i_length);
    //使用中個数をリセット
    this._length = 0;
    return;
  }
  ,createArray : function(i_length)
  {
    var ret= new Array(i_length);
    for (var i =0; i < i_length; i++){
      ret[i] = new  NyARIntRect();
    }
    return ret;
  }
  /**
    * 新しい領域を予約します。
    * @return
    * 失敗するとnull
    * @throws NyARException
    */
  ,prePush : function()
  {
    // 必要に応じてアロケート
    if (this._length >= this._items.length){
      return null;
    }
    // 使用領域を+1して、予約した領域を返す。
    var ret = this._items[this._length];
    this._length++;
    return ret;
  }

  /**
    * スタックを初期化します。
    * @param i_reserv_length
    * 使用済みにするサイズ
    * @return
    */
  ,init : function(i_reserv_length)
  {
    // 必要に応じてアロケート
    if (i_reserv_length >= this._items.length){
      throw new NyARException();
    }
    this._length=i_reserv_length;
  }

  /**
    * 見かけ上の要素数を1減らして、そのオブジェクトを返します。
    * 返却したオブジェクトの内容は、次回のpushまで有効です。
    * @return
    */
  ,pop : function()
  {
    NyAS3Utils.assert(this._length>=1);
    this._length--;
    return this._items[this._length];
  }

  /**
    * 見かけ上の要素数をi_count個減らします。
    * @param i_count
    * @return
    */
  ,pops : function(i_count)
  {
    NyAS3Utils.assert(this._length>=i_count);
    this._length-=i_count;
    return;
  }

  /**
    * 配列を返します。
    *
    * @return
    */
  ,getArray : function()
  {
    return this._items;
  }

  ,getItem : function(i_index)
  {
    return this._items[i_index];
  }

  /**
    * 配列の見かけ上の要素数を返却します。
    * @return
    */
  ,getLength : function()
  {
    return this._length;
  }

  /**
    * 見かけ上の要素数をリセットします。
    */
  ,clear : function()
  {
    this._length = 0;
  }
})









NyARBufferType = Klass(
  (function() {
    var T_BYTE1D =0x00010000;
    var T_INT2D  =0x00020000;
    var T_SHORT1D=0x00030000;
    var T_INT1D  =0x00040000;
    var T_OBJECT =0x00100000;
    var T_USER   =0x00FF0000;

    return ({
      //  24-31(8)予約
      //  16-27(8)型ID
      //      00:無効/01[]/02[][]/03[]
      //  08-15(8)ビットフォーマットID
      //      00/01/02
      //  00-07(8)型番号
      //
      /**
        * RGB24フォーマットで、全ての画素が0
        */
      NULL_ALLZERO : 0x00000001,
      /**
        * USER - USER+0xFFFFはユーザー定義型。実験用に。
        */
      USER_DEFINE  : T_USER,

      /**
        * byte[]で、R8G8B8の24ビットで画素が格納されている。
        */
      BYTE1D_R8G8B8_24   : T_BYTE1D|0x0001,
      /**
        * byte[]で、B8G8R8の24ビットで画素が格納されている。
        */
      BYTE1D_B8G8R8_24   : T_BYTE1D|0x0002,
      /**
        * byte[]で、R8G8B8X8の32ビットで画素が格納されている。
        */
      BYTE1D_B8G8R8X8_32 : T_BYTE1D|0x0101,
      /**
        * byte[]で、X8R8G8B8の32ビットで画素が格納されている。
        */
      BYTE1D_X8R8G8B8_32 : T_BYTE1D|0x0102,

      /**
        * byte[]で、RGB565の16ビット(little/big endian)で画素が格納されている。
        */
      BYTE1D_R5G6B5_16LE : T_BYTE1D|0x0201,
      BYTE1D_R5G6B5_16BE : T_BYTE1D|0x0202,
      /**
        * short[]で、RGB565の16ビット(little/big endian)で画素が格納されている。
        */
      WORD1D_R5G6B5_16LE : T_SHORT1D|0x0201,
      WORD1D_R5G6B5_16BE : T_SHORT1D|0x0202,


      /**
        * int[][]で特に値範囲を定めない
        */
      INT2D        : T_INT2D|0x0000,
      /**
        * int[][]で0-255のグレイスケール画像
        */
      INT2D_GRAY_8 : T_INT2D|0x0001,
      /**
        * int[][]で0/1の2値画像
        * これは、階調値1bitのBUFFERFORMAT_INT2D_GRAY_1と同じです。
        */
      INT2D_BIN_8  : T_INT2D|0x0002,

      /**
        * int[]で特に値範囲を定めない
        */
      INT1D        : T_INT1D|0x0000,
      /**
        * int[]で0-255のグレイスケール画像
        */
      INT1D_GRAY_8 : T_INT1D|0x0001,
      /**
        * int[]で0/1の2値画像
        * これは、階調1bitのINT1D_GRAY_1と同じです。
        */
      INT1D_BIN_8  : T_INT1D|0x0002,


      /**
        * int[]で、XRGB32の32ビットで画素が格納されている。
        */
      INT1D_X8R8G8B8_32:T_INT1D|0x0102,

      /**
        * H(0-359),S(0-255),V(0-255)
        */
      INT1D_X7H9S8V8_32:T_INT1D|0x0103,


      /**
        * プラットフォーム固有オブジェクト
        */
      OBJECT_Java: T_OBJECT|0x0100,
      OBJECT_CS  : T_OBJECT|0x0200,
      OBJECT_AS3 : T_OBJECT|0x0300,
      OBJECT_JS : T_OBJECT|0x0400,

      /**
        * JavaのBufferedImageを格納するラスタ
        */
      OBJECT_Java_BufferedImage: T_OBJECT|0x0100|0x01,

      OBJECT_AS3_BitmapData : T_OBJECT|0x0300|0x01,
      /**
        * JavaScriptのCanvasを格納するラスタ
        */
      OBJECT_JS_Canvas : T_OBJECT|0x0400|0x01
    });
  })()
)





NyARDoublePoint2d = Klass(
{
  x : 0,
  y : 0,
  /**
    * 配列ファクトリ
    * @param i_number
    * @return
    */
  createArray : function(i_number)
  {
    var ret=new Array(i_number);
    for(var i=0;i<i_number;i++)
    {
      ret[i]=new NyARDoublePoint2d();
    }
    return ret;
  }
  ,initialize : function()
  {
    switch(arguments.length) {
    case 0:
      {//public function NyARDoublePoint2d()
        this.x = 0;
        this.y = 0;
      }
      return;
    case 1:
      this.x=args[0].x;
      this.y=args[0].y;
      return;
      break;
    case 2:
      {	//public function NyARDoublePoint2d(i_x,i_y)
        this.x = Number(args[0]);
        this.y = Number(args[1]);
        return;
      }
    default:
      break;
    }
    throw new NyARException();
  }
  ,setValue_NyARDoublePoint2d : function(i_src)
  {
    this.x=i_src.x;
    this.y=i_src.y;
    return;
  }
  ,setValue_NyARIntPoint2d : function(i_src)
  {
    this.x=(i_src.x);
    this.y=(i_src.y);
    return;
  }
  /**
    * 格納値をベクトルとして、距離を返します。
    * @return
    */
  ,dist : function()
  {
    return Math.sqrt(this.x*this.x+this.y+this.y);
  }
  ,sqNorm : function()
  {
    return this.x*this.x+this.y+this.y;
  }
})





NyARDoublePoint3d = Klass(
{
  x : 0,
  y : 0,
  z : 0,
  /**
    * 配列ファクトリ
    * @param i_number
    * @return
    */
  createArray : function(i_number)
  {
    var ret=new Array(i_number);
    for(var i=0;i<i_number;i++)
    {
      ret[i]=new NyARDoublePoint3d();
    }
    return ret;
  }
  ,setValue : function(i_in)
  {
    this.x=i_in.x;
    this.y=i_in.y;
    this.z=i_in.z;
    return;
  }
  /**
    * i_pointとのベクトルから距離を計算します。
    * @return
    */
  ,dist : function(i_point)
  {
    var x,y,z;
    x=this.x-i_point.x;
    y=this.y-i_point.y;
    z=this.z-i_point.z;
    return Math.sqrt(x*x+y*y+z*z);
  }
})




/**
  * ヒストグラムを格納するクラスです。
  */
NyARHistogram = Klass(
{
  /**
    * サンプリング値の格納変数
    */
  data : null,
  /**
    * 有効なサンプリング値の範囲。[0-data.length-1]
    */
  length : 0,
  /**
    * 有効なサンプルの総数 data[i]
    */
  total_of_data : 0,



  initialize : function(i_length)
  {
    this.data=new FloatVector(i_length);
    this.length=i_length;
    this.total_of_data=0;
  }
  /**
    * 区間i_stからi_edまでの総データ数を返します。
    * @param i_st
    * @param i_ed
    * @return
    */
  ,getTotal : function(i_st,i_ed)
  {
    NyAS3Utils.assert(i_st<i_ed && i_ed<this.length);
    var result=0;
    var s=this.data;
    for(var i=i_st;i<=i_ed;i++){
      result+=s[i];
    }
    return result;
  }
  /**
    * 指定したi_pos未満サンプルを０にします。
    * @param i_pos
    */
  ,lowCut : function(i_pos)
  {
    var s= 0;
    for(var i=0;i<i_pos;i++){
      s+=this.data[i];
      this.data[i]=0;
    }
    this.total_of_data-=s;
  }
  /**
    * 指定したi_pos以上のサンプルを０にします。
    * @param i_pos
    */
  ,highCut : function(i_pos)
  {
    var s=0;
    for(var i=this.length-1;i>=i_pos;i--){
      s+=this.data[i];
      this.data[i]=0;
    }
    this.total_of_data-=s;
  }
  /**
    * 最小の値が格納されているサンプル番号を返します。
    */
  ,getMinSample : function()
  {
    var data=this.data;
    var ret=this.length-1;
    var min=data[ret];
    for(var i=this.length-2;i>=0;i--)
    {
      if(data[i]<min){
        min=data[i];
        ret=i;
      }
    }
    return ret;
  }
  /**
    * サンプルの中で最小の値を返します。
    * @return
    */
  ,getMinData : function()
  {
    return this.data[this.getMinSample()];
  }
  /**
    * 平均値を計算します。
    * @return
    */
  ,getAverage : function()
  {
    var sum=0;
    for(var i=this.length-1;i>=0;i--)
    {
      sum+=this.data[i]*i;
    }
    return toInt(sum/this.total_of_data);
  }

})





NyARIntPoint2d = Klass(
{
  x : 0,

  y : 0,
  /**
    * 配列ファクトリ
    * @param i_number
    * @return
    */
  createArray : function(i_number)
  {
    var ret=new Array(i_number);
    for(var i=0;i<i_number;i++)
    {
      ret[i]=new NyARIntPoint2d();
    }
    return ret;
  }
  ,copyArray : function(i_from,i_to)
  {
    for(var i=i_from.length-1;i>=0;i--)
    {
      i_to[i].x=i_from[i].x;
      i_to[i].y=i_from[i].y;
    }
    return;
  }
})





NyARIntRect = Klass(
{
  x : 0,

  y : 0,

  w : 0,

  h : 0
})





NyARIntSize = Klass(
{
  h : 0,
  w : 0,
  /*	public function NyARIntSize()
    * 	public function NyARIntSize(i_width,i_height)
    *	public function NyARIntSize(i_ref_object)
  */
  initialize : function()
  {
    switch(arguments.length) {
    case 0:
      {//public function NyARIntSize()
        this.w = 0;
        this.h = 0;
        return;
      }
    case 1:
      this.w = arguments[0].w;
      this.h = arguments[0].h;
      return;
      break;
    case 2:
      {	//public function NyARIntSize(i_ref_object)
        this.w=toInt(arguments[0]);
        this.h=toInt(arguments[1]);
        return;
      }
      break;
    default:
      break;
    }
    throw new NyARException();
  }

  /**
    * サイズが同一であるかを確認する。
    *
    * @param i_width
    * @param i_height
    * @return
    * @throws NyARException
    */
  ,isEqualSize_int : function(i_width,i_height)
  {
    if (i_width == this.w && i_height == this.h) {
      return true;
    }
    return false;
  }

  /**
    * サイズが同一であるかを確認する。
    *
    * @param i_width
    * @param i_height
    * @return
    * @throws NyARException
    */
  ,isEqualSize_NyARIntSize : function(i_size)
  {
    if (i_size.w == this.w && i_size.h == this.h) {
      return true;
    }
    return false;

  }
})




/**
  * 0=dx*x+dy*y+cのパラメータを格納します。
  * x,yの増加方向は、x=L→R,y=B→Tです。
  *
  */
NyARLinear = Klass(
{
  dx : 0,//dx軸の増加量
  dy : 0,//dy軸の増加量
  c : 0,//切片
  createArray : function(i_number)
  {
    var ret=new Array(i_number);
    for(var i=0;i<i_number;i++)
    {
      ret[i]=new NyARLinear();
    }
    return ret;
  }
  ,copyFrom : function(i_source)
  {
    this.dx=i_source.dx;
    this.dy=i_source.dy;
    this.c=i_source.c;
    return;
  }
  /**
    * 2直線の交点を計算します。
    * @param l_line_i
    * @param l_line_2
    * @param o_point
    * @return
    */
  ,crossPos : function(l_line_i,l_line_2 ,o_point)
  {
    var w1 = l_line_2.dy * l_line_i.dx - l_line_i.dy * l_line_2.dx;
    if (w1 == 0.0) {
      return false;
    }
    o_point.x = (l_line_2.dx * l_line_i.c - l_line_i.dx * l_line_2.c) / w1;
    o_point.y = (l_line_i.dy * l_line_2.c - l_line_2.dy * l_line_i.c) / w1;
    return true;
  }
})

/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */



/**
 * 各ラスタ用のフィルタ実装
 */
IFLdoThFilterImpl = ASKlass('IFLdoThFilterImpl',
{
  doThFilter : function(i_input,i_output,i_size,i_threshold){}
})


/**
 * 定数閾値による2値化をする。
 *
 */
FLARRasterFilter_Threshold = ASKlass('FLARRasterFilter_Threshold',
{
  _threshold : 0
  ,_do_threshold_impl : null
  ,FLARRasterFilter_Threshold : function(i_threshold)
  {
  }
  /**
   * 画像を２値化するための閾値。暗点&lt;=th&lt;明点となります。
   * @param i_threshold
   */
  ,setThreshold : function(i_threshold )
  {
    this._threshold = i_threshold;
  }
  ,doFilter : function(i_input, i_output)
  {
    NyAS3Utils.assert (i_input._width == i_output._width && i_input._height == i_output._height);
    var out_buf = (i_output.getBuffer());
    var in_reader = i_input.getRgbPixelReader();
    var d = in_reader.getData().data;
    var obd = out_buf.data;
    var th3 = this._threshold*10000;
    for (var i=0,j=0; i<d.length; i+=4,++j) {
      //var c = d[i]*0.2989 + d[i+1]*0.5866 + d[i+2]*0.1145;
      var c = d[i]*2989+d[i+1]*5866+d[i+2]*1145;
      var t = (c <= th3) ? 0xffffffff : 0xff000000;
      obd[j] = t;
    }
    if (window.DEBUG) {
      var debugCanvas = document.getElementById('debugCanvas');
      out_buf.drawOnCanvas(debugCanvas);
    }
    return;
  }
})
Point = function(x,y) {
  this.x = x||0;
  this.y = y||0;
}
doThFilterImpl_BUFFERFORMAT_OBJECT_AS_BitmapData = {
  doThFilter : function(i_input, i_output, i_threshold)
  {
    var out_buf = (i_output.getBuffer());
    var in_buf= (i_input.getBuffer());
    var d = in_buf.data;
    var obd = out_buf.data;
    for (var i=0; i<d.length; i++) {
      var dc = d[i];
      var c = ((dc>>16)&0xff)*0.2989 + ((dc>>8)&0xff)*0.5866 + (dc&0xff)*0.1145;
      var f = (c <= i_threshold);
      var t = f*0xffffffff + (1-f)*0xff000000;
      obd[j] = t;
    }
  }
}/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARDoublePoint2d = NyARDoublePoint2d;
FLARDoublePoint3d = NyARDoublePoint3d;
FLARIntSize = NyARIntSize;
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */


/**
 * ...
 * @author
 */
NyARLabelInfo = ASKlass('NyARLabelInfo',
{
  area : 0,
  clip_r : 0,
  clip_l : 0,
  clip_b : 0,
  clip_t : 0,
  pos_x : 0,
  pos_y : 0,
  NyARLabelInfo : function()
  {
  }
})


//  import jp.nyatla.nyartoolkit.as3.core.types.stack.*;
NyARLabelInfoStack = ASKlass('NyARLabelInfoStack', // NyARObjectStack,
{
  _items : null,
  _length : 0,
  NyARLabelInfoStack : function(i_length)
  {
    //領域確保
    this._items = this.createArray(i_length);
    //使用中個数をリセット
    this._length = 0;
    return;
  }
  ,createArray : function(i_length)
  {
    var ret= new Array(i_length);
    for (var i =0; i < i_length; i++){
      ret[i] = new NyARLabelInfo();
    }
    return (ret);
  }
  /**
   * エリアの大きい順にラベルをソートします。
   */
  ,sortByArea : function()
  {
    var len=this._length;
    if(len<1){
      return;
    }
    var h = Math.floor(len * 13/10);
    var item=this._items;
    for(;;){
      var swaps = 0;
      for (var i = 0; i + h < len; i++) {
        if (item[i + h].area > item[i].area) {
          var temp = item[i + h];
          item[i + h] = item[i];
          item[i] = temp;
          swaps++;
        }
      }
      if (h == 1) {
        if (swaps == 0){
          break;
        }
      }else{
        h=Math.floor(h*10/13);
      }
    }
  }
  /**
   * 新しい領域を予約します。
   * @return
   * 失敗するとnull
   * @throws NyARException
   */
  ,prePush : function()
  {
    // 必要に応じてアロケート
    if (this._length >= this._items.length){
      return null;
    }
    // 使用領域を+1して、予約した領域を返す。
    var ret = this._items[this._length];
    this._length++;
    return ret;
  }
  /**
   * スタックを初期化します。
   * @param i_reserv_length
   * 使用済みにするサイズ
   * @return
   */
  ,init : function(i_reserv_length)
  {
    // 必要に応じてアロケート
    if (i_reserv_length >= this._items.length){
      throw new NyARException();
    }
    this._length=i_reserv_length;
  }
  /**
   * 見かけ上の要素数を1減らして、そのオブジェクトを返します。
   * 返却したオブジェクトの内容は、次回のpushまで有効です。
   * @return
   */
  ,pop : function()
  {
    NyAS3Utils.assert(this._length>=1);
    this._length--;
    return this._items[this._length];
  }
  /**
   * 見かけ上の要素数をi_count個減らします。
   * @param i_count
   * @return
   */
  ,pops : function(i_count)
  {
    NyAS3Utils.assert(this._length>=i_count);
    this._length-=i_count;
    return;
  }
  /**
   * 配列を返します。
   *
   * @return
   */
  ,getArray : function()
  {
    return this._items;
  }
  ,getItem : function(i_index)
  {
    return this._items[i_index];
  }
  /**
   * 配列の見かけ上の要素数を返却します。
   * @return
   */
  ,getLength : function()
  {
    return this._length;
  }
  /**
   * 見かけ上の要素数をリセットします。
   */
  ,clear : function()
  {
    this._length = 0;
  }
})
NyARLabelOverlapChecker = ASKlass('NyARLabelOverlapChecker',
{
  _labels : null,
  _length : 0,
  /*
  */
  NyARLabelOverlapChecker : function(i_max_label)
  {
    this._labels = this.createArray(i_max_label);
  }
  ,createArray : function(i_length)
  {
    return new Array(i_length);
  }
  /**
   * チェック対象のラベルを追加する。
   *
   * @param i_label_ref
   */
  ,push : function(i_label_ref)
  {
    this._labels[this._length] = i_label_ref;
    this._length++;
  }
  /**
   * 現在リストにあるラベルと重なっているかを返す。
   *
   * @param i_label
   * @return 何れかのラベルの内側にあるならばfalse,独立したラベルである可能性が高ければtrueです．
   */
  ,check : function(i_label)
  {
    // 重なり処理かな？
    var label_pt  = this._labels;
    var px1 = toInt(i_label.pos_x);
    var py1 = toInt(i_label.pos_y);
    for (var i = this._length - 1; i >= 0; i--) {
      var px2 = toInt(label_pt[i].pos_x);
      var py2 = toInt(label_pt[i].pos_y);
      var d = (px1 - px2) * (px1 - px2) + (py1 - py2) * (py1 - py2);
      if (d < label_pt[i].area / 4) {
        // 対象外
        return false;
      }
    }
    // 対象
    return true;
  }
  /**
   * 最大i_max_label個のラベルを蓄積できるようにオブジェクトをリセットする
   *
   * @param i_max_label
   */
  ,setMaxLabels : function(i_max_label)
  {
    if (i_max_label > this._labels.length) {
      this._labels = this.createArray(i_max_label);
    }
    this._length = 0;
  }
})




// RleImageをラベリングする。
NyARLabeling_Rle = ASKlass('NyARLabeling_Rle',
{
  AR_AREA_MAX : 100000,// #define AR_AREA_MAX 100000
  AR_AREA_MIN : 70,// #define AR_AREA_MIN 70
  _rlestack : null,
  _rle1 : null,
  _rle2 : null,
  _max_area : 0,
  _min_area : 0,
  NyARLabeling_Rle : function(i_width,i_height)
  {
    this._rlestack=new RleInfoStack(i_width*i_height*2048/(320*240)+32);
    this._rle1 = RleElement.createArray(i_width/2+1);
    this._rle2 = RleElement.createArray(i_width/2+1);
    this.setAreaRange(this.AR_AREA_MAX,this.AR_AREA_MIN);
    return;
  }
  /**
   * 対象サイズ
   * @param i_max
   * @param i_min
   */
  ,setAreaRange : function(i_max,i_min)
  {
    this._max_area=i_max;
    this._min_area=i_min;
    return;
  }
  /**
   * i_bin_bufのgsイメージをRLE圧縮する。
   * @param i_bin_buf
   * @param i_st
   * @param i_len
   * @param i_out
   * @param i_th
   * BINラスタのときは0,GSラスタの時は閾値を指定する。
   * この関数は、閾値を暗点と認識します。
   * 暗点<=th<明点
   * @return
   */
  ,toRLE : function(i_bin_buf,i_st,i_len,i_out,i_th)
  {
    var current = 0;
    var lidx=0,ridx=1,fidx=2,off=3;
    var r = -1;
    // 行確定開始
    var x = i_st;
    var right_edge = i_st + i_len - 1;
    while (x < right_edge) {
      // 暗点(0)スキャン
      if (i_bin_buf[x] != 0xffffffff) {
        x++;//明点
        continue;
      }
      // 暗点発見→暗点長を調べる
      r = (x - i_st);
      i_out[current+lidx] = r;
      r++;// 暗点+1
      x++;
      while (x < right_edge) {
        if (i_bin_buf[x] != 0xffffffff) {
          // 明点(1)→暗点(0)配列終了>登録
          i_out[current+ridx] = r;
          current+=off;
          x++;// 次点の確認。
          r = -1;// 右端の位置を0に。
          break;
        } else {
          // 暗点(0)長追加
          r++;
          x++;
        }
      }
    }
    // 最後の1点だけ判定方法が少し違うの。
    if (i_bin_buf[x] != 0xffffffff) {
      // 明点→rカウント中なら暗点配列終了>登録
      if (r >= 0) {
        i_out[current+ridx] = r;
        current+=off;
      }
    } else {
      // 暗点→カウント中でなければl1で追加
      if (r >= 0) {
        i_out[current+ridx] = (r + 1);
      } else {
        // 最後の1点の場合
        i_out[current+lidx] = (i_len - 1);
        i_out[current+ridx] = (i_len);
      }
      current+=off;
    }
    // 行確定
    return current/off;
  }
  ,addFragment : function(i_rel_img,i_img_idx,i_nof,i_row_index,o_stack)
  {
    var lidx=0,ridx=1,fidx=2,off=3;
    var l = i_rel_img[i_img_idx+lidx];
    var r = i_rel_img[i_img_idx+ridx];
    var len=r - l;
    i_rel_img[i_img_idx+fidx] = i_nof;// REL毎の固有ID
    var v = o_stack.prePush();
    v.entry_x = l;
    v.area =len;
    v.clip_l=l;
    v.clip_r=r-1;
    v.clip_t=i_row_index;
    v.clip_b=i_row_index;
    v.pos_x=(len*(2*l+(len-1)))/2;
    v.pos_y=i_row_index*len;
    return;
  }
  //所望のラスタからBIN-RLEに変換しながらの低速系も準備しようかな
  /**
   * 単一閾値を使ってGSラスタをBINラスタに変換しながらラベリングします。
   * @param i_gs_raster
   * @param i_top
   * @param i_bottom
   * @param o_stack
   * @return
   * @throws NyARException
   */
  ,labeling_NyARBinRaster : function(i_bin_raster,i_top,i_bottom,o_stack)
  {
    NyAS3Utils.assert(i_bin_raster.isEqualBufferType(NyARBufferType.INT1D_BIN_8));
    return this.imple_labeling(i_bin_raster,0,i_top,i_bottom,o_stack);
  }
  /**
   * BINラスタをラベリングします。
   * @param i_gs_raster
   * @param i_th
   * 画像を２値化するための閾値。暗点&lt;=th&lt;明点となります。
   * @param i_top
   * @param i_bottom
   * @param o_stack
   * @return
   * @throws NyARException
   */
  ,labeling_NyARGrayscaleRaster : function(i_gs_raster,i_th,i_top,i_bottom,o_stack)
  {
    NyAS3Utils.assert(i_gs_raster.isEqualBufferType(NyARBufferType.INT1D_GRAY_8));
    return this.imple_labeling(i_gs_raster,i_th,i_top,i_bottom,o_stack);
  }
  ,labeling : function(i_bin_raster,o_stack)
  {
    return this.imple_labeling(i_bin_raster,0,0,i_bin_raster.getHeight(),o_stack);
  }
  ,imple_labeling : function(i_raster,i_th,i_top,i_bottom,o_stack)
  {
    // リセット処理
    var rlestack=this._rlestack;
    rlestack.clear();
    //
    var rle_prev = this._rle1;
    var rle_current = this._rle2;
    var len_prev = 0;
    var len_current = 0;
    var width = i_raster.getWidth();
    var in_buf = (i_raster.getBuffer().data);
    var id_max = 0;
    var label_count=0;
    var lidx=0,ridx=1,fidx=2,off=3;
    // 初段登録
    len_prev = this.toRLE(in_buf, i_top, width, rle_prev, i_th);
    var i;
    for (i = 0; i < len_prev; i++) {
      // フラグメントID=フラグメント初期値、POS=Y値、RELインデクス=行
      this.addFragment(rle_prev, i*off, id_max, i_top,rlestack);
      id_max++;
      // nofの最大値チェック
      label_count++;
    }
    var f_array = (rlestack.getArray());
    // 次段結合
    for (var y = i_top + 1; y < i_bottom; y++) {
      // カレント行の読込
      len_current = this.toRLE(in_buf, y * width, width, rle_current,i_th);
      var index_prev = 0;
      SCAN_CUR: for (i = 0; i < len_current; i++) {
        // index_prev,len_prevの位置を調整する
        var id = -1;
        // チェックすべきprevがあれば確認
        SCAN_PREV: while (index_prev < len_prev) {
          if (rle_current[i*off+lidx] - rle_prev[index_prev*off+ridx] > 0) {// 0なら8方位ラベリング
            // prevがcurの左方にある→次のフラグメントを探索
            index_prev++;
            continue;
          } else if (rle_prev[index_prev*off+lidx] - rle_current[i*off+ridx] > 0) {// 0なら8方位ラベリングになる
            // prevがcur右方にある→独立フラグメント
            this.addFragment(rle_current, i*off, id_max, y,rlestack);
            id_max++;
            label_count++;
            // 次のindexをしらべる
            continue SCAN_CUR;
          }
          id=rle_prev[index_prev*off+fidx];//ルートフラグメントid
          var id_ptr = f_array[id];
          //結合対象(初回)->prevのIDをコピーして、ルートフラグメントの情報を更新
          rle_current[i*off+fidx] = id;//フラグメントIDを保存
          //
          var l= rle_current[i*off+lidx];
          var r= rle_current[i*off+ridx];
          var len=r-l;
          //結合先フラグメントの情報を更新する。
          id_ptr.area += len;
          //tとentry_xは、結合先のを使うので更新しない。
          id_ptr.clip_l=l<id_ptr.clip_l?l:id_ptr.clip_l;
          id_ptr.clip_r=r>id_ptr.clip_r?r-1:id_ptr.clip_r;
          id_ptr.clip_b=y;
          id_ptr.pos_x+=(len*(2*l+(len-1)))/2;
          id_ptr.pos_y+=y*len;
          //多重結合の確認（２個目以降）
          index_prev++;
          while (index_prev < len_prev) {
            if (rle_current[i*off+lidx] - rle_prev[index_prev*off+ridx] > 0) {// 0なら8方位ラベリング
              // prevがcurの左方にある→prevはcurに連結していない。
              break SCAN_PREV;
            } else if (rle_prev[index_prev*off+lidx] - rle_current[i*off+ridx] > 0) {// 0なら8方位ラベリングになる
              // prevがcurの右方にある→prevはcurに連結していない。
              index_prev--;
              continue SCAN_CUR;
            }
            // prevとcurは連結している→ルートフラグメントの統合
            //結合するルートフラグメントを取得
            var prev_id =rle_prev[index_prev*off+fidx];
            var prev_ptr = f_array[prev_id];
            if (id != prev_id){
              label_count--;
              //prevとcurrentのフラグメントidを書き換える。
              var i2;
              for(i2=index_prev;i2<len_prev;i2++){
                //prevは現在のidから最後まで
                if(rle_prev[i2*off+fidx]==prev_id){
                  rle_prev[i2*off+fidx]=id;
                }
              }
              for(i2=0;i2<i;i2++){
                //currentは0から現在-1まで
                if(rle_current[i2*off+fidx]==prev_id){
                  rle_current[i2*off+fidx]=id;
                }
              }
              //現在のルートフラグメントに情報を集約
              id_ptr.area +=prev_ptr.area;
              id_ptr.pos_x+=prev_ptr.pos_x;
              id_ptr.pos_y+=prev_ptr.pos_y;
              //tとentry_xの決定
              if (id_ptr.clip_t > prev_ptr.clip_t) {
                // 現在の方が下にある。
                id_ptr.clip_t = prev_ptr.clip_t;
                id_ptr.entry_x = prev_ptr.entry_x;
              }else if (id_ptr.clip_t < prev_ptr.clip_t) {
                // 現在の方が上にある。prevにフィードバック
              } else {
                // 水平方向で小さい方がエントリポイント。
                if (id_ptr.entry_x > prev_ptr.entry_x) {
                  id_ptr.entry_x = prev_ptr.entry_x;
                }else{
                }
              }
              //lの決定
              if (id_ptr.clip_l > prev_ptr.clip_l) {
                id_ptr.clip_l=prev_ptr.clip_l;
              }else{
              }
              //rの決定
              if (id_ptr.clip_r < prev_ptr.clip_r) {
                id_ptr.clip_r=prev_ptr.clip_r;
              }else{
              }
              //bの決定
              //結合済のルートフラグメントを無効化する。
              prev_ptr.area=0;
            }
            index_prev++;
          }
          index_prev--;
          break;
        }
        // curにidが割り当てられたかを確認
        // 右端独立フラグメントを追加
        if (id < 0){
          this.addFragment(rle_current, i*off, id_max, y,rlestack);
          id_max++;
          label_count++;
        }
      }
      // prevとrelの交換
      var tmp = rle_prev;
      rle_prev = rle_current;
      len_prev = len_current;
      rle_current = tmp;
    }
    //対象のラベルだけ転写
    o_stack.init(label_count);
    var o_dest_array=(o_stack.getArray());
    var max=this._max_area;
    var min=this._min_area;
    var active_labels=0;
    for(i=id_max-1;i>=0;i--){
      var area=f_array[i].area;
      if(area<min || area>max){//対象外のエリア0のもminではじく
        continue;
      }
      //
      var src_info=f_array[i];
      var dest_info=o_dest_array[active_labels];
      dest_info.area=area;
      dest_info.clip_b=src_info.clip_b;
      dest_info.clip_r=src_info.clip_r;
      dest_info.clip_t=src_info.clip_t;
      dest_info.clip_l=src_info.clip_l;
      dest_info.entry_x=src_info.entry_x;
      dest_info.pos_x=src_info.pos_x/src_info.area;
      dest_info.pos_y=src_info.pos_y/src_info.area;
      active_labels++;
    }
    //ラベル数を再設定
    o_stack.pops(label_count-active_labels);
    //ラベル数を返却
    return active_labels;
  }
})
RleInfo = ASKlass('RleInfo',
{
//継承メンバ
entry_x : 0, // フラグメントラベルの位置
area : 0,
clip_r : 0,
clip_l : 0,
clip_b : 0,
clip_t : 0,
pos_x : 0,
pos_y : 0
})

RleInfoStack = ASKlass('RleInfoStack', NyARObjectStack,
{
  RleInfoStack : function(i_length)
  {
    NyARObjectStack.initialize.call(this,i_length);
    return;
  }
  ,createArray : function(i_length)
  {
    var ret= new Array(toInt(i_length));
    for (var i =0; i < i_length; i++){
      ret[i] = new RleInfo();
    }
    return ret;
  }
})
RleElement = ASKlass('RleElement',
{
  l : 0,
  r : 0,
  fid : 0,
  createArray : function(i_length)
  {
    return new IntVector(toInt(i_length)*3);
    var ret = new Array(toInt(i_length));
    for (var i = 0; i < i_length; i++) {
      ret[i] = new RleElement();
    }
    return ret;
  }
})
NyARRleLabelFragmentInfo = ASKlass('NyARRleLabelFragmentInfo', NyARLabelInfo,
{
  //継承メンバ
  //int area; // フラグメントラベルの領域数
  entry_x : 0 // フラグメントラベルの位置
})
NyARRleLabelFragmentInfoStack = ASKlass('NyARRleLabelFragmentInfoStack',  NyARLabelInfoStack,
{
  NyARRleLabelFragmentInfoStack : function(i_length)
  {
    NyARLabelInfoStack.initialize.call(this,i_length);
    return;
  }
  ,createArray : function(i_length)
  {
    var ret= new Array(toInt(i_length));
    for (var i =0; i < i_length; i++){
      ret[i] = new NyARRleLabelFragmentInfo();
    }
    return (ret);
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARLabeling = ASKlass('FLARLabeling',
{
  AR_AREA_MAX : 100000// #define AR_AREA_MAX 100000
  ,AR_AREA_MIN : 70// #define AR_AREA_MIN 70
  ,ZERO_POINT : new Point()
  ,ONE_POINT : new Point(1, 1)
  ,hSearch : null
  ,hLineRect : null
  ,_tmp_bmp : null
  ,areaMax : 0
  ,areaMin : 0
  ,FLARLabeling : function(i_width,i_height)
  {
    this._tmp_bmp = new BitmapData(i_width, i_height, false,0x00);
    this.hSearch = new BitmapData(i_width, 1, false, 0x000000);
    this.hLineRect = new Rectangle(0, 0, 1, 1);
    this.setAreaRange(this.AR_AREA_MAX, this.AR_AREA_MIN);
    return;
  }
  /**
   * 白領域の検査対象サイズ
   *  最大サイズは 一辺約320px、最小サイズは 一辺約 8px まで解析対象としている
   *  解析画像中で上記範囲内であれば解析対象となるが、最小サイズは小さすぎて意味をなさない。
   *
   * @param i_max 解析対象とする白領域の最大pixel数(一辺の二乗)
   * @param i_min 解析対象とする白領域の最小pixel数(一辺の二乗)
   */
  ,setAreaRange : function(i_max, i_min)
  {
    this.areaMax=i_max;
    this.areaMin=i_min;
  }
  ,labeling : function(i_bin_raster,o_stack)
  {
    var label_img = this._tmp_bmp;
    label_img.fillRect(label_img.rect, 0x0);
    var rect = label_img.rect.clone();
    rect.inflate(-1, -1);
    label_img.copyPixels(i_bin_raster.getBuffer(), rect, this.ONE_POINT);
    var currentRect = label_img.getColorBoundsRect(0xffffff, 0xffffff, true);
    var hLineRect = this.hLineRect;
    hLineRect.y = 0;
    hLineRect.width = label_img.width;
    var hSearch = this.hSearch;
    var hSearchRect;
    var labelRect;
    var index = 0;
    var label;
    o_stack.clear();
//     try {
      while (!currentRect.isEmpty()) {
        hLineRect.y = currentRect.top;
        hSearch.copyPixels(label_img, hLineRect, this.ZERO_POINT);
        hSearchRect = hSearch.getColorBoundsRect(0xffffff, 0xffffff, true);
        label_img.floodFill(hSearchRect.x, hLineRect.y, ++index);
        labelRect = label_img.getColorBoundsRect(0xffffff, index, true);
        label = o_stack.prePush();
        var area = labelRect.width * labelRect.height;
        //エリア規制
        if (area <= this.areaMax && area >= this.areaMin){
          label.area = area;
          label.clip_l = labelRect.left;
          label.clip_r = labelRect.right - 1;
          label.clip_t = labelRect.top;
          label.clip_b = labelRect.bottom - 1;
          label.pos_x = (labelRect.left + labelRect.right - 1) * 0.5;
          label.pos_y = (labelRect.top + labelRect.bottom - 1) * 0.5;
          //エントリ・ポイントを探す
          label.entry_x=this.getTopClipTangentX(label_img,index,label);
          if (label.entry_x == -1) {
            return -1;
          }
        }else {
          o_stack.pop();
        }
        currentRect = label_img.getColorBoundsRect(0xffffff, 0xffffff, true);
      }
/*    } catch (e) {
      throw("too many labeled area!! gave up")
      console.log('Too many labeled area!! gave up....',e);
    }*/
    return o_stack.getLength();
  }
  ,getTopClipTangentX : function(i_image, i_index, i_label)
  {
    var w;
    var clip1 = i_label.clip_r;
    var i;
    for (i = i_label.clip_l; i <= clip1; i++) { // for( i = clip[0]; i <=clip[1]; i++, p1++ ) {
      w = i_image.getPixel(i, i_label.clip_t);
      if (w > 0 && w == i_index) {
        return i;
      }
    }
    //あれ？見つからないよ？
    return -1;
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */
INyARCameraDistortionFactor = ASKlass('INyARCameraDistortionFactor',
{
  ideal2Observ : function(i_in,o_out){},
  ideal2ObservBatch : function(i_in,o_out,i_size){},
  observ2Ideal : function(ix,iy,o_point){},
  observ2IdealBatch : function(i_x_coord,i_y_coord,i_start,i_num,o_x_coord,o_y_coord){}
})

/**
 * カメラの歪み成分を格納するクラスと、補正関数群
 * http://www.hitl.washington.edu/artoolkit/Papers/ART02-Tutorial.pdf
 * 11ページを読むといいよ。
 *
 * x=x(xi-x0),y=s(yi-y0)
 * d^2=x^2+y^2
 * p=(1-fd^2)
 * xd=px+x0,yd=py+y0
 */
NyARCameraDistortionFactor = ASKlass('NyARCameraDistortionFactor', INyARCameraDistortionFactor,
{
  PD_LOOP : 3,
  _f0 : 0,//x0
  _f1 : 0,//y0
  _f2 : 0,//100000000.0*ｆ
  _f3 : 0,//s
  copyFrom : function(i_ref)
  {
    this._f0=i_ref._f0;
    this._f1=i_ref._f1;
    this._f2=i_ref._f2;
    this._f3=i_ref._f3;
    return;
  }
  /**
   * 配列の値をファクタ値としてセットする。
   * @param i_factor
   * 4要素以上の配列
   */
  ,setValue : function(i_factor)
  {
    this._f0=i_factor[0];
    this._f1=i_factor[1];
    this._f2=i_factor[2];
    this._f3=i_factor[3];
    return;
  }
  ,getValue : function(o_factor)
  {
    o_factor[0]=this._f0;
    o_factor[1]=this._f1;
    o_factor[2]=this._f2;
    o_factor[3]=this._f3;
    return;
  }
  ,changeScale : function(i_scale)
  {
    this._f0=this._f0*i_scale;// newparam->dist_factor[0] =source->dist_factor[0] *scale;
    this._f1=this._f1*i_scale;// newparam->dist_factor[1] =source->dist_factor[1] *scale;
    this._f2=this._f2/ (i_scale * i_scale);// newparam->dist_factor[2]=source->dist_factor[2]/ (scale*scale);
    //this.f3=this.f3;// newparam->dist_factor[3] =source->dist_factor[3];
    return;
  }
  /**
   * int arParamIdeal2Observ( const double dist_factor[4], const double ix,const double iy,double *ox, double *oy ) 関数の代替関数
   *
   * @param i_in
   * @param o_out
   */
  ,ideal2Observ : function(i_in,o_out)
  {
    var x = (i_in.x - this._f0) * this._f3;
    var y = (i_in.y - this._f1) * this._f3;
    if (x == 0.0 && y == 0.0) {
      o_out.x = this._f0;
      o_out.y = this._f1;
    } else {
      var d = 1.0 - this._f2 / 100000000.0 * (x * x + y * y);
      o_out.x = x * d + this._f0;
      o_out.y = y * d + this._f1;
    }
    return;
  }
  /**
   * ideal2Observをまとめて実行します。
   * @param i_in
   * @param o_out
   */
  ,ideal2ObservBatch : function(i_in, o_out ,i_size)
  {
    var x, y;
    var d0 = this._f0;
    var d1 = this._f1;
    var d3 = this._f3;
    var d2_w = this._f2 / 100000000.0;
    for (var i = 0; i < i_size; i++) {
      x = (i_in[i].x - d0) * d3;
      y = (i_in[i].y - d1) * d3;
      if (x == 0.0 && y == 0.0) {
        o_out[i].x = d0;
        o_out[i].y = d1;
      } else {
        var d = 1.0 - d2_w * (x * x + y * y);
        o_out[i].x = x * d + d0;
        o_out[i].y = y * d + d1;
      }
    }
    return;
  }
  /**
   * int arParamObserv2Ideal( const double dist_factor[4], const double ox,const double oy,double *ix, double *iy );
   *
   * @param ix
   * @param iy
   * @param ix
   * @param iy
   * @return
   */
  ,observ2Ideal : function(ix, iy, o_point)
  {
    var z02, z0, p, q, z, px, py, opttmp_1;
    var d0 = this._f0;
    var d1 = this._f1;
    px = ix - d0;
    py = iy - d1;
    p = this._f2 / 100000000.0;
    z02 = px * px + py * py;
    q = z0 = Math.sqrt(z02);// Optimize//q = z0 = Math.sqrt(px*px+ py*py);
    for (var i = 1;; i++) {
      if (z0 != 0.0) {
        // Optimize opttmp_1
        opttmp_1 = p * z02;
        z = z0 - ((1.0 - opttmp_1) * z0 - q) / (1.0 - 3.0 * opttmp_1);
        px = px * z / z0;
        py = py * z / z0;
      } else {
        px = 0.0;
        py = 0.0;
        break;
      }
      if (i == this.PD_LOOP) {
        break;
      }
      z02 = px * px + py * py;
      z0 = Math.sqrt(z02);// Optimize//z0 = Math.sqrt(px*px+ py*py);
    }
    o_point.x = px / this._f3 + d0;
    o_point.y = py / this._f3 + d1;
    return;
  }
  /**
   * 指定範囲のobserv2Idealをまとめて実行して、結果をo_idealに格納します。
   * @param i_x_coord
   * @param i_y_coord
   * @param i_start
   *            coord開始点
   * @param i_num
   *            計算数
   * @param o_ideal
   *            出力バッファ[i_num][2]であること。
   */
  ,observ2IdealBatch : function(i_x_coord,i_y_coord,i_start,i_num,o_x_coord,o_y_coord)
  {
    var z02, z0, q, z, px, py, opttmp_1;
    var d0 = this._f0;
    var d1 = this._f1;
    var d3 = this._f3;
    var p = this._f2 / 100000000.0;
    for (var j = 0; j < i_num; j++) {
      px = i_x_coord[i_start + j] - d0;
      py = i_y_coord[i_start + j] - d1;
      z02 = px * px + py * py;
      q = z0 = Math.sqrt(z02);// Optimize//q = z0 = Math.sqrt(px*px+py*py);
      for (var i = 1;; i++) {
        if (z0 != 0.0) {
          // Optimize opttmp_1
          opttmp_1 = p * z02;
          z = z0 - ((1.0 - opttmp_1) * z0 - q)/ (1.0 - 3.0 * opttmp_1);
          px = px * z / z0;
          py = py * z / z0;
        } else {
          px = 0.0;
          py = 0.0;
          break;
        }
        if (i == PD_LOOP) {
          break;
        }
        z02 = px * px + py * py;
        z0 = Math.sqrt(z02);// Optimize//z0 = Math.sqrt(px*px+ py*py);
      }
      o_x_coord[j] = px / d3 + d0;
      o_y_coord[j] = py / d3 + d1;
    }
    return;
  }
})
NyARObserv2IdealMap = ASKlass('NyARObserv2IdealMap',
{
  _stride : 0,
  _mapx : null,
  _mapy : null,
  NyARObserv2IdealMap : function(i_distfactor,i_screen_size)
  {
    var opoint=new NyARDoublePoint2d();
    this._mapx=new FloatVector(i_screen_size.w*i_screen_size.h);
    this._mapy=new FloatVector(i_screen_size.w*i_screen_size.h);
    this._stride=i_screen_size.w;
    var ptr=i_screen_size.h*i_screen_size.w-1;
    //歪みマップを構築
    for(var i=i_screen_size.h-1;i>=0;i--)
    {
      for(var i2=i_screen_size.w-1;i2>=0;i2--)
      {
        i_distfactor.observ2Ideal(i2,i, opoint);
        this._mapx[ptr]=opoint.x;
        this._mapy[ptr]=opoint.y;
        ptr--;
      }
    }
    return;
  }
  ,observ2Ideal : function(ix,iy,o_point)
  {
    var idx=ix+iy*this._stride;
    o_point.x=this._mapx[idx];
    o_point.y=this._mapy[idx];
    return;
  }
  ,observ2IdealBatch : function(i_x_coord,i_y_coord,i_start,i_num,o_x_coord,o_y_coord,i_out_start_index)
  {
    var idx;
    var ptr=i_out_start_index;
    var mapx=this._mapx;
    var mapy=this._mapy;
    var stride=this._stride;
    for (var j = 0; j < i_num; j++){
      idx=i_x_coord[i_start + j]+i_y_coord[i_start + j]*stride;
      o_x_coord[ptr]=mapx[idx];
      o_y_coord[ptr]=mapy[idx];
      ptr++;
    }
    return;
  }
})

NyARPerspectiveProjectionMatrix = ASKlass('NyARPerspectiveProjectionMatrix', NyARDoubleMatrix34,
{
  /*
   * static double dot( double a1, double a2, double a3,double b1, double b2,double b3 )
   */
  dot : function(a1,a2,a3,b1,b2,b3)
  {
    return (a1 * b1 + a2 * b2 + a3 * b3);
  }
  /* static double norm( double a, double b, double c ) */
  ,norm : function(a,b,c)
  {
    return Math.sqrt(a * a + b * b + c * c);
  }
  /**
   * int arParamDecompMat( double source[3][4], double cpara[3][4], double trans[3][4] ); 関数の置き換え Optimize STEP[754->665]
   *
   * @param o_cpara
   *            戻り引数。3x4のマトリクスを指定すること。
   * @param o_trans
   *            戻り引数。3x4のマトリクスを指定すること。
   * @return
   */
  ,decompMat : function(o_cpara,o_trans)
  {
    var r, c;
    var rem1, rem2, rem3;
    var c00,c01,c02,c03,c10,c11,c12,c13,c20,c21,c22,c23;
    if (this.m23>= 0) {// if( source[2][3] >= 0 ) {
      // <Optimize>
      // for(int r = 0; r < 3; r++ ){
      // for(int c = 0; c < 4; c++ ){
      // Cpara[r][c]=source[r][c];//Cpara[r][c] = source[r][c];
      // }
      // }
      c00=this.m00;
      c01=this.m01;
      c02=this.m02;
      c03=this.m03;
      c10=this.m10;
      c11=this.m11;
      c12=this.m12;
      c13=this.m13;
      c20=this.m20;
      c21=this.m21;
      c22=this.m22;
      c23=this.m23;
    } else {
      // <Optimize>
      // for(int r = 0; r < 3; r++ ){
      // for(int c = 0; c < 4; c++ ){
      // Cpara[r][c]=-source[r][c];//Cpara[r][c] = -(source[r][c]);
      // }
      // }
      c00=-this.m00;
      c01=-this.m01;
      c02=-this.m02;
      c03=-this.m03;
      c10=-this.m10;
      c11=-this.m11;
      c12=-this.m12;
      c13=-this.m13;
      c20=-this.m20;
      c21=-this.m21;
      c22=-this.m22;
      c23=-this.m23;
    }
    var cpara= o_cpara.getArray();
    var trans= o_trans.getArray();
    for (r = 0; r < 3; r++) {
      for (c = 0; c < 4; c++) {
        cpara[r][c] = 0.0;// cpara[r][c] = 0.0;
      }
    }
    cpara[2][2] = this.norm(c20, c21, c22);// cpara[2][2] =norm( Cpara[2][0],Cpara[2][1],Cpara[2][2]);
    trans[2][0] = c20 / cpara[2][2];// trans[2][0] = Cpara[2][0] /cpara[2][2];
    trans[2][1] = c21 / cpara[2][2];// trans[2][1] = Cpara[2][1] / cpara[2][2];
    trans[2][2] = c22 / cpara[2][2];// trans[2][2] =Cpara[2][2] /cpara[2][2];
    trans[2][3] = c23 / cpara[2][2];// trans[2][3] =Cpara[2][3] /cpara[2][2];
    cpara[1][2] = this.dot(trans[2][0], trans[2][1], trans[2][2], c10, c11, c12);// cpara[1][2]=dot(trans[2][0],trans[2][1],trans[2][2],Cpara[1][0],Cpara[1][1],Cpara[1][2]);
    rem1 = c10 - cpara[1][2] * trans[2][0];// rem1 =Cpara[1][0] -cpara[1][2] *trans[2][0];
    rem2 = c11 - cpara[1][2] * trans[2][1];// rem2 =Cpara[1][1] -cpara[1][2] *trans[2][1];
    rem3 = c12 - cpara[1][2] * trans[2][2];// rem3 =Cpara[1][2] -cpara[1][2] *trans[2][2];
    cpara[1][1] = this.norm(rem1, rem2, rem3);// cpara[1][1] = norm( rem1,// rem2, rem3 );
    trans[1][0] = rem1 / cpara[1][1];// trans[1][0] = rem1 / cpara[1][1];
    trans[1][1] = rem2 / cpara[1][1];// trans[1][1] = rem2 / cpara[1][1];
    trans[1][2] = rem3 / cpara[1][1];// trans[1][2] = rem3 / cpara[1][1];
    cpara[0][2] = this.dot(trans[2][0], trans[2][1], trans[2][2], c00, c01, c02);// cpara[0][2] =dot(trans[2][0], trans[2][1],trans[2][2],Cpara[0][0],Cpara[0][1],Cpara[0][2]);
    cpara[0][1] = this.dot(trans[1][0], trans[1][1], trans[1][2], c00, c01, c02);// cpara[0][1]=dot(trans[1][0],trans[1][1],trans[1][2],Cpara[0][0],Cpara[0][1],Cpara[0][2]);
    rem1 = c00 - cpara[0][1] * trans[1][0] - cpara[0][2]* trans[2][0];// rem1 = Cpara[0][0] - cpara[0][1]*trans[1][0]- cpara[0][2]*trans[2][0];
    rem2 = c01 - cpara[0][1] * trans[1][1] - cpara[0][2]* trans[2][1];// rem2 = Cpara[0][1] - cpara[0][1]*trans[1][1]- cpara[0][2]*trans[2][1];
    rem3 = c02 - cpara[0][1] * trans[1][2] - cpara[0][2]* trans[2][2];// rem3 = Cpara[0][2] - cpara[0][1]*trans[1][2] - cpara[0][2]*trans[2][2];
    cpara[0][0] = this.norm(rem1, rem2, rem3);// cpara[0][0] = norm( rem1,rem2, rem3 );
    trans[0][0] = rem1 / cpara[0][0];// trans[0][0] = rem1 / cpara[0][0];
    trans[0][1] = rem2 / cpara[0][0];// trans[0][1] = rem2 / cpara[0][0];
    trans[0][2] = rem3 / cpara[0][0];// trans[0][2] = rem3 / cpara[0][0];
    trans[1][3] = (c13 - cpara[1][2] * trans[2][3])/ cpara[1][1];// trans[1][3] = (Cpara[1][3] -cpara[1][2]*trans[2][3]) / cpara[1][1];
    trans[0][3] = (c03 - cpara[0][1] * trans[1][3] - cpara[0][2]* trans[2][3])/ cpara[0][0];// trans[0][3] = (Cpara[0][3] -cpara[0][1]*trans[1][3]-cpara[0][2]*trans[2][3]) / cpara[0][0];
    for (r = 0; r < 3; r++) {
      for (c = 0; c < 3; c++) {
        cpara[r][c] /= cpara[2][2];// cpara[r][c] /= cpara[2][2];
      }
    }
    return;
  }
  /**
   * int arParamChangeSize( ARParam *source, int xsize, int ysize, ARParam *newparam );
   * Matrixのスケールを変換します。
   * @param i_scale
   *
   */
  ,changeScale : function(i_scale)
  {
    this.m00=this.m00*i_scale;
    this.m10=this.m10*i_scale;
    this.m01=this.m01*i_scale;
    this.m11=this.m11*i_scale;
    this.m02=this.m02*i_scale;
    this.m12=this.m12*i_scale;
    this.m03=this.m03*i_scale;
    this.m13=this.m13*i_scale;
    //for (int i = 0; i < 4; i++) {
    //  array34[0 * 4 + i] = array34[0 * 4 + i] * scale;// newparam->mat[0][i]=source->mat[0][i]* scale;
    //  array34[1 * 4 + i] = array34[1 * 4 + i] * scale;// newparam->mat[1][i]=source->mat[1][i]* scale;
    //  array34[2 * 4 + i] = array34[2 * 4 + i];// newparam->mat[2][i] = source->mat[2][i];
    //}
    return;
  }
  /**
   * 現在の行列で３次元座標を射影変換します。
   * @param i_3dvertex
   * @param o_2d
   */
  ,projectionConvert_NyARDoublePoint3d : function(i_3dvertex,o_2d)
  {
    var w=i_3dvertex.z*this.m22;
    o_2d.x=(i_3dvertex.x*this.m00+i_3dvertex.y*this.m01+i_3dvertex.z*this.m02)/w;
    o_2d.y=(i_3dvertex.y*this.m11+i_3dvertex.z*this.m12)/w;
    return;
  }
  ,projectionConvert_Number : function(i_x,i_y,i_z,o_2d)
  {
    var w=i_z*this.m22;
    o_2d.x=(i_x*this.m00+i_y*this.m01+i_z*this.m02)/w;
    o_2d.y=(i_y*this.m11+i_z*this.m12)/w;
    return;
  }
})


/**
 * typedef struct { int xsize, ysize; double mat[3][4]; double dist_factor[4]; } ARParam;
 * NyARの動作パラメータを格納するクラス
 *
 */
NyARParam = ASKlass('NyARParam',
{
  _screen_size : new NyARIntSize(),
  SIZE_OF_PARAM_SET : 4 + 4 + (3 * 4 * 8) + (4 * 8),
  _dist : new NyARCameraDistortionFactor(),
  _projection_matrix : new NyARPerspectiveProjectionMatrix(),
  getScreenSize : function()
  {
    return this._screen_size;
  }
  ,getPerspectiveProjectionMatrix : function()
  {
    return this._projection_matrix;
  }
  ,getDistortionFactor : function()
  {
    return this._dist;
  }
  /**
   * Copy the perspective projection matrix to the given m_projection FloatVector GL camera matrix.
   */
  ,copyCameraMatrix : function(m_projection, NEAR_CLIP, FAR_CLIP) {
    var trans_mat = new FLARMat(3,4);
    var icpara_mat = new FLARMat(3,4);
    var p = ArrayUtil.createJaggedArray(3, 3);
    var q = ArrayUtil.createJaggedArray(4, 4);
    var i = 0;
    var j = 0;
    var size = this.getScreenSize();
    var  width = size.w;
    var height = size.h;

    this.getPerspectiveProjectionMatrix().decompMat(icpara_mat, trans_mat);

    var icpara = icpara_mat.getArray();
    var trans = trans_mat.getArray();
    for (i = 0; i < 4; i++) {
      icpara[1][i] = (height - 1) * (icpara[2][i]) - icpara[1][i];
    }

    for(i = 0; i < 3; i++) {
      for(j = 0; j < 3; j++) {
        p[i][j] = icpara[i][j] / icpara[2][2];
      }
    }
    q[0][0] = (2.0 * p[0][0] / (width - 1));
    q[0][1] = (2.0 * p[0][1] / (width - 1));
    q[0][2] = -((2.0 * p[0][2] / (width - 1))  - 1.0);
    q[0][3] = 0.0;

    q[1][0] = 0.0;
    q[1][1] = -(2.0 * p[1][1] / (height - 1));
    q[1][2] = -((2.0 * p[1][2] / (height - 1)) - 1.0);
    q[1][3] = 0.0;

    q[2][0] = 0.0;
    q[2][1] = 0.0;
    q[2][2] = -(FAR_CLIP + NEAR_CLIP) / (NEAR_CLIP - FAR_CLIP);
    q[2][3] = 2.0 * FAR_CLIP * NEAR_CLIP / (NEAR_CLIP - FAR_CLIP);

    q[3][0] = 0.0;
    q[3][1] = 0.0;
    q[3][2] = 1.0;
    q[3][3] = 0.0;

    for (i = 0; i < 4; i++) { // Row.
      // First 3 columns of the current row.
      for (j = 0; j < 3; j++) { // Column.
        m_projection[j*4 + i] =
          q[i][0] * trans[0][j] +
          q[i][1] * trans[1][j] +
          q[i][2] * trans[2][j];
      }
      // Fourth column of the current row.
      m_projection[i+4*3]=
        q[i][0] * trans[0][3] +
        q[i][1] * trans[1][3] +
        q[i][2] * trans[2][3] +
        q[i][3];
    }
  }
  /**
   *
   * @param i_factor
   * NyARCameraDistortionFactorにセットする配列を指定する。要素数は4であること。
   * @param i_projection
   * NyARPerspectiveProjectionMatrixセットする配列を指定する。要素数は12であること。
   */
  ,setValue : function(i_factor,i_projection)
  {
    this._dist.setValue(i_factor);
    this._projection_matrix.setValue(i_projection);
    return;
  }
  /**
   * int arParamChangeSize( ARParam *source, int xsize, int ysize, ARParam *newparam );
   * 関数の代替関数 サイズプロパティをi_xsize,i_ysizeに変更します。
   * @param i_xsize
   * @param i_ysize
   * @param newparam
   * @return
   *
   */
  ,changeScreenSize : function(i_xsize,i_ysize)
  {
    var scale = i_xsize / this._screen_size.w;// scale = (double)xsize / (double)(source->xsize);
    //スケールを変更
    this._dist.changeScale(scale);
    this._projection_matrix.changeScale(scale);
    this._screen_size.w = i_xsize;// newparam->xsize = xsize;
    this._screen_size.h = i_ysize;// newparam->ysize = ysize;
    return;
  }
  ,loadARParam : function(i_stream)
  {
    var tmp = new FloatVector(12);//new double[12];
    i_stream.endian = Endian.BIG_ENDIAN;
    this._screen_size.w = i_stream.readInt();//bb.getInt();
    this._screen_size.h = i_stream.readInt();//bb.getInt();
    //double値を12個読み込む
    var i;
    for(i = 0; i < 12; i++){
      tmp[i] = i_stream.readDouble();//bb.getDouble();
    }
    //Projectionオブジェクトにセット
    this._projection_matrix.setValue(tmp);
    //double値を4個読み込む
    for (i = 0; i < 4; i++) {
      tmp[i] = i_stream.readDouble();//bb.getDouble();
    }
    //Factorオブジェクトにセット
    this._dist.setValue(tmp);
    return;
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */

/**
 * typedef struct { int xsize, ysize; double mat[3][4]; double dist_factor[4]; } ARParam;
 * NyARの動作パラメータを格納するクラス
 *
 * @see jp.nyatla.nyartoolkit.as3.core.param.NyARParam
 */
FLARParam = ASKlass('FLARParam', NyARParam,
{
  FLARParam : function(w,h)
  {
    w = w || 640;
    h = h || 480;
    this._screen_size.w = w;
    this._screen_size.h = h;
    var f = (w/h) / (4/3);
    var dist = new FloatVector([w/2, 1.1*h/2, 26.2, 1.0127565206658486]);
    var projection = new FloatVector([f*700.9514702992245, 0, w/2-0.5, 0,
                                      0, 726.0941816535367, h/2-0.5, 0,
                                      0, 0,                 1,     0]);
    this.setValue(dist, projection);
  }

})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */

INyARRaster = ASKlass('INyARRaster',
{
  getWidth : function(){},
  getHeight : function(){},
  getSize : function(){},
  /**
   * バッファオブジェクトを返します。
   * @return
   */
  getBuffer : function(){},
  /**
   * バッファオブジェクトのタイプを返します。
   * @return
   */
  getBufferType : function(){},
  /**
   * バッファのタイプがi_type_valueであるか、チェックします。
   * この値は、NyARBufferTypeに定義された定数値です。
   * @param i_type_value
   * @return
   */
  isEqualBufferType : function(i_type_value){},
  /**
   * getBufferがオブジェクトを返せるかの真偽値です。
   * @return
   */
  hasBuffer : function(){},
  /**
   * i_ref_bufをラップします。できる限り整合性チェックを行います。
   * バッファの再ラッピングが可能な関数のみ、この関数を実装してください。
   * @param i_ref_buf
   */
  wrapBuffer : function(i_ref_buf){}
})

NyARRaster_BasicClass = ASKlass('NyARRaster_BasicClass', INyARRaster,
{
  _size : null,
  _buffer_type : 0,
  /*
   * ,NyARRaster_BasicClass : function(int i_width,int i_height,int i_buffer_type)
   */
  NyARRaster_BasicClass : function()
  {
    switch(arguments.length) {
    case 1:
      if (arguments[0] == NyAS3Const_Inherited) {
        //blank
      }
      break;
    case 3:
      this.overload_NyARRaster_BasicClass(toInt(arguments[0]),toInt(arguments[1]),toInt(arguments[2]));
      break;
    default:
      throw new NyARException();
    }
  }
  ,overload_NyARRaster_BasicClass : function(i_width ,i_height,i_buffer_type)
  {
    this._size = new NyARIntSize(i_width, i_height);
    this._buffer_type=i_buffer_type;
  }
  ,getWidth : function()
  {
    return this._size.w;
  }
  ,getHeight : function()
  {
    return this._size.h;
  }
  ,getSize : function()
  {
    return this._size;
  }
  ,getBufferType : function()
  {
    return this._buffer_type;
  }
  ,isEqualBufferType : function(i_type_value)
  {
    return this._buffer_type==i_type_value;
  }
  ,getBuffer : function()
  {
    throw new NyARException();
  }
  ,hasBuffer : function()
  {
    throw new NyARException();
  }
  ,wrapBuffer : function(i_ref_buf)
  {
    throw new NyARException();
  }
})

NyARBinRaster = ASKlass('NyARBinRaster', NyARRaster_BasicClass,
{
  _buf : null,
  /**
   * バッファオブジェクトがアタッチされていればtrue
   */
  _is_attached_buffer : null,
  /**
   *
   */
  NyARBinRaster : function()
  {
    NyARRaster_BasicClass.initialize.call(this, NyAS3Const_Inherited);
    switch(arguments.length) {
    case 1:
      if (arguments[0] == NyAS3Const_Inherited) {
        //blank
      }
      break;
    case 2:
      //(int,int)
      this.override_NyARBinRaster2(toInt(arguments[0]), toInt(arguments[1]));
      break;
    case 3:
      //(int,int,bool)
      this.override_NyARBinRaster3(toInt(arguments[0]), toInt(arguments[1]),Boolean(arguments[2]));
      break;
    case 4:
      //(int,int,int,bool)
      this.override_NyARBinRaster4(toInt(arguments[0]), toInt(arguments[1]),toInt(arguments[2]),Boolean(arguments[3]));
      break;
    default:
      throw new NyARException();
    }
  }
  /**
   *
   * @param i_width
   * @param i_height
   * @param i_raster_type
   * NyARBufferTypeに定義された定数値を指定してください。
   * @param i_is_alloc
   * @throws NyARException
   */
  ,override_NyARBinRaster4 : function(i_width, i_height, i_raster_type, i_is_alloc)
  {
    NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this,i_width,i_height,i_raster_type);
    if(!this.initInstance(this._size,i_raster_type,i_is_alloc)){
      throw new NyARException();
    }
  }
  ,override_NyARBinRaster3 : function(i_width, i_height, i_is_alloc)
  {
    NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this,i_width,i_height,NyARBufferType.INT1D_BIN_8);
    if(!this.initInstance(this._size,NyARBufferType.INT1D_BIN_8,i_is_alloc)){
      throw new NyARException();
    }
  }
  ,override_NyARBinRaster2 : function(i_width, i_height)
  {
    NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this,i_width,i_height,NyARBufferType.INT1D_BIN_8);
    if(!this.initInstance(this._size,NyARBufferType.INT1D_BIN_8,true)){
      throw new NyARException();
    }
  }
  ,initInstance : function(i_size,i_buf_type,i_is_alloc)
  {
    switch(i_buf_type)
    {
      case NyARBufferType.INT1D_BIN_8:
        this._buf = i_is_alloc?new IntVector(i_size.w*i_size.h):null;
        break;
      default:
        return false;
    }
    this._is_attached_buffer=i_is_alloc;
    return true;
  }
  ,getBuffer : function()
  {
    return this._buf;
  }
  /**
   * インスタンスがバッファを所有するかを返します。
   * コンストラクタでi_is_allocをfalseにしてラスタを作成した場合、
   * バッファにアクセスするまえに、バッファの有無をこの関数でチェックしてください。
   * @return
   */
  ,hasBuffer : function()
  {
    return this._buf!=null;
  }
  ,wrapBuffer : function(i_ref_buf)
  {
    NyAS3Utils.assert(!this._is_attached_buffer);//バッファがアタッチされていたら機能しない。
    this._buf=i_ref_buf;
  }
})





NyARGrayscaleRaster = ASKlass('NyARGrayscaleRaster', NyARRaster_BasicClass,
{
  _buf : null,
  /**
   * バッファオブジェクトがアタッチされていればtrue
   */
  _is_attached_buffer : null,
  NyARGrayscaleRaster : function()
  {
    NyARRaster_BasicClass.initialize.call(this, NyAS3Const_Inherited);
    switch(arguments.length) {
    case 1:
      if (arguments[0] == NyAS3Const_Inherited) {
        //blank
      }
      break;
    case 2:
      //(int,int)
      this.overload_NyARGrayscaleRaster2(toInt(arguments[0]), toInt(arguments[1]));
      break;
    case 3:
      //(int,int,boolean)
      this.overload_NyARGrayscaleRaster3(toInt(arguments[0]), toInt(arguments[1]),Boolean(arguments[2]));
      break;
    case 4:
      //(int,int,int,boolean)
      this.overload_NyARGrayscaleRaster4(toInt(arguments[0]), toInt(arguments[1]),toInt(arguments[2]),Boolean(arguments[3]));
      break;
    default:
      throw new NyARException();
    }
  }
  ,overload_NyARGrayscaleRaster2 : function(i_width,i_height)
  {
    NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this,i_width,i_height,NyARBufferType.INT1D_GRAY_8);
    if(!this.initInstance(this._size,NyARBufferType.INT1D_GRAY_8,true)){
      throw new NyARException();
    }
  }
  ,overload_NyARGrayscaleRaster3 : function(i_width,i_height,i_is_alloc)
  {
    NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this,i_width,i_height,NyARBufferType.INT1D_GRAY_8);
    if(!this.initInstance(this._size,NyARBufferType.INT1D_GRAY_8,i_is_alloc)){
      throw new NyARException();
    }
  }
  /**
   * @param i_width
   * @param i_height
   * @param i_raster_type
   * NyARBufferTypeに定義された定数値を指定してください。
   * @param i_is_alloc
   * @throws NyARException
   */
  ,overload_NyARGrayscaleRaster4 : function(i_width, i_height, i_raster_type, i_is_alloc)
  {
    NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this,i_width,i_height,i_raster_type);
    if(!this.initInstance(this._size,i_raster_type,i_is_alloc)){
      throw new NyARException();
    }
  }
  ,initInstance : function(i_size,i_buf_type,i_is_alloc)
  {
    switch(i_buf_type)
    {
      case NyARBufferType.INT1D_GRAY_8:
        this._buf =i_is_alloc?new IntVector(i_size.w*i_size.h):null;
        break;
      default:
        return false;
    }
    this._is_attached_buffer=i_is_alloc;
    return true;
  }
  ,getBuffer : function()
  {
    return this._buf;
  }
  /**
   * インスタンスがバッファを所有するかを返します。
   * コンストラクタでi_is_allocをfalseにしてラスタを作成した場合、
   * バッファにアクセスするまえに、バッファの有無をこの関数でチェックしてください。
   * @return
   */
  ,hasBuffer : function()
  {
    return this._buf!=null;
  }
  ,wrapBuffer : function(i_ref_buf)
  {
    NyAS3Utils.assert(!this._is_attached_buffer);//バッファがアタッチされていたら機能しない。
    this._buf=i_ref_buf;
  }
})




/**このクラスは、単機能のNyARRasterです。
 *
 */
NyARRaster = ASKlass('NyARRaster', NyARRaster_BasicClass,
{
  _buf : null,
  _buf_type : 0,
  /**
   * バッファオブジェクトがアタッチされていればtrue
   */
  _is_attached_buffer : null,
  NyARRaster : function()
  {
    NyARRaster_BasicClass.initialize.call(this, NyAS3Const_Inherited);
    switch(arguments.length) {
    case 1:
      if (arguments[0] == NyAS3Const_Inherited) {
        //blank
      }
      break;
    case 3:
      this.overload_NyARRaster3(toInt(arguments[0]), toInt(arguments[1]),toInt(arguments[2]));
      break;
    case 4:
      this.overload_NyARRaster4(toInt(arguments[0]), toInt(arguments[1]),toInt(arguments[2]),Boolean(arguments[3]));
      break;
    default:
      throw new NyARException();
    }
  }
  /**
   * 指定したバッファタイプのラスタを作成します。
   * @param i_width
   * @param i_height
   * @param i_buffer_type
   * NyARBufferTypeに定義された定数値を指定してください。
   * @param i_is_alloc
   * @throws NyARException
   */
  ,overload_NyARRaster4 : function(i_width, i_height, i_buffer_type, i_is_alloc)
  {
    NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this,i_width,i_height,i_buffer_type);
    if(!this.initInstance(this._size,i_buffer_type,i_is_alloc)){
      throw new NyARException();
    }
    return;
  }
  ,overload_NyARRaster3 : function(i_width, i_height, i_buffer_type)
  {
    NyARRaster_BasicClass.overload_NyARRaster_BasicClass.call(this,i_width,i_height,i_buffer_type);
    if(!this.initInstance(this._size,i_buffer_type,true)){
      throw new NyARException();
    }
    return;
  }
  ,initInstance : function(i_size,i_buf_type,i_is_alloc)
  {
    switch(i_buf_type)
    {
      case NyARBufferType.INT1D_X8R8G8B8_32:
        this._buf=i_is_alloc?new IntVector(i_size.w*i_size.h):null;
        break;
      default:
        return false;
    }
    this._is_attached_buffer=i_is_alloc;
    return true;
  }
  ,getBuffer : function()
  {
    return this._buf;
  }
  /**
   * インスタンスがバッファを所有するかを返します。
   * コンストラクタでi_is_allocをfalseにしてラスタを作成した場合、
   * バッファにアクセスするまえに、バッファの有無をこの関数でチェックしてください。
   * @return
   */
  ,hasBuffer : function()
  {
    return this._buf!=null;
  }
  ,wrapBuffer : function(i_ref_buf)
  {
    NyAS3Utils.assert(!this._is_attached_buffer);//バッファがアタッチされていたら機能しない。
    this._buf=i_ref_buf;
  }
})


/**
 * 8bitRGBを表現できるラスタ
 *
 */
INyARRgbRaster = ASKlass('INyARRgbRaster', INyARRaster, {
  getRgbPixelReader : function(){}
})
/**
 * NyARRasterインタフェイスの基本関数/メンバを実装したクラス
 *
 *
 */
NyARRgbRaster_BasicClass = ASKlass('NyARRgbRaster_BasicClass', INyARRgbRaster,
{
  _size : null,
  _buffer_type : 0,
  NyARRgbRaster_BasicClass : function()
  {
    switch(arguments.length) {
    case 1:
      if (arguments[0] == NyAS3Const_Inherited) {
        //blank
      }
      break;
    case 3:
      //(int,int,int)
      this.overload_NyARRgbRaster_BasicClass(toInt(arguments[0]),toInt(arguments[1]),toInt(arguments[2]));
      break;
    default:
      throw new NyARException();
    }
  }
  ,overload_NyARRgbRaster_BasicClass : function(i_width,i_height,i_buffer_type)
  {
    this._size= new NyARIntSize(i_width,i_height);
    this._buffer_type=i_buffer_type;
  }
  ,getWidth : function()
  {
    return this._size.w;
  }
  ,getHeight : function()
  {
    return this._size.h;
  }
  ,getSize : function()
  {
    return this._size;
  }
  ,getBufferType : function()
  {
    return this._buffer_type;
  }
  ,isEqualBufferType : function(i_type_value)
  {
    return this._buffer_type==i_type_value;
  }
  ,getRgbPixelReader : function()
  {
    throw new NyARException();
  }
  ,getBuffer : function()
  {
    throw new NyARException();
  }
  ,hasBuffer : function()
  {
    throw new NyARException();
  }
  ,wrapBuffer : function(i_ref_buf)
  {
    throw new NyARException();
  }
})

NyARRgbRaster = ASKlass('NyARRgbRaster', NyARRgbRaster_BasicClass,
{
  _buf : null,
  _reader : null,
  /**
   * バッファオブジェクトがアタッチされていればtrue
   */
  _is_attached_buffer : null,
  NyARRgbRaster : function()
  {
    NyARRgbRaster_BasicClass.initialize.call(this, NyAS3Const_Inherited);
    switch(arguments.length) {
    case 1:
      if (arguments[0] == NyAS3Const_Inherited) {
        //blank
      }
      break;
    case 3:
      this.overload_NyARRgbRaster3(toInt(arguments[0]), toInt(arguments[1]),toInt(arguments[2]));
      break;
    case 4:
      this.overload_NyARRgbRaster4(toInt(arguments[0]), toInt(arguments[1]),toInt(arguments[2]),Boolean(arguments[3]));
      break;
    default:
      throw new NyARException();
    }
  }
  /**
   *
   * @param i_width
   * @param i_height
   * @param i_raster_type
   * NyARBufferTypeに定義された定数値を指定してください。
   * @param i_is_alloc
   * @throws NyARException
   */
  ,overload_NyARRgbRaster4 : function(i_width,i_height,i_raster_type,i_is_alloc)
  {
    NyARRgbRaster_BasicClass.overload_NyARRgbRaster_BasicClass.call(this,i_width,i_height,i_raster_type);
    if(!this.initInstance(this._size,i_raster_type,i_is_alloc)){
      throw new NyARException();
    }
  }
  /**
   *
   * @param i_width
   * @param i_height
   * @param i_raster_type
   * NyARBufferTypeに定義された定数値を指定してください。
   * @throws NyARException
   */
  ,overload_NyARRgbRaster3 : function(i_width, i_height, i_raster_type)
  {
    NyARRgbRaster_BasicClass.overload_NyARRgbRaster_BasicClass.call(this,i_width,i_height,i_raster_type);
    if(!this.initInstance(this._size,i_raster_type,true)){
      throw new NyARException();
    }
  }
  ,initInstance : function(i_size,i_raster_type,i_is_alloc)
  {
    switch(i_raster_type)
    {
      case NyARBufferType.INT1D_X8R8G8B8_32:
        this._buf=i_is_alloc?new IntVector(i_size.w*i_size.h):null;
        this._reader=new NyARRgbPixelReader_INT1D_X8R8G8B8_32(this._buf||new IntVector(1),i_size);
        break;
      case NyARBufferType.BYTE1D_B8G8R8X8_32:
      case NyARBufferType.BYTE1D_R8G8B8_24:
      default:
        return false;
    }
    this._is_attached_buffer=i_is_alloc;
    return true;
  }
  ,getRgbPixelReader : function()
  {
    return this._reader;
  }
  ,getBuffer : function()
  {
    return this._buf;
  }
  ,hasBuffer : function()
  {
    return this._buf!=null;
  }
  ,wrapBuffer : function(i_ref_buf)
  {
    NyAS3Utils.assert(!this._is_attached_buffer);//バッファがアタッチされていたら機能しない。
    this._buf=i_ref_buf;
    //ピクセルリーダーの参照バッファを切り替える。
    this._reader.switchBuffer(i_ref_buf);
  }
})



NyARRgbRaster_Canvas2D = ASKlass("NyARRgbRaster_Canvas2D", NyARRgbRaster_BasicClass,
{
  _canvas : null,
  _rgb_reader: null,

  NyARRgbRaster_Canvas2D : function(canvas) {
    NyARRgbRaster_BasicClass.initialize.call(this, canvas.width, canvas.height, NyARBufferType.OBJECT_JS_Canvas);
    this._canvas = canvas;
    this._rgb_reader = new NyARRgbPixelReader_Canvas2D(this._canvas);
  },
  getRgbPixelReader : function()
  {
    return this._rgb_reader;
  },
  getBuffer:function()
  {
    return this._canvas;
  },
  hasBuffer:function()
  {
    return this._bitmapData != null;
  }
})

/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */


FLARCanvas = function(w,h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}



FLARBinRaster = ASKlass('FLARBinRaster', NyARBinRaster,
{
  FLARBinRaster : function(i_width,i_height)
  {
    NyARBinRaster.initialize.call(this,i_width,i_height,NyARBufferType.OBJECT_AS3_BitmapData,true);
    this._gray_reader = new FLARGrayPixelReader_BitmapData(this._buf);
  }
  ,initInstance : function(i_size,i_buf_type,i_is_alloc)
  {
    this._buf = i_is_alloc?new BitmapData(i_size.w,i_size.h,0x00):null;
    return true;
  }
  ,getGrayPixelReader : function() {
    return this._gray_reader;
  }
})


FLARRgbRaster_BitmapData = ASKlass('FLARRgbRaster_BitmapData', NyARRgbRaster_BasicClass,
{
  _bitmapData : null
  ,_rgb_reader : null
  /**
   *
   * @deprecated 次バージョンで次のように変更されます。 FLARRgbRaster_BitmapData(i_width,i_height)
   */
  ,FLARRgbRaster_BitmapData : function(bitmapData) {
    NyARRgbRaster_BasicClass.initialize.call(this,bitmapData.width, bitmapData.height,NyARBufferType.OBJECT_AS3_BitmapData);
    this._bitmapData = bitmapData;
    this._rgb_reader = new FLARRgbPixelReader_BitmapData(this._bitmapData);
  }
  ,getRgbPixelReader : function()
  {
    return this._rgb_reader;
  }
  ,getBuffer : function()
  {
    return this._bitmapData;
  }
  ,hasBuffer : function()
  {
    return this._bitmapData != null;
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */


NyARMatchPattDeviationBlackWhiteData = ASKlass('NyARMatchPattDeviationBlackWhiteData',
{
  _data : null,
  _pow : 0,
  //
  _number_of_pixels : 0,
  refData : function()
  {
    return this._data;
  }
  ,getPow : function()
  {
    return this._pow;
  }
  ,NyARMatchPattDeviationBlackWhiteData : function(i_width,i_height)
  {
    this._number_of_pixels=i_height*i_width;
    this._data=new IntVector(this._number_of_pixels);
    return;
  }
  /**
   * XRGB[width*height]の配列から、パターンデータを構築。
   * @param i_buffer
   */
  ,setRaster : function(i_raster)
  {
    //i_buffer[XRGB]→差分[BW]変換
    var i;
    var ave;//<PV/>
    var rgb;//<PV/>
    var linput=this._data;//<PV/>
    var buf=(i_raster.getBuffer());
    // input配列のサイズとwhも更新// input=new int[height][width][3];
    var number_of_pixels=this._number_of_pixels;
    //<平均値計算(FORの1/8展開)/>
    ave = 0;
    for(i=number_of_pixels-1;i>=0;i--){
      rgb = buf[i];
      ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
    }
    ave=(number_of_pixels*255*3-ave)/(3*number_of_pixels);
    //
    var sum = 0,w_sum;
    //<差分値計算/>
    for (i = number_of_pixels-1; i >= 0;i--) {
      rgb = buf[i];
      w_sum =((255*3-(rgb & 0xff)-((rgb >> 8) & 0xff)-((rgb >> 16) & 0xff))/3)-ave;
      linput[i] = w_sum;
      sum += w_sum * w_sum;
    }
    var p=Math.sqrt(sum);
    this._pow=p!=0.0?p:0.0000001;
    return;
  }
})
NyARMatchPattDeviationColorData = ASKlass('NyARMatchPattDeviationColorData',
{
  _data : null,
  _pow : 0,
  //
  _number_of_pixels : 0,
  _optimize_for_mod : 0,
  refData : function()
  {
    return this._data;
  }
  ,getPow : function()
  {
    return this._pow;
  }
  ,NyARMatchPattDeviationColorData : function(i_width,i_height)
  {
    this._number_of_pixels=i_height*i_width;
    this._data=new IntVector(this._number_of_pixels*3);
    this._optimize_for_mod=this._number_of_pixels-(this._number_of_pixels%8);
    return;
  }
  /**
   * NyARRasterからパターンデータをセットします。
   * この関数は、データを元に所有するデータ領域を更新します。
   * @param i_buffer
   */
  ,setRaster : function(i_raster)
  {
    //画素フォーマット、サイズ制限
    NyAS3Utils.assert(i_raster.isEqualBufferType(NyARBufferType.INT1D_X8R8G8B8_32));
    NyAS3Utils.assert(i_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize()));
    var buf=(i_raster.getBuffer());
    //i_buffer[XRGB]→差分[R,G,B]変換
    var i;
    var ave;//<PV/>
    var rgb;//<PV/>
    var linput=this._data;//<PV/>
    // input配列のサイズとwhも更新// input=new int[height][width][3];
    var number_of_pixels=this._number_of_pixels;
    var for_mod=this._optimize_for_mod;
    //<平均値計算(FORの1/8展開)>
    ave = 0;
    for(i=number_of_pixels-1;i>=for_mod;i--){
      rgb = buf[i];ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);
    }
    for (;i>=0;) {
      rgb = buf[i];ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);i--;
      rgb = buf[i];ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);i--;
      rgb = buf[i];ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);i--;
      rgb = buf[i];ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);i--;
      rgb = buf[i];ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);i--;
      rgb = buf[i];ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);i--;
      rgb = buf[i];ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);i--;
      rgb = buf[i];ave += ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff);i--;
    }
    //<平均値計算(FORの1/8展開)/>
    ave=number_of_pixels*255*3-ave;
    ave =255-(ave/ (number_of_pixels * 3));//(255-R)-ave を分解するための事前計算
    var sum = 0,w_sum;
    var input_ptr=number_of_pixels*3-1;
    //<差分値計算(FORの1/8展開)>
    for (i = number_of_pixels-1; i >= for_mod;i--) {
      rgb = buf[i];
      w_sum = (ave - (rgb & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//B
      w_sum = (ave - ((rgb >> 8) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//G
      w_sum = (ave - ((rgb >> 16) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//R
    }
    for (; i >=0;) {
      rgb = buf[i];i--;
      w_sum = (ave - (rgb & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//B
      w_sum = (ave - ((rgb >> 8) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//G
      w_sum = (ave - ((rgb >> 16) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//R
      rgb = buf[i];i--;
      w_sum = (ave - (rgb & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//B
      w_sum = (ave - ((rgb >> 8) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//G
      w_sum = (ave - ((rgb >> 16) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//R
      rgb = buf[i];i--;
      w_sum = (ave - (rgb & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//B
      w_sum = (ave - ((rgb >> 8) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//G
      w_sum = (ave - ((rgb >> 16) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//R
      rgb = buf[i];i--;
      w_sum = (ave - (rgb & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//B
      w_sum = (ave - ((rgb >> 8) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//G
      w_sum = (ave - ((rgb >> 16) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//R
      rgb = buf[i];i--;
      w_sum = (ave - (rgb & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//B
      w_sum = (ave - ((rgb >> 8) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//G
      w_sum = (ave - ((rgb >> 16) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//R
      rgb = buf[i];i--;
      w_sum = (ave - (rgb & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//B
      w_sum = (ave - ((rgb >> 8) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//G
      w_sum = (ave - ((rgb >> 16) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//R
      rgb = buf[i];i--;
      w_sum = (ave - (rgb & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//B
      w_sum = (ave - ((rgb >> 8) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//G
      w_sum = (ave - ((rgb >> 16) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//R
      rgb = buf[i];i--;
      w_sum = (ave - (rgb & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//B
      w_sum = (ave - ((rgb >> 8) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//G
      w_sum = (ave - ((rgb >> 16) & 0xff)) ;linput[input_ptr--] = w_sum;sum += w_sum * w_sum;//R
    }
    //<差分値計算(FORの1/8展開)/>
    var p=Math.sqrt(sum);
    this._pow=p!=0.0?p:0.0000001;
    return;
  }
})
NyARMatchPattResult = ASKlass('NyARMatchPattResult',
{
  DIRECTION_UNKNOWN : -1,
  confidence : 0,
  direction : 0
})



/**
 * ARToolKitのマーカーコードを1個保持します。
 *
 */
NyARCode = ASKlass('NyARCode',
{
  _color_pat : new Array(4),
  _bw_pat : new Array(4),
  _width : 0,
  _height : 0,
  NyARCode : function(i_width, i_height)
  {
    this._width = i_width;
    this._height = i_height;
    //空のラスタを4個作成
    for(var i=0;i<4;i++){
      this._color_pat[i]=new NyARMatchPattDeviationColorData(i_width,i_height);
      this._bw_pat[i]=new NyARMatchPattDeviationBlackWhiteData(i_width,i_height);
    }
    return;
  }
  ,getColorData : function(i_index)
  {
    return this._color_pat[i_index];
  }
  ,getBlackWhiteData : function(i_index)
  {
    return this._bw_pat[i_index];
  }
  ,getWidth : function()
  {
    return this._width;
  }
  ,getHeight : function()
  {
    return this._height;
  }
  ,loadARPattFromFile : function(i_stream)
  {
    NyARCodeFileReader.loadFromARToolKitFormFile(i_stream,this);
    return;
  }
  ,setRaster : function(i_raster)
  {
    NyAS3Utils.assert(i_raster.length!=4);
    //ラスタにパターンをロードする。
    for(var i=0;i<4;i++){
      this._color_pat[i].setRaster(i_raster[i]);
    }
    return;
  }
})






NyARCodeFileReader = ASKlass('NyARCodeFileReader',
{

  /**
  * ARコードファイルからデータを読み込んでo_codeに格納します。
  * @param i_stream
  * @param o_code
  * @throws NyARException
  */
  loadFromARToolKitFormFile : function(i_stream,o_code)
  {
    var width=o_code.getWidth();
    var height=o_code.getHeight();
    var tmp_raster=new NyARRaster(width,height,NyARBufferType.INT1D_X8R8G8B8_32);
    //4個の要素をラスタにセットする。
    var token = i_stream.match(/\d+/g);
    var buf=(tmp_raster.getBuffer());
    //GBRAで一度読みだす。
    for (var h = 0; h < 4; h++){
      this.readBlock(token,width,height,buf);
      //ARCodeにセット(カラー)
      o_code.getColorData(h).setRaster(tmp_raster);
      o_code.getBlackWhiteData(h).setRaster(tmp_raster);
    }
    tmp_raster=null;//ポイ
    return;
  }
  /**
  * 1ブロック分のXRGBデータをi_stからo_bufへ読みだします。
  * @param i_st
  * @param o_buf
  */
  ,readBlock : function(i_st, i_width, i_height, o_buf)
  {
    var pixels = i_width * i_height;
    var i3;
    for (i3 = 0; i3 < 3; i3++) {
      for (var i2 = 0; i2 < pixels; i2++){
        // 数値のみ読み出す
        var val = parseInt(i_st.shift());
        if(isNaN(val)){
          throw new NyARException("syntax error in pattern file.");
        }
        o_buf[i2]=(o_buf[i2]<<8)|((0x000000ff&toInt(val)));
      }
    }
    //GBR→RGB
    for(i3=0;i3<pixels;i3++){
      o_buf[i3]=((o_buf[i3]<<16)&0xff0000)|(o_buf[i3]&0x00ff00)|((o_buf[i3]>>16)&0x0000ff);
    }
    return;
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARCode = ASKlass('FLARCode', NyARCode,
{
  markerPercentWidth : 50
  ,markerPercentHeight : 50
  /**
   *
   * @param  i_width          幅方向の分割数
   * @param  i_height        高さ方向の分割数
   * @param  i_markerPercentWidth  マーカ全体(本体＋枠)における、マーカ本体部分の割合(幅)
   * @param  i_markerPercentHeight  マーカ全体(本体＋枠)における、マーカ本体部分の割合(高さ)
   */
  ,FLARCode : function(i_width, i_height,i_markerPercentWidth,  i_markerPercentHeight)
  {
    NyARCode.initialize.call(this, i_width, i_height);
    this.markerPercentWidth = i_markerPercentWidth == null ? 50 : i_markerPercentWidth;
    this.markerPercentHeight = i_markerPercentHeight == null ? 50 : i_markerPercentHeight;
  }
  ,loadARPatt : function(i_stream)
  {
    NyARCode.loadARPattFromFile.call(this, i_stream);
    return;
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */

/**
 * ARColorPattのマッチング計算をするインタフェイスです。 基準Patに対して、計算済みのARCodeデータとの間で比較演算をします。
 * pattern_match関数を分解した３種類のパターン検出クラスを定義します。
 *
 */
INyARMatchPatt = ASKlass('INyARMatchPatt',
{
  setARCode : function(i_code){}
})
NyARMatchPatt_Color_WITHOUT_PCA = ASKlass('NyARMatchPatt_Color_WITHOUT_PCA', INyARMatchPatt,
{
  _code_patt : null,
  _optimize_for_mod : 0,
  _rgbpixels : 0,
  NyARMatchPatt_Color_WITHOUT_PCA : function()
  {
    switch(arguments.length){
    case 1:
      {  //,NyARMatchPatt_Color_WITHOUT_PCA : function(i_code_ref)
        var i_code_ref=arguments[0];
        var w=i_code_ref.getWidth();
        var h=i_code_ref.getHeight();
        //最適化定数の計算
        this._rgbpixels=w*h*3;
        this._optimize_for_mod=this._rgbpixels-(this._rgbpixels%16);
        this.setARCode(i_code_ref);
        return;
      }
      break;
    case 2:
      {  //,NyARMatchPatt_Color_WITHOUT_PCA : function(i_width,i_height)
        var i_width = toInt(arguments[0]), i_height = toInt(arguments[1]);
        //最適化定数の計算
        this._rgbpixels=i_height*i_width*3;
        this._optimize_for_mod=this._rgbpixels-(this._rgbpixels%16);
        return;
      }
      break;
    default:
      break;
    }
    throw new NyARException();
  }
  /**
   * 比較対象のARCodeをセットします。
   * @throws NyARException
   */
  ,setARCode : function(i_code_ref)
  {
    this._code_patt=i_code_ref;
    return;
  }
  /**
   * 現在セットされているARコードとi_pattを比較します。
   */
  ,evaluate : function(i_patt,o_result)
  {
    NyAS3Utils.assert(this._code_patt!=null);
    //
    var linput = i_patt.refData();
    var sum;
    var max = Number.MIN_VALUE;
    var res = NyARMatchPattResult.DIRECTION_UNKNOWN;
    var for_mod=this._optimize_for_mod;
    for (var j = 0; j < 4; j++) {
      //合計値初期化
      sum=0;
      var code_patt=this._code_patt.getColorData(j);
      var pat_j = code_patt.refData();
      //<全画素について、比較(FORの1/16展開)>
      var i;
      for(i=this._rgbpixels-1;i>=for_mod;i--){
        sum += linput[i] * pat_j[i];
      }
      for (;i>=0;) {
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
        sum += linput[i] * pat_j[i];i--;
      }
      //<全画素について、比較(FORの1/16展開)/>
      var sum2 = sum / code_patt.getPow();// sum2 = sum / patpow[k][j]/ datapow;
      if (sum2 > max) {
        max = sum2;
        res = j;
      }
    }
    o_result.direction = res;
    o_result.confidence= max/i_patt.getPow();
    return true;
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */
NyARRasterAnalyzer_Histogram = ASKlass('NyARRasterAnalyzer_Histogram',
{
  _histImpl : null,
  /**
   * ヒストグラム解析の縦方向スキップ数。継承クラスはこのライン数づつ
   * スキップしながらヒストグラム計算を行うこと。
   */
  _vertical_skip : 0,
  NyARRasterAnalyzer_Histogram : function(i_raster_format, i_vertical_interval)
  {
    if(!this.initInstance(i_raster_format,i_vertical_interval)){
      throw new NyARException();
    }
  }
  ,initInstance : function(i_raster_format,i_vertical_interval)
  {
    switch (i_raster_format) {
    case NyARBufferType.INT1D_GRAY_8:
      this._histImpl = new NyARRasterThresholdAnalyzer_Histogram_INT1D_GRAY_8();
      break;
    case NyARBufferType.INT1D_X8R8G8B8_32:
      this._histImpl = new NyARRasterThresholdAnalyzer_Histogram_INT1D_X8R8G8B8_32();
      break;
    default:
      return false;
    }
    //初期化
    this._vertical_skip=i_vertical_interval;
    return true;
  }
  ,setVerticalInterval : function(i_step)
  {
    this._vertical_skip=i_step;
    return;
  }
  /**
   * o_histgramにヒストグラムを出力します。
   * @param i_input
   * @param o_histgram
   * @return
   * @throws NyARException
   */
  ,analyzeRaster : function(i_input,o_histgram)
  {
    var size=i_input.getSize();
    //最大画像サイズの制限
    NyAS3Utils.assert(size.w*size.h<0x40000000);
    NyAS3Utils.assert(o_histgram.length == 256);//現在は固定
    var  h=o_histgram.data;
    //ヒストグラム初期化
    for (var i = o_histgram.length-1; i >=0; i--){
      h[i] = 0;
    }
    o_histgram.total_of_data=size.w*size.h/this._vertical_skip;
    return this._histImpl.createHistogram(i_input, size,h,this._vertical_skip);
  }
})
ICreateHistogramImpl = ASKlass('ICreateHistogramImpl',
{
  createHistogram : function(i_reader,i_size,o_histgram,i_skip){}
})

NyARRasterThresholdAnalyzer_Histogram_INT1D_GRAY_8 = ASKlass('NyARRasterThresholdAnalyzer_Histogram_INT1D_GRAY_8', ICreateHistogramImpl,
{
  createHistogram : function(i_reader,i_size,o_histgram,i_skip)
  {
    NyAS3Utils.assert (i_reader.isEqualBufferType(NyARBufferType.INT1D_GRAY_8));
    var input=(IntVector)(i_reader.getBuffer());
    for (var y = i_size.h-1; y >=0 ; y-=i_skip){
      var pt=y*i_size.w;
      for (var x = i_size.w-1; x >=0; x--) {
        o_histgram[input[pt]]++;
        pt++;
      }
    }
    return i_size.w*i_size.h;
  }
})
NyARRasterThresholdAnalyzer_Histogram_INT1D_X8R8G8B8_32 = ASKlass('NyARRasterThresholdAnalyzer_Histogram_INT1D_X8R8G8B8_32', ICreateHistogramImpl,
{
  createHistogram : function(i_reader,i_size,o_histgram,i_skip)
  {
    NyAS3Utils.assert (i_reader.isEqualBufferType(NyARBufferType.INT1D_X8R8G8B8_32));
    var input =(i_reader.getBuffer());
    for (var y = i_size.h-1; y >=0 ; y-=i_skip){
      var pt=y*i_size.w;
      for (var x = i_size.w-1; x >=0; x--) {
        var p=input[pt];
        o_histgram[((p& 0xff)+(p& 0xff)+(p& 0xff))/3]++;
        pt++;
      }
    }
    return i_size.w*i_size.h;
  }
})
INyARRasterThresholdAnalyzer = ASKlass('INyARRasterThresholdAnalyzer',
{
  analyzeRaster : function(i_input){}
})
NyARRasterThresholdAnalyzer_SlidePTile = ASKlass('NyARRasterThresholdAnalyzer_SlidePTile', INyARRasterThresholdAnalyzer,
{
  _raster_analyzer : null,
  _sptile : null,
  _histgram : null,
  NyARRasterThresholdAnalyzer_SlidePTile : function(i_persentage, i_raster_format, i_vertical_interval)
  {
    NyAS3Utils.assert (0 <= i_persentage && i_persentage <= 50);
    //初期化
    if(!this.initInstance(i_raster_format,i_vertical_interval)){
      throw new NyARException();
    }
    this._sptile=new NyARHistogramAnalyzer_SlidePTile(i_persentage);
    this._histgram=new NyARHistogram(256);
  }
  ,initInstance : function(i_raster_format,i_vertical_interval)
  {
    this._raster_analyzer=new NyARRasterAnalyzer_Histogram(i_raster_format,i_vertical_interval);
    return true;
  }
  ,setVerticalInterval : function(i_step)
  {
    this._raster_analyzer.setVerticalInterval(i_step);
    return;
  }
  ,analyzeRaster : function(i_input)
  {
    this._raster_analyzer.analyzeRaster(i_input, this._histgram);
    return this._sptile.getThreshold(this._histgram);
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARRasterAnalyzer_Histogram = ASKlass('FLARRasterAnalyzer_Histogram', NyARRasterAnalyzer_Histogram,
{
  FLARRasterAnalyzer_Histogram : function(i_vertical_interval)
  {
    NyARRasterAnalyzer_Histogram.initialize.call(this,NyARBufferType.OBJECT_AS3_BitmapData,i_vertical_interval);
  }
  ,initInstance : function(i_raster_format,i_vertical_interval)
  {
    if (i_raster_format != NyARBufferType.OBJECT_AS3_BitmapData) {
      return false;
    }else {
      this._vertical_skip = i_vertical_interval;
    }
    return true;
  }
  /**
   * o_histgramにヒストグラムを出力します。
   * @param i_input
   * @param o_histgram
   * @return
   * @throws NyARException
   */
  ,analyzeRaster : function(i_input,o_histgram)
  {
    var size=i_input.getSize();
    //最大画像サイズの制限
    NyAS3Utils.assert(size.w*size.h<0x40000000);
    NyAS3Utils.assert(o_histgram.length == 256);//現在は固定
    var  h=o_histgram.data;
    //ヒストグラム初期化
    for (var i = o_histgram.length-1; i >=0; i--){
      h[i] = 0;
    }
    o_histgram.total_of_data=size.w*size.h/this._vertical_skip;
    return this.createHistgram_AS3_BitmapData(i_input, size,h,this._vertical_skip);
  }
  ,createHistgram_AS3_BitmapData : function(i_reader,i_size,o_histgram,i_skip)
  {
    //[Todo:]この方法だとパフォーマンスでないから、Bitmapdataの
    NyAS3Utils.assert (i_reader.isEqualBufferType(NyARBufferType.OBJECT_AS3_BitmapData));
    var input=(i_reader.getBuffer());
    for (var y = i_size.h-1; y >=0 ; y-=i_skip){
      var pt=y*i_size.w;
      for (var x = i_size.w - 1; x >= 0; x--) {
        var p=input.getPixel(x,y);
        o_histgram[toInt((((p>>8)&0xff)+((p>>16)&0xff)+(p&0xff))/3)]++;
        pt++;
      }
    }
    return i_size.w*i_size.h;
  }
})

/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARRasterThresholdAnalyzer_SlidePTile = ASKlass('FLARRasterThresholdAnalyzer_SlidePTile', NyARRasterThresholdAnalyzer_SlidePTile,
{
  FLARRasterThresholdAnalyzer_SlidePTile : function(i_persentage, i_vertical_interval)
  {
    NyARRasterThresholdAnalyzer_SlidePTile.initialize.call(this,i_persentage, NyARBufferType.OBJECT_AS3_BitmapData,i_vertical_interval);
  }
  ,initInstance : function(i_raster_format,i_vertical_interval)
  {
    if (i_raster_format != NyARBufferType.OBJECT_AS3_BitmapData) {
      return false;
    }
    this._raster_analyzer=new FLARRasterAnalyzer_Histogram(i_vertical_interval);
    return true;
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */
INyARRasterFilter = ASKlass('INyARRasterFilter',
{
  doFilter : function(i_input,i_output){}
})
INyARRasterFilter_Gs2Bin = ASKlass('INyARRasterFilter_Gs2Bin',
{
  doFilter : function(i_input, i_output){}
})
INyARRasterFilter_Rgb2Gs = ASKlass('INyARRasterFilter_Rgb2Gs',
{
  doFilter : function(i_input,i_output){}
})
INyARRasterFilter_Rgb2Bin = ASKlass('INyARRasterFilter_Rgb2Bin',
{
  doFilter : function(i_input, i_output){}
})






/**
 * 定数閾値による2値化をする。
 *
 */
NyARRasterFilter_ARToolkitThreshold = ASKlass('NyARRasterFilter_ARToolkitThreshold', INyARRasterFilter_Rgb2Bin,
{
  _threshold : 0,
  _do_threshold_impl : null,
  NyARRasterFilter_ARToolkitThreshold : function(i_threshold, i_input_raster_type)
  {
    this._threshold = i_threshold;
    switch (i_input_raster_type) {
    case NyARBufferType.INT1D_X8R8G8B8_32:
      this._do_threshold_impl=new doThFilterImpl_BUFFERFORMAT_INT1D_X8R8G8B8_32();
      break;
    default:
      throw new NyARException();
    }
  }
  /**
   * 画像を２値化するための閾値。暗点&lt;=th&lt;明点となります。
   * @param i_threshold
   */
  ,setThreshold : function(i_threshold )
  {
    this._threshold = i_threshold;
  }
  ,doFilter : function(i_input,i_output)
  {
    NyAS3Utils.assert (i_output.isEqualBufferType(NyARBufferType.INT1D_BIN_8));
    NyAS3Utils.assert (i_input.getSize().isEqualSize_NyARIntSize(i_output.getSize()) == true);
    this._do_threshold_impl.doThFilter(i_input,i_output,i_output.getSize(), this._threshold);
    return;
  }
})





/*
 * ここから各ラスタ用のフィルタ実装
 */
IdoThFilterImpl = ASKlass('IdoThFilterImpl',
{
  doThFilter : function(i_input,i_output,i_size,i_threshold){},
})

doThFilterImpl_BUFFERFORMAT_INT1D_X8R8G8B8_32 = ASKlass('doThFilterImpl_BUFFERFORMAT_INT1D_X8R8G8B8_32', IdoThFilterImpl,
{
  doThFilter : function(i_input,i_output,i_size,i_threshold)
  {
    NyAS3Utils.assert (i_output.isEqualBufferType(NyARBufferType.INT1D_BIN_8));
    var out_buf = (IntVector)(i_output.getBuffer());
    var in_buf = (IntVector)(i_input.getBuffer());
    var th=i_threshold*3;
    var w;
    var xy;
    var pix_count=i_size.h*i_size.w;
    var pix_mod_part=pix_count-(pix_count%8);
    for(xy=pix_count-1;xy>=pix_mod_part;xy--){
      w=in_buf[xy];
      out_buf[xy]=(((w>>16)&0xff)+((w>>8)&0xff)+(w&0xff))<=th?0:1;
    }
    //タイリング
    for (;xy>=0;) {
      w=in_buf[xy];
      out_buf[xy]=(((w>>16)&0xff)+((w>>8)&0xff)+(w&0xff))<=th?0:1;
      xy--;
      w=in_buf[xy];
      out_buf[xy]=(((w>>16)&0xff)+((w>>8)&0xff)+(w&0xff))<=th?0:1;
      xy--;
      w=in_buf[xy];
      out_buf[xy]=(((w>>16)&0xff)+((w>>8)&0xff)+(w&0xff))<=th?0:1;
      xy--;
      w=in_buf[xy];
      out_buf[xy]=(((w>>16)&0xff)+((w>>8)&0xff)+(w&0xff))<=th?0:1;
      xy--;
      w=in_buf[xy];
      out_buf[xy]=(((w>>16)&0xff)+((w>>8)&0xff)+(w&0xff))<=th?0:1;
      xy--;
      w=in_buf[xy];
      out_buf[xy]=(((w>>16)&0xff)+((w>>8)&0xff)+(w&0xff))<=th?0:1;
      xy--;
      w=in_buf[xy];
      out_buf[xy]=(((w>>16)&0xff)+((w>>8)&0xff)+(w&0xff))<=th?0:1;
      xy--;
      w=in_buf[xy];
      out_buf[xy]=(((w>>16)&0xff)+((w>>8)&0xff)+(w&0xff))<=th?0:1;
      xy--;
    }
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */
NyARContourPickup = ASKlass('NyARContourPickup',
{
  //巡回参照できるように、テーブルを二重化
  //                                           0  1  2  3  4  5  6  7   0  1  2  3  4  5  6
  _getContour_xdir : new IntVector([0, 1, 1, 1, 0, -1, -1, -1 , 0, 1, 1, 1, 0, -1, -1]),
  _getContour_ydir : new IntVector([-1,-1, 0, 1, 1, 1, 0,-1 ,-1,-1, 0, 1, 1, 1, 0]),
  getContour_NyARBinRaster : function(i_raster,i_entry_x,i_entry_y,i_array_size,o_coord_x,o_coord_y)
  {
    return this.impl_getContour(i_raster,0,i_entry_x,i_entry_y,i_array_size,o_coord_x,o_coord_y);
  }
  /**
   *
   * @param i_raster
   * @param i_th
   * 画像を２値化するための閾値。暗点&lt;=i_th&lt;明点となります。
   * @param i_entry_x
   * 輪郭の追跡開始点を指定します。
   * @param i_entry_y
   * @param i_array_size
   * @param o_coord_x
   * @param o_coord_y
   * @return
   * @throws NyARException
   */
  ,getContour_NyARGrayscaleRaster : function(i_raster,i_th,i_entry_x,i_entry_y,i_array_size,o_coord_x,o_coord_y)
  {
    return this.impl_getContour(i_raster,i_th,i_entry_x,i_entry_y,i_array_size,o_coord_x,o_coord_y);
  }
  /**
   * ラスタのエントリポイントから辿れる輪郭線を配列に返します。
   * @param i_raster
   * @param i_th
   * 暗点<=th<明点
   * @param i_entry_x
   * @param i_entry_y
   * @param i_array_size
   * @param o_coord_x
   * @param o_coord_y
   * @return
   * 輪郭線の長さを返します。
   * @throws NyARException
   */
  ,impl_getContour : function(i_raster,i_th,i_entry_x,i_entry_y,i_array_size,o_coord_x,o_coord_y)
  {
    var xdir = this._getContour_xdir;// static int xdir[8] = { 0, 1, 1, 1, 0,-1,-1,-1};
    var ydir = this._getContour_ydir;// static int ydir[8] = {-1,-1, 0, 1, 1, 1, 0,-1};
    var i_buf=i_raster.getBuffer();
    var width=i_raster.getWidth();
    var height=i_raster.getHeight();
    //クリップ領域の上端に接しているポイントを得る。
    var coord_num = 1;
    o_coord_x[0] = i_entry_x;
    o_coord_y[0] = i_entry_y;
    var dir = 5;
    var c = i_entry_x;
    var r = i_entry_y;
    for (;;) {
      dir = (dir + 5) % 8;//dirの正規化
      //ここは頑張ればもっと最適化できると思うよ。
      //4隅以外の境界接地の場合に、境界チェックを省略するとかね。
      if(c>=1 && c<width-1 && r>=1 && r<height-1){
        for(;;){//gotoのエミュレート用のfor文
          //境界に接していないとき(暗点判定)
          if (i_buf[(r + ydir[dir])*width+(c + xdir[dir])] <= i_th) {
            break;
          }
          dir++;
          if (i_buf[(r + ydir[dir])*width+(c + xdir[dir])] <= i_th) {
            break;
          }
          dir++;
          if (i_buf[(r + ydir[dir])*width+(c + xdir[dir])] <= i_th) {
            break;
          }
          dir++;
          if (i_buf[(r + ydir[dir])*width+(c + xdir[dir])] <= i_th) {
            break;
          }
          dir++;
          if (i_buf[(r + ydir[dir])*width+(c + xdir[dir])] <= i_th) {
            break;
          }
          dir++;
          if (i_buf[(r + ydir[dir])*width+(c + xdir[dir])] <= i_th) {
            break;
          }
          dir++;
          if (i_buf[(r + ydir[dir])*width+(c + xdir[dir])] <= i_th) {
            break;
          }
          dir++;
          if (i_buf[(r + ydir[dir])*width+(c + xdir[dir])] <= i_th) {
            break;
          }
/*
          try{
            BufferedImage b=new BufferedImage(width,height,ColorSpace.TYPE_RGB);
            NyARRasterImageIO.copy(i_raster, b);
          ImageIO.write(b,"png",new File("bug.png"));
          }catch(Exception e){
          }*/
          //8方向全て調べたけどラベルが無いよ？
          throw new NyARException();
        }
      }else{
        //境界に接しているとき
        var i;
        for (i = 0; i < 8; i++){
          var x=c + xdir[dir];
          var y=r + ydir[dir];
          //境界チェック
          if(x>=0 && x<width && y>=0 && y<height){
            if (i_buf[(y)*width+(x)] <= i_th) {
              break;
            }
          }
          dir++;//倍長テーブルを参照するので問題なし
        }
        if (i == 8) {
          //8方向全て調べたけどラベルが無いよ？
          throw new NyARException();// return(-1);
        }
      }
      dir=dir% 8;//dirの正規化
      // xcoordとycoordをc,rにも保存
      c = c + xdir[dir];
      r = r + ydir[dir];
      o_coord_x[coord_num] = c;
      o_coord_y[coord_num] = r;
      // 終了条件判定
      if (c == i_entry_x && r == i_entry_y){
        coord_num++;
        break;
      }
      coord_num++;
      if (coord_num == i_array_size) {
        //輪郭が末端に達した
        return coord_num;
      }
    }
    return coord_num;
  }
})
NyARCoord2Linear = ASKlass('NyARCoord2Linear',
{
  _xpos : null,
  _ypos : null,
  _pca : null,
  __getSquareLine_evec : new NyARDoubleMatrix22(),
  __getSquareLine_mean : new FloatVector(2),
  __getSquareLine_ev : new FloatVector(2),
  _dist_factor : null,
  NyARCoord2Linear : function(i_size,i_distfactor_ref)
  {
    //歪み計算テーブルを作ると、8*width/height*2の領域を消費します。
    //領域を取りたくない場合は、i_dist_factor_refの値をそのまま使ってください。
    this._dist_factor = new NyARObserv2IdealMap(i_distfactor_ref,i_size);
    // 輪郭バッファ
    this._pca=new NyARPca2d_MatrixPCA_O2();
    this._xpos=new FloatVector(i_size.w+i_size.h);//最大辺長はthis._width+this._height
    this._ypos=new FloatVector(i_size.w+i_size.h);//最大辺長はthis._width+this._height
    return;
  }
  /**
   * 輪郭点集合からay+bx+c=0の直線式を計算します。
   * @param i_st
   * @param i_ed
   * @param i_xcoord
   * @param i_ycoord
   * @param i_cood_num
   * @param o_line
   * @return
   * @throws NyARException
   */
  ,coord2Line : function(i_st,i_ed,i_xcoord,i_ycoord,i_cood_num,o_line)
  {
    //頂点を取得
    var n,st,ed;
    var w1;
    //探索区間の決定
    if(i_ed>=i_st){
      //頂点[i]から頂点[i+1]までの輪郭が、1区間にあるとき
      w1 = (i_ed - i_st + 1) * 0.05 + 0.5;
      //探索区間の決定
      st = Math.floor(i_st+w1);
      ed = Math.floor(i_ed - w1);
    }else{
      //頂点[i]から頂点[i+1]までの輪郭が、2区間に分かれているとき
      w1 = ((i_ed+i_cood_num-i_st+1)%i_cood_num) * 0.05 + 0.5;
      //探索区間の決定
      st = (Math.floor(i_st+w1))%i_cood_num;
      ed = (Math.floor(i_ed+i_cood_num-w1))%i_cood_num;
    }
    //探索区間数を確認
    if(st<=ed){
      //探索区間は1区間
      n = ed - st + 1;
      this._dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, st, n,this._xpos,this._ypos,0);
    }else{
      //探索区間は2区間
      n=ed+1+i_cood_num-st;
      this._dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, st,i_cood_num-st,this._xpos,this._ypos,0);
      this._dist_factor.observ2IdealBatch(i_xcoord, i_ycoord, 0,ed+1,this._xpos,this._ypos,i_cood_num-st);
    }
    //要素数の確認
    if (n < 2) {
      // nが2以下でmatrix.PCAを計算することはできないので、エラー
      return false;
    }
    //主成分分析する。
    var evec=this.__getSquareLine_evec;
    var mean=this.__getSquareLine_mean;
    this._pca.pca(this._xpos,this._ypos,n,evec, this.__getSquareLine_ev,mean);
    o_line.dy = evec.m01;// line[i][0] = evec->m[1];
    o_line.dx = -evec.m00;// line[i][1] = -evec->m[0];
    o_line.c = -(o_line.dy * mean[0] + o_line.dx * mean[1]);// line[i][2] = -(line[i][0]*mean->v[0] + line[i][1]*mean->v[1]);
    return true;
  }
})

/**
 * get_vertex関数を切り離すためのクラス
 *
 */
NyARVertexCounter = ASKlass('NyARVertexCounter',
{
  vertex : new IntVector(10),// 6まで削れる
  number_of_vertex : 0,
  thresh : 0,
  x_coord : null,
  y_coord : null,
  getVertex : function(i_x_coord, i_y_coord,i_coord_len,st,ed,i_thresh)
  {
    this.number_of_vertex = 0;
    this.thresh = i_thresh;
    this.x_coord = i_x_coord;
    this.y_coord = i_y_coord;
    return this.get_vertex(st, ed,i_coord_len);
  }
  /**
  * static int get_vertex( int x_coord[], int y_coord[], int st, int ed,double thresh, int vertex[], int *vnum) 関数の代替関数
  *
  * @param x_coord
  * @param y_coord
  * @param st
  * @param ed
  * @param thresh
  * @return
  */
  ,get_vertex : function(st,ed,i_coord_len)
  {
    var i;
    var d;
    //メモ:座標値は65536を超えなければint32で扱って大丈夫なので変更。
    //dmaxは4乗なのでやるとしてもint64じゃないとマズイ
    var v1 = 0;
    var lx_coord = this.x_coord;
    var ly_coord = this.y_coord;
    var a = ly_coord[ed] - ly_coord[st];
    var b = lx_coord[st] - lx_coord[ed];
    var c = lx_coord[ed] * ly_coord[st] - ly_coord[ed] * lx_coord[st];
    var dmax = 0;
    if(st<ed){
      //stとedが1区間
      for (i = st + 1; i < ed; i++) {
        d = a * lx_coord[i] + b * ly_coord[i] + c;
        if (d * d > dmax) {
          dmax = d * d;
          v1 = i;
        }
      }
    }else{
      //stとedが2区間
      for (i = st + 1; i < i_coord_len; i++) {
        d = a * lx_coord[i] + b * ly_coord[i] + c;
        if (d * d > dmax) {
          dmax = d * d;
          v1 = i;
        }
      }
      for (i = 0; i < ed; i++) {
        d = a * lx_coord[i] + b * ly_coord[i] + c;
        if (d * d > dmax) {
          dmax = d * d;
          v1 = i;
        }
      }
    }
    if (dmax / (a * a + b * b) > this.thresh) {
      if (!this.get_vertex(st, v1,i_coord_len)) {
        return false;
      }
      if (this.number_of_vertex > 5) {
        return false;
      }
      this.vertex[this.number_of_vertex] = v1;// vertex[(*vnum)] = v1;
      this.number_of_vertex++;// (*vnum)++;
      if (!this.get_vertex(v1, ed,i_coord_len)) {
        return false;
      }
    }
    return true;
  }
})

NyARCoord2SquareVertexIndexes = ASKlass('NyARCoord2SquareVertexIndexes',
{
  VERTEX_FACTOR : 1.0,// 線検出のファクタ
  __getSquareVertex_wv1 : new NyARVertexCounter(),
  __getSquareVertex_wv2 : new NyARVertexCounter(),
  NyARCoord2SquareVertexIndexes : function()
  {
    return;
  }
  /**
   * 座標集合から、頂点候補になりそうな場所を４箇所探して、そのインデクス番号を返します。
   * @param i_x_coord
   * @param i_y_coord
   * @param i_coord_num
   * @param i_area
   * @param o_vertex
   * @return
   */
  ,getVertexIndexes : function(i_x_coord ,i_y_coord,i_coord_num, i_area,o_vertex)
  {
    var wv1 = this.__getSquareVertex_wv1;
    var wv2 = this.__getSquareVertex_wv2;
    var vertex1_index=this.getFarPoint(i_x_coord,i_y_coord,i_coord_num,0);
    var prev_vertex_index=(vertex1_index+i_coord_num)%i_coord_num;
    var v1=this.getFarPoint(i_x_coord,i_y_coord,i_coord_num,vertex1_index);
    var thresh = (i_area / 0.75) * 0.01 * this.VERTEX_FACTOR;
    o_vertex[0] = vertex1_index;
    if (!wv1.getVertex(i_x_coord, i_y_coord,i_coord_num, vertex1_index, v1, thresh)) {
      return false;
    }
    if (!wv2.getVertex(i_x_coord, i_y_coord,i_coord_num, v1,prev_vertex_index, thresh)) {
      return false;
    }
    var v2;
    if (wv1.number_of_vertex == 1 && wv2.number_of_vertex == 1) {
      o_vertex[1] = wv1.vertex[0];
      o_vertex[2] = v1;
      o_vertex[3] = wv2.vertex[0];
    } else if (wv1.number_of_vertex > 1 && wv2.number_of_vertex == 0) {
      //頂点位置を、起点から対角点の間の1/2にあると予想して、検索する。
      if(v1>=vertex1_index){
        v2 = (v1-vertex1_index)/2+vertex1_index;
      }else{
        v2 = ((v1+i_coord_num-vertex1_index)/2+vertex1_index)%i_coord_num;
      }
      if (!wv1.getVertex(i_x_coord, i_y_coord,i_coord_num, vertex1_index, v2, thresh)) {
        return false;
      }
      if (!wv2.getVertex(i_x_coord, i_y_coord,i_coord_num, v2, v1, thresh)) {
        return false;
      }
      if (wv1.number_of_vertex == 1 && wv2.number_of_vertex == 1) {
        o_vertex[1] = wv1.vertex[0];
        o_vertex[2] = wv2.vertex[0];
        o_vertex[3] = v1;
      } else {
        return false;
      }
    } else if (wv1.number_of_vertex == 0 && wv2.number_of_vertex > 1) {
      //v2 = (v1+ end_of_coord)/2;
      if(v1<=prev_vertex_index){
        v2 = (v1+prev_vertex_index)/2;
      }else{
        v2 = ((v1+i_coord_num+prev_vertex_index)/2)%i_coord_num;
      }
      if (!wv1.getVertex(i_x_coord, i_y_coord,i_coord_num, v1, v2, thresh)) {
        return false;
      }
      if (!wv2.getVertex(i_x_coord, i_y_coord,i_coord_num, v2, prev_vertex_index, thresh)) {
        return false;
      }
      if (wv1.number_of_vertex == 1 && wv2.number_of_vertex == 1) {
        o_vertex[1] = v1;
        o_vertex[2] = wv1.vertex[0];
        o_vertex[3] = wv2.vertex[0];
      } else {
        return false;
      }
    } else {
      return false;
    }
    return true;
  }
  /**
   * i_pointの輪郭座標から、最も遠方にある輪郭座標のインデクスを探します。
   * @param i_xcoord
   * @param i_ycoord
   * @param i_coord_num
   * @return
   */
  ,getFarPoint : function(i_coord_x,i_coord_y,i_coord_num,i_point)
  {
    //
    var sx = i_coord_x[i_point];
    var sy = i_coord_y[i_point];
    var d = 0;
    var w, x, y;
    var ret = 0;
    var i;
    for (i = i_point+1; i < i_coord_num; i++) {
      x = i_coord_x[i] - sx;
      y = i_coord_y[i] - sy;
      w = x * x + y * y;
      if (w > d) {
        d = w;
        ret = i;
      }
    }
    for (i= 0; i < i_point; i++) {
      x = i_coord_x[i] - sx;
      y = i_coord_y[i] - sy;
      w = x * x + y * y;
      if (w > d) {
        d = w;
        ret = i;
      }
    }
    return ret;
  }
})


/**
 * ARMarkerInfoに相当するクラス。 矩形情報を保持します。
 *
 */
NyARSquare = ASKlass('NyARSquare',
{
  line : NyARLinear.createArray(4),
  sqvertex : NyARDoublePoint2d.createArray(4),
  getCenter2d : function(o_out)
  {
    o_out.x=(this.sqvertex[0].x+this.sqvertex[1].x+this.sqvertex[2].x+this.sqvertex[3].x)/4;
    o_out.y=(this.sqvertex[0].y+this.sqvertex[1].y+this.sqvertex[2].y+this.sqvertex[3].y)/4;
    return;
  }
})
NyARSquareContourDetector = ASKlass('NyARSquareContourDetector',
{
  /**
   *
   * @param i_raster
   * @param i_callback
   * @throws NyARException
   */
  detectMarkerCB : function(i_raster, i_callback)
  {
    NyARException.trap("getRgbPixelReader not implemented.");
  }
})
NyARSquareContourDetector_IDetectMarkerCallback = ASKlass('NyARSquareContourDetector_IDetectMarkerCallback',
{
  onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num,i_vertex_index){}
})
RleLabelOverlapChecker = ASKlass('RleLabelOverlapChecker', NyARLabelOverlapChecker,
{
  RleLabelOverlapChecker : function(i_max_label)
  {
    NyARLabelOverlapChecker.initialize.call(this,i_max_label);
  }
  ,createArray : function(i_length)
  {
    return new Array(i_length);
  }
})
NyARSquareContourDetector_Rle = ASKlass('NyARSquareContourDetector_Rle', NyARSquareContourDetector,
{
  AR_AREA_MAX : 100000,// #define AR_AREA_MAX 100000
  AR_AREA_MIN : 70,// #define AR_AREA_MIN 70
  _width : 0,
  _height : 0,
  _labeling : null,
  _overlap_checker : new RleLabelOverlapChecker(32),
  _cpickup : new NyARContourPickup(),
  _stack : null,
  _coord2vertex : new NyARCoord2SquareVertexIndexes(),
  _max_coord : 0,
  _xcoord : null,
  _ycoord : null,
  /**
   * 最大i_squre_max個のマーカーを検出するクラスを作成する。
   *
   * @param i_param
   */
  NyARSquareContourDetector_Rle : function(i_size)
  {
    this._width = i_size.w;
    this._height = i_size.h;
    //ラベリングのサイズを指定したいときはsetAreaRangeを使ってね。
    this._labeling = new NyARLabeling_Rle(this._width,this._height);
    this._labeling.setAreaRange(this.AR_AREA_MAX, this.AR_AREA_MIN);
    this._stack=new NyARRleLabelFragmentInfoStack(i_size.w*i_size.h*2048/(320*240)+32);//検出可能な最大ラベル数
    // 輪郭の最大長は画面に映りうる最大の長方形サイズ。
    var number_of_coord= (this._width + this._height) * 2;
    // 輪郭バッファ
    this._max_coord = number_of_coord;
    this._xcoord = new IntVector(number_of_coord);
    this._ycoord = new IntVector(number_of_coord);
    return;
  },
  __detectMarker_mkvertex : new IntVector(4)
  ,detectMarkerCB : function(i_raster ,i_callback)
  {
    var flagment=this._stack;
    var overlap = this._overlap_checker;
    // ラベル数が0ならここまで
    var label_num=this._labeling.labeling_NyARBinRaster(i_raster, 0, i_raster.getHeight(), flagment);
    if (label_num < 1) {
      return;
    }
    //ラベルをソートしておく
    flagment.sortByArea();
    //ラベルリストを取得
    var labels=(flagment.getArray());
    var xsize = this._width;
    var ysize = this._height;
    var xcoord = this._xcoord;
    var ycoord = this._ycoord;
    var coord_max = this._max_coord;
    var mkvertex =this.__detectMarker_mkvertex;
    //重なりチェッカの最大数を設定
    overlap.setMaxLabels(label_num);
    for (var i=0; i < label_num; i++) {
      var label_pt=labels[i];
      var label_area = label_pt.area;
      // クリップ領域が画面の枠に接していれば除外
      if (label_pt.clip_l == 0 || label_pt.clip_r == xsize-1){
        continue;
      }
      if (label_pt.clip_t == 0 || label_pt.clip_b == ysize-1){
        continue;
      }
      // 既に検出された矩形との重なりを確認
      if (!overlap.check(label_pt)) {
        // 重なっているようだ。
        continue;
      }
      //輪郭を取得
      var coord_num = _cpickup.getContour_NyARBinRaster(i_raster,label_pt.entry_x,label_pt.clip_t, coord_max, xcoord, ycoord);
      if (coord_num == coord_max) {
        // 輪郭が大きすぎる。
        continue;
      }
      //輪郭線をチェックして、矩形かどうかを判定。矩形ならばmkvertexに取得
      if (!this._coord2vertex.getVertexIndexes(xcoord, ycoord,coord_num,label_area, mkvertex)) {
        // 頂点の取得が出来なかった
        continue;
      }
      //矩形を発見したことをコールバック関数で通知
      i_callback.onSquareDetect(this,xcoord,ycoord,coord_num,mkvertex);
      // 検出済の矩形の属したラベルを重なりチェックに追加する。
      overlap.push(label_pt);
    }
    return;
  }
})
NyARSquareStack = ASKlass('NyARSquareStack', NyARObjectStack,
{
  NyARSquareStack : function(i_length)
  {
    NyARObjectStack.initialize.call(this,i_length);
  }
  ,createArray : function(i_length)
  {
    var ret= new Array(i_length);
    for (var i =0; i < i_length; i++){
      ret[i] = new NyARSquare();
    }
    return (ret);
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARSquare = NyARSquare;
Cxdir = new IntVector([0,1,1,1,0,-1,-1,-1]);
Cydir = new IntVector([-1,-1,0,1,1,1,0,-1]);
FLContourPickup = ASKlass('FLContourPickup', NyARContourPickup,
{
  FLContourPickup : function()
  {
  }
  ,getContour_FLARBinRaster : function(i_raster,i_entry_x,i_entry_y,i_array_size,o_coord_x,o_coord_y)
  {
    var xdir = this._getContour_xdir;// static int xdir[8] = { 0, 1, 1, 1, 0,-1,-1,-1};
    var ydir = this._getContour_ydir;// static int ydir[8] = {-1,-1, 0, 1, 1, 1, 0,-1};
    var i_buf=i_raster.getBuffer();
    var width=i_raster.getWidth();
    var height=i_raster.getHeight();
    //クリップ領域の上端に接しているポイントを得る。
    var coord_num = 1;
    o_coord_x[0] = i_entry_x;
    o_coord_y[0] = i_entry_y;
    var dir = 5;
    var c = i_entry_x;
    var r = i_entry_y;
    for (;;) {
      dir = (dir + 5) % 8;//dirの正規化
      //ここは頑張ればもっと最適化できると思うよ。
      //4隅以外の境界接地の場合に、境界チェックを省略するとかね。
      if(c>=1 && c<width-1 && r>=1 && r<height-1){
        for(;;){//gotoのエミュレート用のfor文
          //境界に接していないとき(暗点判定)
          if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) >0) {
            break;
          }
          dir++;
          if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) >0) {
            break;
          }
          dir++;
          if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) >0) {
            break;
          }
          dir++;
          if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) >0) {
            break;
          }
          dir++;
          if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) >0) {
            break;
          }
          dir++;
          if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) >0) {
            break;
          }
          dir++;
          if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) >0) {
            break;
          }
          dir++;
          if (i_buf.getPixel(c + xdir[dir], r + ydir[dir]) >0) {
            break;
          }
          //8方向全て調べたけどラベルが無いよ？
          return -1;
        }
      }else{
        //境界に接しているとき
        var i;
        for (i = 0; i < 8; i++){
          var x=c + xdir[dir];
          var y=r + ydir[dir];
          //境界チェック
          if(x>=0 && x<width && y>=0 && y<height){
            if (i_buf.getPixel(y, x) >0) {
              break;
            }
          }
          dir++;//倍長テーブルを参照するので問題なし
        }
        if (i == 8) {
          //8方向全て調べたけどラベルが無いよ？
          return -1;
        }
      }
      dir=dir% 8;//dirの正規化
      // xcoordとycoordをc,rにも保存
      c = c + xdir[dir];
      r = r + ydir[dir];
      o_coord_x[coord_num] = c;
      o_coord_y[coord_num] = r;
      // 終了条件判定
      if (c == i_entry_x && r == i_entry_y){
        coord_num++;
        break;
      }
      coord_num++;
      if (coord_num == i_array_size) {
        //輪郭が末端に達した
        return coord_num;
      }
    }
    return coord_num;
  }
})

FLARSquareContourDetector = ASKlass('FLARSquareContourDetector', NyARSquareContourDetector,
{
  AR_AREA_MAX : 100000// #define AR_AREA_MAX 100000
  ,AR_AREA_MIN : 70// #define AR_AREA_MIN 70
  ,_width : 0
  ,_height : 0
  ,_labeling : null
  ,_overlap_checker : new NyARLabelOverlapChecker(32)
  ,_cpickup : new FLContourPickup()
  ,_stack : null
  ,_coord2vertex : new NyARCoord2SquareVertexIndexes()
  ,_max_coord : 0
  ,_xcoord : null
  ,_ycoord : null
  /**
   * 最大i_squre_max個のマーカーを検出するクラスを作成する。
   *
   * @param i_param
   */
  ,FLARSquareContourDetector : function(i_size)
  {
    this._width = i_size.w;
    this._height = i_size.h;
    //ラベリングのサイズを指定したいときはsetAreaRangeを使ってね。
    this._labeling = new NyARLabeling_Rle(this._width,this._height);
    this._stack=new NyARRleLabelFragmentInfoStack(i_size.w*i_size.h*2048/(320*240)+32);//検出可能な最大ラベル数
    // 輪郭の最大長は画面に映りうる最大の長方形サイズ。
    var number_of_coord= (this._width + this._height) * 2;
    // 輪郭バッファ
    this._max_coord = number_of_coord;
    this._xcoord = new IntVector(number_of_coord);
    this._ycoord = new IntVector(number_of_coord);
    return;
  }
  /**
   * 白領域の検査対象サイズ
   *  最大サイズは 一辺約320px、最小サイズは 一辺約 8px まで解析対象としている
   *  解析画像中で上記範囲内であれば解析対象となるが、最小サイズは小さすぎて意味をなさない。
   *
   * @param i_max 解析対象とする白領域の最大pixel数(一辺の二乗)
   * @param i_min 解析対象とする白領域の最小pixel数(一辺の二乗)
   */
  ,setAreaRange : function(i_max, i_min)
  {
    this._labeling.setAreaRange(i_max, i_min);
  }
  ,__detectMarker_mkvertex : new IntVector(4)
  ,detectMarkerCB : function(i_raster ,i_callback)
  {
    var flagment=this._stack;
    var overlap = this._overlap_checker;
    // ラベル数が0ならここまで
    var label_num=this._labeling.labeling(i_raster, flagment);
    if (label_num < 1) {
      return;
    }
    //ラベルをソートしておく
    flagment.sortByArea();
    //ラベルリストを取得
    var labels=flagment.getArray();
    var xsize = this._width;
    var ysize = this._height;
    var xcoord = this._xcoord;
    var ycoord = this._ycoord;
    var coord_max = this._max_coord;
    var mkvertex =this.__detectMarker_mkvertex;
    //重なりチェッカの最大数を設定
    overlap.setMaxLabels(label_num);
    for (var i=0; i < label_num; i++) {
      var label_pt=labels[i];
      var label_area = label_pt.area;
      // クリップ領域が画面の枠に接していれば除外
      if (label_pt.clip_l == 0 || label_pt.clip_r == xsize-1){
        continue;
      }
      if (label_pt.clip_t == 0 || label_pt.clip_b == ysize-1){
        continue;
      }
      // 既に検出された矩形との重なりを確認
      if (!overlap.check(label_pt)) {
        // 重なっているようだ。
        continue;
      }
      if (window.DEBUG) {
        var cv = document.getElementById('debugCanvas').getContext('2d');
        cv.strokeStyle = 'red';
        cv.strokeRect(label_pt.clip_l, label_pt.clip_t, label_pt.clip_r-label_pt.clip_l, label_pt.clip_b-label_pt.clip_t);
        cv.fillStyle = 'red';
        cv.fillRect(label_pt.entry_x-1, label_pt.clip_t-1, 3,3);
        cv.fillStyle = 'cyan';
        cv.fillRect(label_pt.pos_x-1, label_pt.pos_y-1, 3,3);
      }
      //輪郭を取得
      var coord_num = this._cpickup.getContour_FLARBinRaster(i_raster,label_pt.entry_x,label_pt.clip_t, coord_max, xcoord, ycoord);
      if (coord_num == -1) return -1;
      if (coord_num == coord_max) {
        // 輪郭が大きすぎる。
        continue;
      }
      //輪郭線をチェックして、矩形かどうかを判定。矩形ならばmkvertexに取得
      var v = this._coord2vertex.getVertexIndexes(xcoord, ycoord,coord_num,label_area, mkvertex);
      if (!v) {
        // 頂点の取得が出来なかった
        continue;
      }
      //矩形を発見したことをコールバック関数で通知
      i_callback.onSquareDetect(this,xcoord,ycoord,coord_num,mkvertex);
      // 検出済の矩形の属したラベルを重なりチェックに追加する。
      overlap.push(label_pt);
    }
    return;
  }
})

/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */


/**
 * This class calculates ARMatrix from square information. -- 変換行列を計算するクラス。
 *
 */
INyARTransMat = Klass( {
  transMat : function(i_square,i_offset, o_result ){},
  transMatContinue : function(i_square,i_offset ,io_result_conv){}
})

/**
 * 矩形の頂点情報を格納します。
 */
NyARRectOffset = ASKlass('NyARRectOffset', {

  vertex : NyARDoublePoint3d.createArray(4),
  createArray : function(i_number)
  {
    var ret=new Array(i_number);
    for(var i=0;i<i_number;i++)
    {
      ret[i]=new NyARRectOffset();
    }
    return ret;
  },

  /**
  * 中心位置と辺長から、オフセット情報を作成して設定する。
  * @param i_width
  */
  setSquare : function(i_width)
  {
    var w_2 = i_width / 2.0;
    var vertex3d_ptr;
    vertex3d_ptr= this.vertex[0];
    vertex3d_ptr.x = -w_2;
    vertex3d_ptr.y =  w_2;
    vertex3d_ptr.z = 0.0;
    vertex3d_ptr= this.vertex[1];
    vertex3d_ptr.x = w_2;
    vertex3d_ptr.y = w_2;
    vertex3d_ptr.z = 0.0;
    vertex3d_ptr= this.vertex[2];
    vertex3d_ptr.x =  w_2;
    vertex3d_ptr.y = -w_2;
    vertex3d_ptr.z = 0.0;
    vertex3d_ptr= this.vertex[3];
    vertex3d_ptr.x = -w_2;
    vertex3d_ptr.y = -w_2;
    vertex3d_ptr.z = 0.0;
    return;
  }
})







/**
 * This class calculates ARMatrix from square information and holds it. --
 * 変換行列を計算して、結果を保持するクラス。
 *
 */
NyARTransMat = ASKlass('NyARTransMat',INyARTransMat,
{
  _projection_mat_ref : null,
  _rotmatrix : null,
  _transsolver : null,
  _mat_optimize : null,
  _ref_dist_factor : null,
  NyARTransMat : function(i_param)
  {
    var dist=i_param.getDistortionFactor();
    var pmat=i_param.getPerspectiveProjectionMatrix();
    this._transsolver=new NyARTransportVectorSolver(pmat,4);
    //互換性が重要な時は、NyARRotMatrix_ARToolKitを使うこと。
    //理屈はNyARRotMatrix_NyARToolKitもNyARRotMatrix_ARToolKitも同じだけど、少しだけ値がずれる。
    this._rotmatrix = new NyARRotMatrix(pmat);
    this._mat_optimize=new NyARPartialDifferentiationOptimize(pmat);
    this._ref_dist_factor=dist;
    this._projection_mat_ref=pmat;
    this.__transMat_vertex_2d = NyARDoublePoint2d.createArray(4);
    this.__transMat_vertex_3d = NyARDoublePoint3d.createArray(4);
    this.__transMat_trans = new NyARDoublePoint3d();
    this.__rot=new NyARDoubleMatrix33();
  },
  /**
   * 頂点情報を元に、エラー閾値を計算します。
   * @param i_vertex
   */
  makeErrThreshold : function(i_vertex)
  {
    var a,b,l1,l2;
    a=i_vertex[0].x-i_vertex[2].x;
    b=i_vertex[0].y-i_vertex[2].y;
    l1=a*a+b*b;
    a=i_vertex[1].x-i_vertex[3].x;
    b=i_vertex[1].y-i_vertex[3].y;
    l2=a*a+b*b;
    return (Math.sqrt(l1>l2?l1:l2))/200;
  },
  /**
   * double arGetTransMat( ARMarkerInfo *marker_info,double center[2], double width, double conv[3][4] )
   *
   * @param i_square
   * 計算対象のNyARSquareオブジェクト
   * @param i_direction
   * @param i_width
   * @return
   * @throws NyARException
   */
  transMat : function(i_square,i_offset,o_result_conv)
  {
    var trans=this.__transMat_trans;
    var err_threshold=this.makeErrThreshold(i_square.sqvertex);
    //平行移動量計算機に、2D座標系をセット
    var vertex_2d=this.__transMat_vertex_2d;
    var vertex_3d=this.__transMat_vertex_3d;
    this._ref_dist_factor.ideal2ObservBatch(i_square.sqvertex, vertex_2d,4);
    this._transsolver.set2dVertex(vertex_2d,4);
    //回転行列を計算
    this._rotmatrix.initRotBySquare(i_square.line,i_square.sqvertex);
    //回転後の3D座標系から、平行移動量を計算
    this._rotmatrix.getPoint3dBatch(i_offset.vertex,vertex_3d,4);
    this._transsolver.solveTransportVector(vertex_3d,trans);
    //計算結果の最適化(平行移動量と回転行列の最適化)
    o_result_conv.error=this.optimize(this._rotmatrix, trans, this._transsolver,i_offset.vertex, vertex_2d,err_threshold);
    // マトリクスの保存
    this.updateMatrixValue(this._rotmatrix, trans,o_result_conv);
    return;
  },
  /*
   * (non-Javadoc)
   * @see jp.nyatla.nyartoolkit.core.transmat.INyARTransMat#transMatContinue(jp.nyatla.nyartoolkit.core.NyARSquare, int, double, jp.nyatla.nyartoolkit.core.transmat.NyARTransMatResult)
   */
  transMatContinue : function(i_square,i_offset,o_result_conv)
  {
    var trans=this.__transMat_trans;
    // io_result_convが初期値なら、transMatで計算する。
    if (!o_result_conv.has_value) {
      this.transMat(i_square,i_offset, o_result_conv);
      return;
    }
    //最適化計算の閾値を決定
    var err_threshold=this.makeErrThreshold(i_square.sqvertex);
    //平行移動量計算機に、2D座標系をセット
    var vertex_2d=this.__transMat_vertex_2d;
    var vertex_3d=this.__transMat_vertex_3d;
    this._ref_dist_factor.ideal2ObservBatch(i_square.sqvertex, vertex_2d,4);
    this._transsolver.set2dVertex(vertex_2d,4);
    //回転行列を計算
    this._rotmatrix.initRotByPrevResult(o_result_conv);
    //回転後の3D座標系から、平行移動量を計算
    this._rotmatrix.getPoint3dBatch(i_offset.vertex,vertex_3d,4);
    this._transsolver.solveTransportVector(vertex_3d,trans);
    //現在のエラーレートを計算しておく
    var min_err=this.errRate(this._rotmatrix,trans,i_offset.vertex, vertex_2d,4,vertex_3d);
    var rot=this.__rot;
    //エラーレートが前回のエラー値より閾値分大きかったらアゲイン
    if(min_err<o_result_conv.error+err_threshold){
      rot.setValue_NyARDoubleMatrix33(this._rotmatrix);
      //最適化してみる。
      for (var i = 0;i<5; i++) {
        //変換行列の最適化
        this._mat_optimize.modifyMatrix(rot, trans, i_offset.vertex, vertex_2d, 4);
        var err=this.errRate(rot,trans,i_offset.vertex, vertex_2d,4,vertex_3d);
        //System.out.println("E:"+err);
        if(min_err-err<err_threshold/2){
          //System.out.println("BREAK");
          break;
        }
        this._transsolver.solveTransportVector(vertex_3d, trans);
        this._rotmatrix.setValue_NyARDoubleMatrix33(rot);
        min_err=err;
      }
      this.updateMatrixValue(this._rotmatrix,  trans,o_result_conv);
    }else{
      //回転行列を計算
      this._rotmatrix.initRotBySquare(i_square.line,i_square.sqvertex);
      //回転後の3D座標系から、平行移動量を計算
      this._rotmatrix.getPoint3dBatch(i_offset.vertex,vertex_3d,4);
      this._transsolver.solveTransportVector(vertex_3d,trans);
      //計算結果の最適化(平行移動量と回転行列の最適化)
      min_err=this.optimize(this._rotmatrix, trans, this._transsolver,i_offset.vertex, vertex_2d,err_threshold);
      this.updateMatrixValue(this._rotmatrix, trans,o_result_conv);
    }
    o_result_conv.error=min_err;
    return;
  },

  optimize : function(io_rotmat,io_transvec,i_solver,i_offset_3d,i_2d_vertex,i_err_threshold)
  {
    //System.out.println("START");
    var vertex_3d=this.__transMat_vertex_3d;
    //初期のエラー値を計算
    var min_err=this.errRate(io_rotmat, io_transvec, i_offset_3d, i_2d_vertex,4,vertex_3d);
    var rot=this.__rot;
    rot.setValue_NyARDoubleMatrix33(io_rotmat);
    for (var i = 0;i<5; i++) {
      //変換行列の最適化
      this._mat_optimize.modifyMatrix(rot, io_transvec, i_offset_3d, i_2d_vertex, 4);
      var err=this.errRate(rot,io_transvec, i_offset_3d, i_2d_vertex,4,vertex_3d);
      //System.out.println("E:"+err);
      if(min_err-err<i_err_threshold){
        //System.out.println("BREAK");
        break;
      }
      i_solver.solveTransportVector(vertex_3d, io_transvec);
      io_rotmat.setValue_NyARDoubleMatrix33(rot);
      min_err=err;
    }
    //System.out.println("END");
    return min_err;
  },
  //エラーレート計算機
  errRate : function(io_rot,i_trans,i_vertex3d,i_vertex2d,i_number_of_vertex,o_rot_vertex)
  {
    var cp = this._projection_mat_ref;
    var cp00=cp.m00;
    var cp01=cp.m01;
    var cp02=cp.m02;
    var cp11=cp.m11;
    var cp12=cp.m12;
    var err=0;
    for(var i=0;i<i_number_of_vertex;i++){
      var x3d,y3d,z3d;
      o_rot_vertex[i].x=x3d=io_rot.m00*i_vertex3d[i].x+io_rot.m01*i_vertex3d[i].y+io_rot.m02*i_vertex3d[i].z;
      o_rot_vertex[i].y=y3d=io_rot.m10*i_vertex3d[i].x+io_rot.m11*i_vertex3d[i].y+io_rot.m12*i_vertex3d[i].z;
      o_rot_vertex[i].z=z3d=io_rot.m20*i_vertex3d[i].x+io_rot.m21*i_vertex3d[i].y+io_rot.m22*i_vertex3d[i].z;
      x3d+=i_trans.x;
      y3d+=i_trans.y;
      z3d+=i_trans.z;
      //射影変換
      var x2d=x3d*cp00+y3d*cp01+z3d*cp02;
      var y2d=y3d*cp11+z3d*cp12;
      var h2d=z3d;
      //エラーレート計算
      var t1=i_vertex2d[i].x-x2d/h2d;
      var t2=i_vertex2d[i].y-y2d/h2d;
      err+=t1*t1+t2*t2;
    }
    return err/i_number_of_vertex;
  },
  /**
   * パラメータで変換行列を更新します。
   *
   * @param i_rot
   * @param i_off
   * @param i_trans
   */
  updateMatrixValue : function(i_rot,i_trans,o_result)
  {
    o_result.m00=i_rot.m00;
    o_result.m01=i_rot.m01;
    o_result.m02=i_rot.m02;
    o_result.m03=i_trans.x;
    o_result.m10 =i_rot.m10;
    o_result.m11 =i_rot.m11;
    o_result.m12 =i_rot.m12;
    o_result.m13 =i_trans.y;
    o_result.m20 = i_rot.m20;
    o_result.m21 = i_rot.m21;
    o_result.m22 = i_rot.m22;
    o_result.m23 = i_trans.z;
    o_result.has_value = true;
    return;
  }
})


NyARTransMatResult = ASKlass('NyARTransMatResult', NyARDoubleMatrix34,
{
  /**
   * エラーレート。この値はINyARTransMatの派生クラスが使います。
   */
  error : 0,
  has_value : false,
  /**
   * この関数は、0-PIの間で値を返します。
   * @param o_out
   */
  getZXYAngle : function(o_out)
  {
    var sina = this.m21;
    if (sina >= 1.0) {
      o_out.x = Math.PI / 2;
      o_out.y = 0;
      o_out.z = Math.atan2(-this.m10, this.m00);
    } else if (sina <= -1.0) {
      o_out.x = -Math.PI / 2;
      o_out.y = 0;
      o_out.z = Math.atan2(-this.m10, this.m00);
    } else {
      o_out.x = Math.asin(sina);
      o_out.z = Math.atan2(-this.m01, this.m11);
      o_out.y = Math.atan2(-this.m20, this.m22);
    }
  },
  transformVertex_Number : function(i_x,i_y,i_z,o_out)
  {
    o_out.x=this.m00*i_x+this.m01*i_y+this.m02*i_z+this.m03;
    o_out.y=this.m10*i_x+this.m11*i_y+this.m12*i_z+this.m13;
    o_out.z=this.m20*i_x+this.m21*i_y+this.m22*i_z+this.m23;
    return;
  },
  transformVertex_NyARDoublePoint3d : function(i_in,o_out)
  {
    this.transformVertex_Number(i_in.x,i_in.y,i_in.z,o_out);
  }
})





/**
 * 基本姿勢と実画像を一致するように、角度を微調整→平行移動量を再計算 を繰り返して、変換行列を最適化する。
 *
 */
NyARPartialDifferentiationOptimize = ASKlass('NyARPartialDifferentiationOptimize',
{
  _projection_mat_ref : null,
  NyARPartialDifferentiationOptimize : function(i_projection_mat_ref)
  {
    this._projection_mat_ref = i_projection_mat_ref;
    this.__angles_in=TSinCosValue.createArray(3);
    this.__ang=new NyARDoublePoint3d();
    this.__sin_table = new FloatVector(4);
    return;
  },
  sincos2Rotation_ZXY : function(i_sincos,i_rot_matrix)
  {
    var sina = i_sincos[0].sin_val;
    var cosa = i_sincos[0].cos_val;
    var sinb = i_sincos[1].sin_val;
    var cosb = i_sincos[1].cos_val;
    var sinc = i_sincos[2].sin_val;
    var cosc = i_sincos[2].cos_val;
    i_rot_matrix.m00 = cosc * cosb - sinc * sina * sinb;
    i_rot_matrix.m01 = -sinc * cosa;
    i_rot_matrix.m02 = cosc * sinb + sinc * sina * cosb;
    i_rot_matrix.m10 = sinc * cosb + cosc * sina * sinb;
    i_rot_matrix.m11 = cosc * cosa;
    i_rot_matrix.m12 = sinc * sinb - cosc * sina * cosb;
    i_rot_matrix.m20 = -cosa * sinb;
    i_rot_matrix.m21 = sina;
    i_rot_matrix.m22 = cosb * cosa;
  },
  rotation2Sincos_ZXY : function(i_rot_matrix,o_out,o_ang)
  {
    var x, y, z;
    var sina = i_rot_matrix.m21;
    if (sina >= 1.0) {
      x = Math.PI / 2;
      y = 0;
      z = Math.atan2(-i_rot_matrix.m10, i_rot_matrix.m00);
    } else if (sina <= -1.0) {
      x = -Math.PI / 2;
      y = 0;
      z = Math.atan2(-i_rot_matrix.m10, i_rot_matrix.m00);
    } else {
      x = Math.asin(sina);
      y = Math.atan2(-i_rot_matrix.m20, i_rot_matrix.m22);
      z = Math.atan2(-i_rot_matrix.m01, i_rot_matrix.m11);
    }
    o_ang.x=x;
    o_ang.y=y;
    o_ang.z=z;
    o_out[0].sin_val = Math.sin(x);
    o_out[0].cos_val = Math.cos(x);
    o_out[1].sin_val = Math.sin(y);
    o_out[1].cos_val = Math.cos(y);
    o_out[2].sin_val = Math.sin(z);
    o_out[2].cos_val = Math.cos(z);
    return;
  },
  /*
   * 射影変換式 基本式 ox=(cosc * cosb - sinc * sina * sinb)*ix+(-sinc * cosa)*iy+(cosc * sinb + sinc * sina * cosb)*iz+i_trans.x; oy=(sinc * cosb + cosc * sina *
   * sinb)*ix+(cosc * cosa)*iy+(sinc * sinb - cosc * sina * cosb)*iz+i_trans.y; oz=(-cosa * sinb)*ix+(sina)*iy+(cosb * cosa)*iz+i_trans.z;
   *
   * double ox=(cosc * cosb)*ix+(-sinc * sina * sinb)*ix+(-sinc * cosa)*iy+(cosc * sinb)*iz + (sinc * sina * cosb)*iz+i_trans.x; double oy=(sinc * cosb)*ix
   * +(cosc * sina * sinb)*ix+(cosc * cosa)*iy+(sinc * sinb)*iz+(- cosc * sina * cosb)*iz+i_trans.y; double oz=(-cosa * sinb)*ix+(sina)*iy+(cosb *
   * cosa)*iz+i_trans.z;
   *
   * sina,cosaについて解く cx=(cp00*(-sinc*sinb*ix+sinc*cosb*iz)+cp01*(cosc*sinb*ix-cosc*cosb*iz)+cp02*(iy))*sina
   * +(cp00*(-sinc*iy)+cp01*((cosc*iy))+cp02*(-sinb*ix+cosb*iz))*cosa
   * +(cp00*(i_trans.x+cosc*cosb*ix+cosc*sinb*iz)+cp01*((i_trans.y+sinc*cosb*ix+sinc*sinb*iz))+cp02*(i_trans.z));
   * cy=(cp11*(cosc*sinb*ix-cosc*cosb*iz)+cp12*(iy))*sina +(cp11*((cosc*iy))+cp12*(-sinb*ix+cosb*iz))*cosa
   * +(cp11*((i_trans.y+sinc*cosb*ix+sinc*sinb*iz))+cp12*(i_trans.z)); ch=(iy)*sina +(-sinb*ix+cosb*iz)*cosa +i_trans.z; sinb,cosb hx=(cp00*(-sinc *
   * sina*ix+cosc*iz)+cp01*(cosc * sina*ix+sinc*iz)+cp02*(-cosa*ix))*sinb +(cp01*(sinc*ix-cosc * sina*iz)+cp00*(cosc*ix+sinc * sina*iz)+cp02*(cosa*iz))*cosb
   * +(cp00*(i_trans.x+(-sinc*cosa)*iy)+cp01*(i_trans.y+(cosc * cosa)*iy)+cp02*(i_trans.z+(sina)*iy)); double hy=(cp11*(cosc *
   * sina*ix+sinc*iz)+cp12*(-cosa*ix))*sinb +(cp11*(sinc*ix-cosc * sina*iz)+cp12*(cosa*iz))*cosb +(cp11*(i_trans.y+(cosc *
   * cosa)*iy)+cp12*(i_trans.z+(sina)*iy)); double h =((-cosa*ix)*sinb +(cosa*iz)*cosb +i_trans.z+(sina)*iy); パラメータ返還式 L=2*Σ(d[n]*e[n]+a[n]*b[n])
   * J=2*Σ(d[n]*f[n]+a[n]*c[n])/L K=2*Σ(-e[n]*f[n]+b[n]*c[n])/L M=Σ(-e[n]^2+d[n]^2-b[n]^2+a[n]^2)/L 偏微分式 +J*cos(x) +K*sin(x) -sin(x)^2 +cos(x)^2
   * +2*M*cos(x)*sin(x)
   */
  optimizeParamX : function(i_angle_y,i_angle_z,i_trans,i_vertex3d, i_vertex2d,i_number_of_vertex,i_hint_angle)
  {
    var cp = this._projection_mat_ref;
    var sinb = i_angle_y.sin_val;
    var cosb = i_angle_y.cos_val;
    var sinc = i_angle_z.sin_val;
    var cosc = i_angle_z.cos_val;
    var L, J, K, M, N, O;
    L = J = K = M = N = O = 0;
    for (var i = 0; i < i_number_of_vertex; i++) {
      var ix, iy, iz;
      ix = i_vertex3d[i].x;
      iy = i_vertex3d[i].y;
      iz = i_vertex3d[i].z;
      var cp00 = cp.m00;
      var cp01 = cp.m01;
      var cp02 = cp.m02;
      var cp11 = cp.m11;
      var cp12 = cp.m12;
      var X0 = (cp00 * (-sinc * sinb * ix + sinc * cosb * iz) + cp01 * (cosc * sinb * ix - cosc * cosb * iz) + cp02 * (iy));
      var X1 = (cp00 * (-sinc * iy) + cp01 * ((cosc * iy)) + cp02 * (-sinb * ix + cosb * iz));
      var X2 = (cp00 * (i_trans.x + cosc * cosb * ix + cosc * sinb * iz) + cp01 * ((i_trans.y + sinc * cosb * ix + sinc * sinb * iz)) + cp02 * (i_trans.z));
      var Y0 = (cp11 * (cosc * sinb * ix - cosc * cosb * iz) + cp12 * (iy));
      var Y1 = (cp11 * ((cosc * iy)) + cp12 * (-sinb * ix + cosb * iz));
      var Y2 = (cp11 * ((i_trans.y + sinc * cosb * ix + sinc * sinb * iz)) + cp12 * (i_trans.z));
      var H0 = (iy);
      var H1 = (-sinb * ix + cosb * iz);
      var H2 = i_trans.z;
      var VX = i_vertex2d[i].x;
      var VY = i_vertex2d[i].y;
      var a, b, c, d, e, f;
      a = (VX * H0 - X0);
      b = (VX * H1 - X1);
      c = (VX * H2 - X2);
      d = (VY * H0 - Y0);
      e = (VY * H1 - Y1);
      f = (VY * H2 - Y2);
      L += d * e + a * b;
      N += d * d + a * a;
      J += d * f + a * c;
      M += e * e + b * b;
      K += e * f + b * c;
      O += f * f + c * c;
    }
    L *=2;
    J *=2;
    K *=2;
    return this.getMinimumErrorAngleFromParam(L,J, K, M, N, O, i_hint_angle);
  },
  optimizeParamY : function(i_angle_x,i_angle_z,i_trans,i_vertex3d,i_vertex2d,i_number_of_vertex,i_hint_angle)
  {
    var cp = this._projection_mat_ref;
    var sina = i_angle_x.sin_val;
    var cosa = i_angle_x.cos_val;
    var sinc = i_angle_z.sin_val;
    var cosc = i_angle_z.cos_val;
    var L, J, K, M, N, O;
    L = J = K = M = N = O = 0;
    for (var i = 0; i < i_number_of_vertex; i++) {
      var ix, iy, iz;
      ix = i_vertex3d[i].x;
      iy = i_vertex3d[i].y;
      iz = i_vertex3d[i].z;
      var cp00 = cp.m00;
      var cp01 = cp.m01;
      var cp02 = cp.m02;
      var cp11 = cp.m11;
      var cp12 = cp.m12;
      var X0 = (cp00 * (-sinc * sina * ix + cosc * iz) + cp01 * (cosc * sina * ix + sinc * iz) + cp02 * (-cosa * ix));
      var X1 = (cp01 * (sinc * ix - cosc * sina * iz) + cp00 * (cosc * ix + sinc * sina * iz) + cp02 * (cosa * iz));
      var X2 = (cp00 * (i_trans.x + (-sinc * cosa) * iy) + cp01 * (i_trans.y + (cosc * cosa) * iy) + cp02 * (i_trans.z + (sina) * iy));
      var Y0 = (cp11 * (cosc * sina * ix + sinc * iz) + cp12 * (-cosa * ix));
      var Y1 = (cp11 * (sinc * ix - cosc * sina * iz) + cp12 * (cosa * iz));
      var Y2 = (cp11 * (i_trans.y + (cosc * cosa) * iy) + cp12 * (i_trans.z + (sina) * iy));
      var H0 = (-cosa * ix);
      var H1 = (cosa * iz);
      var H2 = i_trans.z + (sina) * iy;
      var VX = i_vertex2d[i].x;
      var VY = i_vertex2d[i].y;
      var a, b, c, d, e, f;
      a = (VX * H0 - X0);
      b = (VX * H1 - X1);
      c = (VX * H2 - X2);
      d = (VY * H0 - Y0);
      e = (VY * H1 - Y1);
      f = (VY * H2 - Y2);
      L += d * e + a * b;
      N += d * d + a * a;
      J += d * f + a * c;
      M += e * e + b * b;
      K += e * f + b * c;
      O += f * f + c * c;
    }
    L *= 2;
    J *= 2;
    K *= 2;
    return this.getMinimumErrorAngleFromParam(L,J, K, M, N, O, i_hint_angle);
  },
  optimizeParamZ : function(i_angle_x,i_angle_y,i_trans,i_vertex3d,i_vertex2d,i_number_of_vertex,i_hint_angle)
  {
    var cp = this._projection_mat_ref;
    var sina = i_angle_x.sin_val;
    var cosa = i_angle_x.cos_val;
    var sinb = i_angle_y.sin_val;
    var cosb = i_angle_y.cos_val;
    var L, J, K, M, N, O;
    L = J = K = M = N = O = 0;
    for (var i = 0; i < i_number_of_vertex; i++) {
      var ix, iy, iz;
      ix = i_vertex3d[i].x;
      iy = i_vertex3d[i].y;
      iz = i_vertex3d[i].z;
      var cp00 = cp.m00;
      var cp01 = cp.m01;
      var cp02 = cp.m02;
      var cp11 = cp.m11;
      var cp12 = cp.m12;
      var X0 = (cp00 * (-sina * sinb * ix - cosa * iy + sina * cosb * iz) + cp01 * (ix * cosb + sinb * iz));
      var X1 = (cp01 * (sina * ix * sinb + cosa * iy - sina * iz * cosb) + cp00 * (cosb * ix + sinb * iz));
      var X2 = cp00 * i_trans.x + cp01 * (i_trans.y) + cp02 * (-cosa * sinb) * ix + cp02 * (sina) * iy + cp02 * ((cosb * cosa) * iz + i_trans.z);
      var Y0 = cp11 * (ix * cosb + sinb * iz);
      var Y1 = cp11 * (sina * ix * sinb + cosa * iy - sina * iz * cosb);
      var Y2 = (cp11 * i_trans.y + cp12 * (-cosa * sinb) * ix + cp12 * ((sina) * iy + (cosb * cosa) * iz + i_trans.z));
      var H0 = 0;
      var H1 = 0;
      var H2 = ((-cosa * sinb) * ix + (sina) * iy + (cosb * cosa) * iz + i_trans.z);
      var VX = i_vertex2d[i].x;
      var VY = i_vertex2d[i].y;
      var a, b, c, d, e, f;
      a = (VX * H0 - X0);
      b = (VX * H1 - X1);
      c = (VX * H2 - X2);
      d = (VY * H0 - Y0);
      e = (VY * H1 - Y1);
      f = (VY * H2 - Y2);
      L += d * e + a * b;
      N += d * d + a * a;
      J += d * f + a * c;
      M += e * e + b * b;
      K += e * f + b * c;
      O += f * f + c * c;
    }
    L *=2;
    J *=2;
    K *=2;
    return this.getMinimumErrorAngleFromParam(L,J, K, M, N, O, i_hint_angle);
  },
  modifyMatrix : function(io_rot,i_trans,i_vertex3d,i_vertex2d,i_number_of_vertex)
  {
    var angles_in = this.__angles_in;// x,y,z
    var ang = this.__ang;
    // ZXY系のsin/cos値を抽出
    this.rotation2Sincos_ZXY(io_rot, angles_in,ang);
    ang.x += this.optimizeParamX(angles_in[1], angles_in[2], i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, ang.x);
    ang.y += this.optimizeParamY(angles_in[0], angles_in[2], i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, ang.y);
    ang.z += this.optimizeParamZ(angles_in[0], angles_in[1], i_trans, i_vertex3d, i_vertex2d, i_number_of_vertex, ang.z);
    io_rot.setZXYAngle_Number(ang.x, ang.y, ang.z);
    return;
  },
  /**
   * エラーレートが最小になる点を得る。
   */
  getMinimumErrorAngleFromParam : function(iL,iJ,iK,iM,iN,iO,i_hint_angle)
  {
    var sin_table = this.__sin_table;
    var M = (iN - iM)/iL;
    var J = iJ/iL;
    var K = -iK/iL;
    // パラメータからsinテーブルを作成
    // (- 4*M^2-4)*x^4 + (4*K- 4*J*M)*x^3 + (4*M^2 -(K^2- 4)- J^2)*x^2 +(4*J*M- 2*K)*x + J^2-1 = 0
    var number_of_sin = NyAREquationSolver.solve4Equation(-4 * M * M - 4, 4 * K - 4 * J * M, 4 * M * M - (K * K - 4) - J * J, 4 * J * M - 2 * K, J * J - 1, sin_table);
    // 最小値２個を得ておく。
    var min_ang_0 = Number.MAX_VALUE;
    var min_ang_1 = Number.MAX_VALUE;
    var min_err_0 = Number.MAX_VALUE;
    var min_err_1 = Number.MAX_VALUE;
    for (var i = 0; i < number_of_sin; i++) {
      // +-cos_v[i]が頂点候補
      var sin_rt = sin_table[i];
      var cos_rt = Math.sqrt(1 - (sin_rt * sin_rt));
      // cosを修復。微分式で0に近い方が正解
      // 0 = 2*cos(x)*sin(x)*M - sin(x)^2 + cos(x)^2 + sin(x)*K + cos(x)*J
      var a1 = 2 * cos_rt * sin_rt * M + sin_rt * (K - sin_rt) + cos_rt * (cos_rt + J);
      var a2 = 2 * (-cos_rt) * sin_rt * M + sin_rt * (K - sin_rt) + (-cos_rt) * ((-cos_rt) + J);
      // 絶対値になおして、真のcos値を得ておく。
      a1 = a1 < 0 ? -a1 : a1;
      a2 = a2 < 0 ? -a2 : a2;
      cos_rt = (a1 < a2) ? cos_rt : -cos_rt;
      var ang = Math.atan2(sin_rt, cos_rt);
      // エラー値を計算
      var err = iN * sin_rt * sin_rt + (iL*cos_rt + iJ) * sin_rt + iM * cos_rt * cos_rt + iK * cos_rt + iO;
      // 最小の２個を獲得する。
      if (min_err_0 > err) {
        min_err_1 = min_err_0;
        min_ang_1 = min_ang_0;
        min_err_0 = err;
        min_ang_0 = ang;
      } else if (min_err_1 > err) {
        min_err_1 = err;
        min_ang_1 = ang;
      }
    }
    // [0]をテスト
    var gap_0;
    gap_0 = min_ang_0 - i_hint_angle;
    if (gap_0 > Math.PI) {
      gap_0 = (min_ang_0 - Math.PI * 2) - i_hint_angle;
    } else if (gap_0 < -Math.PI) {
      gap_0 = (min_ang_0 + Math.PI * 2) - i_hint_angle;
    }
    // [1]をテスト
    var gap_1;
    gap_1 = min_ang_1 - i_hint_angle;
    if (gap_1 > Math.PI) {
      gap_1 = (min_ang_1 - Math.PI * 2) - i_hint_angle;
    } else if (gap_1 < -Math.PI) {
      gap_1 = (min_ang_1 + Math.PI * 2) - i_hint_angle;
    }
    return Math.abs(gap_1) < Math.abs(gap_0) ? gap_1 : gap_0;
  }
})

TSinCosValue = ASKlass('TSinCosValue',{
  cos_val : 0,
  sin_val : 0,
  createArray : function(i_size)
  {
    var result=new Array(i_size);
    for(var i=0;i<i_size;i++){
      result[i]=new TSinCosValue();
    }
    return result;
  }
})




/**
 * 回転行列計算用の、3x3行列
 *
 */
NyARRotMatrix = ASKlass('NyARRotMatrix',NyARDoubleMatrix33,
{
  /**
   * インスタンスを準備します。
   *
   * @param i_param
   */
  NyARRotMatrix : function(i_matrix)
  {
    this.__initRot_vec1=new NyARRotVector(i_matrix);
    this.__initRot_vec2=new NyARRotVector(i_matrix);
    return;
  },
  __initRot_vec1 : null,
  __initRot_vec2 : null,
  /**
   * NyARTransMatResultの内容からNyARRotMatrixを復元します。
   * @param i_prev_result
   */
  initRotByPrevResult : function(i_prev_result)
  {
    this.m00=i_prev_result.m00;
    this.m01=i_prev_result.m01;
    this.m02=i_prev_result.m02;
    this.m10=i_prev_result.m10;
    this.m11=i_prev_result.m11;
    this.m12=i_prev_result.m12;
    this.m20=i_prev_result.m20;
    this.m21=i_prev_result.m21;
    this.m22=i_prev_result.m22;
    return;
  },
  /**
   *
   * @param i_linear
   * @param i_sqvertex
   * @throws NyARException
   */
  initRotBySquare : function(i_linear, i_sqvertex)
  {
    var vec1=this.__initRot_vec1;
    var vec2=this.__initRot_vec2;
    //向かい合った辺から、２本のベクトルを計算
    //軸１
    vec1.exteriorProductFromLinear(i_linear[0], i_linear[2]);
    vec1.checkVectorByVertex(i_sqvertex[0], i_sqvertex[1]);
    //軸２
    vec2.exteriorProductFromLinear(i_linear[1], i_linear[3]);
    vec2.checkVectorByVertex(i_sqvertex[3], i_sqvertex[0]);
    //回転の最適化？
    NyARRotVector.checkRotation(vec1,vec2);
    this.m00 =vec1.v1;
    this.m10 =vec1.v2;
    this.m20 =vec1.v3;
    this.m01 =vec2.v1;
    this.m11 =vec2.v2;
    this.m21 =vec2.v3;
    //最後の軸を計算
    var w02 = vec1.v2 * vec2.v3 - vec1.v3 * vec2.v2;
    var w12 = vec1.v3 * vec2.v1 - vec1.v1 * vec2.v3;
    var w22 = vec1.v1 * vec2.v2 - vec1.v2 * vec2.v1;
    var w = Math.sqrt(w02 * w02 + w12 * w12 + w22 * w22);
    this.m02 = w02/w;
    this.m12 = w12/w;
    this.m22 = w22/w;
    return;
  },
  /**
   * i_in_pointを変換行列で座標変換する。
   * @param i_in_point
   * @param i_out_point
   */
  getPoint3d : function(i_in_point,i_out_point)
  {
    var x=i_in_point.x;
    var y=i_in_point.y;
    var z=i_in_point.z;
    i_out_point.x=this.m00 * x + this.m01 * y + this.m02 * z;
    i_out_point.y=this.m10 * x + this.m11 * y + this.m12 * z;
    i_out_point.z=this.m20 * x + this.m21 * y + this.m22 * z;
    return;
  },
  /**
   * 複数の頂点を一括して変換する
   * @param i_in_point
   * @param i_out_point
   * @param i_number_of_vertex
   */
  getPoint3dBatch : function(i_in_point,i_out_point,i_number_of_vertex)
  {
    for(var i=i_number_of_vertex-1;i>=0;i--){
      var out_ptr =i_out_point[i];
      var in_ptr=i_in_point[i];
      var x=in_ptr.x;
      var y=in_ptr.y;
      var z=in_ptr.z;
      out_ptr.x=this.m00 * x + this.m01 * y + this.m02 * z;
      out_ptr.y=this.m10 * x + this.m11 * y + this.m12 * z;
      out_ptr.z=this.m20 * x + this.m21 * y + this.m22 * z;
    }
    return;
  }
})




NyARRotVector = ASKlass('NyARRotVector',
{
  //publicメンバ達
  v1 : 0,
  v2 : 0,
  v3 : 0,
  //privateメンバ達
  _projection_mat_ref : null,
  _inv_cpara_array_ref : null,
  NyARRotVector : function(i_cmat)
  {
    var mat_a = new NyARMat(3, 3);
    var a_array = mat_a.getArray();
    a_array[0][0] =i_cmat.m00;
    a_array[0][1] =i_cmat.m01;
    a_array[0][2] =i_cmat.m02;
    a_array[1][0] =i_cmat.m10;
    a_array[1][1] =i_cmat.m11;
    a_array[1][2] =i_cmat.m12;
    a_array[2][0] =i_cmat.m20;
    a_array[2][1] =i_cmat.m21;
    a_array[2][2] =i_cmat.m22;
    mat_a.matrixSelfInv();
    this._projection_mat_ref = i_cmat;
    this._inv_cpara_array_ref = mat_a.getArray();
    //GCない言語のときは、ここで配列の所有権委譲してね！
  },
  /**
   * ２直線に直交するベクトルを計算する・・・だと思う。
   * @param i_linear1
   * @param i_linear2
   */
  exteriorProductFromLinear : function(i_linear1,i_linear2)
  {
    //1行目
    var cmat= this._projection_mat_ref;
    var w1 = i_linear1.dy * i_linear2.dx - i_linear2.dy * i_linear1.dx;
    var w2 = i_linear1.dx * i_linear2.c - i_linear2.dx * i_linear1.c;
    var w3 = i_linear1.c * i_linear2.dy - i_linear2.c * i_linear1.dy;
    var m0 = w1 * (cmat.m01 * cmat.m12 - cmat.m02 * cmat.m11) + w2 * cmat.m11 - w3 * cmat.m01;//w1 * (cpara[0 * 4 + 1] * cpara[1 * 4 + 2] - cpara[0 * 4 + 2] * cpara[1 * 4 + 1]) + w2 * cpara[1 * 4 + 1] - w3 * cpara[0 * 4 + 1];
    var m1 = -w1 * cmat.m00 * cmat.m12 + w3 * cmat.m00;//-w1 * cpara[0 * 4 + 0] * cpara[1 * 4 + 2] + w3 * cpara[0 * 4 + 0];
    var m2 = w1 * cmat.m00 * cmat.m11;//w1 * cpara[0 * 4 + 0] * cpara[1 * 4 + 1];
    var w = Math.sqrt(m0 * m0 + m1 * m1 + m2 * m2);
    this.v1 = m0 / w;
    this.v2 = m1 / w;
    this.v3 = m2 / w;
    return;
  },
  /**
   * static int check_dir( double dir[3], double st[2], double ed[2],double cpara[3][4] ) Optimize[526->468]
   * ベクトルの開始/終了座標を指定して、ベクトルの方向を調整する。
   * @param i_start_vertex
   * @param i_end_vertex
   * @param cpara
   */
  checkVectorByVertex : function(i_start_vertex, i_end_vertex)
  {
    var h;
    var inv_cpara = this._inv_cpara_array_ref;
    //final double[] world = __checkVectorByVertex_world;// [2][3];
    var world0 = inv_cpara[0][0] * i_start_vertex.x * 10.0 + inv_cpara[0][1] * i_start_vertex.y * 10.0 + inv_cpara[0][2] * 10.0;// mat_a->m[0]*st[0]*10.0+
    var world1 = inv_cpara[1][0] * i_start_vertex.x * 10.0 + inv_cpara[1][1] * i_start_vertex.y * 10.0 + inv_cpara[1][2] * 10.0;// mat_a->m[3]*st[0]*10.0+
    var world2 = inv_cpara[2][0] * i_start_vertex.x * 10.0 + inv_cpara[2][1] * i_start_vertex.y * 10.0 + inv_cpara[2][2] * 10.0;// mat_a->m[6]*st[0]*10.0+
    var world3 = world0 + this.v1;
    var world4 = world1 + this.v2;
    var world5 = world2 + this.v3;
    // </Optimize>
    //final double[] camera = __checkVectorByVertex_camera;// [2][2];
    var cmat= this._projection_mat_ref;
    //h = cpara[2 * 4 + 0] * world0 + cpara[2 * 4 + 1] * world1 + cpara[2 * 4 + 2] * world2;
    h = cmat.m20 * world0 + cmat.m21 * world1 + cmat.m22 * world2;
    if (h == 0.0) {
      throw new NyARException();
    }
    //final double camera0 = (cpara[0 * 4 + 0] * world0 + cpara[0 * 4 + 1] * world1 + cpara[0 * 4 + 2] * world2) / h;
    //final double camera1 = (cpara[1 * 4 + 0] * world0 + cpara[1 * 4 + 1] * world1 + cpara[1 * 4 + 2] * world2) / h;
    var camera0 = (cmat.m00 * world0 + cmat.m01 * world1 + cmat.m02 * world2) / h;
    var camera1 = (cmat.m10 * world0 + cmat.m11 * world1 + cmat.m12 * world2) / h;
    //h = cpara[2 * 4 + 0] * world3 + cpara[2 * 4 + 1] * world4 + cpara[2 * 4 + 2] * world5;
    h = cmat.m20 * world3 + cmat.m21 * world4 + cmat.m22 * world5;
    if (h == 0.0) {
      throw new NyARException();
    }
    //final double camera2 = (cpara[0 * 4 + 0] * world3 + cpara[0 * 4 + 1] * world4 + cpara[0 * 4 + 2] * world5) / h;
    //final double camera3 = (cpara[1 * 4 + 0] * world3 + cpara[1 * 4 + 1] * world4 + cpara[1 * 4 + 2] * world5) / h;
    var camera2 = (cmat.m00 * world3 + cmat.m01 * world4 + cmat.m02 * world5) / h;
    var camera3 = (cmat.m10 * world3 + cmat.m11 * world4 + cmat.m12 * world5) / h;
    var v = (i_end_vertex.x - i_start_vertex.x) * (camera2 - camera0) + (i_end_vertex.y - i_start_vertex.y) * (camera3 - camera1);
    if (v < 0) {
      this.v1 = -this.v1;
      this.v2 = -this.v2;
      this.v3 = -this.v3;
    }
  },
  /**
   * int check_rotation( double rot[2][3] )
   * 2つのベクトル引数の調整をする？
   * @param i_r
   * @throws NyARException
   */
  checkRotation : function(io_vec1,io_vec2)
  {
    var w;
    var f;
    var vec10 = io_vec1.v1;
    var vec11 = io_vec1.v2;
    var vec12 = io_vec1.v3;
    var vec20 = io_vec2.v1;
    var vec21 = io_vec2.v2;
    var vec22 = io_vec2.v3;
    var vec30 = vec11 * vec22 - vec12 * vec21;
    var vec31 = vec12 * vec20 - vec10 * vec22;
    var vec32 = vec10 * vec21 - vec11 * vec20;
    w = Math.sqrt(vec30 * vec30 + vec31 * vec31 + vec32 * vec32);
    if (w == 0.0) {
      throw new NyARException();
    }
    vec30 /= w;
    vec31 /= w;
    vec32 /= w;
    var cb = vec10 * vec20 + vec11 * vec21 + vec12 * vec22;
    if (cb < 0){
      cb=-cb;//cb *= -1.0;
    }
    var ca = (Math.sqrt(cb + 1.0) + Math.sqrt(1.0 - cb)) * 0.5;
    if (vec31 * vec10 - vec11 * vec30 != 0.0) {
      f = 0;
    } else {
      if (vec32 * vec10 - vec12 * vec30 != 0.0) {
        w = vec11;vec11 = vec12;vec12 = w;
        w = vec31;vec31 = vec32;vec32 = w;
        f = 1;
      } else {
        w = vec10;vec10 = vec12;vec12 = w;
        w = vec30;vec30 = vec32;vec32 = w;
        f = 2;
      }
    }
    if (vec31 * vec10 - vec11 * vec30 == 0.0) {
      throw new NyARException();
    }
    var k1,k2,k3,k4;
    var a, b, c, d;
    var p1, q1, r1;
    var p2, q2, r2;
    var p3, q3, r3;
    var p4, q4, r4;
    k1 = (vec11 * vec32 - vec31 * vec12) / (vec31 * vec10 - vec11 * vec30);
    k2 = (vec31 * ca) / (vec31 * vec10 - vec11 * vec30);
    k3 = (vec10 * vec32 - vec30 * vec12) / (vec30 * vec11 - vec10 * vec31);
    k4 = (vec30 * ca) / (vec30 * vec11 - vec10 * vec31);
    a = k1 * k1 + k3 * k3 + 1;
    b = k1 * k2 + k3 * k4;
    c = k2 * k2 + k4 * k4 - 1;
    d = b * b - a * c;
    if (d < 0) {
      throw new NyARException();
    }
    r1 = (-b + Math.sqrt(d)) / a;
    p1 = k1 * r1 + k2;
    q1 = k3 * r1 + k4;
    r2 = (-b - Math.sqrt(d)) / a;
    p2 = k1 * r2 + k2;
    q2 = k3 * r2 + k4;
    if (f == 1) {
      w = q1;q1 = r1;r1 = w;
      w = q2;q2 = r2;r2 = w;
      w = vec11;vec11 = vec12;vec12 = w;
      w = vec31;vec31 = vec32;vec32 = w;
      f = 0;
    }
    if (f == 2) {
      w = p1;p1 = r1;r1 = w;
      w = p2;p2 = r2;r2 = w;
      w = vec10;vec10 = vec12;vec12 = w;
      w = vec30;vec30 = vec32;vec32 = w;
      f = 0;
    }
    if (vec31 * vec20 - vec21 * vec30 != 0.0) {
      f = 0;
    } else {
      if (vec32 * vec20 - vec22 * vec30 != 0.0) {
        w = vec21;vec21 = vec22;vec22 = w;
        w = vec31;vec31 = vec32;vec32 = w;
        f = 1;
      } else {
        w = vec20;vec20 = vec22;vec22 = w;
        w = vec30;vec30 = vec32;vec32 = w;
        f = 2;
      }
    }
    if (vec31 * vec20 - vec21 * vec30 == 0.0) {
      throw new NyARException();
    }
    k1 = (vec21 * vec32 - vec31 * vec22) / (vec31 * vec20 - vec21 * vec30);
    k2 = (vec31 * ca) / (vec31 * vec20 - vec21 * vec30);
    k3 = (vec20 * vec32 - vec30 * vec22) / (vec30 * vec21 - vec20 * vec31);
    k4 = (vec30 * ca) / (vec30 * vec21 - vec20 * vec31);
    a = k1 * k1 + k3 * k3 + 1;
    b = k1 * k2 + k3 * k4;
    c = k2 * k2 + k4 * k4 - 1;
    d = b * b - a * c;
    if (d < 0) {
      throw new NyARException();
    }
    r3 = (-b + Math.sqrt(d)) / a;
    p3 = k1 * r3 + k2;
    q3 = k3 * r3 + k4;
    r4 = (-b - Math.sqrt(d)) / a;
    p4 = k1 * r4 + k2;
    q4 = k3 * r4 + k4;
    if (f == 1) {
      w = q3;q3 = r3;r3 = w;
      w = q4;q4 = r4;r4 = w;
      w = vec21;vec21 = vec22;vec22 = w;
      w = vec31;vec31 = vec32;vec32 = w;
      f = 0;
    }
    if (f == 2) {
      w = p3;p3 = r3;r3 = w;
      w = p4;p4 = r4;r4 = w;
      w = vec20;vec20 = vec22;vec22 = w;
      w = vec30;vec30 = vec32;vec32 = w;
      f = 0;
    }
    var e1 = p1 * p3 + q1 * q3 + r1 * r3;
    if (e1 < 0) {
      e1 = -e1;
    }
    var e2 = p1 * p4 + q1 * q4 + r1 * r4;
    if (e2 < 0) {
      e2 = -e2;
    }
    var e3 = p2 * p3 + q2 * q3 + r2 * r3;
    if (e3 < 0) {
      e3 = -e3;
    }
    var e4 = p2 * p4 + q2 * q4 + r2 * r4;
    if (e4 < 0) {
      e4 = -e4;
    }
    if (e1 < e2) {
      if (e1 < e3) {
        if (e1 < e4) {
          io_vec1.v1 = p1;
          io_vec1.v2 = q1;
          io_vec1.v3 = r1;
          io_vec2.v1 = p3;
          io_vec2.v2 = q3;
          io_vec2.v3 = r3;
        } else {
          io_vec1.v1 = p2;
          io_vec1.v2 = q2;
          io_vec1.v3 = r2;
          io_vec2.v1 = p4;
          io_vec2.v2 = q4;
          io_vec2.v3 = r4;
        }
      } else {
        if (e3 < e4) {
          io_vec1.v1 = p2;
          io_vec1.v2 = q2;
          io_vec1.v3 = r2;
          io_vec2.v1 = p3;
          io_vec2.v2 = q3;
          io_vec2.v3 = r3;
        } else {
          io_vec1.v1 = p2;
          io_vec1.v2 = q2;
          io_vec1.v3 = r2;
          io_vec2.v1 = p4;
          io_vec2.v2 = q4;
          io_vec2.v3 = r4;
        }
      }
    } else {
      if (e2 < e3) {
        if (e2 < e4) {
          io_vec1.v1 = p1;
          io_vec1.v2 = q1;
          io_vec1.v3 = r1;
          io_vec2.v1 = p4;
          io_vec2.v2 = q4;
          io_vec2.v3 = r4;
        } else {
          io_vec1.v1 = p2;
          io_vec1.v2 = q2;
          io_vec1.v3 = r2;
          io_vec2.v1 = p4;
          io_vec2.v2 = q4;
          io_vec2.v3 = r4;
        }
      } else {
        if (e3 < e4) {
          io_vec1.v1 = p2;
          io_vec1.v2 = q2;
          io_vec1.v3 = r2;
          io_vec2.v1 = p3;
          io_vec2.v2 = q3;
          io_vec2.v3 = r3;
        } else {
          io_vec1.v1 = p2;
          io_vec1.v2 = q2;
          io_vec1.v3 = r2;
          io_vec2.v1 = p4;
          io_vec2.v2 = q4;
          io_vec2.v3 = r4;
        }
      }
    }
    return;
  }
})

INyARTransportVectorSolver = ASKlass('INyARTransportVectorSolver',
{
  set2dVertex : function(i_ref_vertex_2d,i_number_of_vertex){},
  /**
   * 画面座標群と3次元座標群から、平行移動量を計算します。
   * 2d座標系は、直前に実行したset2dVertexのものを使用します。
   * @param i_vertex_2d
   * 直前のset2dVertexコールで指定したものと同じものを指定してください。
   * @param i_vertex3d
   * 3次元空間の座標群を設定します。頂点の順番は、画面座標群と同じ順序で格納してください。
   * @param o_transfer
   * @throws NyARException
   */
  solveTransportVector : function(i_vertex3d, o_transfer){}
})


/**
 * 並進ベクトル[T]を３次元座標[b]と基点の回転済行列[M]から計算します。
 *
 * アルゴリズムは、ARToolKit 拡張現実プログラミング入門 の、P207のものです。
 *
 * 計算手順
 * [A]*[T]=bを、[A]T*[A]*[T]=[A]T*[b]にする。
 * set2dVertexで[A]T*[A]=[M]を計算して、Aの3列目の情報だけ保存しておく。
 * getTransportVectorで[M]*[T]=[A]T*[b]を連立方程式で解いて、[T]を得る。
 */
NyARTransportVectorSolver = ASKlass('NyARTransportVectorSolver', INyARTransportVectorSolver,
{
  _cx : null,
  _cy : null,
  _projection_mat : null,
  _nmber_of_vertex : 0,
  NyARTransportVectorSolver : function(i_projection_mat_ref,i_max_vertex)
  {
    this._projection_mat=i_projection_mat_ref;
    this._cx=new FloatVector(i_max_vertex);
    this._cy=new FloatVector(i_max_vertex);
    return;
  },
  _a00:0,_a01_10:0,_a02_20:0,_a11:0,_a12_21:0,_a22 : 0,
  /**
   * 画面上の座標群を指定します。
   * @param i_ref_vertex_2d
   * 歪み矯正済の画面上の頂点座標群への参照値を指定します。
   * @throws NyARException
   *
   */
  set2dVertex : function(i_ref_vertex_2d,i_number_of_vertex)
  {
    //3x2nと2n*3の行列から、最小二乗法計算するために3x3マトリクスを作る。
    //行列[A]の3列目のキャッシュ
    var cx=this._cx;
    var cy=this._cy;
    var m22;
    var p00=this._projection_mat.m00;
    var p01=this._projection_mat.m01;
    var p11=this._projection_mat.m11;
    var p12=this._projection_mat.m12;
    var p02=this._projection_mat.m02;
    var w1,w2,w3,w4;
    this._a00=i_number_of_vertex*p00*p00;
    this._a01_10=i_number_of_vertex*p00*p01;
    this._a11=i_number_of_vertex*(p01*p01+p11*p11);
    //[A]T*[A]の計算
    m22=0;
    w1=w2=0;
    for(var i=0;i<i_number_of_vertex;i++){
      //座標を保存しておく。
      w3=p02-(cx[i]=i_ref_vertex_2d[i].x);
      w4=p12-(cy[i]=i_ref_vertex_2d[i].y);
      w1+=w3;
      w2+=w4;
      m22+=w3*w3+w4*w4;
    }
    this._a02_20=w1*p00;
    this._a12_21=p01*w1+p11*w2;
    this._a22=m22;
    this._nmber_of_vertex=i_number_of_vertex;
    return;
  },
  /**
   * 画面座標群と3次元座標群から、平行移動量を計算します。
   * 2d座標系は、直前に実行したset2dVertexのものを使用します。
   * @param i_vertex_2d
   * 直前のset2dVertexコールで指定したものと同じものを指定してください。
   * @param i_vertex3d
   * 3次元空間の座標群を設定します。頂点の順番は、画面座標群と同じ順序で格納してください。
   * @param o_transfer
   * @throws NyARException
   */
  solveTransportVector : function(i_vertex3d,o_transfer)
  {
    var number_of_vertex=this._nmber_of_vertex;
    var p00=this._projection_mat.m00;
    var p01=this._projection_mat.m01;
    var p02=this._projection_mat.m02;
    var p11=this._projection_mat.m11;
    var p12=this._projection_mat.m12;
    //行列[A]の3列目のキャッシュ
    var cx=this._cx;
    var cy=this._cy;
    //回転行列を元座標の頂点群に適応
    //[A]T*[b]を計算
    var b1, b2, b3;
    b1 = b2 = b3 = 0;
    for(var i=0;i<number_of_vertex;i++)
    {
      var w1=i_vertex3d[i].z*cx[i]-p00*i_vertex3d[i].x-p01*i_vertex3d[i].y-p02*i_vertex3d[i].z;
      var w2=i_vertex3d[i].z*cy[i]-p11*i_vertex3d[i].y-p12*i_vertex3d[i].z;
      b1+=w1;
      b2+=w2;
      b3+=cx[i]*w1+cy[i]*w2;
    }
    //[A]T*[b]を計算
    b3=p02*b1+p12*b2-b3;//順番変えたらダメよ
    b2=p01*b1+p11*b2;
    b1=p00*b1;
    //([A]T*[A])*[T]=[A]T*[b]を方程式で解く。
    //a01とa10を0と仮定しても良いんじゃないかな？
    var a00=this._a00;
    var a01=this._a01_10;
    var a02=this._a02_20;
    var a11=this._a11;
    var a12=this._a12_21;
    var a22=this._a22;
    var t1=a22*b2-a12*b3;
    var t2=a12*b2-a11*b3;
    var t3=a01*b3-a02*b2;
    var t4=a12*a12-a11*a22;
    var t5=a02*a12-a01*a22;
    var t6=a02*a11-a01*a12;
    var det=a00*t4-a01*t5 + a02*t6;
    o_transfer.x= (a01*t1 - a02*t2 +b1*t4)/det;
    o_transfer.y=-(a00*t1 + a02*t3 +b1*t5)/det;
    o_transfer.z= (a00*t2 + a01*t3 +b1*t6)/det;
    return;
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */
FLARTransMatResult = NyARTransMatResult;
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */


NyARMath = Klass(
{
  /**
   * p2-p1ベクトルのsquare normを計算する。
   * @param i_p1
   * @param i_p2
   * @return
   */
  sqNorm_NyARDoublePoint2d : function(i_p1,i_p2 )
  {
    var x,y;
    x=i_p2.x-i_p1.x;
    y=i_p2.y-i_p1.y;
    return x*x+y*y;
  },
  sqNorm_Number : function(i_p1x,i_p1y,i_p2x,i_p2y)
  {
    var x,y;
    x=i_p2x-i_p1x;
    y=i_p2y-i_p1y;
    return x*x+y*y;
  },
  /**
   * p2-p1ベクトルのsquare normを計算する。
   * @param i_p1
   * @param i_p2
   * @return
   */
  sqNorm_NyARDoublePoint3d : function(i_p1,i_p2)
  {
    var x, y, z;
    x=i_p2.x-i_p1.x;
    y=i_p2.y-i_p1.y;
    z=i_p2.z-i_p1.z;
    return x*x+y*y+z*z;
  },
  /**
   * 3乗根を求められないシステムで、３乗根を求めます。
   * http://aoki2.si.gunma-u.ac.jp/JavaScript/src/3jisiki.html
   * @param i_in
   * @return
   */
  cubeRoot : function(i_in)
  {
    var res = Math.pow(Math.abs(i_in), 1.0 / 3.0);
    return (i_in >= 0) ? res : -res;
  }
})


NyAREquationSolver = Klass(
{
  solve2Equation_3 : function(i_a, i_b,i_c,o_result)
  {
    NyAS3Utils.assert(i_a!=0);
    return this.solve2Equation_2b(i_b/i_a,i_c/i_a,o_result,0);
  },
  solve2Equation_2a : function(i_b, i_c,o_result)
  {
    return this.solve2Equation_2b(i_b,i_c,o_result,0);
  },
  solve2Equation_2b : function(i_b, i_c,o_result,i_result_st)
  {
    var t=i_b*i_b-4*i_c;
    if(t<0){
      //虚数根
      return 0;
    }
    if(t==0){
      //重根
      o_result[i_result_st+0]=-i_b/(2);
      return 1;
    }
    //実根２個
    t=Math.sqrt(t);
    o_result[i_result_st+0]=(-i_b+t)/(2);
    o_result[i_result_st+1]=(-i_b-t)/(2);
    return 2;
  },
  /**
   * ３次方程式 a*x^3+b*x^2+c*x+d=0の実根を求める。
   * http://aoki2.si.gunma-u.ac.jp/JavaScript/src/3jisiki.html
   * のコードを基にしてます。
   * @param i_a
   * X^3の係数
   * @param i_b
   * X^2の係数
   * @param i_c
   * X^1の係数
   * @param i_d
   * X^0の係数
   * @param o_result
   * 実根。double[3]を指定すること。
   * @return
   */
  solve3Equation_4 : function(i_a, i_b, i_c, i_d,o_result)
  {
    NyAS3Utils.assert (i_a != 0);
    return this.solve3Equation_3(i_b/i_a,i_c/i_a,i_d/i_a,o_result);
  },
  /**
   * ３次方程式 x^3+b*x^2+c*x+d=0の実根を求める。
   * だけを求める。
   * http://aoki2.si.gunma-u.ac.jp/JavaScript/src/3jisiki.html
   * のコードを基にしてます。
   * @param i_b
   * X^2の係数
   * @param i_c
   * X^1の係数
   * @param i_d
   * X^0の係数
   * @param o_result
   * 実根。double[1]以上を指定すること。
   * @return
   */
  solve3Equation_3 : function(i_b,i_c,i_d,o_result)
  {
    var tmp,b,   p, q;
    b = i_b/(3);
    p = b * b - i_c / 3;
    q = (b * (i_c - 2 * b * b) - i_d) / 2;
    if ((tmp = q * q - p * p * p) == 0) {
      // 重根
      q = NyARMath.cubeRoot(q);
      o_result[0] = 2 * q - b;
      o_result[1] = -q - b;
      return 2;
    } else if (tmp > 0) {
      // 実根1,虚根2
      var a3 = NyARMath.cubeRoot(q + ((q > 0) ? 1 : -1) * Math.sqrt(tmp));
      var b3 = p / a3;
      o_result[0] = a3 + b3 - b;
      // 虚根:-0.5*(a3+b3)-b,Math.abs(a3-b3)*Math.sqrt(3.0)/2
      return 1;
    } else {
      // 実根3
      tmp = 2 * Math.sqrt(p);
      var t = Math.acos(q / (p * tmp / 2));
      o_result[0] = tmp * Math.cos(t / 3) - b;
      o_result[1] = tmp * Math.cos((t + 2 * Math.PI) / 3) - b;
      o_result[2] = tmp * Math.cos((t + 4 * Math.PI) / 3) - b;
      return 3;
    }
  },
  /**
   * ４次方程式の実根だけを求める。
   * @param i_a
   * X^3の係数
   * @param i_b
   * X^2の係数
   * @param i_c
   * X^1の係数
   * @param i_d
   * X^0の係数
   * @param o_result
   * 実根。double[3]を指定すること。
   * @return
   */
  solve4Equation : function(i_a, i_b, i_c, i_d,i_e,o_result)
  {
    NyAS3Utils.assert (i_a != 0);
    var A3,A2,A1,A0,B3;
    A3=i_b/i_a;
    A2=i_c/i_a;
    A1=i_d/i_a;
    A0=i_e/i_a;
    B3=A3/4;
    var p,q,r;
    var B3_2=B3*B3;
    p=A2-6*B3_2;//A2-6*B3*B3;
    q=A1+B3*(-2*A2+8*B3_2);//A1-2*A2*B3+8*B3*B3*B3;
    r=A0+B3*(-A1+A2*B3)-3*B3_2*B3_2;//A0-A1*B3+A2*B3*B3-3*B3*B3*B3*B3;
    if(q==0){
      var result_0,result_1;
      //複二次式
      var res=this.solve2Equation_2b(p,r,o_result,0);
      switch(res){
      case 0:
        //全て虚数解
        return 0;
      case 1:
        //重根
        //解は0,1,2の何れか。
        result_0=o_result[0];
        if(result_0<0){
          //全て虚数解
          return 0;
        }
        //実根1個
        if(result_0==0){
          //NC
          o_result[0]=0-B3;
          return 1;
        }
        //実根2個
        result_0=Math.sqrt(result_0);
        o_result[0]=result_0-B3;
        o_result[1]=-result_0-B3;
        return 2;
      case 2:
        //実根２個だからt==t2==0はありえない。(case1)
        //解は、0,2,4の何れか。
        result_0=o_result[0];
        result_1=o_result[1];
        var number_of_result=0;
        if(result_0>0){
          //NC
          result_0=Math.sqrt(result_0);
          o_result[0]= result_0-B3;
          o_result[1]=-result_0-B3;
          number_of_result+=2;
        }
        if(result_1>0)
        {
          //NC
          result_1=Math.sqrt(result_1);
          o_result[number_of_result+0]= result_1-B3;
          o_result[number_of_result+1]=-result_1-B3;
          number_of_result+=2;
        }
        return number_of_result;
      default:
        throw new NyARException();
      }
    }else{
      //それ以外
      //最適化ポイント:
      //u^3  + (2*p)*u^2  +((- 4*r)+(p^2))*u -q^2= 0
      var u=this.solve3Equation_1((2*p),(- 4*r)+(p*p),-q*q);
      if(u<0){
        //全て虚数解
        return 0;
      }
      var ru=Math.sqrt(u);
      //2次方程式を解いてyを計算(最適化ポイント)
      var result_1st,result_2nd;
      result_1st=this.solve2Equation_2b(-ru,(p+u)/2+ru*q/(2*u),o_result,0);
      //配列使い回しのために、変数に退避
      switch(result_1st){
      case 0:
        break;
      case 1:
        o_result[0]=o_result[0]-B3;
        break;
      case 2:
        o_result[0]=o_result[0]-B3;
        o_result[1]=o_result[1]-B3;
        break;
      default:
        throw new NyARException();
      }
      result_2nd=this.solve2Equation_2b(ru,(p+u)/2-ru*q/(2*u),o_result,result_1st);
      //0,1番目に格納
      switch(result_2nd){
      case 0:
        break;
      case 1:
        o_result[result_1st+0]=o_result[result_1st+0]-B3;
        break;
      case 2:
        o_result[result_1st+0]=o_result[result_1st+0]-B3;
        o_result[result_1st+1]=o_result[result_1st+1]-B3;
        break;
      default:
        throw new NyARException();
      }
      return result_1st+result_2nd;
    }
  },
  /**
   * 3次方程式の実根を１個だけ求める。
   * 4字方程式で使う。
   * @param i_b
   * @param i_c
   * @param i_d
   * @param o_result
   * @return
   */
  solve3Equation_1 : function(i_b,i_c, i_d)
  {
    var tmp,b,   p, q;
    b = i_b/(3);
    p = b * b - i_c / 3;
    q = (b * (i_c - 2 * b * b) - i_d) / 2;
    if ((tmp = q * q - p * p * p) == 0) {
      // 重根
      q = NyARMath.cubeRoot(q);
      return 2 * q - b;
    } else if (tmp > 0) {
      // 実根1,虚根2
      var a3 = NyARMath.cubeRoot(q + ((q > 0) ? 1 : -1) * Math.sqrt(tmp));
      var b3 = p / a3;
      return a3 + b3 - b;
    } else {
      // 実根3
      tmp = 2 * Math.sqrt(p);
      var t = Math.acos(q / (p * tmp / 2));
      return tmp * Math.cos(t / 3) - b;
    }
  }
})

NyARPerspectiveParamGenerator_O1 = Klass(
{
  _local_x : 0,
  _local_y : 0,
  _width : 0,
  _height : 0,
  initialize : function(i_local_x,i_local_y,i_width,i_height)
  {
    this._height=i_height;
    this._width=i_width;
    this._local_x=i_local_x;
    this._local_y=i_local_y;
    return;
  },
  getParam : function(i_vertex,o_param)
  {
    var ltx = this._local_x;
    var lty = this._local_y;
    var rbx = ltx + this._width;
    var rby = lty + this._height;
    var det_1;
    var a13, a14, a23, a24, a33, a34, a43, a44;
    var b11, b12, b13, b14, b21, b22, b23, b24, b31, b32, b33, b34, b41, b42, b43, b44;
    var t1, t2, t3, t4, t5, t6;
    var v1, v2, v3, v4;
    var kx0, kx1, kx2, kx3, kx4, kx5, kx6, kx7;
    var ky0, ky1, ky2, ky3, ky4, ky5, ky6, ky7;
    {
      v1 = i_vertex[0].x;
      v2 = i_vertex[1].x;
      v3 = i_vertex[2].x;
      v4 = i_vertex[3].x;
      a13 = -ltx * v1;
      a14 = -lty * v1;
      a23 = -rbx * v2;
      a24 = -lty * v2;
      a33 = -rbx * v3;
      a34 = -rby * v3;
      a43 = -ltx * v4;
      a44 = -rby * v4;
      t1 = a33 * a44 - a34 * a43;
      t4 = a34 * ltx - rbx * a44;
      t5 = rbx * a43 - a33 * ltx;
      t2 = rby * (a34 - a44);
      t3 = rby * (a43 - a33);
      t6 = rby * (rbx - ltx);
      b21 = -a23 * t4 - a24 * t5 - rbx * t1;
      b11 = (a23 * t2 + a24 * t3) + lty * t1;
      b31 = (a24 * t6 - rbx * t2) + lty * t4;
      b41 = (-rbx * t3 - a23 * t6) + lty * t5;
      t1 = a43 * a14 - a44 * a13;
      t2 = a44 * lty - rby * a14;
      t3 = rby * a13 - a43 * lty;
      t4 = ltx * (a44 - a14);
      t5 = ltx * (a13 - a43);
      t6 = ltx * (lty - rby);
      b12 = -rby * t1 - a33 * t2 - a34 * t3;
      b22 = (a33 * t4 + a34 * t5) + rbx * t1;
      b32 = (-a34 * t6 - rby * t4) + rbx * t2;
      b42 = (-rby * t5 + a33 * t6) + rbx * t3;
      t1 = a13 * a24 - a14 * a23;
      t4 = a14 * rbx - ltx * a24;
      t5 = ltx * a23 - a13 * rbx;
      t2 = lty * (a14 - a24);
      t3 = lty * (a23 - a13);
      t6 = lty * (ltx - rbx);
      b23 = -a43 * t4 - a44 * t5 - ltx * t1;
      b13 = (a43 * t2 + a44 * t3) + rby * t1;
      b33 = (a44 * t6 - ltx * t2) + rby * t4;
      b43 = (-ltx * t3 - a43 * t6) + rby * t5;
      t1 = a23 * a34 - a24 * a33;
      t2 = a24 * rby - lty * a34;
      t3 = lty * a33 - a23 * rby;
      t4 = rbx * (a24 - a34);
      t5 = rbx * (a33 - a23);
      t6 = rbx * (rby - lty);
      b14 = -lty * t1 - a13 * t2 - a14 * t3;
      b24 = a13 * t4 + a14 * t5 + ltx * t1;
      b34 = -a14 * t6 - lty * t4 + ltx * t2;
      b44 = -lty * t5 + a13 * t6 + ltx * t3;
      det_1 = (ltx * (b11 + b14) + rbx * (b12 + b13));
      if (det_1 == 0) {
        det_1=0.0001;
        //System.out.println("Could not get inverse matrix(1).");
        //return false;
      }
      det_1 = 1 / det_1;
      kx0 = (b11 * v1 + b12 * v2 + b13 * v3 + b14 * v4) * det_1;
      kx1 = (b11 + b12 + b13 + b14) * det_1;
      kx2 = (b21 * v1 + b22 * v2 + b23 * v3 + b24 * v4) * det_1;
      kx3 = (b21 + b22 + b23 + b24) * det_1;
      kx4 = (b31 * v1 + b32 * v2 + b33 * v3 + b34 * v4) * det_1;
      kx5 = (b31 + b32 + b33 + b34) * det_1;
      kx6 = (b41 * v1 + b42 * v2 + b43 * v3 + b44 * v4) * det_1;
      kx7 = (b41 + b42 + b43 + b44) * det_1;
    }
    {
      v1 = i_vertex[0].y;
      v2 = i_vertex[1].y;
      v3 = i_vertex[2].y;
      v4 = i_vertex[3].y;
      a13 = -ltx * v1;
      a14 = -lty * v1;
      a23 = -rbx * v2;
      a24 = -lty * v2;
      a33 = -rbx * v3;
      a34 = -rby * v3;
      a43 = -ltx * v4;
      a44 = -rby * v4;
      t1 = a33 * a44 - a34 * a43;
      t4 = a34 * ltx - rbx * a44;
      t5 = rbx * a43 - a33 * ltx;
      t2 = rby * (a34 - a44);
      t3 = rby * (a43 - a33);
      t6 = rby * (rbx - ltx);
      b21 = -a23 * t4 - a24 * t5 - rbx * t1;
      b11 = (a23 * t2 + a24 * t3) + lty * t1;
      b31 = (a24 * t6 - rbx * t2) + lty * t4;
      b41 = (-rbx * t3 - a23 * t6) + lty * t5;
      t1 = a43 * a14 - a44 * a13;
      t2 = a44 * lty - rby * a14;
      t3 = rby * a13 - a43 * lty;
      t4 = ltx * (a44 - a14);
      t5 = ltx * (a13 - a43);
      t6 = ltx * (lty - rby);
      b12 = -rby * t1 - a33 * t2 - a34 * t3;
      b22 = (a33 * t4 + a34 * t5) + rbx * t1;
      b32 = (-a34 * t6 - rby * t4) + rbx * t2;
      b42 = (-rby * t5 + a33 * t6) + rbx * t3;
      t1 = a13 * a24 - a14 * a23;
      t4 = a14 * rbx - ltx * a24;
      t5 = ltx * a23 - a13 * rbx;
      t2 = lty * (a14 - a24);
      t3 = lty * (a23 - a13);
      t6 = lty * (ltx - rbx);
      b23 = -a43 * t4 - a44 * t5 - ltx * t1;
      b13 = (a43 * t2 + a44 * t3) + rby * t1;
      b33 = (a44 * t6 - ltx * t2) + rby * t4;
      b43 = (-ltx * t3 - a43 * t6) + rby * t5;
      t1 = a23 * a34 - a24 * a33;
      t2 = a24 * rby - lty * a34;
      t3 = lty * a33 - a23 * rby;
      t4 = rbx * (a24 - a34);
      t5 = rbx * (a33 - a23);
      t6 = rbx * (rby - lty);
      b14 = -lty * t1 - a13 * t2 - a14 * t3;
      b24 = a13 * t4 + a14 * t5 + ltx * t1;
      b34 = -a14 * t6 - lty * t4 + ltx * t2;
      b44 = -lty * t5 + a13 * t6 + ltx * t3;
      det_1 = (ltx * (b11 + b14) + rbx * (b12 + b13));
      if (det_1 == 0) {
        det_1=0.0001;
        //System.out.println("Could not get inverse matrix(2).");
        //return false;
      }
      det_1 = 1 / det_1;
      ky0 = (b11 * v1 + b12 * v2 + b13 * v3 + b14 * v4) * det_1;
      ky1 = (b11 + b12 + b13 + b14) * det_1;
      ky2 = (b21 * v1 + b22 * v2 + b23 * v3 + b24 * v4) * det_1;
      ky3 = (b21 + b22 + b23 + b24) * det_1;
      ky4 = (b31 * v1 + b32 * v2 + b33 * v3 + b34 * v4) * det_1;
      ky5 = (b31 + b32 + b33 + b34) * det_1;
      ky6 = (b41 * v1 + b42 * v2 + b43 * v3 + b44 * v4) * det_1;
      ky7 = (b41 + b42 + b43 + b44) * det_1;
    }
    det_1 = kx5 * (-ky7) - (-ky5) * kx7;
    if (det_1 == 0) {
      det_1=0.0001;
      //System.out.println("Could not get inverse matrix(3).");
      //return false;
    }
    det_1 = 1 / det_1;
    var C, F;
    o_param[2] = C = (-ky7 * det_1) * (kx4 - ky4) + (ky5 * det_1) * (kx6 - ky6); // C
    o_param[5] = F = (-kx7 * det_1) * (kx4 - ky4) + (kx5 * det_1) * (kx6 - ky6); // F
    o_param[6] = kx4 - C * kx5;
    o_param[7] = kx6 - C * kx7;
    o_param[0] = kx0 - C * kx1;
    o_param[1] = kx2 - C * kx3;
    o_param[3] = ky0 - F * ky1;
    o_param[4] = ky2 - F * ky3;
    return true;
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */
NyIdMarkerParam = ASKlass('NyIdMarkerParam',
{
  /**
   * マーカの方位値です。
   */
  direction : 0,
  /**
   * マーカ周辺のパターン閾値です。
   */
  threshold : 0
})
NyIdMarkerPattern = ASKlass('NyIdMarkerPattern',
{
  model : 0,
  ctrl_domain : 0,
  ctrl_mask : 0,
  check : 0,
  data : new IntVector(32)
})




TThreshold = ASKlass('TThreshold',
{
  th_h : 0,
  th_l : 0,
  th : 0,
  lt_x : 0,
  lt_y : 0,
  rb_x : 0,
  rb_y : 0
})
THighAndLow = ASKlass('THighAndLow',
{
  h : 0,
  l : 0
})
/**
 * Marker pattern encoder。
 *
 */
_bit_table_3 = new IntVector([
  25,  26,  27,  28,  29,  30,  31,
  48,  9,  10,  11,  12,  13,  32,
  47,  24,  1,  2,  3,  14,  33,
  46,  23,  8,  0,  4,  15,  34,
  45,  22,  7,  6,  5,  16,  35,
  44,  21,  20,  19,  18,  17,  36,
  43,  42,  41,  40,  39,  38,  37
  ])
_bit_table_2 = new IntVector([
  9,  10,  11,  12,  13,
  24,  1,  2,  3,  14,
  23,  8,  0,  4,  15,
  22,  7,  6,  5,  16,
  21,  20,  19,  18,  17])
MarkerPattEncoder = ASKlass('MarkerPattEncoder',
{
  _bit_table_2 : _bit_table_2,
  _bit_table_3 : _bit_table_3,
  _bit_tables : [
    _bit_table_2,_bit_table_3,null,null,null,null,null],
  /**
  * RECT(0):[0]=(0)
  * RECT(1):[1]=(1-8)
  * RECT(2):[2]=(9-16),[3]=(17-24)
  * RECT(3):[4]=(25-32),[5]=(33-40),[6]=(41-48)
  */
  _bit_table : null,
  _bits : new IntVector(16),
  _work : new IntVector(16),
  _model : 0,
  setBitByBitIndex : function(i_index_no,i_value)
  {
    NyAS3Utils.assert(i_value==0 || i_value==1);
    var bit_no=this._bit_table[i_index_no];
    if(bit_no==0){
      this._bits[0]=i_value;
    }else{
      var bidx=toInt((bit_no-1)/8)+1;
      var sidx=(bit_no-1)%8;
      this._bits[bidx]=(this._bits[bidx]&(~(0x01<<sidx)))|(i_value<<sidx);
    }
    return;
  }
  ,setBit : function(i_bit_no,i_value)
  {
    NyAS3Utils.assert(i_value==0 || i_value==1);
    if(i_bit_no==0){
      this._bits[0]=i_value;
    }else{
      var bidx=toInt((i_bit_no-1)/8)+1;
      var sidx=(i_bit_no-1)%8;
      this._bits[bidx]=(this._bits[bidx]&(~(0x01<<sidx)))|(i_value<<sidx);
    }
    return;
  }
  ,getBit : function(i_bit_no)
  {
    if(i_bit_no==0){
      return this._bits[0];
    }else{
      var bidx=toInt((i_bit_no-1)/8)+1;
      var sidx=(i_bit_no-1)%8;
      return (this._bits[bidx]>>(sidx))&(0x01);
    }
  }
  ,getModel : function()
  {
    return this._model;
  }
  ,getControlValue : function(i_model,i_data)
  {
    var v;
    switch(i_model){
    case 2:
      v=(i_data[2] & 0x0e)>>1;
      return v>=5?v-1:v;
    case 3:
      v=(i_data[4] & 0x3e)>>1;
      return v>=21?v-1:v;
    case 4:
    case 5:
    case 6:
        case 7:
        default:
            break;
    }
    return -1;
  }
  ,getCheckValue : function(i_model,i_data)
  {
    var v;
    switch(i_model){
    case 2:
      v=(i_data[2] & 0xe0)>>5;
      return v>5?v-1:v;
    case 3:
      v=((i_data[4] & 0x80)>>7) |((i_data[5] & 0x0f)<<1);
      return v>21?v-1:v;
    case 4:
    case 5:
    case 6:
        case 7:
        default:
            break;
    }
    return -1;
  }
  ,initEncoder : function(i_model)
  {
    if(i_model>3 || i_model<2){
      //Lv4以降に対応する時は、この制限を変える。
      // Change this when Lv4 is supported.
      return false;
    }
    this._bit_table=this._bit_tables[i_model-2];
    this._model=i_model;
    return true;
  }
  ,getDirection : function()
  {
    var l,t,r,b;
    var timing_pat;
    switch(this._model){
    case 2:
      //トラッキングセルを得る
      // get tracking cel
      t=this._bits[2] & 0x1f;
      r=((this._bits[2] & 0xf0)>>4)|((this._bits[3]&0x01)<<4);
      b=this._bits[3] & 0x1f;
      l=((this._bits[3] & 0xf0)>>4)|((this._bits[2]&0x01)<<4);
      timing_pat=0x0a;
      break;
    case 3:
      t=this._bits[4] & 0x7f;
      r=((this._bits[4] & 0xc0)>>6)|((this._bits[5] & 0x1f)<<2);
      b=((this._bits[5] & 0xf0)>>4)|((this._bits[6] & 0x07)<<4);
      l=((this._bits[6] & 0xfc)>>2)|((this._bits[4] & 0x01)<<6);
      timing_pat=0x2a;
      break;
    default:
      return -3;
    }
    //タイミングパターンの比較
    // timing pattern comparison
    if(t==timing_pat){
      if(r==timing_pat){
        return (b!=timing_pat && l!=timing_pat)?2:-2;
      }else if(l==timing_pat){
        return (b!=timing_pat && r!=timing_pat)?3:-2;
      }
    }else if(b==timing_pat){
      if(r==timing_pat){
        return (t!=timing_pat && l!=timing_pat)?1:-2;
      }else if(l==timing_pat){
        return (t!=timing_pat && r!=timing_pat)?0:-2;
      }
    }
    return -1;
  }
  /**
  * 格納しているマーカパターンをエンコードして、マーカデータを返します。
  * Encodes the stored marker pattern, writes marker data to o_out.
  * @param o_out
  * @return
  * 成功すればマーカの方位を返却します。失敗すると-1を返します。
  * On success, returns the marker direction. On failure, returns -1.
  */
  ,encode : function(o_out)
  {
    var d=this.getDirection();
    if(d<0){
      return -1;
    }
    //回転ビットの取得
    // Acquire the rotation bit
    this.getRotatedBits(d,o_out.data);
    var model=this._model;
    //周辺ビットの取得
    // Acquire border bits
    o_out.model=model;
    var control_bits=this.getControlValue(model,o_out.data);
    o_out.check=this.getCheckValue(model,o_out.data);
    o_out.ctrl_mask=control_bits%5;
    o_out.ctrl_domain=toInt(control_bits/5);
    if(o_out.ctrl_domain!=0 || o_out.ctrl_mask!=0){
      // failed to find a proper mask and domain, return -1
      return -1;//ドメイン、マスクは現在0のみなので、それ以外の場合-1（失敗）を返す
    }
    //マスク解除処理を実装すること
    // implement mask release
    return d;
  }
  ,getRotatedBits : function(i_direction,o_out)
  {
    var sl=i_direction*2;
    var sr=8-sl;
    var w1;
    o_out[0]=this._bits[0];
    //RECT1
    w1=this._bits[1];
    o_out[1]=((w1<<sl)|(w1>>sr))& 0xff;
    //RECT2
    sl=i_direction*4;
    sr=16-sl;
    w1=this._bits[2]|(this._bits[3]<<8);
    w1=(w1<<sl)|(w1>>sr);
    o_out[2]=w1 & 0xff;
    o_out[3]=(w1>>8) & 0xff;
    if(this._model<2){
      return;
    }
    //RECT3
    sl=i_direction*6;
    sr=24-sl;
    w1=this._bits[4]|(this._bits[5]<<8)|(this._bits[6]<<16);
    w1=(w1<<sl)|(w1>>sr);
    o_out[4]=w1 & 0xff;
    o_out[5]=(w1>>8) & 0xff;
    o_out[6]=(w1>>16) & 0xff;
    if(this._model<3){
      return;
    }
    //RECT4(Lv4以降はここの制限を変える) uncomment when Lv4 supported
  //    shiftLeft(this._bits,7,3,i_direction*8);
  //    if(this._model<4){
  //      return;
  //    }
    return;
  }
  ,shiftLeft : function(i_pack,i_start,i_length,i_ls)
  {
    var i;
    var work=this._work;
    //端数シフト
    var mod_shift=i_ls%8;
    for(i=i_length-1;i>=1;i--){
      work[i]=(i_pack[i+i_start]<<mod_shift)|(0xff&(i_pack[i+i_start-1]>>(8-mod_shift)));
    }
    work[0]=(i_pack[i_start]<<mod_shift)|(0xff&(i_pack[i_start+i_length-1]>>(8-mod_shift)));
    //バイトシフト
    var byte_shift=toInt(i_ls/8)%i_length;
    for(i=i_length-1;i>=0;i--){
      i_pack[(byte_shift+i)%i_length+i_start]=0xff & work[i];
    }
    return;
  }
})
INyIdMarkerData = ASKlass('INyIdMarkerData',
{
  /**
   * i_targetのマーカデータと自身のデータが等しいかを返します。
   * @param i_target
   * 比較するマーカオブジェクト
   * @return
   * 等しいかの真偽値
   */
  isEqual : function(i_target){},
  /**
   * i_sourceからマーカデータをコピーします。
   * @param i_source
   */
  copyFrom : function(i_source){}
})


/**
 * ラスタ画像の任意矩形から、NyARIdMarkerDataを抽出します。
 *
 */
NyIdMarkerPickup = ASKlass('NyIdMarkerPickup',
{
  _perspective_reader : null,
  __pickFromRaster_th : new TThreshold(),
  __pickFromRaster_encoder : new MarkerPattEncoder(),
  NyIdMarkerPickup : function()
  {
    this._perspective_reader=new PerspectivePixelReader();
    return;
  }
  /**
   * Initialize the marker pickup for a new frame.
   * Clears out old values from perspective reader motion cache.
   */
  ,init : function()
  {
    this._perspective_reader.newFrame();
  }
  /**
   * i_imageから、idマーカを読みだします。
   * o_dataにはマーカデータ、o_paramにはまーかのパラメータを返却します。
   * @param image
   * @param i_square
   * @param o_data
   * @param o_param
   * @return
   * @throws NyARException
   */
  ,pickFromRaster : function(image,i_vertex,o_data,o_param)
  {
    //遠近法のパラメータを計算
    if(!this._perspective_reader.setSourceSquare(i_vertex)){
      if (window.DEBUG)
        console.log('NyIdMarkerPickup.pickFromRaster: could not setSourceSquare')
      return false;
    };
    var reader=image.getGrayPixelReader();
    var raster_size=image.getSize();
    var th=this.__pickFromRaster_th;
    var encoder=this.__pickFromRaster_encoder;
    //マーカパラメータを取得
    this._perspective_reader.detectThresholdValue(reader,raster_size,th);
    if(!this._perspective_reader.readDataBits(reader,raster_size,th, encoder)){
      if (window.DEBUG)
        console.log('NyIdMarkerPickup.pickFromRaster: could not readDataBits')
      return false;
    }
    var d=encoder.encode(o_data);
    if(d<0){
      if (window.DEBUG)
        console.log('NyIdMarkerPickup.pickFromRaster: could not encode')
      return false;
    }
    o_param.direction=d;
    o_param.threshold=th.th;
    return true;
  }
})






/**
 * NyARColorPatt_NyIdMarkerがラスタからPerspective変換して読みだすためのクラス
 *
 */
PerspectivePixelReader = ASKlass('PerspectivePixelReader',
{
  _param_gen : new NyARPerspectiveParamGenerator_O1(1,1,100,100),
  _cparam : new FloatVector(8),
  PerspectivePixelReader : function()
  {
    return;
  }
  ,maxPreviousFrameAge : 1
  ,newFrame : function()
  {
    for (var i in this.previousFrames) {
      var pf = this.previousFrames[i];
      pf.age++;
      if (pf.age > this.maxPreviousFrameAge) {
        delete this.previousFrames[i];
      }
    }
  }
  ,setSourceSquare : function(i_vertex)
  {
    var cx = 0, cy = 0;
    for (var i=0; i<4; i++) {
      cx += i_vertex[i].x;
      cy += i_vertex[i].y;
    }
    cx /= 4;
    cy /= 4;
    var qx = toInt(cx / 10);
    var qy = toInt(cy / 10);
    this.centerPoint[0] = qx;
    this.centerPoint[1] = qy;
    return this._param_gen.getParam(i_vertex, this._cparam);
  }
  /**
  * 矩形からピクセルを切り出します
  * @param i_lt_x
  * @param i_lt_y
  * @param i_step_x
  * @param i_step_y
  * @param i_width
  * @param i_height
  * @param i_out_st
  * o_pixelへの格納場所の先頭インデクス
  * @param o_pixel
  * @throws NyARException
  */
  ,rectPixels : function(i_reader,i_raster_size,i_lt_x,i_lt_y,i_step_x,i_step_y,i_width,i_height,i_out_st,o_pixel)
  {
    var cpara=this._cparam;
    var ref_x=this._ref_x;
    var ref_y=this._ref_y;
    var pixcel_temp=this._pixcel_temp;
    var raster_width=i_raster_size.w;
    var raster_height=i_raster_size.h;
    var out_index=i_out_st;
    var cpara_6=cpara[6];
    var cpara_0=cpara[0];
    var cpara_3=cpara[3];
    for(var i=0;i<i_height;i++){
      //1列分のピクセルのインデックス値を計算する。
      var cy0=1+i*i_step_y+i_lt_y;
      var cpy0_12=cpara[1]*cy0+cpara[2];
      var cpy0_45=cpara[4]*cy0+cpara[5];
      var cpy0_7=cpara[7]*cy0+1.0;
      var pt = 0;
      var i2;
      for(i2=0;i2<i_width;i2++)
      {
        var cx0=1+i2*i_step_x+i_lt_x;
        var d=cpara_6*cx0+cpy0_7;
        var x=toInt((cpara_0*cx0+cpy0_12)/d);
        var y=toInt((cpara_3*cx0+cpy0_45)/d);
        if(x<0||y<0||x>=raster_width||y>=raster_height)
        {
          return false;
        }
        ref_x[pt]=x;
        ref_y[pt]=y;
        pt++;
      }
      //1行分のピクセルを取得(場合によっては専用アクセサを書いた方がいい)
      i_reader.getPixelSet(ref_x,ref_y,i_width,pixcel_temp);
      //グレースケールにしながら、line→mapへの転写
      for(i2=0;i2<i_width;i2++){
        var index=i2;
        o_pixel[out_index]=pixcel_temp[index];
        out_index++;
      }
    }
    return true;
  }
  /**
  * i_freqにあるゼロクロス点の周期が、等間隔か調べます。
  * 次段半周期が、前段の80%より大きく、120%未満であるものを、等間隔周期であるとみなします。
  * @param i_freq
  * @param i_width
  */
  ,checkFreqWidth : function(i_freq,i_width)
  {
    var c=i_freq[1]-i_freq[0];
    var count=i_width*2-1;
    for (var i= 1; i < count; i++) {
      var n=i_freq[i+1]-i_freq[i];
      var v=n*100/c;
      if(v>150 || v<50){
        return false;
      }
      c=n;
    }
    return true;
  }
  /**
  * i_freq_count_tableとi_freq_tableの内容を調査し、最も大きな周波数成分を返します。
  * @param i_freq_count_table
  * @param i_freq_table
  * @param o_freq_table
  * @return
  * 見つかれば0以上、密辛ければ0未満
  */
  ,getMaxFreq : function(i_freq_count_table,i_freq_table,o_freq_table)
  {
    //一番成分の大きいものを得る
    var index=-1;
    var max = 0;
    var i;
    for(i=0;i<this.MAX_FREQ;i++){
      if(max<i_freq_count_table[i]){
        index=i;
        max=i_freq_count_table[i];
      }
    }
    if(index==-1){
      return -1;
    }
    /*周波数インデクスを計算*/
    var st=(index-1)*index;
    for(i=0;i<index*2;i++)
    {
      o_freq_table[i]=i_freq_table[st+i]*this.FRQ_STEP/max;
    }
    return index;
  },
  //タイミングパターン用のパラメタ(this.FRQ_POINTS*this.FRQ_STEPが100を超えないようにすること)
  FRQ_EDGE : 10,
  FRQ_STEP : 2,
  FRQ_POINTS : (100-(5/*FRQ_EDGE*/*2))/2/*FRQ_STEP*/,
  MIN_FREQ : 3,
  MAX_FREQ : 10,
  FREQ_SAMPLE_NUM : 4,
  MAX_DATA_BITS : 10+10/*MAX_FREQ+MAX_FREQ*/-1,
  _ref_x : new IntVector(108),
  _ref_y : new IntVector(108),
  //(model+1)*4*3とthis.THRESHOLD_PIXEL*3のどちらか大きい方
  _pixcel_temp : new IntVector(108),
  _freq_count_table : new IntVector(10/*MAX_FREQ*/),
  _freq_table : new IntVector((10/*MAX_FREQ*/*2-1)*10/*MAX_FREQ*/*2/2),
  /**
  * i_y1行目とi_y2行目を平均して、タイミングパターンの周波数を得ます。
  * LHLを1周期として、たとえばLHLHLの場合は2を返します。LHLHやHLHL等の始端と終端のレベルが異なるパターンを
  * 検出した場合、関数は失敗します。
  *
  * @param i_y1
  * @param i_y2
  * @param i_th_h
  * @param i_th_l
  * @param o_edge_index
  * 検出したエッジ位置(H->L,L->H)のインデクスを受け取る配列です。
  * [this.FRQ_POINTS]以上の配列を指定してください。
  * @return
  * @throws NyARException
  */
  getRowFrequency : function(i_reader,i_raster_size,i_y1,i_th_h,i_th_l,o_edge_index)
  {
    var i;
    //3,4,5,6,7,8,9,10
    var freq_count_table=this._freq_count_table;
    //0,2,4,6,8,10,12,14,16,18,20の要素を持つ配列
    var freq_table=this._freq_table;
    //初期化
    var cpara=this._cparam;
    var ref_x=this._ref_x;
    var ref_y=this._ref_y;
    var pixcel_temp=this._pixcel_temp;
    for(i=0;i<10;i++){
      freq_count_table[i]=0;
    }
    for(i=0;i<110;i++){
      freq_table[i]=0;
    }
    var raster_width=i_raster_size.w;
    var raster_height=i_raster_size.h;
    var cpara_0=cpara[0];
    var cpara_3=cpara[3];
    var cpara_6=cpara[6];
    var cv;
    if (window.DEBUG) {
      cv = document.getElementById('debugCanvas').getContext('2d');
      cv.fillStyle = 'orange';
    }
    //10-20ピクセル目からタイミングパターンを検出
    for (i = 0; i < this.FREQ_SAMPLE_NUM; i++) {
      var i2;
      //2行分のピクセルインデックスを計算
      var cy0=1+i_y1+i/**this.FRQ_STEP*5+this.FRQ_EDGE*/;
      var cpy0_12=cpara[1]*cy0+cpara[2];
      var cpy0_45=cpara[4]*cy0+cpara[5];
      var cpy0_7=cpara[7]*cy0+1.0;
      var pt=0;
      for(i2=0;i2<this.FRQ_POINTS;i2++)
      {
        var cx0=1+i2*this.FRQ_STEP+this.FRQ_EDGE;
        var d=(cpara_6*cx0)+cpy0_7;
        var x=toInt((cpara_0*cx0+cpy0_12)/d);
        var y=toInt((cpara_3*cx0+cpy0_45)/d);
        if(x<0||y<0||x>=raster_width||y>=raster_height)
        {
          return -1;
        }
        ref_x[pt]=x;
        ref_y[pt]=y;
        pt++;
      }
      //ピクセルを取得(入力画像を多様化するならここから先を調整すること)
      i_reader.getPixelSet(ref_x,ref_y,this.FRQ_POINTS,pixcel_temp);
      if (window.DEBUG) {
        for (var j=0; j<this.FRQ_POINTS; j++) {
          cv.fillRect(ref_x[j], ref_y[j], 1,1);
        }
      }
      //o_edge_indexを一時的に破壊して調査する
      var freq_t=this.getFreqInfo(pixcel_temp,i_th_h,i_th_l,o_edge_index);
      //周期は3-10であること
      if(freq_t<this.MIN_FREQ || freq_t>this.MAX_FREQ){
        continue;
      }
      //周期は等間隔であること
      if(!this.checkFreqWidth(o_edge_index,freq_t)){
        continue;
      }
      //検出カウンタを追加
      freq_count_table[freq_t]++;
      var table_st=(freq_t-1)*freq_t;
      for(i2=0;i2<freq_t*2;i2++){
        freq_table[table_st+i2]+=o_edge_index[i2];
      }
    }
    return this.getMaxFreq(freq_count_table,freq_table,o_edge_index);
  }
  ,getColFrequency : function(i_reader,i_raster_size,i_x1,i_th_h,i_th_l,o_edge_index)
  {
    var i;
    var cpara=this._cparam;
    var ref_x=this._ref_x;
    var ref_y=this._ref_y;
    var pixcel_temp=this._pixcel_temp;
    //0,2,4,6,8,10,12,14,16,18,20=(11*20)/2=110
    //初期化
    var freq_count_table=this._freq_count_table;
    for(i=0;i<10;i++){
      freq_count_table[i]=0;
    }
    var freq_table = this._freq_table;
    for(i=0;i<110;i++){
      freq_table[i]=0;
    }
    var raster_width=i_raster_size.w;
    var raster_height=i_raster_size.h;
    var cpara7=cpara[7];
    var cpara4=cpara[4];
    var cpara1=cpara[1];
    var cv;
    if (window.DEBUG) {
      cv = document.getElementById('debugCanvas').getContext('2d');
      cv.fillStyle = 'green';
    }
    //基準点から4ピクセルを参照パターンとして抽出
    for (i = 0; i < this.FREQ_SAMPLE_NUM; i++) {
      var i2;
      var cx0=1+i/**this.FRQ_STEP*5+this.FRQ_EDGE*/+i_x1;
      var cp6_0=cpara[6]*cx0;
      var cpx0_0=cpara[0]*cx0+cpara[2];
      var cpx3_0=cpara[3]*cx0+cpara[5];
      var pt=0;
      for(i2=0;i2<this.FRQ_POINTS;i2++)
      {
        var cy=1+i2*this.FRQ_STEP+this.FRQ_EDGE;
        var d=cp6_0+cpara7*cy+1.0;
        var x=toInt((cpx0_0+cpara1*cy)/d);
        var y=toInt((cpx3_0+cpara4*cy)/d);
        if(x<0||y<0||x>=raster_width||y>=raster_height)
        {
          return -1;
        }
        ref_x[pt]=x;
        ref_y[pt]=y;
        pt++;
      }
      //ピクセルを取得(入力画像を多様化するならここを調整すること)
      i_reader.getPixelSet(ref_x,ref_y,this.FRQ_POINTS,pixcel_temp);
      if (window.DEBUG) {
        for (var j=0; j<this.FRQ_POINTS; j++) {
          cv.fillRect(ref_x[j], ref_y[j], 1,1);
        }
      }
      var freq_t=this.getFreqInfo(pixcel_temp,i_th_h,i_th_l,o_edge_index);
      //周期は3-10であること
      if(freq_t<this.MIN_FREQ || freq_t>this.MAX_FREQ){
        continue;
      }
      //周期は等間隔であること
      if(!this.checkFreqWidth(o_edge_index,freq_t)){
        continue;
      }
      //検出カウンタを追加
      freq_count_table[freq_t]++;
      var table_st=(freq_t-1)*freq_t;
      for(i2=0;i2<freq_t*2;i2++){
        freq_table[table_st+i2]+=o_edge_index[i2];
      }
    }
    return this.getMaxFreq(freq_count_table,freq_table,o_edge_index);
  }
  /**
  * デバックすんだらstaticにしておｋ
  * @param i_pixcels
  * @param i_th_h
  * @param i_th_l
  * @param o_edge_index
  * @return
  */
  ,getFreqInfo : function(i_pixcels,i_th_h,i_th_l,o_edge_index)
  {
    //トークンを解析して、周波数を計算
    var i=0;
    var frq_l2h=0;
    var frq_h2l = 0;
    var index,pix;
    while(i<this.FRQ_POINTS){
      //L->Hトークンを検出する
      while(i<this.FRQ_POINTS){
        index=i;
        pix=i_pixcels[index];
        if(pix>i_th_h){
          //トークン発見
          o_edge_index[frq_l2h+frq_h2l]=i;
          frq_l2h++;
          break;
        }
        i++;
      }
      i++;
      //L->Hトークンを検出する
      while(i<this.FRQ_POINTS){
        index=i;
        pix=i_pixcels[index];
        if(pix<=i_th_l){
          //トークン発見
          o_edge_index[frq_l2h+frq_h2l]=i;
          frq_h2l++;
          break;
        }
        i++;
      }
      i++;
    }
    return frq_l2h==frq_h2l?frq_l2h:-1;
  },
  THRESHOLD_EDGE : 10,
  THRESHOLD_STEP : 2,
  THRESHOLD_WIDTH : 10,
  THRESHOLD_PIXEL : 10/2/*this.THRESHOLD_WIDTH/this.THRESHOLD_STEP*/,
  THRESHOLD_SAMPLE : 5*5/*this.THRESHOLD_PIXEL*this.THRESHOLD_PIXEL*/,
  THRESHOLD_SAMPLE_LT : 10/*this.THRESHOLD_EDGE*/,
  THRESHOLD_SAMPLE_RB : 100-10-10/*this.THRESHOLD_WIDTH-this.THRESHOLD_EDGE*/,
  /**
  * ピクセル配列の上位、下位の4ピクセルのピクセル値平均を求めます。
  * この関数は、(4/i_pixcel.length)の領域を占有するPtail法で双方向の閾値を求めることになります。
  * @param i_pixcel
  * @param i_initial
  * @param i_out
  */
  getPtailHighAndLow : function(i_pixcel,i_out )
  {
    var h3,h2,h1,h0,l3,l2,l1,l0;
    h3=h2=h1=h0=l3=l2=l1=l0=i_pixcel[0];
    for(var i=i_pixcel.length-1;i>=1;i--){
      var pix=i_pixcel[i];
      if(h0<pix){
        if(h1<pix){
          if(h2<pix){
            if(h3<pix){
              h0=h1;
              h1=h2;
              h2=h3;
              h3=pix;
            }else{
              h0=h1;
              h1=h2;
              h2=pix;
            }
          }else{
            h0=h1;
            h1=pix;
          }
        }else{
          h0=pix;
        }
      }
      if(l0>pix){
        if(l1>pix){
          if(l2>pix){
            if(l3>pix){
              l0=l1;
              l1=l2;
              l2=l3;
              l3=pix;
            }else{
              l0=l1;
              l1=l2;
              l2=pix;
            }
          }else{
            l0=l1;
            l1=pix;
          }
        }else{
          l0=pix;
        }
      }
    }
    i_out.l=(l0+l1+l2+l3)/4;
    i_out.h=(h0+h1+h2+h3)/4;
    return;
  },
  __detectThresholdValue_hl : new THighAndLow(),
  __detectThresholdValue_tpt : new NyARIntPoint2d(),
  _th_pixels : new IntVector(5*5/*this.THRESHOLD_SAMPLE*/*4),
  /**
  * 指定した場所のピクセル値を調査して、閾値を計算して返します。
  * @param i_reader
  * @param i_x
  * @param i_y
  * @return
  * @throws NyARException
  */
  detectThresholdValue : function(i_reader,i_raster_size,o_threshold)
  {
    var th_pixels=this._th_pixels;
    //左上のピックアップ領域からピクセルを得る(00-24)
    this.rectPixels(i_reader,i_raster_size,this.THRESHOLD_SAMPLE_LT,this.THRESHOLD_SAMPLE_LT,this.THRESHOLD_STEP,this.THRESHOLD_STEP,this.THRESHOLD_PIXEL,this.THRESHOLD_PIXEL,0,th_pixels);
    //左下のピックアップ領域からピクセルを得る(25-49)
    this.rectPixels(i_reader,i_raster_size,this.THRESHOLD_SAMPLE_LT,this.THRESHOLD_SAMPLE_RB,this.THRESHOLD_STEP,this.THRESHOLD_STEP,this.THRESHOLD_PIXEL,this.THRESHOLD_PIXEL,this.THRESHOLD_SAMPLE,th_pixels);
    //右上のピックアップ領域からピクセルを得る(50-74)
    this.rectPixels(i_reader,i_raster_size,this.THRESHOLD_SAMPLE_RB,this.THRESHOLD_SAMPLE_LT,this.THRESHOLD_STEP,this.THRESHOLD_STEP,this.THRESHOLD_PIXEL,this.THRESHOLD_PIXEL,this.THRESHOLD_SAMPLE*2,th_pixels);
    //右下のピックアップ領域からピクセルを得る(75-99)
    this.rectPixels(i_reader,i_raster_size,this.THRESHOLD_SAMPLE_RB,this.THRESHOLD_SAMPLE_RB,this.THRESHOLD_STEP,this.THRESHOLD_STEP,this.THRESHOLD_PIXEL,this.THRESHOLD_PIXEL,this.THRESHOLD_SAMPLE*3,th_pixels);
    var hl=this.__detectThresholdValue_hl;
    //Ptailで求めたピクセル平均
    this.getPtailHighAndLow(th_pixels,hl);
    //閾値中心
    var th=(hl.h+hl.l)/2;
    //ヒステリシス(差分の20%)
    var th_sub=(hl.h-hl.l)/5;
    o_threshold.th=th;
    o_threshold.th_h=th+th_sub;//ヒステリシス付き閾値
    o_threshold.th_l=th-th_sub;//ヒステリシス付き閾値
    //エッジを計算(明点重心)
    var lt_x,lt_y,lb_x,lb_y,rt_x,rt_y,rb_x,rb_y;
    var tpt=this.__detectThresholdValue_tpt;
    //LT
    if(this.getHighPixelCenter(0,th_pixels,this.THRESHOLD_PIXEL,this.THRESHOLD_PIXEL,th,tpt)){
      lt_x=tpt.x*this.THRESHOLD_STEP;
      lt_y=tpt.y*this.THRESHOLD_STEP;
    }else{
      lt_x=11;
      lt_y=11;
    }
    //LB
    if(this.getHighPixelCenter(this.THRESHOLD_SAMPLE*1,th_pixels,this.THRESHOLD_PIXEL,this.THRESHOLD_PIXEL,th,tpt)){
      lb_x=tpt.x*this.THRESHOLD_STEP;
      lb_y=tpt.y*this.THRESHOLD_STEP;
    }else{
      lb_x=11;
      lb_y=-1;
    }
    //RT
    if(this.getHighPixelCenter(this.THRESHOLD_SAMPLE*2,th_pixels,this.THRESHOLD_PIXEL,this.THRESHOLD_PIXEL,th,tpt)){
      rt_x=tpt.x*this.THRESHOLD_STEP;
      rt_y=tpt.y*this.THRESHOLD_STEP;
    }else{
      rt_x=-1;
      rt_y=11;
    }
    //RB
    if(this.getHighPixelCenter(this.THRESHOLD_SAMPLE*3,th_pixels,this.THRESHOLD_PIXEL,this.THRESHOLD_PIXEL,th,tpt)){
      rb_x=tpt.x*this.THRESHOLD_STEP;
      rb_y=tpt.y*this.THRESHOLD_STEP;
    }else{
      rb_x=-1;
      rb_y=-1;
    }
    //トラッキング開始位置の決定
    o_threshold.lt_x=(lt_x+lb_x)/2+this.THRESHOLD_SAMPLE_LT-1;
    o_threshold.rb_x=(rt_x+rb_x)/2+this.THRESHOLD_SAMPLE_RB+1;
    o_threshold.lt_y=(lt_y+rt_y)/2+this.THRESHOLD_SAMPLE_LT-1;
    o_threshold.rb_y=(lb_y+rb_y)/2+this.THRESHOLD_SAMPLE_RB+1;
    return;
  }
  ,getHighPixelCenter : function(i_st,i_pixels,i_width,i_height,i_th,o_point)
  {
    var rp=i_st;
    var pos_x=0;
    var pos_y=0;
    var number_of_pos=0;
    for(var i=0;i<i_height;i++){
      for(var i2=0;i2<i_width;i2++){
        if(i_pixels[rp++]>i_th){
          pos_x+=i2;
          pos_y+=i;
          number_of_pos++;
        }
      }
    }
    if(number_of_pos>0){
      pos_x/=number_of_pos;
      pos_y/=number_of_pos;
    }else{
      return false;
    }
    o_point.x=pos_x;
    o_point.y=pos_y;
    return true;
  },
  __detectDataBitsIndex_freq_index1 : new IntVector((100-(5*2))/2/*this.FRQ_POINTS*/),
  __detectDataBitsIndex_freq_index2 : new IntVector((100-(5*2))/2/*this.FRQ_POINTS*/),
  detectDataBitsIndex : function(i_reader,i_raster_size,i_th,o_index_row,o_index_col)
  {
    var i;
    //周波数を測定
    var freq_index1=this.__detectDataBitsIndex_freq_index1;
    var freq_index2=this.__detectDataBitsIndex_freq_index2;
    var lydiff = i_th.rb_y-i_th.lt_y;
    var frq_t=this.getRowFrequency(i_reader,i_raster_size,i_th.lt_y/*-0.25*this.FRQ_EDGE*/,i_th.th_h,i_th.th_l,freq_index1);
    var frq_b=this.getRowFrequency(i_reader,i_raster_size,i_th.rb_y/*-0.5*lydiff*/,i_th.th_h,i_th.th_l,freq_index2);
    //周波数はまとも？
    if((frq_t<0 && frq_b<0) || frq_t==frq_b){
      if (window.DEBUG)
        console.log('bad row frq', frq_t, frq_b)
      return -1;
    }
    //タイミングパターンからインデクスを作成
    var freq_h,freq_v;
    var index;
    if(frq_t>frq_b){
      freq_h=frq_t;
      index=freq_index1;
    }else{
      freq_h=frq_b;
      index=freq_index2;
    }
    for(i=0;i<freq_h+freq_h-1;i++){
      o_index_row[i*2]=((index[i+1]-index[i])*2/5+index[i])+this.FRQ_EDGE;
      o_index_row[i*2+1]=((index[i+1]-index[i])*3/5+index[i])+this.FRQ_EDGE;
    }
    var lxdiff = i_th.rb_x-i_th.lt_x;
    var frq_l=this.getColFrequency(i_reader,i_raster_size,i_th.lt_x/*-0.25*this.FRQ_EDGE*/,i_th.th_h,i_th.th_l,freq_index1);
    var frq_r=this.getColFrequency(i_reader,i_raster_size,i_th.rb_x/*-0.5*lxdiff*/,i_th.th_h,i_th.th_l,freq_index2);
    //周波数はまとも？
    if((frq_l<0 && frq_r<0) || frq_l==frq_r){
      if (window.DEBUG)
        console.log('bad col frq', frq_l, frq_r);
      return -1;
    }
    //タイミングパターンからインデクスを作成
    if(frq_l>frq_r){
      freq_v=frq_l;
      index=freq_index1;
    }else{
      freq_v=frq_r;
      index=freq_index2;
    }
    //同じ周期？
    if(freq_v!=freq_h){
      if (window.DEBUG)
        console.log('freq mismatch', freq_v, freq_h)
      return -1;
    }
    for(i=0;i<freq_v+freq_v-1;i++){
      var w=index[i];
      var w2= index[i + 1] - w;
      o_index_col[i*2]=((w2)*2/5+w)+this.FRQ_EDGE;
      o_index_col[i*2+1]=((w2)*3/5+w)+this.FRQ_EDGE;
    }
    //Lv4以上は無理
    if(freq_v>this.MAX_FREQ){
      if (window.DEBUG)
        console.log('too high freq', freq_v)
      return -1;
    }
    return freq_v;
  },
  __readDataBits_index_bit_x : new FloatVector(19/*MAX_DATA_BITS*/*2),
  __readDataBits_index_bit_y : new FloatVector(19/*MAX_DATA_BITS*/*2),
  previousFrames : {},
  centerPoint : new IntVector(2),
  getPreviousFrameSize : function(index_x, index_y) {
    var cx = this.centerPoint[0], cy = this.centerPoint[1];
    var pfs = this.previousFrames;
    var pf = (
      pfs[cx+":"+cy] || pfs[(cx-1)+":"+cy] || pfs[(cx+1)+":"+cy] ||
      pfs[cx+":"+(cy-1)] || pfs[(cx-1)+":"+(cy-1)] || pfs[(cx+1)+":"+(cy-1)] ||
      pfs[cx+":"+(cy+1)] || pfs[(cx-1)+":"+(cy+1)] || pfs[(cx+1)+":"+(cy+1)]
    );
    if (!pf)
      return -1;
    index_x.set(pf.index_x);
    index_y.set(pf.index_y);
    return pf.size;
  },
  setPreviousFrameSize : function(size, index_x, index_y) {
    var pf = this.previousFrames[this.centerPoint[0]+":"+this.centerPoint[1]];
    if (!pf) {
      pf = {age: 0, size: size, index_x: new FloatVector(index_x), index_y: new FloatVector(index_y)};
      this.previousFrames[this.centerPoint[0]+":"+this.centerPoint[1]] = pf;
      return;
    }
    pf.age = 0;
    pf.size = size;
    pf.index_x.set(index_x);
    pf.index_y.set(index_y);
  },
  readDataBits : function(i_reader, i_raster_size, i_th, o_bitbuffer)
  {
    var index_x=this.__readDataBits_index_bit_x;
    var index_y=this.__readDataBits_index_bit_y;
    //読み出し位置を取得
    var size=this.detectDataBitsIndex(i_reader,i_raster_size,i_th,index_x,index_y);
    if (size<0) {
      size = this.getPreviousFrameSize(index_x, index_y);
    }
    var resolution=size+size-1;
    if(size<0){
      if (window.DEBUG)
        console.log('readDataBits: size < 0');
      return false;
    }
    if(!o_bitbuffer.initEncoder(size-1)){
      if (window.DEBUG)
        console.log('readDataBits: initEncoder');
      return false;
    }
    var cpara=this._cparam;
    var ref_x=this._ref_x;
    var ref_y=this._ref_y;
    var pixcel_temp=this._pixcel_temp;
    var cpara_0=cpara[0];
    var cpara_1=cpara[1];
    var cpara_3=cpara[3];
    var cpara_6=cpara[6];
    var th=i_th.th;
    var p=0;
    for (var i = 0; i < resolution; i++) {
      var i2;
      //1列分のピクセルのインデックス値を計算する。
      var cy0=1+index_y[i*2+0];
      var cy1=1+index_y[i*2+1];
      var cpy0_12=cpara_1*cy0+cpara[2];
      var cpy0_45=cpara[4]*cy0+cpara[5];
      var cpy0_7=cpara[7]*cy0+1.0;
      var cpy1_12=cpara_1*cy1+cpara[2];
      var cpy1_45=cpara[4]*cy1+cpara[5];
      var cpy1_7=cpara[7]*cy1+1.0;
      var pt=0;
      for(i2=0;i2<resolution;i2++)
      {
        var d;
        var cx0=1+index_x[i2*2+0];
        var cx1=1+index_x[i2*2+1];
        var cp6_0=cpara_6*cx0;
        var cpx0_0=cpara_0*cx0;
        var cpx3_0=cpara_3*cx0;
        var cp6_1=cpara_6*cx1;
        var cpx0_1=cpara_0*cx1;
        var cpx3_1=cpara_3*cx1;
        d=cp6_0+cpy0_7;
        ref_x[pt]=toInt((cpx0_0+cpy0_12)/d);
        ref_y[pt]=toInt((cpx3_0+cpy0_45)/d);
        pt++;
        d=cp6_0+cpy1_7;
        ref_x[pt]=toInt((cpx0_0+cpy1_12)/d);
        ref_y[pt]=toInt((cpx3_0+cpy1_45)/d);
        pt++;
        d=cp6_1+cpy0_7;
        ref_x[pt]=toInt((cpx0_1+cpy0_12)/d);
        ref_y[pt]=toInt((cpx3_1+cpy0_45)/d);
        pt++;
        d=cp6_1+cpy1_7;
        ref_x[pt]=toInt((cpx0_1+cpy1_12)/d);
        ref_y[pt]=toInt((cpx3_1+cpy1_45)/d);
        pt++;
      }
      //1行分のピクセルを取得(場合によっては専用アクセサを書いた方がいい)
      i_reader.getPixelSet(ref_x,ref_y,resolution*4,pixcel_temp);
      //グレースケールにしながら、line→mapへの転写
      for(i2=0;i2<resolution;i2++){
        var index=i2*4;
        var pixel=(pixcel_temp[index+0]+pixcel_temp[index+1]+pixcel_temp[index+2]+pixcel_temp[index+3])/(4);
        //暗点を1、明点を0で表現します。
        o_bitbuffer.setBitByBitIndex(p,pixel>th?0:1);
        p++;
      }
    }
    this.setPreviousFrameSize(size, index_x, index_y);
    return true;
  }
  ,setSquare : function(i_vertex)
  {
    if (!this._param_gen.getParam(i_vertex,this._cparam)) {
      return false;
    }
    return true;
  }
})
MarkerPattDecoder = ASKlass('MarkerPattDecoder',
{
  decode : function(model,domain,mask)
  {
  }
})

INyIdMarkerDataEncoder = ASKlass('INyIdMarkerDataEncoder',
{
  encode : function(i_data,o_dest){},
  createDataInstance : function(){}
})
NyIdMarkerDataEncoder_RawBit = ASKlass('NyIdMarkerDataEncoder_RawBit', INyIdMarkerDataEncoder,
{
  _DOMAIN_ID : 0,
  _mod_data : new IntVector([7,31,127,511,2047,4095]),
  encode : function(i_data,o_dest)
  {
    var dest=(o_dest);
    if(i_data.ctrl_domain!=this._DOMAIN_ID){
      return false;
    }
    // calculate marker resolution (amount of data dots per side)
    var resolution_len = (i_data.model * 2 - 1); //trace("resolution", resolution_len);
    // there are (2*model-1)^2 data dots in a marker
    // and the amount of packets in a marker is
    // floor(dataDotCount / 8) + 1  (the +1 is packet 0)
    var packet_length = (((resolution_len * resolution_len)) / 8) + 1; //trace("packet", packet_length);
    var sum = 0;
    for(var i=0;i<packet_length;i++){
      dest.packet[i] = i_data.data[i]; //trace("i_data[",i,"]",i_data.data[i]);
      sum += i_data.data[i];
    }
    // data point check sum calculation
    sum = sum % this._mod_data[i_data.model - 2]; //trace("check dot", i_data.check, sum);
    // compare data point check sum with expected
    if(i_data.check!=sum){
      return false;
    }
    dest.length=packet_length;
    return true;
  }
  ,createDataInstance : function()
  {
    return new NyIdMarkerData_RawBit();
  }
})
NyIdMarkerData_RawBit = ASKlass('NyIdMarkerData_RawBit', INyIdMarkerData,
{
  packet : new IntVector(22),
  length : 0,
  isEqual : function(i_target)
  {
    var s=(i_target);
    if(s.length!=this.length){
      return false;
    }
    for(var i=s.length-1;i>=0;i--){
      if(s.packet[i]!=this.packet[i]){
        return false;
      }
    }
    return true;
  }
  ,copyFrom : function(i_source)
  {
    var s=(i_source);
    ArrayUtils.copyInt(s.packet,0,this.packet,0,s.length);
    this.length=s.length;
    return;
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */
INyARColorPatt = ASKlass('INyARColorPatt', INyARRgbRaster,
{
  /**
   * ラスタイメージからi_square部分のカラーパターンを抽出して、thisメンバに格納します。
   *
   * @param image
   * Source raster object.
   * ----
   * 抽出元のラスタオブジェクト
   * @param i_vertexs
   * Vertexes of the square. Number of element must be 4.
   * ----
   * 射影変換元の４角形を構成する頂点群頂群。要素数は4であること。
   * @return
   * True if sucessfull; otherwise false.
   * ----
   * ラスターの取得に成功するとTRUE/失敗するとFALSE
   * @throws NyARException
   */
//  public boolean pickFromRaster(INyARRgbRaster image, NyARSquare i_square) throws NyARException;
  pickFromRaster : function(image,i_vertexs){}
})
NyARColorPatt_Perspective = ASKlass('NyARColorPatt_Perspective', INyARColorPatt,
{
  _patdata : null,
  _pickup_lt : new NyARIntPoint2d(),
  _resolution : 0,
  _size : null,
  _perspective_gen : null,
  _pixelreader : null,
  LOCAL_LT : 1,
  BUFFER_FORMAT : NyARBufferType.INT1D_X8R8G8B8_32,
  initializeInstance : function(i_width,i_height,i_point_per_pix)
  {
    NyAS3Utils.assert(i_width>2 && i_height>2);
    this._resolution=i_point_per_pix;
    this._size=new NyARIntSize(i_width,i_height);
    this._patdata = new IntVector(i_height*i_width);
    this._pixelreader=new NyARRgbPixelReader_INT1D_X8R8G8B8_32(this._patdata,this._size);
    return;
  }
  /**
   * 例えば、64
   * @param i_width
   * 取得画像の解像度幅
   * @param i_height
   * 取得画像の解像度高さ
   */
  /**
   * 例えば、64
   * @param i_width
   * 取得画像の解像度幅
   * @param i_height
   * 取得画像の解像度高さ
   * @param i_point_per_pix
   * 1ピクセルあたりの縦横サンプリング数。2なら2x2=4ポイントをサンプリングする。
   * @param i_edge_percentage
   * エッジ幅の割合(ARToolKit標準と同じなら、25)
   */
  ,NyARColorPatt_Perspective : function(i_width,i_height,i_point_per_pix,i_edge_percentage)
  {
    if (i_edge_percentage == null) i_edge_percentage = -1;
    if (i_edge_percentage == -1) {
      this.initializeInstance(i_width,i_height,i_point_per_pix);
      this.setEdgeSize(0,0,i_point_per_pix);
    }else{
      //入力制限
      this.initializeInstance(i_width,i_height,i_point_per_pix);
      this.setEdgeSizeByPercent(i_edge_percentage, i_edge_percentage, i_point_per_pix);
    }
    return;
  }
  /**
   * 矩形領域のエッジサイズを指定します。
   * エッジの計算方法は以下の通りです。
   * 1.マーカ全体を(i_x_edge*2+width)x(i_y_edge*2+height)の解像度でパラメタを計算します。
   * 2.ピクセルの取得開始位置を(i_x_edge/2,i_y_edge/2)へ移動します。
   * 3.開始位置から、width x height個のピクセルを取得します。
   *
   * ARToolKit標準マーカの場合は、width/2,height/2を指定してください。
   * @param i_x_edge
   * @param i_y_edge
   */
  ,setEdgeSize : function(i_x_edge,i_y_edge,i_resolution)
  {
    NyAS3Utils.assert(i_x_edge>=0);
    NyAS3Utils.assert(i_y_edge>=0);
    //Perspectiveパラメタ計算器を作成
    this._perspective_gen=new NyARPerspectiveParamGenerator_O1(
      this.LOCAL_LT,this.LOCAL_LT,
      (i_x_edge*2+this._size.w)*i_resolution,
      (i_y_edge*2+this._size.h)*i_resolution);
    //ピックアップ開始位置を計算
    this._pickup_lt.x=i_x_edge*i_resolution+this.LOCAL_LT;
    this._pickup_lt.y=i_y_edge*i_resolution+this.LOCAL_LT;
    return;
  }
  ,setEdgeSizeByPercent : function(i_x_percent,i_y_percent,i_resolution)
  {
    NyAS3Utils.assert(i_x_percent>=0);
    NyAS3Utils.assert(i_y_percent>=0);
    this.setEdgeSize(this._size.w*i_x_percent/50,this._size.h*i_y_percent/50,i_resolution);
    return;
  }
  ,getWidth : function()
  {
    return this._size.w;
  }
  ,getHeight : function()
  {
    return this._size.h;
  }
  ,getSize : function()
  {
    return   this._size;
  }
  ,getRgbPixelReader : function()
  {
    return this._pixelreader;
  }
  ,getBuffer : function()
  {
    return this._patdata;
  }
  ,hasBuffer : function()
  {
    return this._patdata!=null;
  }
  ,wrapBuffer : function(i_ref_buf)
  {
    NyARException.notImplement();
  }
  ,getBufferType : function()
  {
    return BUFFER_FORMAT;
  }
  ,isEqualBufferType : function(i_type_value)
  {
    return BUFFER_FORMAT==i_type_value;
  },
  __pickFromRaster_rgb_tmp : new IntVector(3),
  __pickFromRaster_cpara : new FloatVector(8),
  /**
   * @see INyARColorPatt#pickFromRaster
   */
  pickFromRaster : function(image,i_vertexs)
  {
    //遠近法のパラメータを計算
    var cpara = this.__pickFromRaster_cpara;
    if (!this._perspective_gen.getParam(i_vertexs, cpara)) {
      return false;
    }
    var resolution=this._resolution;
    var img_x = image.getWidth();
    var img_y = image.getHeight();
    var res_pix=resolution*resolution;
    var rgb_tmp = this.__pickFromRaster_rgb_tmp;
    //ピクセルリーダーを取得
    var reader =image.getRgbPixelReader();
    var p=0;
    for(var iy=0;iy<this._size.h*resolution;iy+=resolution){
      //解像度分の点を取る。
      for(var ix=0;ix<this._size.w*resolution;ix+=resolution){
        var r,g,b;
        r=g=b=0;
        for(var i2y=iy;i2y<iy+resolution;i2y++){
          var cy=this._pickup_lt.y+i2y;
          for(var i2x=ix;i2x<ix+resolution;i2x++){
            //1ピクセルを作成
            var cx=this._pickup_lt.x+i2x;
            var d=cpara[6]*cx+cpara[7]*cy+1.0;
            var x=toInt((cpara[0]*cx+cpara[1]*cy+cpara[2])/d);
            var y=toInt((cpara[3]*cx+cpara[4]*cy+cpara[5])/d);
            if(x<0){x=0;}
            if(x>=img_x){x=img_x-1;}
            if(y<0){y=0;}
            if(y>=img_y){y=img_y-1;}
            reader.getPixel(x, y, rgb_tmp);
            r+=rgb_tmp[0];
            g+=rgb_tmp[1];
            b+=rgb_tmp[2];
          }
        }
        r/=res_pix;
        g/=res_pix;
        b/=res_pix;
        this._patdata[p]=((r&0xff)<<16)|((g&0xff)<<8)|((b&0xff));
        p++;
      }
    }
      //ピクセル問い合わせ
      //ピクセルセット
    return true;
  }
})
NyARColorPatt_Perspective_O2 = ASKlass('NyARColorPatt_Perspective_O2', NyARColorPatt_Perspective,
{
  _pickup : null,
  NyARColorPatt_Perspective_O2 : function(i_width,i_height,i_resolution,i_edge_percentage)
  {
    NyARColorPatt_Perspective.initialize.call(this,i_width,i_height,i_resolution,i_edge_percentage);
    switch(i_resolution){
    case 1:
      this._pickup=new NyARPickFromRaster_1(this._pickup_lt,this._size);
      break;
    case 2:
      this._pickup=new NyARPickFromRaster_2x(this._pickup_lt,this._size);
      break;
    case 4:
      this._pickup=new NyARPickFromRaster_4x(this._pickup_lt,this._size);
      break;
    default:
      this._pickup=new NyARPickFromRaster_N(this._pickup_lt,i_resolution,this._size);
    }
    return;
  }
  /**
   * @see INyARColorPatt#pickFromRaster
   */
  ,pickFromRaster : function(image ,i_vertexs)
  {
    //遠近法のパラメータを計算
    var cpara = this.__pickFromRaster_cpara;
    if (!this._perspective_gen.getParam(i_vertexs, cpara)) {
      return false;
    }
    this._pickup.pickFromRaster(cpara, image,this._patdata);
    return true;
  }
})

IpickFromRaster_Impl = ASKlass('IpickFromRaster_Impl',
{
  pickFromRaster : function(i_cpara,image,o_patt){}
})



/**
 * チェックデジット:4127936236942444153655776299710081208144715171590159116971715177917901890204024192573274828522936312731813388371037714083
 *
 */
NyARPickFromRaster_1 = ASKlass('NyARPickFromRaster_1', IpickFromRaster_Impl,
{
  _size_ref : null,
  _lt_ref : null,
  NyARPickFromRaster_1 : function(i_lt,i_source_size)
  {
    this._lt_ref=i_lt;
    this._size_ref=i_source_size;
    this._rgb_temp=new IntVector(i_source_size.w*3);
    this._rgb_px=new IntVector(i_source_size.w);
    this._rgb_py=new IntVector(i_source_size.w);
    return;
  },
  _rgb_temp : null,
  _rgb_px : null,
  _rgb_py : null,
  pickFromRaster : function(i_cpara, image, o_patt)
  {
    var d0,m0;
    var x,y;
    var img_x = image.getWidth();
    var img_y = image.getHeight();
    var patt_w=this._size_ref.w;
    var rgb_tmp = this._rgb_temp;
    var rgb_px=this._rgb_px;
    var rgb_py=this._rgb_py;
    var cp0=i_cpara[0];
    var cp3=i_cpara[3];
    var cp6=i_cpara[6];
    var cp1=i_cpara[1];
    var cp4=i_cpara[4];
    var cp7=i_cpara[7];
    var pick_y=this._lt_ref.y;
    var pick_x=this._lt_ref.x;
    //ピクセルリーダーを取得
    var reader=image.getRgbPixelReader();
    var p=0;
    var cp0cx0,cp3cx0;
    var cp1cy_cp20=cp1*pick_y+i_cpara[2]+cp0*pick_x;
    var cp4cy_cp50=cp4*pick_y+i_cpara[5]+cp3*pick_x;
    var cp7cy_10=cp7*pick_y+1.0+cp6*pick_x;
    for(var iy=this._size_ref.h-1;iy>=0;iy--){
      m0=1/(cp7cy_10);
      d0=-cp6/(cp7cy_10*(cp7cy_10+cp6));
      cp0cx0=cp1cy_cp20;
      cp3cx0=cp4cy_cp50;
      //ピックアップシーケンス
      //0番目のピクセル(検査対象)をピックアップ
      var ix;
      for(ix=patt_w-1;ix>=0;ix--){
        //1ピクセルを作成
        x=rgb_px[ix]=toInt(cp0cx0*m0);
        y=rgb_py[ix]=toInt(cp3cx0*m0);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[ix]=0;}else if(x>=img_x){rgb_px[ix]=img_x-1;}
          if(y<0){rgb_py[ix]=0;}else if(y>=img_y){rgb_py[ix]=img_y-1;}
        }
        cp0cx0+=cp0;
        cp3cx0+=cp3;
        m0+=d0;
      }
      cp1cy_cp20+=cp1;
      cp4cy_cp50+=cp4;
      cp7cy_10+=cp7;
      reader.getPixelSet(rgb_px, rgb_py,patt_w, rgb_tmp);
      for(ix=patt_w-1;ix>=0;ix--){
        var idx=ix*3;
        o_patt[p]=(rgb_tmp[idx]<<16)|(rgb_tmp[idx+1]<<8)|((rgb_tmp[idx+2]&0xff));
        p++;
      }
    }
    return;
  }
})
/*
* PROJECT: NyARToolkitAS3
* --------------------------------------------------------------------------------
* This work is based on the original ARToolKit developed by
*   Hirokazu Kato
*   Mark Billinghurst
*   HITLab, University of Washington, Seattle
* http://www.hitl.washington.edu/artoolkit/
*
* The NyARToolkitAS3 is AS3 edition ARToolKit class library.
* Copyright (C)2010 Ryo Iizuka
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* For further information please contact.
*  http://nyatla.jp/nyatoolkit/
*  <airmail(at)ebony.plala.or.jp> or <nyatla(at)nyatla.jp>
*
*/




/**
 * 2x2
 * チェックデジット:207585881161241401501892422483163713744114324414474655086016467027227327958629279571017
 *
 */
NyARPickFromRaster_2x = ASKlass('NyARPickFromRaster_2x', IpickFromRaster_Impl,
{
  _size_ref : null,
  _lt_ref : null,
  NyARPickFromRaster_2x : function(i_lt,i_source_size)
  {
    this._lt_ref=i_lt;
    this._size_ref=i_source_size;
    this._rgb_temp=new IntVector(i_source_size.w*4*3);
    this._rgb_px=new IntVector(i_source_size.w*4);
    this._rgb_py=new IntVector(i_source_size.w*4);
    return;
  },
  _rgb_temp : null,
  _rgb_px : null,
  _rgb_py : null,
  pickFromRaster : function(i_cpara,image,o_patt)
  {
    var d0,m0,d1,m1;
    var x,y;
    var img_x = image.getWidth();
    var img_y = image.getHeight();
    var patt_w=this._size_ref.w;
    var rgb_tmp = this._rgb_temp;
    var rgb_px=this._rgb_px;
    var rgb_py=this._rgb_py;
    var cp0=i_cpara[0];
    var cp3=i_cpara[3];
    var cp6=i_cpara[6];
    var cp1=i_cpara[1];
    var cp4=i_cpara[4];
    var cp7=i_cpara[7];
    var pick_y=this._lt_ref.y;
    var pick_x=this._lt_ref.x;
    //ピクセルリーダーを取得
    var reader=image.getRgbPixelReader();
    var p=0;
    var cp0cx0,cp3cx0;
    var cp1cy_cp20=cp1*pick_y+i_cpara[2]+cp0*pick_x;
    var cp4cy_cp50=cp4*pick_y+i_cpara[5]+cp3*pick_x;
    var cp7cy_10=cp7*pick_y+1.0+cp6*pick_x;
    var cp0cx1,cp3cx1;
    var cp1cy_cp21=cp1cy_cp20+cp1;
    var cp4cy_cp51=cp4cy_cp50+cp4;
    var cp7cy_11=cp7cy_10+cp7;
    var cw0=cp1+cp1;
    var cw7=cp7+cp7;
    var cw4=cp4+cp4;
    for(var iy=this._size_ref.h-1;iy>=0;iy--){
      cp0cx0=cp1cy_cp20;
      cp3cx0=cp4cy_cp50;
      cp0cx1=cp1cy_cp21;
      cp3cx1=cp4cy_cp51;
      m0=1.0/(cp7cy_10);
      d0=-cp6/(cp7cy_10*(cp7cy_10+cp6));
      m1=1.0/(cp7cy_11);
      d1=-cp6/(cp7cy_11*(cp7cy_11+cp6));
      var n=patt_w*2*2-1;
      var ix;
      for(ix=patt_w*2-1;ix>=0;ix--){
        //[n,0]
        x=rgb_px[n]=toInt(cp0cx0*m0);
        y=rgb_py[n]=toInt(cp3cx0*m0);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[n]=0;}else if(x>=img_x){rgb_px[n]=img_x-1;}
          if(y<0){rgb_py[n]=0;}else if(y>=img_y){rgb_py[n]=img_y-1;}
        }
        cp0cx0+=cp0;
        cp3cx0+=cp3;
        m0+=d0;
        n--;
        //[n,1]
        x=rgb_px[n]=toInt(cp0cx1*m1);
        y=rgb_py[n]=toInt(cp3cx1*m1);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[n]=0;}else if(x>=img_x){rgb_px[n]=img_x-1;}
          if(y<0){rgb_py[n]=0;}else if(y>=img_y){rgb_py[n]=img_y-1;}
        }
        cp0cx1+=cp0;
        cp3cx1+=cp3;
        m1+=d1;
        n--;
      }
      cp7cy_10+=cw7;
      cp7cy_11+=cw7;
      cp1cy_cp20+=cw0;
      cp4cy_cp50+=cw4;
      cp1cy_cp21+=cw0;
      cp4cy_cp51+=cw4;
      reader.getPixelSet(rgb_px, rgb_py,patt_w*4, rgb_tmp);
      for(ix=patt_w-1;ix>=0;ix--){
        var idx=ix*12;//3*2*2
        var r=(rgb_tmp[idx+0]+rgb_tmp[idx+3]+rgb_tmp[idx+6]+rgb_tmp[idx+ 9])/4;
        var g=(rgb_tmp[idx+1]+rgb_tmp[idx+4]+rgb_tmp[idx+7]+rgb_tmp[idx+10])/4;
        var b=(rgb_tmp[idx+2]+rgb_tmp[idx+5]+rgb_tmp[idx+8]+rgb_tmp[idx+11])/4;
        o_patt[p]=(r<<16)|(g<<8)|((b&0xff));
        p++;
      }
    }
    return;
  }
})
/*
* PROJECT: NyARToolkitAS3
* --------------------------------------------------------------------------------
* This work is based on the original ARToolKit developed by
*   Hirokazu Kato
*   Mark Billinghurst
*   HITLab, University of Washington, Seattle
* http://www.hitl.washington.edu/artoolkit/
*
* The NyARToolkitAS3 is AS3 edition ARToolKit class library.
* Copyright (C)2010 Ryo Iizuka
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* For further information please contact.
*  http://nyatla.jp/nyatoolkit/
*  <airmail(at)ebony.plala.or.jp> or <nyatla(at)nyatla.jp>
*
*/




/**
 * 4x4
 *
 */
NyARPickFromRaster_4x = ASKlass('NyARPickFromRaster_4x', IpickFromRaster_Impl,
{
  _size_ref : null,
  _lt_ref : null,
  NyARPickFromRaster_4x : function(i_lt,i_source_size)
  {
    this._lt_ref=i_lt;
    this._size_ref=i_source_size;
    this._rgb_temp=new IntVector(4*4*3);
    this._rgb_px=new IntVector(4*4);
    this._rgb_py=new IntVector(4*4);
    return;
  },
  _rgb_temp : null,
  _rgb_px : null,
  _rgb_py : null,
  pickFromRaster : function(i_cpara, image, o_patt)
  {
    var x,y;
    var d,m;
    var cp6cx,cp0cx,cp3cx;
    var rgb_px=this._rgb_px;
    var rgb_py=this._rgb_py;
    var r,g,b;
    //遠近法のパラメータを計算
    var img_x = image.getWidth();
    var img_y = image.getHeight();
    var rgb_tmp = this._rgb_temp;
    var cp0=i_cpara[0];
    var cp3=i_cpara[3];
    var cp6=i_cpara[6];
    var cp1=i_cpara[1];
    var cp2=i_cpara[2];
    var cp4=i_cpara[4];
    var cp5=i_cpara[5];
    var cp7=i_cpara[7];
    var pick_lt_x=this._lt_ref.x;
    //ピクセルリーダーを取得
    var reader=image.getRgbPixelReader();
    var p=0;
    var py=this._lt_ref.y;
    for(var iy=this._size_ref.h-1;iy>=0;iy--,py+=4){
      var cp1cy_cp2_0=cp1*py+cp2;
      var cp4cy_cp5_0=cp4*py+cp5;
      var cp7cy_1_0  =cp7*py+1.0;
      var cp1cy_cp2_1=cp1cy_cp2_0+cp1;
      var cp1cy_cp2_2=cp1cy_cp2_1+cp1;
      var cp1cy_cp2_3=cp1cy_cp2_2+cp1;
      var cp4cy_cp5_1=cp4cy_cp5_0+cp4;
      var cp4cy_cp5_2=cp4cy_cp5_1+cp4;
      var cp4cy_cp5_3=cp4cy_cp5_2+cp4;
      var px=pick_lt_x;
      //解像度分の点を取る。
      for(var ix=this._size_ref.w-1;ix>=0;ix--,px+=4){
        cp6cx=cp6*px;
        cp0cx=cp0*px;
        cp3cx=cp3*px;
        cp6cx+=cp7cy_1_0;
        m=1/cp6cx;
        d=-cp7/((cp6cx+cp7)*cp6cx);
        //1ピクセルを作成[0,0]
        x=rgb_px[0]=toInt((cp0cx+cp1cy_cp2_0)*m);
        y=rgb_py[0]=toInt((cp3cx+cp4cy_cp5_0)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[0]=0;} else if(x>=img_x){rgb_px[0]=img_x-1;}
          if(y<0){rgb_py[0]=0;} else if(y>=img_y){rgb_py[0]=img_y-1;}
        }
        //1ピクセルを作成[0,1]
        m+=d;
        x=rgb_px[4]=toInt((cp0cx+cp1cy_cp2_1)*m);
        y=rgb_py[4]=toInt((cp3cx+cp4cy_cp5_1)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[4]=0;}else if(x>=img_x){rgb_px[4]=img_x-1;}
          if(y<0){rgb_py[4]=0;}else if(y>=img_y){rgb_py[4]=img_y-1;}
        }
        //1ピクセルを作成[0,2]
        m+=d;
        x=rgb_px[8]=toInt((cp0cx+cp1cy_cp2_2)*m);
        y=rgb_py[8]=toInt((cp3cx+cp4cy_cp5_2)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[8]=0;}else if(x>=img_x){rgb_px[8]=img_x-1;}
          if(y<0){rgb_py[8]=0;}else if(y>=img_y){rgb_py[8]=img_y-1;}
        }
        //1ピクセルを作成[0,3]
        m+=d;
        x=rgb_px[12]=toInt((cp0cx+cp1cy_cp2_3)*m);
        y=rgb_py[12]=toInt((cp3cx+cp4cy_cp5_3)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[12]=0;}else if(x>=img_x){rgb_px[12]=img_x-1;}
          if(y<0){rgb_py[12]=0;}else if(y>=img_y){rgb_py[12]=img_y-1;}
        }
        cp6cx+=cp6;
        cp0cx+=cp0;
        cp3cx+=cp3;
        m=1/cp6cx;
        d=-cp7/((cp6cx+cp7)*cp6cx);
        //1ピクセルを作成[1,0]
        x=rgb_px[1]=toInt((cp0cx+cp1cy_cp2_0)*m);
        y=rgb_py[1]=toInt((cp3cx+cp4cy_cp5_0)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[1]=0;}else if(x>=img_x){rgb_px[1]=img_x-1;}
          if(y<0){rgb_py[1]=0;}else if(y>=img_y){rgb_py[1]=img_y-1;}
        }
        //1ピクセルを作成[1,1]
        m+=d;
        x=rgb_px[5]=toInt((cp0cx+cp1cy_cp2_1)*m);
        y=rgb_py[5]=toInt((cp3cx+cp4cy_cp5_1)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[5]=0;}else if(x>=img_x){rgb_px[5]=img_x-1;}
          if(y<0){rgb_py[5]=0;}else if(y>=img_y){rgb_py[5]=img_y-1;}
        }
        //1ピクセルを作成[1,2]
        m+=d;
        x=rgb_px[9]=toInt((cp0cx+cp1cy_cp2_2)*m);
        y=rgb_py[9]=toInt((cp3cx+cp4cy_cp5_2)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[9]=0;}else if(x>=img_x){rgb_px[9]=img_x-1;}
          if(y<0){rgb_py[9]=0;}else if(y>=img_y){rgb_py[9]=img_y-1;}
        }
        //1ピクセルを作成[1,3]
        m+=d;
        x=rgb_px[13]=toInt((cp0cx+cp1cy_cp2_3)*m);
        y=rgb_py[13]=toInt((cp3cx+cp4cy_cp5_3)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[13]=0;}else if(x>=img_x){rgb_px[13]=img_x-1;}
          if(y<0){rgb_py[13]=0;}else if(y>=img_y){rgb_py[13]=img_y-1;}
        }
        cp6cx+=cp6;
        cp0cx+=cp0;
        cp3cx+=cp3;
        m=1/cp6cx;
        d=-cp7/((cp6cx+cp7)*cp6cx);
        //1ピクセルを作成[2,0]
        x=rgb_px[2]=toInt((cp0cx+cp1cy_cp2_0)*m);
        y=rgb_py[2]=toInt((cp3cx+cp4cy_cp5_0)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[2]=0;}else if(x>=img_x){rgb_px[2]=img_x-1;}
          if(y<0){rgb_py[2]=0;}else if(y>=img_y){rgb_py[2]=img_y-1;}
        }
        //1ピクセルを作成[2,1]
        m+=d;
        x=rgb_px[6]=toInt((cp0cx+cp1cy_cp2_1)*m);
        y=rgb_py[6]=toInt((cp3cx+cp4cy_cp5_1)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[6]=0;}else if(x>=img_x){rgb_px[6]=img_x-1;}
          if(y<0){rgb_py[6]=0;}else if(y>=img_y){rgb_py[6]=img_y-1;}
        }
        //1ピクセルを作成[2,2]
        m+=d;
        x=rgb_px[10]=toInt((cp0cx+cp1cy_cp2_2)*m);
        y=rgb_py[10]=toInt((cp3cx+cp4cy_cp5_2)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[10]=0;}else if(x>=img_x){rgb_px[10]=img_x-1;}
          if(y<0){rgb_py[10]=0;}else if(y>=img_y){rgb_py[10]=img_y-1;}
        }
        //1ピクセルを作成[2,3](ここ計算ずれします。)
        m+=d;
        x=rgb_px[14]=toInt((cp0cx+cp1cy_cp2_3)*m);
        y=rgb_py[14]=toInt((cp3cx+cp4cy_cp5_3)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[14]=0;}else if(x>=img_x){rgb_px[14]=img_x-1;}
          if(y<0){rgb_py[14]=0;}else if(y>=img_y){rgb_py[14]=img_y-1;}
        }
        cp6cx+=cp6;
        cp0cx+=cp0;
        cp3cx+=cp3;
        m=1/cp6cx;
        d=-cp7/((cp6cx+cp7)*cp6cx);
        //1ピクセルを作成[3,0]
        x=rgb_px[3]=toInt((cp0cx+cp1cy_cp2_0)*m);
        y=rgb_py[3]=toInt((cp3cx+cp4cy_cp5_0)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[3]=0;}else if(x>=img_x){rgb_px[3]=img_x-1;}
          if(y<0){rgb_py[3]=0;}else if(y>=img_y){rgb_py[3]=img_y-1;}
        }
        //1ピクセルを作成[3,1]
        m+=d;
        x=rgb_px[7]=toInt((cp0cx+cp1cy_cp2_1)*m);
        y=rgb_py[7]=toInt((cp3cx+cp4cy_cp5_1)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[7]=0;}else if(x>=img_x){rgb_px[7]=img_x-1;}
          if(y<0){rgb_py[7]=0;}else if(y>=img_y){rgb_py[7]=img_y-1;}
        }
        //1ピクセルを作成[3,2]
        m+=d;
        x=rgb_px[11]=toInt((cp0cx+cp1cy_cp2_2)*m);
        y=rgb_py[11]=toInt((cp3cx+cp4cy_cp5_2)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[11]=0;}else if(x>=img_x){rgb_px[11]=img_x-1;}
          if(y<0){rgb_py[11]=0;}else if(y>=img_y){rgb_py[11]=img_y-1;}
        }
        //1ピクセルを作成[3,3]
        m+=d;
        x=rgb_px[15]=toInt((cp0cx+cp1cy_cp2_3)*m);
        y=rgb_py[15]=toInt((cp3cx+cp4cy_cp5_3)*m);
        if(x<0||x>=img_x||y<0||y>=img_y){
          if(x<0){rgb_px[15]=0;}else if(x>=img_x){rgb_px[15]=img_x-1;}
          if(y<0){rgb_py[15]=0;}else if(y>=img_y){rgb_py[15]=img_y-1;}
        }
        reader.getPixelSet(rgb_px, rgb_py,4*4, rgb_tmp);
        r=(rgb_tmp[ 0]+rgb_tmp[ 3]+rgb_tmp[ 6]+rgb_tmp[ 9]+rgb_tmp[12]+rgb_tmp[15]+rgb_tmp[18]+rgb_tmp[21]+rgb_tmp[24]+rgb_tmp[27]+rgb_tmp[30]+rgb_tmp[33]+rgb_tmp[36]+rgb_tmp[39]+rgb_tmp[42]+rgb_tmp[45])/16;
        g=(rgb_tmp[ 1]+rgb_tmp[ 4]+rgb_tmp[ 7]+rgb_tmp[10]+rgb_tmp[13]+rgb_tmp[16]+rgb_tmp[19]+rgb_tmp[22]+rgb_tmp[25]+rgb_tmp[28]+rgb_tmp[31]+rgb_tmp[34]+rgb_tmp[37]+rgb_tmp[40]+rgb_tmp[43]+rgb_tmp[46])/16;
        b=(rgb_tmp[ 2]+rgb_tmp[ 5]+rgb_tmp[ 8]+rgb_tmp[11]+rgb_tmp[14]+rgb_tmp[17]+rgb_tmp[20]+rgb_tmp[23]+rgb_tmp[26]+rgb_tmp[29]+rgb_tmp[32]+rgb_tmp[35]+rgb_tmp[38]+rgb_tmp[41]+rgb_tmp[44]+rgb_tmp[47])/16;
        o_patt[p]=((r&0xff)<<16)|((g&0xff)<<8)|((b&0xff));
        p++;
      }
    }
    return;
  }
})
/*
* PROJECT: NyARToolkitAS3
* --------------------------------------------------------------------------------
* This work is based on the original ARToolKit developed by
*   Hirokazu Kato
*   Mark Billinghurst
*   HITLab, University of Washington, Seattle
* http://www.hitl.washington.edu/artoolkit/
*
* The NyARToolkitAS3 is AS3 edition ARToolKit class library.
* Copyright (C)2010 Ryo Iizuka
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* For further information please contact.
*  http://nyatla.jp/nyatoolkit/
*  <airmail(at)ebony.plala.or.jp> or <nyatla(at)nyatla.jp>
*
*/




/**
 * 汎用ピックアップ関数
 *
 */
NyARPickFromRaster_N = ASKlass('NyARPickFromRaster_N', IpickFromRaster_Impl,
{
  _resolution : 0,
  _size_ref : null,
  _lt_ref : null,
  NyARPickFromRaster_N : function(i_lt,i_resolution,i_source_size)
  {
    this._lt_ref=i_lt;
    this._resolution=i_resolution;
    this._size_ref=i_source_size;
    this._rgb_temp=new IntVector(i_resolution*i_resolution*3);
    this._rgb_px=new IntVector(i_resolution*i_resolution);
    this._rgb_py=new IntVector(i_resolution*i_resolution);
    this._cp1cy_cp2=new FloatVector(i_resolution);
    this._cp4cy_cp5=new FloatVector(i_resolution);
    this._cp7cy_1=new FloatVector(i_resolution);
    return;
  },
  _rgb_temp : null,
  _rgb_px : null,
  _rgb_py : null,
  _cp1cy_cp2 : null,
  _cp4cy_cp5 : null,
  _cp7cy_1 : null,
  pickFromRaster : function(i_cpara,image,o_patt)
  {
    var i2x,i2y;//プライム変数
    var x,y;
    var w;
    var r,g,b;
    var resolution=this._resolution;
    var res_pix=resolution*resolution;
    var img_x = image.getWidth();
    var img_y = image.getHeight();
    var rgb_tmp = this._rgb_temp;
    var rgb_px=this._rgb_px;
    var rgb_py=this._rgb_py;
    var cp1cy_cp2=this._cp1cy_cp2;
    var cp4cy_cp5=this._cp4cy_cp5;
    var cp7cy_1=this._cp7cy_1;
    var cp0=i_cpara[0];
    var cp3=i_cpara[3];
    var cp6=i_cpara[6];
    var cp1=i_cpara[1];
    var cp2=i_cpara[2];
    var cp4=i_cpara[4];
    var cp5=i_cpara[5];
    var cp7=i_cpara[7];
    var pick_y=this._lt_ref.y;
    var pick_x=this._lt_ref.x;
    //ピクセルリーダーを取得
    var reader=image.getRgbPixelReader();
    var p=0;
    for(var iy=0;iy<this._size_ref.h*resolution;iy+=resolution){
      w=pick_y+iy;
      cp1cy_cp2[0]=cp1*w+cp2;
      cp4cy_cp5[0]=cp4*w+cp5;
      cp7cy_1[0]=cp7*w+1.0;
      for(i2y=1;i2y<resolution;i2y++){
        cp1cy_cp2[i2y]=cp1cy_cp2[i2y-1]+cp1;
        cp4cy_cp5[i2y]=cp4cy_cp5[i2y-1]+cp4;
        cp7cy_1[i2y]=cp7cy_1[i2y-1]+cp7;
      }
      //解像度分の点を取る。
      for(var ix=0;ix<this._size_ref.w*resolution;ix+=resolution){
        var n=0;
        w=pick_x+ix;
        for(i2y=resolution-1;i2y>=0;i2y--){
          var cp0cx=cp0*w+cp1cy_cp2[i2y];
          var cp6cx=cp6*w+cp7cy_1[i2y];
          var cp3cx=cp3*w+cp4cy_cp5[i2y];
          var m=1/(cp6cx);
          var d=-cp6/(cp6cx*(cp6cx+cp6));
          var m2=cp0cx*m;
          var m3=cp3cx*m;
          var d2=cp0cx*d+cp0*(m+d);
          var d3=cp3cx*d+cp3*(m+d);
          for(i2x=resolution-1;i2x>=0;i2x--){
            //1ピクセルを作成
            x=rgb_px[n]=toInt(m2);
            y=rgb_py[n]=toInt(m3);
            if(x<0||x>=img_x||y<0||y>=img_y){
              if(x<0){rgb_px[n]=0;}else if(x>=img_x){rgb_px[n]=img_x-1;}
              if(y<0){rgb_py[n]=0;}else if(y>=img_y){rgb_py[n]=img_y-1;}
            }
            n++;
            m2+=d2;
            m3+=d3;
          }
        }
        reader.getPixelSet(rgb_px, rgb_py,res_pix, rgb_tmp);
        r=g=b=0;
        for(var i=res_pix*3-1;i>0;){
          b+=rgb_tmp[i--];
          g+=rgb_tmp[i--];
          r+=rgb_tmp[i--];
        }
        r/=res_pix;
        g/=res_pix;
        b/=res_pix;
        o_patt[p]=((r&0xff)<<16)|((g&0xff)<<8)|((b&0xff));
        p++;
      }
    }
    return;
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */

/**
 * このクラスは、同時に１個のマーカを処理することのできる、アプリケーションプロセッサです。
 * マーカの出現・移動・消滅を、イベントで通知することができます。
 * クラスには複数のマーカを登録できます。一つのマーカが見つかると、プロセッサは継続して同じマーカを
 * １つだけ認識し続け、見失うまでの間は他のマーカを認識しません。
 *
 * イベントは、 OnEnter→OnUpdate[n]→OnLeaveの順で発生します。
 * マーカが見つかるとまずOnEnterが１度発生して、何番のマーカが発見されたかがわかります。
 * 次にOnUpdateにより、現在の変換行列が連続して渡されます。最後にマーカを見失うと、OnLeave
 * イベントが発生します。
 *
 */
FLSingleARMarkerProcesser = ASKlass('FLSingleARMarkerProcesser',
{
  /**オーナーが自由に使えるタグ変数です。
   */
  tag : null
  ,_lost_delay_count : 0
  ,_lost_delay : 5
  ,_square_detect : null
  ,_transmat : null
  ,_offset : null
  ,_threshold : 110
  // [AR]検出結果の保存用
  ,_bin_raster : null
  ,_tobin_filter : null
  ,_current_arcode_index : -1
  ,_threshold_detect : null
  ,FLSingleARMarkerProcesser : function()
  {
    return;
  }
  ,_initialized : false
  ,initInstance : function(i_param)
  {
    //初期化済？
    NyAS3Utils.assert(this._initialized==false);
    var scr_size = i_param.getScreenSize();
    // 解析オブジェクトを作る
    this._square_detect = new FLARSquareContourDetector(scr_size);
    this._transmat = new NyARTransMat(i_param);
    this._tobin_filter=new FLARRasterFilter_Threshold(110);
    // ２値画像バッファを作る
    this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h);
    this._threshold_detect=new FLARRasterThresholdAnalyzer_SlidePTile(15,4);
    this._initialized=true;
    //コールバックハンドラ
    this._detectmarker_cb=new FLARDetectSquareCB_1(i_param);
    this._offset=new NyARRectOffset();
    return;
  }
  /*自動・手動の設定が出来ないので、コメントアウト
  public void setThreshold(int i_threshold)
  {
    this._threshold = i_threshold;
    return;
  }*/
  /**検出するマーカコードの配列を指定します。 検出状態でこの関数を実行すると、
   * オブジェクト状態に強制リセットがかかります。
   */
  ,setARCodeTable : function(i_ref_code_table,i_code_resolution,i_marker_width)
  {
    if (this._current_arcode_index != -1) {
      // 強制リセット
      this.reset(true);
    }
    //検出するマーカセット、情報、検出器を作り直す。(1ピクセル4ポイントサンプリング,マーカのパターン領域は50%)
    this._detectmarker_cb.setNyARCodeTable(i_ref_code_table,i_code_resolution);
    this._offset.setSquare(i_marker_width);
    return;
  }
  ,reset : function(i_is_force)
  {
    if (this._current_arcode_index != -1 && i_is_force == false) {
      // 強制書き換えでなければイベントコール
      this.onLeaveHandler();
    }
    // カレントマーカをリセット
    this._current_arcode_index = -1;
    return;
  }
  ,_detectmarker_cb : null
  ,detectMarker : function(i_raster)
  {
    // サイズチェック
    NyAS3Utils.assert(this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h));
    //BINイメージへの変換
    this._tobin_filter.setThreshold(this._threshold);
    this._tobin_filter.doFilter(i_raster, this._bin_raster);
    // スクエアコードを探す
    this._detectmarker_cb.init(i_raster,this._current_arcode_index);
    this._square_detect.detectMarkerCB(this._bin_raster,this._detectmarker_cb);
    // 認識状態を更新
    var is_id_found=updateStatus(this._detectmarker_cb.square,this._detectmarker_cb.code_index);
    //閾値フィードバック(detectExistMarkerにもあるよ)
    if(!is_id_found){
      //マーカがなければ、探索+DualPTailで基準輝度検索
      var th=this._threshold_detect.analyzeRaster(i_raster);
      this._threshold=(this._threshold+th)/2;
    }
    return;
  }
  /**
   *
   * @param i_new_detect_cf
   * @param i_exist_detect_cf
   */
  ,setConfidenceThreshold : function(i_new_cf,i_exist_cf)
  {
    this._detectmarker_cb.cf_threshold_exist=i_exist_cf;
    this._detectmarker_cb.cf_threshold_new=i_new_cf;
  }
  ,__NyARSquare_result : new FLARTransMatResult()
  /**  オブジェクトのステータスを更新し、必要に応じてハンドル関数を駆動します。
   *   戻り値は、「実際にマーカを発見する事ができたか」です。クラスの状態とは異なります。
   */
  ,updateStatus : function(i_square,i_code_index)
  {
    var result = this.__NyARSquare_result;
    if (this._current_arcode_index < 0) {// 未認識中
      if (i_code_index < 0) {// 未認識から未認識の遷移
        // なにもしないよーん。
        return false;
      } else {// 未認識から認識の遷移
        this._current_arcode_index = i_code_index;
        // イベント生成
        // OnEnter
        this.onEnterHandler(i_code_index);
        // 変換行列を作成
        this._transmat.transMat(i_square, this._offset, result);
        // OnUpdate
        this.onUpdateHandler(i_square, result);
        this._lost_delay_count = 0;
        return true;
      }
    } else {// 認識中
      if (i_code_index < 0) {// 認識から未認識の遷移
        this._lost_delay_count++;
        if (this._lost_delay < this._lost_delay_count) {
          // OnLeave
          this._current_arcode_index = -1;
          this.onLeaveHandler();
        }
        return false;
      } else if (i_code_index == this._current_arcode_index) {// 同じARCodeの再認識
        // イベント生成
        // 変換行列を作成
        this._transmat.transMat(i_square, this._offset, result);
        // OnUpdate
        this.onUpdateHandler(i_square, result);
        this._lost_delay_count = 0;
        return true;
      } else {// 異なるコードの認識→今はサポートしない。
        throw new  NyARException();
      }
    }
  }
  ,onEnterHandler : function(i_code)
  {
    throw new NyARException("onEnterHandler not implemented.");
  }
  ,onLeaveHandler : function()
  {
    throw new NyARException("onLeaveHandler not implemented.");
  }
  ,onUpdateHandler : function(i_square, result)
  {
    throw new NyARException("onUpdateHandler not implemented.");
  }
})

/**
 * detectMarkerのコールバック関数
 */
FLARDetectSquareCB_1 = ASKlass('DetectSquareCB',
{
  //公開プロパティ
  square : new FLARSquare()
  ,confidence : 0.0
  ,code_index : -1
  ,cf_threshold_new : 0.50
  ,cf_threshold_exist : 0.30
  //参照
  ,_ref_raster : null
  //所有インスタンス
  ,_inst_patt : null
  ,_deviation_data : null
  ,_match_patt : null
  ,__detectMarkerLite_mr : new NyARMatchPattResult()
  ,_coordline : null
  ,DetectSquareCB : function(i_param)
  {
    this._match_patt=null;
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    return;
  }
  ,setNyARCodeTable : function(i_ref_code,i_code_resolution)
  {
    /*unmanagedで実装するときは、ここでリソース解放をすること。*/
    this._deviation_data=new NyARMatchPattDeviationColorData(i_code_resolution,i_code_resolution);
    this._inst_patt=new NyARColorPatt_Perspective_O2(i_code_resolution,i_code_resolution,4,25);
    this._match_patt = new Array(i_ref_code.length);
    for(var i=0;i<i_ref_code.length;i++){
      this._match_patt[i]=new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[i]);
    }
  }
  ,__tmp_vertex : NyARIntPoint2d.createArray(4)
  ,_target_id : 0
  /**
  * Initialize call back handler.
  */
  ,init : function(i_raster,i_target_id)
  {
    this._ref_raster=i_raster;
    this._target_id=i_target_id;
    this.code_index=-1;
    this.confidence = Number.MIN_VALUE;
  }
  /**
  * 矩形が見付かるたびに呼び出されます。
  * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
  */
  ,onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num,i_vertex_index)
  {
    if (this._match_patt==null) {
      return;
    }
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    //画像を取得
    if (!this._inst_patt.pickFromRaster(this._ref_raster,vertex)){
      return;//取得失敗
    }
    //取得パターンをカラー差分データに変換して評価する。
    this._deviation_data.setRaster(this._inst_patt);
    //code_index,dir,c1にデータを得る。
    var mr=this.__detectMarkerLite_mr;
    var lcode_index = 0;
    var dir = 0;
    var c1 = 0;
    var i;
    for (i = 0; i < this._match_patt.length; i++) {
      this._match_patt[i].evaluate(this._deviation_data,mr);
      var c2 = mr.confidence;
      if (c1 < c2) {
        lcode_index = i;
        c1 = c2;
        dir = mr.direction;
      }
    }
    //認識処理
    if (this._target_id == -1) { // マーカ未認識
      //現在は未認識
      if (c1 < this.cf_threshold_new) {
        return;
      }
      if (this.confidence > c1) {
        // 一致度が低い。
        return;
      }
      //認識しているマーカIDを保存
      this.code_index=lcode_index;
    }else{
      //現在はマーカ認識中
      // 現在のマーカを認識したか？
      if (lcode_index != this._target_id) {
        // 認識中のマーカではないので無視
        return;
      }
      //認識中の閾値より大きいか？
      if (c1 < this.cf_threshold_exist) {
        return;
      }
      //現在の候補よりも一致度は大きいか？
      if (this.confidence>c1) {
        return;
      }
      this.code_index=this._target_id;
    }
    //新しく認識、または継続認識中に更新があったときだけ、Square情報を更新する。
    //ココから先はこの条件でしか実行されない。
    //一致率の高い矩形があれば、方位を考慮して頂点情報を作成
    this.confidence=c1;
    var sq=this.square;
    //directionを考慮して、squareを更新する。
    for(i=0;i<4;i++){
      var idx=(i+4 - dir) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i = 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
  }
})

FLSingleNyIdMarkerProcesser = ASKlass('FLSingleNyIdMarkerProcesser',
{
  /**
   * オーナーが自由に使えるタグ変数です。
   */
  tag : null
  /**
   * ロスト遅延の管理
   */
  ,_lost_delay_count : 0
  ,_lost_delay : 5
  ,_square_detect : null
  ,_transmat : null
  ,_offset : null
  ,_is_active : null
  ,_current_threshold : 110
  // [AR]検出結果の保存用
  ,_bin_raster : null
  ,_tobin_filter : null
  ,_callback : null
  ,_data_current : null
  ,FLSingleNyIdMarkerProcesser : function()
  {
    return;
  }
  ,_initialized : false
  ,initInstance : function(i_param, i_encoder ,i_marker_width)
  {
    //初期化済？
    NyAS3Utils.assert(this._initialized==false);
    var scr_size = i_param.getScreenSize();
    // 解析オブジェクトを作る
    this._square_detect = new FLARSquareContourDetector(scr_size);
    this._transmat = new NyARTransMat(i_param);
    this._callback=new FLARDetectSquareCB_2(i_param,i_encoder);
    // ２値画像バッファを作る
    this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h);
    //ワーク用のデータオブジェクトを２個作る
    this._data_current=i_encoder.createDataInstance();
    this._tobin_filter =new FLARRasterFilter_Threshold(110);
    this._threshold_detect=new FLARRasterThresholdAnalyzer_SlidePTile(15,4);
    this._initialized=true;
    this._is_active=false;
    this._offset = new NyARRectOffset();
    this._offset.setSquare(i_marker_width);
    return;
  }
  ,setMarkerWidth : function(i_width)
  {
    this._offset.setSquare(i_width);
    return;
  }
  ,reset : function(i_is_force)
  {
    if (i_is_force == false && this._is_active){
      // 強制書き換えでなければイベントコール
      this.onLeaveHandler();
    }
    //マーカ無効
    this._is_active=false;
    return;
  }
  ,detectMarker : function(i_raster)
  {
    // サイズチェック
    if (!this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h)) {
      throw new NyARException();
    }
    // ラスタを２値イメージに変換する.
    this._tobin_filter.setThreshold(this._current_threshold);
    this._tobin_filter.doFilter(i_raster, this._bin_raster);
    // スクエアコードを探す(第二引数に指定したマーカ、もしくは新しいマーカを探す。)
    this._callback.init(i_raster,this._is_active?this._data_current:null);
    this._square_detect.detectMarkerCB(this._bin_raster, this._callback);
    // 認識状態を更新(マーカを発見したなら、current_dataを渡すかんじ)
    var is_id_found=updateStatus(this._callback.square,this._callback.marker_data);
    //閾値フィードバック(detectExistMarkerにもあるよ)
    if(is_id_found){
      //マーカがあれば、マーカの周辺閾値を反映
      this._current_threshold=(this._current_threshold+this._callback.threshold)/2;
    }else{
      //マーカがなければ、探索+DualPTailで基準輝度検索
      var th=this._threshold_detect.analyzeRaster(i_raster);
      this._current_threshold=(this._current_threshold+th)/2;
    }
    return;
  }
  ,_threshold_detect : null
  ,__NyARSquare_result : new FLARTransMatResult()
  /**オブジェクトのステータスを更新し、必要に応じてハンドル関数を駆動します。
   */
  ,updateStatus : function(i_square,i_marker_data)
  {
    var is_id_found=false;
    var result = this.__NyARSquare_result;
    if (!this._is_active) {// 未認識中
      if (i_marker_data==null) {// 未認識から未認識の遷移
        // なにもしないよーん。
        this._is_active=false;
      } else {// 未認識から認識の遷移
        this._data_current.copyFrom(i_marker_data);
        // イベント生成
        // OnEnter
        this.onEnterHandler(this._data_current);
        // 変換行列を作成
        this._transmat.transMat(i_square, this._offset, result);
        // OnUpdate
        this.onUpdateHandler(i_square, result);
        this._lost_delay_count = 0;
        this._is_active=true;
        is_id_found=true;
      }
    } else {// 認識中
      if (i_marker_data==null) {
        // 認識から未認識の遷移
        this._lost_delay_count++;
        if (this._lost_delay < this._lost_delay_count) {
          // OnLeave
          this.onLeaveHandler();
          this._is_active=false;
        }
      } else if(this._data_current.isEqual(i_marker_data)) {
        //同じidの再認識
        this._transmat.transMatContinue(i_square, this._offset, result);
        // OnUpdate
        this.onUpdateHandler(i_square, result);
        this._lost_delay_count = 0;
        is_id_found=true;
      } else {// 異なるコードの認識→今はサポートしない。
        throw new  NyARException();
      }
    }
    return is_id_found;
  }
  //通知ハンドラ
  ,onEnterHandler : function(i_code)
  {
    throw new NyARException("onEnterHandler not implemented.");
  }
  ,onLeaveHandler : function()
  {
    throw new NyARException("onLeaveHandler not implemented.");
  }
  ,onUpdateHandler : function(i_square, result)
  {
    throw new NyARException("onUpdateHandler not implemented.");
  }
})














/**
 * detectMarkerのコールバック関数
 */
FLARDetectSquareCB_2 = ASKlass('DetectSquareCB',
{
  //公開プロパティ
  square : new FLARSquare()
  ,marker_data : null
  ,threshold : 0
  //参照
  ,_ref_raster : null
  //所有インスタンス
  ,_current_data : null
  ,_id_pickup : new NyIdMarkerPickup()
  ,_coordline : null
  ,_encoder : null
  ,_data_temp : null
  ,_prev_data : null
  ,DetectSquareCB : function(i_param,i_encoder)
  {
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    this._data_temp=i_encoder.createDataInstance();
    this._current_data=i_encoder.createDataInstance();
    this._encoder=i_encoder;
    return;
  }
  ,__tmp_vertex : NyARIntPoint2d.createArray(4)
  /**
  * Initialize call back handler.
  */
  ,init : function(i_raster,i_prev_data)
  {
    this.marker_data=null;
    this._prev_data=i_prev_data;
    this._ref_raster=i_raster;
  }
  ,_marker_param : new NyIdMarkerParam()
  ,_marker_data : new NyIdMarkerPattern()
  /**
  * 矩形が見付かるたびに呼び出されます。
  * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
  */
  ,onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num,i_vertex_index)
  {
    //既に発見済なら終了
    if(this.marker_data!=null){
      return;
    }
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    var param=this._marker_param;
    var patt_data=this._marker_data;
    // 評価基準になるパターンをイメージから切り出す
    if (!this._id_pickup.pickFromRaster(this._ref_raster,vertex, patt_data, param)){
      return;
    }
    //エンコード
    if(!this._encoder.encode(patt_data,this._data_temp)){
      return;
    }
    //継続認識要求されている？
    if (this._prev_data==null){
      //継続認識要求なし
      this._current_data.copyFrom(this._data_temp);
    }else{
      //継続認識要求あり
      if(!this._prev_data.isEqual((this._data_temp))){
        return;//認識請求のあったIDと違う。
      }
    }
    //新しく認識、または継続認識中に更新があったときだけ、Square情報を更新する。
    //ココから先はこの条件でしか実行されない。
    var sq=this.square;
    //directionを考慮して、squareを更新する。
    var i;
    for(i=0;i<4;i++){
      var idx=(i+4 - param.direction) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i= 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
    this.threshold=param.threshold;
    this.marker_data=this._current_data;//みつかった。
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */
NyARCustomSingleDetectMarker = ASKlass('NyARCustomSingleDetectMarker',
{
  _is_continue : false,
  _square_detect : null,
  _transmat : null,
  //画処理用
  _bin_raster : null,
  _tobin_filter : null,
  _detect_cb : null,
  _offset : null,
  NyARCustomSingleDetectMarker : function()
  {
    return;
  }
  ,initInstance : function(
    i_patt_inst,
    i_sqdetect_inst,
    i_transmat_inst,
    i_filter,
    i_ref_param,
    i_ref_code,
    i_marker_width)
  {
    var scr_size=i_ref_param.getScreenSize();
    // 解析オブジェクトを作る
    this._square_detect = i_sqdetect_inst;
    this._transmat = i_transmat_inst;
    this._tobin_filter=i_filter;
    //２値画像バッファを作る
    this._bin_raster=new NyARBinRaster(scr_size.w,scr_size.h);
    //_detect_cb
    this._detect_cb=new DetectSquareCB_3(i_patt_inst,i_ref_code,i_ref_param);
    //オフセットを作成
    this._offset=new NyARRectOffset();
    this._offset.setSquare(i_marker_width);
    return;
  }
  /**
   * i_imageにマーカー検出処理を実行し、結果を記録します。
   *
   * @param i_raster
   * マーカーを検出するイメージを指定します。イメージサイズは、カメラパラメータ
   * と一致していなければなりません。
   * @return マーカーが検出できたかを真偽値で返します。
   * @throws NyARException
   */
  ,detectMarkerLiteB : function(i_raster)    {
    //サイズチェック
    if(!this._bin_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize())){
      throw new NyARException();
    }
    //ラスタを２値イメージに変換する.
    this._tobin_filter.doFilter(i_raster,this._bin_raster);
    //コールバックハンドラの準備
    this._detect_cb.init(i_raster);
    //矩形を探す(戻り値はコールバック関数で受け取る。)
    this._square_detect.detectMarkerCB(this._bin_raster,_detect_cb);
    if(this._detect_cb.confidence==0){
      return false;
    }
    return true;
  }
  /**
   * 検出したマーカーの変換行列を計算して、o_resultへ値を返します。
   * 直前に実行したdetectMarkerLiteが成功していないと使えません。
   *
   * @param o_result
   * 変換行列を受け取るオブジェクトを指定します。
   * @throws NyARException
   */
  ,getTransmationMatrix : function(o_result)
  {
    // 一番一致したマーカーの位置とかその辺を計算
    if (this._is_continue) {
      this._transmat.transMatContinue(this._detect_cb.square,this._offset, o_result);
    } else {
      this._transmat.transMat(this._detect_cb.square,this._offset, o_result);
    }
    return;
  }
  /**
   * 現在の矩形を返します。
   * @return
   */
  ,refSquare : function()
  {
    return this._detect_cb.square;
  }
  /**
   * 検出したマーカーの一致度を返します。
   *
   * @return マーカーの一致度を返します。0～1までの値をとります。 一致度が低い場合には、誤認識の可能性が高くなります。
   * @throws NyARException
   */
  ,getConfidence : function()
  {
    return this._detect_cb.confidence;
  }
  /**
   * getTransmationMatrixの計算モードを設定します。 初期値はTRUEです。
   *
   * @param i_is_continue
   * TRUEなら、transMatCont互換の計算をします。 FALSEなら、transMat互換の計算をします。
   */
  ,setContinueMode : function(i_is_continue)
  {
    this._is_continue = i_is_continue;
  }
})










/**
 * detectMarkerのコールバック関数
 */
DetectSquareCB_3 = ASKlass('DetectSquareCB', NyARSquareContourDetector_IDetectMarkerCallback,
{
  //公開プロパティ
  confidence : 0,
  square : new NyARSquare(),
  //参照インスタンス
  _ref_raster : null,
  //所有インスタンス
  _inst_patt : null,
  _deviation_data : null,
  _match_patt : null,
  __detectMarkerLite_mr : new NyARMatchPattResult(),
  _coordline : null,
  DetectSquareCB : function(i_inst_patt,i_ref_code,i_param)
  {
    this._inst_patt=i_inst_patt;
    this._deviation_data=new NyARMatchPattDeviationColorData(i_ref_code.getWidth(),i_ref_code.getHeight());
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    this._match_patt=new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code);
    return;
  },
  __tmp_vertex : NyARIntPoint2d.createArray(4),
  /**
  * 矩形が見付かるたびに呼び出されます。
  * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
  */
  onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num,i_vertex_index)
  {
    var i;
    var mr=this.__detectMarkerLite_mr;
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    //画像を取得
    if (!this._inst_patt.pickFromRaster(this._ref_raster,vertex)){
      return;
    }
    //取得パターンをカラー差分データに変換して評価する。
    this._deviation_data.setRaster(this._inst_patt);
    if(!this._match_patt.evaluate(this._deviation_data,mr)){
      return;
    }
    //現在の一致率より低ければ終了
    if (this.confidence > mr.confidence){
      return;
    }
    //一致率の高い矩形があれば、方位を考慮して頂点情報を作成
    var sq=this.square;
    this.confidence = mr.confidence;
    //directionを考慮して、squareを更新する。
    for(i=0;i<4;i++){
      var idx=(i+4 - mr.direction) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i = 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
  }
  ,init : function(i_raster)
  {
    this.confidence=0;
    this._ref_raster=i_raster;
  }
})










/**
 * 複数のマーカーを検出し、それぞれに最も一致するARコードを、コンストラクタで登録したARコードから 探すクラスです。最大300個を認識しますが、ゴミラベルを認識したりするので100個程度が限界です。
 *
 */
NyARDetectMarker = ASKlass('NyARDetectMarker',
{
  _detect_cb : null,
  AR_SQUARE_MAX : 300,
  _is_continue : false,
  _square_detect : null,
  _transmat : null,
  _offset : null,
  /**
   * 複数のマーカーを検出し、最も一致するARCodeをi_codeから検索するオブジェクトを作ります。
   *
   * @param i_param
   * カメラパラメータを指定します。
   * @param i_code
   * 検出するマーカーのARCode配列を指定します。
   * 配列要素のインデックス番号が、そのままgetARCodeIndex関数で得られるARCodeインデックスになります。
   * 例えば、要素[1]のARCodeに一致したマーカーである場合は、getARCodeIndexは1を返します。
   * @param i_marker_width
   * i_codeのマーカーサイズをミリメートルで指定した配列を指定します。 先頭からi_number_of_code個の要素には、有効な値を指定する必要があります。
   * @param i_number_of_code
   * i_codeに含まれる、ARCodeの数を指定します。
   * @param i_input_raster_type
   * 入力ラスタのピクセルタイプを指定します。この値は、INyARBufferReaderインタフェイスのgetBufferTypeの戻り値を指定します。
   * @throws NyARException
   */
  NyARDetectMarker : function(i_param, i_code, i_marker_width, i_number_of_code, i_input_raster_type)
  {
    this.initInstance(i_param,i_code,i_marker_width,i_number_of_code,i_input_raster_type);
    return;
  }
  ,initInstance : function(
    i_ref_param,
    i_ref_code,
    i_marker_width,
    i_number_of_code,
    i_input_raster_type)
  {
    var scr_size=i_ref_param.getScreenSize();
    // 解析オブジェクトを作る
    var cw = i_ref_code[0].getWidth();
    var ch = i_ref_code[0].getHeight();
    //detectMarkerのコールバック関数
    this._detect_cb=new NyARDetectSquareCB(
      new NyARColorPatt_Perspective_O2(cw, ch,4,25),
      i_ref_code,i_number_of_code,i_ref_param);
    this._transmat = new NyARTransMat(i_ref_param);
    //NyARToolkitプロファイル
    this._square_detect =new NyARSquareContourDetector_Rle(i_ref_param.getScreenSize());
    this._tobin_filter=new NyARRasterFilter_ARToolkitThreshold(100,i_input_raster_type);
    //実サイズ保存
    this._offset = NyARRectOffset.createArray(i_number_of_code);
    for(var i=0;i<i_number_of_code;i++){
      this._offset[i].setSquare(i_marker_width[i]);
    }
    //２値画像バッファを作る
    this._bin_raster=new NyARBinRaster(scr_size.w,scr_size.h);
    return;
  },
  _bin_raster : null,
  _tobin_filter : null,
  /**
   * i_imageにマーカー検出処理を実行し、結果を記録します。
   *
   * @param i_raster
   * マーカーを検出するイメージを指定します。
   * @param i_thresh
   * 検出閾値を指定します。0～255の範囲で指定してください。 通常は100～130くらいを指定します。
   * @return 見つかったマーカーの数を返します。 マーカーが見つからない場合は0を返します。
   * @throws NyARException
   */
  detectMarkerLite : function(i_raster,i_threshold)
  {
    // サイズチェック
    if (!this._bin_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize())) {
      throw new NyARException();
    }
    // ラスタを２値イメージに変換する.
    (NyARRasterFilter_ARToolkitThreshold(this._tobin_filter)).setThreshold(i_threshold);
    this._tobin_filter.doFilter(i_raster, this._bin_raster);
    //detect
    this._detect_cb.init(i_raster);
    this._square_detect.detectMarkerCB(this._bin_raster,this._detect_cb);
    //見付かった数を返す。
    return this._detect_cb.result_stack.getLength();
  }
  /**
   * i_indexのマーカーに対する変換行列を計算し、結果値をo_resultへ格納します。 直前に実行したdetectMarkerLiteが成功していないと使えません。
   *
   * @param i_index
   * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
   * @param o_result
   * 結果値を受け取るオブジェクトを指定してください。
   * @throws NyARException
   */
  ,getTransmationMatrix : function(i_index, o_result)
  {
    var result = this._detect_cb.result_stack.getItem(i_index);
    // 一番一致したマーカーの位置とかその辺を計算
    if (_is_continue) {
      _transmat.transMatContinue(result.square, this._offset[result.arcode_id], o_result);
    } else {
      _transmat.transMat(result.square, this._offset[result.arcode_id], o_result);
    }
    return;
  }
  /**
   * i_indexのマーカーの一致度を返します。
   *
   * @param i_index
   * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
   * @return マーカーの一致度を返します。0～1までの値をとります。 一致度が低い場合には、誤認識の可能性が高くなります。
   * @throws NyARException
   */
  ,getConfidence : function(i_index)
  {
    return this._detect_cb.result_stack.getItem(i_index).confidence;
  }
  /**
   * i_indexのマーカーのARCodeインデックスを返します。
   *
   * @param i_index
   * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
   * @return
   */
  ,getARCodeIndex : function(i_index)
  {
    return this._detect_cb.result_stack.getItem(i_index).arcode_id;
  }
  /**
   * getTransmationMatrixの計算モードを設定します。
   *
   * @param i_is_continue
   * TRUEなら、transMatContinueを使用します。 FALSEなら、transMatを使用します。
   */
  ,setContinueMode : function(i_is_continue)
  {
    this._is_continue = i_is_continue;
  }
})

NyARDetectMarkerResult = ASKlass('NyARDetectMarkerResult',
{
  arcode_id : 0,
  confidence : 0,
  square : new NyARSquare()
})

NyARDetectMarkerResultStack = ASKlass('NyARDetectMarkerResultStack ', NyARObjectStack,
{
  NyARDetectMarkerResultStack : function(i_length)
  {
    NyARObjectStack.initialize.call(this, i_length);
  }
  ,createArray : function(i_length)
  {
    var ret= new Array(i_length);
    for (var i =0; i < i_length; i++){
      ret[i] = new NyARDetectMarkerResult();
    }
    return (ret);
  }
})














NyARDetectSquareCB = ASKlass('NyARDetectSquareCB ', NyARSquareContourDetector_IDetectMarkerCallback,
{
  //公開プロパティ
  result_stack : new NyARDetectMarkerResultStack(NyARDetectMarker.AR_SQUARE_MAX),
  //参照インスタンス
  _ref_raster : null,
  //所有インスタンス
  _inst_patt : null,
  _deviation_data : null,
  _match_patt : null,
  __detectMarkerLite_mr : new NyARMatchPattResult(),
  _coordline : null,
  NyARDetectSquareCB : function(i_inst_patt, i_ref_code, i_num_of_code, i_param)
  {
    var cw = i_ref_code[0].getWidth();
    var ch = i_ref_code[0].getHeight();
    this._inst_patt=i_inst_patt;
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    this._deviation_data=new NyARMatchPattDeviationColorData(cw,ch);
    //NyARMatchPatt_Color_WITHOUT_PCA[]の作成
    this._match_patt=new Array(i_num_of_code);
    this._match_patt[0]=new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[0]);
    for (var i = 1; i < i_num_of_code; i++){
      //解像度チェック
      if (cw != i_ref_code[i].getWidth() || ch != i_ref_code[i].getHeight()) {
        throw new NyARException();
      }
      this._match_patt[i]=new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[i]);
    }
    return;
  },
  __tmp_vertex : NyARIntPoint2d.createArray(4),
  /**
   * 矩形が見付かるたびに呼び出されます。
   * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
   */
  onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num ,i_vertex_index)
  {
    var mr=this.__detectMarkerLite_mr;
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    //画像を取得
    if (!this._inst_patt.pickFromRaster(this._ref_raster,vertex)){
      return;
    }
    //取得パターンをカラー差分データに変換して評価する。
    this._deviation_data.setRaster(this._inst_patt);
    //最も一致するパターンを割り当てる。
    var square_index,direction;
    var confidence;
    this._match_patt[0].evaluate(this._deviation_data,mr);
    square_index=0;
    direction=mr.direction;
    confidence=mr.confidence;
    //2番目以降
    var i;
    for(i=1;i<this._match_patt.length;i++){
      this._match_patt[i].evaluate(this._deviation_data,mr);
      if (confidence > mr.confidence) {
        continue;
      }
      // もっと一致するマーカーがあったぽい
      square_index = i;
      direction = mr.direction;
      confidence = mr.confidence;
    }
    //最も一致したマーカ情報を、この矩形の情報として記録する。
    var result = this.result_stack.prePush();
    result.arcode_id = square_index;
    result.confidence = confidence;
    var sq=result.square;
    //directionを考慮して、squareを更新する。
    for(i=0;i<4;i++){
      var idx=(i+4 - direction) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i = 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
  }
  ,init : function(i_raster)
  {
    this._ref_raster=i_raster;
    this.result_stack.clear();
  }
})










/**
 * 画像からARCodeに最も一致するマーカーを1個検出し、その変換行列を計算するクラスです。
 *
 */
NyARSingleDetectMarker = ASKlass('NyARSingleDetectMarker', NyARCustomSingleDetectMarker,
{
  PF_ARTOOLKIT_COMPATIBLE : 1,
  PF_NYARTOOLKIT : 2,
  PF_NYARTOOLKIT_ARTOOLKIT_FITTING : 100,
  PF_TEST2 : 201,
  /**
  * 検出するARCodeとカメラパラメータから、1個のARCodeを検出するNyARSingleDetectMarkerインスタンスを作ります。
  *
  * @param i_param
  * カメラパラメータを指定します。
  * @param i_code
  * 検出するARCodeを指定します。
  * @param i_marker_width
  * ARコードの物理サイズを、ミリメートルで指定します。
  * @param i_input_raster_type
  * 入力ラスタのピクセルタイプを指定します。この値は、INyARBufferReaderインタフェイスのgetBufferTypeの戻り値を指定します。
  * @throws NyARException
  */
  NyARSingleDetectMarker : function(i_param,i_code,i_marker_width,i_input_raster_type,i_profile_id)
  {
    if (i_profile_id == null) i_profile_id = this.PF_NYARTOOLKIT;
    NyARCustomSingleDetectMarker.initialize.call(this);
    this.initInstance2(i_param,i_code,i_marker_width,i_input_raster_type,i_profile_id);
    return;
  }
  /**
  * コンストラクタから呼び出す関数です。
  * @param i_ref_param
  * @param i_ref_code
  * @param i_marker_width
  * @param i_input_raster_type
  * @param i_profile_id
  * @throws NyARException
  */
  ,initInstance2 : function(
    i_ref_param,
    i_ref_code,
    i_marker_width,
    i_input_raster_type,
    i_profile_id)
  {
    var th=new NyARRasterFilter_ARToolkitThreshold(100,i_input_raster_type);
    var patt_inst;
    var sqdetect_inst;
    var transmat_inst;
    switch(i_profile_id){
    case this.PF_NYARTOOLKIT://default
      patt_inst=new NyARColorPatt_Perspective_O2(i_ref_code.getWidth(), i_ref_code.getHeight(),4,25);
      sqdetect_inst=new NyARSquareContourDetector_Rle(i_ref_param.getScreenSize());
      transmat_inst=new NyARTransMat(i_ref_param);
      break;
    default:
      throw new NyARException();
    }
    NyARCustomSingleDetectMarker.initInstance.call(this,patt_inst,sqdetect_inst,transmat_inst,th,i_ref_param,i_ref_code,i_marker_width);
  }
  /**
  * i_imageにマーカー検出処理を実行し、結果を記録します。
  *
  * @param i_raster
  * マーカーを検出するイメージを指定します。イメージサイズは、コンストラクタで指定i_paramの
  * スクリーンサイズと一致し、かつi_input_raster_typeに指定した形式でなければいけません。
  * @return マーカーが検出できたかを真偽値で返します。
  * @throws NyARException
  */
  ,detectMarkerLite : function(i_raster,i_threshold)
  {
    (NyARRasterFilter_ARToolkitThreshold(this._tobin_filter)).setThreshold(i_threshold);
    return NyARCustomSingleDetectMarker.detectMarkerLiteB.call(this,i_raster);
  }
})

/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 */

FLARDetectMarkerResult = ASKlass('FLARDetectMarkerResult',
{
  arcode_id : 0
  ,confidence : 0
  ,direction : 0
  ,square : new NyARSquare()
})

FLARDetectMarkerResultStack = ASKlass('FLARDetectMarkerResultStack', NyARObjectStack,
{
  FLARDetectMarkerResultStack : function(i_length)
  {
    NyARObjectStack.initialize.call(this, i_length);
  },
  createArray : function(i_length)
  {
    var ret = new Array(i_length);
    for (var i=0; i < i_length; i++){
      ret[i] = new FLARDetectMarkerResult();
    }
    return (ret);
  }
})


/**
 * 複数のマーカーを検出し、それぞれに最も一致するARコードを、コンストラクタで登録したARコードから 探すクラスです。最大300個を認識しますが、ゴミラベルを認識したりするので100個程度が限界です。
 *
 */
FLARMultiMarkerDetector = ASKlass('FLARMultiMarkerDetector',
{
  _detect_cb : null
  ,AR_SQUARE_MAX : 300
  ,_is_continue : false
  ,_square_detect : null
  ,_transmat : null
  ,_offset : null
  // import が消える現象回避用
  ,_flarcode : null
  /**
   * 複数のマーカーを検出し、最も一致するARCodeをi_codeから検索するオブジェクトを作ります。
   *
   * @param i_param
   * カメラパラメータを指定します。
   * @param i_code
   * 検出するマーカーのARCode配列を指定します。
   * 配列要素のインデックス番号が、そのままgetARCodeIndex関数で得られるARCodeインデックスになります。
   * 例えば、要素[1]のARCodeに一致したマーカーである場合は、getARCodeIndexは1を返します。
   * @param i_marker_width
   * i_codeのマーカーサイズをミリメートルで指定した配列を指定します。 先頭からi_number_of_code個の要素には、有効な値を指定する必要があります。
   * @param i_number_of_code
   * i_codeに含まれる、ARCodeの数を指定します。
   * @throws NyARException
   */
  ,FLARMultiMarkerDetector : function(i_param, i_code, i_marker_width, i_number_of_code)
  {
    this.initInstance(i_param,i_code,i_marker_width,i_number_of_code);
    return;
  }
  ,initInstance : function(
    i_ref_param,
    i_ref_code,
    i_marker_width,
    i_number_of_code)
  {
    var scr_size=i_ref_param.getScreenSize();
    // @todo この部分にマーカーの幅や高さ、枠線の割合がすべて一致するかのチェックを入れる
    // もしくは、FLARCodeの生成時に強制的に同一の数値を入力する事
    // 解析オブジェクトを作る
    var cw = i_ref_code[0].getWidth();
    var ch = i_ref_code[0].getHeight();
    // 枠線の割合(ARToolKit標準と同じなら、25 -> 1.0系と数値の扱いが異なるので注意！)
    var markerWidthByDec = (100 - i_ref_code[0].markerPercentWidth) / 2;
    var markerHeightByDec = (100 - i_ref_code[0].markerPercentHeight) / 2;
    //評価パターンのホルダを作成
    // NyARColorPatt_Perspective_O2のパラメータ
    // 第1,2パラ…縦横の解像度(patデータ作ったときの分割数)
    // 第3パラ…1ピクセルあたりの縦横サンプリング数。2なら2x2=4ポイントをサンプリングする。
    //       1,2,4,任意の数値のいずれか。値が大きいほど一致率ＵＰ、フレームレート低下。
    //       解像度16、サンプリング数4がデフォルト。解像度が大きい場合は、サンプリング数を下げることでフレームレートの低下を回避できる。
    // 第4パラ…エッジ幅の割合(ARToolKit標準と同じなら、25)->1.0系と数値の扱いが異なるので注意！
    var patt = new NyARColorPatt_Perspective_O2(cw, ch, 4, markerWidthByDec);
    // 縦横のエッジの割合が異なる場合にも対応できます。
    patt.setEdgeSizeByPercent(markerWidthByDec, markerHeightByDec, 4);
//      trace('w:'+markerWidthByDec+'/h:'+markerHeightByDec);
    //detectMarkerのコールバック関数
    this._detect_cb=new MultiDetectSquareCB(patt,i_ref_code,i_number_of_code,i_ref_param);
    this._transmat = new NyARTransMat(i_ref_param);
    //NyARToolkitプロファイル
    this._square_detect =new FLARSquareContourDetector(i_ref_param.getScreenSize());
    this._tobin_filter=new FLARRasterFilter_Threshold(100);
    //実サイズ保存
    this._offset = NyARRectOffset.createArray(i_number_of_code);
    for(var i=0;i<i_number_of_code;i++){
      this._offset[i].setSquare(i_marker_width[i]);
    }
    //２値画像バッファを作る
    this._bin_raster=new FLARBinRaster(scr_size.w,scr_size.h);
    return;
  }
  ,_bin_raster : null
  ,_tobin_filter : null
  /**
   * i_imageにマーカー検出処理を実行し、結果を記録します。
   *
   * @param i_raster
   * マーカーを検出するイメージを指定します。
   * @param i_thresh
   * 検出閾値を指定します。0～255の範囲で指定してください。 通常は100～130くらいを指定します。
   * @return 見つかったマーカーの数を返します。 マーカーが見つからない場合は0を返します。
   * @throws NyARException
   */
  ,detectMarkerLite : function(i_raster,i_threshold)
  {
    // サイズチェック
    if (!this._bin_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize())) {
      throw new NyARException();
    }
    // ラスタを２値イメージに変換する.
    // SOC: threshold incoming image according to brightness.
    //    passing -1 for threshold allows developers to apply custom thresholding algorithms
    //    prior to passing source image to FLARToolkit.
    if (i_threshold != -1) {
      // apply FLARToolkit thresholding
      (FLARRasterFilter_Threshold(this._tobin_filter)).setThreshold(i_threshold);
      this._tobin_filter.doFilter(i_raster, this._bin_raster);
    } else {
      // copy source BitmapData as-is, without applying FLARToolkit thresholding
      var srcBitmapData = (i_raster.getBuffer());
      var dstBitmapData = ((this._bin_raster).getBuffer());
      dstBitmapData.copyPixels(srcBitmapData, srcBitmapData.rect, new Point());
    }
    //detect
    this._detect_cb.init(i_raster);
    this._square_detect.detectMarkerCB(this._bin_raster,this._detect_cb);
    //見付かった数を返す。
    return this._detect_cb.result_stack.getLength();
  }
  /**
   * i_indexのマーカーに対する変換行列を計算し、結果値をo_resultへ格納します。 直前に実行したdetectMarkerLiteが成功していないと使えません。
   *
   * @param i_index
   * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
   * @param o_result
   * 結果値を受け取るオブジェクトを指定してください。
   * @throws NyARException
   */
  ,getTransformMatrix : function(i_index, o_result)
  {
    var result = this._detect_cb.result_stack.getItem(i_index);
    // 一番一致したマーカーの位置とかその辺を計算
    if (_is_continue) {
      _transmat.transMatContinue(result.square, this._offset[result.arcode_id], o_result);
    } else {
      _transmat.transMat(result.square, this._offset[result.arcode_id], o_result);
    }
    return;
  }
  /**
   * i_indexのマーカーの一致度を返します。
   *
   * @param i_index
   * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
   * @return マーカーの一致度を返します。0～1までの値をとります。 一致度が低い場合には、誤認識の可能性が高くなります。
   * @throws NyARException
   */
  ,getConfidence : function(i_index)
  {
    return this._detect_cb.result_stack.getItem(i_index).confidence;
  }
  /**
   * i_indexのマーカーのARCodeインデックスを返します。
   *
   * @param i_index
   * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
   * @return
   */
  ,getARCodeIndex : function(i_index)
  {
    return this._detect_cb.result_stack.getItem(i_index).arcode_id;
  }
  /**
   * 検出したマーカーの方位を返します。
   * 0,1,2,3の何れかを返します。
   *
   * @return Returns whether any of 0,1,2,3.
   */
  ,getDirection : function(i_index)
  {
    return this._detect_cb.result_stack.getItem(i_index).direction;
  }
  /**
   * 検出した FLARSquare 1 個返す。検出できなかったら null。
   * @return Total return detected FLARSquare 1. Detection Dekinakattara null.
   */
  ,getSquare : function(i_index)
  {
    return this._detect_cb.result_stack.getItem(i_index).square;
  }
  /**
   * getTransmationMatrixの計算モードを設定します。
   *
   * @param i_is_continue
   * TRUEなら、transMatContinueを使用します。 FALSEなら、transMatを使用します。
   */
  ,setContinueMode : function(i_is_continue)
  {
    this._is_continue = i_is_continue;
  }
  /**
   * 白領域の検査対象サイズ
   *  最大サイズは 一辺約320px、最小サイズは 一辺約 8px まで解析対象としている
   *  解析画像中で上記範囲内であれば解析対象となるが、最小サイズは小さすぎて意味をなさない。
   *  マーカー内部の判別には一辺30px～230pxとするのが妥当。
   *  640x480で取り込む場合は、i_maxを縦サイズの二乗を設定する。
   *  なお、0 を指定した場合は FLARLabeling.AR_AREA_MAX、FLARLabeling.AR_AREA_MINが適応されます。
   *
   * @param i_max 解析対象とする白領域の最大pixel数(一辺の二乗) default: 100000
   * @param i_min 解析対象とする白領域の最小pixel数(一辺の二乗) default: 70
   */
  ,setAreaRange : function(i_max, i_min)
  {
    if (i_max == null)
      i_max = 100000;
    if (i_min == null)
      i_min = 70;
    if ( i_max<0 ) { i_max = FLARLabeling.AR_AREA_MAX; }
    if ( i_min<0 ) { i_min = FLARLabeling.AR_AREA_MIN; }
    if (i_max < i_min) {
      var tmp = i_max;
      i_max = i_min;
      i_min = tmp;
    }
    this._square_detect.setAreaRange( i_max, i_min);
  }
  /**
   * 2値化した画像を返却します。
   *
   * @return 画像情報を返却します
   */
  ,thresholdedBitmapData : function()
  {
    try {
      return ((this._bin_raster).getBuffer());
    } catch (e) {
      return null;
    }
    return null;
  }
})

FLARSingleMarkerDetector = ASKlass('FLARSingleMarkerDetector',
{
  _is_continue : false
  ,_square_detect : null
  ,_transmat : null
  //画処理用
  ,_bin_raster : null
  ,_tobin_filter : null
  ,_detect_cb : null
  ,_offset : null
  ,FLARSingleMarkerDetector : function(i_ref_param,i_ref_code,i_marker_width)
  {
    var th=new FLARRasterFilter_Threshold(100);
    var patt_inst;
    var sqdetect_inst;
    var transmat_inst;
    // 枠線の割合(ARToolKit標準と同じなら、25 -> 1.0系と数値の扱いが異なるので注意！)
    var markerWidthByDec = (100 - i_ref_code.markerPercentWidth) / 2;
    var markerHeightByDec = (100 - i_ref_code.markerPercentHeight) / 2;
    //評価パターンのホルダを作成
    // NyARColorPatt_Perspective_O2のパラメータ
    // 第1,2パラ…縦横の解像度(patデータ作ったときの分割数)
    // 第3パラ…1ピクセルあたりの縦横サンプリング数。2なら2x2=4ポイントをサンプリングする。
    //       1,2,4,任意の数値のいずれか。値が大きいほど一致率ＵＰ、フレームレート低下。
    //       解像度16、サンプリング数4がデフォルト。解像度が大きい場合は、サンプリング数を下げることでフレームレートの低下を回避できる。
    // 第4パラ…エッジ幅の割合(ARToolKit標準と同じなら、25)->1.0系と数値の扱いが異なるので注意！
    patt_inst = new NyARColorPatt_Perspective_O2(i_ref_code.getWidth(), i_ref_code.getHeight(), 4, markerWidthByDec);
    // 縦横のエッジの割合が異なる場合にも対応できます。
    patt_inst.setEdgeSizeByPercent(markerWidthByDec, markerHeightByDec, 4);
//      trace('w:'+markerWidthByDec+'/h:'+markerHeightByDec);
    sqdetect_inst=new FLARSquareContourDetector(i_ref_param.getScreenSize());
    transmat_inst=new NyARTransMat(i_ref_param);
    this.initInstance(patt_inst,sqdetect_inst,transmat_inst,th,i_ref_param,i_ref_code,i_marker_width);
    return;
  }
  ,initInstance : function(
    i_patt_inst,
    i_sqdetect_inst,
    i_transmat_inst,
    i_filter,
    i_ref_param,
    i_ref_code,
    i_marker_width)
  {
    var scr_size=i_ref_param.getScreenSize();
    // 解析オブジェクトを作る
    this._square_detect = i_sqdetect_inst;
    this._transmat = i_transmat_inst;
    this._tobin_filter=i_filter;
    //２値画像バッファを作る
    this._bin_raster=new FLARBinRaster(scr_size.w,scr_size.h);
    //_detect_cb
    this._detect_cb=new SingleDetectSquareCB(i_patt_inst,i_ref_code,i_ref_param);
    //オフセットを作成
    this._offset=new NyARRectOffset();
    this._offset.setSquare(i_marker_width);
    return;
  }
  /**
   * i_imageにマーカー検出処理を実行し、結果を記録します。
   *
   * @param i_raster
   * マーカーを検出するイメージを指定します。イメージサイズは、カメラパラメータ
   * と一致していなければなりません。
   * @return マーカーが検出できたかを真偽値で返します。
   * @throws NyARException
   */
  ,detectMarkerLite : function(i_raster,i_threshold)
  {
    FLARRasterFilter_Threshold(this._tobin_filter).setThreshold(i_threshold);
    //サイズチェック
    if(!this._bin_raster.getSize().isEqualSize_NyARIntSize(i_raster.getSize())){
      throw new FLARException();
    }
    //ラスタを２値イメージに変換する.
    this._tobin_filter.doFilter(i_raster,this._bin_raster);
    //コールバックハンドラの準備
    this._detect_cb.init(i_raster);
    //矩形を探す(戻り値はコールバック関数で受け取る。)
    this._square_detect.detectMarkerCB(this._bin_raster,this._detect_cb);
    if(this._detect_cb.confidence==0){
      return false;
    }
    return true;
  }
  /**
   * 検出したマーカーの変換行列を計算して、o_resultへ値を返します。
   * 直前に実行したdetectMarkerLiteが成功していないと使えません。
   *
   * @param o_result
   * 変換行列を受け取るオブジェクトを指定します。
   * @throws NyARException
   */
  ,getTransformMatrix : function(o_result)
  {
    // 一番一致したマーカーの位置とかその辺を計算
    if (this._is_continue) {
      this._transmat.transMatContinue(this._detect_cb.square,this._offset, o_result);
    } else {
      this._transmat.transMat(this._detect_cb.square,this._offset, o_result);
    }
    return;
  }
  /**
   * 検出したマーカーの一致度を返します。
   *
   * @return マーカーの一致度を返します。0～1までの値をとります。 一致度が低い場合には、誤認識の可能性が高くなります。
   * @throws NyARException
   */
  ,getConfidence : function()
  {
    return this._detect_cb.confidence;
  }
  /**
   * 検出したマーカーの方位を返します。
   * 0,1,2,3の何れかを返します。
   *
   * @return Returns whether any of 0,1,2,3.
   */
  ,getDirection : function()
  {
    return this._detect_cb.direction;
  }
  /**
   * 検出した FLARSquare 1 個返す。検出できなかったら null。
   * @return Total return detected FLARSquare 1. Detection Dekinakattara null.
   */
  ,getSquare : function()
  {
    return this._detect_cb.square;
  }
  /**
   * getTransmationMatrixの計算モードを設定します。 初期値はTRUEです。
   *
   * @param i_is_continue
   * TRUEなら、transMatCont互換の計算をします。 FALSEなら、transMat互換の計算をします。
   */
  ,setContinueMode : function(i_is_continue)
  {
    this._is_continue = i_is_continue;
  }
  /**
   * 白領域の検査対象サイズ
   *  最大サイズは 一辺約320px、最小サイズは 一辺約 8px まで解析対象としている
   *  解析画像中で上記範囲内であれば解析対象となるが、最小サイズは小さすぎて意味をなさない。
   *  マーカー内部の判別には一辺30px～230pxとするのが妥当。
   *  640x480で取り込む場合は、i_maxを縦サイズの二乗を設定する。
   *  なお、0 を指定した場合は FLARLabeling.AR_AREA_MAX、FLARLabeling.AR_AREA_MINが適応されます。
   *
   * @param i_max 解析対象とする白領域の最大pixel数(一辺の二乗) default: 100000
   * @param i_min 解析対象とする白領域の最小pixel数(一辺の二乗) default: 70
   */
  ,setAreaRange : function(i_max, i_min)
  {
    if (i_max == null)
      i_max = 100000;
    if (i_min == null)
      i_min = 70;
    if ( i_max<0 ) { i_max = FLARLabeling.AR_AREA_MAX; }
    if ( i_min<0 ) { i_min = FLARLabeling.AR_AREA_MIN; }
    if (i_max < i_min) {
      var tmp = i_max;
      i_max = i_min;
      i_min = tmp;
    }
    this._square_detect.setAreaRange( i_max, i_min);
  }
  /**
   * 2値化した画像を返却します。
   *
   * @return 画像情報を返却します
   */
  ,thresholdedBitmapData : function()
  {
    try {
      return ((this._bin_raster).getBuffer());
    } catch (e) {
      return null;
    }
    return null;
  }
})


/**
 * detectMarkerのコールバック関数
 */
MultiDetectSquareCB = ASKlass('MultiDetectSquareCB',
{
  //公開プロパティ
  result_stack : new FLARDetectMarkerResultStack(NyARDetectMarker.AR_SQUARE_MAX)
  //参照インスタンス
  ,_ref_raster : null
  //所有インスタンス
  ,_inst_patt : null
  ,_deviation_data : null
  ,_match_patt : null
  ,__detectMarkerLite_mr : new NyARMatchPattResult()
  ,_coordline : null
  ,MultiDetectSquareCB : function(i_inst_patt, i_ref_code, i_num_of_code, i_param)
  {
    var cw = i_ref_code[0].getWidth();
    var ch = i_ref_code[0].getHeight();
    this._inst_patt=i_inst_patt;
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    this._deviation_data=new NyARMatchPattDeviationColorData(cw,ch);
    //NyARMatchPatt_Color_WITHOUT_PCA[]の作成
    this._match_patt=new Array(i_num_of_code);
    this._match_patt[0]=new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[0]);
    for (var i = 1; i < i_num_of_code; i++){
      //解像度チェック
      if (cw != i_ref_code[i].getWidth() || ch != i_ref_code[i].getHeight()) {
        throw new NyARException();
      }
      this._match_patt[i]=new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[i]);
    }
    return;
  }
  ,__tmp_vertex : NyARIntPoint2d.createArray(4)
  /**
   * 矩形が見付かるたびに呼び出されます。
   * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
   */
  ,onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num ,i_vertex_index)
  {
    var mr=this.__detectMarkerLite_mr;
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    //画像を取得
    if (!this._inst_patt.pickFromRaster(this._ref_raster,vertex)){
      return;
    }
    //取得パターンをカラー差分データに変換して評価する。
    this._deviation_data.setRaster(this._inst_patt);
    //最も一致するパターンを割り当てる。
    var square_index,direction;
    var confidence;
    this._match_patt[0].evaluate(this._deviation_data,mr);
    square_index=0;
    direction=mr.direction;
    confidence=mr.confidence;
    //2番目以降
    var i;
    for(i=1;i<this._match_patt.length;i++){
      this._match_patt[i].evaluate(this._deviation_data,mr);
      if (confidence > mr.confidence) {
        continue;
      }
      // もっと一致するマーカーがあったぽい
      square_index = i;
      direction = mr.direction;
      confidence = mr.confidence;
    }
    //最も一致したマーカ情報を、この矩形の情報として記録する。
    var result = this.result_stack.prePush();
    result.arcode_id = square_index;
    result.confidence = confidence;
    result.direction = direction;
    var sq=result.square;
    //directionを考慮して、squareを更新する。
    for(i=0;i<4;i++){
      var idx=(i+4 - direction) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i = 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
  }
  ,init : function(i_raster)
  {
    this._ref_raster=i_raster;
    this.result_stack.clear();
  }
})


/**
 * detectMarkerのコールバック関数
 */
SingleDetectSquareCB = ASKlass('SingleDetectSquareCB',
{
  //公開プロパティ
  confidence : 0
  ,square : new NyARSquare()
  ,direction : 0
  //参照インスタンス
  ,_ref_raster : null
  //所有インスタンス
  ,_inst_patt : null
  ,_deviation_data : null
  ,_match_patt : null
  ,__detectMarkerLite_mr : new NyARMatchPattResult()
  ,_coordline : null
  ,SingleDetectSquareCB : function(i_inst_patt,i_ref_code,i_param)
  {
    this._inst_patt=i_inst_patt;
    this._deviation_data=new NyARMatchPattDeviationColorData(i_ref_code.getWidth(),i_ref_code.getHeight());
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    this._match_patt=new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code);
    return;
  }
  ,__tmp_vertex : NyARIntPoint2d.createArray(4)
  /**
   * 矩形が見付かるたびに呼び出されます。
   * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
   */
  ,onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num,i_vertex_index)
  {
    var i;
    var mr=this.__detectMarkerLite_mr;
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    //画像を取得
    if (!this._inst_patt.pickFromRaster(this._ref_raster,vertex)){
      return;
    }
    //取得パターンをカラー差分データに変換して評価する。
    this._deviation_data.setRaster(this._inst_patt);
    if(!this._match_patt.evaluate(this._deviation_data,mr)){
      return;
    }
    //現在の一致率より低ければ終了
    if (this.confidence > mr.confidence){
      return;
    }
    //一致率の高い矩形があれば、方位を考慮して頂点情報を作成
    var sq=this.square;
    this.confidence = mr.confidence;
    this.direction = mr.direction;
    //directionを考慮して、squareを更新する。
    for(i=0;i<4;i++){
      var idx=(i+4 - mr.direction) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i = 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
  }
  ,init : function(i_raster)
  {
    this.confidence=0;
    this._ref_raster=i_raster;
  }
})
/*
 * PROJECT: FLARToolKit
 * --------------------------------------------------------------------------------
 * This work is based on the NyARToolKit developed by
 *   R.Iizuka (nyatla)
 * http://nyatla.jp/nyatoolkit/
 *
 * The FLARToolKit is ActionScript 3.0 version ARToolkit class library.
 * Copyright (C)2008 Saqoosha
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this framework; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 * For further information please contact.
 *  http://www.libspark.org/wiki/saqoosha/FLARToolKit
 *  <saq(at)saqoosha.net>
 *
 *  http://nyatla.jp/nyatoolkit/
 *  <airmail(at)ebony.plala.or.jp> or <nyatla(at)nyatla.jp>
 *
 * For further information of this class, please contact.
 * http://sixwish.jp
 * <rokubou(at)gmail.com>
 */

/**
 * ...
 * @author tarotarorg
 */
FLARIdMarkerData = ASKlass('FLARIdMarkerData',
{
  /**
   * パケットデータをVectorで表現。（最大パケット数がモデル7での21+(1)なので、22で初期化している）
   */
  _packet : new IntVector(22)
  ,_model : 0
  ,_controlDomain : 0
  ,_controlMask : 0
  ,_check : 0
  ,_dataDot : 0
  ,packetLength : 0
  ,FLARIdMarkerData : function()
  {
  }
  ,isEqual : function(i_target)
  {
    if (i_target == null || !(i_target instanceof FLARIdMarkerData)) {
      return false;
    }
    var s = i_target;
    if (s.packetLength != this.packetLength    ||
      s._check != this._check          ||
      s._controlDomain != this._controlDomain  ||
      s._controlMask != this._controlMask    ||
      s._dataDot != this._dataDot        ||
      s._model != this._model){
      return false;
    }
    for(var i = s.packetLength - 1; i>=0; i--){
      if(s._packet[i] != this._packet[i]){
        return false;
      }
    }
    return true;
  }
  ,copyFrom : function(i_source)
  {
    var s = i_source;
    if (s == null) return;
    this._check = s._check;
    this._controlDomain = s._controlDomain;
    this._controlMask = s._controlMask;
    this._dataDot = s._dataDot;
    this._model = s._model;
    this.packetLength = s.packetLength;
    for (var i = s.packetLength - 1; i >= 0; i--) {
      this._packet[i] = s._packet[i];
    }
    return;
  }
///////////////////////////////////////////////////////////////////////////////////
// setters
///////////////////////////////////////////////////////////////////////////////////
  ,setModel : function(value)
  {
    this._model = value;
  }
  ,setControlDomain : function(value)
  {
    this._controlDomain = value;
  }
  ,setControlMask : function(value)
  {
    this._controlMask = value;
  }
  ,setCheck : function(value)
  {
    this._check = value;
  }
  ,setPacketData : function(index, data)
  {
    if (index < this.packetLength) {
      this._packet[index] = data;
    } else {
      throw ("packet index over " + index + " >= " + this.packetLength);
    }
  }
  ,setDataDotLength : function(value)
  {
    this._dataDot = value;
  }
  ,setPacketLength : function(value)
  {
    this.packetLength = value;
  }
///////////////////////////////////////////////////////////////////////////////////
// getters
///////////////////////////////////////////////////////////////////////////////////
  ,dataDotLength : function() { return this._dataDot; }
  ,model : function() { return this._model; }
  ,controlDomain : function() { return this._controlDomain; }
  ,controlMask : function() { return this._controlMask; }
  ,check : function() { return this._check; }
  ,getPacketData : function(index)
  {
    if (this.packetLength <= index) throw new ArgumentError("packet index over");
    return this._packet[index];
  }
})


FLARDetectIdMarkerResult = ASKlass('FLARDetectIdMarkerResult',
{
  arcode_id : 0
  ,direction : 0
  ,markerdata : new FLARIdMarkerData()
  ,square : new NyARSquare()
})
FLARDetectIdMarkerResultStack = ASKlass('FLARDetectIdMarkerResultStack', NyARObjectStack,
{
  FLARDetectIdMarkerResultStack : function(i_length)
  {
    NyARObjectStack.initialize.call(this,i_length);
  }
  ,createArray : function(i_length)
  {
    var ret= new Array(i_length);
    for (var i =0; i < i_length; i++){
      ret[i] = new FLARDetectIdMarkerResult();
    }
    return (ret);
  }
})

/**
 * detectMarkerのコールバック関数
 */
FLARMultiIdMarkerDetectCB = ASKlass('FLARMultiIdMarkerDetectCB',
{
  //公開プロパティ
  result_stack : new FLARDetectIdMarkerResultStack(NyARDetectMarker.AR_SQUARE_MAX)
  ,square : new FLARSquare()
  ,marker_data : null
  ,threshold : 0
  ,direction : 0
  ,_ref_raster : null
  ,_current_data : null
  ,_data_temp : null
  ,_prev_data : null
  ,_id_pickup : new NyIdMarkerPickup()
  ,_coordline : null
  ,_encoder : null
  ,__tmp_vertex : NyARIntPoint2d.createArray(4)
  ,_marker_param : new NyIdMarkerParam()
  ,_maker_pattern : new NyIdMarkerPattern()
  ,FLARMultiIdMarkerDetectCB : function(i_param,i_encoder)
  {
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    this._data_temp=i_encoder.createDataInstance();
    this._current_data=i_encoder.createDataInstance();
    this._encoder=i_encoder;
    return;
  }
  /**
   * Initialize call back handler.
   */
  ,init : function(i_raster)
  {
    this.marker_data=null;
    this.result_stack.clear();
    this._id_pickup.init();
    this._ref_raster=i_raster;
  }
  ,_previous_verts : {}
  /**
   * 矩形が見付かるたびに呼び出されます。
   * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
   */
  ,onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num,i_vertex_index)
  {
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    var param=this._marker_param;
    var patt_data=this._maker_pattern;
    // 評価基準になるパターンをイメージから切り出す
    var cv;
    if (window.DEBUG) {
      cv = document.getElementById('debugCanvas').getContext('2d');
      cv.fillStyle = 'blue';
      for (var i=0; i<4; i++) {
        cv.fillRect(vertex[i].x-2, vertex[i].y-2, 5, 5);
      }
    }
    var cx=0,cy=0;
    for (var i=0; i<4; i++) {
      cx += vertex[i].x;
      cy += vertex[i].y;
    }
    cx /= 4;
    cy /= 4;
    var pick = this._id_pickup.pickFromRaster(this._ref_raster,vertex, patt_data, param);
    if (!pick) {
      if (window.DEBUG) {
        cv.fillStyle = '#ff0000';
        cv.fillText('No pick', cx+3, cy);
      }
      return;
    }
    //エンコード
    var enc = this._encoder.encode(patt_data,this._data_temp);
    if(!enc){
      return;
    }
    this._current_data.copyFrom(this._data_temp);
    this.marker_data = this._current_data;//みつかった。
    this.threshold = param.threshold;
    this.direction = param.direction;
    //マーカ情報を記録する。
    var result = this.result_stack.prePush();
    result.direction = this.direction;
    result.markerdata.copyFrom(this.marker_data);
    result.arcode_id = this.getId(result.markerdata);
    if (window.DEBUG) {
      cv.fillStyle = '#00ffff';
      cv.fillText(result.arcode_id, cx+3, cy);
    }
    //新しく認識、または継続認識中に更新があったときだけ、Square情報を更新する。
    //ココから先はこの条件でしか実行されない。
    var sq = result.square;
    //directionを考慮して、squareを更新する。
    var i;
    for(i=0;i<4;i++){
      var idx=(i+4 - param.direction) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i= 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
  }
  ,getId : function(data)
  {
    var currId;
    if (data.packetLength > 4) {
      currId = -1;
    }else{
      currId=0;
      //最大4バイト繋げて１個のint値に変換
      for (var i = 0; i < data.packetLength; i++ ) {
        currId = (currId << 8) | data.getPacketData(i);
      }
    }
    return currId;
  }
})

FLARMultiIdMarkerDetector = ASKlass('FLARMultiIdMarkerDetector',
{
  _is_continue : false
  ,_square_detect : null
  ,_offset : null
  ,_current_threshold : 110
  // [AR]検出結果の保存用
  ,_bin_raster : null
  ,_tobin_filter : null
  ,_callback : null
  ,_data_current : null
  ,_threshold_detect : null
  ,_transmat : null
  ,FLARMultiIdMarkerDetector : function(i_param ,i_marker_width)
  {
    var scr_size = i_param.getScreenSize();
    var encoder = new FLARIdMarkerDataEncoder_RawBit();
    // 解析オブジェクトを作る
    this._square_detect = new FLARSquareContourDetector(scr_size);
    this._callback = new FLARMultiIdMarkerDetectCB(i_param, encoder);
    this._transmat = new NyARTransMat(i_param);
    // ２値画像バッファを作る
    this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h);
    //ワーク用のデータオブジェクトを２個作る
    this._data_current = encoder.createDataInstance();
    this._tobin_filter = new FLARRasterFilter_Threshold(110);
    this._threshold_detect = new FLARRasterThresholdAnalyzer_SlidePTile(15, 4);
    this._offset = new NyARRectOffset();
    this._offset.setSquare(i_marker_width);
    return;
  }
  ,detectMarkerLite : function(i_raster, i_threshold)
  {
    // サイズチェック
    if (!this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h)) {
      throw new FLARException();
    }
    // ラスタを２値イメージに変換する.
    this._tobin_filter.setThreshold(i_threshold);
    this._tobin_filter.doFilter(i_raster, this._bin_raster);
    // スクエアコードを探す(第二引数に指定したマーカ、もしくは新しいマーカを探す。)
    this._callback.init(this._bin_raster);
    this._square_detect.detectMarkerCB(this._bin_raster, this._callback);
    //見付かった数を返す。
    return this._callback.result_stack.getLength();
  }
  /**
   * i_indexのマーカーに対する変換行列を計算し、結果値をo_resultへ格納します。 直前に実行したdetectMarkerLiteが成功していないと使えません。
   *
   * @param i_index
   * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
   * @param o_result
   * 結果値を受け取るオブジェクトを指定してください。
   * @throws NyARException
   */
  ,getTransformMatrix : function(i_index, o_result)
  {
    var result = this._callback.result_stack.getItem(i_index);
    // 一番一致したマーカーの位置とかその辺を計算
    if (this._is_continue) {
      this._transmat.transMatContinue(result.square, this._offset, o_result);
    } else {
      this._transmat.transMat(result.square, this._offset, o_result);
    }
    return;
  }
  ,getIdMarkerData : function(i_index)
  {
    var result = new FLARIdMarkerData();
    result.copyFrom(this._callback.result_stack.getItem(i_index).markerdata);
    return result;
  }
  /**
   * i_indexのマーカーのARCodeインデックスを返します。
   *
   * @param i_index
   * マーカーのインデックス番号を指定します。 直前に実行したdetectMarkerLiteの戻り値未満かつ0以上である必要があります。
   * @return
   */
  ,getARCodeIndex : function(i_index)
  {
    return this._callback.result_stack.getItem(i_index).arcode_id;
  }
  /**
   * 検出したマーカーの方位を返します。
   * 0,1,2,3の何れかを返します。
   *
   * @return Returns whether any of 0,1,2,3.
   */
  ,getDirection : function(i_index)
  {
    return this._callback.result_stack.getItem(i_index).direction;
  }
  /**
   * 検出した FLARSquare 1 個返す。検出できなかったら null。
   * @return Total return detected FLARSquare 1. Detection Dekinakattara null.
   */
  ,getSquare : function(i_index)
  {
    return this._callback.result_stack.getItem(i_index).square;
  }
  /**
   * getTransmationMatrixの計算モードを設定します。
   *
   * @param i_is_continue
   * TRUEなら、transMatContinueを使用します。 FALSEなら、transMatを使用します。
   */
  ,setContinueMode : function(i_is_continue)
  {
    this._is_continue = i_is_continue;
  }
  /**
   * 2値化した画像を返却します。
   *
   * @return 画像情報を返却します
   */
  ,thresholdedBitmapData : function()
  {
    try {
      return ((this._bin_raster).getBuffer());
    } catch (e) {
      return null;
    }
    return null;
  }
})
/**
 * detectMarkerのコールバック関数
 */
FLARSingleIdMarkerDetectCB = ASKlass('FLARSingleIdMarkerDetectCB',
{
  //公開プロパティ
  square : new FLARSquare()
  ,marker_data : null
  ,threshold : 0
  ,direction : 0
  ,_ref_raster : null
  ,_current_data : null
  ,_data_temp : null
  ,_prev_data : null
  ,_id_pickup : new NyIdMarkerPickup()
  ,_coordline : null
  ,_encoder : null
  ,__tmp_vertex : NyARIntPoint2d.createArray(4)
  ,_marker_param : new NyIdMarkerParam()
  ,_maker_pattern : new NyIdMarkerPattern()
  ,FLARSingleIdMarkerDetectCB : function(i_param,i_encoder)
  {
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    this._data_temp=i_encoder.createDataInstance();
    this._current_data=i_encoder.createDataInstance();
    this._encoder=i_encoder;
    return;
  }
  /**
   * Initialize call back handler.
   */
  ,init : function(i_raster,i_prev_data)
  {
    this.marker_data=null;
    this._prev_data=i_prev_data;
    this._ref_raster=i_raster;
  }
  /**
   * 矩形が見付かるたびに呼び出されます。
   * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
   */
  ,onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num,i_vertex_index)
  {
    //既に発見済なら終了
    if(this.marker_data!=null){
      return;
    }
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    var param=this._marker_param;
    var patt_data=this._maker_pattern;
    // 評価基準になるパターンをイメージから切り出す
    var pick = this._id_pickup.pickFromRaster(this._ref_raster,vertex, patt_data, param)
    if (window.DEBUG) {
      var cv = document.getElementById('debugCanvas').getContext('2d');
      cv.fillStyle = 'blue';
      for (var i=0; i<4; i++) {
        cv.fillRect(vertex[i].x-2, vertex[i].y-2, 5, 5);
      }
    }
    if (!pick){
      return;
    }
    this.direction = param.direction;
    //エンコード
    if(!this._encoder.encode(patt_data,this._data_temp)){
      return;
    }
    //継続認識要求されている？
    if (this._prev_data==null){
      //継続認識要求なし
      this._current_data.copyFrom(this._data_temp);
    }else{
      //継続認識要求あり
      if(!this._prev_data.isEqual((this._data_temp))){
        return;//認識請求のあったIDと違う。
      }
    }
    //新しく認識、または継続認識中に更新があったときだけ、Square情報を更新する。
    //ココから先はこの条件でしか実行されない。
    var sq=this.square;
    //directionを考慮して、squareを更新する。
    var i;
    for(i=0;i<4;i++){
      var idx=(i+4 - param.direction) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i= 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
    this.threshold=param.threshold;
    this.marker_data=this._current_data;//みつかった。
  }
})
FLARSingleIdMarkerDetector = ASKlass('FLARSingleIdMarkerDetector', {
  _is_continue : false
  ,_square_detect : null
  ,_offset : null
  ,_is_active : null
  ,_current_threshold : 110
  // [AR]検出結果の保存用
  ,_bin_raster : null
  ,_tobin_filter : null
  ,_callback : null
  ,_data_current : null
  ,_threshold_detect : null
  ,_transmat : null
  ,FLARSingleIdMarkerDetector : function(i_param ,i_marker_width)
  {
    var scr_size = i_param.getScreenSize();
    var encoder = new FLARIdMarkerDataEncoder_RawBit();
    // 解析オブジェクトを作る
    this._square_detect = new FLARSquareContourDetector(scr_size);
    this._callback = new FLARSingleIdMarkerDetectCB(i_param, encoder);
    this._transmat = new NyARTransMat(i_param);
    // ２値画像バッファを作る
    this._bin_raster = new FLARBinRaster(scr_size.w, scr_size.h);
    //ワーク用のデータオブジェクトを２個作る
    this._data_current = encoder.createDataInstance();
    this._tobin_filter = new FLARRasterFilter_Threshold(110);
    this._threshold_detect = new FLARRasterThresholdAnalyzer_SlidePTile(15, 4);
    this._offset = new NyARRectOffset();
    this._offset.setSquare(i_marker_width);
    return;
  }
  ,detectMarkerLite : function(i_raster, i_threshold)
  {
    // サイズチェック
    if (!this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h)) {
      throw new FLARException();
    }
    // ラスタを２値イメージに変換する.
    this._tobin_filter.setThreshold(i_threshold);
    this._tobin_filter.doFilter(i_raster, this._bin_raster);
    // スクエアコードを探す(第二引数に指定したマーカ、もしくは新しいマーカを探す。)
    this._callback.init(this._bin_raster, this._is_active?this._data_current:null);
    this._square_detect.detectMarkerCB(this._bin_raster, this._callback);
    // 見つからない場合はfalse
    if(this._callback.marker_data==null){
      this._is_active=false;
      return false;
    }
    this._is_active = true;
    this._data_current.copyFrom(this._callback.marker_data);
    return true;
  }
  ,getIdMarkerData : function()
  {
    var result = new FLARIdMarkerData();
    result.copyFrom(this._callback.marker_data);
    return result;
  }
  ,getDirection : function()
  {
    return this._callback.direction;
  }
  ,getTransformMatrix : function(o_result)
  {
    if (this._is_continue) this._transmat.transMatContinue(this._callback.square, this._offset, o_result);
    else this._transmat.transMat(this._callback.square, this._offset, o_result);
    return;
  }
  ,setContinueMode : function(i_is_continue)
  {
    this._is_continue = i_is_continue;
  }
})

FLARIdMarkerDataEncoder_RawBit = ASKlass('FLARIdMarkerDataEncoder_RawBit',
{
  _DOMAIN_ID : 0
  /**
   * 制御ドット作成時のmodに使う値
   */
  ,_mod_data : new IntVector([7, 31, 127, 511, 2047, 4095])
  ,encode : function(i_data,o_dest)
  {
    var dest = o_dest;
    if (dest == null) {
      throw new FLARException("type of o_dest must be \"FLARIdMarkerData\"");
    }
    if(i_data.ctrl_domain != this._DOMAIN_ID) {
      return false;
    }
    dest.setCheck(i_data.check);
    dest.setControlDomain(i_data.ctrl_domain);
    dest.setControlMask(i_data.ctrl_mask);
    dest.setModel(i_data.model);
    //データドット数計算
    var resolution_len = toInt(i_data.model * 2 - 1); //trace("resolution", resolution_len);
    dest.setDataDotLength(resolution_len);
    //データドット数が、「(2 * model値 - 1)^2」となり、この2乗の元となる値がresolution_lenで、
    //パケット数は「(int)(データドット数 / 8) + 1」（最後に足す1はパケット0）となる
    var packet_length = toInt((resolution_len * resolution_len) / 8) + 1;
    // trace("packet", packet_length);
    dest.setPacketLength(packet_length);
    var sum = 0;
    for(var i=0;i<packet_length;i++){
      dest.setPacketData(i, i_data.data[i]);
      // trace("i_data[",i,"]",i_data.data[i]);
      sum += i_data.data[i];
    }
    //チェックドット値計算
    sum = sum % this._mod_data[i_data.model - 2];
    // trace("check dot", i_data.check, sum);
    //チェックドット比較
    if(i_data.check!=sum){
      return false;
    }
    return true;
  }
  ,createDataInstance : function()
  {
    return new FLARIdMarkerData();
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */














/**
 * このクラスは、同時に１個のマーカを処理することのできる、アプリケーションプロセッサです。
 * マーカの出現・移動・消滅を、イベントで通知することができます。
 * クラスには複数のマーカを登録できます。一つのマーカが見つかると、プロセッサは継続して同じマーカを
 * １つだけ認識し続け、見失うまでの間は他のマーカを認識しません。
 *
 * イベントは、 OnEnter→OnUpdate[n]→OnLeaveの順で発生します。
 * マーカが見つかるとまずOnEnterが１度発生して、何番のマーカが発見されたかがわかります。
 * 次にOnUpdateにより、現在の変換行列が連続して渡されます。最後にマーカを見失うと、OnLeave
 * イベントが発生します。
 *
 */
SingleARMarkerProcesser = ASKlass('SingleARMarkerProcesser',
{
  /**オーナーが自由に使えるタグ変数です。
   */
  tag : null,
  _lost_delay_count : 0,
  _lost_delay : 5,
  _square_detect : null,
  _transmat : null,
  _offset : null,
  _threshold : 110,
  // [AR]検出結果の保存用
  _bin_raster : null,
  _tobin_filter : null,
  _current_arcode_index : -1,
  _threshold_detect : null,
  SingleARMarkerProcesser : function()
  {
    return;
  },
  _initialized : false,
  initInstance : function(i_param,i_raster_type)
  {
    //初期化済？
    NyAS3Utils.assert(this._initialized==false);
    var scr_size = i_param.getScreenSize();
    // 解析オブジェクトを作る
    this._square_detect = new NyARSquareContourDetector_Rle(scr_size);
    this._transmat = new NyARTransMat(i_param);
    this._tobin_filter=new NyARRasterFilter_ARToolkitThreshold(110,i_raster_type);
    // ２値画像バッファを作る
    this._bin_raster = new NyARBinRaster(scr_size.w, scr_size.h);
    this._threshold_detect=new NyARRasterThresholdAnalyzer_SlidePTile(15,i_raster_type,4);
    this._initialized=true;
    //コールバックハンドラ
    this._detectmarker_cb=new DetectSquareCB_1(i_param);
    this._offset=new NyARRectOffset();
    return;
  }
  /*自動・手動の設定が出来ないので、コメントアウト
  public void setThreshold(int i_threshold)
  {
    this._threshold = i_threshold;
    return;
  }*/
  /**検出するマーカコードの配列を指定します。 検出状態でこの関数を実行すると、
   * オブジェクト状態に強制リセットがかかります。
   */
  ,setARCodeTable : function(i_ref_code_table,i_code_resolution,i_marker_width)
  {
    if (this._current_arcode_index != -1) {
      // 強制リセット
      this.reset(true);
    }
    //検出するマーカセット、情報、検出器を作り直す。(1ピクセル4ポイントサンプリング,マーカのパターン領域は50%)
    this._detectmarker_cb.setNyARCodeTable(i_ref_code_table,i_code_resolution);
    this._offset.setSquare(i_marker_width);
    return;
  }
  ,reset : function(i_is_force)
  {
    if (this._current_arcode_index != -1 && i_is_force == false) {
      // 強制書き換えでなければイベントコール
      this.onLeaveHandler();
    }
    // カレントマーカをリセット
    this._current_arcode_index = -1;
    return;
  },
  _detectmarker_cb : null,
  detectMarker : function(i_raster)
  {
    // サイズチェック
    NyAS3Utils.assert(this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h));
    //BINイメージへの変換
    this._tobin_filter.setThreshold(this._threshold);
    this._tobin_filter.doFilter(i_raster, this._bin_raster);
    // スクエアコードを探す
    this._detectmarker_cb.init(i_raster,this._current_arcode_index);
    this._square_detect.detectMarkerCB(this._bin_raster,this._detectmarker_cb);
    // 認識状態を更新
    var is_id_found=updateStatus(this._detectmarker_cb.square,this._detectmarker_cb.code_index);
    //閾値フィードバック(detectExistMarkerにもあるよ)
    if(!is_id_found){
      //マーカがなければ、探索+DualPTailで基準輝度検索
      var th=this._threshold_detect.analyzeRaster(i_raster);
      this._threshold=(this._threshold+th)/2;
    }
    return;
  }
  /**
   *
   * @param i_new_detect_cf
   * @param i_exist_detect_cf
   */
  ,setConfidenceThreshold : function(i_new_cf,i_exist_cf)
  {
    this._detectmarker_cb.cf_threshold_exist=i_exist_cf;
    this._detectmarker_cb.cf_threshold_new=i_new_cf;
  },
  __NyARSquare_result : new NyARTransMatResult(),
  /**  オブジェクトのステータスを更新し、必要に応じてハンドル関数を駆動します。
   *   戻り値は、「実際にマーカを発見する事ができたか」です。クラスの状態とは異なります。
   */
  updateStatus : function(i_square,i_code_index)
  {
    var result = this.__NyARSquare_result;
    if (this._current_arcode_index < 0) {// 未認識中
      if (i_code_index < 0) {// 未認識から未認識の遷移
        // なにもしないよーん。
        return false;
      } else {// 未認識から認識の遷移
        this._current_arcode_index = i_code_index;
        // イベント生成
        // OnEnter
        this.onEnterHandler(i_code_index);
        // 変換行列を作成
        this._transmat.transMat(i_square, this._offset, result);
        // OnUpdate
        this.onUpdateHandler(i_square, result);
        this._lost_delay_count = 0;
        return true;
      }
    } else {// 認識中
      if (i_code_index < 0) {// 認識から未認識の遷移
        this._lost_delay_count++;
        if (this._lost_delay < this._lost_delay_count) {
          // OnLeave
          this._current_arcode_index = -1;
          this.onLeaveHandler();
        }
        return false;
      } else if (i_code_index == this._current_arcode_index) {// 同じARCodeの再認識
        // イベント生成
        // 変換行列を作成
        this._transmat.transMatContinue(i_square, this._offset, result);
        // OnUpdate
        this.onUpdateHandler(i_square, result);
        this._lost_delay_count = 0;
        return true;
      } else {// 異なるコードの認識→今はサポートしない。
        throw new  NyARException();
      }
    }
  }
  ,onEnterHandler : function(i_code)
  {
    throw new NyARException("onEnterHandler not implemented.");
  }
  ,onLeaveHandler : function()
  {
    throw new NyARException("onLeaveHandler not implemented.");
  }
  ,onUpdateHandler : function(i_square, result)
  {
    throw new NyARException("onUpdateHandler not implemented.");
  }
})











/**
 * detectMarkerのコールバック関数
 */
DetectSquareCB_1 = ASKlass('DetectSquareCB', NyARSquareContourDetector_IDetectMarkerCallback,
{
  //公開プロパティ
  square : new NyARSquare(),
  confidence : 0.0,
  code_index : -1,
  cf_threshold_new : 0.50,
  cf_threshold_exist : 0.30,
  //参照
  _ref_raster : null,
  //所有インスタンス
  _inst_patt : null,
  _deviation_data : null,
  _match_patt : null,
  __detectMarkerLite_mr : new NyARMatchPattResult(),
  _coordline : null,
  DetectSquareCB : function(i_param)
  {
    this._match_patt=null;
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    return;
  }
  ,setNyARCodeTable : function(i_ref_code,i_code_resolution)
  {
    /*unmanagedで実装するときは、ここでリソース解放をすること。*/
    this._deviation_data=new NyARMatchPattDeviationColorData(i_code_resolution,i_code_resolution);
    this._inst_patt=new NyARColorPatt_Perspective_O2(i_code_resolution,i_code_resolution,4,25);
    this._match_patt = new Array(i_ref_code.length);
    for(var i=0;i<i_ref_code.length;i++){
      this._match_patt[i]=new NyARMatchPatt_Color_WITHOUT_PCA(i_ref_code[i]);
    }
  },
  __tmp_vertex : NyARIntPoint2d.createArray(4),
  _target_id : 0,
  /**
  * Initialize call back handler.
  */
  init : function(i_raster,i_target_id)
  {
    this._ref_raster = i_raster;
    this._target_id=i_target_id;
    this.code_index=-1;
    this.confidence = Number.MIN_VALUE;
  }
  /**
  * 矩形が見付かるたびに呼び出されます。
  * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
  */
  ,onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num,i_vertex_index)
  {
    if (this._match_patt==null) {
      return;
    }
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    //画像を取得
    if (!this._inst_patt.pickFromRaster(this._ref_raster,vertex)){
      return;//取得失敗
    }
    //取得パターンをカラー差分データに変換して評価する。
    this._deviation_data.setRaster(this._inst_patt);
    //code_index,dir,c1にデータを得る。
    var mr=this.__detectMarkerLite_mr;
    var lcode_index = 0;
    var dir = 0;
    var c1 = 0;
    var i;
    for (i = 0; i < this._match_patt.length; i++) {
      this._match_patt[i].evaluate(this._deviation_data,mr);
      var c2 = mr.confidence;
      if (c1 < c2) {
        lcode_index = i;
        c1 = c2;
        dir = mr.direction;
      }
    }
    //認識処理
    if (this._target_id == -1) { // マーカ未認識
      //現在は未認識
      if (c1 < this.cf_threshold_new) {
        return;
      }
      if (this.confidence > c1) {
        // 一致度が低い。
        return;
      }
      //認識しているマーカIDを保存
      this.code_index=lcode_index;
    }else{
      //現在はマーカ認識中
      // 現在のマーカを認識したか？
      if (lcode_index != this._target_id) {
        // 認識中のマーカではないので無視
        return;
      }
      //認識中の閾値より大きいか？
      if (c1 < this.cf_threshold_exist) {
        return;
      }
      //現在の候補よりも一致度は大きいか？
      if (this.confidence>c1) {
        return;
      }
      this.code_index=this._target_id;
    }
    //新しく認識、または継続認識中に更新があったときだけ、Square情報を更新する。
    //ココから先はこの条件でしか実行されない。
    //一致率の高い矩形があれば、方位を考慮して頂点情報を作成
    this.confidence=c1;
    var sq=this.square;
    //directionを考慮して、squareを更新する。
    for(i=0;i<4;i++){
      var idx=(i+4 - dir) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i = 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
  }
})
SingleNyIdMarkerProcesser = ASKlass('SingleNyIdMarkerProcesser',
{
  /**
   * オーナーが自由に使えるタグ変数です。
   */
  tag : null,
  /**
   * ロスト遅延の管理
   */
  _lost_delay_count : 0,
  _lost_delay : 5,
  _square_detect : null,
  _transmat : null,
  _offset : null,
  _is_active : null,
  _current_threshold : 110,
  // [AR]検出結果の保存用
  _bin_raster : null,
  _tobin_filter : null,
  _callback : null,
  _data_current : null,
  SingleNyIdMarkerProcesser : function()
  {
    return;
  },
  _initialized : false,
  initInstance : function(i_param, i_encoder ,i_marker_width, i_raster_format)
  {
    //初期化済？
    NyAS3Utils.assert(this._initialized==false);
    var scr_size = i_param.getScreenSize();
    // 解析オブジェクトを作る
    this._square_detect = new NyARSquareContourDetector_Rle(scr_size);
    this._transmat = new NyARTransMat(i_param);
    this._callback=new DetectSquareCB_2(i_param,i_encoder);
    // ２値画像バッファを作る
    this._bin_raster = new NyARBinRaster(scr_size.w, scr_size.h);
    //ワーク用のデータオブジェクトを２個作る
    this._data_current=i_encoder.createDataInstance();
    this._tobin_filter =new NyARRasterFilter_ARToolkitThreshold(110,i_raster_format);
    this._threshold_detect=new NyARRasterThresholdAnalyzer_SlidePTile(15,i_raster_format,4);
    this._initialized=true;
    this._is_active=false;
    this._offset = new NyARRectOffset();
    this._offset.setSquare(i_marker_width);
    return;
  }
  ,setMarkerWidth : function(i_width)
  {
    this._offset.setSquare(i_width);
    return;
  }
  ,reset : function(i_is_force)
  {
    if (i_is_force == false && this._is_active){
      // 強制書き換えでなければイベントコール
      this.onLeaveHandler();
    }
    //マーカ無効
    this._is_active=false;
    return;
  }
  ,detectMarker : function(i_raster)
  {
    // サイズチェック
    if (!this._bin_raster.getSize().isEqualSize_int(i_raster.getSize().w, i_raster.getSize().h)) {
      throw new NyARException();
    }
    // ラスタを２値イメージに変換する.
    this._tobin_filter.setThreshold(this._current_threshold);
    this._tobin_filter.doFilter(i_raster, this._bin_raster);
    // スクエアコードを探す(第二引数に指定したマーカ、もしくは新しいマーカを探す。)
    this._callback.init(i_raster,this._is_active?this._data_current:null);
    this._square_detect.detectMarkerCB(this._bin_raster, this._callback);
    // 認識状態を更新(マーカを発見したなら、current_dataを渡すかんじ)
    var is_id_found=updateStatus(this._callback.square,this._callback.marker_data);
    //閾値フィードバック(detectExistMarkerにもあるよ)
    if(is_id_found){
      //マーカがあれば、マーカの周辺閾値を反映
      this._current_threshold=(this._current_threshold+this._callback.threshold)/2;
    }else{
      //マーカがなければ、探索+DualPTailで基準輝度検索
      var th=this._threshold_detect.analyzeRaster(i_raster);
      this._current_threshold=(this._current_threshold+th)/2;
    }
    return;
  },
  _threshold_detect : null,
  __NyARSquare_result : new NyARTransMatResult(),
  /**オブジェクトのステータスを更新し、必要に応じてハンドル関数を駆動します。
   */
  updateStatus : function(i_square,i_marker_data)
  {
    var is_id_found=false;
    var result = this.__NyARSquare_result;
    if (!this._is_active) {// 未認識中
      if (i_marker_data==null) {// 未認識から未認識の遷移
        // なにもしないよーん。
        this._is_active=false;
      } else {// 未認識から認識の遷移
        this._data_current.copyFrom(i_marker_data);
        // イベント生成
        // OnEnter
        this.onEnterHandler(this._data_current);
        // 変換行列を作成
        this._transmat.transMat(i_square, this._offset, result);
        // OnUpdate
        this.onUpdateHandler(i_square, result);
        this._lost_delay_count = 0;
        this._is_active=true;
        is_id_found=true;
      }
    } else {// 認識中
      if (i_marker_data==null) {
        // 認識から未認識の遷移
        this._lost_delay_count++;
        if (this._lost_delay < this._lost_delay_count) {
          // OnLeave
          this.onLeaveHandler();
          this._is_active=false;
        }
      } else if(this._data_current.isEqual(i_marker_data)) {
        //同じidの再認識
        this._transmat.transMatContinue(i_square, this._offset, result);
        // OnUpdate
        this.onUpdateHandler(i_square, result);
        this._lost_delay_count = 0;
        is_id_found=true;
      } else {// 異なるコードの認識→今はサポートしない。
        throw new  NyARException();
      }
    }
    return is_id_found;
  }
  //通知ハンドラ
  ,onEnterHandler : function(i_code)
  {
    throw new NyARException("onEnterHandler not implemented.");
  }
  ,onLeaveHandler : function()
  {
    throw new NyARException("onLeaveHandler not implemented.");
  }
  ,onUpdateHandler : function(i_square, result)
  {
    throw new NyARException("onUpdateHandler not implemented.");
  }
})













/**
 * detectMarkerのコールバック関数
 */
DetectSquareCB_2 = ASKlass('DetectSquareCB', NyARSquareContourDetector_IDetectMarkerCallback,
{
  //公開プロパティ
  square : new NyARSquare(),
  marker_data : null,
  threshold : 0,
  //参照
  _ref_raster : null,
  //所有インスタンス
  _current_data : null,
  _id_pickup : new NyIdMarkerPickup(),
  _coordline : null,
  _encoder : null,
  _data_temp : null,
  _prev_data : null,
  DetectSquareCB : function(i_param,i_encoder)
  {
    this._coordline=new NyARCoord2Linear(i_param.getScreenSize(),i_param.getDistortionFactor());
    this._data_temp=i_encoder.createDataInstance();
    this._current_data=i_encoder.createDataInstance();
    this._encoder=i_encoder;
    return;
  },
  __tmp_vertex : NyARIntPoint2d.createArray(4),
  /**
  * Initialize call back handler.
  */
  init : function(i_raster,i_prev_data)
  {
    this.marker_data=null;
    this._prev_data=i_prev_data;
    this._ref_raster=i_raster;
  },
  _marker_param : new NyIdMarkerParam(),
  _marker_data : new NyIdMarkerPattern(),
  /**
  * 矩形が見付かるたびに呼び出されます。
  * 発見した矩形のパターンを検査して、方位を考慮した頂点データを確保します。
  */
  onSquareDetect : function(i_sender,i_coordx,i_coordy,i_coor_num,i_vertex_index)
  {
    //既に発見済なら終了
    if(this.marker_data!=null){
      return;
    }
    //輪郭座標から頂点リストに変換
    var vertex=this.__tmp_vertex;
    vertex[0].x=i_coordx[i_vertex_index[0]];
    vertex[0].y=i_coordy[i_vertex_index[0]];
    vertex[1].x=i_coordx[i_vertex_index[1]];
    vertex[1].y=i_coordy[i_vertex_index[1]];
    vertex[2].x=i_coordx[i_vertex_index[2]];
    vertex[2].y=i_coordy[i_vertex_index[2]];
    vertex[3].x=i_coordx[i_vertex_index[3]];
    vertex[3].y=i_coordy[i_vertex_index[3]];
    var param=this._marker_param;
    var patt_data=this._marker_data;
    // 評価基準になるパターンをイメージから切り出す
    if (!this._id_pickup.pickFromRaster(this._ref_raster,vertex, patt_data, param)){
      return;
    }
    //エンコード
    if(!this._encoder.encode(patt_data,this._data_temp)){
      return;
    }
    //継続認識要求されている？
    if (this._prev_data==null){
      //継続認識要求なし
      this._current_data.copyFrom(this._data_temp);
    }else{
      //継続認識要求あり
      if(!this._prev_data.isEqual((this._data_temp))){
        return;//認識請求のあったIDと違う。
      }
    }
    //新しく認識、または継続認識中に更新があったときだけ、Square情報を更新する。
    //ココから先はこの条件でしか実行されない。
    var sq=this.square;
    //directionを考慮して、squareを更新する。
    var i;
    for(i=0;i<4;i++){
      var idx=(i+4 - param.direction) % 4;
      this._coordline.coord2Line(i_vertex_index[idx],i_vertex_index[(idx+1)%4],i_coordx,i_coordy,i_coor_num,sq.line[i]);
    }
    for (i= 0; i < 4; i++) {
      //直線同士の交点計算
      if(!NyARLinear.crossPos(sq.line[i],sq.line[(i + 3) % 4],sq.sqvertex[i])){
        throw new NyARException();//ここのエラー復帰するならダブルバッファにすればOK
      }
    }
    this.threshold=param.threshold;
    this.marker_data=this._current_data;//みつかった。
  }
})
/*
 * JSARToolkit
 * --------------------------------------------------------------------------------
 * This work is based on the original ARToolKit developed by
 *   Hirokazu Kato
 *   Mark Billinghurst
 *   HITLab, University of Washington, Seattle
 * http://www.hitl.washington.edu/artoolkit/
 *
 * And the NyARToolkitAS3 ARToolKit class library.
 *   Copyright (C)2010 Ryo Iizuka
 *
 * JSARToolkit is a JavaScript port of NyARToolkitAS3.
 *   Copyright (C)2010 Ilmari Heikkinen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * For further information please contact.
 *  ilmari.heikkinen@gmail.com
 *
 */





/**
 * マーカの周辺領域からビットマップを取得する方法を提供します。
 * 比較的負荷が大きいので、連続してパターンを取得し続ける用途には向いていません。
 *
 */
TransformedBitmapPickup = ASKlass('TransformedBitmapPickup', NyARColorPatt_Perspective_O2,
{
  _work_points : NyARIntPoint2d.createArray(4),
  _ref_perspective : null,
  /**
   *
   * @param i_width
   * 取得するビットマップの幅
   * @param i_height
   * 取得するビットマップの解像度
   * @param i_resolution
   * resolution of reading pixel per point. ---- 取得時の解像度。高解像度のときは1を指定してください。低解像度のときは2以上を指定します。
   */
  TransformedBitmapPickup : function(i_ref_cparam,i_width,i_height,i_resolution)
  {
    NyARColorPatt_Perspective_O2.initialize.call(this,i_width, i_height, i_resolution, 0);
    this._ref_perspective = i_ref_cparam;
  }
  /**
   * This ,retrieves bitmap from the area defined by RECT : function(i_l,i_t,i_r,i_b) above transform matrix i_base_mat.
   * ----
   * この関数は、basementで示される平面のAで定義される領域から、ビットマップを読み出します。
   * 例えば、8cmマーカでRECT(i_l,i_t,i_r,i_b)に-40,0,0,-40.0を指定すると、マーカの左下部分の画像を抽出します。
   *
   * マーカから離れた場所になるほど、また、マーカの鉛直方向から外れるほど誤差が大きくなります。
   * @param i_src_imege
   * 詠み出し元の画像を指定します。
   * @param i_l
   * 基準点からの左上の相対座標（x）を指定します。
   * @param i_t
   * 基準点からの左上の相対座標（y）を指定します。
   * @param i_r
   * 基準点からの右下の相対座標（x）を指定します。
   * @param i_b
   * 基準点からの右下の相対座標（y）を指定します。
   * @param i_base_mat
   * @return 画像の取得の成否を返す。
   */
  ,pickupImage2d : function(i_src_imege,i_l,i_t,i_r,i_b,i_base_mat)
  {
    var cp00, cp01, cp02, cp11, cp12;
    cp00 = this._ref_perspective.m00;
    cp01 = this._ref_perspective.m01;
    cp02 = this._ref_perspective.m02;
    cp11 = this._ref_perspective.m11;
    cp12 = this._ref_perspective.m12;
    //マーカと同一平面上にある矩形の4個の頂点を座標変換して、射影変換して画面上の
    //頂点を計算する。
    //[hX,hY,h]=[P][RT][x,y,z]
    //出力先
    var poinsts = this._work_points;
    var yt0,yt1,yt2;
    var x3, y3, z3;
    var m00=i_base_mat.m00;
    var m10=i_base_mat.m10;
    var m20=i_base_mat.m20;
    //yとtの要素を先に計算
    yt0=i_base_mat.m01 * i_t+i_base_mat.m03;
    yt1=i_base_mat.m11 * i_t+i_base_mat.m13;
    yt2=i_base_mat.m21 * i_t+i_base_mat.m23;
    // l,t
    x3 = m00 * i_l + yt0;
    y3 = m10 * i_l + yt1;
    z3 = m20 * i_l + yt2;
    poinsts[0].x = toInt ((x3 * cp00 + y3 * cp01 + z3 * cp02) / z3);
    poinsts[0].y = toInt ((y3 * cp11 + z3 * cp12) / z3);
    // r,t
    x3 = m00 * i_r + yt0;
    y3 = m10 * i_r + yt1;
    z3 = m20 * i_r + yt2;
    poinsts[1].x = toInt ((x3 * cp00 + y3 * cp01 + z3 * cp02) / z3);
    poinsts[1].y = toInt ((y3 * cp11 + z3 * cp12) / z3);
    //yとtの要素を先に計算
    yt0=i_base_mat.m01 * i_b+i_base_mat.m03;
    yt1=i_base_mat.m11 * i_b+i_base_mat.m13;
    yt2=i_base_mat.m21 * i_b+i_base_mat.m23;
    // r,b
    x3 = m00 * i_r + yt0;
    y3 = m10 * i_r + yt1;
    z3 = m20 * i_r + yt2;
    poinsts[2].x = toInt ((x3 * cp00 + y3 * cp01 + z3 * cp02) / z3);
    poinsts[2].y = toInt ((y3 * cp11 + z3 * cp12) / z3);
    // l,b
    x3 = m00 * i_l + yt0;
    y3 = m10 * i_l + yt1;
    z3 = m20 * i_l + yt2;
    poinsts[3].x = toInt ((x3 * cp00 + y3 * cp01 + z3 * cp02) / z3);
    poinsts[3].y = toInt ((y3 * cp11 + z3 * cp12) / z3);
    return this.pickFromRaster(i_src_imege, poinsts);
  }
})
