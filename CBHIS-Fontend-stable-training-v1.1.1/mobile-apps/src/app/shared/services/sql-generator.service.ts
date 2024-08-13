import { Injectable } from '@angular/core';
import * as Appointment from '../models/appointment';
import * as ILookup from '../models/online-format';

@Injectable({
  providedIn: 'root',
})
export class SqlGeneratorService {
  constructor() {}

  /*----------  SYNC REGION QUIRES  ----------*/
  regionInsertionQuery(regions: ILookup.Region[]) {
    // return empty string if no regions
    if (!regions.length) return '';

    // construct single insert query for each region
    let start = `INSERT INTO Region (
  Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the regions array
    let query = '';
    regions.forEach((region) => {
      // destructuring region object
      const { description, isDeleted, oid } = region;

      // generate insert query
      query += `(
     ${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}
  ),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  /*----------  SYNC CHIEFDOM QUIRES ----------*/
  chiefdomInsertionQuery(chiefdoms: ILookup.Chiefdom[]) {
    // return empty string if no chiefdoms
    if (!chiefdoms.length) return '';

    // construct single insert query for each chiefdom
    let start = `INSERT INTO Chiefdom (
   Oid, Description, TinkhundlaId, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the chiefdoms array
    let query = '';
    chiefdoms.forEach((chiefdom) => {
      // destructuring chiefdom object
      const { description, isDeleted, oid, inkhundlaId } = chiefdom;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${inkhundlaId}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  /* ---------- SYNC TINKHUNDLA QUIRES ---------- */
  tinkhundlaInsertionQuery(tinkhundlas: ILookup.Tinkhundla[]) {
    // return empty string if no tinkhundlas
    if (!tinkhundlas.length) return '';

    // construct single insert query for each tinkhundla
    let start = `INSERT INTO Tinkhundla (
    Oid, Description, RegionId, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the tinkhundlas array
    let query = '';
    tinkhundlas.forEach((tinkhundla) => {
      // destructuring tinkhundla object
      const { description, isDeleted, oid, regionId } = tinkhundla;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${regionId}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  /*----------  SYNC VILLAGE QUIRES ----------*/
  villageInsertionQuery(villages: ILookup.Village[]) {
    // return empty string if no villages
    if (!villages.length) return '';

    // construct single insert query for each village
    let start = `INSERT INTO Village (
   Oid, Description, ChiefdomId, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the villages array
    let query = '';
    villages.forEach((village) => {
      // destructuring village object
      const { description, isDeleted, oid, chiefdomId } = village;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${chiefdomId}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  /*----------  SYNC ANC TOPIC QUIRES ----------*/
  ancTopicInsertionQuery(topics: ILookup.AncTopicValue[]) {
    // return empty string if no topics
    if (!topics.length) return '';

    // construct single insert query for each topic
    let start = `INSERT INTO ANCTopic (
   Oid, Description, Jobaid, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;
    // loop through the topics array
    let query = '';
    topics.forEach((topic) => {
      // destructuring topic object
      const { description, jobaid, isDeleted, oid } = topic;

      // Skip the topic if isDeleted is true
      // if (isDeleted) return;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${JSON.stringify(jobaid)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  ancTopicUpdateQuery(topic: ILookup.AncTopicValue[]) {
    if (!topic.length) return '';

    let queries: string[] = [];

    topic.forEach((topic) => {
      const { description, jobaid, isDeleted, oid } = topic;

      let query = `UPDATE ANCTopic SET
      Description = ${JSON.stringify(description)},
      Jobaid = ${JSON.stringify(jobaid)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  ancTopicDeleteQuery(topic: ILookup.AncTopicValue[]) {
    if (!topic.length) return '';

    let queries: string[] = [];

    topic.forEach((topic) => {
      const { isDeleted, oid } = topic;

      let query = `UPDATE ANCTopic SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC DRINKING WATER SOURCE QUIRES ----------*/
  drinkingWaterSourceInsertionQuery(sources: ILookup.DrinkWaterSourceValue[]) {
    // return empty string if no sources
    if (!sources.length) return '';

    // construct single insert query for each source
    let start = `INSERT INTO DrinkingWaterSource (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;
    // loop through the sources array
    let query = '';
    sources.forEach((source) => {
      // destructuring source object
      const { description, isDeleted, oid } = source;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  drinkingWaterSourceUpdateQuery(source: ILookup.DrinkWaterSourceValue[]) {
    if (!source.length) return '';

    let queries: string[] = [];

    source.forEach((source) => {
      const { description, isDeleted, oid } = source;

      let query = `UPDATE DrinkingWaterSource SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  drinkingWaterSourceDeleteQuery(source: ILookup.DrinkWaterSourceValue[]) {
    if (!source.length) return '';

    let queries: string[] = [];

    source.forEach((source) => {
      const { isDeleted, oid } = source;

      let query = `UPDATE DrinkingWaterSource SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC SAFE WATER SOURCE QUIRES ----------*/
  safeWaterSourceInsertionQuery(sources: ILookup.SafeWaterSourceValue[]) {
    // return empty string if no sources
    if (!sources.length) return '';

    // construct single insert query for each source
    let start = `INSERT INTO SafeWaterSource (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the sources array
    let query = '';

    sources.forEach((source) => {
      // destructuring source object
      const { description, isDeleted, oid } = source;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  safeWaterSourceUpdateQuery(source: ILookup.SafeWaterSourceValue[]) {
    if (!source.length) return '';

    let queries: string[] = [];

    source.forEach((source) => {
      const { description, isDeleted, oid } = source;

      let query = `UPDATE SafeWaterSource SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  safeWaterSourceDeleteQuery(source: ILookup.SafeWaterSourceValue[]) {
    if (!source.length) return '';

    let queries: string[] = [];

    source.forEach((source) => {
      const { isDeleted, oid } = source;

      let query = `UPDATE SafeWaterSource SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC WASH QUIRES ----------*/
  washInsertionQuery(washes: ILookup.WashValue[]) {
    // return empty string if no washes
    if (!washes.length) return '';

    // construct single insert query for each wash
    let start = `INSERT INTO WASH (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;
    // loop through the washes array
    let query = '';
    washes.forEach((wash) => {
      // destructuring wash object
      const { description, isDeleted, oid } = wash;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  washUpdateQuery(wash: ILookup.WashValue[]) {
    if (!wash.length) return '';

    let queries: string[] = [];

    wash.forEach((wash) => {
      const { description, isDeleted, oid } = wash;

      let query = `UPDATE WASH SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  washDeleteQuery(wash: ILookup.WashValue[]) {
    if (!wash.length) return '';

    let queries: string[] = [];

    wash.forEach((wash) => {
      const { isDeleted, oid } = wash;

      let query = `UPDATE WASH SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC HEALTH EDUCATION TOPIC QUIRES ----------*/
  healthEducationTopicInsertionQuery(topics: ILookup.HealthEducationTopicValue[]) {
    // return empty string if no topics
    if (!topics.length) return '';

    // construct single insert query for each topic
    let start = `INSERT INTO HealthEducationTopic (
   Oid, Description, Jobaid, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the topics array
    let query = '';
    topics.forEach((topic) => {
      // destructuring topic object
      const { description, jobaid, isDeleted, oid } = topic;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${JSON.stringify(jobaid)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  healthEducationTopicUpdateQuery(topic: ILookup.HealthEducationTopicValue[]) {
    if (!topic.length) return '';

    let queries: string[] = [];

    topic.forEach((topic) => {
      const { description, jobaid, isDeleted, oid } = topic;

      let query = `UPDATE HealthEducationTopic SET
      Description = ${JSON.stringify(description)},
      Jobaid = ${JSON.stringify(jobaid)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  healthEducationTopicDeleteQuery(topic: ILookup.HealthEducationTopicValue[]) {
    if (!topic.length) return '';

    let queries: string[] = [];

    topic.forEach((topic) => {
      const { isDeleted, oid } = topic;

      let query = `UPDATE HealthEducationTopic SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC FP METHOD QUIRES ----------*/
  fpMethodInsertionQuery(methods: ILookup.FpMethodValue[]) {
    // return empty string if no methods
    if (!methods.length) return '';

    // construct single insert query for each method
    let start = `INSERT INTO FamilyPlanningMethod (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the methods array
    let query = '';

    methods.forEach((method) => {
      // destructuring method object
      const { description, isDeleted, oid } = method;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  fpMethodUpdateQuery(method: ILookup.FpMethodValue[]) {
    if (!method.length) return '';

    let queries: string[] = [];

    method.forEach((method) => {
      const { description, isDeleted, oid } = method;

      let query = `UPDATE FamilyPlanningMethod SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  fpMethodDeleteQuery(method: ILookup.FpMethodValue[]) {
    if (!method.length) return '';

    let queries: string[] = [];

    method.forEach((method) => {
      const { isDeleted, oid } = method;

      let query = `UPDATE FamilyPlanningMethod SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC MALARIA CONTROL INTERVENTION QUIRES ----------*/
  malariaControlInterventionInsertionQuery(interventions: ILookup.MalariaControlInterventionValue[]) {
    // return empty string if no interventions
    if (!interventions.length) return '';

    // construct single insert query for each intervention
    let start = `INSERT INTO MalariaControlIntervention (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the interventions array
    let query = '';
    interventions.forEach((intervention) => {
      // destructuring intervention object
      const { description, isDeleted, oid } = intervention;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  malariaControlInterventionUpdateQuery(intervention: ILookup.MalariaControlInterventionValue[]) {
    if (!intervention.length) return '';

    let queries: string[] = [];

    intervention.forEach((intervention) => {
      const { description, isDeleted, oid } = intervention;

      let query = `UPDATE MalariaControlIntervention SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  malariaControlInterventionDeleteQuery(intervention: ILookup.MalariaControlInterventionValue[]) {
    if (!intervention.length) return '';

    let queries: string[] = [];

    intervention.forEach((intervention) => {
      const { isDeleted, oid } = intervention;

      let query = `UPDATE MalariaControlIntervention SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC MINIMUM ACCEPTABLE DIET QUIRES ----------*/
  minimumAcceptableDietInsertionQuery(diets: ILookup.MinimumAcceptableDietValue[]) {
    // return empty string if no diets
    if (!diets.length) return '';

    // construct single insert query for each diet
    let start = `INSERT INTO MinimumAcceptableDiet (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;
    // loop through the diets array
    let query = '';
    diets.forEach((diet) => {
      // destructuring diet object
      const { description, isDeleted, oid } = diet;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  minimumAcceptableDietUpdateQuery(diet: ILookup.MinimumAcceptableDietValue[]) {
    if (!diet.length) return '';

    let queries: string[] = [];

    diet.forEach((diet) => {
      const { description, isDeleted, oid } = diet;

      let query = `UPDATE MinimumAcceptableDiet SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  minimumAcceptableDietDeleteQuery(diet: ILookup.MinimumAcceptableDietValue[]) {
    if (!diet.length) return '';

    let queries: string[] = [];

    diet.forEach((diet) => {
      const { isDeleted, oid } = diet;

      let query = `UPDATE MinimumAcceptableDiet SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC MALARIA SYMPTOM QUIRES ----------*/
  malariaSymptomInsertionQuery(symptoms: ILookup.MalariaSymptomValue[]) {
    // return empty string if no symptoms
    if (!symptoms.length) return '';

    // construct single insert query for each symptom
    let start = `INSERT INTO MalariaSymptom (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the symptoms array
    let query = '';
    symptoms.forEach((symptom) => {
      // destructuring symptom object
      const { description, isDeleted, oid } = symptom;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  malariaSymptomUpdateQuery(symptom: ILookup.MalariaSymptomValue[]) {
    if (!symptom.length) return '';

    let queries: string[] = [];

    symptom.forEach((symptom) => {
      const { description, isDeleted, oid } = symptom;

      let query = `UPDATE MalariaSymptom SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  malariaSymptomDeleteQuery(symptom: ILookup.MalariaSymptomValue[]) {
    if (!symptom.length) return '';

    let queries: string[] = [];

    symptom.forEach((symptom) => {
      const { isDeleted, oid } = symptom;

      let query = `UPDATE MalariaSymptom SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC MALARIA RISK QUIRES ----------*/
  malariaRiskInsertionQuery(risks: ILookup.MalariaRiskValue[]) {
    // return empty string if no risks
    if (!risks.length) return '';

    // construct single insert query for each risk
    let start = `INSERT INTO MalariaRisk (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;
    // loop through the risks array
    let query = '';
    risks.forEach((risk) => {
      // destructuring risk object
      const { description, isDeleted, oid } = risk;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  malariaRiskUpdateQuery(risk: ILookup.MalariaRiskValue[]) {
    if (!risk.length) return '';

    let queries: string[] = [];

    risk.forEach((risk) => {
      const { description, isDeleted, oid } = risk;

      let query = `UPDATE MalariaRisk SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  malariaRiskDeleteQuery(risk: ILookup.MalariaRiskValue[]) {
    if (!risk.length) return '';

    let queries: string[] = [];

    risk.forEach((risk) => {
      const { isDeleted, oid } = risk;

      let query = `UPDATE MalariaRisk SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC HBC SERVICE QUIRES ----------*/
  hbcServiceInsertionQuery(services: ILookup.HbcServiceValue[]) {
    // return empty string if no services
    if (!services.length) return '';

    // construct single insert query for each service
    let start = `INSERT INTO HBCService (
    Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the services array
    let query = '';
    services.forEach((service) => {
      // destructuring service object
      const { description, isDeleted, oid } = service;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  hbcServiceUpdateQuery(service: ILookup.HbcServiceValue[]) {
    if (!service.length) return '';

    let queries: string[] = [];

    service.forEach((service) => {
      const { description, isDeleted, oid } = service;

      let query = `UPDATE HBCService SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  hbcServiceDeleteQuery(service: ILookup.HbcServiceValue[]) {
    if (!service.length) return '';

    let queries: string[] = [];

    service.forEach((service) => {
      const { isDeleted, oid } = service;

      let query = `UPDATE HBCService SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC SERVICE CATEGORY QUIRES ----------*/
  insertServiceCategoryQuery(categories: ILookup.ServiceCategoryValue[]) {
    // return empty string if no categories
    if (!categories.length) return '';

    // construct single insert query for each category
    let start = `INSERT INTO ServiceCategory (
    Oid, Description, IsSynced, OnlineDbOid, IsDeleted
  ) VALUES `;

    // loop through the categories array
    let query = '';
    categories.forEach((category) => {
      // destructuring category object
      const { oid, description, isDeleted } = category;

      // assuming OnlineDbOid is the same as Oid for simplicity
      // and IsSynced is set to 1 for all new entries
      query += `(${oid}, ${JSON.stringify(description)}, 1, '${oid}', ${Number(isDeleted)}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  updateServiceCategoryQuery(categories: ILookup.ServiceCategoryValue[]) {
    // return empty string if no categories
    if (!categories.length) return '';

    let queries: string[] = [];

    categories.forEach((category) => {
      const { oid, description, isDeleted } = category;

      let query = `UPDATE ServiceCategory SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  deleteServiceCategoryQuery(categories: ILookup.ServiceCategoryValue[]) {
    // return empty string if no categories
    if (!categories.length) return '';

    let queries: string[] = [];

    categories.forEach((category) => {
      const { oid, isDeleted } = category;

      let query = `UPDATE ServiceCategory SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC TB EDUCATION TOPIC QUIRES ----------*/
  tbEductionTopicInsertionQuery(topics: ILookup.TbEducationTopicValue[]) {
    // return empty string if no topics
    if (!topics.length) return '';

    // construct single insert query for each topic
    let start = `INSERT INTO TBEducationTopic (
   Oid, Description, JobAid, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;
    // loop through the topics array
    let query = '';
    topics.forEach((topic) => {
      // destructuring topic object
      const { description, jobaid, isDeleted, oid } = topic;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${JSON.stringify(jobaid)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  tbEductionTopicUpdateQuery(topic: ILookup.TbEducationTopicValue[]) {
    if (!topic.length) return '';

    let queries: string[] = [];

    topic.forEach((topic) => {
      const { description, jobaid, isDeleted, oid } = topic;

      let query = `UPDATE TBEducationTopic SET
      Description = ${JSON.stringify(description)},
      JobAid = ${JSON.stringify(jobaid)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  tbEductionTopicDeleteQuery(topic: ILookup.TbEducationTopicValue[]) {
    if (!topic.length) return '';

    let queries: string[] = [];

    topic.forEach((topic) => {
      const { isDeleted, oid } = topic;

      let query = `UPDATE TBEducationTopic SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC HIV PREVENTATIVE SERVICE QUIRES ----------*/
  hivPreventativeServiceInsertionQuery(services: ILookup.HivPreventativeServiceValue[]) {
    // return empty string if no services
    if (!services.length) return '';

    // construct single insert query for each service
    let start = `INSERT INTO HivPreventativeService (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the services array
    let query = '';
    services.forEach((service) => {
      // destructuring service object
      const { description, isDeleted, oid } = service;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  hivPreventativeServiceUpdateQuery(service: ILookup.HivPreventativeServiceValue[]) {
    if (!service.length) return '';

    let queries: string[] = [];

    service.forEach((service) => {
      const { description, isDeleted, oid } = service;

      let query = `UPDATE HivPreventativeService SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  hivPreventativeServiceDeleteQuery(service: ILookup.HivPreventativeServiceValue[]) {
    if (!service.length) return '';

    let queries: string[] = [];

    service.forEach((service) => {
      const { isDeleted, oid } = service;

      let query = `UPDATE HivPreventativeService SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC NCD CONDITION QUIRES ----------*/
  ncdConditionInsertionQuery(conditions: ILookup.NcdConditionValue[]) {
    // return empty string if no conditions
    if (!conditions.length) return '';

    // construct single insert query for each condition
    let start = `INSERT INTO NCDCondition (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the conditions array
    let query = '';

    conditions.forEach((condition) => {
      // destructuring condition object
      const { description, isDeleted, oid } = condition;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  ncdConditionUpdateQuery(condition: ILookup.NcdConditionValue[]) {
    if (!condition.length) return '';

    let queries: string[] = [];

    condition.forEach((condition) => {
      const { description, isDeleted, oid } = condition;

      let query = `UPDATE NCDCondition SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  ncdConditionDeleteQuery(condition: ILookup.NcdConditionValue[]) {
    if (!condition.length) return '';

    let queries: string[] = [];

    condition.forEach((condition) => {
      const { isDeleted, oid } = condition;

      let query = `UPDATE NCDCondition SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC DANGER SIGN QUIRES ----------*/
  dangerSignInsertionQuery(signs: ILookup.DangerSignValue[]) {
    // return empty string if no signs
    if (!signs.length) return '';

    // construct single insert query for each sign
    let start = `INSERT INTO DangerSign (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the signs array
    let query = '';
    signs.forEach((sign) => {
      // destructuring sign object
      const { description, isDeleted, oid } = sign;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  dangerSignUpdateQuery(sign: ILookup.DangerSignValue[]) {
    if (!sign.length) return '';

    let queries: string[] = [];

    sign.forEach((sign) => {
      const { description, isDeleted, oid } = sign;

      let query = `UPDATE DangerSign SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  dangerSignDeleteQuery(sign: ILookup.DangerSignValue[]) {
    if (!sign.length) return '';

    let queries: string[] = [];

    sign.forEach((sign) => {
      const { isDeleted, oid } = sign;

      let query = `UPDATE DangerSign SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC POSTPARTUM DEPRESSION QUIRES ----------*/
  postpartumDepressionInsertionQuery(depressions: ILookup.PostpartumDepressionValue[]) {
    // return empty string if no depressions
    if (!depressions.length) return '';

    // construct single insert query for each depression
    let start = `INSERT INTO PostpartumDepression (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the depressions array
    let query = '';

    depressions.forEach((depression) => {
      // destructuring depression object
      const { description, isDeleted, oid } = depression;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  postpartumDepressionUpdateQuery(depression: ILookup.PostpartumDepressionValue[]) {
    if (!depression.length) return '';

    let queries: string[] = [];

    depression.forEach((depression) => {
      const { description, isDeleted, oid } = depression;

      let query = `UPDATE PostpartumDepression SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  postpartumDepressionDeleteQuery(depressions: ILookup.PostpartumDepressionValue[]) {
    if (!depressions.length) return '';

    let queries: string[] = [];

    depressions.forEach((depression) => {
      const { isDeleted, oid } = depression;

      let query = `UPDATE PostpartumDepression SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC FEEDING METHOD QUIRES ----------*/
  feedingMethodInsertionQuery(methods: ILookup.FeedingMethodValue[]) {
    // return empty string if no methods
    if (!methods.length) return '';

    // construct single insert query for each method
    let start = `INSERT INTO FeedingMethod (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the methods array
    let query = '';

    methods.forEach((method) => {
      // destructuring method object
      const { description, isDeleted, oid } = method;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  feedingMethodUpdateQuery(method: ILookup.FeedingMethodValue[]) {
    if (!method.length) return '';

    let queries: string[] = [];

    method.forEach((method) => {
      const { description, isDeleted, oid } = method;

      let query = `UPDATE FeedingMethod SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  feedingMethodDeleteQuery(method: ILookup.FeedingMethodValue[]) {
    if (!method.length) return '';

    let queries: string[] = [];

    method.forEach((method) => {
      const { isDeleted, oid } = method;

      let query = `UPDATE FeedingMethod SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC DIETARY DIVERSITY QUIRES ----------*/
  dietaryDiversityInsertionQuery(diversities: ILookup.DietaryDiversityValue[]) {
    // return empty string if no diversities
    if (!diversities.length) return '';

    // construct single insert query for each diversity
    let start = `INSERT INTO DietaryDiversity (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the diversities array
    let query = '';
    diversities.forEach((diversity) => {
      // destructuring diversity object
      const { description, isDeleted, oid } = diversity;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  dietaryDiversityUpdateQuery(diversities: ILookup.DietaryDiversityValue[]) {
    if (!diversities.length) return '';

    let queries: string[] = [];

    diversities.forEach((diversity) => {
      const { description, isDeleted, oid } = diversity;

      let query = `UPDATE DietaryDiversity SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  dietaryDiversityDeleteQuery(diversities: ILookup.DietaryDiversityValue[]) {
    if (!diversities.length) return '';

    let queries: string[] = [];

    diversities.forEach((diversity) => {
      const { isDeleted, oid } = diversity;

      let query = `UPDATE DietaryDiversity SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC ADVERSE EVENT QUIRES ----------*/
  adverseEventInsertionQuery(events: ILookup.AdverseEventValue[]) {
    // return empty string if no events
    if (!events.length) return '';

    // construct single insert query for each event
    let start = `INSERT INTO AdverseEvent (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;
    // loop through the events array
    let query = '';
    events.forEach((event) => {
      // destructuring event object
      const { description, isDeleted, oid } = event;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  adverseEventUpdateQuery(events: ILookup.AdverseEventValue[]) {
    if (!events.length) return '';

    let queries: string[] = [];

    events.forEach((event) => {
      const { description, isDeleted, oid } = event;

      let query = `UPDATE AdverseEvent SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  adverseEventDeleteQuery(event: ILookup.AdverseEventValue[]) {
    if (!event.length) return '';

    let queries: string[] = [];

    event.forEach((event) => {
      const { isDeleted, oid } = event;

      let query = `UPDATE AdverseEvent SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC TB SYMPTOMS QUIRES ----------*/
  tbSymptomInsertionQuery(symptoms: ILookup.TbSymptomValue[]) {
    // return empty string if no symptoms
    if (!symptoms.length) return '';

    // construct single insert query for each symptom
    let start = `INSERT INTO TbSymptom (
   Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;
    // loop through the symptoms array
    let query = '';

    symptoms.forEach((symptom) => {
      // destructuring symptom object
      const { description, isDeleted, oid } = symptom;

      // generate insert query
      query += `(${oid},${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  tbSymptomUpdateQuery(symptoms: ILookup.TbSymptomValue[]) {
    if (!symptoms.length) return '';

    let queries: string[] = [];

    symptoms.forEach((symptom) => {
      const { description, isDeleted, oid } = symptom;

      let query = `UPDATE TbSymptom SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  tbSymptomDeleteQuery(symptoms: ILookup.TbSymptomValue[]) {
    if (!symptoms.length) return '';

    let queries: string[] = [];

    symptoms.forEach((symptom) => {
      const { isDeleted, oid } = symptom;

      let query = `UPDATE TbSymptom SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC TB CONTROL ASSESSMENT QUIRES ----------*/
  tbControlAssessmentInsertionQuery(assessments: ILookup.TbControlAssessmentValue[]) {
    // return empty string if no assessments
    if (!assessments.length) return '';

    // construct single insert query for each assessment
    let start = `INSERT INTO TbControlAssessment (
      Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the assessments array
    let query = '';
    assessments.forEach((assessment) => {
      // destructuring assessment object
      const { description, isDeleted, oid } = assessment;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  tbControlAssessmentUpdateQuery(assessments: ILookup.TbControlAssessmentValue[]) {
    if (!assessments.length) return '';

    let queries: string[] = [];

    assessments.forEach((assessment) => {
      const { description, isDeleted, oid } = assessment;

      let query = `UPDATE TbControlAssessment SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  tbControlAssessmentDeleteQuery(assessments: ILookup.TbControlAssessmentValue[]) {
    if (!assessments.length) return '';

    let queries: string[] = [];

    assessments.forEach((assessment) => {
      const { isDeleted, oid } = assessment;

      let query = `UPDATE TbControlAssessment SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC TB ENVIRONMENTAL ASSESSMENT QUIRES ----------*/
  tbEnvironmentalAssessmentInsertionQuery(assessments: ILookup.TbEnvironmentalAssessmentValue[]) {
    // return empty string if no assessments
    if (!assessments.length) return '';

    // construct single insert query for each assessment
    let start = `INSERT INTO TBEnvironmentalAssessment (
    Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the assessments array
    let query = '';

    assessments.forEach((assessment) => {
      // destructuring assessment object
      const { description, isDeleted, oid } = assessment;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  tbEnvironmentalAssessmentUpdateQuery(assessments: ILookup.TbEnvironmentalAssessmentValue[]) {
    if (!assessments.length) return '';

    let queries: string[] = [];

    assessments.forEach((assessment) => {
      const { description, isDeleted, oid } = assessment;

      let query = `UPDATE TBEnvironmentalAssessment SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  tbEnvironmentalAssessmentDeleteQuery(assessments: ILookup.TbEnvironmentalAssessmentValue[]) {
    if (!assessments.length) return '';

    let queries: string[] = [];

    assessments.forEach((assessment) => {
      const { isDeleted, oid } = assessment;

      let query = `UPDATE TBEnvironmentalAssessment SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /*----------  SYNC BREASTFEEDING AND COMPLIMENTARY FEEDING QUIRES ----------*/
  breastfeedingAndComplimentaryFeedingInsertionQuery(feedings: ILookup.BreastfeedingAndComplimentaryFeedingValue[]) {
    // return empty string if no feedings
    if (!feedings.length) return '';

    let start = `INSERT INTO BreastFeedingAndComplementaryFeeding (
    Oid, Description, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    // loop through the feedings array
    let query = '';
    feedings.forEach((feeding) => {
      // destructuring feeding object
      const { description, isDeleted, oid } = feeding;

      // generate insert query
      query += `(${oid}, ${JSON.stringify(description)}, ${Number(isDeleted)}, 1, ${oid}),`;
    });

    // remove the last comma from the query
    query = query.slice(0, -1);

    // return the query
    return start + query + ';';
  }

  breastfeedingAndComplimentaryFeedingUpdateQuery(feedings: ILookup.BreastfeedingAndComplimentaryFeedingValue[]) {
    if (!feedings.length) return '';

    let queries: string[] = [];

    feedings.forEach((feeding) => {
      const { description, isDeleted, oid } = feeding;

      let query = `UPDATE BreastFeedingAndComplementaryFeeding SET
      Description = ${JSON.stringify(description)},
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  breastfeedingAndComplimentaryFeedingDeleteQuery(feedings: ILookup.BreastfeedingAndComplimentaryFeedingValue[]) {
    if (!feedings.length) return '';

    let queries: string[] = [];

    feedings.forEach((feeding) => {
      const { isDeleted, oid } = feeding;

      let query = `UPDATE BreastFeedingAndComplementaryFeeding SET
      IsDeleted = ${Number(isDeleted)},
      IsSynced = 1
      WHERE Oid = ${oid};`;

      queries.push(query);
    });

    return queries;
  }

  /* ---------- SYNC APPOINTMENT QUIRES ---------- */
  appointmentInsertionQuery(appointment: Appointment.AppointmentData) {
    // return empty string if no appointments
    if (!Object.values(appointment || {}).length) return '';

    // construct single insert query for each appointment
    let query = `INSERT INTO AssignedAppointment ( TransactionId, UserId, AppointmentType, AppointmentDate, Details,
    ClientId, Status, Priority, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES (
    ${appointment.oid},
    ${JSON.stringify(appointment.userId)},
    ${JSON.stringify(appointment.appointmentType)},
    ${JSON.stringify(appointment.appointmentDate)},
    ${JSON.stringify(appointment.details)},
    ${JSON.stringify(appointment.clientId)},
    ${JSON.stringify(appointment.status)},
    ${JSON.stringify(appointment.priority)},
    ${Number(appointment.isDeleted)}, 1,
    ${appointment.oid}
    );`;

    // return the query
    return query;
  }

  /* ---------- SYNC CLIENT QUIRES ---------- */
  clientInsertionQuery(clients: Appointment.Client[]) {
    // return empty string if no clients
    if (!clients.length) return '';

    // construct single insert query for each client
    let start = `INSERT INTO Client (
    Oid, FirstName, MiddleName, LastName, Age, DOB, Sex, MaritalStatus, PIN, Cellphone,
    EducationLevel, Occupation, HasBirthCertificate, IsDisabled, IsDeceased, DateDeceased,
    IsFamilyHead, RelationalType, FamilyHeadId, VillageId, IsDeleted, IsSynced, OnlineDbOid
  ) VALUES `;

    clients.sort((a, b) => (b.isFamilyHead ? 1 : 0) - (a.isFamilyHead ? 1 : 0));

    // loop through the clients array sdfsd
    let query: string[] = [];
    clients.forEach((client) => {
      // generate insert query
      const sql =
        start +
        `(
      ${JSON.stringify(client.oid)},
      ${client.firstName ? JSON.stringify(client.firstName) : null},
      ${client.middleName ? JSON.stringify(client.middleName) : null},
      ${client.lastName ? JSON.stringify(client?.lastName) : null},
      ${client.age},
      ${client.dob ? JSON.stringify(client.dob) : null},
      ${client.sex},
      ${client.maritalStatus},
      ${client.pin ? JSON.stringify(client.pin) : null},
      ${client.cellphone ? JSON.stringify(client.cellphone) : null},
      ${client.educationLevel},
      ${client.occupation ? JSON.stringify(client.occupation) : null},
      ${Number(client.hasBirthCertificate)},
      ${Number(client.isDisabled)}, ${Number(client.isDeceased)},
      ${client.dateDeceased ? JSON.stringify(client.dateDeceased) : null},
      ${Number(client.isFamilyHead)}, ${client.relationalType},
      ${client.familyHeadId ? JSON.stringify(client.familyHeadId) : null},
      ${client.villageId}, ${Number(client.isDeleted)}, 1, ${JSON.stringify(client.oid)}
      );`;

      query.push(sql);
    });

    return query;
  }

  updateANCItem(item: any, onlineDbOid: string) {
    const baseUpdateQuery = `
        UPDATE ANC SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateFamilyPlanItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE FamilyPlan SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateChildGrowthMonitoringItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE ChildGrowthMonitoring SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateClientMinimumAcceptableDietItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE ClientMinimumAcceptableDiet SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateCounselingItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE Counseling SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateHIVSelfTestItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE HIVSelfTest SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateARTClientItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE ARTClient SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateClientTBSymptomItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE ClientTBSymptom SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateClientTBEnvironmentalAssessmentItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE ClientTBEnvironmentalAssessment SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateMalariaCaseFindingItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE MalariaCaseFinding SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateMalariaPreventionItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE MalariaPrevention SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }
  updateHouseholdControlInterventionItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE HouseholdControlIntervention SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateHBCClientAssessmentItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE HBCClientAssessment SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }
  updateClientNCDHistoryItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE ClientNCDHistory SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];

    return { query: baseUpdateQuery, params };
  }

  updateChildImmunizationItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE ChildImmunization SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];
    return { query: baseUpdateQuery, params };
  }

  updatePostNatalItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE PostNatal SET
        OnlineDbOid = ?
        WHERE
        TransactionId = ?
    `;
    const params = [onlineDbOid, item.transactionId];
    return { query: baseUpdateQuery, params };
  }

  updateImmunizationAdverseEventItem(onlineDbOid: string, item: any) {
    const baseUpdateQuery = `
        UPDATE ImmunizationAdverseEvent SET
        OnlineDbOid = ?
        WHERE
        Oid = ?
    `;
    const params = [onlineDbOid, item.transactionId];
    return { query: baseUpdateQuery, params };
  }
}
