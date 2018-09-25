module.exports = function (api, dateUtils) {

  const getOptionsForGoverningInstitution = function(governingInstitution, batch, oldStartDate, oldEndDate) {
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
    return options;
  };
  const manageDatesForGoverningInstitution = function(governingInstitution, batch, oldStartDate, oldEndDate) {
    const options = getOptionsForGoverningInstitution(governingInstitution, batch, oldStartDate, oldEndDate);
    return dateUtils.manageDateChanges(governingInstitution, options, api);
  };
  const manageDeletesForGoverningInstitution = function(governingInstitution, batch) {
    const options = getOptionsForGoverningInstitution(governingInstitution, batch);
    return dateUtils.manageDeletes(governingInstitution, options, api);
  };

  const getOptionsForSchool = function(school, batch, oldStartDate, oldEndDate) {
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
    return options;
  };
  const manageDatesForSchool = async function(school, batch, oldStartDate, oldEndDate) {
    const options = getOptionsForSchool(school, batch, oldStartDate, oldEndDate);
    const ret = await dateUtils.manageDateChanges(school, options, api);
    if(ret) {
      for(let epd of ret.epds) {
        await manageDatesForEducationalProgrammeDetail(epd, batch, oldStartDate, oldEndDate);
      }
    }
    return ret;
  };
  const manageDeletesForSchool = async function(school, batch, oldStartDate, oldEndDate) {
    const options = getOptionsForSchool(school, batch, oldStartDate, oldEndDate);
    const ret = await dateUtils.manageDeletes(school, options, api);
    if(ret) {
      for(let epd of ret.epds) {
        await manageDeletesForEducationalProgrammeDetail(epd, batch, oldStartDate, oldEndDate);
      }
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

  const getOptionsForSchoolLocation = function(location, batch, oldStartDate, oldEndDate, adaptEpds) {
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
    return options;
  };
  const manageDatesForSchoolLocation = async function(location, batch, oldStartDate, oldEndDate, adaptEpds) {
    const options = getOptionsForSchoolLocation(location, batch, oldStartDate, oldEndDate, adaptEpds);
    const ret = await dateUtils.manageDateChanges(location, options, api);
    if(ret) {
      for(let epdLoc of ret.epdLocations) {
        await manageDatesForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds);
      }
    }
    return ret;
  };
  const manageDeletesForSchoolLocation = async function(location, batch, oldStartDate, oldEndDate, adaptEpds) {
    const options = getOptionsForSchoolLocation(location, batch, oldStartDate, oldEndDate, adaptEpds);
    const ret = await dateUtils.manageDeletes(location, options, api);
    if(ret) {
      for(let epdLoc of ret.epdLocations) {
        await manageDeletesForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds);
      }
    }
    return ret;
  };

  const getOptionsForEducationalProgrammeDetail = function(epd, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      batch: batch,
      references: {
        href: '/educationalProgrammeDetails/locations',
        property: 'educationalProgrammeDetail',
        onlyShortenPeriod: true,
        alias: 'epdLocations'
      }
    };
    return options;
  };
  const manageDatesForEducationalProgrammeDetail = async function(epd, batch, oldStartDate, oldEndDate) {
    const options = getOptionsForEducationalProgrammeDetail(epd, batch, oldStartDate, oldEndDate);
    const ret = await dateUtils.manageDateChanges(epd, options, api);
    if(ret) {
      for(let epdLoc of ret.epdLocations) {
        await manageDatesForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate);
      }
    }
    return ret;
  };
  const manageDeletesForEducationalProgrammeDetail = async function(epd, batch, oldStartDate, oldEndDate) {
    const options = getOptionsForEducationalProgrammeDetail(epd, batch, oldStartDate, oldEndDate);
    const ret = await dateUtils.manageDeletes(epd, options, api);
    if(ret) {
      for(let epdLoc of ret.epdLocations) {
        await manageDeletesForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate);
      }
    }
    return ret;
  };

  const getOptionsForEducationalProgrammeDetailLocation = function(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      batch: batch,
      references: [{
        href: '/educationalprogrammedetails/locations/relations',
        property: 'to',
        alias: 'relations'
      },
      {
        href: '/educationalprogrammedetails/locations/relations',
        property: 'from',
        alias: 'relations'
      }]
    };
    return options;
  };
  const manageDatesForEducationalProgrammeDetailLocation = function(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds) {
    const options = getOptionsForEducationalProgrammeDetailLocation;
    if(adaptEpds) {
      options.references.push({
        href: '/educationalprogrammedetails',
        property: 'educationalProgrammeDetail',
        onlyEnlargePeriod: true
      });
    }
    return dateUtils.manageDateChanges(epdLoc, options, api);
  };
  const manageDeletesForEducationalProgrammeDetailLocation = function(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds) {
    const options = getOptionsForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds);
    if(adaptEpds) {
      options.references.push({
        href: '/educationalprogrammedetails',
        property: 'educationalProgrammeDetail',
        onlyEnlargePeriod: true
      });
    }
    return dateUtils.manageDeletes(epdLoc, options, api);
  };

  return {
    manageDatesForGoverningInstitution: manageDatesForGoverningInstitution,
    manageDatesForSchool: manageDatesForSchool,
    manageDatesForSchoolLocation: manageDatesForSchoolLocation,
    manageDatesForEducationalProgrammeDetail: manageDatesForEducationalProgrammeDetail,
    manageDatesForEducationalProgrammeDetailLocation: manageDatesForEducationalProgrammeDetailLocation,
    manageDatesForBoarding: manageDatesForBoarding,
    manageDatesForClb: manageDatesForClb,
    manageDeletesForGoverningInstitution: manageDeletesForGoverningInstitution,
    manageDeletesForSchool: manageDeletesForSchool,
    manageDeletesForSchoolLocation: manageDeletesForSchoolLocation,
    manageDeletesForEducationalProgrammeDetail: manageDeletesForEducationalProgrammeDetail,
    manageDeletesForEducationalProgrammeDetailLocation: manageDeletesForEducationalProgrammeDetailLocation
  };
};
