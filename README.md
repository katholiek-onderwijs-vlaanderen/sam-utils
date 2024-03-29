# sam-utils
utility functions for applications that use the Samenscholing domain
## date-manager

## epd-utils
```javascript
const epdUtils = require('@kathondvla/sam-utils/epd-utils');
```

* **sortEducationProgramme(epds):** sorts the epds in a functionally logical order the epds need to have their ag property expanded
* **getCorrespondingRelationsToMainstructures(epdsPointingToAgs, agMsMap):** return the denormalized relations to mainstructures based on the educational programme details pointing to ags. It also needs agMsMap as a map with key an ag permalink and value an object with property mainstructure.href so the function knows for each agHref in an epd to what mainstructure it points.

## relation-getters
This is a library with utility functions for getting implicit relations involving school entities.

#### usage ####
```javascript
const relationGetters = require('@kathondvla/sam-utils/relation-getters');
```

#### interface ####

* **getAllSchoolsLinkedThroughOffer(ouKey, referenceDate):** returns all linked schools to educational programme relations that are active on given reference date.
* **getSchoolEntityClbs(ouKey, referenceDate):** returns all active clbs on the given reference date, expected one, but could have more than one active at a time.


