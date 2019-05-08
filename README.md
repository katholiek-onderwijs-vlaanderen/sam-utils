# sam-utils
utility functions for applications that use the Samenscholing domain
## date-manager

##relation-getters
This is a library with utility functions for getting implicit relations involving school entities.

#### usage ####
```javascript
const relationGetters = require('@kathondvla/sam-utils/relation-getters');
```

#### interface ####

* **getAllSchoolsLinkedThroughOffer(ouKey, referenceDate):** returns all linked schools to educational programme relations that are active on given reference date.
* **getSchoolEntityClbs(ouKey, referenceDate):** returns all active clbs on the given reference date, expected one, but could have more than one active at a time.


