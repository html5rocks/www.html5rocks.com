importScripts('ifl.js');

//setup parser
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFlash3DLibrary",      ifl.IFLLibrary );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLBitmap",          ifl.IFLBitmap );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLCamera",          ifl.IFLCamera );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLColor",           ifl.IFLColor );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLFolder",          ifl.IFLFolder );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLIndexBuffer",       ifl.IFLIndexBuffer );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLJoint",           ifl.IFLJoint );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLJointBind",         ifl.IFLJointBind );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLLight",           ifl.IFLLight );
//ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLLine",           {}.constructor );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLMaterial",        ifl.IFLMaterial );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLMesh",          ifl.IFLMesh );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLMeshContainer",     ifl.IFLMeshContainer );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLNode",          ifl.IFLNode );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLQuaternion",        {}.constructor );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLID",            ifl.IFLID );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLSubMesh",         ifl.IFLSubMesh );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLVertexBuffer",      ifl.IFLVertexBuffer );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLVertexBufferDecomposed",  ifl.IFLVertexBufferDecomposed );

ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLAnimation",         ifl.IFLAnimation );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLAnimationSamplerMatrix3D",ifl.IFLAnimationSamplerMatrix3D );
ifl.IFLParser.setKnownClass("com.iflash3d.library::IFLAnimationTrack",      ifl.IFLAnimationTrack );

ifl.IFLParser.setKnownInterface("com.iflash3d.library::IIFLAnimationSampler",   true );
ifl.IFLParser.setKnownInterface("com.iflash3d.library::IIFLBoundSkin",      true );
ifl.IFLParser.setKnownInterface("com.iflash3d.library::IIFLContent",      true ); 

this.onmessage = function(event) 
{
    switch(event.data.type)
    {
      case "inflate":
        var uint8Bytes = new Uint8Array(event.data.data);
        var decompressed = Inflate(uint8Bytes,
          function(parsed,total)
          {
            postMessage({type:"progress",subtype:"inflate",data:{progress:parsed,total:total}});
          });
        postMessage({type:"inflate",data:decompressed,callback:event.data.callback});
        break;
      case "convert_library":
        var ba = new amf.ByteArray(event.data.data, amf.Endian.BIG);
        ba.progressCallback = function(parsed,total)
        {
          postMessage({type:"progress",subtype:"convert_library",data:{progress:parsed,total:total}});
        }

        ba.objectEncoding = amf.ObjectEncoding.AMF3;
        var library = ba.readObject();
        ba.dispose();
        postMessage({type:"convert_library",data:library,callback:event.data.callback});
        break;
      case "parse_jpg":
        var jpegParser = new JpegImage()
        var converted = null;
        try
        {
          jpegParser.parse(event.data.image)
          converted = jpegParser.getData(event.data.w,event.data.h)
        }
        catch(error){}
        postMessage({type:"parse_jpg",data:converted,callback:event.data.callback});
        break;      

      case "convert_argb":
        var converted = ConvertARGB(event.data.image)
        postMessage({type:"convert_argb",data:converted,callback:event.data.callback});
        break;
        
      case "kill":
        close();
        break;
    }
  };


var ConvertARGB = (function (ba){

  var ba2 = new Uint8Array(ba.length);
  for (var i = 0;i<ba.length; i+=4)
  {
    ba2[i] = ba[i+1]
    ba2[i+1] = ba[i+2]
    ba2[i+2] = ba[i+3]
    ba2[i+3] = ba[i]
  }
  return ba2

})

/*
 * $Id: rawinflate.js,v 0.2 2009/03/01 18:32:24 dankogai Exp $
 *
 * original:
 * http://www.onicos.com/staff/iz/amuse/javascript/expert/inflate.txt
 */

