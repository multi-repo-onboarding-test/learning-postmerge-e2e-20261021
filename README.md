# Resource readers

A small JavaScript client for project and venue records in a scheduling service.
The transport is injected so callers can use their existing authenticated client.

```js
import { getVenue } from "./src/resources/venues.js";

const venue = await getVenue("venue-12", {
  baseUrl: "https://api.example.test",
  fetchImpl: authenticatedFetch,
});
```

Run `npm test` with Node 22 or later. The tests use local response doubles and
make no network requests. No dependencies need to be installed.
