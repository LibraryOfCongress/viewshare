
Simile Exhibit PieChart Extension

by Eric Abouaf <eric.abouaf at gmail.com>
http://javascript.neyric.com/blog

PieChart viewing class for Simile Exhibit, using the Google Visualization API.


Demo :
------

http://neyric.github.com/exhibit-piechart-extension/demo/presidents.html

How to use it :
---------------

The piechart-extension implements a viewClass. To add it to your exhibit:

 * Add the 2 following scripts to your page :
	
	<!-- We use the Google Visualization API to generate the pie -->
	<script src="http://www.google.com/jsapi" type="text/javascript"></script>
	
	<!-- The piechart extension -->
	<script src="/path/to/piechart-extension/piechart-extension.js" type="text/javascript"></script>

 * Add the view :

	<div ex:role="view" ex:viewClass="Piechart"></div>


Configuration :
---------------

 *	you can limit the view properties :

	<div ex:role="view" 
			 ex:viewClass="Piechart"
			 ex:groupProperties="party, religion, diedInOffice"></div>
   
  * change the size :

	<div ex:role="view" 
			 ex:viewClass="Piechart"
			 ex:groupProperties="party, religion, diedInOffice"
			 ex:width="800"
			 ex:height="480"
			></div>

	* change the background color	:
		<div ex:role="view" 
				 ex:viewClass="Piechart"
				 ex:groupProperties="party, religion, dieInOffice"
				 ex:width="800"
				 ex:height="480"
				 ex:backgroundColor="#DFFFFF"
				></div>

References :
------------

 * Simile Exhibit: http://code.google.com/p/simile-widgets/
 * Google Visualization API: http://code.google.com/apis/visualization/documentation/gallery/piechart.html



Licensing and legal issues
--------------------------

Exhibit-piechart-extension is open source software and are licensed under the BSD license
located in the LICENSE.txt file located in the same directory as this very file
you are reading.
