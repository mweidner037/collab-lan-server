# collab-lan-electron

Collabs container host that uses libp2p/MDNS for networking on a LAN, as a server that can be run locally.

Build:

First, put the container of your choice (plus supporting files, if applicable) in `src/site/container/`, and rename the main HTML file to `container.html`.

Then do:

```
npm run build
```

Start:

```
npm start
```

Then open your browser to the printed address (default [http://localhost:3000/](http://localhost:3000/)).
