(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/lib/qrcapacitytable.js":[function(require,module,exports){
/**
this contains the max string length for all qr code Versions in Binary Safe / Byte Mode
each entry is in the order of error correct level
	[L,M,Q,H]

the qrcode lib sets strange values for QRErrorCorrectLevel having to do with masking against patterns
the maximum string length for error correct level H is 1273 characters long.
*/

exports.QRCapacityTable = [
[17,14,11,7]
,[32,26,20,14]
,[53,42,32,24]
,[78,62,46,34]
,[106,84,60,44]
,[134,106,74,58]
,[154,122,86,64]
,[192,152,108,84]
,[230,180,130,98]
,[271,213,151,119]
,[321,251,177,137]//11
,[367,287,203,155]
,[425,331,241,177]
,[458,362,258,194]
,[520,412,292,220]
,[586,450,322,250]
,[644,504,364,280]
,[718,560,394,310]
,[792,624,442,338]
,[858,666,482,382]
,[929,711,509,403]
,[1003,779,565,439]
,[1091,857,611,461]
,[1171,911,661,511]//24
,[1273,997,715,535]
,[1367,1059,751,593]
,[1465,1125,805,625]
,[1528,1190,868,658]//28
,[1628,1264,908,698]
,[1732,1370,982,742]
,[1840,1452,1030,790]
,[1952,1538,1112,842]//32
,[2068,1628,1168,898]
,[2188,1722,1228,958]
,[2303,1809,1283,983]
,[2431,1911,1351,1051]//36
,[2563,1989,1423,1093]
,[2699,2099,1499,1139]
,[2809,2213,1579,1219]
,[2953,2331,1663,1273]//40
];

},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/lib/qrcode-draw.js":[function(require,module,exports){
/*
* copyright 2010-2012 Ryan Day
* http://github.com/soldair/node-qrcode
*
* Licensed under the MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*
* canvas example and fallback support example provided by Joshua Koo
*	http://jabtunes.com/labs/qrcode.html
*	"Instant QRCode Mashup by Joshua Koo!"
*	as far as i can tell the page and the code on the page are public domain 
*	
* original table example and library provided by Kazuhiko Arase
*	http://d-project.googlecode.com/svn/trunk/misc/qrcode/js/
*
*/

var bops = require('bops')
var QRCodeLib = require('./qrcode.js');
var QRVersionCapacityTable = require('./qrcapacitytable.js').QRCapacityTable;
var QRCode = QRCodeLib.QRCode;

exports.QRCodeDraw = QRCodeDraw;
exports.QRVersionCapacityTable = QRVersionCapacityTable;
exports.QRErrorCorrectLevel = QRCodeLib.QRErrorCorrectLevel;
exports.QRCode = QRCodeLib.QRCode;

function QRCodeDraw(){}

QRCodeDraw.prototype = {
  scale:4,//4 px module size
  defaultMargin:20,
  marginScaleFactor:5,
  Array:(typeof Uint32Array == 'undefined'?Uint32Array:Array),
  // you may configure the error behavior for input string too long
  errorBehavior:{
    length:'trim'
  },
  color:{
    dark:'black',
    light:'white'
  },
  defaultErrorCorrectLevel:QRCodeLib.QRErrorCorrectLevel.H,
  QRErrorCorrectLevel:QRCodeLib.QRErrorCorrectLevel,
  draw:function(canvas,text,options,cb){

    var level,
    error,
    errorCorrectLevel;
    
    var args = Array.prototype.slice.call(arguments);
    cb = args.pop(); 
    canvas = args.shift();
    text = args.shift();
    options = args.shift()||{};

    
    if(typeof cb != 'function') {
      //enforce callback api just in case the processing can be made async in the future
      // or support proc open to libqrencode
      throw new Error('callback required');
    }
    
    if(typeof options !== "object"){
      options.errorCorrectLevel = options;
    }
    

    this.QRVersion(
      text
      ,options.errorCorrectLevel||this.QRErrorCorrectLevel.H
      ,options.version
    ,function(e,t,l,ec){

      text = t,level = l,error = e,errorCorrectLevel = ec;
    });

    this.scale = options.scale||this.scale;
    this.margin = typeof(options.margin) === 'undefined' ? this.defaultMargin : options.margin;
    
    if(!level) {
      //if we are unable to find an appropriate qr level error out
      cb(error,canvas);
      return;
    }

    //create qrcode!
    try{
      
      var qr = new QRCodeLib.QRCode(level, errorCorrectLevel)
      , scale = this.scale||4
      , ctx = canvas.getContext('2d')
      , width = 0;

      qr.addData(text);
      qr.make();

      var margin = this.marginWidth();
      var currenty = margin;
      width = this.dataWidth(qr)+ margin*2;
      
      this.resetCanvas(canvas,ctx,width);

      for (var r = 0,rl=qr.getModuleCount(); r < rl; r++) {
        var currentx = margin;
        for (var c = 0,cl=qr.getModuleCount(); c < cl; c++) {
          if (qr.isDark(r, c) ) {
            ctx.fillStyle = this.color.dark;
            ctx.fillRect (currentx, currenty, scale, scale);
          } else if(this.color.light){
            //if falsy configured color
            ctx.fillStyle = this.color.light;
            ctx.fillRect (currentx, currenty, scale, scale);
          }
          currentx += scale;
        }
        currenty += scale;
      }
    } catch (e) {
      error = e;
    }
    
    cb(error,canvas,width);    
  },
  drawBitArray:function(text/*,errorCorrectLevel,options,cb*/) {

    var args = Array.prototype.slice.call(arguments),
      cb = args.pop(),
      text = args.shift(),
      errorCorrectLevel = args.shift(),
      options = args.shift() || {};

    //argument processing
    if(typeof cb != 'function') {
      //enforce callback api just in case the processing can be made async in the future
      // or support proc open to libqrencode
      throw new Error('callback required as last argument');
    }
    
    cb = arguments[arguments.length-1]; 
    
    if(arguments.length > 2){
      errorCorrectLevel = arguments[2];
    }


    //this interface kinda sucks - there is very small likelyhood of this ever being async
    this.QRVersion(text,errorCorrectLevel,(options||{}).version,function(e,t,l,ec){
      text = t,level = l,error = e,errorCorrectLevel = ec;
    });


    if(!level) {
      //if we are unable to find an appropriate qr level error out
      cb(error,[],0);
      return;
    }

    //create qrcode!
    try{

      var qr = new QRCodeLib.QRCode(level, errorCorrectLevel)
      , scale = this.scale||4
      , width = 0,bits,bitc=0,currenty=0;
      
      qr.addData(text);
      qr.make();
      
      width = this.dataWidth(qr,1);
      bits = new this.Array(width*width);

      
      for (var r = 0,rl=qr.getModuleCount(); r < rl; r++) {
        for (var c = 0,cl=qr.getModuleCount(); c < cl; c++) {
          if (qr.isDark(r, c) ) {
            bits[bitc] = 1;
          } else {
            bits[bitc] = 0;
          }
          bitc++;
        }
      }
    } catch (e) {
      error = e;
      console.log(e.stack);
    }
    
    cb(error,bits,width);
  },
  QRVersion:function(text,errorCorrectLevel,version,cb){
    var c = bops.from(text).length,// BINARY LENGTH!
        error,
        errorCorrectLevel = this.QRErrorCorrectLevel[errorCorrectLevel]||this.defaultErrorCorrectLevel,
        errorCorrectIndex = [1,0,3,2],//fix odd mapping to order in table
        keys = ['L','M','Q','H'],
        capacity = 0,
        versionSpecified = false;
        
    if(typeof version !== "undefined" && version !== null) {
      versionSpecified = true;
    }
    //TODO ADD THROW FOR INVALID errorCorrectLevel...?
    
    if(versionSpecified){
      //console.log('SPECIFIED VERSION! ',version);
      //i have specified a version. this will give me a fixed size qr code. version must be valid. 1-40
      capacity = QRVersionCapacityTable[version][errorCorrectIndex[errorCorrectLevel]];
      
    } else {
      //figure out what version can hold the amount of text
      for(var i=0,j=QRVersionCapacityTable.length;i<j;i++) {
        capacity = QRVersionCapacityTable[i][errorCorrectIndex[errorCorrectLevel]];
        if(c < QRVersionCapacityTable[i][errorCorrectIndex[errorCorrectLevel]]){
          version = i+1;
          break;
        }
      }
      //if not version set to max
      if(!version) {
        version = QRVersionCapacityTable.length-1;
      }
    }
    
    if(capacity < c){
      if(this.errorBehavior.length == 'trim'){
        text = text.substr(0,capacity);
        level = QRVersionCapacityTable.length; 
      } else {
        error = new Error('input string too long for error correction '
          +keys[errorCorrectIndex[errorCorrectLevel]]
          +' max length '
          + capacity
          +' for qrcode version '+version
        );
      }
    }
  
    if(cb) {
      cb(error,text,version,errorCorrectLevel);
    }
    return version;
  },
  marginWidth:function(){
    var margin = this.margin;
    this.scale = this.scale||4;
    //elegant white space next to code is required by spec
    if ((this.scale * this.marginScaleFactor > margin) && margin > 0){
      margin = this.scale * this.marginScaleFactor;
    }
    return margin;
  },
  dataWidth:function(qr,scale){
    return qr.getModuleCount()*(scale||this.scale||4);
  },
  resetCanvas:function(canvas,ctx,width){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!canvas.style) canvas.style = {};
    canvas.style.height = canvas.height = width;//square!
    canvas.style.width = canvas.width = width;
    
    if(this.color.light){
      ctx.fillStyle = this.color.light; 
      ctx.fillRect(0,0,canvas.width,canvas.height);
    } else {
      //support transparent backgrounds?
      //not exactly to spec but i really would like someone to be able to add a background with heavily reduced luminosity for simple branding
      //i could just ditch this because you could also just set #******00 as the color =P
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  }
};


},{"./qrcapacitytable.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/lib/qrcapacitytable.js","./qrcode.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/lib/qrcode.js","bops":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/index.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/lib/qrcode.js":[function(require,module,exports){
var bops = require('bops');

/**
 * QRCode for JavaScript
 *
 * modified by Ryan Day for nodejs support
 * Copyright (c) 2011 Ryan Day
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * EXPORTS:
 *	{
 *	QRCode:QRCode
 *	QRErrorCorrectLevel:QRErrorCorrectLevel
 *	}
//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of 
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
*/

//---------------------------------------------------------------------
// QRCode
//---------------------------------------------------------------------

exports.QRCode = QRCode;

var QRDataArray = (typeof Uint32Array == 'undefined'?Uint32Array:Array);

function QRCode(typeNumber, errorCorrectLevel) {
	this.typeNumber = typeNumber;
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null;
	this.moduleCount = 0;
	this.dataCache = null;
	this.dataList = new QRDataArray();
}

QRCode.prototype = {
	
	addData : function(data) {
		var newData = new QR8bitByte(data);

		this.dataList.push(newData);
		this.dataCache = null;
	},
	
	isDark : function(row, col) {
		if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
			throw new Error(row + "," + col);
		}
		return this.modules[row][col];
	},

	getModuleCount : function() {
		return this.moduleCount;
	},
	
	make : function() {
		this.makeImpl(false, this.getBestMaskPattern() );
	},
	
	makeImpl : function(test, maskPattern) {
		
		this.moduleCount = this.typeNumber * 4 + 17;
		this.modules = new QRDataArray(this.moduleCount);
		
		for (var row = 0; row < this.moduleCount; row++) {
			
			this.modules[row] = new QRDataArray(this.moduleCount);
			
			for (var col = 0; col < this.moduleCount; col++) {
				this.modules[row][col] = null;//(col + row) % 3;
			}
		}
	
		this.setupPositionProbePattern(0, 0);
		this.setupPositionProbePattern(this.moduleCount - 7, 0);
		this.setupPositionProbePattern(0, this.moduleCount - 7);
		this.setupPositionAdjustPattern();
		this.setupTimingPattern();
		this.setupTypeInfo(test, maskPattern);
		
		if (this.typeNumber >= 7) {
			this.setupTypeNumber(test);
		}
	
		if (this.dataCache == null) {
			this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
		}
	
		this.mapData(this.dataCache, maskPattern);
	},

	setupPositionProbePattern : function(row, col)  {
		
		for (var r = -1; r <= 7; r++) {
			
			if (row + r <= -1 || this.moduleCount <= row + r) continue;
			
			for (var c = -1; c <= 7; c++) {
				
				if (col + c <= -1 || this.moduleCount <= col + c) continue;
				
				if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
						|| (0 <= c && c <= 6 && (r == 0 || r == 6) )
						|| (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
					this.modules[row + r][col + c] = true;
				} else {
					this.modules[row + r][col + c] = false;
				}
			}		
		}		
	},
	
	getBestMaskPattern : function() {
	
		var minLostPoint = 0;
		var pattern = 0;
	
		for (var i = 0; i < 8; i++) {
			
			this.makeImpl(true, i);
	
			var lostPoint = QRUtil.getLostPoint(this);
	
			if (i == 0 || minLostPoint >  lostPoint) {
				minLostPoint = lostPoint;
				pattern = i;
			}
		}
	
		return pattern;
	},

	setupTimingPattern : function() {
		
		for (var r = 8; r < this.moduleCount - 8; r++) {
			if (this.modules[r][6] != null) {
				continue;
			}
			this.modules[r][6] = (r % 2 == 0);
		}
	
		for (var c = 8; c < this.moduleCount - 8; c++) {
			if (this.modules[6][c] != null) {
				continue;
			}
			this.modules[6][c] = (c % 2 == 0);
		}
	},
	
	setupPositionAdjustPattern : function() {
	
		var pos = QRUtil.getPatternPosition(this.typeNumber);
		pos = pos || '';
		for (var i = 0; i < pos.length; i++) {
		
			for (var j = 0; j < pos.length; j++) {
			
				var row = pos[i];
				var col = pos[j];
				
				if (this.modules[row][col] != null) {
					continue;
				}
				
				for (var r = -2; r <= 2; r++) {
				
					for (var c = -2; c <= 2; c++) {
					
						if (r == -2 || r == 2 || c == -2 || c == 2 
								|| (r == 0 && c == 0) ) {
							this.modules[row + r][col + c] = true;
						} else {
							this.modules[row + r][col + c] = false;
						}
					}
				}
			}
		}
	},
	
	setupTypeNumber : function(test) {
	
		var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
	
		for (var i = 0; i < 18; i++) {
			var mod = (!test && ( (bits >> i) & 1) == 1);
			this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
		}
	
		for (var i = 0; i < 18; i++) {
			var mod = (!test && ( (bits >> i) & 1) == 1);
			this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
		}
	},
	
	setupTypeInfo : function(test, maskPattern) {
	
		var data = (this.errorCorrectLevel << 3) | maskPattern;
		var bits = QRUtil.getBCHTypeInfo(data);
	
		// vertical		
		for (var i = 0; i < 15; i++) {
	
			var mod = (!test && ( (bits >> i) & 1) == 1);
	
			if (i < 6) {
				this.modules[i][8] = mod;
			} else if (i < 8) {
				this.modules[i + 1][8] = mod;
			} else {
				this.modules[this.moduleCount - 15 + i][8] = mod;
			}
		}
	
		// horizontal
		for (var i = 0; i < 15; i++) {
	
			var mod = (!test && ( (bits >> i) & 1) == 1);
			
			if (i < 8) {
				this.modules[8][this.moduleCount - i - 1] = mod;
			} else if (i < 9) {
				this.modules[8][15 - i - 1 + 1] = mod;
			} else {
				this.modules[8][15 - i - 1] = mod;
			}
		}
	
		// fixed module
		this.modules[this.moduleCount - 8][8] = (!test);
	
	},
	
	mapData : function(data, maskPattern) {
		
		var inc = -1;
		var row = this.moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;
		
		for (var col = this.moduleCount - 1; col > 0; col -= 2) {
	
			if (col == 6) col--;
	
			while (true) {
	
				for (var c = 0; c < 2; c++) {
					
					if (this.modules[row][col - c] == null) {
						
						var dark = false;
	
						if (byteIndex < data.length) {
							dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
						}
	
						var mask = QRUtil.getMask(maskPattern, row, col - c);
	
						if (mask) {
							dark = !dark;
						}
						
						this.modules[row][col - c] = dark;
						bitIndex--;
	
						if (bitIndex == -1) {
							byteIndex++;
							bitIndex = 7;
						}
					}
				}
								
				row += inc;
	
				if (row < 0 || this.moduleCount <= row) {
					row -= inc;
					inc = -inc;
					break;
				}
			}
		}
		
	}

};

QRCode.PAD0 = 0xEC;
QRCode.PAD1 = 0x11;

QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
	
	var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	
	var buffer = new QRBitBuffer();
	
	for (var i = 0; i < dataList.length; i++) {
		var data = dataList[i];
		buffer.put(data.mode, 4);
		buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
		data.write(buffer);
	}

	// calc num max data.
	var totalDataCount = 0;
	for (var i = 0; i < rsBlocks.length; i++) {
		totalDataCount += rsBlocks[i].dataCount;
	}

	if (buffer.getLengthInBits() > totalDataCount * 8) {
		throw new Error("code length overflow. ("
			+ buffer.getLengthInBits()
			+ ">"
			+  totalDataCount * 8
			+ ")");
	}

	// end code
	if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
		buffer.put(0, 4);
	}

	// padding
	while (buffer.getLengthInBits() % 8 != 0) {
		buffer.putBit(false);
	}

	// padding
	while (true) {
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD0, 8);
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD1, 8);
	}

	return QRCode.createBytes(buffer, rsBlocks);
};

QRCode.createBytes = function(buffer, rsBlocks) {

	var offset = 0;
	
	var maxDcCount = 0;
	var maxEcCount = 0;
	
	var dcdata = new QRDataArray(rsBlocks.length);
	var ecdata = new QRDataArray(rsBlocks.length);
	
	for (var r = 0; r < rsBlocks.length; r++) {

		var dcCount = rsBlocks[r].dataCount;
		var ecCount = rsBlocks[r].totalCount - dcCount;

		maxDcCount = Math.max(maxDcCount, dcCount);
		maxEcCount = Math.max(maxEcCount, ecCount);
		
		dcdata[r] = new QRDataArray(dcCount);
		
		for (var i = 0; i < dcdata[r].length; i++) {
			dcdata[r][i] = 0xff & buffer.buffer[i + offset];
		}
		offset += dcCount;
		
		var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
		var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

		var modPoly = rawPoly.mod(rsPoly);
		ecdata[r] = new QRDataArray(rsPoly.getLength() - 1);
		for (var i = 0; i < ecdata[r].length; i++) {
            var modIndex = i + modPoly.getLength() - ecdata[r].length;
			ecdata[r][i] = (modIndex >= 0)? modPoly.get(modIndex) : 0;
		}

	}
	
	var totalCodeCount = 0;
	for (var i = 0; i < rsBlocks.length; i++) {
		totalCodeCount += rsBlocks[i].totalCount;
	}

	var data = new QRDataArray(totalCodeCount);
	var index = 0;

	for (var i = 0; i < maxDcCount; i++) {
		for (var r = 0; r < rsBlocks.length; r++) {
			if (i < dcdata[r].length) {
				data[index++] = dcdata[r][i];
			}
		}
	}

	for (var i = 0; i < maxEcCount; i++) {
		for (var r = 0; r < rsBlocks.length; r++) {
			if (i < ecdata[r].length) {
				data[index++] = ecdata[r][i];
			}
		}
	}

	return data;

};

//---------------------------------------------------------------------
// QR8bitByte
//---------------------------------------------------------------------
function QR8bitByte(data) {
  this.mode = QRMode.MODE_8BIT_BYTE;
  this.data = data;
  var byteArray = [];
  
  this.parsedData = bops.from(data);
}

QR8bitByte.prototype = {
  getLength: function (buffer) {
    return this.parsedData.length;
  },
  write: function (buffer) {
    for (var i = 0, l = this.parsedData.length; i < l; i++) {
      buffer.put(this.parsedData[i], 8);
    }
  }
};


//---------------------------------------------------------------------
// QRMode
//---------------------------------------------------------------------

var QRMode = {
	MODE_NUMBER :		1 << 0,
	MODE_ALPHA_NUM : 	1 << 1,
	MODE_8BIT_BYTE : 	1 << 2,
	MODE_KANJI :		1 << 3
};

//---------------------------------------------------------------------
// QRErrorCorrectLevel
//---------------------------------------------------------------------
//exported

var QRErrorCorrectLevel = exports.QRErrorCorrectLevel = {
	L : 1,
	M : 0,
	Q : 3,
	H : 2
};

//---------------------------------------------------------------------
// QRMaskPattern
//---------------------------------------------------------------------

var QRMaskPattern =  {
	PATTERN000 : 0,
	PATTERN001 : 1,
	PATTERN010 : 2,
	PATTERN011 : 3,
	PATTERN100 : 4,
	PATTERN101 : 5,
	PATTERN110 : 6,
	PATTERN111 : 7
};

//---------------------------------------------------------------------
// QRUtil
//---------------------------------------------------------------------
 
var QRUtil = {

    PATTERN_POSITION_TABLE : [
	    [],
	    [6, 18],
	    [6, 22],
	    [6, 26],
	    [6, 30],
	    [6, 34],
	    [6, 22, 38],
	    [6, 24, 42],
	    [6, 26, 46],
	    [6, 28, 50],
	    [6, 30, 54],		
	    [6, 32, 58],
	    [6, 34, 62],
	    [6, 26, 46, 66],
	    [6, 26, 48, 70],
	    [6, 26, 50, 74],
	    [6, 30, 54, 78],
	    [6, 30, 56, 82],
	    [6, 30, 58, 86],
	    [6, 34, 62, 90],
	    [6, 28, 50, 72, 94],
	    [6, 26, 50, 74, 98],
	    [6, 30, 54, 78, 102],
	    [6, 28, 54, 80, 106],
	    [6, 32, 58, 84, 110],
	    [6, 30, 58, 86, 114],
	    [6, 34, 62, 90, 118],
	    [6, 26, 50, 74, 98, 122],
	    [6, 30, 54, 78, 102, 126],
	    [6, 26, 52, 78, 104, 130],
	    [6, 30, 56, 82, 108, 134],
	    [6, 34, 60, 86, 112, 138],
	    [6, 30, 58, 86, 114, 142],
	    [6, 34, 62, 90, 118, 146],
	    [6, 30, 54, 78, 102, 126, 150],
	    [6, 24, 50, 76, 102, 128, 154],
	    [6, 28, 54, 80, 106, 132, 158],
	    [6, 32, 58, 84, 110, 136, 162],
	    [6, 26, 54, 82, 110, 138, 166],
	    [6, 30, 58, 86, 114, 142, 170]
    ],

    G15 : (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18 : (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK : (1 << 14) | (1 << 12) | (1 << 10)	| (1 << 4) | (1 << 1),

    getBCHTypeInfo : function(data) {
	    var d = data << 10;
	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
		    d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) ) ); 	
	    }
	    return ( (data << 10) | d) ^ QRUtil.G15_MASK;
    },

    getBCHTypeNumber : function(data) {
	    var d = data << 12;
	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
		    d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) ) ); 	
	    }
	    return (data << 12) | d;
    },

    getBCHDigit : function(data) {

	    var digit = 0;

	    while (data != 0) {
		    digit++;
		    data >>>= 1;
	    }

	    return digit;
    },

    getPatternPosition : function(typeNumber) {
	    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },

    getMask : function(maskPattern, i, j) {
	    
	    switch (maskPattern) {
		    
	    case QRMaskPattern.PATTERN000 : return (i + j) % 2 == 0;
	    case QRMaskPattern.PATTERN001 : return i % 2 == 0;
	    case QRMaskPattern.PATTERN010 : return j % 3 == 0;
	    case QRMaskPattern.PATTERN011 : return (i + j) % 3 == 0;
	    case QRMaskPattern.PATTERN100 : return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0;
	    case QRMaskPattern.PATTERN101 : return (i * j) % 2 + (i * j) % 3 == 0;
	    case QRMaskPattern.PATTERN110 : return ( (i * j) % 2 + (i * j) % 3) % 2 == 0;
	    case QRMaskPattern.PATTERN111 : return ( (i * j) % 3 + (i + j) % 2) % 2 == 0;

	    default :
		    throw new Error("bad maskPattern:" + maskPattern);
	    }
    },

    getErrorCorrectPolynomial : function(errorCorrectLength) {

	    var a = new QRPolynomial([1], 0);

	    for (var i = 0; i < errorCorrectLength; i++) {
		    a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0) );
	    }

	    return a;
    },

    getLengthInBits : function(mode, type) {

	    if (1 <= type && type < 10) {

		    // 1 - 9

		    switch(mode) {
		    case QRMode.MODE_NUMBER 	: return 10;
		    case QRMode.MODE_ALPHA_NUM 	: return 9;
		    case QRMode.MODE_8BIT_BYTE	: return 8;
		    case QRMode.MODE_KANJI  	: return 8;
		    default :
			    throw new Error("mode:" + mode);
		    }

	    } else if (type < 27) {

		    // 10 - 26

		    switch(mode) {
		    case QRMode.MODE_NUMBER 	: return 12;
		    case QRMode.MODE_ALPHA_NUM 	: return 11;
		    case QRMode.MODE_8BIT_BYTE	: return 16;
		    case QRMode.MODE_KANJI  	: return 10;
		    default :
			    throw new Error("mode:" + mode);
		    }

	    } else if (type < 41) {

		    // 27 - 40

		    switch(mode) {
		    case QRMode.MODE_NUMBER 	: return 14;
		    case QRMode.MODE_ALPHA_NUM	: return 13;
		    case QRMode.MODE_8BIT_BYTE	: return 16;
		    case QRMode.MODE_KANJI  	: return 12;
		    default :
			    throw new Error("mode:" + mode);
		    }

	    } else {
		    throw new Error("type:" + type);
	    }
    },

    getLostPoint : function(qrCode) {
	    
	    var moduleCount = qrCode.getModuleCount();
	    
	    var lostPoint = 0;
	    
	    // LEVEL1
	    
	    for (var row = 0; row < moduleCount; row++) {

		    for (var col = 0; col < moduleCount; col++) {

			    var sameCount = 0;
			    var dark = qrCode.isDark(row, col);

				for (var r = -1; r <= 1; r++) {

				    if (row + r < 0 || moduleCount <= row + r) {
					    continue;
				    }

				    for (var c = -1; c <= 1; c++) {

					    if (col + c < 0 || moduleCount <= col + c) {
						    continue;
					    }

					    if (r == 0 && c == 0) {
						    continue;
					    }

					    if (dark == qrCode.isDark(row + r, col + c) ) {
						    sameCount++;
					    }
				    }
			    }

			    if (sameCount > 5) {
				    lostPoint += (3 + sameCount - 5);
			    }
		    }
	    }

	    // LEVEL2

	    for (var row = 0; row < moduleCount - 1; row++) {
		    for (var col = 0; col < moduleCount - 1; col++) {
			    var count = 0;
			    if (qrCode.isDark(row,     col    ) ) count++;
			    if (qrCode.isDark(row + 1, col    ) ) count++;
			    if (qrCode.isDark(row,     col + 1) ) count++;
			    if (qrCode.isDark(row + 1, col + 1) ) count++;
			    if (count == 0 || count == 4) {
				    lostPoint += 3;
			    }
		    }
	    }

	    // LEVEL3

	    for (var row = 0; row < moduleCount; row++) {
		    for (var col = 0; col < moduleCount - 6; col++) {
			    if (qrCode.isDark(row, col)
					    && !qrCode.isDark(row, col + 1)
					    &&  qrCode.isDark(row, col + 2)
					    &&  qrCode.isDark(row, col + 3)
					    &&  qrCode.isDark(row, col + 4)
					    && !qrCode.isDark(row, col + 5)
					    &&  qrCode.isDark(row, col + 6) ) {
				    lostPoint += 40;
			    }
		    }
	    }

	    for (var col = 0; col < moduleCount; col++) {
		    for (var row = 0; row < moduleCount - 6; row++) {
			    if (qrCode.isDark(row, col)
					    && !qrCode.isDark(row + 1, col)
					    &&  qrCode.isDark(row + 2, col)
					    &&  qrCode.isDark(row + 3, col)
					    &&  qrCode.isDark(row + 4, col)
					    && !qrCode.isDark(row + 5, col)
					    &&  qrCode.isDark(row + 6, col) ) {
				    lostPoint += 40;
			    }
		    }
	    }

	    // LEVEL4
	    
	    var darkCount = 0;

	    for (var col = 0; col < moduleCount; col++) {
		    for (var row = 0; row < moduleCount; row++) {
			    if (qrCode.isDark(row, col) ) {
				    darkCount++;
			    }
		    }
	    }
	    
	    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
	    lostPoint += ratio * 10;

	    return lostPoint;		
    }

};


