module.exports = function (api, dateUtils) {

  const getOptionsForGoverningInstitution = function(governingInstitution, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      intermediateStrategy: 'ERROR',
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
    if(!oldStartDate && !oldEndDate) {
      options.references.push({
        href: '/organisationalunits/externalidentifiers',
        property: 'organisationalUnit',
        alias: 'externalIdentifiers'
      });
      options.references.push({
        href: '/organisationalunits/contactdetails',
        property: 'organisationalUnit',
        alias: 'contactDetails'
      });
    }
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
      intermediateStrategy: 'ERROR',
      batch: batch,
      properties: ['names'],
      references: [{
        href: '/organisationalunits/relations',
        parameters: {typeIn: 'GOVERNS,PROVIDES_SERVICES_TO'},
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
      }, {
        href: '/organisationalunits/relations',
        parameters: {type: 'IS_PART_OF'},
        property: 'from',
        alias: 'parentRels'
      }, {
        href: '/organisationalunits/relations',
        parameters: {
          type: 'IS_PART_OF'
        },
        property: 'to',
        subResources: ['from'],
        alias: 'childRels'
      }]
    };
    if(!oldStartDate && !oldEndDate) {
      options.references.push({
        href: '/organisationalunits/externalidentifiers',
        property: 'organisationalUnit',
        alias: 'externalIdentifiers'
      });
      options.references.push({
        href: '/organisationalunits/contactdetails',
        property: 'organisationalUnit',
        alias: 'contactDetails'
      });
    }
    return options;
  };
  const manageDatesForSchool = async function(school, batch, oldStartDate, oldEndDate) {
    const options = getOptionsForSchool(school, batch, oldStartDate, oldEndDate);
    const ret = await dateUtils.manageDateChanges(school, options, api);
    if(ret) {
      let error = null;
      for(let epd of ret.epds) {
        try {
          await manageDatesForEducationalProgrammeDetail(epd, batch, oldStartDate, oldEndDate, true);
        } catch(err) {
          if(err instanceof dateUtils.DateError) {
            if(!error) {
              error = err;
            } else {
              error.body = error.body.concat(err.body);
            }
          } else {
            throw error;
          }
        }
      }
      if(error) {
        throw error;
      }
      ret.classes = [];
      for(let childRel of ret.childRels) {
        if(childRel.from.$$expanded.type === 'CLASS') {
          ret.classes.push(childRel.from.$$expanded);
          await manageDatesForSchool(childRel.from.$$expanded, batch, oldStartDate, oldEndDate);
        }
      }
    }
    return ret;
  };
  const manageDeletesForSchool = async function(school, batch) {
    const options = getOptionsForSchool(school, batch);
    const ret = await dateUtils.manageDeletes(school, options, api);
    if(ret) {
      for(let epd of ret.epds) {
        await manageDeletesForEducationalProgrammeDetail(epd, batch);
      }
      for(let childRel of ret.childRels) {
        if(childRel.from.$$expanded.type === 'CLASS') {
          manageDeletesForSchool(childRel.from.$$expanded, batch);
        }
      }
    }
    return ret;
  };

  const manageDatesForBoarding = function(boarding, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      intermediateStrategy: 'ERROR',
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
      intermediateStrategy: 'ERROR',
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

  const getOptionsForSchoolLocation = function(location, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      intermediateStrategy: 'ERROR',
      batch: batch,
      references: [{
        href: '/educationalProgrammeDetails/locations',
        commonReference: 'physicalLocation',
        parameters: {
          'educationalProgrammeDetail.organisationalUnit': location.organisationalUnit.href
        },
        alias: 'epdLocations'
      }]
    };
    if(!oldStartDate && !oldEndDate) {
      options.references.push({
        href: '/organisationalunits/locations/externalidentifiers',
        property: 'location',
        alias: 'externalIdentifiers'
      });
    }
    return options;
  };
  const manageDatesForSchoolLocation = async function(location, batch, oldStartDate, oldEndDate, adaptEpds) {
    const options = getOptionsForSchoolLocation(location, batch, oldStartDate, oldEndDate);
    const ret = await dateUtils.manageDateChanges(location, options, api);
    if(ret) {
      for(let epdLoc of ret.epdLocations) {
        await manageDatesForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds);
      }
    }
    return ret;
  };
  const manageDeletesForSchoolLocation = async function(location, batch) {
    const options = getOptionsForSchoolLocation(location, batch);
    const ret = await dateUtils.manageDeletes(location, options, api);
    if(ret) {
      for(let epdLoc of ret.epdLocations) {
        await manageDeletesForEducationalProgrammeDetailLocation(epdLoc, batch);
      }
    }
    return ret;
  };

  const getOptionsForEducationalProgrammeDetail = function(epd, batch, oldStartDate, oldEndDate, forceEnlargeLocatons) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      intermediateStrategy: 'ERROR',
      batch: batch,
      references: {
        href: '/educationalProgrammeDetails/locations',
        property: 'educationalProgrammeDetail',
        onlyShortenPeriod: !forceEnlargeLocatons,
        alias: 'epdLocations'
      }
    };
    return options;
  };
  const manageDatesForEducationalProgrammeDetail = async function(epd, batch, oldStartDate, oldEndDate, forceEnlargeLocatons) {
    const options = getOptionsForEducationalProgrammeDetail(epd, batch, oldStartDate, oldEndDate, forceEnlargeLocatons);
    const ret = await dateUtils.manageDateChanges(epd, options, api);
    if(ret) {
      for(let epdLoc of ret.epdLocations) {
        await manageDatesForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate);
      }
    }
    return ret;
  };
  const manageDeletesForEducationalProgrammeDetail = async function(epd, batch) {
    const options = getOptionsForEducationalProgrammeDetail(epd, batch);
    const ret = await dateUtils.manageDeletes(epd, options, api);
    if(ret) {
      for(let epdLoc of ret.epdLocations) {
        await manageDeletesForEducationalProgrammeDetailLocation(epdLoc, batch);
      }
    }
    return ret;
  };

  const getOptionsForEducationalProgrammeDetailLocation = function(epdLoc, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      intermediateStrategy: 'ERROR',
      batch: batch,
      references: [{
        href: '/educationalprogrammedetails/locations/relations',
        property: 'to',
        alias: 'relationsFrom'
      },
      {
        href: '/educationalprogrammedetails/locations/relations',
        property: 'from',
        alias: 'relationsTo'
      }]
    };
    return options;
  };
  const manageDatesForEducationalProgrammeDetailLocation = function(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds) {
    const options = getOptionsForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate);
    if(adaptEpds) {
      options.references.push({
        href: '/educationalprogrammedetails',
        property: 'educationalProgrammeDetail',
        onlyEnlargePeriod: true
      });
    }
    return dateUtils.manageDateChanges(epdLoc, options, api);
  };
  const manageDeletesForEducationalProgrammeDetailLocation = function(epdLoc, batch) {
    const options = getOptionsForEducationalProgrammeDetailLocation(epdLoc, batch);
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
