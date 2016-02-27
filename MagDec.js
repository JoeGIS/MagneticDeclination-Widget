/////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////--------MagDec.js-------//////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
// 
// Version: 1.1
// Author: Joseph Rogan (joseph.rogan@forces.gc.ca canadajebus@gmail.com)
// 
// Credits: Modified from code create by Christopher Weiss (cmweiss@gmail.com) Copyright 2012
// Adapted from the geomagc software and World Magnetic Model of the NOAA
// Satellite and Information Service, National Geophysical Data Center
// http://www.ngdc.noaa.gov/geomag/WMM/DoDWMM.shtml
// 
// This reusable widget allows the user to calculate magnetic declination at the point 
// of the mouse hover.
// 
// on(mainMap, "load", function() {
//        //MagDec widget Example
//        var magDec = new MagDec({
//            map: mainMap
//            }, "MagDecWindow");
//        magDec.startup();
//    });
//
// Changes:
// Version 1.1
//  -Added .magDecWidget { white-space: nowrap; min-width: 300px; } to css file
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

define([
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin", 
    
    "dojo/_base/declare",
    "dojo/_base/lang", 
    "dojo/on",
    "require",
    
    "esri/geometry/webMercatorUtils", 
    
    "dojo/text!./MagDec/WMM.html",
    
    "dojo/text!./MagDec/templates/MagDec.html",
    
    "dojo/domReady!"

], function(_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, 
    declare, lang, on, require, 
    webMercatorUtils, 
    cof, 
    dijitTemplate)
{
    
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        
        // Set the template .html file
        templateString: dijitTemplate,
        
        // Path to the templates .css file
        css_path: require.toUrl("./MagDec/css/MagDec.css"),
        
        // Vars
        cof: cof, 
        wmm: null, 
        
        maxord: null, 
        tc: null, 
        tc: null, 
        sp: null, 
        cp: null, 
        pp: null, 
        p: null, 
        dp: null, 
        a: null, 
        b: null, 
        re: null, 
        a2: null, 
        b2: null, 
        c2: null, 
        a4: null, 
        b4: null, 
        c4: null, 
        c: null, 
        cd: null, 
        k: null, 
        fn: null, 
        fm: null, 
        
        
        
        
        // The defaults
        defaults: {
            map: null, 
            theme: "magDecWidget",
            autoUpdate: true
        },
        
        
        // Called when the widget is declared as new object
        constructor: function(options) {
            // Mix in the given options with the defaults
            var properties = lang.mixin({}, this.defaults, options);
            this.set(properties);
            
            this.css = {
                valuesDiv: "valuesDiv",
                attribute: "attribute", 
                value: "value", 
                smallText: "smallText", 
                warning: "warning"
            };
            
            
        },
        
        
        // Called after the widget is created
        postCreate: function() {
            this.inherited(arguments);
            
        },
        
        
        // Called when the widget.startup() is used to view the widget
        startup: function() {
            this.inherited(arguments);
            
            // Calculate the model and initial math
            this.wmm = this._cof2Obj(this.cof)
            this._geoMagFactory(this.wmm);
            
            
            // Wire events for the mouse move
            var _this = this;
            on(this.map, "mouse-move", function (evt, $_this) {
                if (_this.autoUpdate) _this._mapMoveCalc(evt, _this);
                });
            on(this.map, "mouse-drag", function (evt, $_this) {
                if (_this.autoUpdate) _this._mapMoveCalc(evt, _this);
                });
            
            // Wire event for pausing updates with the keyboard
            on(this.map, "key-down", function (evt, $_this) {
                if (evt.keyCode == 32)
                {
                    if (_this.autoUpdate) _this.autoUpdate = false;
                    else _this.autoUpdate = true;
                }
                });
            
            
        },
        
        
        
        // Calculates geo mag on a map move event
        _mapMoveCalc: function(evt, _this) {
            
            // Get the map coordinates in lat/lon
            var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
            
            // Get the inputs
            var latitude = mp.y.toFixed(5);
            var longitude = mp.x.toFixed(5);
            var altitude = 0;
            var time = new Date();
            
            // Calculate geo mag
            var myGeoMag = _this.geoMag(latitude, longitude, altitude, time)
            
            // Calculate DMS values of the input lat lon
            var lat = this.DD2DMS(mp.y);
            var lon = this.DD2DMS(mp.x);
            var dec = this.DD2DMS(myGeoMag.dec);
            
            // Update the html
            _this.MagDecLatitude.innerHTML = latitude + " (" + lat.d + "&deg;" + lat.m + "'" + lat.s + "\" " + lat.hemiLat + ")";
            _this.MagDecLongitude.innerHTML = longitude + " (" + lon.d + "&deg;" + lon.m + "'" + lon.s + "\" " + lon.hemiLon + ")";
            
            var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            _this.MagDecDate.innerHTML = time.getDate() + " " + months[time.getMonth()] + " " + time.getFullYear();
            
            _this.MagDecDeclination.innerHTML = Math.round(100*myGeoMag.dec)/100 + " (" + dec.d + "&deg;" + dec.m + "' " + dec.hemiLon + ")";
            _this.MagDecHorizontalIntensity.innerHTML = Math.round(myGeoMag.bh) + " nT";
            
            // Warning message if required
            if (myGeoMag.bh < 5000 & myGeoMag.bh > 1000)
            {
                this.Warning.innerHTML = "Warning: The horizontal field strength at this<br/>location is only " + Math.round(myGeoMag.bh) + " nT (Compass readings have<br/>large uncertainties in areas where H is smaller<br/>than 5000 nT)"
            }
            else if (myGeoMag.bh < 1000)
            {
                this.Warning.innerHTML = "Warning: The horizontal field strength at this<br/>location is only " + Math.round(myGeoMag.bh) + " nT (Compass readings have<br/>VERY LARGE uncertainties in areas where H is<br/>smaller than 1000 nT)"
            }
            else
            {
                this.Warning.innerHTML = "<br/><span class='smallText'>Press <b>spacebar</b> to pause/resume updating.</span><br/><br/>";
            }
            
            
        },
        
        
        // Calculates and returns DMS values from a Decimal Degree value
        DD2DMS: function(value) {
            
            var Abs = Math.abs(value)
            var D = Math.floor(Abs);
            var M = Math.floor( ( Abs - D ) * 60 );
            var S = Math.floor( ( Abs - D - (M/60)) * 60 * 60 );
            var H1 = "North";
            if (value<0) H1 = "South";
            var H2 = "East";
            if (value<0) H2 = "West";
            
            return {d: D, m: M, s: S, hemiLat: H1, hemiLon: H2}
        }, 
        
        
        // Calculates initial math on the model
        _geoMagFactory: function(wmm) {

            var i, model, epoch = wmm.epoch,
                z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.maxord = 12;
                
            this.tc = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                z.slice()];
            this.sp = z.slice();
            this.cp = z.slice();
            this.pp = z.slice();
            this.p = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                z.slice()];
            this.dp = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                z.slice()];
                
            this.a = 6378.137;
            this.b = 6356.7523142;
            this.re = 6371.2;
            this.a2 = this.a * this.a;
            this.b2 = this.b * this.b;
            this.c2 = this.a2 - this.b2;
            this.a4 = this.a2 * this.a2;
            this.b4 = this.b2 * this.b2;
            this.c4 = this.a4 - this.b4;
            
            this.c = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                    z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                    z.slice()];
            this.cd = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                    z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                    z.slice()];
                    
            var n, m;
            var snorm = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                    z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                    z.slice(), z.slice()];
            var j;
            this.k = [z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                    z.slice(), z.slice(), z.slice(), z.slice(), z.slice(), z.slice(),
                    z.slice()];
                    
            var flnmj;
                
            this.fn = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
            this.fm = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            
            var D2;

            this.tc[0][0] = 0;
            this.sp[0] = 0.0;
            this.cp[0] = 1.0;
            this.pp[0] = 1.0;
            this.p[0][0] = 1;
            
            model = wmm.wmm;
            for (i in model) {
                if (model.hasOwnProperty(i)) {
                    if (model[i].m <= model[i].n) {
                        this.c[model[i].m][model[i].n] = model[i].gnm;
                        this.cd[model[i].m][model[i].n] = model[i].dgnm;
                        if (model[i].m !== 0) {
                            this.c[model[i].n][model[i].m - 1] = model[i].hnm;
                            this.cd[model[i].n][model[i].m - 1] = model[i].dhnm;
                        }
                    }
                }
            }
            wmm = null;
            model = null;

            /* CONVERT SCHMIDT NORMALIZED GAUSS COEFFICIENTS TO UNNORMALIZED */
            snorm[0][0] = 1;

            for (n = 1; n <= this.maxord; n++) {
                snorm[0][n] = snorm[0][n - 1] * (2 * n - 1) / n;
                j = 2;

                for (m = 0, D2 = (n - m + 1); D2 > 0; D2--, m++) {
                    this.k[m][n] = (((n - 1) * (n - 1)) - (m * m)) /
                        ((2 * n - 1) * (2 * n - 3));
                    if (m > 0) {
                        flnmj = ((n - m + 1) * j) / (n + m);
                        snorm[m][n] = snorm[m - 1][n] * Math.sqrt(flnmj);
                        j = 1;
                        this.c[n][m - 1] = snorm[m][n] * this.c[n][m - 1];
                        this.cd[n][m - 1] = snorm[m][n] * this.cd[n][m - 1];
                    }
                    this.c[m][n] = snorm[m][n] * this.c[m][n];
                    this.cd[m][n] = snorm[m][n] * this.cd[m][n];
                }
            }
            this.k[1][1] = 0.0;
        }, 
        
        
        // Calculates geo mag properties
        geoMag: function(glat, glon, h, date) {
            
            var alt = (h / 3280.8399) || 0, // convert h (in feet) to kilometers or set default of 0
                time = this._decimalDate(date),
                dt = time - this.wmm.epoch,
                rlat = this._deg2rad(glat),
                rlon = this._deg2rad(glon),
                srlon = Math.sin(rlon),
                srlat = Math.sin(rlat),
                crlon = Math.cos(rlon),
                crlat = Math.cos(rlat),
                srlat2 = srlat * srlat,
                crlat2 = crlat * crlat,
                q,
                q1,
                q2,
                ct,
                st,
                r2,
                r,
                d,
                ca,
                sa,
                aor,
                ar,
                br = 0.0,
                bt = 0.0,
                bp = 0.0,
                bpp = 0.0,
                par,
                temp1,
                temp2,
                parp,
                D4,
                bx,
                by,
                bz,
                bh,
                ti,
                dec,
                dip,
                gv;
            this.sp[1] = srlon;
            this.cp[1] = crlon;
            
            /* CONVERT FROM GEODETIC COORDS. TO SPHERICAL COORDS. */
            q = Math.sqrt(this.a2 - this.c2 * srlat2);
            q1 = alt * q;
            q2 = ((q1 + this.a2) / (q1 + this.b2)) * ((q1 + this.a2) / (q1 + this.b2));
            ct = srlat / Math.sqrt(q2 * crlat2 + srlat2);
            st = Math.sqrt(1.0 - (ct * ct));
            r2 = (alt * alt) + 2.0 * q1 + (this.a4 - this.c4 * srlat2) / (q * q);
            r = Math.sqrt(r2);
            d = Math.sqrt(this.a2 * crlat2 + this.b2 * srlat2);
            ca = (alt + d) / r;
            sa = this.c2 * crlat * srlat / (r * d);
            
            for (m = 2; m <= this.maxord; m++) {
                this.sp[m] = this.sp[1] * this.cp[m - 1] + this.cp[1] * this.sp[m - 1];
                this.cp[m] = this.cp[1] * this.cp[m - 1] - this.sp[1] * this.sp[m - 1];
            }
            
            aor = this.re / r;
            ar = aor * aor;
            
            for (n = 1; n <= this.maxord; n++) {
                ar = ar * aor;
                for (m = 0, D4 = (n + m + 1); D4 > 0; D4--, m++) {
            
            /*
                    COMPUTE UNNORMALIZED ASSOCIATED LEGENDRE POLYNOMIALS
                    AND DERIVATIVES VIA RECURSION RELATIONS
            */
                    if (n === m) {
                        this.p[m][n] = st * this.p[m - 1][n - 1];
                        this.dp[m][n] = st * this.dp[m - 1][n - 1] + ct *
                            this.p[m - 1][n - 1];
                    } else if (n === 1 && m === 0) {
                        this.p[m][n] = ct * this.p[m][n - 1];
                        this.dp[m][n] = ct * this.dp[m][n - 1] - st * this.p[m][n - 1];
                    } else if (n > 1 && n !== m) {
                        if (m > n - 2) { this.p[m][n - 2] = 0; }
                        if (m > n - 2) { this.dp[m][n - 2] = 0.0; }
                        this.p[m][n] = ct * this.p[m][n - 1] - this.k[m][n] * this.p[m][n - 2];
                        this.dp[m][n] = ct * this.dp[m][n - 1] - st * this.p[m][n - 1] -
                            this.k[m][n] * this.dp[m][n - 2];
                    }
            
            /*
                    TIME ADJUST THE GAUSS COEFFICIENTS
            */
            
                    this.tc[m][n] = this.c[m][n] + dt * this.cd[m][n];
                    if (m !== 0) {
                        this.tc[n][m - 1] = this.c[n][m - 1] + dt * this.cd[n][m - 1];
                    }
            
            /*
                    ACCUMULATE TERMS OF THE SPHERICAL HARMONIC EXPANSIONS
            */
                    par = ar * this.p[m][n];
                    if (m === 0) {
                        temp1 = this.tc[m][n] * this.cp[m];
                        temp2 = this.tc[m][n] * this.sp[m];
                    } else {
                        temp1 = this.tc[m][n] * this.cp[m] + this.tc[n][m - 1] * this.sp[m];
                        temp2 = this.tc[m][n] * this.sp[m] - this.tc[n][m - 1] * this.cp[m];
                    }
                    bt = bt - ar * temp1 * this.dp[m][n];
                    bp += (this.fm[m] * temp2 * par);
                    br += (this.fn[n] * temp1 * par);
            /*
                        SPECIAL CASE:  NORTH/SOUTH GEOGRAPHIC POLES
            */
                    if (st === 0.0 && m === 1) {
                        if (n === 1) {
                            pp[n] = pp[n - 1];
                        } else {
                            pp[n] = ct * pp[n - 1] - k[m][n] * pp[n - 2];
                        }
                        parp = ar * pp[n];
                        bpp += (this.fm[m] * temp2 * parp);
                    }
                }
            }
            
            bp = (st === 0.0 ? bpp : bp / st);
            /*
                ROTATE MAGNETIC VECTOR COMPONENTS FROM SPHERICAL TO
                GEODETIC COORDINATES
            */
            bx = -bt * ca - br * sa;
            by = bp;
            bz = bt * sa - br * ca;
            
            /*
                COMPUTE DECLINATION (DEC), INCLINATION (DIP) AND
                TOTAL INTENSITY (TI)
            */
            bh = Math.sqrt((bx * bx) + (by * by));
            ti = Math.sqrt((bh * bh) + (bz * bz));
            dec = this._rad2deg(Math.atan2(by, bx));
            dip = this._rad2deg(Math.atan2(bz, bh));
            
            /*
                COMPUTE MAGNETIC GRID VARIATION IF THE CURRENT
                GEODETIC POSITION IS IN THE ARCTIC OR ANTARCTIC
                (I.E. GLAT > +55 DEGREES OR GLAT < -55 DEGREES)
                OTHERWISE, SET MAGNETIC GRID VARIATION TO -999.0
            */
            
            if (Math.abs(glat) >= 55.0) {
                if (glat > 0.0 && glon >= 0.0) {
                    gv = dec - glon;
                } else if (glat > 0.0 && glon < 0.0) {
                    gv = dec + Math.abs(glon);
                } else if (glat < 0.0 && glon >= 0.0) {
                    gv = dec + glon;
                } else if (glat < 0.0 && glon < 0.0) {
                    gv = dec - Math.abs(glon);
                }
                if (gv > 180.0) {
                    gv -= 360.0;
                } else if (gv < -180.0) { gv += 360.0; }
            }
            
            return {dec: dec, dip: dip, ti: ti, bh: bh, bx: bx, by: by, bz: bz, lat: glat, lon: glon, gv: gv, epoch: this.wmm.epoch};
        },
        
        
        // Converts a date to decimal years
        _decimalDate: function(date) {
            date = date || new Date();
            var year = date.getFullYear(),
                daysInYear = 365 +
                    (((year % 400 === 0) || (year % 4 === 0 && (year % 100 > 0))) ? 1 : 0),
                msInYear = daysInYear * 24 * 60 * 60 * 1000;

            return date.getFullYear() + (date.valueOf() - (new Date(year, 0)).valueOf()) / msInYear;
        },
        // Radian to degrees
        _rad2deg: function(rad) {
            return rad * (180 / Math.PI);
        }, 
        // Degrees to radians
        _deg2rad: function(deg) {
            return deg * (Math.PI / 180);
        }, 
        
        
        // Converts the WMM.COF text to a JSON object usable by geoMagFactory()
        _cof2Obj: function(cof) {
            'use strict';
            var modelLines = cof.split('\n'),
                wmm = [],
                i, vals, epoch, model, modelDate;
            for (i in modelLines) {
                if (modelLines.hasOwnProperty(i)) {
                    vals = modelLines[i].replace(/^\s+|\s+$/g, "").split(/\s+/);
                    if (vals.length === 3) {
                        epoch = parseFloat(vals[0]);
                        model = vals[1];
                        modelDate = vals[2];
                    } else if (vals.length === 6) {
                        wmm.push({
                            n: parseInt(vals[0], 10),
                            m: parseInt(vals[1], 10),
                            gnm: parseFloat(vals[2]),
                            hnm: parseFloat(vals[3]),
                            dgnm: parseFloat(vals[4]),
                            dhnm: parseFloat(vals[5])
                        });
                    }
                }
            }
            
            return {epoch: epoch, model: model, modelDate: modelDate, wmm: wmm};
        }
        
        
    });

});