//---------------------------------------------------------------------
// QRMath
//---------------------------------------------------------------------

var QRMath = {

	glog : function(n) {
	
		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}
		
		return QRMath.LOG_TABLE[n];
	},
	
	gexp : function(n) {
	
		while (n < 0) {
			n += 255;
		}
	
		while (n >= 256) {
			n -= 255;
		}
	
		return QRMath.EXP_TABLE[n];
	},
	
	EXP_TABLE : new Array(256),
	
	LOG_TABLE : new Array(256)

};
	
for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4]
		^ QRMath.EXP_TABLE[i - 5]
		^ QRMath.EXP_TABLE[i - 6]
		^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i] ] = i;
}

//---------------------------------------------------------------------
// QRPolynomial
//---------------------------------------------------------------------

function QRPolynomial(num, shift) {

	if (num.length == undefined) {
		throw new Error(num.length + "/" + shift);
	}

	var offset = 0;

	while (offset < num.length && num[offset] == 0) {
		offset++;
	}

	this.num = new Array(num.length - offset + shift);
	for (var i = 0; i < num.length - offset; i++) {
		this.num[i] = num[i + offset];
	}
}

QRPolynomial.prototype = {

	get : function(index) {
		return this.num[index];
	},
	
	getLength : function() {
		return this.num.length;
	},
	
	multiply : function(e) {
	
		var num = new Array(this.getLength() + e.getLength() - 1);
	
		for (var i = 0; i < this.getLength(); i++) {
			for (var j = 0; j < e.getLength(); j++) {
				num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i) ) + QRMath.glog(e.get(j) ) );
			}
		}
	
		return new QRPolynomial(num, 0);
	},
	
	mod : function(e) {
	
		if (this.getLength() - e.getLength() < 0) {
			return this;
		}
	
		var ratio = QRMath.glog(this.get(0) ) - QRMath.glog(e.get(0) );
	
		var num = new Array(this.getLength() );
		
		for (var i = 0; i < this.getLength(); i++) {
			num[i] = this.get(i);
		}
		
		for (var i = 0; i < e.getLength(); i++) {
			num[i] ^= QRMath.gexp(QRMath.glog(e.get(i) ) + ratio);
		}
	
		// recursive call
		return new QRPolynomial(num, 0).mod(e);
	}
};

//---------------------------------------------------------------------
// QRRSBlock
//---------------------------------------------------------------------

function QRRSBlock(totalCount, dataCount) {
	this.totalCount = totalCount;
	this.dataCount  = dataCount;
}

QRRSBlock.RS_BLOCK_TABLE = [
// L
// M
// Q
// H

// 1
[1, 26, 19],
[1, 26, 16],
[1, 26, 13],
[1, 26, 9],
// 2
[1, 44, 34],
[1, 44, 28],
[1, 44, 22],
[1, 44, 16],
// 3
[1, 70, 55],
[1, 70, 44],
[2, 35, 17],
[2, 35, 13],
// 4		
[1, 100, 80],
[2, 50, 32],
[2, 50, 24],
[4, 25, 9],
// 5
[1, 134, 108],
[2, 67, 43],
[2, 33, 15, 2, 34, 16],
[2, 33, 11, 2, 34, 12],
// 6
[2, 86, 68],
[4, 43, 27],
[4, 43, 19],
[4, 43, 15],
// 7		
[2, 98, 78],
[4, 49, 31],
[2, 32, 14, 4, 33, 15],
[4, 39, 13, 1, 40, 14],
// 8
[2, 121, 97],
[2, 60, 38, 2, 61, 39],
[4, 40, 18, 2, 41, 19],
[4, 40, 14, 2, 41, 15],
// 9
[2, 146, 116],
[3, 58, 36, 2, 59, 37],
[4, 36, 16, 4, 37, 17],
[4, 36, 12, 4, 37, 13],
// 10		
[2, 86, 68, 2, 87, 69],
[4, 69, 43, 1, 70, 44],
[6, 43, 19, 2, 44, 20],
[6, 43, 15, 2, 44, 16]
//NOTE added by Ryan Day.to make greater than version 10 qrcodes
// this table starts on page 40 of the spec PDF. google ISO/IEC 18004
// 11
,[4,101,81]
,[1,80,50,4,81,51]
,[4,50,22,4,51,23]
,[3,36,12,8,37,13]
//12
,[2,116,92,2,117,93]
,[6,58,36,2,59,37]
,[4,46,20,6,47,21]
,[7,42,14,4,43,15]
//13
,[4,133,107]
,[8,59,37,1,60,38]
,[8,44,20,4,45,21]
,[12,33,11,4,34,12]
//14
,[3,145,115,1,146,116]
,[4,64,40,5,65,41]
,[11,36,16,5,37,17]
,[11,36,12,5,37,13]
//15
,[5,109,87,1,110,88]
,[5,65,41,5,66,42]
,[5,54,24,7,55,25]
,[11,36,12,7,37,13]
//16
,[5,122,98,1,123,99]
,[7,73,45,3,74,46]
,[15,43,19,2,44,20]
,[3,45,15,13,46,16]
//17
,[1,135,107,5,136,108]
,[10,74,46,1,75,47]
,[1,50,22,15,51,23]
,[2,42,14,17,43,15]
//18
,[5,150,120,1,151,121]
,[9,69,43,4,70,44]
,[17,50,22,1,51,23]
,[2,42,14,19,43,15]
//19
,[3,141,113,4,142,114]
,[3,70,44,11,71,45]
,[17,47,21,4,48,22]
,[9,39,13,16,40,14]
//20
,[3,135,107,5,136,108]
,[3,67,41,13,68,42]
,[15,54,24,5,55,25]
,[15,43,15,10,44,16]
//21
,[4,144,116,4,145,117]
,[17,68,42]
,[17,50,22,6,51,23]
,[19,46,16,6,47,17]
//22
,[2,139,111,7,140,112]
,[17,74,46]
,[7,54,24,16,55,25]
,[34,37,13]
//23
,[4,151,121,5,152,122]
,[4,75,47,14,76,48]
,[11,54,24,14,55,25]
,[16,45,15,14,46,16]
//24
,[6,147,117,4,148,118]
,[6,73,45,14,74,46]
,[11,54,24,16,55,25]
,[30,46,16,2,47,17]
//25
,[8,132,106,4,133,107]
,[8,75,47,13,76,48]
,[7,54,24,22,55,25]
,[22,45,15,13,46,16]
//26
,[10,142,114,2,143,115]
,[19,74,46,4,75,47]
,[28,50,22,6,51,23]
,[33,46,16,4,47,17]
//27
,[8,152,122,4,153,123]
,[22,73,45,3,74,46]
,[8,53,23,26,54,24]
,[12,45,15,28,46,16]
//28
,[3,147,117,10,148,118]
,[3,73,45,23,74,46]
,[4,54,24,31,55,25]
,[11,45,15,31,46,16]
//29
,[7,146,116,7,147,117]
,[21,73,45,7,74,46]
,[1,53,23,37,54,24]
,[19,45,15,26,46,16]
//30
,[5,145,115,10,146,116]
,[19,75,47,10,76,48]
,[15,54,24,25,55,25]
,[23,45,15,25,46,16]
//31
,[13,145,115,3,146,116]
,[2,74,46,29,75,47]
,[42,54,24,1,55,25]
,[23,45,15,28,46,16]
//32
,[17,145,115]
,[10,74,46,23,75,47]
,[10,54,24,35,55,25]
,[19,45,15,35,46,16]
//33
,[17,145,115,1,146,116]
,[14,74,46,21,75,47]
,[29,54,24,19,55,25]
,[11,45,15,46,46,16]
//34
,[13,145,115,6,146,116]
,[14,74,46,23,75,47]
,[44,54,24,7,55,25]
,[59,46,16,1,47,17]
//35
,[12,151,121,7,152,122]
,[12,75,47,26,76,48]
,[39,54,24,14,55,25]
,[22,45,15,41,46,16]
//36
,[6,151,121,14,152,122]
,[6,75,47,34,76,48]
,[46,54,24,10,55,25]
,[2,45,15,64,46,16]
//37
,[17,152,122,4,153,123]
,[29,74,46,14,75,47]
,[49,54,24,10,55,25]
,[24,45,15,46,46,16]
//38
,[4,152,122,18,153,123]
,[13,74,46,32,75,47]
,[48,54,24,14,55,25]
,[42,45,15,32,46,16]
//39
,[20,147,117,4,148,118]
,[40,75,47,7,76,48]
,[43,54,24,22,55,25]
,[10,45,15,67,46,16]
//40
,[19,148,118,6,149,119]
,[18,75,47,31,76,48]
,[34,54,24,34,55,25]
,[20,45,15,61,46,16]	
];

QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
	
	var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
	
	if (rsBlock == undefined) {
		throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	}

	var length = rsBlock.length / 3;
	
	var list = new Array();
	
	for (var i = 0; i < length; i++) {

		var count = rsBlock[i * 3 + 0];
		var totalCount = rsBlock[i * 3 + 1];
		var dataCount  = rsBlock[i * 3 + 2];

		for (var j = 0; j < count; j++) {
			list.push(new QRRSBlock(totalCount, dataCount) );	
		}
	}
	
	return list;
}

QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {

	switch(errorCorrectLevel) {
	case QRErrorCorrectLevel.L :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
	case QRErrorCorrectLevel.M :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
	case QRErrorCorrectLevel.Q :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
	case QRErrorCorrectLevel.H :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
	default :
		return undefined;
	}
}

//---------------------------------------------------------------------
// QRBitBuffer
//---------------------------------------------------------------------

function QRBitBuffer() {
	this.buffer = new Array();
	this.length = 0;
}

QRBitBuffer.prototype = {

	get : function(index) {
		var bufIndex = Math.floor(index / 8);
		return ( (this.buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
	},
	
	put : function(num, length) {
		for (var i = 0; i < length; i++) {
			this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
		}
	},
	
	getLengthInBits : function() {
		return this.length;
	},
	
	putBit : function(bit) {
	
		var bufIndex = Math.floor(this.length / 8);
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}
	
		if (bit) {
			this.buffer[bufIndex] |= (0x80 >>> (this.length % 8) );
		}
	
		this.length++;
	}
};

},{"bops":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/index.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/index.js":[function(require,module,exports){
var proto = {}
module.exports = proto

proto.from = require('./from.js')
proto.to = require('./to.js')
proto.is = require('./is.js')
proto.subarray = require('./subarray.js')
proto.join = require('./join.js')
proto.copy = require('./copy.js')
proto.create = require('./create.js')

mix(require('./read.js'), proto)
mix(require('./write.js'), proto)

function mix(from, into) {
  for(var key in from) {
    into[key] = from[key]
  }
}

},{"./copy.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/copy.js","./create.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/create.js","./from.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/from.js","./is.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/is.js","./join.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/join.js","./read.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/read.js","./subarray.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/subarray.js","./to.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/to.js","./write.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/write.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/node_modules/base64-js/lib/b64.js":[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/node_modules/to-utf8/index.js":[function(require,module,exports){
module.exports = to_utf8

var out = []
  , col = []
  , fcc = String.fromCharCode
  , mask = [0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01]
  , unmask = [
      0x00
    , 0x01
    , 0x02 | 0x01
    , 0x04 | 0x02 | 0x01
    , 0x08 | 0x04 | 0x02 | 0x01
    , 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x40 | 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
  ]

function to_utf8(bytes, start, end) {
  start = start === undefined ? 0 : start
  end = end === undefined ? bytes.length : end

  var idx = 0
    , hi = 0x80
    , collecting = 0
    , pos
    , by

  col.length =
  out.length = 0

  while(idx < bytes.length) {
    by = bytes[idx]
    if(!collecting && by & hi) {
      pos = find_pad_position(by)
      collecting += pos
      if(pos < 8) {
        col[col.length] = by & unmask[6 - pos]
      }
    } else if(collecting) {
      col[col.length] = by & unmask[6]
      --collecting
      if(!collecting && col.length) {
        out[out.length] = fcc(reduced(col, pos))
        col.length = 0
      }
    } else { 
      out[out.length] = fcc(by)
    }
    ++idx
  }
  if(col.length && !collecting) {
    out[out.length] = fcc(reduced(col, pos))
    col.length = 0
  }
  return out.join('')
}

function find_pad_position(byt) {
  for(var i = 0; i < 7; ++i) {
    if(!(byt & mask[i])) {
      break
    }
  }
  return i
}

function reduced(list) {
  var out = 0
  for(var i = 0, len = list.length; i < len; ++i) {
    out |= list[i] << ((len - i - 1) * 6)
  }
  return out
}

},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/copy.js":[function(require,module,exports){
module.exports = copy

var slice = [].slice

function copy(source, target, target_start, source_start, source_end) {
  target_start = arguments.length < 3 ? 0 : target_start
  source_start = arguments.length < 4 ? 0 : source_start
  source_end = arguments.length < 5 ? source.length : source_end

  if(source_end === source_start) {
    return
  }

  if(target.length === 0 || source.length === 0) {
    return
  }

  if(source_end > source.length) {
    source_end = source.length
  }

  if(target.length - target_start < source_end - source_start) {
    source_end = target.length - target_start + start
  }

  if(source.buffer !== target.buffer) {
    return fast_copy(source, target, target_start, source_start, source_end)
  }
  return slow_copy(source, target, target_start, source_start, source_end)
}

function fast_copy(source, target, target_start, source_start, source_end) {
  var len = (source_end - source_start) + target_start

  for(var i = target_start, j = source_start;
      i < len;
      ++i,
      ++j) {
    target[i] = source[j]
  }
}

function slow_copy(from, to, j, i, jend) {
  // the buffers could overlap.
  var iend = jend + i
    , tmp = new Uint8Array(slice.call(from, i, iend))
    , x = 0

  for(; i < iend; ++i, ++x) {
    to[j++] = tmp[x]
  }
}

},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/create.js":[function(require,module,exports){
module.exports = function(size) {
  return new Uint8Array(size)
}

},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/from.js":[function(require,module,exports){
module.exports = from

var base64 = require('base64-js')

var decoders = {
    hex: from_hex
  , utf8: from_utf
  , base64: from_base64
}

function from(source, encoding) {
  if(Array.isArray(source)) {
    return new Uint8Array(source)
  }

  return decoders[encoding || 'utf8'](source)
}

function from_hex(str) {
  var size = str.length / 2
    , buf = new Uint8Array(size)
    , character = ''

  for(var i = 0, len = str.length; i < len; ++i) {
    character += str.charAt(i)

    if(i > 0 && (i % 2) === 1) {
      buf[i>>>1] = parseInt(character, 16)
      character = '' 
    }
  }

  return buf 
}

function from_utf(str) {
  var bytes = []
    , tmp
    , ch

  for(var i = 0, len = str.length; i < len; ++i) {
    ch = str.charCodeAt(i)
    if(ch & 0x80) {
      tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%')
      for(var j = 0, jlen = tmp.length; j < jlen; ++j) {
        bytes[bytes.length] = parseInt(tmp[j], 16)
      }
    } else {
      bytes[bytes.length] = ch 
    }
  }

  return new Uint8Array(bytes)
}

function from_base64(str) {
  return new Uint8Array(base64.toByteArray(str)) 
}

},{"base64-js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/node_modules/base64-js/lib/b64.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/is.js":[function(require,module,exports){

module.exports = function(buffer) {
  return buffer instanceof Uint8Array;
}

},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/join.js":[function(require,module,exports){
module.exports = join

function join(targets, hint) {
  if(!targets.length) {
    return new Uint8Array(0)
  }

  var len = hint !== undefined ? hint : get_length(targets)
    , out = new Uint8Array(len)
    , cur = targets[0]
    , curlen = cur.length
    , curidx = 0
    , curoff = 0
    , i = 0

  while(i < len) {
    if(curoff === curlen) {
      curoff = 0
      ++curidx
      cur = targets[curidx]
      curlen = cur && cur.length
      continue
    }
    out[i++] = cur[curoff++] 
  }

  return out
}

function get_length(targets) {
  var size = 0
  for(var i = 0, len = targets.length; i < len; ++i) {
    size += targets[i].byteLength
  }
  return size
}

},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/mapped.js":[function(require,module,exports){
var proto
  , map

module.exports = proto = {}

map = typeof WeakMap === 'undefined' ? null : new WeakMap

proto.get = !map ? no_weakmap_get : get

function no_weakmap_get(target) {
  return new DataView(target.buffer, 0)
}

function get(target) {
  var out = map.get(target.buffer)
  if(!out) {
    map.set(target.buffer, out = new DataView(target.buffer, 0))
  }
  return out
}

},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/read.js":[function(require,module,exports){
module.exports = {
    readUInt8:      read_uint8
  , readInt8:       read_int8
  , readUInt16LE:   read_uint16_le
  , readUInt32LE:   read_uint32_le
  , readInt16LE:    read_int16_le
  , readInt32LE:    read_int32_le
  , readFloatLE:    read_float_le
  , readDoubleLE:   read_double_le
  , readUInt16BE:   read_uint16_be
  , readUInt32BE:   read_uint32_be
  , readInt16BE:    read_int16_be
  , readInt32BE:    read_int32_be
  , readFloatBE:    read_float_be
  , readDoubleBE:   read_double_be
}

var map = require('./mapped.js')

function read_uint8(target, at) {
  return target[at]
}

function read_int8(target, at) {
  var v = target[at];
  return v < 0x80 ? v : v - 0x100
}

function read_uint16_le(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, true)
}

function read_uint32_le(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, true)
}

function read_int16_le(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, true)
}

function read_int32_le(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, true)
}

function read_float_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, true)
}

function read_double_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, true)
}

function read_uint16_be(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, false)
}

function read_uint32_be(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, false)
}

function read_int16_be(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, false)
}

function read_int32_be(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, false)
}

function read_float_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, false)
}

function read_double_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, false)
}

},{"./mapped.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/mapped.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/subarray.js":[function(require,module,exports){
module.exports = subarray

function subarray(buf, from, to) {
  return buf.subarray(from || 0, to || buf.length)
}

},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/to.js":[function(require,module,exports){
module.exports = to

var base64 = require('base64-js')
  , toutf8 = require('to-utf8')

var encoders = {
    hex: to_hex
  , utf8: to_utf
  , base64: to_base64
}

function to(buf, encoding) {
  return encoders[encoding || 'utf8'](buf)
}

function to_hex(buf) {
  var str = ''
    , byt

  for(var i = 0, len = buf.length; i < len; ++i) {
    byt = buf[i]
    str += ((byt & 0xF0) >>> 4).toString(16)
    str += (byt & 0x0F).toString(16)
  }

  return str
}

function to_utf(buf) {
  return toutf8(buf)
}

function to_base64(buf) {
  return base64.fromByteArray(buf)
}


},{"base64-js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/node_modules/base64-js/lib/b64.js","to-utf8":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/node_modules/to-utf8/index.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/write.js":[function(require,module,exports){
module.exports = {
    writeUInt8:      write_uint8
  , writeInt8:       write_int8
  , writeUInt16LE:   write_uint16_le
  , writeUInt32LE:   write_uint32_le
  , writeInt16LE:    write_int16_le
  , writeInt32LE:    write_int32_le
  , writeFloatLE:    write_float_le
  , writeDoubleLE:   write_double_le
  , writeUInt16BE:   write_uint16_be
  , writeUInt32BE:   write_uint32_be
  , writeInt16BE:    write_int16_be
  , writeInt32BE:    write_int32_be
  , writeFloatBE:    write_float_be
  , writeDoubleBE:   write_double_be
}

var map = require('./mapped.js')

function write_uint8(target, value, at) {
  return target[at] = value
}

function write_int8(target, value, at) {
  return target[at] = value < 0 ? value + 0x100 : value
}

function write_uint16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, true)
}

function write_uint32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, true)
}

function write_int16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, true)
}

function write_int32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, true)
}

function write_float_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, true)
}

function write_double_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, true)
}

function write_uint16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, false)
}

function write_uint32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, false)
}

function write_int16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, false)
}

function write_int32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, false)
}

function write_float_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, false)
}

