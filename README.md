# filmstrip-web

Visual Interface for displaying image sequences from videos. This is the accompanying visualization for data produced from [this code](https://github.com/tafsiri/filmstrip). Originally used to power the display of videos from [OpenVisConf 2014](http://openvisconf.com#videos).

## Setup & Run

This repository contains just the client side code. So all you need is a web server. Depending on what is installed on your machine you may have one already. For example if you have python or ruby installed you can run,

```python -m SimpleHTTPServer 8000```
or
```ruby -run -e httpd -- -p 8000 .```

To serve the contents of the directory they are run in on port 8000. But you can really cant just use any web server you are comfortable with.

If you are using one of the above commands, you can just visit http://localhost:8000

The visualization code itself is in ```javascripts/vis.js```, and depends on data being present in the ```data``` folder. The contents of the data folder are generated from running the code in the [filmstrip.py repository](https://github.com/tafsiri/filmstrip) so take a look there to see how to generate your own thumbnails and image data. Sample data is included just as an example.

## Dependencies

Uses [d3.js](d3js.org), [underscore.js](underscorejs.org), a tiny bit of [jQuery](http://jquery.com/) and [Font Awesome](http://fontawesome.io)