var Inflate = (function inflate() {

/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0.0.1
 * LastModified: Dec 25 1999
 */

/* Interface:
 * data = zip_inflate(src);
 */

/* constant parameters */
var zip_WSIZE = 32768;    // Sliding Window size
var zip_STORED_BLOCK = 0;
var zip_STATIC_TREES = 1;
var zip_DYN_TREES    = 2;

/* for inflate */
var zip_lbits = 9;    // bits in base literal/length lookup table
var zip_dbits = 6;    // bits in base distance lookup table
var zip_INBUFSIZ = 32768; // Input buffer size
var zip_INBUF_EXTRA = 64; // Extra buffer

/* variables (inflate) */
var zip_slide;
var zip_wp;     // current position in slide
var zip_fixed_tl = null;  // inflate static
var zip_fixed_td;   // inflate static
var zip_fixed_bl, fixed_bd; // inflate static
var zip_bit_buf;    // bit buffer
var zip_bit_len;    // bits in bit buffer
var zip_method;
var zip_eof;
var zip_copy_leng;
var zip_copy_dist;
var zip_tl, zip_td; // literal/length and distance decoder tables
var zip_bl, zip_bd; // number of bits decoded by tl and td

var zip_inflate_data;
var zip_inflate_pos;


/* constant tables (inflate) */
var zip_MASK_BITS = new Array(
    0x0000,
    0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
    0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff);
// Tables for deflate from PKZIP's appnote.txt.
var zip_cplens = new Array( // Copy lengths for literal codes 257..285
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
    35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0);
/* note: see note #13 above about the 258 in this list. */
var zip_cplext = new Array( // Extra bits for literal codes 257..285
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
    3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99); // 99==invalid
var zip_cpdist = new Array( // Copy offsets for distance codes 0..29
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
    8193, 12289, 16385, 24577);
var zip_cpdext = new Array( // Extra bits for distance codes
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
    12, 12, 13, 13);
var zip_border = new Array(  // Order of the bit length code lengths
    16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15);
/* objects (inflate) */

var zip_HuftList = function() {
    this.next = null;
    this.list = null;
}

var zip_HuftNode = function() {
    this.e = 0; // number of extra bits or operation
    this.b = 0; // number of bits in this code or subcode

    // union
    this.n = 0; // literal, length base, or distance base
    this.t = null; // (zip_HuftNode) pointer to next level of table
}

var zip_HuftBuild = function(b, // code lengths in bits (all assumed <= BMAX)
           n, // number of codes (assumed <= N_MAX)
           s, // number of simple-valued codes (0..s-1)
           d, // list of base values for non-simple codes
           e, // list of extra bits for non-simple codes
           mm // maximum lookup bits
       ) {
    this.BMAX = 16;   // maximum bit length of any code
    this.N_MAX = 288; // maximum number of codes in any set
    this.status = 0;  // 0: success, 1: incomplete table, 2: bad input
    this.root = null; // (zip_HuftList) starting table
    this.m = 0;   // maximum lookup bits, returns actual

/* Given a list of code lengths and a maximum table size, make a set of
   tables to decode that set of codes.  Return zero on success, one if
   the given code set is incomplete (the tables are still built in this
   case), two if the input is invalid (all zero length codes or an
   oversubscribed set of lengths), and three if not enough memory.
   The code with value 256 is special, and the tables are constructed
   so that no bits beyond that code are fetched when that code is
   decoded. */
    {
  var a;      // counter for codes of length k
  var c = new Array(this.BMAX+1); // bit length count table
  var el;     // length of EOB code (value 256)
  var f;      // i repeats in table every f entries
  var g;      // maximum code length
  var h;      // table level
  var i;      // counter, current code
  var j;      // counter
  var k;      // number of bits in current code
  var lx = new Array(this.BMAX+1);  // stack of bits per table
  var p;      // pointer into c[], b[], or v[]
  var pidx;   // index of p
  var q;      // (zip_HuftNode) points to current table
  var r = new zip_HuftNode(); // table entry for structure assignment
  var u = new Array(this.BMAX); // zip_HuftNode[BMAX][]  table stack
  var v = new Array(this.N_MAX); // values in order of bit length
  var w;
  var x = new Array(this.BMAX+1);// bit offsets, then code stack
  var xp;     // pointer into x or c
  var y;      // number of dummy codes added
  var z;      // number of entries in current table
  var o;
  var tail;   // (zip_HuftList)

  tail = this.root = null;
  for(i = 0; i < c.length; i++)
      c[i] = 0;
  for(i = 0; i < lx.length; i++)
      lx[i] = 0;
  for(i = 0; i < u.length; i++)
      u[i] = null;
  for(i = 0; i < v.length; i++)
      v[i] = 0;
  for(i = 0; i < x.length; i++)
      x[i] = 0;

  // Generate counts for each bit length
  el = n > 256 ? b[256] : this.BMAX; // set length of EOB code, if any
  p = b; pidx = 0;
  i = n;
  do {
      c[p[pidx]]++; // assume all entries <= BMAX
      pidx++;
  } while(--i > 0);
  if(c[0] == n) { // null input--all zero length codes
      this.root = null;
      this.m = 0;
      this.status = 0;
      return;
  }

  // Find minimum and maximum length, bound *m by those
  for(j = 1; j <= this.BMAX; j++)
      if(c[j] != 0)
    break;
  k = j;      // minimum code length
  if(mm < j)
      mm = j;
  for(i = this.BMAX; i != 0; i--)
      if(c[i] != 0)
    break;
  g = i;      // maximum code length
  if(mm > i)
      mm = i;

  // Adjust last length count to fill out codes, if needed
  for(y = 1 << j; j < i; j++, y <<= 1)
      if((y -= c[j]) < 0) {
    this.status = 2;  // bad input: more codes than bits
    this.m = mm;
    return;
      }
  if((y -= c[i]) < 0) {
      this.status = 2;
      this.m = mm;
      return;
  }
  c[i] += y;

  // Generate starting offsets into the value table for each length
  x[1] = j = 0;
  p = c;
  pidx = 1;
  xp = 2;
  while(--i > 0)    // note that i == g from above
      x[xp++] = (j += p[pidx++]);

  // Make a table of values in order of bit lengths
  p = b; pidx = 0;
  i = 0;
  do {
      if((j = p[pidx++]) != 0)
    v[x[j]++] = i;
  } while(++i < n);
  n = x[g];     // set n to length of v

  // Generate the Huffman codes and for each, make the table entries
  x[0] = i = 0;   // first Huffman code is zero
  p = v; pidx = 0;    // grab values in bit order
  h = -1;     // no tables yet--level -1
  w = lx[0] = 0;    // no bits decoded yet
  q = null;     // ditto
  z = 0;      // ditto

  // go through the bit lengths (k already is bits in shortest code)
  for(; k <= g; k++) {
      a = c[k];
      while(a-- > 0) {
    // here i is the Huffman code of length k bits for value p[pidx]
    // make tables up to required level
    while(k > w + lx[1 + h]) {
        w += lx[1 + h]; // add bits already decoded
        h++;

        // compute minimum size table less than or equal to *m bits
        z = (z = g - w) > mm ? mm : z; // upper limit
        if((f = 1 << (j = k - w)) > a + 1) { // try a k-w bit table
      // too few codes for k-w bit table
      f -= a + 1; // deduct codes from patterns left
      xp = k;
      while(++j < z) { // try smaller tables up to z bits
          if((f <<= 1) <= c[++xp])
        break;  // enough codes to use up j bits
          f -= c[xp]; // else deduct codes from patterns
      }
        }
        if(w + j > el && w < el)
      j = el - w; // make EOB code end at table
        z = 1 << j; // table entries for j-bit table
        lx[1 + h] = j; // set table size in stack

        // allocate and link in new table
        q = new Array(z);
        for(o = 0; o < z; o++) {
      q[o] = new zip_HuftNode();
        }

        if(tail == null)
      tail = this.root = new zip_HuftList();
        else
      tail = tail.next = new zip_HuftList();
        tail.next = null;
        tail.list = q;
        u[h] = q; // table starts after link

        /* connect to last table, if there is one */
        if(h > 0) {
      x[h] = i;   // save pattern for backing up
      r.b = lx[h];  // bits to dump before this table
      r.e = 16 + j; // bits in this table
      r.t = q;    // pointer to this table
      j = (i & ((1 << w) - 1)) >> (w - lx[h]);
      u[h-1][j].e = r.e;
      u[h-1][j].b = r.b;
      u[h-1][j].n = r.n;
      u[h-1][j].t = r.t;
        }
    }

    // set up table entry in r
    r.b = k - w;
    if(pidx >= n)
        r.e = 99;   // out of values--invalid code
    else if(p[pidx] < s) {
        r.e = (p[pidx] < 256 ? 16 : 15); // 256 is end-of-block code
        r.n = p[pidx++];  // simple code is just the value
    } else {
        r.e = e[p[pidx] - s]; // non-simple--look up in lists
        r.n = d[p[pidx++] - s];
    }

    // fill code-like entries with r //
    f = 1 << (k - w);
    for(j = i >> w; j < z; j += f) {
        q[j].e = r.e;
        q[j].b = r.b;
        q[j].n = r.n;
        q[j].t = r.t;
    }

    // backwards increment the k-bit code i
    for(j = 1 << (k - 1); (i & j) != 0; j >>= 1)
        i ^= j;
    i ^= j;

    // backup over finished tables
    while((i & ((1 << w) - 1)) != x[h]) {
        w -= lx[h];   // don't need to update q
        h--;
    }
      }
  }

  /* return actual size of base table */
  this.m = lx[1];

  /* Return true (1) if we were given an incomplete table */
  this.status = ((y != 0 && g != 1) ? 1 : 0);
    } /* end of constructor */
}


/* routines (inflate) */

var zip_GET_BYTE = function() {
    if(zip_inflate_data.length == zip_inflate_pos)
    return -1;
    return zip_inflate_data[zip_inflate_pos++];//.charCodeAt(zip_inflate_pos++) & 0xff;
}

var zip_NEEDBITS = function(n) {
    while(zip_bit_len < n) {
  zip_bit_buf |= zip_GET_BYTE() << zip_bit_len;
  zip_bit_len += 8;
    }
}

var zip_GETBITS = function(n) {
    return zip_bit_buf & zip_MASK_BITS[n];
}

var zip_DUMPBITS = function(n) {
    zip_bit_buf >>= n;
    zip_bit_len -= n;
}

var zip_inflate_codes = function(buff, off, size) {
    /* inflate (decompress) the codes in a deflated (compressed) block.
       Return an error code or zero if it all goes ok. */
    var e;    // table entry flag/number of extra bits
    var t;    // (zip_HuftNode) pointer to table entry
    var n;

    if(size == 0)
      return 0;

    // inflate the coded data
    n = 0;
    for(;;) {     // do until end of block
  zip_NEEDBITS(zip_bl);
  t = zip_tl.list[zip_GETBITS(zip_bl)];
  e = t.e;
  while(e > 16) {
      if(e == 99)
    return -1;
      zip_DUMPBITS(t.b);
      e -= 16;
      zip_NEEDBITS(e);
      t = t.t[zip_GETBITS(e)];
      e = t.e;
  }
  zip_DUMPBITS(t.b);

  if(e == 16) {   // then it's a literal
      zip_wp &= zip_WSIZE - 1;
      buff[off + n++] = zip_slide[zip_wp++] = t.n;
      if(n == size)
    return size;
      continue;
  }

  // exit if end of block
  if(e == 15)
      break;

  // it's an EOB or a length

  // get length of block to copy
  zip_NEEDBITS(e);
  zip_copy_leng = t.n + zip_GETBITS(e);
  zip_DUMPBITS(e);

  // decode distance of block to copy
  zip_NEEDBITS(zip_bd);
  t = zip_td.list[zip_GETBITS(zip_bd)];
  e = t.e;

  while(e > 16) {
      if(e == 99)
    return -1;
      zip_DUMPBITS(t.b);
      e -= 16;
      zip_NEEDBITS(e);
      t = t.t[zip_GETBITS(e)];
      e = t.e;
  }
  zip_DUMPBITS(t.b);
  zip_NEEDBITS(e);
  zip_copy_dist = zip_wp - t.n - zip_GETBITS(e);
  zip_DUMPBITS(e);

  // do the copy
  while(zip_copy_leng > 0 && n < size) {
      zip_copy_leng--;
      zip_copy_dist &= zip_WSIZE - 1;
      zip_wp &= zip_WSIZE - 1;
      buff[off + n++] = zip_slide[zip_wp++]
    = zip_slide[zip_copy_dist++];
  }

  if(n == size)
      return size;
    }

    zip_method = -1; // done
    return n;
}

var zip_inflate_stored = function(buff, off, size) {
    /* "decompress" an inflated type 0 (stored) block. */
    var n;

    // go to byte boundary
    n = zip_bit_len & 7;
    zip_DUMPBITS(n);

    // get the length and its complement
    zip_NEEDBITS(16);
    n = zip_GETBITS(16);
    zip_DUMPBITS(16);
    zip_NEEDBITS(16);
    if(n != ((~zip_bit_buf) & 0xffff))
  return -1;      // error in compressed data
    zip_DUMPBITS(16);

    // read and output the compressed data
    zip_copy_leng = n;

    n = 0;
    while(zip_copy_leng > 0 && n < size) {
  zip_copy_leng--;
  zip_wp &= zip_WSIZE - 1;
  zip_NEEDBITS(8);
  buff[off + n++] = zip_slide[zip_wp++] =
      zip_GETBITS(8);
  zip_DUMPBITS(8);
    }

    if(zip_copy_leng == 0)
      zip_method = -1; // done
    return n;
}

var zip_inflate_fixed = function(buff, off, size) {
    /* decompress an inflated type 1 (fixed Huffman codes) block.  We should
       either replace this with a custom decoder, or at least precompute the
       Huffman tables. */

    // if first time, set up tables for fixed blocks
    if(zip_fixed_tl == null) {
  var i;      // temporary variable
  var l = new Array(288); // length list for huft_build
  var h;  // zip_HuftBuild

  // literal table
  for(i = 0; i < 144; i++)
      l[i] = 8;
  for(; i < 256; i++)
      l[i] = 9;
  for(; i < 280; i++)
      l[i] = 7;
  for(; i < 288; i++) // make a complete, but wrong code set
      l[i] = 8;
  zip_fixed_bl = 7;

  h = new zip_HuftBuild(l, 288, 257, zip_cplens, zip_cplext,
            zip_fixed_bl);
  if(h.status != 0) {
      alert("HufBuild error: "+h.status);
      return -1;
  }
  zip_fixed_tl = h.root;
  zip_fixed_bl = h.m;

  // distance table
  for(i = 0; i < 30; i++) // make an incomplete code set
      l[i] = 5;
  zip_fixed_bd = 5;

  h = new zip_HuftBuild(l, 30, 0, zip_cpdist, zip_cpdext, zip_fixed_bd);
  if(h.status > 1) {
      zip_fixed_tl = null;
      alert("HufBuild error: "+h.status);
      return -1;
  }
  zip_fixed_td = h.root;
  zip_fixed_bd = h.m;
    }

    zip_tl = zip_fixed_tl;
    zip_td = zip_fixed_td;
    zip_bl = zip_fixed_bl;
    zip_bd = zip_fixed_bd;
    return zip_inflate_codes(buff, off, size);
}

var zip_inflate_dynamic = function(buff, off, size) {
    // decompress an inflated type 2 (dynamic Huffman codes) block.
    var i;    // temporary variables
    var j;
    var l;    // last length
    var n;    // number of lengths to get
    var t;    // (zip_HuftNode) literal/length code table
    var nb;   // number of bit length codes
    var nl;   // number of literal/length codes
    var nd;   // number of distance codes
    var ll = new Array(286+30); // literal/length and distance code lengths
    var h;    // (zip_HuftBuild)

    for(i = 0; i < ll.length; i++)
  ll[i] = 0;

    // read in table lengths
    zip_NEEDBITS(5);
    nl = 257 + zip_GETBITS(5);  // number of literal/length codes
    zip_DUMPBITS(5);
    zip_NEEDBITS(5);
    nd = 1 + zip_GETBITS(5);  // number of distance codes
    zip_DUMPBITS(5);
    zip_NEEDBITS(4);
    nb = 4 + zip_GETBITS(4);  // number of bit length codes
    zip_DUMPBITS(4);
    if(nl > 286 || nd > 30)
      return -1;    // bad lengths

    // read in bit-length-code lengths
    for(j = 0; j < nb; j++)
    {
  zip_NEEDBITS(3);
  ll[zip_border[j]] = zip_GETBITS(3);
  zip_DUMPBITS(3);
    }
    for(; j < 19; j++)
  ll[zip_border[j]] = 0;

    // build decoding table for trees--single level, 7 bit lookup
    zip_bl = 7;
    h = new zip_HuftBuild(ll, 19, 19, null, null, zip_bl);
    if(h.status != 0)
  return -1;  // incomplete code set

    zip_tl = h.root;
    zip_bl = h.m;

    // read in literal and distance code lengths
    n = nl + nd;
    i = l = 0;
    while(i < n) {
  zip_NEEDBITS(zip_bl);
  t = zip_tl.list[zip_GETBITS(zip_bl)];
  j = t.b;
  zip_DUMPBITS(j);
  j = t.n;
  if(j < 16)    // length of code in bits (0..15)
      ll[i++] = l = j;  // save last length in l
  else if(j == 16) {  // repeat last length 3 to 6 times
      zip_NEEDBITS(2);
      j = 3 + zip_GETBITS(2);
      zip_DUMPBITS(2);
      if(i + j > n)
    return -1;
      while(j-- > 0)
    ll[i++] = l;
  } else if(j == 17) {  // 3 to 10 zero length codes
      zip_NEEDBITS(3);
      j = 3 + zip_GETBITS(3);
      zip_DUMPBITS(3);
      if(i + j > n)
    return -1;
      while(j-- > 0)
    ll[i++] = 0;
      l = 0;
  } else {    // j == 18: 11 to 138 zero length codes
      zip_NEEDBITS(7);
      j = 11 + zip_GETBITS(7);
      zip_DUMPBITS(7);
      if(i + j > n)
    return -1;
      while(j-- > 0)
    ll[i++] = 0;
      l = 0;
  }
    }

    // build the decoding tables for literal/length and distance codes
    zip_bl = zip_lbits;
    h = new zip_HuftBuild(ll, nl, 257, zip_cplens, zip_cplext, zip_bl);
    if(zip_bl == 0) // no literals or lengths
  h.status = 1;
    if(h.status != 0) {
  if(h.status == 1)
      ;// **incomplete literal tree**
  return -1;    // incomplete code set
    }
    zip_tl = h.root;
    zip_bl = h.m;

    for(i = 0; i < nd; i++)
  ll[i] = ll[i + nl];
    zip_bd = zip_dbits;
    h = new zip_HuftBuild(ll, nd, 0, zip_cpdist, zip_cpdext, zip_bd);
    zip_td = h.root;
    zip_bd = h.m;

    if(zip_bd == 0 && nl > 257) {   // lengths but no distances
  // **incomplete distance tree**
  return -1;
    }

    if(h.status == 1) {
  ;// **incomplete distance tree**
    }
    if(h.status != 0)
  return -1;

    // decompress until an end-of-block code
    return zip_inflate_codes(buff, off, size);
}

var zip_inflate_start = function() {
    var i;

    if(zip_slide == null)
  zip_slide = new Array(2 * zip_WSIZE);
    zip_wp = 0;
    zip_bit_buf = 0;
    zip_bit_len = 0;
    zip_method = -1;
    zip_eof = false;
    zip_copy_leng = zip_copy_dist = 0;
    zip_tl = null;
}

var zip_inflate_internal = function(buff, off, size) {
    // decompress an inflated entry
    var n, i;

    n = 0;
    while(n < size) {
  if(zip_eof && zip_method == -1)
      return n;

  if(zip_copy_leng > 0) {
      if(zip_method != zip_STORED_BLOCK) {
    // STATIC_TREES or DYN_TREES
    while(zip_copy_leng > 0 && n < size) {
        zip_copy_leng--;
        zip_copy_dist &= zip_WSIZE - 1;
        zip_wp &= zip_WSIZE - 1;
        buff[off + n++] = zip_slide[zip_wp++] =
      zip_slide[zip_copy_dist++];
    }
      } else {
    while(zip_copy_leng > 0 && n < size) {
        zip_copy_leng--;
        zip_wp &= zip_WSIZE - 1;
        zip_NEEDBITS(8);
        buff[off + n++] = zip_slide[zip_wp++] = zip_GETBITS(8);
        zip_DUMPBITS(8);
    }
    if(zip_copy_leng == 0)
        zip_method = -1; // done
      }
      if(n == size)
    return n;
  }

  if(zip_method == -1) {
      if(zip_eof)
    break;

      // read in last block bit
      zip_NEEDBITS(1);
      if(zip_GETBITS(1) != 0)
    zip_eof = true;
      zip_DUMPBITS(1);

      // read in block type
      zip_NEEDBITS(2);
      zip_method = zip_GETBITS(2);
      zip_DUMPBITS(2);
      zip_tl = null;
      zip_copy_leng = 0;
  }

  switch(zip_method) {
    case 0: // zip_STORED_BLOCK
      i = zip_inflate_stored(buff, off + n, size - n);
      break;

    case 1: // zip_STATIC_TREES
      if(zip_tl != null)
    i = zip_inflate_codes(buff, off + n, size - n);
      else
    i = zip_inflate_fixed(buff, off + n, size - n);
      break;

    case 2: // zip_DYN_TREES
      if(zip_tl != null)
    i = zip_inflate_codes(buff, off + n, size - n);
      else
    i = zip_inflate_dynamic(buff, off + n, size - n);
      break;

    default: // error
      i = -1;
      break;
  }

  if(i == -1) {
      if(zip_eof)
    return 0;
      return -1;
  }
  n += i;
    }
    return n;
}

var zip_inflate = function(input,progressCallback) {
    var i, j;

    zip_inflate_start();
    zip_inflate_data = input;
    zip_inflate_pos = 0;

    var bufflen = 1024
    var buff = new ArrayBuffer(bufflen);
    var aout = [];

    var arr = []

    while((i = zip_inflate_internal(buff, 0, bufflen)) > 0) 
    {
      for(j = 0; j < i; j++)
      {
        aout[aout.length] = buff[j];
      }
      if(progressCallback != undefined && zip_inflate_pos % 10000 == 0)
      {
        progressCallback(zip_inflate_pos,zip_inflate_data.length)
      }
      if(aout.length > 30000000)
      {
        arr.push(aout)
        aout = []
      }
    }
    arr.push(aout)

    zip_inflate_data = null; // G.C.

    var len = 0;
    var offsets = [];
    for(var i = 0;i<arr.length;i++)
    {
      len += arr[i].length
      offsets[i] = i == 0 ? 0 : offsets[i-1] + arr[i-1].length;
    }


    var ret = new Uint8Array(len);
    for(var i = 0;i<arr.length;i++)
      ret.set(arr[i],offsets[i]);

    return ret
}

// function constructor(){

// }

// constructor.prototype = {
//   inflate:function inflate(data) {
//       return this.zip_inflate(data);
//   }
// }

return zip_inflate;

})();