function write_double_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, false)
}

},{"./mapped.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/node_modules/bops/typedarray/mapped.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/qrcodeclient.js":[function(require,module,exports){

module.exports = require('./lib/qrcode-draw.js');

},{"./lib/qrcode-draw.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/lib/qrcode-draw.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/domCtrl.js":[function(require,module,exports){
;(function(doc){
    var body = doc.getElementsByTagName('body')[0];
    var sideBarCover = doc.getElementsByClassName('js-sideBarCover')[0];
    var mainContent = sideBarCover.getElementsByClassName('js-main-content')[0];
    var menuBtn = doc.getElementsByClassName('js-showSideBar')[0];
    var sidebar = doc.getElementsByClassName('js-sidebar')[0];
    var actionClass = Modernizr.csstransforms3d ? ' is-showSideBar' : ' is-showSideBar--old';

    var scrollCtrl = doc.getElementsByClassName('js-scrollCtrl')[0];
    var toTopBtn = doc.getElementsByClassName('js-toTop')[0];
    var transitionEvt = require('./modules/transitionend.js')(sideBarCover);
    var scroll2Top = require('./modules/scroll2Top.js');
    var transitionHandler = function(){
        sidebar.style.zIndex = 1;
        sideBarCover.removeEventListener(transitionEvt, transitionHandler);
    };


    menuBtn.addEventListener('click', function(e){
        e.preventDefault();
        var className = sideBarCover.className;
        var index = className.indexOf(actionClass);
        if(index > -1) {
            sideBarCover.className = className.slice(0, index) + className.slice(index+actionClass.length);
            sidebar.style.zIndex = -1;
        } else if(index <= -1) {
            sidebar.scrollTop = 0;
            sideBarCover.className += actionClass;
            sideBarCover.addEventListener(transitionEvt, transitionHandler);
        }
    });

    sideBarCover.addEventListener('scroll', function(){
        var bodyHeight = mainContent.clientHeight;
        if(sideBarCover.scrollTop >= bodyHeight*2/7) {
            if(scrollCtrl.className.indexOf(' is-show') > -1) {
                return;
            }
            scrollCtrl.className += ' is-show';
        } else {
            if(scrollCtrl.className.indexOf(' is-show') === -1) {
                return;
            }
            var className = scrollCtrl.className;
            var index = className.indexOf(' is-show');
            scrollCtrl.className = className.slice(0, index) + className.slice(index + ' is-show'.length);
        }
    });

    toTopBtn.addEventListener('click', function(e){
        e.preventDefault();
        scroll2Top(sideBarCover, 900);
    });

//  init shareKit
    var SK;
    var sk;
    var wxBtn;
    var wxQRCode;
    if(document.getElementsByClassName('js-shareKitWrap').length > 0) {
        SK = require('./modules/shareKit.js');
        sk = new SK({
            twitterName: 'sunaiwen'
        });
        console.log(sk.device);
        if(sk.device === 'pc') {
            wxBtn = doc.getElementsByClassName('js-blog-wxBtn')[0];
            wxQRCode = doc.getElementsByClassName('js-blog-wxQRCode')[0];
            wxBtn.addEventListener('click', function(){
                wxQRCode.style.display = 'block';
            });
            wxQRCode.addEventListener('click', function(){
                wxQRCode.style.display = 'none';
            });

        }
    }
})(document);
},{"./modules/scroll2Top.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/scroll2Top.js","./modules/shareKit.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/shareKit.js","./modules/transitionend.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/transitionend.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/scroll2Top.js":[function(require,module,exports){
;(function(){
//    get the prefix or non-prefix raf
    var animate = (function(){
        var action = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        return function(runner){
            action.call(window, runner);
        };
    })();

//    get or set the scrollTop value
    var scrollTop = function(component, nextStep){
        if(nextStep == null) {
            return component.scrollY != null ? component.scrollY : component.scrollTop;
        } else if(nextStep <= 0) {
            component.scrollTo ? component.scrollTo(0, 0):component.scrollTop = 0;
            return 0;
        } else {
            component.scrollTo ? component.scrollTo(0, nextStep) : component.scrollTop = nextStep;
            return nextStep;
        }
    };

//    set speed
    var speedConduct = function(originSpeed, time, cur, total){
        if(total === 0) {
            return 0;
        }
        var method = Math.sin;
        var PI = Math.PI;
        var INIT_SPEED = 2;
        return originSpeed * method(PI * (total-cur)/total) + INIT_SPEED;
    };

    var scroll2Top = function(component, time){
        var DEFAULT_TIME = 1000;
        if(component == null) {
            console.error('You must assign a dom node object or window object as the first param.');
            return;
        }
        if(time == null) {
            time = DEFAULT_TIME;
        }
        var originY = scrollTop(component);
        var currentY = originY;
        var originSpeed = originY / (time / 60);
        var currentSpeed;
        (function operate(){
            currentSpeed = speedConduct(originSpeed, time, currentY, originY);
            currentY -= currentSpeed;
            if(scrollTop(component, currentY) !== 0) {
                animate(operate);
            }
        })();
    };

    module.exports = scroll2Top;
})();
},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/shareKit.js":[function(require,module,exports){
;(function(){
    var QRCode = require('qrcode');
    var SK = function(options){
        this.baseConf = this.setOptions(options);
        this.device = this.detectDevice(navigator.userAgent);
        this.initEle(this.baseConf.prefix);
        this.bind(this.qzEle, this.qzoneFunc);
        this.bind(this.twEle, this.twitterFunc);
        //this.bind(this.wbEle, this.weiboFunc);
        this.weiboFunc(this);
        this.bind(this.wxEle, this.wechatFunc);
    };
    SK.prototype.initEle = function(prefix) {
        this.wrapEle = document.getElementsByClassName('js-'+prefix)[0];
        this.qzEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-qzone')[0];
        this.wbEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-weibo')[0];
        this.twEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-twitter')[0];
        this.wxEle = this.wrapEle.getElementsByClassName('js-'+prefix+'-wechat')[0];
    };

    SK.prototype.bind = function(ele, handler){
        var self = this;
        ele.onclick = function(e){
            e.preventDefault();
            handler(self);
        };
    };

    SK.prototype.openWin = function(options){
        // url cannot be empty
        if(options.url == null) {
            console.error('The url to open have to be passed in.');
            return;
        }
        var temp = {};
        var title = options.title || 'shareKit\'s window';
        var url = options.url;
        var windowConf='';
        for(var key in options) {
            if(options.hasOwnProperty(key)) {
                temp[key] = options[key];
            }
        }
        delete temp.title;
        delete temp.url;
        if(temp.via != null) {
            delete temp.via;
        }
        if(temp.text != null) {
            delete temp.text;
        }
        if(temp.countUrl != null){
            delete temp.countUrl;
        }
        for(key in temp) {
            windowConf += (key+'='+temp[key]+',');
        }
        windowConf = windowConf.slice(0,-1);
        window.open(url, title, windowConf);
    };

    // qzone share handler
    SK.prototype.qzoneFunc = function(self){
        var conf = self.getOption();
        var p = {
            url: conf.link,
            showcount:'1',/*是否显示分享总数,显示：'1'，不显示：'0' */
            desc: '',/*默认分享理由(可选)*/
            summary: conf.desc,/*分享摘要(可选)*/
            title: conf.title,/*分享标题(可选)*/
            site:'',/*分享来源 如：腾讯网(可选)*/
            pics:'', /*分享图片的路径(可选)*/
            style:'203',
            width:98,
            height:22
        };
        var link;
        link = urlConcat(p, 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey');
        self.openWin({
            url: link,
            title: 'Sharing to Qzone',
            toolbar: 'no',
            resizable: 'no',
            status: 'no',
            menubar: 'no',
            scrollbars: 'no',
            height: 650,
            width: 600,
            left: 200,
            top: 50
        });
    };

//    weibo share handler
    SK.prototype.weiboFunc = function(self){
        var conf = self.getOption();
        var defaultText = conf.title+'--'+conf.desc+': '+conf.link;
        //    init weibo element's id
        self.wbEle.id = 'wb_publish';
        WB2.anyWhere(function(W){
            W.widget.publish({
                action:'publish',
                type:'web',
                refer:'y',
                language:'zh_cn',
                button_type:'red',
                button_size:'middle',
                appkey:'3125265748',
                id: 'wb_publish',
                uid: '1624118717',
                default_text: defaultText
            });
        });
    };

//    twitter share handler
    SK.prototype.twitterFunc = function(self){
        var conf = self.getOption();
        var shareUrl = 'https://twitter.com/share';
        var shareObj = {
            url: conf.link,
            text: conf.title +' - '+conf.desc,
            countUrl: conf.link,
            via: conf.twitterName || ''
        };
        shareUrl = urlConcat(shareObj, shareUrl);
        conf.title = 'Sharing to Twitter';
        self.openWin({
            url: shareUrl,
            title: conf.title,
            toolbar: 'no',
            resizable: 'no',
            menubar: 'no',
            scrollbars: 'no',
            height: 650,
            width: 600,
            left: 200,
            top: 50
        });
    };

//    wechat share Handler
    SK.prototype.wechatFunc = function(self){
        var conf = self.baseConf;
        var qrcode;
        var wcCanvas;
        var shareReady;
        var wxObj;
        if(self.device === 'phone') {
            wxObj = {};
            wxObj.title = conf.title;
            wxObj.link = conf.link;
            wxObj.desc = conf.desc;
            wxObj.img_url = conf.portrait;
            shareReady = function(){
                WeixinJSBridge.on('menu:share:appmessage', function(){
                    WeixinJSBridge.invoke('sendAppMessage', wxObj,function(){})
                });
                WeixinJSBridge.on('menu:share:timeline', function(){
                    WeixinJSBridge.invoke('shareTimeline', wxObj, function(){});
                });
            };
            if(typeof WeixinJSBridge === 'undefined') {
                document.addEventListener('WeixinJSBridgeReady', shareReady);
            } else {
                shareReady();
            }
        } else if(self.device === 'pc') {
            wcCanvas = self.wrapEle.getElementsByClassName('js-'+conf.prefix+'-wechat-QRCode')[0];
            qrcode = new QRCode.QRCodeDraw();
            qrcode.draw(wcCanvas, location.href, function(error, canvas){});
        }
    };

//    make the base data
    SK.prototype.setOptions = function (options) {
        var baseConf = {};
        if(options == null) {
            options = baseConf;
        }
        if(options.title == null) {
            baseConf.title = document.title;
        } else {
            baseConf.title = options.title;
        }
        if(options.link == null) {
            baseConf.link = location.href;
        } else {
            baseConf.link = options.link;
        }
        if(options.desc == null) {
            baseConf.desc = findDesc();
        } else {
            baseConf.desc = options.desc;
        }
        if(options.twitterName != null) {
            baseConf.twitterName = options.twitterName;
        }
        if(options.prefix == null) {
            baseConf.prefix = 'shareKit';
        } else {
            baseConf.prefix = options.prefix;
        }
        if(options.portrait == null) {
            options.portrait = 'http://usualimages.qiniudn.com/1.jpeg';
        } else {
            baseConf.portrait = options.portrait;
        }
        return baseConf;
    };

    // return a copy of option object
    SK.prototype.getOption = function(){
        var re = {};
        for(var key in this.baseConf) {
            re[key] = this.baseConf[key];
        }
        return re;
    };

    // detect device type
    SK.prototype.detectDevice = function(ua){
        if(ua.match(/iphone|ipad|android/gi) != null) {
            return 'phone';
        } else {
            return 'pc';
        }
    };

    function findDesc(){
        var metas = document.getElementsByTagName('meta');
        var meta;
        for(var i=0; i< metas.length; i++) {
            meta = metas[i];
            if(meta.getAttribute('name') === 'description') {
                return meta.getAttribute('content');
            }
        }
    }

//    concat url and query data
    var urlConcat = function(o, url){
        var s = [];
        for(var i in o){
            s.push(i + '=' + encodeURIComponent(o[i]||''));
        }
        return url + '?' + s.join('&');
    };

    module.exports = SK;
})();
},{"qrcode":"/Users/sunaiwen/ffun/octopress/.themes/virgin/node_modules/qrcode/qrcodeclient.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/transitionend.js":[function(require,module,exports){
module.exports = function(testEle){
    var transitions = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'OTransition'      : 'oTransitionEnd otransitionend',
        'transition'       : 'transitionend'
    };

    for(var t in transitions){
        if(testEle.style[t] !== undefined){
            return transitions[t];
        }
    }
};
},{}]},{},["/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/domCtrl.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9xcmNhcGFjaXR5dGFibGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL2xpYi9xcmNvZGUtZHJhdy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL3FyY29kZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvbm9kZV9tb2R1bGVzL3RvLXV0ZjgvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL3R5cGVkYXJyYXkvY29weS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9jcmVhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvcXJjb2RlL25vZGVfbW9kdWxlcy9ib3BzL3R5cGVkYXJyYXkvZnJvbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9pcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9qb2luLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L21hcHBlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9xcmNvZGUvbm9kZV9tb2R1bGVzL2JvcHMvdHlwZWRhcnJheS9yZWFkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L3N1YmFycmF5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L3RvLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9ub2RlX21vZHVsZXMvYm9wcy90eXBlZGFycmF5L3dyaXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3FyY29kZS9xcmNvZGVjbGllbnQuanMiLCJkb21DdHJsLmpzIiwibW9kdWxlcy9zY3JvbGwyVG9wLmpzIiwibW9kdWxlcy9zaGFyZUtpdC5qcyIsIm1vZHVsZXMvdHJhbnNpdGlvbmVuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG50aGlzIGNvbnRhaW5zIHRoZSBtYXggc3RyaW5nIGxlbmd0aCBmb3IgYWxsIHFyIGNvZGUgVmVyc2lvbnMgaW4gQmluYXJ5IFNhZmUgLyBCeXRlIE1vZGVcbmVhY2ggZW50cnkgaXMgaW4gdGhlIG9yZGVyIG9mIGVycm9yIGNvcnJlY3QgbGV2ZWxcblx0W0wsTSxRLEhdXG5cbnRoZSBxcmNvZGUgbGliIHNldHMgc3RyYW5nZSB2YWx1ZXMgZm9yIFFSRXJyb3JDb3JyZWN0TGV2ZWwgaGF2aW5nIHRvIGRvIHdpdGggbWFza2luZyBhZ2FpbnN0IHBhdHRlcm5zXG50aGUgbWF4aW11bSBzdHJpbmcgbGVuZ3RoIGZvciBlcnJvciBjb3JyZWN0IGxldmVsIEggaXMgMTI3MyBjaGFyYWN0ZXJzIGxvbmcuXG4qL1xuXG5leHBvcnRzLlFSQ2FwYWNpdHlUYWJsZSA9IFtcblsxNywxNCwxMSw3XVxuLFszMiwyNiwyMCwxNF1cbixbNTMsNDIsMzIsMjRdXG4sWzc4LDYyLDQ2LDM0XVxuLFsxMDYsODQsNjAsNDRdXG4sWzEzNCwxMDYsNzQsNThdXG4sWzE1NCwxMjIsODYsNjRdXG4sWzE5MiwxNTIsMTA4LDg0XVxuLFsyMzAsMTgwLDEzMCw5OF1cbixbMjcxLDIxMywxNTEsMTE5XVxuLFszMjEsMjUxLDE3NywxMzddLy8xMVxuLFszNjcsMjg3LDIwMywxNTVdXG4sWzQyNSwzMzEsMjQxLDE3N11cbixbNDU4LDM2MiwyNTgsMTk0XVxuLFs1MjAsNDEyLDI5MiwyMjBdXG4sWzU4Niw0NTAsMzIyLDI1MF1cbixbNjQ0LDUwNCwzNjQsMjgwXVxuLFs3MTgsNTYwLDM5NCwzMTBdXG4sWzc5Miw2MjQsNDQyLDMzOF1cbixbODU4LDY2Niw0ODIsMzgyXVxuLFs5MjksNzExLDUwOSw0MDNdXG4sWzEwMDMsNzc5LDU2NSw0MzldXG4sWzEwOTEsODU3LDYxMSw0NjFdXG4sWzExNzEsOTExLDY2MSw1MTFdLy8yNFxuLFsxMjczLDk5Nyw3MTUsNTM1XVxuLFsxMzY3LDEwNTksNzUxLDU5M11cbixbMTQ2NSwxMTI1LDgwNSw2MjVdXG4sWzE1MjgsMTE5MCw4NjgsNjU4XS8vMjhcbixbMTYyOCwxMjY0LDkwOCw2OThdXG4sWzE3MzIsMTM3MCw5ODIsNzQyXVxuLFsxODQwLDE0NTIsMTAzMCw3OTBdXG4sWzE5NTIsMTUzOCwxMTEyLDg0Ml0vLzMyXG4sWzIwNjgsMTYyOCwxMTY4LDg5OF1cbixbMjE4OCwxNzIyLDEyMjgsOTU4XVxuLFsyMzAzLDE4MDksMTI4Myw5ODNdXG4sWzI0MzEsMTkxMSwxMzUxLDEwNTFdLy8zNlxuLFsyNTYzLDE5ODksMTQyMywxMDkzXVxuLFsyNjk5LDIwOTksMTQ5OSwxMTM5XVxuLFsyODA5LDIyMTMsMTU3OSwxMjE5XVxuLFsyOTUzLDIzMzEsMTY2MywxMjczXS8vNDBcbl07XG4iLCIvKlxuKiBjb3B5cmlnaHQgMjAxMC0yMDEyIFJ5YW4gRGF5XG4qIGh0dHA6Ly9naXRodWIuY29tL3NvbGRhaXIvbm9kZS1xcmNvZGVcbipcbiogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuKiAgIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4qXG4qIGNhbnZhcyBleGFtcGxlIGFuZCBmYWxsYmFjayBzdXBwb3J0IGV4YW1wbGUgcHJvdmlkZWQgYnkgSm9zaHVhIEtvb1xuKlx0aHR0cDovL2phYnR1bmVzLmNvbS9sYWJzL3FyY29kZS5odG1sXG4qXHRcIkluc3RhbnQgUVJDb2RlIE1hc2h1cCBieSBKb3NodWEgS29vIVwiXG4qXHRhcyBmYXIgYXMgaSBjYW4gdGVsbCB0aGUgcGFnZSBhbmQgdGhlIGNvZGUgb24gdGhlIHBhZ2UgYXJlIHB1YmxpYyBkb21haW4gXG4qXHRcbiogb3JpZ2luYWwgdGFibGUgZXhhbXBsZSBhbmQgbGlicmFyeSBwcm92aWRlZCBieSBLYXp1aGlrbyBBcmFzZVxuKlx0aHR0cDovL2QtcHJvamVjdC5nb29nbGVjb2RlLmNvbS9zdm4vdHJ1bmsvbWlzYy9xcmNvZGUvanMvXG4qXG4qL1xuXG52YXIgYm9wcyA9IHJlcXVpcmUoJ2JvcHMnKVxudmFyIFFSQ29kZUxpYiA9IHJlcXVpcmUoJy4vcXJjb2RlLmpzJyk7XG52YXIgUVJWZXJzaW9uQ2FwYWNpdHlUYWJsZSA9IHJlcXVpcmUoJy4vcXJjYXBhY2l0eXRhYmxlLmpzJykuUVJDYXBhY2l0eVRhYmxlO1xudmFyIFFSQ29kZSA9IFFSQ29kZUxpYi5RUkNvZGU7XG5cbmV4cG9ydHMuUVJDb2RlRHJhdyA9IFFSQ29kZURyYXc7XG5leHBvcnRzLlFSVmVyc2lvbkNhcGFjaXR5VGFibGUgPSBRUlZlcnNpb25DYXBhY2l0eVRhYmxlO1xuZXhwb3J0cy5RUkVycm9yQ29ycmVjdExldmVsID0gUVJDb2RlTGliLlFSRXJyb3JDb3JyZWN0TGV2ZWw7XG5leHBvcnRzLlFSQ29kZSA9IFFSQ29kZUxpYi5RUkNvZGU7XG5cbmZ1bmN0aW9uIFFSQ29kZURyYXcoKXt9XG5cblFSQ29kZURyYXcucHJvdG90eXBlID0ge1xuICBzY2FsZTo0LC8vNCBweCBtb2R1bGUgc2l6ZVxuICBkZWZhdWx0TWFyZ2luOjIwLFxuICBtYXJnaW5TY2FsZUZhY3Rvcjo1LFxuICBBcnJheToodHlwZW9mIFVpbnQzMkFycmF5ID09ICd1bmRlZmluZWQnP1VpbnQzMkFycmF5OkFycmF5KSxcbiAgLy8geW91IG1heSBjb25maWd1cmUgdGhlIGVycm9yIGJlaGF2aW9yIGZvciBpbnB1dCBzdHJpbmcgdG9vIGxvbmdcbiAgZXJyb3JCZWhhdmlvcjp7XG4gICAgbGVuZ3RoOid0cmltJ1xuICB9LFxuICBjb2xvcjp7XG4gICAgZGFyazonYmxhY2snLFxuICAgIGxpZ2h0Oid3aGl0ZSdcbiAgfSxcbiAgZGVmYXVsdEVycm9yQ29ycmVjdExldmVsOlFSQ29kZUxpYi5RUkVycm9yQ29ycmVjdExldmVsLkgsXG4gIFFSRXJyb3JDb3JyZWN0TGV2ZWw6UVJDb2RlTGliLlFSRXJyb3JDb3JyZWN0TGV2ZWwsXG4gIGRyYXc6ZnVuY3Rpb24oY2FudmFzLHRleHQsb3B0aW9ucyxjYil7XG5cbiAgICB2YXIgbGV2ZWwsXG4gICAgZXJyb3IsXG4gICAgZXJyb3JDb3JyZWN0TGV2ZWw7XG4gICAgXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIGNiID0gYXJncy5wb3AoKTsgXG4gICAgY2FudmFzID0gYXJncy5zaGlmdCgpO1xuICAgIHRleHQgPSBhcmdzLnNoaWZ0KCk7XG4gICAgb3B0aW9ucyA9IGFyZ3Muc2hpZnQoKXx8e307XG5cbiAgICBcbiAgICBpZih0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy9lbmZvcmNlIGNhbGxiYWNrIGFwaSBqdXN0IGluIGNhc2UgdGhlIHByb2Nlc3NpbmcgY2FuIGJlIG1hZGUgYXN5bmMgaW4gdGhlIGZ1dHVyZVxuICAgICAgLy8gb3Igc3VwcG9ydCBwcm9jIG9wZW4gdG8gbGlicXJlbmNvZGVcbiAgICAgIHRocm93IG5ldyBFcnJvcignY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgICB9XG4gICAgXG4gICAgaWYodHlwZW9mIG9wdGlvbnMgIT09IFwib2JqZWN0XCIpe1xuICAgICAgb3B0aW9ucy5lcnJvckNvcnJlY3RMZXZlbCA9IG9wdGlvbnM7XG4gICAgfVxuICAgIFxuXG4gICAgdGhpcy5RUlZlcnNpb24oXG4gICAgICB0ZXh0XG4gICAgICAsb3B0aW9ucy5lcnJvckNvcnJlY3RMZXZlbHx8dGhpcy5RUkVycm9yQ29ycmVjdExldmVsLkhcbiAgICAgICxvcHRpb25zLnZlcnNpb25cbiAgICAsZnVuY3Rpb24oZSx0LGwsZWMpe1xuXG4gICAgICB0ZXh0ID0gdCxsZXZlbCA9IGwsZXJyb3IgPSBlLGVycm9yQ29ycmVjdExldmVsID0gZWM7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNjYWxlID0gb3B0aW9ucy5zY2FsZXx8dGhpcy5zY2FsZTtcbiAgICB0aGlzLm1hcmdpbiA9IHR5cGVvZihvcHRpb25zLm1hcmdpbikgPT09ICd1bmRlZmluZWQnID8gdGhpcy5kZWZhdWx0TWFyZ2luIDogb3B0aW9ucy5tYXJnaW47XG4gICAgXG4gICAgaWYoIWxldmVsKSB7XG4gICAgICAvL2lmIHdlIGFyZSB1bmFibGUgdG8gZmluZCBhbiBhcHByb3ByaWF0ZSBxciBsZXZlbCBlcnJvciBvdXRcbiAgICAgIGNiKGVycm9yLGNhbnZhcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy9jcmVhdGUgcXJjb2RlIVxuICAgIHRyeXtcbiAgICAgIFxuICAgICAgdmFyIHFyID0gbmV3IFFSQ29kZUxpYi5RUkNvZGUobGV2ZWwsIGVycm9yQ29ycmVjdExldmVsKVxuICAgICAgLCBzY2FsZSA9IHRoaXMuc2NhbGV8fDRcbiAgICAgICwgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgICAgICwgd2lkdGggPSAwO1xuXG4gICAgICBxci5hZGREYXRhKHRleHQpO1xuICAgICAgcXIubWFrZSgpO1xuXG4gICAgICB2YXIgbWFyZ2luID0gdGhpcy5tYXJnaW5XaWR0aCgpO1xuICAgICAgdmFyIGN1cnJlbnR5ID0gbWFyZ2luO1xuICAgICAgd2lkdGggPSB0aGlzLmRhdGFXaWR0aChxcikrIG1hcmdpbioyO1xuICAgICAgXG4gICAgICB0aGlzLnJlc2V0Q2FudmFzKGNhbnZhcyxjdHgsd2lkdGgpO1xuXG4gICAgICBmb3IgKHZhciByID0gMCxybD1xci5nZXRNb2R1bGVDb3VudCgpOyByIDwgcmw7IHIrKykge1xuICAgICAgICB2YXIgY3VycmVudHggPSBtYXJnaW47XG4gICAgICAgIGZvciAodmFyIGMgPSAwLGNsPXFyLmdldE1vZHVsZUNvdW50KCk7IGMgPCBjbDsgYysrKSB7XG4gICAgICAgICAgaWYgKHFyLmlzRGFyayhyLCBjKSApIHtcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yLmRhcms7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3QgKGN1cnJlbnR4LCBjdXJyZW50eSwgc2NhbGUsIHNjYWxlKTtcbiAgICAgICAgICB9IGVsc2UgaWYodGhpcy5jb2xvci5saWdodCl7XG4gICAgICAgICAgICAvL2lmIGZhbHN5IGNvbmZpZ3VyZWQgY29sb3JcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yLmxpZ2h0O1xuICAgICAgICAgICAgY3R4LmZpbGxSZWN0IChjdXJyZW50eCwgY3VycmVudHksIHNjYWxlLCBzY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnJlbnR4ICs9IHNjYWxlO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnR5ICs9IHNjYWxlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVycm9yID0gZTtcbiAgICB9XG4gICAgXG4gICAgY2IoZXJyb3IsY2FudmFzLHdpZHRoKTsgICAgXG4gIH0sXG4gIGRyYXdCaXRBcnJheTpmdW5jdGlvbih0ZXh0LyosZXJyb3JDb3JyZWN0TGV2ZWwsb3B0aW9ucyxjYiovKSB7XG5cbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICBjYiA9IGFyZ3MucG9wKCksXG4gICAgICB0ZXh0ID0gYXJncy5zaGlmdCgpLFxuICAgICAgZXJyb3JDb3JyZWN0TGV2ZWwgPSBhcmdzLnNoaWZ0KCksXG4gICAgICBvcHRpb25zID0gYXJncy5zaGlmdCgpIHx8IHt9O1xuXG4gICAgLy9hcmd1bWVudCBwcm9jZXNzaW5nXG4gICAgaWYodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vZW5mb3JjZSBjYWxsYmFjayBhcGkganVzdCBpbiBjYXNlIHRoZSBwcm9jZXNzaW5nIGNhbiBiZSBtYWRlIGFzeW5jIGluIHRoZSBmdXR1cmVcbiAgICAgIC8vIG9yIHN1cHBvcnQgcHJvYyBvcGVuIHRvIGxpYnFyZW5jb2RlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbGxiYWNrIHJlcXVpcmVkIGFzIGxhc3QgYXJndW1lbnQnKTtcbiAgICB9XG4gICAgXG4gICAgY2IgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aC0xXTsgXG4gICAgXG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA+IDIpe1xuICAgICAgZXJyb3JDb3JyZWN0TGV2ZWwgPSBhcmd1bWVudHNbMl07XG4gICAgfVxuXG5cbiAgICAvL3RoaXMgaW50ZXJmYWNlIGtpbmRhIHN1Y2tzIC0gdGhlcmUgaXMgdmVyeSBzbWFsbCBsaWtlbHlob29kIG9mIHRoaXMgZXZlciBiZWluZyBhc3luY1xuICAgIHRoaXMuUVJWZXJzaW9uKHRleHQsZXJyb3JDb3JyZWN0TGV2ZWwsKG9wdGlvbnN8fHt9KS52ZXJzaW9uLGZ1bmN0aW9uKGUsdCxsLGVjKXtcbiAgICAgIHRleHQgPSB0LGxldmVsID0gbCxlcnJvciA9IGUsZXJyb3JDb3JyZWN0TGV2ZWwgPSBlYztcbiAgICB9KTtcblxuXG4gICAgaWYoIWxldmVsKSB7XG4gICAgICAvL2lmIHdlIGFyZSB1bmFibGUgdG8gZmluZCBhbiBhcHByb3ByaWF0ZSBxciBsZXZlbCBlcnJvciBvdXRcbiAgICAgIGNiKGVycm9yLFtdLDApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vY3JlYXRlIHFyY29kZSFcbiAgICB0cnl7XG5cbiAgICAgIHZhciBxciA9IG5ldyBRUkNvZGVMaWIuUVJDb2RlKGxldmVsLCBlcnJvckNvcnJlY3RMZXZlbClcbiAgICAgICwgc2NhbGUgPSB0aGlzLnNjYWxlfHw0XG4gICAgICAsIHdpZHRoID0gMCxiaXRzLGJpdGM9MCxjdXJyZW50eT0wO1xuICAgICAgXG4gICAgICBxci5hZGREYXRhKHRleHQpO1xuICAgICAgcXIubWFrZSgpO1xuICAgICAgXG4gICAgICB3aWR0aCA9IHRoaXMuZGF0YVdpZHRoKHFyLDEpO1xuICAgICAgYml0cyA9IG5ldyB0aGlzLkFycmF5KHdpZHRoKndpZHRoKTtcblxuICAgICAgXG4gICAgICBmb3IgKHZhciByID0gMCxybD1xci5nZXRNb2R1bGVDb3VudCgpOyByIDwgcmw7IHIrKykge1xuICAgICAgICBmb3IgKHZhciBjID0gMCxjbD1xci5nZXRNb2R1bGVDb3VudCgpOyBjIDwgY2w7IGMrKykge1xuICAgICAgICAgIGlmIChxci5pc0RhcmsociwgYykgKSB7XG4gICAgICAgICAgICBiaXRzW2JpdGNdID0gMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYml0c1tiaXRjXSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJpdGMrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVycm9yID0gZTtcbiAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgIH1cbiAgICBcbiAgICBjYihlcnJvcixiaXRzLHdpZHRoKTtcbiAgfSxcbiAgUVJWZXJzaW9uOmZ1bmN0aW9uKHRleHQsZXJyb3JDb3JyZWN0TGV2ZWwsdmVyc2lvbixjYil7XG4gICAgdmFyIGMgPSBib3BzLmZyb20odGV4dCkubGVuZ3RoLC8vIEJJTkFSWSBMRU5HVEghXG4gICAgICAgIGVycm9yLFxuICAgICAgICBlcnJvckNvcnJlY3RMZXZlbCA9IHRoaXMuUVJFcnJvckNvcnJlY3RMZXZlbFtlcnJvckNvcnJlY3RMZXZlbF18fHRoaXMuZGVmYXVsdEVycm9yQ29ycmVjdExldmVsLFxuICAgICAgICBlcnJvckNvcnJlY3RJbmRleCA9IFsxLDAsMywyXSwvL2ZpeCBvZGQgbWFwcGluZyB0byBvcmRlciBpbiB0YWJsZVxuICAgICAgICBrZXlzID0gWydMJywnTScsJ1EnLCdIJ10sXG4gICAgICAgIGNhcGFjaXR5ID0gMCxcbiAgICAgICAgdmVyc2lvblNwZWNpZmllZCA9IGZhbHNlO1xuICAgICAgICBcbiAgICBpZih0eXBlb2YgdmVyc2lvbiAhPT0gXCJ1bmRlZmluZWRcIiAmJiB2ZXJzaW9uICE9PSBudWxsKSB7XG4gICAgICB2ZXJzaW9uU3BlY2lmaWVkID0gdHJ1ZTtcbiAgICB9XG4gICAgLy9UT0RPIEFERCBUSFJPVyBGT1IgSU5WQUxJRCBlcnJvckNvcnJlY3RMZXZlbC4uLj9cbiAgICBcbiAgICBpZih2ZXJzaW9uU3BlY2lmaWVkKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ1NQRUNJRklFRCBWRVJTSU9OISAnLHZlcnNpb24pO1xuICAgICAgLy9pIGhhdmUgc3BlY2lmaWVkIGEgdmVyc2lvbi4gdGhpcyB3aWxsIGdpdmUgbWUgYSBmaXhlZCBzaXplIHFyIGNvZGUuIHZlcnNpb24gbXVzdCBiZSB2YWxpZC4gMS00MFxuICAgICAgY2FwYWNpdHkgPSBRUlZlcnNpb25DYXBhY2l0eVRhYmxlW3ZlcnNpb25dW2Vycm9yQ29ycmVjdEluZGV4W2Vycm9yQ29ycmVjdExldmVsXV07XG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgLy9maWd1cmUgb3V0IHdoYXQgdmVyc2lvbiBjYW4gaG9sZCB0aGUgYW1vdW50IG9mIHRleHRcbiAgICAgIGZvcih2YXIgaT0wLGo9UVJWZXJzaW9uQ2FwYWNpdHlUYWJsZS5sZW5ndGg7aTxqO2krKykge1xuICAgICAgICBjYXBhY2l0eSA9IFFSVmVyc2lvbkNhcGFjaXR5VGFibGVbaV1bZXJyb3JDb3JyZWN0SW5kZXhbZXJyb3JDb3JyZWN0TGV2ZWxdXTtcbiAgICAgICAgaWYoYyA8IFFSVmVyc2lvbkNhcGFjaXR5VGFibGVbaV1bZXJyb3JDb3JyZWN0SW5kZXhbZXJyb3JDb3JyZWN0TGV2ZWxdXSl7XG4gICAgICAgICAgdmVyc2lvbiA9IGkrMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9pZiBub3QgdmVyc2lvbiBzZXQgdG8gbWF4XG4gICAgICBpZighdmVyc2lvbikge1xuICAgICAgICB2ZXJzaW9uID0gUVJWZXJzaW9uQ2FwYWNpdHlUYWJsZS5sZW5ndGgtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoY2FwYWNpdHkgPCBjKXtcbiAgICAgIGlmKHRoaXMuZXJyb3JCZWhhdmlvci5sZW5ndGggPT0gJ3RyaW0nKXtcbiAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyKDAsY2FwYWNpdHkpO1xuICAgICAgICBsZXZlbCA9IFFSVmVyc2lvbkNhcGFjaXR5VGFibGUubGVuZ3RoOyBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKCdpbnB1dCBzdHJpbmcgdG9vIGxvbmcgZm9yIGVycm9yIGNvcnJlY3Rpb24gJ1xuICAgICAgICAgICtrZXlzW2Vycm9yQ29ycmVjdEluZGV4W2Vycm9yQ29ycmVjdExldmVsXV1cbiAgICAgICAgICArJyBtYXggbGVuZ3RoICdcbiAgICAgICAgICArIGNhcGFjaXR5XG4gICAgICAgICAgKycgZm9yIHFyY29kZSB2ZXJzaW9uICcrdmVyc2lvblxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgXG4gICAgaWYoY2IpIHtcbiAgICAgIGNiKGVycm9yLHRleHQsdmVyc2lvbixlcnJvckNvcnJlY3RMZXZlbCk7XG4gICAgfVxuICAgIHJldHVybiB2ZXJzaW9uO1xuICB9LFxuICBtYXJnaW5XaWR0aDpmdW5jdGlvbigpe1xuICAgIHZhciBtYXJnaW4gPSB0aGlzLm1hcmdpbjtcbiAgICB0aGlzLnNjYWxlID0gdGhpcy5zY2FsZXx8NDtcbiAgICAvL2VsZWdhbnQgd2hpdGUgc3BhY2UgbmV4dCB0byBjb2RlIGlzIHJlcXVpcmVkIGJ5IHNwZWNcbiAgICBpZiAoKHRoaXMuc2NhbGUgKiB0aGlzLm1hcmdpblNjYWxlRmFjdG9yID4gbWFyZ2luKSAmJiBtYXJnaW4gPiAwKXtcbiAgICAgIG1hcmdpbiA9IHRoaXMuc2NhbGUgKiB0aGlzLm1hcmdpblNjYWxlRmFjdG9yO1xuICAgIH1cbiAgICByZXR1cm4gbWFyZ2luO1xuICB9LFxuICBkYXRhV2lkdGg6ZnVuY3Rpb24ocXIsc2NhbGUpe1xuICAgIHJldHVybiBxci5nZXRNb2R1bGVDb3VudCgpKihzY2FsZXx8dGhpcy5zY2FsZXx8NCk7XG4gIH0sXG4gIHJlc2V0Q2FudmFzOmZ1bmN0aW9uKGNhbnZhcyxjdHgsd2lkdGgpe1xuICAgIGN0eC5jbGVhclJlY3QoMCwwLGNhbnZhcy53aWR0aCxjYW52YXMuaGVpZ2h0KTtcbiAgICBpZighY2FudmFzLnN0eWxlKSBjYW52YXMuc3R5bGUgPSB7fTtcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gY2FudmFzLmhlaWdodCA9IHdpZHRoOy8vc3F1YXJlIVxuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgIFxuICAgIGlmKHRoaXMuY29sb3IubGlnaHQpe1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3IubGlnaHQ7IFxuICAgICAgY3R4LmZpbGxSZWN0KDAsMCxjYW52YXMud2lkdGgsY2FudmFzLmhlaWdodCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vc3VwcG9ydCB0cmFuc3BhcmVudCBiYWNrZ3JvdW5kcz9cbiAgICAgIC8vbm90IGV4YWN0bHkgdG8gc3BlYyBidXQgaSByZWFsbHkgd291bGQgbGlrZSBzb21lb25lIHRvIGJlIGFibGUgdG8gYWRkIGEgYmFja2dyb3VuZCB3aXRoIGhlYXZpbHkgcmVkdWNlZCBsdW1pbm9zaXR5IGZvciBzaW1wbGUgYnJhbmRpbmdcbiAgICAgIC8vaSBjb3VsZCBqdXN0IGRpdGNoIHRoaXMgYmVjYXVzZSB5b3UgY291bGQgYWxzbyBqdXN0IHNldCAjKioqKioqMDAgYXMgdGhlIGNvbG9yID1QXG4gICAgICBjdHguY2xlYXJSZWN0KDAsMCxjYW52YXMud2lkdGgsY2FudmFzLmhlaWdodCk7XG4gICAgfVxuICB9XG59O1xuXG4iLCJ2YXIgYm9wcyA9IHJlcXVpcmUoJ2JvcHMnKTtcblxuLyoqXG4gKiBRUkNvZGUgZm9yIEphdmFTY3JpcHRcbiAqXG4gKiBtb2RpZmllZCBieSBSeWFuIERheSBmb3Igbm9kZWpzIHN1cHBvcnRcbiAqIENvcHlyaWdodCAoYykgMjAxMSBSeWFuIERheVxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBFWFBPUlRTOlxuICpcdHtcbiAqXHRRUkNvZGU6UVJDb2RlXG4gKlx0UVJFcnJvckNvcnJlY3RMZXZlbDpRUkVycm9yQ29ycmVjdExldmVsXG4gKlx0fVxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSQ29kZSBmb3IgSmF2YVNjcmlwdFxuLy9cbi8vIENvcHlyaWdodCAoYykgMjAwOSBLYXp1aGlrbyBBcmFzZVxuLy9cbi8vIFVSTDogaHR0cDovL3d3dy5kLXByb2plY3QuY29tL1xuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbi8vICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbi8vXG4vLyBUaGUgd29yZCBcIlFSIENvZGVcIiBpcyByZWdpc3RlcmVkIHRyYWRlbWFyayBvZiBcbi8vIERFTlNPIFdBVkUgSU5DT1JQT1JBVEVEXG4vLyAgIGh0dHA6Ly93d3cuZGVuc28td2F2ZS5jb20vcXJjb2RlL2ZhcXBhdGVudC1lLmh0bWxcbi8vXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuKi9cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSQ29kZVxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0cy5RUkNvZGUgPSBRUkNvZGU7XG5cbnZhciBRUkRhdGFBcnJheSA9ICh0eXBlb2YgVWludDMyQXJyYXkgPT0gJ3VuZGVmaW5lZCc/VWludDMyQXJyYXk6QXJyYXkpO1xuXG5mdW5jdGlvbiBRUkNvZGUodHlwZU51bWJlciwgZXJyb3JDb3JyZWN0TGV2ZWwpIHtcblx0dGhpcy50eXBlTnVtYmVyID0gdHlwZU51bWJlcjtcblx0dGhpcy5lcnJvckNvcnJlY3RMZXZlbCA9IGVycm9yQ29ycmVjdExldmVsO1xuXHR0aGlzLm1vZHVsZXMgPSBudWxsO1xuXHR0aGlzLm1vZHVsZUNvdW50ID0gMDtcblx0dGhpcy5kYXRhQ2FjaGUgPSBudWxsO1xuXHR0aGlzLmRhdGFMaXN0ID0gbmV3IFFSRGF0YUFycmF5KCk7XG59XG5cblFSQ29kZS5wcm90b3R5cGUgPSB7XG5cdFxuXHRhZGREYXRhIDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdHZhciBuZXdEYXRhID0gbmV3IFFSOGJpdEJ5dGUoZGF0YSk7XG5cblx0XHR0aGlzLmRhdGFMaXN0LnB1c2gobmV3RGF0YSk7XG5cdFx0dGhpcy5kYXRhQ2FjaGUgPSBudWxsO1xuXHR9LFxuXHRcblx0aXNEYXJrIDogZnVuY3Rpb24ocm93LCBjb2wpIHtcblx0XHRpZiAocm93IDwgMCB8fCB0aGlzLm1vZHVsZUNvdW50IDw9IHJvdyB8fCBjb2wgPCAwIHx8IHRoaXMubW9kdWxlQ291bnQgPD0gY29sKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3Iocm93ICsgXCIsXCIgKyBjb2wpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5tb2R1bGVzW3Jvd11bY29sXTtcblx0fSxcblxuXHRnZXRNb2R1bGVDb3VudCA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm1vZHVsZUNvdW50O1xuXHR9LFxuXHRcblx0bWFrZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubWFrZUltcGwoZmFsc2UsIHRoaXMuZ2V0QmVzdE1hc2tQYXR0ZXJuKCkgKTtcblx0fSxcblx0XG5cdG1ha2VJbXBsIDogZnVuY3Rpb24odGVzdCwgbWFza1BhdHRlcm4pIHtcblx0XHRcblx0XHR0aGlzLm1vZHVsZUNvdW50ID0gdGhpcy50eXBlTnVtYmVyICogNCArIDE3O1xuXHRcdHRoaXMubW9kdWxlcyA9IG5ldyBRUkRhdGFBcnJheSh0aGlzLm1vZHVsZUNvdW50KTtcblx0XHRcblx0XHRmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLm1vZHVsZUNvdW50OyByb3crKykge1xuXHRcdFx0XG5cdFx0XHR0aGlzLm1vZHVsZXNbcm93XSA9IG5ldyBRUkRhdGFBcnJheSh0aGlzLm1vZHVsZUNvdW50KTtcblx0XHRcdFxuXHRcdFx0Zm9yICh2YXIgY29sID0gMDsgY29sIDwgdGhpcy5tb2R1bGVDb3VudDsgY29sKyspIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzW3Jvd11bY29sXSA9IG51bGw7Ly8oY29sICsgcm93KSAlIDM7XG5cdFx0XHR9XG5cdFx0fVxuXHRcblx0XHR0aGlzLnNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4oMCwgMCk7XG5cdFx0dGhpcy5zZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKHRoaXMubW9kdWxlQ291bnQgLSA3LCAwKTtcblx0XHR0aGlzLnNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4oMCwgdGhpcy5tb2R1bGVDb3VudCAtIDcpO1xuXHRcdHRoaXMuc2V0dXBQb3NpdGlvbkFkanVzdFBhdHRlcm4oKTtcblx0XHR0aGlzLnNldHVwVGltaW5nUGF0dGVybigpO1xuXHRcdHRoaXMuc2V0dXBUeXBlSW5mbyh0ZXN0LCBtYXNrUGF0dGVybik7XG5cdFx0XG5cdFx0aWYgKHRoaXMudHlwZU51bWJlciA+PSA3KSB7XG5cdFx0XHR0aGlzLnNldHVwVHlwZU51bWJlcih0ZXN0KTtcblx0XHR9XG5cdFxuXHRcdGlmICh0aGlzLmRhdGFDYWNoZSA9PSBudWxsKSB7XG5cdFx0XHR0aGlzLmRhdGFDYWNoZSA9IFFSQ29kZS5jcmVhdGVEYXRhKHRoaXMudHlwZU51bWJlciwgdGhpcy5lcnJvckNvcnJlY3RMZXZlbCwgdGhpcy5kYXRhTGlzdCk7XG5cdFx0fVxuXHRcblx0XHR0aGlzLm1hcERhdGEodGhpcy5kYXRhQ2FjaGUsIG1hc2tQYXR0ZXJuKTtcblx0fSxcblxuXHRzZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuIDogZnVuY3Rpb24ocm93LCBjb2wpICB7XG5cdFx0XG5cdFx0Zm9yICh2YXIgciA9IC0xOyByIDw9IDc7IHIrKykge1xuXHRcdFx0XG5cdFx0XHRpZiAocm93ICsgciA8PSAtMSB8fCB0aGlzLm1vZHVsZUNvdW50IDw9IHJvdyArIHIpIGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRmb3IgKHZhciBjID0gLTE7IGMgPD0gNzsgYysrKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoY29sICsgYyA8PSAtMSB8fCB0aGlzLm1vZHVsZUNvdW50IDw9IGNvbCArIGMpIGNvbnRpbnVlO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCAoMCA8PSByICYmIHIgPD0gNiAmJiAoYyA9PSAwIHx8IGMgPT0gNikgKVxuXHRcdFx0XHRcdFx0fHwgKDAgPD0gYyAmJiBjIDw9IDYgJiYgKHIgPT0gMCB8fCByID09IDYpIClcblx0XHRcdFx0XHRcdHx8ICgyIDw9IHIgJiYgciA8PSA0ICYmIDIgPD0gYyAmJiBjIDw9IDQpICkge1xuXHRcdFx0XHRcdHRoaXMubW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IHRydWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cdFx0XG5cdFx0fVx0XHRcblx0fSxcblx0XG5cdGdldEJlc3RNYXNrUGF0dGVybiA6IGZ1bmN0aW9uKCkge1xuXHRcblx0XHR2YXIgbWluTG9zdFBvaW50ID0gMDtcblx0XHR2YXIgcGF0dGVybiA9IDA7XG5cdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG5cdFx0XHRcblx0XHRcdHRoaXMubWFrZUltcGwodHJ1ZSwgaSk7XG5cdFxuXHRcdFx0dmFyIGxvc3RQb2ludCA9IFFSVXRpbC5nZXRMb3N0UG9pbnQodGhpcyk7XG5cdFxuXHRcdFx0aWYgKGkgPT0gMCB8fCBtaW5Mb3N0UG9pbnQgPiAgbG9zdFBvaW50KSB7XG5cdFx0XHRcdG1pbkxvc3RQb2ludCA9IGxvc3RQb2ludDtcblx0XHRcdFx0cGF0dGVybiA9IGk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcblx0XHRyZXR1cm4gcGF0dGVybjtcblx0fSxcblxuXHRzZXR1cFRpbWluZ1BhdHRlcm4gOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHRmb3IgKHZhciByID0gODsgciA8IHRoaXMubW9kdWxlQ291bnQgLSA4OyByKyspIHtcblx0XHRcdGlmICh0aGlzLm1vZHVsZXNbcl1bNl0gIT0gbnVsbCkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdHRoaXMubW9kdWxlc1tyXVs2XSA9IChyICUgMiA9PSAwKTtcblx0XHR9XG5cdFxuXHRcdGZvciAodmFyIGMgPSA4OyBjIDwgdGhpcy5tb2R1bGVDb3VudCAtIDg7IGMrKykge1xuXHRcdFx0aWYgKHRoaXMubW9kdWxlc1s2XVtjXSAhPSBudWxsKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5tb2R1bGVzWzZdW2NdID0gKGMgJSAyID09IDApO1xuXHRcdH1cblx0fSxcblx0XG5cdHNldHVwUG9zaXRpb25BZGp1c3RQYXR0ZXJuIDogZnVuY3Rpb24oKSB7XG5cdFxuXHRcdHZhciBwb3MgPSBRUlV0aWwuZ2V0UGF0dGVyblBvc2l0aW9uKHRoaXMudHlwZU51bWJlcik7XG5cdFx0cG9zID0gcG9zIHx8ICcnO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcG9zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHBvcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XG5cdFx0XHRcdHZhciByb3cgPSBwb3NbaV07XG5cdFx0XHRcdHZhciBjb2wgPSBwb3Nbal07XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAodGhpcy5tb2R1bGVzW3Jvd11bY29sXSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdGZvciAodmFyIHIgPSAtMjsgciA8PSAyOyByKyspIHtcblx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yICh2YXIgYyA9IC0yOyBjIDw9IDI7IGMrKykge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0aWYgKHIgPT0gLTIgfHwgciA9PSAyIHx8IGMgPT0gLTIgfHwgYyA9PSAyIFxuXHRcdFx0XHRcdFx0XHRcdHx8IChyID09IDAgJiYgYyA9PSAwKSApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XG5cdHNldHVwVHlwZU51bWJlciA6IGZ1bmN0aW9uKHRlc3QpIHtcblx0XG5cdFx0dmFyIGJpdHMgPSBRUlV0aWwuZ2V0QkNIVHlwZU51bWJlcih0aGlzLnR5cGVOdW1iZXIpO1xuXHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDE4OyBpKyspIHtcblx0XHRcdHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuXHRcdFx0dGhpcy5tb2R1bGVzW01hdGguZmxvb3IoaSAvIDMpXVtpICUgMyArIHRoaXMubW9kdWxlQ291bnQgLSA4IC0gM10gPSBtb2Q7XG5cdFx0fVxuXHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDE4OyBpKyspIHtcblx0XHRcdHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuXHRcdFx0dGhpcy5tb2R1bGVzW2kgJSAzICsgdGhpcy5tb2R1bGVDb3VudCAtIDggLSAzXVtNYXRoLmZsb29yKGkgLyAzKV0gPSBtb2Q7XG5cdFx0fVxuXHR9LFxuXHRcblx0c2V0dXBUeXBlSW5mbyA6IGZ1bmN0aW9uKHRlc3QsIG1hc2tQYXR0ZXJuKSB7XG5cdFxuXHRcdHZhciBkYXRhID0gKHRoaXMuZXJyb3JDb3JyZWN0TGV2ZWwgPDwgMykgfCBtYXNrUGF0dGVybjtcblx0XHR2YXIgYml0cyA9IFFSVXRpbC5nZXRCQ0hUeXBlSW5mbyhkYXRhKTtcblx0XG5cdFx0Ly8gdmVydGljYWxcdFx0XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG5cdFxuXHRcdFx0dmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG5cdFxuXHRcdFx0aWYgKGkgPCA2KSB7XG5cdFx0XHRcdHRoaXMubW9kdWxlc1tpXVs4XSA9IG1vZDtcblx0XHRcdH0gZWxzZSBpZiAoaSA8IDgpIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzW2kgKyAxXVs4XSA9IG1vZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9kdWxlc1t0aGlzLm1vZHVsZUNvdW50IC0gMTUgKyBpXVs4XSA9IG1vZDtcblx0XHRcdH1cblx0XHR9XG5cdFxuXHRcdC8vIGhvcml6b250YWxcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDE1OyBpKyspIHtcblx0XG5cdFx0XHR2YXIgbW9kID0gKCF0ZXN0ICYmICggKGJpdHMgPj4gaSkgJiAxKSA9PSAxKTtcblx0XHRcdFxuXHRcdFx0aWYgKGkgPCA4KSB7XG5cdFx0XHRcdHRoaXMubW9kdWxlc1s4XVt0aGlzLm1vZHVsZUNvdW50IC0gaSAtIDFdID0gbW9kO1xuXHRcdFx0fSBlbHNlIGlmIChpIDwgOSkge1xuXHRcdFx0XHR0aGlzLm1vZHVsZXNbOF1bMTUgLSBpIC0gMSArIDFdID0gbW9kO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb2R1bGVzWzhdWzE1IC0gaSAtIDFdID0gbW9kO1xuXHRcdFx0fVxuXHRcdH1cblx0XG5cdFx0Ly8gZml4ZWQgbW9kdWxlXG5cdFx0dGhpcy5tb2R1bGVzW3RoaXMubW9kdWxlQ291bnQgLSA4XVs4XSA9ICghdGVzdCk7XG5cdFxuXHR9LFxuXHRcblx0bWFwRGF0YSA6IGZ1bmN0aW9uKGRhdGEsIG1hc2tQYXR0ZXJuKSB7XG5cdFx0XG5cdFx0dmFyIGluYyA9IC0xO1xuXHRcdHZhciByb3cgPSB0aGlzLm1vZHVsZUNvdW50IC0gMTtcblx0XHR2YXIgYml0SW5kZXggPSA3O1xuXHRcdHZhciBieXRlSW5kZXggPSAwO1xuXHRcdFxuXHRcdGZvciAodmFyIGNvbCA9IHRoaXMubW9kdWxlQ291bnQgLSAxOyBjb2wgPiAwOyBjb2wgLT0gMikge1xuXHRcblx0XHRcdGlmIChjb2wgPT0gNikgY29sLS07XG5cdFxuXHRcdFx0d2hpbGUgKHRydWUpIHtcblx0XG5cdFx0XHRcdGZvciAodmFyIGMgPSAwOyBjIDwgMjsgYysrKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKHRoaXMubW9kdWxlc1tyb3ddW2NvbCAtIGNdID09IG51bGwpIHtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0dmFyIGRhcmsgPSBmYWxzZTtcblx0XG5cdFx0XHRcdFx0XHRpZiAoYnl0ZUluZGV4IDwgZGF0YS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0ZGFyayA9ICggKCAoZGF0YVtieXRlSW5kZXhdID4+PiBiaXRJbmRleCkgJiAxKSA9PSAxKTtcblx0XHRcdFx0XHRcdH1cblx0XG5cdFx0XHRcdFx0XHR2YXIgbWFzayA9IFFSVXRpbC5nZXRNYXNrKG1hc2tQYXR0ZXJuLCByb3csIGNvbCAtIGMpO1xuXHRcblx0XHRcdFx0XHRcdGlmIChtYXNrKSB7XG5cdFx0XHRcdFx0XHRcdGRhcmsgPSAhZGFyaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0dGhpcy5tb2R1bGVzW3Jvd11bY29sIC0gY10gPSBkYXJrO1xuXHRcdFx0XHRcdFx0Yml0SW5kZXgtLTtcblx0XG5cdFx0XHRcdFx0XHRpZiAoYml0SW5kZXggPT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0Ynl0ZUluZGV4Kys7XG5cdFx0XHRcdFx0XHRcdGJpdEluZGV4ID0gNztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0cm93ICs9IGluYztcblx0XG5cdFx0XHRcdGlmIChyb3cgPCAwIHx8IHRoaXMubW9kdWxlQ291bnQgPD0gcm93KSB7XG5cdFx0XHRcdFx0cm93IC09IGluYztcblx0XHRcdFx0XHRpbmMgPSAtaW5jO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHR9XG5cbn07XG5cblFSQ29kZS5QQUQwID0gMHhFQztcblFSQ29kZS5QQUQxID0gMHgxMTtcblxuUVJDb2RlLmNyZWF0ZURhdGEgPSBmdW5jdGlvbih0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3RMZXZlbCwgZGF0YUxpc3QpIHtcblx0XG5cdHZhciByc0Jsb2NrcyA9IFFSUlNCbG9jay5nZXRSU0Jsb2Nrcyh0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3RMZXZlbCk7XG5cdFxuXHR2YXIgYnVmZmVyID0gbmV3IFFSQml0QnVmZmVyKCk7XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGRhdGEgPSBkYXRhTGlzdFtpXTtcblx0XHRidWZmZXIucHV0KGRhdGEubW9kZSwgNCk7XG5cdFx0YnVmZmVyLnB1dChkYXRhLmdldExlbmd0aCgpLCBRUlV0aWwuZ2V0TGVuZ3RoSW5CaXRzKGRhdGEubW9kZSwgdHlwZU51bWJlcikgKTtcblx0XHRkYXRhLndyaXRlKGJ1ZmZlcik7XG5cdH1cblxuXHQvLyBjYWxjIG51bSBtYXggZGF0YS5cblx0dmFyIHRvdGFsRGF0YUNvdW50ID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCByc0Jsb2Nrcy5sZW5ndGg7IGkrKykge1xuXHRcdHRvdGFsRGF0YUNvdW50ICs9IHJzQmxvY2tzW2ldLmRhdGFDb3VudDtcblx0fVxuXG5cdGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPiB0b3RhbERhdGFDb3VudCAqIDgpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJjb2RlIGxlbmd0aCBvdmVyZmxvdy4gKFwiXG5cdFx0XHQrIGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKVxuXHRcdFx0KyBcIj5cIlxuXHRcdFx0KyAgdG90YWxEYXRhQ291bnQgKiA4XG5cdFx0XHQrIFwiKVwiKTtcblx0fVxuXG5cdC8vIGVuZCBjb2RlXG5cdGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgKyA0IDw9IHRvdGFsRGF0YUNvdW50ICogOCkge1xuXHRcdGJ1ZmZlci5wdXQoMCwgNCk7XG5cdH1cblxuXHQvLyBwYWRkaW5nXG5cdHdoaWxlIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgJSA4ICE9IDApIHtcblx0XHRidWZmZXIucHV0Qml0KGZhbHNlKTtcblx0fVxuXG5cdC8vIHBhZGRpbmdcblx0d2hpbGUgKHRydWUpIHtcblx0XHRcblx0XHRpZiAoYnVmZmVyLmdldExlbmd0aEluQml0cygpID49IHRvdGFsRGF0YUNvdW50ICogOCkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGJ1ZmZlci5wdXQoUVJDb2RlLlBBRDAsIDgpO1xuXHRcdFxuXHRcdGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPj0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdFx0YnVmZmVyLnB1dChRUkNvZGUuUEFEMSwgOCk7XG5cdH1cblxuXHRyZXR1cm4gUVJDb2RlLmNyZWF0ZUJ5dGVzKGJ1ZmZlciwgcnNCbG9ja3MpO1xufTtcblxuUVJDb2RlLmNyZWF0ZUJ5dGVzID0gZnVuY3Rpb24oYnVmZmVyLCByc0Jsb2Nrcykge1xuXG5cdHZhciBvZmZzZXQgPSAwO1xuXHRcblx0dmFyIG1heERjQ291bnQgPSAwO1xuXHR2YXIgbWF4RWNDb3VudCA9IDA7XG5cdFxuXHR2YXIgZGNkYXRhID0gbmV3IFFSRGF0YUFycmF5KHJzQmxvY2tzLmxlbmd0aCk7XG5cdHZhciBlY2RhdGEgPSBuZXcgUVJEYXRhQXJyYXkocnNCbG9ja3MubGVuZ3RoKTtcblx0XG5cdGZvciAodmFyIHIgPSAwOyByIDwgcnNCbG9ja3MubGVuZ3RoOyByKyspIHtcblxuXHRcdHZhciBkY0NvdW50ID0gcnNCbG9ja3Nbcl0uZGF0YUNvdW50O1xuXHRcdHZhciBlY0NvdW50ID0gcnNCbG9ja3Nbcl0udG90YWxDb3VudCAtIGRjQ291bnQ7XG5cblx0XHRtYXhEY0NvdW50ID0gTWF0aC5tYXgobWF4RGNDb3VudCwgZGNDb3VudCk7XG5cdFx0bWF4RWNDb3VudCA9IE1hdGgubWF4KG1heEVjQ291bnQsIGVjQ291bnQpO1xuXHRcdFxuXHRcdGRjZGF0YVtyXSA9IG5ldyBRUkRhdGFBcnJheShkY0NvdW50KTtcblx0XHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRjZGF0YVtyXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZGNkYXRhW3JdW2ldID0gMHhmZiAmIGJ1ZmZlci5idWZmZXJbaSArIG9mZnNldF07XG5cdFx0fVxuXHRcdG9mZnNldCArPSBkY0NvdW50O1xuXHRcdFxuXHRcdHZhciByc1BvbHkgPSBRUlV0aWwuZ2V0RXJyb3JDb3JyZWN0UG9seW5vbWlhbChlY0NvdW50KTtcblx0XHR2YXIgcmF3UG9seSA9IG5ldyBRUlBvbHlub21pYWwoZGNkYXRhW3JdLCByc1BvbHkuZ2V0TGVuZ3RoKCkgLSAxKTtcblxuXHRcdHZhciBtb2RQb2x5ID0gcmF3UG9seS5tb2QocnNQb2x5KTtcblx0XHRlY2RhdGFbcl0gPSBuZXcgUVJEYXRhQXJyYXkocnNQb2x5LmdldExlbmd0aCgpIC0gMSk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlY2RhdGFbcl0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBtb2RJbmRleCA9IGkgKyBtb2RQb2x5LmdldExlbmd0aCgpIC0gZWNkYXRhW3JdLmxlbmd0aDtcblx0XHRcdGVjZGF0YVtyXVtpXSA9IChtb2RJbmRleCA+PSAwKT8gbW9kUG9seS5nZXQobW9kSW5kZXgpIDogMDtcblx0XHR9XG5cblx0fVxuXHRcblx0dmFyIHRvdGFsQ29kZUNvdW50ID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCByc0Jsb2Nrcy5sZW5ndGg7IGkrKykge1xuXHRcdHRvdGFsQ29kZUNvdW50ICs9IHJzQmxvY2tzW2ldLnRvdGFsQ291bnQ7XG5cdH1cblxuXHR2YXIgZGF0YSA9IG5ldyBRUkRhdGFBcnJheSh0b3RhbENvZGVDb3VudCk7XG5cdHZhciBpbmRleCA9IDA7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXhEY0NvdW50OyBpKyspIHtcblx0XHRmb3IgKHZhciByID0gMDsgciA8IHJzQmxvY2tzLmxlbmd0aDsgcisrKSB7XG5cdFx0XHRpZiAoaSA8IGRjZGF0YVtyXS5sZW5ndGgpIHtcblx0XHRcdFx0ZGF0YVtpbmRleCsrXSA9IGRjZGF0YVtyXVtpXTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IG1heEVjQ291bnQ7IGkrKykge1xuXHRcdGZvciAodmFyIHIgPSAwOyByIDwgcnNCbG9ja3MubGVuZ3RoOyByKyspIHtcblx0XHRcdGlmIChpIDwgZWNkYXRhW3JdLmxlbmd0aCkge1xuXHRcdFx0XHRkYXRhW2luZGV4KytdID0gZWNkYXRhW3JdW2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBkYXRhO1xuXG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVI4Yml0Qnl0ZVxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIFFSOGJpdEJ5dGUoZGF0YSkge1xuICB0aGlzLm1vZGUgPSBRUk1vZGUuTU9ERV84QklUX0JZVEU7XG4gIHRoaXMuZGF0YSA9IGRhdGE7XG4gIHZhciBieXRlQXJyYXkgPSBbXTtcbiAgXG4gIHRoaXMucGFyc2VkRGF0YSA9IGJvcHMuZnJvbShkYXRhKTtcbn1cblxuUVI4Yml0Qnl0ZS5wcm90b3R5cGUgPSB7XG4gIGdldExlbmd0aDogZnVuY3Rpb24gKGJ1ZmZlcikge1xuICAgIHJldHVybiB0aGlzLnBhcnNlZERhdGEubGVuZ3RoO1xuICB9LFxuICB3cml0ZTogZnVuY3Rpb24gKGJ1ZmZlcikge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5wYXJzZWREYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgYnVmZmVyLnB1dCh0aGlzLnBhcnNlZERhdGFbaV0sIDgpO1xuICAgIH1cbiAgfVxufTtcblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJNb2RlXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgUVJNb2RlID0ge1xuXHRNT0RFX05VTUJFUiA6XHRcdDEgPDwgMCxcblx0TU9ERV9BTFBIQV9OVU0gOiBcdDEgPDwgMSxcblx0TU9ERV84QklUX0JZVEUgOiBcdDEgPDwgMixcblx0TU9ERV9LQU5KSSA6XHRcdDEgPDwgM1xufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSRXJyb3JDb3JyZWN0TGV2ZWxcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vL2V4cG9ydGVkXG5cbnZhciBRUkVycm9yQ29ycmVjdExldmVsID0gZXhwb3J0cy5RUkVycm9yQ29ycmVjdExldmVsID0ge1xuXHRMIDogMSxcblx0TSA6IDAsXG5cdFEgOiAzLFxuXHRIIDogMlxufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFFSTWFza1BhdHRlcm5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBRUk1hc2tQYXR0ZXJuID0gIHtcblx0UEFUVEVSTjAwMCA6IDAsXG5cdFBBVFRFUk4wMDEgOiAxLFxuXHRQQVRURVJOMDEwIDogMixcblx0UEFUVEVSTjAxMSA6IDMsXG5cdFBBVFRFUk4xMDAgOiA0LFxuXHRQQVRURVJOMTAxIDogNSxcblx0UEFUVEVSTjExMCA6IDYsXG5cdFBBVFRFUk4xMTEgOiA3XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJVdGlsXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIFxudmFyIFFSVXRpbCA9IHtcblxuICAgIFBBVFRFUk5fUE9TSVRJT05fVEFCTEUgOiBbXG5cdCAgICBbXSxcblx0ICAgIFs2LCAxOF0sXG5cdCAgICBbNiwgMjJdLFxuXHQgICAgWzYsIDI2XSxcblx0ICAgIFs2LCAzMF0sXG5cdCAgICBbNiwgMzRdLFxuXHQgICAgWzYsIDIyLCAzOF0sXG5cdCAgICBbNiwgMjQsIDQyXSxcblx0ICAgIFs2LCAyNiwgNDZdLFxuXHQgICAgWzYsIDI4LCA1MF0sXG5cdCAgICBbNiwgMzAsIDU0XSxcdFx0XG5cdCAgICBbNiwgMzIsIDU4XSxcblx0ICAgIFs2LCAzNCwgNjJdLFxuXHQgICAgWzYsIDI2LCA0NiwgNjZdLFxuXHQgICAgWzYsIDI2LCA0OCwgNzBdLFxuXHQgICAgWzYsIDI2LCA1MCwgNzRdLFxuXHQgICAgWzYsIDMwLCA1NCwgNzhdLFxuXHQgICAgWzYsIDMwLCA1NiwgODJdLFxuXHQgICAgWzYsIDMwLCA1OCwgODZdLFxuXHQgICAgWzYsIDM0LCA2MiwgOTBdLFxuXHQgICAgWzYsIDI4LCA1MCwgNzIsIDk0XSxcblx0ICAgIFs2LCAyNiwgNTAsIDc0LCA5OF0sXG5cdCAgICBbNiwgMzAsIDU0LCA3OCwgMTAyXSxcblx0ICAgIFs2LCAyOCwgNTQsIDgwLCAxMDZdLFxuXHQgICAgWzYsIDMyLCA1OCwgODQsIDExMF0sXG5cdCAgICBbNiwgMzAsIDU4LCA4NiwgMTE0XSxcblx0ICAgIFs2LCAzNCwgNjIsIDkwLCAxMThdLFxuXHQgICAgWzYsIDI2LCA1MCwgNzQsIDk4LCAxMjJdLFxuXHQgICAgWzYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2XSxcblx0ICAgIFs2LCAyNiwgNTIsIDc4LCAxMDQsIDEzMF0sXG5cdCAgICBbNiwgMzAsIDU2LCA4MiwgMTA4LCAxMzRdLFxuXHQgICAgWzYsIDM0LCA2MCwgODYsIDExMiwgMTM4XSxcblx0ICAgIFs2LCAzMCwgNTgsIDg2LCAxMTQsIDE0Ml0sXG5cdCAgICBbNiwgMzQsIDYyLCA5MCwgMTE4LCAxNDZdLFxuXHQgICAgWzYsIDMwLCA1NCwgNzgsIDEwMiwgMTI2LCAxNTBdLFxuXHQgICAgWzYsIDI0LCA1MCwgNzYsIDEwMiwgMTI4LCAxNTRdLFxuXHQgICAgWzYsIDI4LCA1NCwgODAsIDEwNiwgMTMyLCAxNThdLFxuXHQgICAgWzYsIDMyLCA1OCwgODQsIDExMCwgMTM2LCAxNjJdLFxuXHQgICAgWzYsIDI2LCA1NCwgODIsIDExMCwgMTM4LCAxNjZdLFxuXHQgICAgWzYsIDMwLCA1OCwgODYsIDExNCwgMTQyLCAxNzBdXG4gICAgXSxcblxuICAgIEcxNSA6ICgxIDw8IDEwKSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCA0KSB8ICgxIDw8IDIpIHwgKDEgPDwgMSkgfCAoMSA8PCAwKSxcbiAgICBHMTggOiAoMSA8PCAxMikgfCAoMSA8PCAxMSkgfCAoMSA8PCAxMCkgfCAoMSA8PCA5KSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCAyKSB8ICgxIDw8IDApLFxuICAgIEcxNV9NQVNLIDogKDEgPDwgMTQpIHwgKDEgPDwgMTIpIHwgKDEgPDwgMTApXHR8ICgxIDw8IDQpIHwgKDEgPDwgMSksXG5cbiAgICBnZXRCQ0hUeXBlSW5mbyA6IGZ1bmN0aW9uKGRhdGEpIHtcblx0ICAgIHZhciBkID0gZGF0YSA8PCAxMDtcblx0ICAgIHdoaWxlIChRUlV0aWwuZ2V0QkNIRGlnaXQoZCkgLSBRUlV0aWwuZ2V0QkNIRGlnaXQoUVJVdGlsLkcxNSkgPj0gMCkge1xuXHRcdCAgICBkIF49IChRUlV0aWwuRzE1IDw8IChRUlV0aWwuZ2V0QkNIRGlnaXQoZCkgLSBRUlV0aWwuZ2V0QkNIRGlnaXQoUVJVdGlsLkcxNSkgKSApOyBcdFxuXHQgICAgfVxuXHQgICAgcmV0dXJuICggKGRhdGEgPDwgMTApIHwgZCkgXiBRUlV0aWwuRzE1X01BU0s7XG4gICAgfSxcblxuICAgIGdldEJDSFR5cGVOdW1iZXIgOiBmdW5jdGlvbihkYXRhKSB7XG5cdCAgICB2YXIgZCA9IGRhdGEgPDwgMTI7XG5cdCAgICB3aGlsZSAoUVJVdGlsLmdldEJDSERpZ2l0KGQpIC0gUVJVdGlsLmdldEJDSERpZ2l0KFFSVXRpbC5HMTgpID49IDApIHtcblx0XHQgICAgZCBePSAoUVJVdGlsLkcxOCA8PCAoUVJVdGlsLmdldEJDSERpZ2l0KGQpIC0gUVJVdGlsLmdldEJDSERpZ2l0KFFSVXRpbC5HMTgpICkgKTsgXHRcblx0ICAgIH1cblx0ICAgIHJldHVybiAoZGF0YSA8PCAxMikgfCBkO1xuICAgIH0sXG5cbiAgICBnZXRCQ0hEaWdpdCA6IGZ1bmN0aW9uKGRhdGEpIHtcblxuXHQgICAgdmFyIGRpZ2l0ID0gMDtcblxuXHQgICAgd2hpbGUgKGRhdGEgIT0gMCkge1xuXHRcdCAgICBkaWdpdCsrO1xuXHRcdCAgICBkYXRhID4+Pj0gMTtcblx0ICAgIH1cblxuXHQgICAgcmV0dXJuIGRpZ2l0O1xuICAgIH0sXG5cbiAgICBnZXRQYXR0ZXJuUG9zaXRpb24gOiBmdW5jdGlvbih0eXBlTnVtYmVyKSB7XG5cdCAgICByZXR1cm4gUVJVdGlsLlBBVFRFUk5fUE9TSVRJT05fVEFCTEVbdHlwZU51bWJlciAtIDFdO1xuICAgIH0sXG5cbiAgICBnZXRNYXNrIDogZnVuY3Rpb24obWFza1BhdHRlcm4sIGksIGopIHtcblx0ICAgIFxuXHQgICAgc3dpdGNoIChtYXNrUGF0dGVybikge1xuXHRcdCAgICBcblx0ICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDAwIDogcmV0dXJuIChpICsgaikgJSAyID09IDA7XG5cdCAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAwMSA6IHJldHVybiBpICUgMiA9PSAwO1xuXHQgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMTAgOiByZXR1cm4gaiAlIDMgPT0gMDtcblx0ICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDExIDogcmV0dXJuIChpICsgaikgJSAzID09IDA7XG5cdCAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjEwMCA6IHJldHVybiAoTWF0aC5mbG9vcihpIC8gMikgKyBNYXRoLmZsb29yKGogLyAzKSApICUgMiA9PSAwO1xuXHQgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMDEgOiByZXR1cm4gKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMyA9PSAwO1xuXHQgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMTAgOiByZXR1cm4gKCAoaSAqIGopICUgMiArIChpICogaikgJSAzKSAlIDIgPT0gMDtcblx0ICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTExIDogcmV0dXJuICggKGkgKiBqKSAlIDMgKyAoaSArIGopICUgMikgJSAyID09IDA7XG5cblx0ICAgIGRlZmF1bHQgOlxuXHRcdCAgICB0aHJvdyBuZXcgRXJyb3IoXCJiYWQgbWFza1BhdHRlcm46XCIgKyBtYXNrUGF0dGVybik7XG5cdCAgICB9XG4gICAgfSxcblxuICAgIGdldEVycm9yQ29ycmVjdFBvbHlub21pYWwgOiBmdW5jdGlvbihlcnJvckNvcnJlY3RMZW5ndGgpIHtcblxuXHQgICAgdmFyIGEgPSBuZXcgUVJQb2x5bm9taWFsKFsxXSwgMCk7XG5cblx0ICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXJyb3JDb3JyZWN0TGVuZ3RoOyBpKyspIHtcblx0XHQgICAgYSA9IGEubXVsdGlwbHkobmV3IFFSUG9seW5vbWlhbChbMSwgUVJNYXRoLmdleHAoaSldLCAwKSApO1xuXHQgICAgfVxuXG5cdCAgICByZXR1cm4gYTtcbiAgICB9LFxuXG4gICAgZ2V0TGVuZ3RoSW5CaXRzIDogZnVuY3Rpb24obW9kZSwgdHlwZSkge1xuXG5cdCAgICBpZiAoMSA8PSB0eXBlICYmIHR5cGUgPCAxMCkge1xuXG5cdFx0ICAgIC8vIDEgLSA5XG5cblx0XHQgICAgc3dpdGNoKG1vZGUpIHtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV9OVU1CRVIgXHQ6IHJldHVybiAxMDtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV9BTFBIQV9OVU0gXHQ6IHJldHVybiA5O1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURVx0OiByZXR1cm4gODtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV9LQU5KSSAgXHQ6IHJldHVybiA4O1xuXHRcdCAgICBkZWZhdWx0IDpcblx0XHRcdCAgICB0aHJvdyBuZXcgRXJyb3IoXCJtb2RlOlwiICsgbW9kZSk7XG5cdFx0ICAgIH1cblxuXHQgICAgfSBlbHNlIGlmICh0eXBlIDwgMjcpIHtcblxuXHRcdCAgICAvLyAxMCAtIDI2XG5cblx0XHQgICAgc3dpdGNoKG1vZGUpIHtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV9OVU1CRVIgXHQ6IHJldHVybiAxMjtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV9BTFBIQV9OVU0gXHQ6IHJldHVybiAxMTtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEVcdDogcmV0dXJuIDE2O1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFX0tBTkpJICBcdDogcmV0dXJuIDEwO1xuXHRcdCAgICBkZWZhdWx0IDpcblx0XHRcdCAgICB0aHJvdyBuZXcgRXJyb3IoXCJtb2RlOlwiICsgbW9kZSk7XG5cdFx0ICAgIH1cblxuXHQgICAgfSBlbHNlIGlmICh0eXBlIDwgNDEpIHtcblxuXHRcdCAgICAvLyAyNyAtIDQwXG5cblx0XHQgICAgc3dpdGNoKG1vZGUpIHtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV9OVU1CRVIgXHQ6IHJldHVybiAxNDtcblx0XHQgICAgY2FzZSBRUk1vZGUuTU9ERV9BTFBIQV9OVU1cdDogcmV0dXJuIDEzO1xuXHRcdCAgICBjYXNlIFFSTW9kZS5NT0RFXzhCSVRfQllURVx0OiByZXR1cm4gMTY7XG5cdFx0ICAgIGNhc2UgUVJNb2RlLk1PREVfS0FOSkkgIFx0OiByZXR1cm4gMTI7XG5cdFx0ICAgIGRlZmF1bHQgOlxuXHRcdFx0ICAgIHRocm93IG5ldyBFcnJvcihcIm1vZGU6XCIgKyBtb2RlKTtcblx0XHQgICAgfVxuXG5cdCAgICB9IGVsc2Uge1xuXHRcdCAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0eXBlOlwiICsgdHlwZSk7XG5cdCAgICB9XG4gICAgfSxcblxuICAgIGdldExvc3RQb2ludCA6IGZ1bmN0aW9uKHFyQ29kZSkge1xuXHQgICAgXG5cdCAgICB2YXIgbW9kdWxlQ291bnQgPSBxckNvZGUuZ2V0TW9kdWxlQ291bnQoKTtcblx0ICAgIFxuXHQgICAgdmFyIGxvc3RQb2ludCA9IDA7XG5cdCAgICBcblx0ICAgIC8vIExFVkVMMVxuXHQgICAgXG5cdCAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93KyspIHtcblxuXHRcdCAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudDsgY29sKyspIHtcblxuXHRcdFx0ICAgIHZhciBzYW1lQ291bnQgPSAwO1xuXHRcdFx0ICAgIHZhciBkYXJrID0gcXJDb2RlLmlzRGFyayhyb3csIGNvbCk7XG5cblx0XHRcdFx0Zm9yICh2YXIgciA9IC0xOyByIDw9IDE7IHIrKykge1xuXG5cdFx0XHRcdCAgICBpZiAocm93ICsgciA8IDAgfHwgbW9kdWxlQ291bnQgPD0gcm93ICsgcikge1xuXHRcdFx0XHRcdCAgICBjb250aW51ZTtcblx0XHRcdFx0ICAgIH1cblxuXHRcdFx0XHQgICAgZm9yICh2YXIgYyA9IC0xOyBjIDw9IDE7IGMrKykge1xuXG5cdFx0XHRcdFx0ICAgIGlmIChjb2wgKyBjIDwgMCB8fCBtb2R1bGVDb3VudCA8PSBjb2wgKyBjKSB7XG5cdFx0XHRcdFx0XHQgICAgY29udGludWU7XG5cdFx0XHRcdFx0ICAgIH1cblxuXHRcdFx0XHRcdCAgICBpZiAociA9PSAwICYmIGMgPT0gMCkge1xuXHRcdFx0XHRcdFx0ICAgIGNvbnRpbnVlO1xuXHRcdFx0XHRcdCAgICB9XG5cblx0XHRcdFx0XHQgICAgaWYgKGRhcmsgPT0gcXJDb2RlLmlzRGFyayhyb3cgKyByLCBjb2wgKyBjKSApIHtcblx0XHRcdFx0XHRcdCAgICBzYW1lQ291bnQrKztcblx0XHRcdFx0XHQgICAgfVxuXHRcdFx0XHQgICAgfVxuXHRcdFx0ICAgIH1cblxuXHRcdFx0ICAgIGlmIChzYW1lQ291bnQgPiA1KSB7XG5cdFx0XHRcdCAgICBsb3N0UG9pbnQgKz0gKDMgKyBzYW1lQ291bnQgLSA1KTtcblx0XHRcdCAgICB9XG5cdFx0ICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gTEVWRUwyXG5cblx0ICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IG1vZHVsZUNvdW50IC0gMTsgcm93KyspIHtcblx0XHQgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQgLSAxOyBjb2wrKykge1xuXHRcdFx0ICAgIHZhciBjb3VudCA9IDA7XG5cdFx0XHQgICAgaWYgKHFyQ29kZS5pc0Rhcmsocm93LCAgICAgY29sICAgICkgKSBjb3VudCsrO1xuXHRcdFx0ICAgIGlmIChxckNvZGUuaXNEYXJrKHJvdyArIDEsIGNvbCAgICApICkgY291bnQrKztcblx0XHRcdCAgICBpZiAocXJDb2RlLmlzRGFyayhyb3csICAgICBjb2wgKyAxKSApIGNvdW50Kys7XG5cdFx0XHQgICAgaWYgKHFyQ29kZS5pc0Rhcmsocm93ICsgMSwgY29sICsgMSkgKSBjb3VudCsrO1xuXHRcdFx0ICAgIGlmIChjb3VudCA9PSAwIHx8IGNvdW50ID09IDQpIHtcblx0XHRcdFx0ICAgIGxvc3RQb2ludCArPSAzO1xuXHRcdFx0ICAgIH1cblx0XHQgICAgfVxuXHQgICAgfVxuXG5cdCAgICAvLyBMRVZFTDNcblxuXHQgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdysrKSB7XG5cdFx0ICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50IC0gNjsgY29sKyspIHtcblx0XHRcdCAgICBpZiAocXJDb2RlLmlzRGFyayhyb3csIGNvbClcblx0XHRcdFx0XHQgICAgJiYgIXFyQ29kZS5pc0Rhcmsocm93LCBjb2wgKyAxKVxuXHRcdFx0XHRcdCAgICAmJiAgcXJDb2RlLmlzRGFyayhyb3csIGNvbCArIDIpXG5cdFx0XHRcdFx0ICAgICYmICBxckNvZGUuaXNEYXJrKHJvdywgY29sICsgMylcblx0XHRcdFx0XHQgICAgJiYgIHFyQ29kZS5pc0Rhcmsocm93LCBjb2wgKyA0KVxuXHRcdFx0XHRcdCAgICAmJiAhcXJDb2RlLmlzRGFyayhyb3csIGNvbCArIDUpXG5cdFx0XHRcdFx0ICAgICYmICBxckNvZGUuaXNEYXJrKHJvdywgY29sICsgNikgKSB7XG5cdFx0XHRcdCAgICBsb3N0UG9pbnQgKz0gNDA7XG5cdFx0XHQgICAgfVxuXHRcdCAgICB9XG5cdCAgICB9XG5cblx0ICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wrKykge1xuXHRcdCAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudCAtIDY7IHJvdysrKSB7XG5cdFx0XHQgICAgaWYgKHFyQ29kZS5pc0Rhcmsocm93LCBjb2wpXG5cdFx0XHRcdFx0ICAgICYmICFxckNvZGUuaXNEYXJrKHJvdyArIDEsIGNvbClcblx0XHRcdFx0XHQgICAgJiYgIHFyQ29kZS5pc0Rhcmsocm93ICsgMiwgY29sKVxuXHRcdFx0XHRcdCAgICAmJiAgcXJDb2RlLmlzRGFyayhyb3cgKyAzLCBjb2wpXG5cdFx0XHRcdFx0ICAgICYmICBxckNvZGUuaXNEYXJrKHJvdyArIDQsIGNvbClcblx0XHRcdFx0XHQgICAgJiYgIXFyQ29kZS5pc0Rhcmsocm93ICsgNSwgY29sKVxuXHRcdFx0XHRcdCAgICAmJiAgcXJDb2RlLmlzRGFyayhyb3cgKyA2LCBjb2wpICkge1xuXHRcdFx0XHQgICAgbG9zdFBvaW50ICs9IDQwO1xuXHRcdFx0ICAgIH1cblx0XHQgICAgfVxuXHQgICAgfVxuXG5cdCAgICAvLyBMRVZFTDRcblx0ICAgIFxuXHQgICAgdmFyIGRhcmtDb3VudCA9IDA7XG5cblx0ICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wrKykge1xuXHRcdCAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93KyspIHtcblx0XHRcdCAgICBpZiAocXJDb2RlLmlzRGFyayhyb3csIGNvbCkgKSB7XG5cdFx0XHRcdCAgICBkYXJrQ291bnQrKztcblx0XHRcdCAgICB9XG5cdFx0ICAgIH1cblx0ICAgIH1cblx0ICAgIFxuXHQgICAgdmFyIHJhdGlvID0gTWF0aC5hYnMoMTAwICogZGFya0NvdW50IC8gbW9kdWxlQ291bnQgLyBtb2R1bGVDb3VudCAtIDUwKSAvIDU7XG5cdCAgICBsb3N0UG9pbnQgKz0gcmF0aW8gKiAxMDtcblxuXHQgICAgcmV0dXJuIGxvc3RQb2ludDtcdFx0XG4gICAgfVxuXG59O1xuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUk1hdGhcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBRUk1hdGggPSB7XG5cblx0Z2xvZyA6IGZ1bmN0aW9uKG4pIHtcblx0XG5cdFx0aWYgKG4gPCAxKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJnbG9nKFwiICsgbiArIFwiKVwiKTtcblx0XHR9XG5cdFx0XG5cdFx0cmV0dXJuIFFSTWF0aC5MT0dfVEFCTEVbbl07XG5cdH0sXG5cdFxuXHRnZXhwIDogZnVuY3Rpb24obikge1xuXHRcblx0XHR3aGlsZSAobiA8IDApIHtcblx0XHRcdG4gKz0gMjU1O1xuXHRcdH1cblx0XG5cdFx0d2hpbGUgKG4gPj0gMjU2KSB7XG5cdFx0XHRuIC09IDI1NTtcblx0XHR9XG5cdFxuXHRcdHJldHVybiBRUk1hdGguRVhQX1RBQkxFW25dO1xuXHR9LFxuXHRcblx0RVhQX1RBQkxFIDogbmV3IEFycmF5KDI1NiksXG5cdFxuXHRMT0dfVEFCTEUgOiBuZXcgQXJyYXkoMjU2KVxuXG59O1xuXHRcbmZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG5cdFFSTWF0aC5FWFBfVEFCTEVbaV0gPSAxIDw8IGk7XG59XG5mb3IgKHZhciBpID0gODsgaSA8IDI1NjsgaSsrKSB7XG5cdFFSTWF0aC5FWFBfVEFCTEVbaV0gPSBRUk1hdGguRVhQX1RBQkxFW2kgLSA0XVxuXHRcdF4gUVJNYXRoLkVYUF9UQUJMRVtpIC0gNV1cblx0XHReIFFSTWF0aC5FWFBfVEFCTEVbaSAtIDZdXG5cdFx0XiBRUk1hdGguRVhQX1RBQkxFW2kgLSA4XTtcbn1cbmZvciAodmFyIGkgPSAwOyBpIDwgMjU1OyBpKyspIHtcblx0UVJNYXRoLkxPR19UQUJMRVtRUk1hdGguRVhQX1RBQkxFW2ldIF0gPSBpO1xufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJQb2x5bm9taWFsXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBRUlBvbHlub21pYWwobnVtLCBzaGlmdCkge1xuXG5cdGlmIChudW0ubGVuZ3RoID09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihudW0ubGVuZ3RoICsgXCIvXCIgKyBzaGlmdCk7XG5cdH1cblxuXHR2YXIgb2Zmc2V0ID0gMDtcblxuXHR3aGlsZSAob2Zmc2V0IDwgbnVtLmxlbmd0aCAmJiBudW1bb2Zmc2V0XSA9PSAwKSB7XG5cdFx0b2Zmc2V0Kys7XG5cdH1cblxuXHR0aGlzLm51bSA9IG5ldyBBcnJheShudW0ubGVuZ3RoIC0gb2Zmc2V0ICsgc2hpZnQpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IG51bS5sZW5ndGggLSBvZmZzZXQ7IGkrKykge1xuXHRcdHRoaXMubnVtW2ldID0gbnVtW2kgKyBvZmZzZXRdO1xuXHR9XG59XG5cblFSUG9seW5vbWlhbC5wcm90b3R5cGUgPSB7XG5cblx0Z2V0IDogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRyZXR1cm4gdGhpcy5udW1baW5kZXhdO1xuXHR9LFxuXHRcblx0Z2V0TGVuZ3RoIDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMubnVtLmxlbmd0aDtcblx0fSxcblx0XG5cdG11bHRpcGx5IDogZnVuY3Rpb24oZSkge1xuXHRcblx0XHR2YXIgbnVtID0gbmV3IEFycmF5KHRoaXMuZ2V0TGVuZ3RoKCkgKyBlLmdldExlbmd0aCgpIC0gMSk7XG5cdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nZXRMZW5ndGgoKTsgaSsrKSB7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGUuZ2V0TGVuZ3RoKCk7IGorKykge1xuXHRcdFx0XHRudW1baSArIGpdIF49IFFSTWF0aC5nZXhwKFFSTWF0aC5nbG9nKHRoaXMuZ2V0KGkpICkgKyBRUk1hdGguZ2xvZyhlLmdldChqKSApICk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcblx0XHRyZXR1cm4gbmV3IFFSUG9seW5vbWlhbChudW0sIDApO1xuXHR9LFxuXHRcblx0bW9kIDogZnVuY3Rpb24oZSkge1xuXHRcblx0XHRpZiAodGhpcy5nZXRMZW5ndGgoKSAtIGUuZ2V0TGVuZ3RoKCkgPCAwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdFxuXHRcdHZhciByYXRpbyA9IFFSTWF0aC5nbG9nKHRoaXMuZ2V0KDApICkgLSBRUk1hdGguZ2xvZyhlLmdldCgwKSApO1xuXHRcblx0XHR2YXIgbnVtID0gbmV3IEFycmF5KHRoaXMuZ2V0TGVuZ3RoKCkgKTtcblx0XHRcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2V0TGVuZ3RoKCk7IGkrKykge1xuXHRcdFx0bnVtW2ldID0gdGhpcy5nZXQoaSk7XG5cdFx0fVxuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZS5nZXRMZW5ndGgoKTsgaSsrKSB7XG5cdFx0XHRudW1baV0gXj0gUVJNYXRoLmdleHAoUVJNYXRoLmdsb2coZS5nZXQoaSkgKSArIHJhdGlvKTtcblx0XHR9XG5cdFxuXHRcdC8vIHJlY3Vyc2l2ZSBjYWxsXG5cdFx0cmV0dXJuIG5ldyBRUlBvbHlub21pYWwobnVtLCAwKS5tb2QoZSk7XG5cdH1cbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBRUlJTQmxvY2tcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIFFSUlNCbG9jayh0b3RhbENvdW50LCBkYXRhQ291bnQpIHtcblx0dGhpcy50b3RhbENvdW50ID0gdG90YWxDb3VudDtcblx0dGhpcy5kYXRhQ291bnQgID0gZGF0YUNvdW50O1xufVxuXG5RUlJTQmxvY2suUlNfQkxPQ0tfVEFCTEUgPSBbXG4vLyBMXG4vLyBNXG4vLyBRXG4vLyBIXG5cbi8vIDFcblsxLCAyNiwgMTldLFxuWzEsIDI2LCAxNl0sXG5bMSwgMjYsIDEzXSxcblsxLCAyNiwgOV0sXG4vLyAyXG5bMSwgNDQsIDM0XSxcblsxLCA0NCwgMjhdLFxuWzEsIDQ0LCAyMl0sXG5bMSwgNDQsIDE2XSxcbi8vIDNcblsxLCA3MCwgNTVdLFxuWzEsIDcwLCA0NF0sXG5bMiwgMzUsIDE3XSxcblsyLCAzNSwgMTNdLFxuLy8gNFx0XHRcblsxLCAxMDAsIDgwXSxcblsyLCA1MCwgMzJdLFxuWzIsIDUwLCAyNF0sXG5bNCwgMjUsIDldLFxuLy8gNVxuWzEsIDEzNCwgMTA4XSxcblsyLCA2NywgNDNdLFxuWzIsIDMzLCAxNSwgMiwgMzQsIDE2XSxcblsyLCAzMywgMTEsIDIsIDM0LCAxMl0sXG4vLyA2XG5bMiwgODYsIDY4XSxcbls0LCA0MywgMjddLFxuWzQsIDQzLCAxOV0sXG5bNCwgNDMsIDE1XSxcbi8vIDdcdFx0XG5bMiwgOTgsIDc4XSxcbls0LCA0OSwgMzFdLFxuWzIsIDMyLCAxNCwgNCwgMzMsIDE1XSxcbls0LCAzOSwgMTMsIDEsIDQwLCAxNF0sXG4vLyA4XG5bMiwgMTIxLCA5N10sXG5bMiwgNjAsIDM4LCAyLCA2MSwgMzldLFxuWzQsIDQwLCAxOCwgMiwgNDEsIDE5XSxcbls0LCA0MCwgMTQsIDIsIDQxLCAxNV0sXG4vLyA5XG5bMiwgMTQ2LCAxMTZdLFxuWzMsIDU4LCAzNiwgMiwgNTksIDM3XSxcbls0LCAzNiwgMTYsIDQsIDM3LCAxN10sXG5bNCwgMzYsIDEyLCA0LCAzNywgMTNdLFxuLy8gMTBcdFx0XG5bMiwgODYsIDY4LCAyLCA4NywgNjldLFxuWzQsIDY5LCA0MywgMSwgNzAsIDQ0XSxcbls2LCA0MywgMTksIDIsIDQ0LCAyMF0sXG5bNiwgNDMsIDE1LCAyLCA0NCwgMTZdXG4vL05PVEUgYWRkZWQgYnkgUnlhbiBEYXkudG8gbWFrZSBncmVhdGVyIHRoYW4gdmVyc2lvbiAxMCBxcmNvZGVzXG4vLyB0aGlzIHRhYmxlIHN0YXJ0cyBvbiBwYWdlIDQwIG9mIHRoZSBzcGVjIFBERi4gZ29vZ2xlIElTTy9JRUMgMTgwMDRcbi8vIDExXG4sWzQsMTAxLDgxXVxuLFsxLDgwLDUwLDQsODEsNTFdXG4sWzQsNTAsMjIsNCw1MSwyM11cbixbMywzNiwxMiw4LDM3LDEzXVxuLy8xMlxuLFsyLDExNiw5MiwyLDExNyw5M11cbixbNiw1OCwzNiwyLDU5LDM3XVxuLFs0LDQ2LDIwLDYsNDcsMjFdXG4sWzcsNDIsMTQsNCw0MywxNV1cbi8vMTNcbixbNCwxMzMsMTA3XVxuLFs4LDU5LDM3LDEsNjAsMzhdXG4sWzgsNDQsMjAsNCw0NSwyMV1cbixbMTIsMzMsMTEsNCwzNCwxMl1cbi8vMTRcbixbMywxNDUsMTE1LDEsMTQ2LDExNl1cbixbNCw2NCw0MCw1LDY1LDQxXVxuLFsxMSwzNiwxNiw1LDM3LDE3XVxuLFsxMSwzNiwxMiw1LDM3LDEzXVxuLy8xNVxuLFs1LDEwOSw4NywxLDExMCw4OF1cbixbNSw2NSw0MSw1LDY2LDQyXVxuLFs1LDU0LDI0LDcsNTUsMjVdXG4sWzExLDM2LDEyLDcsMzcsMTNdXG4vLzE2XG4sWzUsMTIyLDk4LDEsMTIzLDk5XVxuLFs3LDczLDQ1LDMsNzQsNDZdXG4sWzE1LDQzLDE5LDIsNDQsMjBdXG4sWzMsNDUsMTUsMTMsNDYsMTZdXG4vLzE3XG4sWzEsMTM1LDEwNyw1LDEzNiwxMDhdXG4sWzEwLDc0LDQ2LDEsNzUsNDddXG4sWzEsNTAsMjIsMTUsNTEsMjNdXG4sWzIsNDIsMTQsMTcsNDMsMTVdXG4vLzE4XG4sWzUsMTUwLDEyMCwxLDE1MSwxMjFdXG4sWzksNjksNDMsNCw3MCw0NF1cbixbMTcsNTAsMjIsMSw1MSwyM11cbixbMiw0MiwxNCwxOSw0MywxNV1cbi8vMTlcbixbMywxNDEsMTEzLDQsMTQyLDExNF1cbixbMyw3MCw0NCwxMSw3MSw0NV1cbixbMTcsNDcsMjEsNCw0OCwyMl1cbixbOSwzOSwxMywxNiw0MCwxNF1cbi8vMjBcbixbMywxMzUsMTA3LDUsMTM2LDEwOF1cbixbMyw2Nyw0MSwxMyw2OCw0Ml1cbixbMTUsNTQsMjQsNSw1NSwyNV1cbixbMTUsNDMsMTUsMTAsNDQsMTZdXG4vLzIxXG4sWzQsMTQ0LDExNiw0LDE0NSwxMTddXG4sWzE3LDY4LDQyXVxuLFsxNyw1MCwyMiw2LDUxLDIzXVxuLFsxOSw0NiwxNiw2LDQ3LDE3XVxuLy8yMlxuLFsyLDEzOSwxMTEsNywxNDAsMTEyXVxuLFsxNyw3NCw0Nl1cbixbNyw1NCwyNCwxNiw1NSwyNV1cbixbMzQsMzcsMTNdXG4vLzIzXG4sWzQsMTUxLDEyMSw1LDE1MiwxMjJdXG4sWzQsNzUsNDcsMTQsNzYsNDhdXG4sWzExLDU0LDI0LDE0LDU1LDI1XVxuLFsxNiw0NSwxNSwxNCw0NiwxNl1cbi8vMjRcbixbNiwxNDcsMTE3LDQsMTQ4LDExOF1cbixbNiw3Myw0NSwxNCw3NCw0Nl1cbixbMTEsNTQsMjQsMTYsNTUsMjVdXG4sWzMwLDQ2LDE2LDIsNDcsMTddXG4vLzI1XG4sWzgsMTMyLDEwNiw0LDEzMywxMDddXG4sWzgsNzUsNDcsMTMsNzYsNDhdXG4sWzcsNTQsMjQsMjIsNTUsMjVdXG4sWzIyLDQ1LDE1LDEzLDQ2LDE2XVxuLy8yNlxuLFsxMCwxNDIsMTE0LDIsMTQzLDExNV1cbixbMTksNzQsNDYsNCw3NSw0N11cbixbMjgsNTAsMjIsNiw1MSwyM11cbixbMzMsNDYsMTYsNCw0NywxN11cbi8vMjdcbixbOCwxNTIsMTIyLDQsMTUzLDEyM11cbixbMjIsNzMsNDUsMyw3NCw0Nl1cbixbOCw1MywyMywyNiw1NCwyNF1cbixbMTIsNDUsMTUsMjgsNDYsMTZdXG4vLzI4XG4sWzMsMTQ3LDExNywxMCwxNDgsMTE4XVxuLFszLDczLDQ1LDIzLDc0LDQ2XVxuLFs0LDU0LDI0LDMxLDU1LDI1XVxuLFsxMSw0NSwxNSwzMSw0NiwxNl1cbi8vMjlcbixbNywxNDYsMTE2LDcsMTQ3LDExN11cbixbMjEsNzMsNDUsNyw3NCw0Nl1cbixbMSw1MywyMywzNyw1NCwyNF1cbixbMTksNDUsMTUsMjYsNDYsMTZdXG4vLzMwXG4sWzUsMTQ1LDExNSwxMCwxNDYsMTE2XVxuLFsxOSw3NSw0NywxMCw3Niw0OF1cbixbMTUsNTQsMjQsMjUsNTUsMjVdXG4sWzIzLDQ1LDE1LDI1LDQ2LDE2XVxuLy8zMVxuLFsxMywxNDUsMTE1LDMsMTQ2LDExNl1cbixbMiw3NCw0NiwyOSw3NSw0N11cbixbNDIsNTQsMjQsMSw1NSwyNV1cbixbMjMsNDUsMTUsMjgsNDYsMTZdXG4vLzMyXG4sWzE3LDE0NSwxMTVdXG4sWzEwLDc0LDQ2LDIzLDc1LDQ3XVxuLFsxMCw1NCwyNCwzNSw1NSwyNV1cbixbMTksNDUsMTUsMzUsNDYsMTZdXG4vLzMzXG4sWzE3LDE0NSwxMTUsMSwxNDYsMTE2XVxuLFsxNCw3NCw0NiwyMSw3NSw0N11cbixbMjksNTQsMjQsMTksNTUsMjVdXG4sWzExLDQ1LDE1LDQ2LDQ2LDE2XVxuLy8zNFxuLFsxMywxNDUsMTE1LDYsMTQ2LDExNl1cbixbMTQsNzQsNDYsMjMsNzUsNDddXG4sWzQ0LDU0LDI0LDcsNTUsMjVdXG4sWzU5LDQ2LDE2LDEsNDcsMTddXG4vLzM1XG4sWzEyLDE1MSwxMjEsNywxNTIsMTIyXVxuLFsxMiw3NSw0NywyNiw3Niw0OF1cbixbMzksNTQsMjQsMTQsNTUsMjVdXG4sWzIyLDQ1LDE1LDQxLDQ2LDE2XVxuLy8zNlxuLFs2LDE1MSwxMjEsMTQsMTUyLDEyMl1cbixbNiw3NSw0NywzNCw3Niw0OF1cbixbNDYsNTQsMjQsMTAsNTUsMjVdXG4sWzIsNDUsMTUsNjQsNDYsMTZdXG4vLzM3XG4sWzE3LDE1MiwxMjIsNCwxNTMsMTIzXVxuLFsyOSw3NCw0NiwxNCw3NSw0N11cbixbNDksNTQsMjQsMTAsNTUsMjVdXG4sWzI0LDQ1LDE1LDQ2LDQ2LDE2XVxuLy8zOFxuLFs0LDE1MiwxMjIsMTgsMTUzLDEyM11cbixbMTMsNzQsNDYsMzIsNzUsNDddXG4sWzQ4LDU0LDI0LDE0LDU1LDI1XVxuLFs0Miw0NSwxNSwzMiw0NiwxNl1cbi8vMzlcbixbMjAsMTQ3LDExNyw0LDE0OCwxMThdXG4sWzQwLDc1LDQ3LDcsNzYsNDhdXG4sWzQzLDU0LDI0LDIyLDU1LDI1XVxuLFsxMCw0NSwxNSw2Nyw0NiwxNl1cbi8vNDBcbixbMTksMTQ4LDExOCw2LDE0OSwxMTldXG4sWzE4LDc1LDQ3LDMxLDc2LDQ4XVxuLFszNCw1NCwyNCwzNCw1NSwyNV1cbixbMjAsNDUsMTUsNjEsNDYsMTZdXHRcbl07XG5cblFSUlNCbG9jay5nZXRSU0Jsb2NrcyA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdExldmVsKSB7XG5cdFxuXHR2YXIgcnNCbG9jayA9IFFSUlNCbG9jay5nZXRSc0Jsb2NrVGFibGUodHlwZU51bWJlciwgZXJyb3JDb3JyZWN0TGV2ZWwpO1xuXHRcblx0aWYgKHJzQmxvY2sgPT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiYmFkIHJzIGJsb2NrIEAgdHlwZU51bWJlcjpcIiArIHR5cGVOdW1iZXIgKyBcIi9lcnJvckNvcnJlY3RMZXZlbDpcIiArIGVycm9yQ29ycmVjdExldmVsKTtcblx0fVxuXG5cdHZhciBsZW5ndGggPSByc0Jsb2NrLmxlbmd0aCAvIDM7XG5cdFxuXHR2YXIgbGlzdCA9IG5ldyBBcnJheSgpO1xuXHRcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXG5cdFx0dmFyIGNvdW50ID0gcnNCbG9ja1tpICogMyArIDBdO1xuXHRcdHZhciB0b3RhbENvdW50ID0gcnNCbG9ja1tpICogMyArIDFdO1xuXHRcdHZhciBkYXRhQ291bnQgID0gcnNCbG9ja1tpICogMyArIDJdO1xuXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjb3VudDsgaisrKSB7XG5cdFx0XHRsaXN0LnB1c2gobmV3IFFSUlNCbG9jayh0b3RhbENvdW50LCBkYXRhQ291bnQpICk7XHRcblx0XHR9XG5cdH1cblx0XG5cdHJldHVybiBsaXN0O1xufVxuXG5RUlJTQmxvY2suZ2V0UnNCbG9ja1RhYmxlID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0TGV2ZWwpIHtcblxuXHRzd2l0Y2goZXJyb3JDb3JyZWN0TGV2ZWwpIHtcblx0Y2FzZSBRUkVycm9yQ29ycmVjdExldmVsLkwgOlxuXHRcdHJldHVybiBRUlJTQmxvY2suUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAwXTtcblx0Y2FzZSBRUkVycm9yQ29ycmVjdExldmVsLk0gOlxuXHRcdHJldHVybiBRUlJTQmxvY2suUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAxXTtcblx0Y2FzZSBRUkVycm9yQ29ycmVjdExldmVsLlEgOlxuXHRcdHJldHVybiBRUlJTQmxvY2suUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAyXTtcblx0Y2FzZSBRUkVycm9yQ29ycmVjdExldmVsLkggOlxuXHRcdHJldHVybiBRUlJTQmxvY2suUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAzXTtcblx0ZGVmYXVsdCA6XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufVxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUVJCaXRCdWZmZXJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIFFSQml0QnVmZmVyKCkge1xuXHR0aGlzLmJ1ZmZlciA9IG5ldyBBcnJheSgpO1xuXHR0aGlzLmxlbmd0aCA9IDA7XG59XG5cblFSQml0QnVmZmVyLnByb3RvdHlwZSA9IHtcblxuXHRnZXQgOiBmdW5jdGlvbihpbmRleCkge1xuXHRcdHZhciBidWZJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyA4KTtcblx0XHRyZXR1cm4gKCAodGhpcy5idWZmZXJbYnVmSW5kZXhdID4+PiAoNyAtIGluZGV4ICUgOCkgKSAmIDEpID09IDE7XG5cdH0sXG5cdFxuXHRwdXQgOiBmdW5jdGlvbihudW0sIGxlbmd0aCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMucHV0Qml0KCAoIChudW0gPj4+IChsZW5ndGggLSBpIC0gMSkgKSAmIDEpID09IDEpO1xuXHRcdH1cblx0fSxcblx0XG5cdGdldExlbmd0aEluQml0cyA6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmxlbmd0aDtcblx0fSxcblx0XG5cdHB1dEJpdCA6IGZ1bmN0aW9uKGJpdCkge1xuXHRcblx0XHR2YXIgYnVmSW5kZXggPSBNYXRoLmZsb29yKHRoaXMubGVuZ3RoIC8gOCk7XG5cdFx0aWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8PSBidWZJbmRleCkge1xuXHRcdFx0dGhpcy5idWZmZXIucHVzaCgwKTtcblx0XHR9XG5cdFxuXHRcdGlmIChiaXQpIHtcblx0XHRcdHRoaXMuYnVmZmVyW2J1ZkluZGV4XSB8PSAoMHg4MCA+Pj4gKHRoaXMubGVuZ3RoICUgOCkgKTtcblx0XHR9XG5cdFxuXHRcdHRoaXMubGVuZ3RoKys7XG5cdH1cbn07XG4iLCJ2YXIgcHJvdG8gPSB7fVxubW9kdWxlLmV4cG9ydHMgPSBwcm90b1xuXG5wcm90by5mcm9tID0gcmVxdWlyZSgnLi9mcm9tLmpzJylcbnByb3RvLnRvID0gcmVxdWlyZSgnLi90by5qcycpXG5wcm90by5pcyA9IHJlcXVpcmUoJy4vaXMuanMnKVxucHJvdG8uc3ViYXJyYXkgPSByZXF1aXJlKCcuL3N1YmFycmF5LmpzJylcbnByb3RvLmpvaW4gPSByZXF1aXJlKCcuL2pvaW4uanMnKVxucHJvdG8uY29weSA9IHJlcXVpcmUoJy4vY29weS5qcycpXG5wcm90by5jcmVhdGUgPSByZXF1aXJlKCcuL2NyZWF0ZS5qcycpXG5cbm1peChyZXF1aXJlKCcuL3JlYWQuanMnKSwgcHJvdG8pXG5taXgocmVxdWlyZSgnLi93cml0ZS5qcycpLCBwcm90bylcblxuZnVuY3Rpb24gbWl4KGZyb20sIGludG8pIHtcbiAgZm9yKHZhciBrZXkgaW4gZnJvbSkge1xuICAgIGludG9ba2V5XSA9IGZyb21ba2V5XVxuICB9XG59XG4iLCIoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnI7XG5cdFxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93ICdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jztcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0cGxhY2VIb2xkZXJzID0gYjY0LmluZGV4T2YoJz0nKTtcblx0XHRwbGFjZUhvbGRlcnMgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIHBsYWNlSG9sZGVycyA6IDA7XG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBbXTsvL25ldyBVaW50OEFycmF5KGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycyk7XG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGg7XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAobG9va3VwLmluZGV4T2YoYjY0W2ldKSA8PCAxOCkgfCAobG9va3VwLmluZGV4T2YoYjY0W2kgKyAxXSkgPDwgMTIpIHwgKGxvb2t1cC5pbmRleE9mKGI2NFtpICsgMl0pIDw8IDYpIHwgbG9va3VwLmluZGV4T2YoYjY0W2kgKyAzXSk7XG5cdFx0XHRhcnIucHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KTtcblx0XHRcdGFyci5wdXNoKCh0bXAgJiAweEZGMDApID4+IDgpO1xuXHRcdFx0YXJyLnB1c2godG1wICYgMHhGRik7XG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGxvb2t1cC5pbmRleE9mKGI2NFtpXSkgPDwgMikgfCAobG9va3VwLmluZGV4T2YoYjY0W2kgKyAxXSkgPj4gNCk7XG5cdFx0XHRhcnIucHVzaCh0bXAgJiAweEZGKTtcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGxvb2t1cC5pbmRleE9mKGI2NFtpXSkgPDwgMTApIHwgKGxvb2t1cC5pbmRleE9mKGI2NFtpICsgMV0pIDw8IDQpIHwgKGxvb2t1cC5pbmRleE9mKGI2NFtpICsgMl0pID4+IDIpO1xuXHRcdFx0YXJyLnB1c2goKHRtcCA+PiA4KSAmIDB4RkYpO1xuXHRcdFx0YXJyLnB1c2godG1wICYgMHhGRik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFycjtcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aDtcblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICsgbG9va3VwW251bSA+PiAxMiAmIDB4M0ZdICsgbG9va3VwW251bSA+PiA2ICYgMHgzRl0gKyBsb29rdXBbbnVtICYgMHgzRl07XG5cdFx0fTtcblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pO1xuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKTtcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXTtcblx0XHRcdFx0b3V0cHV0ICs9IGxvb2t1cFt0ZW1wID4+IDJdO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwWyh0ZW1wIDw8IDQpICYgMHgzRl07XG5cdFx0XHRcdG91dHB1dCArPSAnPT0nO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSk7XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbdGVtcCA+PiAxMF07XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbKHRlbXAgPj4gNCkgJiAweDNGXTtcblx0XHRcdFx0b3V0cHV0ICs9IGxvb2t1cFsodGVtcCA8PCAyKSAmIDB4M0ZdO1xuXHRcdFx0XHRvdXRwdXQgKz0gJz0nO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0bW9kdWxlLmV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheTtcblx0bW9kdWxlLmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjQ7XG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB0b191dGY4XG5cbnZhciBvdXQgPSBbXVxuICAsIGNvbCA9IFtdXG4gICwgZmNjID0gU3RyaW5nLmZyb21DaGFyQ29kZVxuICAsIG1hc2sgPSBbMHg0MCwgMHgyMCwgMHgxMCwgMHgwOCwgMHgwNCwgMHgwMiwgMHgwMV1cbiAgLCB1bm1hc2sgPSBbXG4gICAgICAweDAwXG4gICAgLCAweDAxXG4gICAgLCAweDAyIHwgMHgwMVxuICAgICwgMHgwNCB8IDB4MDIgfCAweDAxXG4gICAgLCAweDA4IHwgMHgwNCB8IDB4MDIgfCAweDAxXG4gICAgLCAweDEwIHwgMHgwOCB8IDB4MDQgfCAweDAyIHwgMHgwMVxuICAgICwgMHgyMCB8IDB4MTAgfCAweDA4IHwgMHgwNCB8IDB4MDIgfCAweDAxXG4gICAgLCAweDQwIHwgMHgyMCB8IDB4MTAgfCAweDA4IHwgMHgwNCB8IDB4MDIgfCAweDAxXG4gIF1cblxuZnVuY3Rpb24gdG9fdXRmOChieXRlcywgc3RhcnQsIGVuZCkge1xuICBzdGFydCA9IHN0YXJ0ID09PSB1bmRlZmluZWQgPyAwIDogc3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBieXRlcy5sZW5ndGggOiBlbmRcblxuICB2YXIgaWR4ID0gMFxuICAgICwgaGkgPSAweDgwXG4gICAgLCBjb2xsZWN0aW5nID0gMFxuICAgICwgcG9zXG4gICAgLCBieVxuXG4gIGNvbC5sZW5ndGggPVxuICBvdXQubGVuZ3RoID0gMFxuXG4gIHdoaWxlKGlkeCA8IGJ5dGVzLmxlbmd0aCkge1xuICAgIGJ5ID0gYnl0ZXNbaWR4XVxuICAgIGlmKCFjb2xsZWN0aW5nICYmIGJ5ICYgaGkpIHtcbiAgICAgIHBvcyA9IGZpbmRfcGFkX3Bvc2l0aW9uKGJ5KVxuICAgICAgY29sbGVjdGluZyArPSBwb3NcbiAgICAgIGlmKHBvcyA8IDgpIHtcbiAgICAgICAgY29sW2NvbC5sZW5ndGhdID0gYnkgJiB1bm1hc2tbNiAtIHBvc11cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYoY29sbGVjdGluZykge1xuICAgICAgY29sW2NvbC5sZW5ndGhdID0gYnkgJiB1bm1hc2tbNl1cbiAgICAgIC0tY29sbGVjdGluZ1xuICAgICAgaWYoIWNvbGxlY3RpbmcgJiYgY29sLmxlbmd0aCkge1xuICAgICAgICBvdXRbb3V0Lmxlbmd0aF0gPSBmY2MocmVkdWNlZChjb2wsIHBvcykpXG4gICAgICAgIGNvbC5sZW5ndGggPSAwXG4gICAgICB9XG4gICAgfSBlbHNlIHsgXG4gICAgICBvdXRbb3V0Lmxlbmd0aF0gPSBmY2MoYnkpXG4gICAgfVxuICAgICsraWR4XG4gIH1cbiAgaWYoY29sLmxlbmd0aCAmJiAhY29sbGVjdGluZykge1xuICAgIG91dFtvdXQubGVuZ3RoXSA9IGZjYyhyZWR1Y2VkKGNvbCwgcG9zKSlcbiAgICBjb2wubGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBvdXQuam9pbignJylcbn1cblxuZnVuY3Rpb24gZmluZF9wYWRfcG9zaXRpb24oYnl0KSB7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCA3OyArK2kpIHtcbiAgICBpZighKGJ5dCAmIG1hc2tbaV0pKSB7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiByZWR1Y2VkKGxpc3QpIHtcbiAgdmFyIG91dCA9IDBcbiAgZm9yKHZhciBpID0gMCwgbGVuID0gbGlzdC5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIG91dCB8PSBsaXN0W2ldIDw8ICgobGVuIC0gaSAtIDEpICogNilcbiAgfVxuICByZXR1cm4gb3V0XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNvcHlcblxudmFyIHNsaWNlID0gW10uc2xpY2VcblxuZnVuY3Rpb24gY29weShzb3VyY2UsIHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzb3VyY2Vfc3RhcnQsIHNvdXJjZV9lbmQpIHtcbiAgdGFyZ2V0X3N0YXJ0ID0gYXJndW1lbnRzLmxlbmd0aCA8IDMgPyAwIDogdGFyZ2V0X3N0YXJ0XG4gIHNvdXJjZV9zdGFydCA9IGFyZ3VtZW50cy5sZW5ndGggPCA0ID8gMCA6IHNvdXJjZV9zdGFydFxuICBzb3VyY2VfZW5kID0gYXJndW1lbnRzLmxlbmd0aCA8IDUgPyBzb3VyY2UubGVuZ3RoIDogc291cmNlX2VuZFxuXG4gIGlmKHNvdXJjZV9lbmQgPT09IHNvdXJjZV9zdGFydCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgaWYodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBpZihzb3VyY2VfZW5kID4gc291cmNlLmxlbmd0aCkge1xuICAgIHNvdXJjZV9lbmQgPSBzb3VyY2UubGVuZ3RoXG4gIH1cblxuICBpZih0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgc291cmNlX2VuZCAtIHNvdXJjZV9zdGFydCkge1xuICAgIHNvdXJjZV9lbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIGlmKHNvdXJjZS5idWZmZXIgIT09IHRhcmdldC5idWZmZXIpIHtcbiAgICByZXR1cm4gZmFzdF9jb3B5KHNvdXJjZSwgdGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHNvdXJjZV9zdGFydCwgc291cmNlX2VuZClcbiAgfVxuICByZXR1cm4gc2xvd19jb3B5KHNvdXJjZSwgdGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHNvdXJjZV9zdGFydCwgc291cmNlX2VuZClcbn1cblxuZnVuY3Rpb24gZmFzdF9jb3B5KHNvdXJjZSwgdGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHNvdXJjZV9zdGFydCwgc291cmNlX2VuZCkge1xuICB2YXIgbGVuID0gKHNvdXJjZV9lbmQgLSBzb3VyY2Vfc3RhcnQpICsgdGFyZ2V0X3N0YXJ0XG5cbiAgZm9yKHZhciBpID0gdGFyZ2V0X3N0YXJ0LCBqID0gc291cmNlX3N0YXJ0O1xuICAgICAgaSA8IGxlbjtcbiAgICAgICsraSxcbiAgICAgICsraikge1xuICAgIHRhcmdldFtpXSA9IHNvdXJjZVtqXVxuICB9XG59XG5cbmZ1bmN0aW9uIHNsb3dfY29weShmcm9tLCB0bywgaiwgaSwgamVuZCkge1xuICAvLyB0aGUgYnVmZmVycyBjb3VsZCBvdmVybGFwLlxuICB2YXIgaWVuZCA9IGplbmQgKyBpXG4gICAgLCB0bXAgPSBuZXcgVWludDhBcnJheShzbGljZS5jYWxsKGZyb20sIGksIGllbmQpKVxuICAgICwgeCA9IDBcblxuICBmb3IoOyBpIDwgaWVuZDsgKytpLCArK3gpIHtcbiAgICB0b1tqKytdID0gdG1wW3hdXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2l6ZSkge1xuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoc2l6ZSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnJvbVxuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcblxudmFyIGRlY29kZXJzID0ge1xuICAgIGhleDogZnJvbV9oZXhcbiAgLCB1dGY4OiBmcm9tX3V0ZlxuICAsIGJhc2U2NDogZnJvbV9iYXNlNjRcbn1cblxuZnVuY3Rpb24gZnJvbShzb3VyY2UsIGVuY29kaW5nKSB7XG4gIGlmKEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShzb3VyY2UpXG4gIH1cblxuICByZXR1cm4gZGVjb2RlcnNbZW5jb2RpbmcgfHwgJ3V0ZjgnXShzb3VyY2UpXG59XG5cbmZ1bmN0aW9uIGZyb21faGV4KHN0cikge1xuICB2YXIgc2l6ZSA9IHN0ci5sZW5ndGggLyAyXG4gICAgLCBidWYgPSBuZXcgVWludDhBcnJheShzaXplKVxuICAgICwgY2hhcmFjdGVyID0gJydcblxuICBmb3IodmFyIGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBjaGFyYWN0ZXIgKz0gc3RyLmNoYXJBdChpKVxuXG4gICAgaWYoaSA+IDAgJiYgKGkgJSAyKSA9PT0gMSkge1xuICAgICAgYnVmW2k+Pj4xXSA9IHBhcnNlSW50KGNoYXJhY3RlciwgMTYpXG4gICAgICBjaGFyYWN0ZXIgPSAnJyBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmIFxufVxuXG5mdW5jdGlvbiBmcm9tX3V0ZihzdHIpIHtcbiAgdmFyIGJ5dGVzID0gW11cbiAgICAsIHRtcFxuICAgICwgY2hcblxuICBmb3IodmFyIGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBjaCA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYoY2ggJiAweDgwKSB7XG4gICAgICB0bXAgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLmNoYXJBdChpKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvcih2YXIgaiA9IDAsIGpsZW4gPSB0bXAubGVuZ3RoOyBqIDwgamxlbjsgKytqKSB7XG4gICAgICAgIGJ5dGVzW2J5dGVzLmxlbmd0aF0gPSBwYXJzZUludCh0bXBbal0sIDE2KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBieXRlc1tieXRlcy5sZW5ndGhdID0gY2ggXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ5dGVzKVxufVxuXG5mdW5jdGlvbiBmcm9tX2Jhc2U2NChzdHIpIHtcbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJhc2U2NC50b0J5dGVBcnJheShzdHIpKSBcbn1cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgcmV0dXJuIGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGpvaW5cblxuZnVuY3Rpb24gam9pbih0YXJnZXRzLCBoaW50KSB7XG4gIGlmKCF0YXJnZXRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheSgwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGhpbnQgIT09IHVuZGVmaW5lZCA/IGhpbnQgOiBnZXRfbGVuZ3RoKHRhcmdldHMpXG4gICAgLCBvdXQgPSBuZXcgVWludDhBcnJheShsZW4pXG4gICAgLCBjdXIgPSB0YXJnZXRzWzBdXG4gICAgLCBjdXJsZW4gPSBjdXIubGVuZ3RoXG4gICAgLCBjdXJpZHggPSAwXG4gICAgLCBjdXJvZmYgPSAwXG4gICAgLCBpID0gMFxuXG4gIHdoaWxlKGkgPCBsZW4pIHtcbiAgICBpZihjdXJvZmYgPT09IGN1cmxlbikge1xuICAgICAgY3Vyb2ZmID0gMFxuICAgICAgKytjdXJpZHhcbiAgICAgIGN1ciA9IHRhcmdldHNbY3VyaWR4XVxuICAgICAgY3VybGVuID0gY3VyICYmIGN1ci5sZW5ndGhcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIG91dFtpKytdID0gY3VyW2N1cm9mZisrXSBcbiAgfVxuXG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gZ2V0X2xlbmd0aCh0YXJnZXRzKSB7XG4gIHZhciBzaXplID0gMFxuICBmb3IodmFyIGkgPSAwLCBsZW4gPSB0YXJnZXRzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgc2l6ZSArPSB0YXJnZXRzW2ldLmJ5dGVMZW5ndGhcbiAgfVxuICByZXR1cm4gc2l6ZVxufVxuIiwidmFyIHByb3RvXG4gICwgbWFwXG5cbm1vZHVsZS5leHBvcnRzID0gcHJvdG8gPSB7fVxuXG5tYXAgPSB0eXBlb2YgV2Vha01hcCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogbmV3IFdlYWtNYXBcblxucHJvdG8uZ2V0ID0gIW1hcCA/IG5vX3dlYWttYXBfZ2V0IDogZ2V0XG5cbmZ1bmN0aW9uIG5vX3dlYWttYXBfZ2V0KHRhcmdldCkge1xuICByZXR1cm4gbmV3IERhdGFWaWV3KHRhcmdldC5idWZmZXIsIDApXG59XG5cbmZ1bmN0aW9uIGdldCh0YXJnZXQpIHtcbiAgdmFyIG91dCA9IG1hcC5nZXQodGFyZ2V0LmJ1ZmZlcilcbiAgaWYoIW91dCkge1xuICAgIG1hcC5zZXQodGFyZ2V0LmJ1ZmZlciwgb3V0ID0gbmV3IERhdGFWaWV3KHRhcmdldC5idWZmZXIsIDApKVxuICB9XG4gIHJldHVybiBvdXRcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJlYWRVSW50ODogICAgICByZWFkX3VpbnQ4XG4gICwgcmVhZEludDg6ICAgICAgIHJlYWRfaW50OFxuICAsIHJlYWRVSW50MTZMRTogICByZWFkX3VpbnQxNl9sZVxuICAsIHJlYWRVSW50MzJMRTogICByZWFkX3VpbnQzMl9sZVxuICAsIHJlYWRJbnQxNkxFOiAgICByZWFkX2ludDE2X2xlXG4gICwgcmVhZEludDMyTEU6ICAgIHJlYWRfaW50MzJfbGVcbiAgLCByZWFkRmxvYXRMRTogICAgcmVhZF9mbG9hdF9sZVxuICAsIHJlYWREb3VibGVMRTogICByZWFkX2RvdWJsZV9sZVxuICAsIHJlYWRVSW50MTZCRTogICByZWFkX3VpbnQxNl9iZVxuICAsIHJlYWRVSW50MzJCRTogICByZWFkX3VpbnQzMl9iZVxuICAsIHJlYWRJbnQxNkJFOiAgICByZWFkX2ludDE2X2JlXG4gICwgcmVhZEludDMyQkU6ICAgIHJlYWRfaW50MzJfYmVcbiAgLCByZWFkRmxvYXRCRTogICAgcmVhZF9mbG9hdF9iZVxuICAsIHJlYWREb3VibGVCRTogICByZWFkX2RvdWJsZV9iZVxufVxuXG52YXIgbWFwID0gcmVxdWlyZSgnLi9tYXBwZWQuanMnKVxuXG5mdW5jdGlvbiByZWFkX3VpbnQ4KHRhcmdldCwgYXQpIHtcbiAgcmV0dXJuIHRhcmdldFthdF1cbn1cblxuZnVuY3Rpb24gcmVhZF9pbnQ4KHRhcmdldCwgYXQpIHtcbiAgdmFyIHYgPSB0YXJnZXRbYXRdO1xuICByZXR1cm4gdiA8IDB4ODAgPyB2IDogdiAtIDB4MTAwXG59XG5cbmZ1bmN0aW9uIHJlYWRfdWludDE2X2xlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0VWludDE2KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHJlYWRfdWludDMyX2xlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0VWludDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHJlYWRfaW50MTZfbGUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRJbnQxNihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB0cnVlKVxufVxuXG5mdW5jdGlvbiByZWFkX2ludDMyX2xlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0SW50MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gcmVhZF9mbG9hdF9sZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldEZsb2F0MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gcmVhZF9kb3VibGVfbGUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRGbG9hdDY0KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHJlYWRfdWludDE2X2JlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0VWludDE2KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiByZWFkX3VpbnQzMl9iZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldFVpbnQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gcmVhZF9pbnQxNl9iZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldEludDE2KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiByZWFkX2ludDMyX2JlKHRhcmdldCwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuZ2V0SW50MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHJlYWRfZmxvYXRfYmUodGFyZ2V0LCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5nZXRGbG9hdDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiByZWFkX2RvdWJsZV9iZSh0YXJnZXQsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LmdldEZsb2F0NjQoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgZmFsc2UpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHN1YmFycmF5XG5cbmZ1bmN0aW9uIHN1YmFycmF5KGJ1ZiwgZnJvbSwgdG8pIHtcbiAgcmV0dXJuIGJ1Zi5zdWJhcnJheShmcm9tIHx8IDAsIHRvIHx8IGJ1Zi5sZW5ndGgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHRvXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxuICAsIHRvdXRmOCA9IHJlcXVpcmUoJ3RvLXV0ZjgnKVxuXG52YXIgZW5jb2RlcnMgPSB7XG4gICAgaGV4OiB0b19oZXhcbiAgLCB1dGY4OiB0b191dGZcbiAgLCBiYXNlNjQ6IHRvX2Jhc2U2NFxufVxuXG5mdW5jdGlvbiB0byhidWYsIGVuY29kaW5nKSB7XG4gIHJldHVybiBlbmNvZGVyc1tlbmNvZGluZyB8fCAndXRmOCddKGJ1Zilcbn1cblxuZnVuY3Rpb24gdG9faGV4KGJ1Zikge1xuICB2YXIgc3RyID0gJydcbiAgICAsIGJ5dFxuXG4gIGZvcih2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGJ5dCA9IGJ1ZltpXVxuICAgIHN0ciArPSAoKGJ5dCAmIDB4RjApID4+PiA0KS50b1N0cmluZygxNilcbiAgICBzdHIgKz0gKGJ5dCAmIDB4MEYpLnRvU3RyaW5nKDE2KVxuICB9XG5cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiB0b191dGYoYnVmKSB7XG4gIHJldHVybiB0b3V0ZjgoYnVmKVxufVxuXG5mdW5jdGlvbiB0b19iYXNlNjQoYnVmKSB7XG4gIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHdyaXRlVUludDg6ICAgICAgd3JpdGVfdWludDhcbiAgLCB3cml0ZUludDg6ICAgICAgIHdyaXRlX2ludDhcbiAgLCB3cml0ZVVJbnQxNkxFOiAgIHdyaXRlX3VpbnQxNl9sZVxuICAsIHdyaXRlVUludDMyTEU6ICAgd3JpdGVfdWludDMyX2xlXG4gICwgd3JpdGVJbnQxNkxFOiAgICB3cml0ZV9pbnQxNl9sZVxuICAsIHdyaXRlSW50MzJMRTogICAgd3JpdGVfaW50MzJfbGVcbiAgLCB3cml0ZUZsb2F0TEU6ICAgIHdyaXRlX2Zsb2F0X2xlXG4gICwgd3JpdGVEb3VibGVMRTogICB3cml0ZV9kb3VibGVfbGVcbiAgLCB3cml0ZVVJbnQxNkJFOiAgIHdyaXRlX3VpbnQxNl9iZVxuICAsIHdyaXRlVUludDMyQkU6ICAgd3JpdGVfdWludDMyX2JlXG4gICwgd3JpdGVJbnQxNkJFOiAgICB3cml0ZV9pbnQxNl9iZVxuICAsIHdyaXRlSW50MzJCRTogICAgd3JpdGVfaW50MzJfYmVcbiAgLCB3cml0ZUZsb2F0QkU6ICAgIHdyaXRlX2Zsb2F0X2JlXG4gICwgd3JpdGVEb3VibGVCRTogICB3cml0ZV9kb3VibGVfYmVcbn1cblxudmFyIG1hcCA9IHJlcXVpcmUoJy4vbWFwcGVkLmpzJylcblxuZnVuY3Rpb24gd3JpdGVfdWludDgodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgcmV0dXJuIHRhcmdldFthdF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiB3cml0ZV9pbnQ4KHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHJldHVybiB0YXJnZXRbYXRdID0gdmFsdWUgPCAwID8gdmFsdWUgKyAweDEwMCA6IHZhbHVlXG59XG5cbmZ1bmN0aW9uIHdyaXRlX3VpbnQxNl9sZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRVaW50MTYoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX3VpbnQzMl9sZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRVaW50MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX2ludDE2X2xlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldEludDE2KGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCB0cnVlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV9pbnQzMl9sZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRJbnQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfZmxvYXRfbGUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0RmxvYXQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfZG91YmxlX2xlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldEZsb2F0NjQoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIHRydWUpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX3VpbnQxNl9iZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRVaW50MTYoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV91aW50MzJfYmUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0VWludDMyKGF0ICsgdGFyZ2V0LmJ5dGVPZmZzZXQsIHZhbHVlLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gd3JpdGVfaW50MTZfYmUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0SW50MTYoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV9pbnQzMl9iZSh0YXJnZXQsIHZhbHVlLCBhdCkge1xuICB2YXIgZHYgPSBtYXAuZ2V0KHRhcmdldCk7XG4gIHJldHVybiBkdi5zZXRJbnQzMihhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIHdyaXRlX2Zsb2F0X2JlKHRhcmdldCwgdmFsdWUsIGF0KSB7XG4gIHZhciBkdiA9IG1hcC5nZXQodGFyZ2V0KTtcbiAgcmV0dXJuIGR2LnNldEZsb2F0MzIoYXQgKyB0YXJnZXQuYnl0ZU9mZnNldCwgdmFsdWUsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiB3cml0ZV9kb3VibGVfYmUodGFyZ2V0LCB2YWx1ZSwgYXQpIHtcbiAgdmFyIGR2ID0gbWFwLmdldCh0YXJnZXQpO1xuICByZXR1cm4gZHYuc2V0RmxvYXQ2NChhdCArIHRhcmdldC5ieXRlT2Zmc2V0LCB2YWx1ZSwgZmFsc2UpXG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvcXJjb2RlLWRyYXcuanMnKTtcbiIsIjsoZnVuY3Rpb24oZG9jKXtcbiAgICB2YXIgYm9keSA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdO1xuICAgIHZhciBzaWRlQmFyQ292ZXIgPSBkb2MuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtc2lkZUJhckNvdmVyJylbMF07XG4gICAgdmFyIG1haW5Db250ZW50ID0gc2lkZUJhckNvdmVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLW1haW4tY29udGVudCcpWzBdO1xuICAgIHZhciBtZW51QnRuID0gZG9jLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLXNob3dTaWRlQmFyJylbMF07XG4gICAgdmFyIHNpZGViYXIgPSBkb2MuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtc2lkZWJhcicpWzBdO1xuICAgIHZhciBhY3Rpb25DbGFzcyA9IE1vZGVybml6ci5jc3N0cmFuc2Zvcm1zM2QgPyAnIGlzLXNob3dTaWRlQmFyJyA6ICcgaXMtc2hvd1NpZGVCYXItLW9sZCc7XG5cbiAgICB2YXIgc2Nyb2xsQ3RybCA9IGRvYy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy1zY3JvbGxDdHJsJylbMF07XG4gICAgdmFyIHRvVG9wQnRuID0gZG9jLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLXRvVG9wJylbMF07XG4gICAgdmFyIHRyYW5zaXRpb25FdnQgPSByZXF1aXJlKCcuL21vZHVsZXMvdHJhbnNpdGlvbmVuZC5qcycpKHNpZGVCYXJDb3Zlcik7XG4gICAgdmFyIHNjcm9sbDJUb3AgPSByZXF1aXJlKCcuL21vZHVsZXMvc2Nyb2xsMlRvcC5qcycpO1xuICAgIHZhciB0cmFuc2l0aW9uSGFuZGxlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHNpZGViYXIuc3R5bGUuekluZGV4ID0gMTtcbiAgICAgICAgc2lkZUJhckNvdmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIodHJhbnNpdGlvbkV2dCwgdHJhbnNpdGlvbkhhbmRsZXIpO1xuICAgIH07XG5cblxuICAgIG1lbnVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgY2xhc3NOYW1lID0gc2lkZUJhckNvdmVyLmNsYXNzTmFtZTtcbiAgICAgICAgdmFyIGluZGV4ID0gY2xhc3NOYW1lLmluZGV4T2YoYWN0aW9uQ2xhc3MpO1xuICAgICAgICBpZihpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICBzaWRlQmFyQ292ZXIuY2xhc3NOYW1lID0gY2xhc3NOYW1lLnNsaWNlKDAsIGluZGV4KSArIGNsYXNzTmFtZS5zbGljZShpbmRleCthY3Rpb25DbGFzcy5sZW5ndGgpO1xuICAgICAgICAgICAgc2lkZWJhci5zdHlsZS56SW5kZXggPSAtMTtcbiAgICAgICAgfSBlbHNlIGlmKGluZGV4IDw9IC0xKSB7XG4gICAgICAgICAgICBzaWRlYmFyLnNjcm9sbFRvcCA9IDA7XG4gICAgICAgICAgICBzaWRlQmFyQ292ZXIuY2xhc3NOYW1lICs9IGFjdGlvbkNsYXNzO1xuICAgICAgICAgICAgc2lkZUJhckNvdmVyLmFkZEV2ZW50TGlzdGVuZXIodHJhbnNpdGlvbkV2dCwgdHJhbnNpdGlvbkhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBzaWRlQmFyQ292ZXIuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGJvZHlIZWlnaHQgPSBtYWluQ29udGVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIGlmKHNpZGVCYXJDb3Zlci5zY3JvbGxUb3AgPj0gYm9keUhlaWdodCoyLzcpIHtcbiAgICAgICAgICAgIGlmKHNjcm9sbEN0cmwuY2xhc3NOYW1lLmluZGV4T2YoJyBpcy1zaG93JykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNjcm9sbEN0cmwuY2xhc3NOYW1lICs9ICcgaXMtc2hvdyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihzY3JvbGxDdHJsLmNsYXNzTmFtZS5pbmRleE9mKCcgaXMtc2hvdycpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBzY3JvbGxDdHJsLmNsYXNzTmFtZTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGNsYXNzTmFtZS5pbmRleE9mKCcgaXMtc2hvdycpO1xuICAgICAgICAgICAgc2Nyb2xsQ3RybC5jbGFzc05hbWUgPSBjbGFzc05hbWUuc2xpY2UoMCwgaW5kZXgpICsgY2xhc3NOYW1lLnNsaWNlKGluZGV4ICsgJyBpcy1zaG93Jy5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b1RvcEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNjcm9sbDJUb3Aoc2lkZUJhckNvdmVyLCA5MDApO1xuICAgIH0pO1xuXG4vLyAgaW5pdCBzaGFyZUtpdFxuICAgIHZhciBTSztcbiAgICB2YXIgc2s7XG4gICAgdmFyIHd4QnRuO1xuICAgIHZhciB3eFFSQ29kZTtcbiAgICBpZihkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy1zaGFyZUtpdFdyYXAnKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIFNLID0gcmVxdWlyZSgnLi9tb2R1bGVzL3NoYXJlS2l0LmpzJyk7XG4gICAgICAgIHNrID0gbmV3IFNLKHtcbiAgICAgICAgICAgIHR3aXR0ZXJOYW1lOiAnc3VuYWl3ZW4nXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhzay5kZXZpY2UpO1xuICAgICAgICBpZihzay5kZXZpY2UgPT09ICdwYycpIHtcbiAgICAgICAgICAgIHd4QnRuID0gZG9jLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLWJsb2ctd3hCdG4nKVswXTtcbiAgICAgICAgICAgIHd4UVJDb2RlID0gZG9jLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLWJsb2ctd3hRUkNvZGUnKVswXTtcbiAgICAgICAgICAgIHd4QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB3eFFSQ29kZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd3hRUkNvZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHd4UVJDb2RlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfVxufSkoZG9jdW1lbnQpOyIsIjsoZnVuY3Rpb24oKXtcbi8vICAgIGdldCB0aGUgcHJlZml4IG9yIG5vbi1wcmVmaXggcmFmXG4gICAgdmFyIGFuaW1hdGUgPSAoZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGFjdGlvbiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJ1bm5lcil7XG4gICAgICAgICAgICBhY3Rpb24uY2FsbCh3aW5kb3csIHJ1bm5lcik7XG4gICAgICAgIH07XG4gICAgfSkoKTtcblxuLy8gICAgZ2V0IG9yIHNldCB0aGUgc2Nyb2xsVG9wIHZhbHVlXG4gICAgdmFyIHNjcm9sbFRvcCA9IGZ1bmN0aW9uKGNvbXBvbmVudCwgbmV4dFN0ZXApe1xuICAgICAgICBpZihuZXh0U3RlcCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gY29tcG9uZW50LnNjcm9sbFkgIT0gbnVsbCA/IGNvbXBvbmVudC5zY3JvbGxZIDogY29tcG9uZW50LnNjcm9sbFRvcDtcbiAgICAgICAgfSBlbHNlIGlmKG5leHRTdGVwIDw9IDApIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5zY3JvbGxUbyA/IGNvbXBvbmVudC5zY3JvbGxUbygwLCAwKTpjb21wb25lbnQuc2Nyb2xsVG9wID0gMDtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcG9uZW50LnNjcm9sbFRvID8gY29tcG9uZW50LnNjcm9sbFRvKDAsIG5leHRTdGVwKSA6IGNvbXBvbmVudC5zY3JvbGxUb3AgPSBuZXh0U3RlcDtcbiAgICAgICAgICAgIHJldHVybiBuZXh0U3RlcDtcbiAgICAgICAgfVxuICAgIH07XG5cbi8vICAgIHNldCBzcGVlZFxuICAgIHZhciBzcGVlZENvbmR1Y3QgPSBmdW5jdGlvbihvcmlnaW5TcGVlZCwgdGltZSwgY3VyLCB0b3RhbCl7XG4gICAgICAgIGlmKHRvdGFsID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWV0aG9kID0gTWF0aC5zaW47XG4gICAgICAgIHZhciBQSSA9IE1hdGguUEk7XG4gICAgICAgIHZhciBJTklUX1NQRUVEID0gMjtcbiAgICAgICAgcmV0dXJuIG9yaWdpblNwZWVkICogbWV0aG9kKFBJICogKHRvdGFsLWN1cikvdG90YWwpICsgSU5JVF9TUEVFRDtcbiAgICB9O1xuXG4gICAgdmFyIHNjcm9sbDJUb3AgPSBmdW5jdGlvbihjb21wb25lbnQsIHRpbWUpe1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FID0gMTAwMDtcbiAgICAgICAgaWYoY29tcG9uZW50ID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1lvdSBtdXN0IGFzc2lnbiBhIGRvbSBub2RlIG9iamVjdCBvciB3aW5kb3cgb2JqZWN0IGFzIHRoZSBmaXJzdCBwYXJhbS4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZih0aW1lID09IG51bGwpIHtcbiAgICAgICAgICAgIHRpbWUgPSBERUZBVUxUX1RJTUU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9yaWdpblkgPSBzY3JvbGxUb3AoY29tcG9uZW50KTtcbiAgICAgICAgdmFyIGN1cnJlbnRZID0gb3JpZ2luWTtcbiAgICAgICAgdmFyIG9yaWdpblNwZWVkID0gb3JpZ2luWSAvICh0aW1lIC8gNjApO1xuICAgICAgICB2YXIgY3VycmVudFNwZWVkO1xuICAgICAgICAoZnVuY3Rpb24gb3BlcmF0ZSgpe1xuICAgICAgICAgICAgY3VycmVudFNwZWVkID0gc3BlZWRDb25kdWN0KG9yaWdpblNwZWVkLCB0aW1lLCBjdXJyZW50WSwgb3JpZ2luWSk7XG4gICAgICAgICAgICBjdXJyZW50WSAtPSBjdXJyZW50U3BlZWQ7XG4gICAgICAgICAgICBpZihzY3JvbGxUb3AoY29tcG9uZW50LCBjdXJyZW50WSkgIT09IDApIHtcbiAgICAgICAgICAgICAgICBhbmltYXRlKG9wZXJhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSgpO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHNjcm9sbDJUb3A7XG59KSgpOyIsIjsoZnVuY3Rpb24oKXtcbiAgICB2YXIgUVJDb2RlID0gcmVxdWlyZSgncXJjb2RlJyk7XG4gICAgdmFyIFNLID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICAgIHRoaXMuYmFzZUNvbmYgPSB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZGV2aWNlID0gdGhpcy5kZXRlY3REZXZpY2UobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICAgIHRoaXMuaW5pdEVsZSh0aGlzLmJhc2VDb25mLnByZWZpeCk7XG4gICAgICAgIHRoaXMuYmluZCh0aGlzLnF6RWxlLCB0aGlzLnF6b25lRnVuYyk7XG4gICAgICAgIHRoaXMuYmluZCh0aGlzLnR3RWxlLCB0aGlzLnR3aXR0ZXJGdW5jKTtcbiAgICAgICAgLy90aGlzLmJpbmQodGhpcy53YkVsZSwgdGhpcy53ZWlib0Z1bmMpO1xuICAgICAgICB0aGlzLndlaWJvRnVuYyh0aGlzKTtcbiAgICAgICAgdGhpcy5iaW5kKHRoaXMud3hFbGUsIHRoaXMud2VjaGF0RnVuYyk7XG4gICAgfTtcbiAgICBTSy5wcm90b3R5cGUuaW5pdEVsZSA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgICAgICB0aGlzLndyYXBFbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeClbMF07XG4gICAgICAgIHRoaXMucXpFbGUgPSB0aGlzLndyYXBFbGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytwcmVmaXgrJy1xem9uZScpWzBdO1xuICAgICAgICB0aGlzLndiRWxlID0gdGhpcy53cmFwRWxlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLScrcHJlZml4Kyctd2VpYm8nKVswXTtcbiAgICAgICAgdGhpcy50d0VsZSA9IHRoaXMud3JhcEVsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeCsnLXR3aXR0ZXInKVswXTtcbiAgICAgICAgdGhpcy53eEVsZSA9IHRoaXMud3JhcEVsZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy0nK3ByZWZpeCsnLXdlY2hhdCcpWzBdO1xuICAgIH07XG5cbiAgICBTSy5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKGVsZSwgaGFuZGxlcil7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgZWxlLm9uY2xpY2sgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGhhbmRsZXIoc2VsZik7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIFNLLnByb3RvdHlwZS5vcGVuV2luID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICAgIC8vIHVybCBjYW5ub3QgYmUgZW1wdHlcbiAgICAgICAgaWYob3B0aW9ucy51cmwgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVGhlIHVybCB0byBvcGVuIGhhdmUgdG8gYmUgcGFzc2VkIGluLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0ZW1wID0ge307XG4gICAgICAgIHZhciB0aXRsZSA9IG9wdGlvbnMudGl0bGUgfHwgJ3NoYXJlS2l0XFwncyB3aW5kb3cnO1xuICAgICAgICB2YXIgdXJsID0gb3B0aW9ucy51cmw7XG4gICAgICAgIHZhciB3aW5kb3dDb25mPScnO1xuICAgICAgICBmb3IodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZihvcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB0ZW1wW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlIHRlbXAudGl0bGU7XG4gICAgICAgIGRlbGV0ZSB0ZW1wLnVybDtcbiAgICAgICAgaWYodGVtcC52aWEgIT0gbnVsbCkge1xuICAgICAgICAgICAgZGVsZXRlIHRlbXAudmlhO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRlbXAudGV4dCAhPSBudWxsKSB7XG4gICAgICAgICAgICBkZWxldGUgdGVtcC50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIGlmKHRlbXAuY291bnRVcmwgIT0gbnVsbCl7XG4gICAgICAgICAgICBkZWxldGUgdGVtcC5jb3VudFVybDtcbiAgICAgICAgfVxuICAgICAgICBmb3Ioa2V5IGluIHRlbXApIHtcbiAgICAgICAgICAgIHdpbmRvd0NvbmYgKz0gKGtleSsnPScrdGVtcFtrZXldKycsJyk7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93Q29uZiA9IHdpbmRvd0NvbmYuc2xpY2UoMCwtMSk7XG4gICAgICAgIHdpbmRvdy5vcGVuKHVybCwgdGl0bGUsIHdpbmRvd0NvbmYpO1xuICAgIH07XG5cbiAgICAvLyBxem9uZSBzaGFyZSBoYW5kbGVyXG4gICAgU0sucHJvdG90eXBlLnF6b25lRnVuYyA9IGZ1bmN0aW9uKHNlbGYpe1xuICAgICAgICB2YXIgY29uZiA9IHNlbGYuZ2V0T3B0aW9uKCk7XG4gICAgICAgIHZhciBwID0ge1xuICAgICAgICAgICAgdXJsOiBjb25mLmxpbmssXG4gICAgICAgICAgICBzaG93Y291bnQ6JzEnLC8q5piv5ZCm5pi+56S65YiG5Lqr5oC75pWwLOaYvuekuu+8micxJ++8jOS4jeaYvuekuu+8micwJyAqL1xuICAgICAgICAgICAgZGVzYzogJycsLyrpu5jorqTliIbkuqvnkIbnlLEo5Y+v6YCJKSovXG4gICAgICAgICAgICBzdW1tYXJ5OiBjb25mLmRlc2MsLyrliIbkuqvmkZjopoEo5Y+v6YCJKSovXG4gICAgICAgICAgICB0aXRsZTogY29uZi50aXRsZSwvKuWIhuS6q+agh+mimCjlj6/pgIkpKi9cbiAgICAgICAgICAgIHNpdGU6JycsLyrliIbkuqvmnaXmupAg5aaC77ya6IW+6K6v572RKOWPr+mAiSkqL1xuICAgICAgICAgICAgcGljczonJywgLyrliIbkuqvlm77niYfnmoTot6/lvoQo5Y+v6YCJKSovXG4gICAgICAgICAgICBzdHlsZTonMjAzJyxcbiAgICAgICAgICAgIHdpZHRoOjk4LFxuICAgICAgICAgICAgaGVpZ2h0OjIyXG4gICAgICAgIH07XG4gICAgICAgIHZhciBsaW5rO1xuICAgICAgICBsaW5rID0gdXJsQ29uY2F0KHAsICdodHRwOi8vc25zLnF6b25lLnFxLmNvbS9jZ2ktYmluL3F6c2hhcmUvY2dpX3F6c2hhcmVfb25la2V5Jyk7XG4gICAgICAgIHNlbGYub3Blbldpbih7XG4gICAgICAgICAgICB1cmw6IGxpbmssXG4gICAgICAgICAgICB0aXRsZTogJ1NoYXJpbmcgdG8gUXpvbmUnLFxuICAgICAgICAgICAgdG9vbGJhcjogJ25vJyxcbiAgICAgICAgICAgIHJlc2l6YWJsZTogJ25vJyxcbiAgICAgICAgICAgIHN0YXR1czogJ25vJyxcbiAgICAgICAgICAgIG1lbnViYXI6ICdubycsXG4gICAgICAgICAgICBzY3JvbGxiYXJzOiAnbm8nLFxuICAgICAgICAgICAgaGVpZ2h0OiA2NTAsXG4gICAgICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICAgICAgbGVmdDogMjAwLFxuICAgICAgICAgICAgdG9wOiA1MFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4vLyAgICB3ZWlibyBzaGFyZSBoYW5kbGVyXG4gICAgU0sucHJvdG90eXBlLndlaWJvRnVuYyA9IGZ1bmN0aW9uKHNlbGYpe1xuICAgICAgICB2YXIgY29uZiA9IHNlbGYuZ2V0T3B0aW9uKCk7XG4gICAgICAgIHZhciBkZWZhdWx0VGV4dCA9IGNvbmYudGl0bGUrJy0tJytjb25mLmRlc2MrJzogJytjb25mLmxpbms7XG4gICAgICAgIC8vICAgIGluaXQgd2VpYm8gZWxlbWVudCdzIGlkXG4gICAgICAgIHNlbGYud2JFbGUuaWQgPSAnd2JfcHVibGlzaCc7XG4gICAgICAgIFdCMi5hbnlXaGVyZShmdW5jdGlvbihXKXtcbiAgICAgICAgICAgIFcud2lkZ2V0LnB1Ymxpc2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjoncHVibGlzaCcsXG4gICAgICAgICAgICAgICAgdHlwZTond2ViJyxcbiAgICAgICAgICAgICAgICByZWZlcjoneScsXG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2U6J3poX2NuJyxcbiAgICAgICAgICAgICAgICBidXR0b25fdHlwZToncmVkJyxcbiAgICAgICAgICAgICAgICBidXR0b25fc2l6ZTonbWlkZGxlJyxcbiAgICAgICAgICAgICAgICBhcHBrZXk6JzMxMjUyNjU3NDgnLFxuICAgICAgICAgICAgICAgIGlkOiAnd2JfcHVibGlzaCcsXG4gICAgICAgICAgICAgICAgdWlkOiAnMTYyNDExODcxNycsXG4gICAgICAgICAgICAgICAgZGVmYXVsdF90ZXh0OiBkZWZhdWx0VGV4dFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbi8vICAgIHR3aXR0ZXIgc2hhcmUgaGFuZGxlclxuICAgIFNLLnByb3RvdHlwZS50d2l0dGVyRnVuYyA9IGZ1bmN0aW9uKHNlbGYpe1xuICAgICAgICB2YXIgY29uZiA9IHNlbGYuZ2V0T3B0aW9uKCk7XG4gICAgICAgIHZhciBzaGFyZVVybCA9ICdodHRwczovL3R3aXR0ZXIuY29tL3NoYXJlJztcbiAgICAgICAgdmFyIHNoYXJlT2JqID0ge1xuICAgICAgICAgICAgdXJsOiBjb25mLmxpbmssXG4gICAgICAgICAgICB0ZXh0OiBjb25mLnRpdGxlICsnIC0gJytjb25mLmRlc2MsXG4gICAgICAgICAgICBjb3VudFVybDogY29uZi5saW5rLFxuICAgICAgICAgICAgdmlhOiBjb25mLnR3aXR0ZXJOYW1lIHx8ICcnXG4gICAgICAgIH07XG4gICAgICAgIHNoYXJlVXJsID0gdXJsQ29uY2F0KHNoYXJlT2JqLCBzaGFyZVVybCk7XG4gICAgICAgIGNvbmYudGl0bGUgPSAnU2hhcmluZyB0byBUd2l0dGVyJztcbiAgICAgICAgc2VsZi5vcGVuV2luKHtcbiAgICAgICAgICAgIHVybDogc2hhcmVVcmwsXG4gICAgICAgICAgICB0aXRsZTogY29uZi50aXRsZSxcbiAgICAgICAgICAgIHRvb2xiYXI6ICdubycsXG4gICAgICAgICAgICByZXNpemFibGU6ICdubycsXG4gICAgICAgICAgICBtZW51YmFyOiAnbm8nLFxuICAgICAgICAgICAgc2Nyb2xsYmFyczogJ25vJyxcbiAgICAgICAgICAgIGhlaWdodDogNjUwLFxuICAgICAgICAgICAgd2lkdGg6IDYwMCxcbiAgICAgICAgICAgIGxlZnQ6IDIwMCxcbiAgICAgICAgICAgIHRvcDogNTBcbiAgICAgICAgfSk7XG4gICAgfTtcblxuLy8gICAgd2VjaGF0IHNoYXJlIEhhbmRsZXJcbiAgICBTSy5wcm90b3R5cGUud2VjaGF0RnVuYyA9IGZ1bmN0aW9uKHNlbGYpe1xuICAgICAgICB2YXIgY29uZiA9IHNlbGYuYmFzZUNvbmY7XG4gICAgICAgIHZhciBxcmNvZGU7XG4gICAgICAgIHZhciB3Y0NhbnZhcztcbiAgICAgICAgdmFyIHNoYXJlUmVhZHk7XG4gICAgICAgIHZhciB3eE9iajtcbiAgICAgICAgaWYoc2VsZi5kZXZpY2UgPT09ICdwaG9uZScpIHtcbiAgICAgICAgICAgIHd4T2JqID0ge307XG4gICAgICAgICAgICB3eE9iai50aXRsZSA9IGNvbmYudGl0bGU7XG4gICAgICAgICAgICB3eE9iai5saW5rID0gY29uZi5saW5rO1xuICAgICAgICAgICAgd3hPYmouZGVzYyA9IGNvbmYuZGVzYztcbiAgICAgICAgICAgIHd4T2JqLmltZ191cmwgPSBjb25mLnBvcnRyYWl0O1xuICAgICAgICAgICAgc2hhcmVSZWFkeSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgV2VpeGluSlNCcmlkZ2Uub24oJ21lbnU6c2hhcmU6YXBwbWVzc2FnZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIFdlaXhpbkpTQnJpZGdlLmludm9rZSgnc2VuZEFwcE1lc3NhZ2UnLCB3eE9iaixmdW5jdGlvbigpe30pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgV2VpeGluSlNCcmlkZ2Uub24oJ21lbnU6c2hhcmU6dGltZWxpbmUnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBXZWl4aW5KU0JyaWRnZS5pbnZva2UoJ3NoYXJlVGltZWxpbmUnLCB3eE9iaiwgZnVuY3Rpb24oKXt9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZih0eXBlb2YgV2VpeGluSlNCcmlkZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignV2VpeGluSlNCcmlkZ2VSZWFkeScsIHNoYXJlUmVhZHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaGFyZVJlYWR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZihzZWxmLmRldmljZSA9PT0gJ3BjJykge1xuICAgICAgICAgICAgd2NDYW52YXMgPSBzZWxmLndyYXBFbGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnanMtJytjb25mLnByZWZpeCsnLXdlY2hhdC1RUkNvZGUnKVswXTtcbiAgICAgICAgICAgIHFyY29kZSA9IG5ldyBRUkNvZGUuUVJDb2RlRHJhdygpO1xuICAgICAgICAgICAgcXJjb2RlLmRyYXcod2NDYW52YXMsIGxvY2F0aW9uLmhyZWYsIGZ1bmN0aW9uKGVycm9yLCBjYW52YXMpe30pO1xuICAgICAgICB9XG4gICAgfTtcblxuLy8gICAgbWFrZSB0aGUgYmFzZSBkYXRhXG4gICAgU0sucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICB2YXIgYmFzZUNvbmYgPSB7fTtcbiAgICAgICAgaWYob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gYmFzZUNvbmY7XG4gICAgICAgIH1cbiAgICAgICAgaWYob3B0aW9ucy50aXRsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlQ29uZi50aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZUNvbmYudGl0bGUgPSBvcHRpb25zLnRpdGxlO1xuICAgICAgICB9XG4gICAgICAgIGlmKG9wdGlvbnMubGluayA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5saW5rID0gbG9jYXRpb24uaHJlZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhc2VDb25mLmxpbmsgPSBvcHRpb25zLmxpbms7XG4gICAgICAgIH1cbiAgICAgICAgaWYob3B0aW9ucy5kZXNjID09IG51bGwpIHtcbiAgICAgICAgICAgIGJhc2VDb25mLmRlc2MgPSBmaW5kRGVzYygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZUNvbmYuZGVzYyA9IG9wdGlvbnMuZGVzYztcbiAgICAgICAgfVxuICAgICAgICBpZihvcHRpb25zLnR3aXR0ZXJOYW1lICE9IG51bGwpIHtcbiAgICAgICAgICAgIGJhc2VDb25mLnR3aXR0ZXJOYW1lID0gb3B0aW9ucy50d2l0dGVyTmFtZTtcbiAgICAgICAgfVxuICAgICAgICBpZihvcHRpb25zLnByZWZpeCA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlQ29uZi5wcmVmaXggPSAnc2hhcmVLaXQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZUNvbmYucHJlZml4ID0gb3B0aW9ucy5wcmVmaXg7XG4gICAgICAgIH1cbiAgICAgICAgaWYob3B0aW9ucy5wb3J0cmFpdCA9PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zLnBvcnRyYWl0ID0gJ2h0dHA6Ly91c3VhbGltYWdlcy5xaW5pdWRuLmNvbS8xLmpwZWcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmFzZUNvbmYucG9ydHJhaXQgPSBvcHRpb25zLnBvcnRyYWl0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNlQ29uZjtcbiAgICB9O1xuXG4gICAgLy8gcmV0dXJuIGEgY29weSBvZiBvcHRpb24gb2JqZWN0XG4gICAgU0sucHJvdG90eXBlLmdldE9wdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByZSA9IHt9O1xuICAgICAgICBmb3IodmFyIGtleSBpbiB0aGlzLmJhc2VDb25mKSB7XG4gICAgICAgICAgICByZVtrZXldID0gdGhpcy5iYXNlQ29uZltrZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZTtcbiAgICB9O1xuXG4gICAgLy8gZGV0ZWN0IGRldmljZSB0eXBlXG4gICAgU0sucHJvdG90eXBlLmRldGVjdERldmljZSA9IGZ1bmN0aW9uKHVhKXtcbiAgICAgICAgaWYodWEubWF0Y2goL2lwaG9uZXxpcGFkfGFuZHJvaWQvZ2kpICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiAncGhvbmUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICdwYyc7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZmluZERlc2MoKXtcbiAgICAgICAgdmFyIG1ldGFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ21ldGEnKTtcbiAgICAgICAgdmFyIG1ldGE7XG4gICAgICAgIGZvcih2YXIgaT0wOyBpPCBtZXRhcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbWV0YSA9IG1ldGFzW2ldO1xuICAgICAgICAgICAgaWYobWV0YS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSA9PT0gJ2Rlc2NyaXB0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXRhLmdldEF0dHJpYnV0ZSgnY29udGVudCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4vLyAgICBjb25jYXQgdXJsIGFuZCBxdWVyeSBkYXRhXG4gICAgdmFyIHVybENvbmNhdCA9IGZ1bmN0aW9uKG8sIHVybCl7XG4gICAgICAgIHZhciBzID0gW107XG4gICAgICAgIGZvcih2YXIgaSBpbiBvKXtcbiAgICAgICAgICAgIHMucHVzaChpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9baV18fCcnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVybCArICc/JyArIHMuam9pbignJicpO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFNLO1xufSkoKTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRlc3RFbGUpe1xuICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nIDogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgICAnTW96VHJhbnNpdGlvbicgICAgOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdPVHJhbnNpdGlvbicgICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICd0cmFuc2l0aW9uJyAgICAgICA6ICd0cmFuc2l0aW9uZW5kJ1xuICAgIH07XG5cbiAgICBmb3IodmFyIHQgaW4gdHJhbnNpdGlvbnMpe1xuICAgICAgICBpZih0ZXN0RWxlLnN0eWxlW3RdICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zaXRpb25zW3RdO1xuICAgICAgICB9XG4gICAgfVxufTsiXX0=
