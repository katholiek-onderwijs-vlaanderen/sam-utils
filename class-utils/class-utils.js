module.exports = function (api) {

  const getClassesAtSameLocation = async (location) => {
    const classes = await api.getAll('/organisationalunits/relations', {to: location.organisationalUnit.href, type: 'IS_PART_OF', 'from.type': 'CLASS'}, {logging: 'debug'});
    if(classes.length === 0) {
      return [];
    }
    const classesAtSameLocation = await api.getAll('/organisationalunits/locations',
      {
        organisationalUnit: classes.map(c => c.from.href).join(','),
        physicalLocation: location.physicalLocation.href,
        expand: 'results.organisationalUnit'},
      {logging: 'debug'});
    return classesAtSameLocation.map(loc => loc.organisationalUnit.$$expanded);
  };

  return {
    getClassesAtSameLocation: getClassesAtSameLocation
  };
};