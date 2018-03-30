# DropHash
Code for DropHash website. Drop a GeoJSON and find the geohashes inside. Copy them to the clipboard or just check how the geohashes cover your map.

To use, just drag and drop a GeoJSON file to the file input, and it will look for the geohashes inside it. After it has loaded, the map will show them.

![instructions](https://i.imgur.com/nWuP2cy.png)

Default precision is 6. You can easily change it using the dropdown. Be aware that more precision means more resource usage, so be careful with big GeoJSONs.

If you click over the list of GeoJSONs they will be copied to clipboard.

![modal](https://i.imgur.com/f2vxNDo.png)

To run:

```
npm i
npm run start
```

Server runs on port 5000
