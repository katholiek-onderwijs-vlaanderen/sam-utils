const deepcopy = require('deepcopy/index.js');

module.exports = function (api, dateUtils) {
  const classUtils = require('../class-utils')(api, dateUtils);

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

  const getOptionsForClass = function(batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      intermediateStrategy: 'ERROR',
      batch: batch,
      properties: ['names'],
      references: [{
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
      }]
    };
    return options;
  };
  const getOptionsForSchool = function(batch, oldStartDate, oldEndDate) {
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
        intermediateStrategy: 'FORCE',
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
    const isClass = school.type === 'CLASS';
    const options = isClass ? getOptionsForClass(batch, oldStartDate, oldEndDate) : getOptionsForSchool(batch, oldStartDate, oldEndDate);
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

      if(!isClass) {
        ret.classes = [];
        for(let childRel of ret.childRels) {
          ret.classes.push(childRel.from.$$expanded);
          try {
            await manageDatesForClass(childRel.from.$$expanded, batch, oldStartDate, oldEndDate);
          } catch(err) {
            if(err instanceof dateUtils.DateError) {
              err.body.forEach(e => e.aboutClass = true);
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
      }
    }
    return ret;
  };
  const manageDatesForClass = manageDatesForSchool;
  const manageDeletesForSchool = async function(school, batch) {
    const isClass = school.type === 'CLASS';
    const options = isClass ? getOptionsForClass(batch) : getOptionsForSchool(batch);
    const ret = await dateUtils.manageDeletes(school, options, api);
    if(ret) {
      for(let epd of ret.epds) {
        await manageDeletesForEducationalProgrammeDetail(epd, batch);
      }
      for(let loc of ret.locations) {
        await manageDeletesForSchoolLocation(loc, batch, true);
      }
      if(!isClass) {
        ret.classes = [];
        for(let childRel of ret.childRels) {
          ret.classes.push(childRel.from.$$expanded);
          await manageDeletesForClass(childRel.from.$$expanded, batch);
        }
      }
    }
    return ret;
  };
  const manageDeletesForClass = manageDeletesForSchool;

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

  const getOptionsForSchoolLocation = function(location, batch, oldStartDate, oldEndDate, doNotAdaptSchoolDependencies) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      intermediateStrategy: 'ERROR',
      batch: batch,
      references: []
    };
    /*if(classes.length > 0) {
      options.references.push({
        href: 'organisationalunits/locations',
        commonReference: 'physicalLocation',
        parameters: {
          'organisationalUnit': classes.map(c => c.from.href)
        },
        alias: 'classLocations'
      });
    }*/
    if(!doNotAdaptSchoolDependencies) {
      options.references.push({
        href: '/educationalProgrammeDetails/locations',
        commonReference: 'physicalLocation',
        parameters: {
          'educationalProgrammeDetail.organisationalUnit': location.organisationalUnit.href
        },
        filter: epdLoc => dateUtils.isOverlapping(epdLoc, location),
        alias: 'epdLocations'
      });
    }
    if(!oldStartDate && !oldEndDate) {
      options.references.push({
        href: '/organisationalunits/locations/externalidentifiers',
        property: 'location',
        alias: 'externalIdentifiers'
      });
    }
    return options;
  };

  const manageDatesForSchoolLocation = async function(location, batch, oldStartDate, oldEndDate, adaptEpds, ) {
    const options = getOptionsForSchoolLocation(location, batch, oldStartDate, oldEndDate);
    const ret = await dateUtils.manageDateChanges(location, options, api);
    if(ret) {
      for(let epdLoc of ret.epdLocations) {
        await manageDatesForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds);
      }

      const classesAtSameLocation = await classUtils.getClassLocationsAtCampus(location);
      ret.classes = [];
      const errors = [];
      for(let classLocation of classesAtSameLocation) {
        try {
          let changed = dateUtils.adaptPeriod(location, Object.assign({intermediateStrategy: 'FORCE'}, options), classLocation);
          if(changed) {
            ret.classes.push(classLocation);
            if(batch) {
              batch.push({
                href: classLocation.$$meta.permalink,
                verb: 'PUT',
                body: classLocation
              });
            }
          }
        } catch(error) {
          if(error instanceof dateUtils.DateError) {
            errors.push(error);
          } else {
            throw error;
          }
        }
      }
      if(errors.length > 0) {
        throw new dateUtils.DateError('There are some class locations that can not be adapted', errors);
      }
    }

    return ret;
  };
  const manageDeletesForSchoolLocation = async function(location, batch, doNotAdaptSchoolDependencies) {
    const options = getOptionsForSchoolLocation(location, batch);
    const ret = await dateUtils.manageDeletes(location, options, api);
    if(ret && !doNotAdaptSchoolDependencies) {
      for(let epdLoc of ret.epdLocations) {
        await manageDeletesForEducationalProgrammeDetailLocation(epdLoc, batch, true);
      }
    }
    if(!doNotAdaptSchoolDependencies) {
      const classesAtSameLocation = await classUtils.getClassesAtCampus(location);
      ret.classes = classesAtSameLocation;
      for(let clazz of classesAtSameLocation) {
        if(batch) {
          batch.push({
            href: clazz.$$meta.permalink,
            verb: 'DELETE'
          });
        }
        await manageDeletesForClass(clazz, batch);
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
  const manageDatesForEducationalProgrammeDetailLocation = async function(epdLoc, batch, oldStartDate, oldEndDate, adaptEpds) {
    const options = getOptionsForEducationalProgrammeDetailLocation(epdLoc, batch, oldStartDate, oldEndDate);
    if(adaptEpds) {
      /*options.references.push({
        href: '/educationalprogrammedetails',
        property: 'educationalProgrammeDetail',
        intermediateStrategy: 'FORCE',
        onlyEnlargePeriod: true
      });*/
      await adaptEducationProgrammeDetailToAllLocations(epdLoc, batch, oldStartDate, oldEndDate);
    }
    return dateUtils.manageDateChanges(epdLoc, options, api);
  };
  const manageDeletesForEducationalProgrammeDetailLocation = async function(epdLoc, batch, adaptEpds) {
    const options = getOptionsForEducationalProgrammeDetailLocation(epdLoc, batch);
    if(adaptEpds) {
      await deleteEducationProgrammeDetailIfLastLocation(epdLoc, batch);
    }
    return dateUtils.manageDeletes(epdLoc, options, api);
  };

  const adaptEducationProgrammeDetailToAllLocations = async (epdLoc, batch, oldStartDate, oldEndDate) => {
    if(epdLoc.startDate === oldStartDate && epdLoc.endDate === oldEndDate) {
      return;
    }
    const epd = epdLoc.educationalProgrammeDetail.$$expanded ? deepcopy(epdLoc.educationalProgrammeDetail.$$expanded) : await api.get(epdLoc.educationalProgrammeDetail.href);
    const oldEpdStartDate = epd.startDate;
    const oldEpdEndDate = epd.endDate;
    let dirty = false;
    //enlarge period
    if(dateUtils.isBefore(epdLoc.startDate, epd.startDate)) {
      epd.startDate = epdLoc.startDate;
      dirty = true;
    }
    if(dateUtils.isAfter(epdLoc.endDate, epd.endDate)) {
      epd.endDate = epdLoc.endDate;
      dirty = true;
    }
    //shorten period;
    if(dateUtils.isAfter(epdLoc.startDate, oldStartDate) || dateUtils.isBefore(epdLoc.endDate, oldEndDate)) {
      const allEpdLocs = await api.getAll('/educationalprogrammedetails/locations', {educationalProgrammeDetail: epdLoc.educationalProgrammeDetail.href});
      const allOtherEpdLocs = allEpdLocs.filter(x => x.key !== epdLoc.key);
      const minStart = allOtherEpdLocs.reduce((acc, val) => dateUtils.isBefore(val.startDate, acc) ? val.startDate : acc, epdLoc.startDate);
      const maxEnd = allOtherEpdLocs.reduce((acc, val) => dateUtils.isAfter(val.endDate, acc) ? val.endDate : acc, epdLoc.endDate);
      if(minStart !== epd.startDate || maxEnd !== epd.endDate) {
        epd.startDate = minStart;
        epd.endDate = maxEnd;
        dirty = true;
      }
    }
    if(dirty) {
      batch.push({
        href: epdLoc.educationalProgrammeDetail.href,
        verb: 'PUT',
        body: epd
      });
      if(epd.endDate !== oldEpdEndDate || dateUtils.isAfter(epd.startDate, oldEpdStartDate)) {
        await adaptEducationalProgrammeDetailsOfClasses(epd, batch, oldStartDate, oldEndDate);
      }
      return epd;
    }
  };

  const deleteEducationProgrammeDetailIfLastLocation = async (epdLoc, batch) => {
    const allEpdLocs = await api.getAll('/educationalprogrammedetails/locations', {educationalProgrammeDetail: epdLoc.educationalProgrammeDetail.href});
    const allOtherEpdLocs = allEpdLocs.filter(x => x.key !== epdLoc.key);
    if(allOtherEpdLocs.length === 0) {
      batch.push({
        href: epdLoc.educationalProgrammeDetail.href,
        verb: 'DELETE'
      });
      await deleteEducationalProgrammeDetailsOfClasses(await api.get(epdLoc.educationalProgrammeDetail.href), batch);
      return true;
    }
  };

  const adaptEducationalProgrammeDetailsOfClasses = async function(epd, batch, oldStartDate, oldEndDate) {
    const options = {
      oldStartDate: oldStartDate,
      oldEndDate: oldEndDate,
      intermediateStrategy: 'FORCE',
      batch: batch
    };
    const classEpds = await classUtils.getClassEpdsForSameAg(epd);
    const ret = [];
    const errors = [];
    for(let classEpd of classEpds) {
      try {
        let changed = dateUtils.adaptPeriod(epd, options, classEpd);
        if(changed) {
          ret.push(classEpd);
          if(batch) {
            batch.push({
              href: classEpd.$$meta.permalink,
              verb: 'PUT',
              body: classEpd
            });
          }
        }
      } catch(error) {
        if(error instanceof dateUtils.DateError) {
          errors.push(error);
        } else {
          throw error;
        }
      }
    }
    if(errors.length > 0) {
      throw new dateUtils.DateError('There are some educational programme details that can not be adapted', errors);
    }
    return ret;
  };
  const deleteEducationalProgrammeDetailsOfClasses = async function(epd, batch) {
    const classEpds = await classUtils.getClassEpdsForSameAg(epd);
    for(let classEpd of classEpds) {
      if(batch) {
        batch.push({
          href: classEpd.$$meta.permalink,
          verb: 'DELETE'
        });
      }
    }
    return classEpds;
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
    manageDeletesForEducationalProgrammeDetailLocation: manageDeletesForEducationalProgrammeDetailLocation,
    adaptEducationProgrammeDetailToAllLocations: adaptEducationProgrammeDetailToAllLocations,
    deleteEducationProgrammeDetailIfLastLocation: deleteEducationProgrammeDetailIfLastLocation
  };
};
