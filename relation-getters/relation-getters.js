module.exports = function (api, epdUtils) {

  const getAllSchoolsLinkedThroughOffer = async (schoolEntityHref, referenceDate) => {
    const linkedSchoolHrefs = await epdUtils.getRelatedSchools(schoolEntityHref, api, referenceDate);

    if (linkedSchoolHrefs.length > 0) {
      const schools = await api.getAllHrefs(linkedSchoolHrefs, '/sam/organisationalunits/batch');
      return schools.map(school => school.$$expanded);
    }

    return [];
  };

  const getSchoolEntityClbs = async (schoolEntityHref, referenceDate) => {
    const linkedSchools = await getAllSchoolsLinkedThroughOffer(schoolEntityHref);
    const datePeriod = referenceDate ? {
      startDateBefore: referenceDate, 
      endDateAfter: referenceDate
    } : {};

    if (linkedSchools.length > 0) {
      const clbRelations = await api.getAll('/sam/organisationalunits/relations', Object.assign({}, datePeriod, {
        to:  linkedSchools.map(school => school.$$meta.permalink).join(','),
        type: 'PROVIDES_SERVICES_TO',
        expand: 'results.from'
      }), {inBatch: '/sam/organisationalunits/batch', logging: 'debug'});
  
      return _.uniqBy(clbRelations.map(clbRelation => clbRelation.from.$$expanded), 'key');
    }

    return [];
  };

  return {
    getAllSchoolsLinkedThroughOffer: getAllSchoolsLinkedThroughOffer,
    getSchoolEntityClbs: getSchoolEntityClbs
  };
};