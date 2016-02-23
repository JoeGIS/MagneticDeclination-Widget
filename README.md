# MagneticDeclination-Widget

## Features
An ArcGIS for JavaScript API widget for calculating magnetic declination.

Model: World Magnetic Model 2015 (WMM-2015)  Current until December 2019.
Datum: WGS84

Press spacebar to pause/resume updating.

[View it live](http://joerogan.ca/maps/joegis/)

## Resources
* [Magnetic Declination](http://geomag.nrcan.gc.ca/mag_fld/magdec-en.php)
* [World Magnetic Model](https://www.ngdc.noaa.gov/geomag/WMM/)

## Helpful Links

```javascript
on(mainMap, "load", function() {
    var magDec = new MagDec({
        map: mainMap
        }, "MagDecWindow");
    magDec.startup();
});
```

## Requirements
* Notepad or HTML editor
* A little background with JavaScript
* Experience with the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/) would help.

## Setup
Set your dojo config to load the module.

```javascript
var package_path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
var dojoConfig = {
    // The locationPath logic below may look confusing but all its doing is
    // enabling us to load the api from a CDN and load local modules from the correct location.
    packages: [{
        name: "application",
        location: package_path + '/js'
    }]
};
```

## Require module
Include the module for the MagDec widget.

```javascript
require(["application/MagDec", ... ], function(MagDec, ... ){ ... });
```

## Constructor
MagDec(options, srcNode);

### Options (Object)
|property|required|type|value|description|
|---|---|---|---|---|
|map|x|Map|null|ArcGIS JS Map.|
|theme||string|magDecWidget|CSS Class for uniquely styling the widget.|

## Methods
### startup
startup(): Start the widget.  Map object must be loaded first.

## Issues
Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing
Anyone and everyone is welcome to contribute.

## Credits
Modified from code create by Christopher Weiss (cmweiss@gmail.com) Copyright 2012
Adapted from the geomagc software and World Magnetic Model of the NOAA
Satellite and Information Service, National Geophysical Data Center
[Source](http://www.ngdc.noaa.gov/geomag/WMM/DoDWMM.shtml)

## Licensing
The MIT License (MIT)

Copyright (c) 2016 Joseph Rogan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

