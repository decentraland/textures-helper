# Textures Helper

Textures helper compresses textures using DXT1 mipmapped format.

## Converting an image

This service exposes an endpoint for compressing textures which expects two inputs `size` as a path parameter and `asset` as a query parameter. The call structure for this endpoint is as follows:

```
GET <HOST>/content/dxt/:LENGTH?asset=<ASSET-URL>
```

* **length** - must be an integer and a power of two that can go from 128 until 2048
* **asset** - must be a HTTP url referencing the asset to be converted by the service

The response structure will look like:

```
{
  "asset": string,
  "conversionRatio":
    {
      "height": number,
      "width": number
     }
}
```

* **asset** - contains the URL of the resized and compressed asset. This URL will point to the CDN configured for this service.
* **conversionRatio** - contains the resize ratio relating old asset size with the new one specified when calling the endpoint
  * **height** - newHeight / oldHeight (_fixed to four decimals_)
  * **width** - newWidth / oldWidth (_fixed to four decimals_)

### Endpoint call example

The following call will compress the textures of the asset `bafkreieyj5es7j3mvdyyvvjn3qc3uaotlpsmhjb34rqoumsxpv5fbxieq4` to `CRN` format using `DXT1` and resize the image to the specified size (_512_).

```
GET https://textures-helper.decentraland.zone/content/dxt/512?asset=https://peer-ap1.decentraland.zone/content/contents/bafkreieyj5es7j3mvdyyvvjn3qc3uaotlpsmhjb34rqoumsxpv5fbxieq4
```

### Response example

The call above would return the following response:

```json
{
  "asset":"https://textures-helper-cdn.decentraland.zone/bafkreieyj5es7j3mvdyyvvjn3qc3uaotlpsmhjb34rqoumsxpv5fbxieq4-512.crn",
  "conversionRatio":
    {
      "height":1,
      "width":2
     }
}
```

### Authentication

This service is secured with Auth Chain, therefore it needs to be consumed using [Signed Fetch](https://adr.decentraland.org/adr/ADR-44). The `signed fetch` call should include metadata with the following values:

* **signer** - **dcl:explorer**
* **intent** - **dcl:explorer:resize-textures**
