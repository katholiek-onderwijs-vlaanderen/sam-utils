module.exports = function (api, dateUtils) {
  const manageDatesForGoverningInstitution = function(governingInstitution, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      batch: batch,
      properties: ['names'],
      references: {
        href: '/organisationalunits/relations',
        parameters: {
          typeIn: 'IS_MEMBER_OF'
        },
        property: 'from',
        alias: 'relations'
      }
    };
    return dateUtils.manageDateChanges(governingInstitution, options, api);
  };

  const manageDatesForSchool = async function(school, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      batch: batch,
      properties: ['names'],
      references: [{
        href: '/organisationalunits/relations',
        parameters: {
          typeIn: 'GOVERNS,PROVIDES_SERVICES_TO'
        },
        property: 'to',
        alias: 'relations'
      }, {
        href: '/organisationalunits/locations',
        property: 'organisationalUnit',
        alias: 'locations'
      }, {
        href: '/educationalProgrammeDetails',
        property: 'organisationalUnit',
        alias: 'epds'
      }]
    };
    const ret = await dateUtils.manageDateChanges(school, options, api);
    if(ret) {
      const promises = [];
      ret.epds.forEach(epd => {
        promises.push(manageDatesForEducationalProgrammeDetail(epd, batch, oldStartDate, oldEndDate, school.type === 'SCHOOL'));
      });
      await Promise.all(promises);
    }
    return ret;
  };

  const manageDatesForBoarding = function(boarding, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      batch: batch,
      properties: ['names'],
      references: [{
        href: '/organisationalunits/relations',
        parameters: {
          typeIn: 'GOVERNS'
        },
        property: 'to',
        alias: 'relations'
      }]
    };
    return dateUtils.manageDateChanges(boarding, options, api);
  };

  const manageDatesForClb = function(clb, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      batch: batch,
      properties: ['names'],
      references: [{
        href: '/organisationalunits/relations',
        parameters: {
          typeIn: 'GOVERNS'
        },
        property: 'to',
        alias: 'relations'
      }]
    };
    return dateUtils.manageDateChanges(clb, options, api);
  };

  const manageDatesForSchoolLocation = async function(location, batch, oldStartDate, oldEndDate, official) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      batch: batch,
      references: {
        href: '/educationalProgrammeDetails/locations',
        commonReference: 'physicalLocation',
        parameters: {
          'educationalProgrammeDetail.organisationalUnit': location.organisationalUnit.href
        },
        alias: 'epdLocations'
      }
    };
    const ret = await dateUtils.manageDateChanges(location, options, api);
    if(ret) {
      const promises = [];
      ret.epdLocations.forEach(epdLoc => {
        promises.push(manageDatesForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate, official));
      });
      await Promise.all(promises);
    }
    return ret;
  };

  const manageDatesForEducationalProgrammeDetail = async function(epd, batch, oldStartDate, oldEndDate, official) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      batch: batch,
      references: {
        href: '/educationalProgrammeDetails/locations',
        property: 'educationalProgrammeDetail',
        alias: 'epdLocations'
      }
    };
    const ret = await dateUtils.manageDateChanges(epd, options, api);
    if(ret) {
      const promises = [];
      ret.epdLocations.forEach(epdLoc => {
        promises.push(manageDatesForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate, official));
      });
      await Promise.all(promises);
    }
    return ret;
  };

  const manageDatesForEducationalProgrammeDetailLocation = function(epdLoc, batch, oldStartDate, oldEndDate, official) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      batch: batch,
      references: {
        href: '/educationalProgrammeDetails/locations/relations',
        property: official ? 'to' : 'from',
        alias: 'relations'
      }
    };
    return dateUtils.manageDateChanges(epdLoc, options, api);
  };

  return {
    manageDatesForGoverningInstitution: manageDatesForGoverningInstitution,
    manageDatesForSchool: manageDatesForSchool,
    manageDatesForSchoolLocation: manageDatesForSchoolLocation,
    manageDatesForEducationalProgrammeDetail: manageDatesForEducationalProgrammeDetail,
    manageDatesForEducationalProgrammeDetailLocation: manageDatesForEducationalProgrammeDetailLocation,
    manageDatesForBoarding: manageDatesForBoarding,
    manageDatesForClb: manageDatesForClb
  };
};
