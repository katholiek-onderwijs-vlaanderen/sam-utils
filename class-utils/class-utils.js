module.exports = function (api) {

  const getClassesAtCampus = async (campus) => {
    const classLocationsAtSameCampus = await getClassLocationsAtCampus(campus);
    return classLocationsAtSameCampus.map(loc => loc.organisationalUnit.$$expanded);
  };

  const getClassLocationsAtCampus = async (campus) => {
    const classes = await api.getAll('/organisationalunits/relations', {to: campus.organisationalUnit.href, type: 'IS_PART_OF', 'from.type': 'CLASS'}, {logging: 'debug'});
    if(classes.length === 0) {
      return [];
    }
    return api.getAll('/organisationalunits/locations',
      {
        organisationalUnit: classes.map(c => c.from.href).join(','),
        physicalLocation: campus.physicalLocation.href,
        expand: 'results.organisationalUnit'
      }, {logging: 'debug'});
  };

  const getClassEpdsForSameAg = async (epd) => {
    const classes = await api.getAll('/organisationalunits/relations', {to: epd.organisationalUnit.href, type: 'IS_PART_OF', 'from.type': 'CLASS'}, {logging: 'debug'});
    if(classes.length === 0) {
      return [];
    }
    return api.getAll('/educationalprogrammedetails', {
      organisationalUnit: classes.map(c => c.from.href).join(','),
      ag: epd.ag.href,
      expand: 'results.organisationalUnit'
    }, {logging: 'debug'});
  };

  return {
    getClassesAtCampus: getClassesAtCampus,
    getClassLocationsAtCampus: getClassLocationsAtCampus,
    getClassEpdsForSameAg: getClassEpdsForSameAg
  };
};