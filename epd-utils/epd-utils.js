const OKAN = '/commons/agsoorten/76fae745-2a07-11e5-be0a-00ffa0598608';
const HBO = '/commons/agsoorten/76fae629-2a07-11e5-be0a-00ffa0598608';
const MODULAIR = '/commons/agsoorten/3950a39a-2cc9-11e6-b392-005056872df5';
/*
needs to be expanded: buoType, mainstructure, leerjaar, graad, onderwijsvorm, structuuronderdeel, buoFase, buoOpleidingsvorm, buoOpleiding
*/
const sortEducationProgramme = function(epds, options) {
  epds.sort((a, b) => {
    if(options && options.path) {
      const words = options.path.split('.');
      words.forEach(word => {
        a = a[word];
        b = b[word];
      });
    }
    const epdA = a;
    const epdB = b;
    if(!a.ag) {
      console.log(JSON.stringify(a));
    }
    a = a.ag.$$expanded;
    b = b.ag.$$expanded;
    if(a.mainstructure.href !== b.mainstructure.href) { // first criteria is always mainstructure
      return a.mainstructure.$$expanded.code - b.mainstructure.$$expanded.code;
    } else if (a.mainstructure.$$expanded.code === 111 || a.mainstructure.$$expanded.code === 211) {
      return a.leerjaar.$$expanded.code - b.leerjaar.$$expanded.code; // gewoon basis -> leerjaar
    } else if (a.mainstructure.$$expanded.code === 121 || a.mainstructure.$$expanded.code === 221) {
      return epdA.buoType.$$expanded.code - epdB.buoType.$$expanded.code; // buitengewoon basis -> buoType
    } else if (a.mainstructure.$$expanded.code === 311) { // for 311
      if(a.soort.href === OKAN || b.soort.href === OKAN) {
        return a.soort.href === OKAN ? -1 : 1; // OKAN is always first
      } else if(a.soort.href !== b.soort.href && (a.soort.href === HBO || b.soort.href === HBO || a.soort.href === MODULAIR || b.soort.href === MODULAIR)) {
        if(a.soort.href !== b.soort.href) {
          if(a.soort.href === MODULAIR) {
            return 1;
          } else if (b.soort.href === MODULAIR) {
            return -1;
          } else if (a.soort.href === HBO) {
            return 1;
          } else if (b.soort.href === HBO) {
            return -1;
          } else {
            console.log('This should not happen!');
          }
        } else {
          return a.structuuronderdeel.$$expanded.name < b.structuuronderdeel.$$expanded.name ? -1 : 1;
        }
      } else { // all other cases: not OKAN, HBO or MODULAIR
        if(a.graad.href !== b.graad.href) { // 1. order on graad
          return a.graad.$$expanded.code - b.graad.$$expanded.code;
        } else if(a.graad.$$expanded.code === 1) { // for 1ste graad: 1. leerjaar, 2. structuuronderdeel
          if(a.leerjaar.href !== b.leerjaar.href) {
            return a.leerjaar.$$expanded.code - b.leerjaar.$$expanded.code;
          } else {
            return a.structuuronderdeel.$$expanded.name < b.structuuronderdeel.$$expanded.name ? -1 : 1;
          }
        } else { // for 2de & 3de graad: 1. onderwijsvorm 2. structuuronderdeel 3. leerjaar
          if(a.onderwijsvorm.href !== b.onderwijsvorm.href) {
            return a.onderwijsvorm.$$expanded.code < b.onderwijsvorm.$$expanded.code ? -1 : 1;
          } else if(a.structuuronderdeel.href !== b.structuuronderdeel.href) {
            return a.structuuronderdeel.$$expanded.name < b.structuuronderdeel.$$expanded.name ? -1 : 1;
          } else {
            return a.leerjaar.$$expanded.code - b.leerjaar.$$expanded.code;
          }
        }
      }
    } else if (a.mainstructure.$$expanded.code === 312) {
      return a.structuuronderdeel.$$expanded.name < b.structuuronderdeel.$$expanded.name ? -1 : 1;
    } else if (a.mainstructure.$$expanded.code === 321) {
      if(a.buoOpleidingsvorm.href !== b.buoOpleidingsvorm.href) {
        return a.buoOpleidingsvorm.$$expanded.code < b.buoOpleidingsvorm.$$expanded.code ? -1 : 1;
      } else {
        if(a.buoOpleidingsvorm.$$expanded.code === "OV1") {
          return epdA.buoType.$$expanded.code < epdB.buoType.$$expanded.code ? -1 : 1;
        } else if(a.buoOpleidingsvorm.$$expanded.code === "OV2") {
          if(epdA.buoType.href !== epdB.buoType.href) {
            return epdA.buoType.$$expanded.code < epdB.buoType.$$expanded.code ? -1 : 1;
          } else {
            return a.buoFase.$$expanded.code < b.buoFase.$$expanded.code ? -1 : 1;
          }
        } else if(a.buoOpleidingsvorm.$$expanded.code === "OV3") {
          if(epdA.buoType.href !== epdB.buoType.href) {
            return epdA.buoType.$$expanded.code < epdB.buoType.$$expanded.code ? -1 : 1;
          } else if(a.buoFase.href !== b.buoFase.href) {
            return a.buoFase.$$expanded.code < b.buoFase.$$expanded.code ? -1 : 1;
          } else if(a.buoOpleiding.href !== b.buoOpleiding.href) {
            return a.buoOpleiding.$$expanded.name < b.buoOpleiding.$$expanded.name ? -1 : 1;
          } else {
            return a.leerjaar.$$expanded.code - b.leerjaar.$$expanded.code;
          }
        } else if(a.buoOpleidingsvorm.$$expanded.code === "OV4") {
          if(a.graad.href !== b.graad.href) { // 1. order on graad
            return a.graad.$$expanded.code - b.graad.$$expanded.code;
          } else if(a.graad.$$expanded.code === 1) { // for 1ste graad: 1. leerjaar, 2. structuuronderdeel 3. buoType
            if(a.leerjaar.href !== b.leerjaar.href) {
              return a.leerjaar.$$expanded.code - b.leerjaar.$$expanded.code;
            } else if(a.structuuronderdeel.href !== b.structuuronderdeel.href) {
              return a.structuuronderdeel.$$expanded.name < b.structuuronderdeel.$$expanded.name ? -1 : 1;
            } else {
              return epdA.buoType.$$expanded.code - epdB.buoType.$$expanded.code;
            }
          } else { // for 2de & 3de graad: 1. structuuronderdeel 2. buoType 3. leerjaar, no onderwijsvorm
            /*if(a.onderwijsvorm.href !== b.onderwijsvorm.href) {
              return a.onderwijsvorm.$$expanded.code < b.onderwijsvorm.$$expanded.code ? -1 : 1;
            } else */
            if(a.structuuronderdeel.href !== b.structuuronderdeel.href) {
              return a.structuuronderdeel.$$expanded.name < b.structuuronderdeel.$$expanded.name ? -1 : 1;
            } else if(epdA.buoType.href !== epdB.buoType.href) {
              return epdA.buoType.$$expanded.code < epdB.buoType.$$expanded.code ? -1 : 1;
            } else {
              return a.leerjaar.$$expanded.code - b.leerjaar.$$expanded.code;
            }
          }
        }
      }
    }
    return a.code - b.code;
  });
};

module.exports = {
  sortEducationProgramme: sortEducationProgramme
};
