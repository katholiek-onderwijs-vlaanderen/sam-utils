module.exports = function (api, dateUtils) {

  const getClassesAtCampus = async (campus) => {
    const classLocationsAtSameCampus = await getClassLocationsAtCampus(campus);
    return classLocationsAtSameCampus.map(loc => loc.organisationalUnit.$$expanded);
  };

  const getClassLocationsAtCampus = async (campus) => {
    const classes = await api.getAll('/sam/organisationalunits/relations', {to: campus.organisationalUnit.href, type: 'IS_PART_OF', 'from.type': 'CLASS'});
    if(classes.length === 0) {
      return [];
    }
    const allClassLocations = await api.getAll('/sam/organisationalunits/locations',
      {
        organisationalUnit: classes.map(c => c.from.href).join(','),
        physicalLocation: campus.physicalLocation.href,
        expand: 'results.organisationalUnit'
      }, {inBatch: '/sam/organisationalunits/batch', logging: 'debug'});
    return allClassLocations.filter(loc => dateUtils.isOverlapping(loc, campus));
  };

  const getClassEpdsForSameAg = async (epd) => {
    const classes = await api.getAll('/sam/organisationalunits/relations', {to: epd.organisationalUnit.href, type: 'IS_PART_OF', 'from.type': 'CLASS'});
    if(classes.length === 0) {
      return [];
    }
    return api.getAll('/sam/educationalprogrammedetails', {
      organisationalUnit: classes.map(c => c.from.href).join(','),
      ag: epd.ag.href,
      expand: 'results.organisationalUnit'
    }, {inBatch: '/sam/educationalprogrammedetails/batch', logging: 'debug'});
  };

  return {
    getClassesAtCampus: getClassesAtCampus,
    getClassLocationsAtCampus: getClassLocationsAtCampus,
    getClassEpdsForSameAg: getClassEpdsForSameAg
  };
};