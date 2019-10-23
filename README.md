&#35;CrowderExposesYoutube
==========================

Summary
-------

Archive of YouTube search results of various query strings. Each fetch is saved
to a directory structure that corresponds to the location the query was fetched
from. Each screenshot is archived using YYMMDD timestamp for back-reference.

Setup
-----

Must have Node.JS & TOR installed (or at least a TOR proxy available to you).
This script uses exit nodes as a means to traverse the globe.

From there, be sure to configure an `.env` file (rename `.env.example` as a
jumping-off point), then run the following:

```
npm install
npm start
```