/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
   Copyright 2011 notmasteryet

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// - The JPEG specification can be found in the ITU CCITT Recommendation T.81
//   (www.w3.org/Graphics/JPEG/itu-t81.pdf)
// - The JFIF specification can be found in the JPEG File Interchange Format
//   (www.w3.org/Graphics/JPEG/jfif3.pdf)
// - The Adobe Application-Specific JPEG markers in the Supporting the DCT Filters
//   in PostScript Level 2, Technical Note #5116
//   (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)

var JpegImage = (function jpegImage() {
  "use strict";
  var dctZigZag = new Int32Array([
     0,
     1,  8,
    16,  9,  2,
     3, 10, 17, 24,
    32, 25, 18, 11, 4,
     5, 12, 19, 26, 33, 40,
    48, 41, 34, 27, 20, 13,  6,
     7, 14, 21, 28, 35, 42, 49, 56,
    57, 50, 43, 36, 29, 22, 15,
    23, 30, 37, 44, 51, 58,
    59, 52, 45, 38, 31,
    39, 46, 53, 60,
    61, 54, 47,
    55, 62,
    63
  ]);

  var dctCos1  =  4017   // cos(pi/16)
  var dctSin1  =   799   // sin(pi/16)
  var dctCos3  =  3406   // cos(3*pi/16)
  var dctSin3  =  2276   // sin(3*pi/16)
  var dctCos6  =  1567   // cos(6*pi/16)
  var dctSin6  =  3784   // sin(6*pi/16)
  var dctSqrt2 =  5793   // sqrt(2)
  var dctSqrt1d2 = 2896  // sqrt(2) / 2

  function constructor() {
  }

  function buildHuffmanTable(codeLengths, values) {
    var k = 0, code = [], i, j, length = 16;
    while (length > 0 && !codeLengths[length - 1])
      length--;
    code.push({children: [], index: 0});
    var p = code[0], q;
    for (i = 0; i < length; i++) {
      for (j = 0; j < codeLengths[i]; j++) {
        p = code.pop();
        p.children[p.index] = values[k];
        while (p.index > 0) {
          p = code.pop();
        }
        p.index++;
        code.push(p);
        while (code.length <= i) {
          code.push(q = {children: [], index: 0});
          p.children[p.index] = q.children;
          p = q;
        }
        k++;
      }
      if (i + 1 < length) {
        // p here points to last code
        code.push(q = {children: [], index: 0});
        p.children[p.index] = q.children;
        p = q;
      }
    }
    return code[0].children;
  }

  function decodeScan(data, offset,
                      frame, components, resetInterval,
                      spectralStart, spectralEnd,
                      successivePrev, successive) {
    var precision = frame.precision;
    var samplesPerLine = frame.samplesPerLine;
    var scanLines = frame.scanLines;
    var mcusPerLine = frame.mcusPerLine;
    var progressive = frame.progressive;
    var maxH = frame.maxH, maxV = frame.maxV;

    var startOffset = offset, bitsData = 0, bitsCount = 0;
    function readBit() {
      if (bitsCount > 0) {
        bitsCount--;
        return (bitsData >> bitsCount) & 1;
      }
      bitsData = data[offset++];
      if (bitsData == 0xFF) {
        var nextByte = data[offset++];
        if (nextByte) {
          throw "unexpected marker: " + ((bitsData << 8) | nextByte).toString(16);
        }
        // unstuff 0
      }
      bitsCount = 7;
      return bitsData >>> 7;
    }
    function decodeHuffman(tree) {
      var node = tree, bit;
      while ((bit = readBit()) !== null) {
        node = node[bit];
        if (typeof node === 'number')
          return node;
        if (typeof node !== 'object')
          throw "invalid huffman sequence";
      }
      return null;
    }
    function receive(length) {
      var n = 0;
      while (length > 0) {
        var bit = readBit();
        if (bit === null) return;
        n = (n << 1) | bit;
        length--;
      }
      return n;
    }
    function receiveAndExtend(length) {
      var n = receive(length);
      if (n >= 1 << (length - 1))
        return n;
      return n + (-1 << length) + 1;
    }
    function decodeBaseline(component, zz) {
      var t = decodeHuffman(component.huffmanTableDC);
      var diff = t === 0 ? 0 : receiveAndExtend(t);
      zz[0]= (component.pred += diff);
      var k = 1;
      while (k < 64) {
        var rs = decodeHuffman(component.huffmanTableAC);
        var s = rs & 15, r = rs >> 4;
        if (s === 0) {
          if (r < 15)
            break;
          k += 16;
          continue;
        }
        k += r;
        var z = dctZigZag[k];
        zz[z] = receiveAndExtend(s);
        k++;
      }
    }
    function decodeDCFirst(component, zz) {
      var t = decodeHuffman(component.huffmanTableDC);
      var diff = t === 0 ? 0 : (receiveAndExtend(t) << successive);
      zz[0] = (component.pred += diff);
    }
    function decodeDCSuccessive(component, zz) {
      zz[0] |= readBit() << successive;
    }
    var eobrun = 0;
    function decodeACFirst(component, zz) {
      if (eobrun > 0) {
        eobrun--;
        return;
      }
      var k = spectralStart, e = spectralEnd;
      while (k <= e) {
        var rs = decodeHuffman(component.huffmanTableAC);
        var s = rs & 15, r = rs >> 4;
        if (s === 0) {
          if (r < 15) {
            eobrun = receive(r) + (1 << r) - 1;
            break;
          }
          k += 16;
          continue;
        }
        k += r;
        var z = dctZigZag[k];
        zz[z] = receiveAndExtend(s) * (1 << successive);
        k++;
      }
    }
    var successiveACState = 0, successiveACNextValue;
    function decodeACSuccessive(component, zz) {
      var k = spectralStart, e = spectralEnd, r = 0;
      while (k <= e) {
        var z = dctZigZag[k];
        switch (successiveACState) {
        case 0: // initial state
          var rs = decodeHuffman(component.huffmanTableAC);
          var s = rs & 15, r = rs >> 4;
          if (s === 0) {
            if (r < 15) {
              eobrun = receive(r) + (1 << r);
              successiveACState = 4;
            } else {
              r = 16;
              successiveACState = 1;
            }
          } else {
            if (s !== 1)
              throw "invalid ACn encoding";
            successiveACNextValue = receiveAndExtend(s);
            successiveACState = r ? 2 : 3;
          }
          continue;
        case 1: // skipping r zero items
        case 2:
          if (zz[z])
            zz[z] += (readBit() << successive);
          else {
            r--;
            if (r === 0)
              successiveACState = successiveACState == 2 ? 3 : 0;
          }
          break;
        case 3: // set value for a zero item
          if (zz[z])
            zz[z] += (readBit() << successive);
          else {
            zz[z] = successiveACNextValue << successive;
            successiveACState = 0;
          }
          break;
        case 4: // eob
          if (zz[z])
            zz[z] += (readBit() << successive);
          break;
        }
        k++;
      }
      if (successiveACState === 4) {
        eobrun--;
        if (eobrun === 0)
          successiveACState = 0;
      }
    }
    function decodeMcu(component, decode, mcu, row, col) {
      var mcuRow = (mcu / mcusPerLine) | 0;
      var mcuCol = mcu % mcusPerLine;
      var blockRow = mcuRow * component.v + row;
      var blockCol = mcuCol * component.h + col;
      decode(component, component.blocks[blockRow][blockCol]);
    }
    function decodeBlock(component, decode, mcu) {
      var blockRow = (mcu / component.blocksPerLine) | 0;
      var blockCol = mcu % component.blocksPerLine;
      decode(component, component.blocks[blockRow][blockCol]);
    }

    var componentsLength = components.length;
    var component, i, j, k, n;
    var decodeFn;
    if (progressive) {
      if (spectralStart === 0)
        decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
      else
        decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
    } else {
      decodeFn = decodeBaseline;
    }

    var mcu = 0, marker;
    var mcuExpected;
    if (componentsLength == 1) {
      mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
    } else {
      mcuExpected = mcusPerLine * frame.mcusPerColumn;
    }
    if (!resetInterval) resetInterval = mcuExpected;

    var h, v;
    while (mcu < mcuExpected) {
      // reset interval stuff
      for (i = 0; i < componentsLength; i++)
        components[i].pred = 0;
      eobrun = 0;

      if (componentsLength == 1) {
        component = components[0];
        for (n = 0; n < resetInterval; n++) {
          decodeBlock(component, decodeFn, mcu);
          mcu++;
        }
      } else {
        for (n = 0; n < resetInterval; n++) {
          for (i = 0; i < componentsLength; i++) {
            component = components[i];
            h = component.h;
            v = component.v;
            for (j = 0; j < v; j++) {
              for (k = 0; k < h; k++) {
                decodeMcu(component, decodeFn, mcu, j, k);
              }
            }
          }
          mcu++;
        }
      }

      // find marker
      bitsCount = 0;
      marker = (data[offset] << 8) | data[offset + 1];
      if (marker <= 0xFF00) {
        throw "marker was not found";
      }

      if (marker >= 0xFFD0 && marker <= 0xFFD7) { // RSTx
        offset += 2;
      }
      else
        break;
    }

    return offset - startOffset;
  }

  function buildComponentData(frame, component) {
    var lines = [];
    var blocksPerLine = component.blocksPerLine;
    var blocksPerColumn = component.blocksPerColumn;
    var samplesPerLine = blocksPerLine << 3;
    var R = new Int32Array(64), r = new Uint8Array(64);

    // A port of poppler's IDCT method which in turn is taken from:
    //   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
    //   "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
    //   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
    //   988-991.
    function quantizeAndInverse(zz, dataOut, dataIn) {
      var qt = component.quantizationTable;
      var v0, v1, v2, v3, v4, v5, v6, v7, t;
      var p = dataIn;
      var i;

      // dequant
      for (i = 0; i < 64; i++)
        p[i] = zz[i] * qt[i];

      // inverse DCT on rows
      for (i = 0; i < 8; ++i) {
        var row = 8 * i;

        // check for all-zero AC coefficients
        if (p[1 + row] == 0 && p[2 + row] == 0 && p[3 + row] == 0 &&
            p[4 + row] == 0 && p[5 + row] == 0 && p[6 + row] == 0 &&
            p[7 + row] == 0) {
          t = (dctSqrt2 * p[0 + row] + 512) >> 10;
          p[0 + row] = t;
          p[1 + row] = t;
          p[2 + row] = t;
          p[3 + row] = t;
          p[4 + row] = t;
          p[5 + row] = t;
          p[6 + row] = t;
          p[7 + row] = t;
          continue;
        }

        // stage 4
        v0 = (dctSqrt2 * p[0 + row] + 128) >> 8;
        v1 = (dctSqrt2 * p[4 + row] + 128) >> 8;
        v2 = p[2 + row];
        v3 = p[6 + row];
        v4 = (dctSqrt1d2 * (p[1 + row] - p[7 + row]) + 128) >> 8;
        v7 = (dctSqrt1d2 * (p[1 + row] + p[7 + row]) + 128) >> 8;
        v5 = p[3 + row] << 4;
        v6 = p[5 + row] << 4;

        // stage 3
        t = (v0 - v1+ 1) >> 1;
        v0 = (v0 + v1 + 1) >> 1;
        v1 = t;
        t = (v2 * dctSin6 + v3 * dctCos6 + 128) >> 8;
        v2 = (v2 * dctCos6 - v3 * dctSin6 + 128) >> 8;
        v3 = t;
        t = (v4 - v6 + 1) >> 1;
        v4 = (v4 + v6 + 1) >> 1;
        v6 = t;
        t = (v7 + v5 + 1) >> 1;
        v5 = (v7 - v5 + 1) >> 1;
        v7 = t;

        // stage 2
        t = (v0 - v3 + 1) >> 1;
        v0 = (v0 + v3 + 1) >> 1;
        v3 = t;
        t = (v1 - v2 + 1) >> 1;
        v1 = (v1 + v2 + 1) >> 1;
        v2 = t;
        t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
        v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
        v7 = t;
        t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
        v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
        v6 = t;

        // stage 1
        p[0 + row] = v0 + v7;
        p[7 + row] = v0 - v7;
        p[1 + row] = v1 + v6;
        p[6 + row] = v1 - v6;
        p[2 + row] = v2 + v5;
        p[5 + row] = v2 - v5;
        p[3 + row] = v3 + v4;
        p[4 + row] = v3 - v4;
      }

      // inverse DCT on columns
      for (i = 0; i < 8; ++i) {
        var col = i;

        // check for all-zero AC coefficients
        if (p[1*8 + col] == 0 && p[2*8 + col] == 0 && p[3*8 + col] == 0 &&
            p[4*8 + col] == 0 && p[5*8 + col] == 0 && p[6*8 + col] == 0 &&
            p[7*8 + col] == 0) {
          t = (dctSqrt2 * dataIn[i+0] + 8192) >> 14;
          p[0*8 + col] = t;
          p[1*8 + col] = t;
          p[2*8 + col] = t;
          p[3*8 + col] = t;
          p[4*8 + col] = t;
          p[5*8 + col] = t;
          p[6*8 + col] = t;
          p[7*8 + col] = t;
          continue;
        }

        // stage 4
        v0 = (dctSqrt2 * p[0*8 + col] + 2048) >> 12;
        v1 = (dctSqrt2 * p[4*8 + col] + 2048) >> 12;
        v2 = p[2*8 + col];
        v3 = p[6*8 + col];
        v4 = (dctSqrt1d2 * (p[1*8 + col] - p[7*8 + col]) + 2048) >> 12;
        v7 = (dctSqrt1d2 * (p[1*8 + col] + p[7*8 + col]) + 2048) >> 12;
        v5 = p[3*8 + col];
        v6 = p[5*8 + col];

        // stage 3
        t = (v0 - v1 + 1) >> 1;
        v0 = (v0 + v1 + 1) >> 1;
        v1 = t;
        t = (v2 * dctSin6 + v3 * dctCos6 + 2048) >> 12;
        v2 = (v2 * dctCos6 - v3 * dctSin6 + 2048) >> 12;
        v3 = t;
        t = (v4 - v6 + 1) >> 1;
        v4 = (v4 + v6 + 1) >> 1;
        v6 = t;
        t = (v7 + v5 + 1) >> 1;
        v5 = (v7 - v5 + 1) >> 1;
        v7 = t;

        // stage 2
        t = (v0 - v3 + 1) >> 1;
        v0 = (v0 + v3 + 1) >> 1;
        v3 = t;
        t = (v1 - v2 + 1) >> 1;
        v1 = (v1 + v2 + 1) >> 1;
        v2 = t;
        t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
        v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
        v7 = t;
        t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
        v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
        v6 = t;

        // stage 1
        p[0*8 + col] = v0 + v7;
        p[7*8 + col] = v0 - v7;
        p[1*8 + col] = v1 + v6;
        p[6*8 + col] = v1 - v6;
        p[2*8 + col] = v2 + v5;
        p[5*8 + col] = v2 - v5;
        p[3*8 + col] = v3 + v4;
        p[4*8 + col] = v3 - v4;
      }

      // convert to 8-bit integers
      for (i = 0; i < 64; ++i) {
        var sample = 128 + ((p[i] + 8) >> 4);
        dataOut[i] = sample < 0 ? 0 : sample > 0xFF ? 0xFF : sample;
      }
    }

    var i, j;
    for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
      var scanLine = blockRow << 3;
      for (i = 0; i < 8; i++)
        lines.push(new Uint8Array(samplesPerLine));
      for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
        quantizeAndInverse(component.blocks[blockRow][blockCol], r, R);

        var offset = 0, sample = blockCol << 3;
        for (j = 0; j < 8; j++) {
          var line = lines[scanLine + j];
          for (i = 0; i < 8; i++)
            line[sample + i] = r[offset++];
        }
      }
    }
    return lines;
  }

  constructor.prototype = {
    load: function load(path) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = (function() {
        // TODO catch parse error
        var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
        this.parse(data);
        if (this.onload)
          this.onload();
      }).bind(this);
      xhr.send(null);
    },
    parse: function parse(data) {
      var offset = 0, length = data.length;
      function readUint16() {
        var value = (data[offset] << 8) | data[offset + 1];
        offset += 2;
        return value;
      }
      function readDataBlock() {
        var length = readUint16();
        var array = data.subarray(offset, offset + length - 2);
        offset += array.length;
        return array;
      }
      function prepareComponents(frame) {
        var maxH = 0, maxV = 0;
        var component, componentId;
        for (componentId in frame.components) {
          if (frame.components.hasOwnProperty(componentId)) {
            component = frame.components[componentId];
            if (maxH < component.h) maxH = component.h;
            if (maxV < component.v) maxV = component.v;
          }
        }
        var mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / maxH);
        var mcusPerColumn = Math.ceil(frame.scanLines / 8 / maxV);
        for (componentId in frame.components) {
          if (frame.components.hasOwnProperty(componentId)) {
            component = frame.components[componentId];
            var blocksPerLine = Math.ceil(Math.ceil(frame.samplesPerLine / 8) * component.h / maxH);
            var blocksPerColumn = Math.ceil(Math.ceil(frame.scanLines  / 8) * component.v / maxV);
            var blocksPerLineForMcu = mcusPerLine * component.h;
            var blocksPerColumnForMcu = mcusPerColumn * component.v;
            var blocks = [];
            for (var i = 0; i < blocksPerColumnForMcu; i++) {
              var row = [];
              for (var j = 0; j < blocksPerLineForMcu; j++)
                row.push(new Int32Array(64));
              blocks.push(row);
            }
            component.blocksPerLine = blocksPerLine;
            component.blocksPerColumn = blocksPerColumn;
            component.blocks = blocks;
          }
        }
        frame.maxH = maxH;
        frame.maxV = maxV;
        frame.mcusPerLine = mcusPerLine;
        frame.mcusPerColumn = mcusPerColumn;
      }
      var jfif = null;
      var adobe = null;
      var pixels = null;
      var frame, resetInterval;
      var quantizationTables = [], frames = [];
      var huffmanTablesAC = [], huffmanTablesDC = [];
      var fileMarker = readUint16();
      if (fileMarker != 0xFFD8) { // SOI (Start of Image)
        throw "SOI not found";
      }

      fileMarker = readUint16();
      while (fileMarker != 0xFFD9) { // EOI (End of image)
        var i, j, l;
        switch(fileMarker) {
          case 0xFFE0: // APP0 (Application Specific)
          case 0xFFE1: // APP1
          case 0xFFE2: // APP2
          case 0xFFE3: // APP3
          case 0xFFE4: // APP4
          case 0xFFE5: // APP5
          case 0xFFE6: // APP6
          case 0xFFE7: // APP7
          case 0xFFE8: // APP8
          case 0xFFE9: // APP9
          case 0xFFEA: // APP10
          case 0xFFEB: // APP11
          case 0xFFEC: // APP12
          case 0xFFED: // APP13
          case 0xFFEE: // APP14
          case 0xFFEF: // APP15
          case 0xFFFE: // COM (Comment)
            var appData = readDataBlock();

            if (fileMarker === 0xFFE0) {
              if (appData[0] === 0x4A && appData[1] === 0x46 && appData[2] === 0x49 &&
                appData[3] === 0x46 && appData[4] === 0) { // 'JFIF\x00'
                jfif = {
                  version: { major: appData[5], minor: appData[6] },
                  densityUnits: appData[7],
                  xDensity: (appData[8] << 8) | appData[9],
                  yDensity: (appData[10] << 8) | appData[11],
                  thumbWidth: appData[12],
                  thumbHeight: appData[13],
                  thumbData: appData.subarray(14, 14 + 3 * appData[12] * appData[13])
                };
              }
            }
            // TODO APP1 - Exif
            if (fileMarker === 0xFFEE) {
              if (appData[0] === 0x41 && appData[1] === 0x64 && appData[2] === 0x6F &&
                appData[3] === 0x62 && appData[4] === 0x65 && appData[5] === 0) { // 'Adobe\x00'
                adobe = {
                  version: appData[6],
                  flags0: (appData[7] << 8) | appData[8],
                  flags1: (appData[9] << 8) | appData[10],
                  transformCode: appData[11]
                };
              }
            }
            break;

          case 0xFFDB: // DQT (Define Quantization Tables)
            var quantizationTablesLength = readUint16();
            var quantizationTablesEnd = quantizationTablesLength + offset - 2;
            while (offset < quantizationTablesEnd) {
              var quantizationTableSpec = data[offset++];
              var tableData = new Int32Array(64);
              if ((quantizationTableSpec >> 4) === 0) { // 8 bit values
                for (j = 0; j < 64; j++) {
                  var z = dctZigZag[j];
                  tableData[z] = data[offset++];
                }
              } else if ((quantizationTableSpec >> 4) === 1) { //16 bit
                for (j = 0; j < 64; j++) {
                  var z = dctZigZag[j];
                  tableData[z] = readUint16();
                }
              } else
                throw "DQT: invalid table spec";
              quantizationTables[quantizationTableSpec & 15] = tableData;
            }
            break;

          case 0xFFC0: // SOF0 (Start of Frame, Baseline DCT)
          case 0xFFC2: // SOF2 (Start of Frame, Progressive DCT)
            readUint16(); // skip data length
            frame = {};
            frame.progressive = (fileMarker === 0xFFC2);
            frame.precision = data[offset++];
            frame.scanLines = readUint16();
            frame.samplesPerLine = readUint16();
            frame.components = {};
            frame.componentsOrder = [];
            var componentsCount = data[offset++], componentId;
            var maxH = 0, maxV = 0;
            for (i = 0; i < componentsCount; i++) {
              componentId = data[offset];
              var h = data[offset + 1] >> 4;
              var v = data[offset + 1] & 15;
              var qId = data[offset + 2];
              frame.componentsOrder.push(componentId);
              frame.components[componentId] = {
                h: h,
                v: v,
                quantizationTable: quantizationTables[qId]
              };
              offset += 3;
            }
            prepareComponents(frame);
            frames.push(frame);
            break;

          case 0xFFC4: // DHT (Define Huffman Tables)
            var huffmanLength = readUint16();
            for (i = 2; i < huffmanLength;) {
              var huffmanTableSpec = data[offset++];
              var codeLengths = new Uint8Array(16);
              var codeLengthSum = 0;
              for (j = 0; j < 16; j++, offset++)
                codeLengthSum += (codeLengths[j] = data[offset]);
              var huffmanValues = new Uint8Array(codeLengthSum);
              for (j = 0; j < codeLengthSum; j++, offset++)
                huffmanValues[j] = data[offset];
              i += 17 + codeLengthSum;

              ((huffmanTableSpec >> 4) === 0 ? 
                huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] =
                buildHuffmanTable(codeLengths, huffmanValues);
            }
            break;

          case 0xFFDD: // DRI (Define Restart Interval)
            readUint16(); // skip data length
            resetInterval = readUint16();
            break;

          case 0xFFDA: // SOS (Start of Scan)
            var scanLength = readUint16();
            var selectorsCount = data[offset++];
            var components = [], component;
            for (i = 0; i < selectorsCount; i++) {
              component = frame.components[data[offset++]];
              var tableSpec = data[offset++];
              component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
              component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
              components.push(component);
            }
            var spectralStart = data[offset++];
            var spectralEnd = data[offset++];
            var successiveApproximation = data[offset++];
            var processed = decodeScan(data, offset,
              frame, components, resetInterval,
              spectralStart, spectralEnd,
              successiveApproximation >> 4, successiveApproximation & 15);
            offset += processed;
            break;
          default:
            if (data[offset - 3] == 0xFF &&
                data[offset - 2] >= 0xC0 && data[offset - 2] <= 0xFE) {
              // could be incorrect encoding -- last 0xFF byte of the previous
              // block was eaten by the encoder
              offset -= 3;
              break;
            }
            throw "unknown JPEG marker " + fileMarker.toString(16);
        }
        fileMarker = readUint16();
      }
      if (frames.length != 1)
        throw "only single frame JPEGs supported";

      this.width = frame.samplesPerLine;
      this.height = frame.scanLines;
      this.jfif = jfif;
      this.adobe = adobe;
      this.components = [];
      for (var i = 0; i < frame.componentsOrder.length; i++) {
        var component = frame.components[frame.componentsOrder[i]];
        this.components.push({
          lines: buildComponentData(frame, component),
          scaleX: component.h / frame.maxH,
          scaleY: component.v / frame.maxV
        });
      }
    },
    getData: function getData(width, height) {
      function clampTo8bit(a) {
        return a < 0 ? 0 : a > 255 ? 255 : a;
      }
      var scaleX = this.width / width, scaleY = this.height / height;

      var component1, component2, component3, component4;
      var component1Line, component2Line, component3Line, component4Line;
      var x, y;
      var offset = 0;
      var Y, Cb, Cr, K, C, M, Ye, R, G, B;
      var colorTransform;
      var dataLength = width * height * this.components.length;
      var data = new Uint8Array(dataLength);
      switch (this.components.length) {
        case 1:
          component1 = this.components[0];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              Y = component1Line[0 | (x * component1.scaleX * scaleX)];

              data[offset++] = Y;
            }
          }
          break;
        case 3:
          // The default transform for three components is true
          colorTransform = true;
          // The adobe transform marker overrides any previous setting
          if (this.adobe && this.adobe.transformCode)
            colorTransform = true;
          else if (typeof this.colorTransform !== 'undefined')
            colorTransform = !!this.colorTransform;

          component1 = this.components[0];
          component2 = this.components[1];
          component3 = this.components[2];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
            component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              if (!colorTransform) {
                R = component1Line[0 | (x * component1.scaleX * scaleX)];
                G = component2Line[0 | (x * component2.scaleX * scaleX)];
                B = component3Line[0 | (x * component3.scaleX * scaleX)];
              } else {
                Y = component1Line[0 | (x * component1.scaleX * scaleX)];
                Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
                Cr = component3Line[0 | (x * component3.scaleX * scaleX)];

                R = clampTo8bit(Y + 1.402 * (Cr - 128));
                G = clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                B = clampTo8bit(Y + 1.772 * (Cb - 128));
              }

              data[offset++] = R;
              data[offset++] = G;
              data[offset++] = B;
            }
          }
          break;
        case 4:
          if (!this.adobe)
            throw 'Unsupported color mode (4 components)';
          // The default transform for four components is false
          colorTransform = false;
          // The adobe transform marker overrides any previous setting
          if (this.adobe && this.adobe.transformCode)
            colorTransform = true;
          else if (typeof this.colorTransform !== 'undefined')
            colorTransform = !!this.colorTransform;

          component1 = this.components[0];
          component2 = this.components[1];
          component3 = this.components[2];
          component4 = this.components[3];
          for (y = 0; y < height; y++) {
            component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
            component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
            component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
            component4Line = component4.lines[0 | (y * component4.scaleY * scaleY)];
            for (x = 0; x < width; x++) {
              if (!colorTransform) {
                C = component1Line[0 | (x * component1.scaleX * scaleX)];
                M = component2Line[0 | (x * component2.scaleX * scaleX)];
                Ye = component3Line[0 | (x * component3.scaleX * scaleX)];
                K = component4Line[0 | (x * component4.scaleX * scaleX)];
              } else {
                Y = component1Line[0 | (x * component1.scaleX * scaleX)];
                Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
                Cr = component3Line[0 | (x * component3.scaleX * scaleX)];
                K = component4Line[0 | (x * component4.scaleX * scaleX)];

                C = 255 - clampTo8bit(Y + 1.402 * (Cr - 128));
                M = 255 - clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                Ye = 255 - clampTo8bit(Y + 1.772 * (Cb - 128));
              }
              data[offset++] = C;
              data[offset++] = M;
              data[offset++] = Ye;
              data[offset++] = K;
            }
          }
          break;
        default:
          throw 'Unsupported color mode';
      }
      return data;
    },
    copyToImageData: function copyToImageData(imageData) {
      var width = imageData.width, height = imageData.height;
      var imageDataArray = imageData.data;
      var data = this.getData(width, height);
      var i = 0, j = 0, x, y;
      var Y, K, C, M, R, G, B;
      switch (this.components.length) {
        case 1:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              Y = data[i++];

              imageDataArray[j++] = Y;
              imageDataArray[j++] = Y;
              imageDataArray[j++] = Y;
              imageDataArray[j++] = 255;
            }
          }
          break;
        case 3:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              R = data[i++];
              G = data[i++];
              B = data[i++];

              imageDataArray[j++] = R;
              imageDataArray[j++] = G;
              imageDataArray[j++] = B;
              imageDataArray[j++] = 255;
            }
          }
          break;
        case 4:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              C = data[i++];
              M = data[i++];
              Y = data[i++];
              K = data[i++];

              R = 255 - clampTo8bit(C * (1 - K / 255) + K);
              G = 255 - clampTo8bit(M * (1 - K / 255) + K);
              B = 255 - clampTo8bit(Y * (1 - K / 255) + K);

              imageDataArray[j++] = R;
              imageDataArray[j++] = G;
              imageDataArray[j++] = B;
              imageDataArray[j++] = 255;
            }
          }
          break;
        default:
          throw 'Unsupported color mode';
      }
    }
  };

  return constructor;
})();