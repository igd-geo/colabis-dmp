import { Injectable } from '@angular/core';

import { Resource } from '../resources';

export enum QualificationStatus {
  ERROR,
  INCOMPLETE,
  SUFFICIENT,
  VALID
}

@Injectable()
export class QualificationService {
  /* tslint:disable */
  private rules = {
    'Title': {
      description: 'Titel des Datensatzes',
      regex: /^[^\n]+$/,
      required: true
    },
    'Abstract': {
      description: 'Kurzbeschreibung des Datensatz',
      regex: /^.+$/
    },
    'Date': {
      description: 'Datum der Erzeugung, Veröffentlichung oder Aktualisierung',
      regex: /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/,
      required: true,
      example: "2014-12-06"
    },
    'Author': {
      description: 'Author des Datensatzes',
      regex: /^[^\n]+$/,
      required: true
    },
    'Organisation': {
      description: 'Zuständige Organisation',
      regex: /^[^\n]+$/,
      required: true
    },
    'Email': {
      description: 'Kontakt-Email',
      regex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      required: true
    },
    'Phone': {
      description: 'Kontakt-Telefon',
      regex: /^\+(?:[0-9] ?){6,14}[0-9]$/
    },
    'Spatial extent': {
      description: 'Räumliche Ausdehnung, BBOX in WGS84 lat/lon',
      regex: /^(-?\d{1,3}(\.\d*))\,(-?\d{1,2}(\.\d*))\,(-?\d{1,3}(\.\d*))\,(-?\d{1,2}(\.\d*))$/,
      example: "-123.5,-40.0,165.4,90.0"
    },
    'Temporal extent': {
      description: 'Zeitliche Ausdehnung, Start / Ende',
      regex: /^((\d{4})(-(\d{2})(-(\d{2}))?)?(\T(\d{2})(\:(\d{2})(\:(\d{2}))?)?(([+-](\d{2})\:(\d{2}))|\Z))?)\/(\1)$/,
      example: "2014-12-06/2012-12-31 or 2014-12-06T12:13:11Z/2014-12-31T12:13:11Z"
    },
    'Language': {
      description: 'Sprache des Datensates (Attribute etc.)',
      regex: /^.+$/,
      optional: true
    },
    'Theme': {
      description: 'Thematik des Datensatzes',
      regex: /^.+$/
    },
    'License': {
      description: 'Nutzungs- und Weitergabelizenz',
      regex: /^.+$/
    },
    'Spatial Resolution': {
      description: 'Räumliche Auflösung der Daten',
      regex: /^.+$/
    },
    'Temporal Resolution': {
      description: 'Zeitliche Auflösung der Daten',
      regex: /^.+$/
    },
    'Source': {
      description: 'Herkunft des Datensatz',
      regex: /^.+$/,
      optional: true
    },
    'Schema-Descriptor': {
      description: 'CSV Description Schema',
      regex: /.+/,
      mimetype: 'text/csv',
      multiline: true
    }
  }
  /* tslint:enable */

  constructor() {}

  qualify(resource: Resource) {
    let status = this.status(resource);
    let error = status === QualificationStatus.ERROR ? this.error(resource) : undefined;
    let unavailable = this.unavailable(resource);
    return Object.assign(resource, {
      qualification: {
        status: status,
        error: error,
        unavailable: unavailable,
        is_valid: status >= QualificationStatus.VALID,
        is_sufficient: status >= QualificationStatus.SUFFICIENT
      }
    });
  }

  status(resource: Resource) {
    return Object.keys(this.rules).reduce((status, key) => {
      let report = this._applyRule(key, resource);
      return Math.min(status, report.status);
    }, QualificationStatus.VALID);
  }

  error(resource: Resource): any {
    return Object.keys(this.rules)
      .reduce((result, key) => {
        let report = this._applyRule(key, resource);
        if (report.status === QualificationStatus.ERROR) {
          result[key] = this.rules[key];
          result[key].message = report.message;
        }
        return result;
      }, {});
  }

  unavailable(resource: Resource): any {
    return Object.keys(this.rules)
      .filter(k => !this.rules[k].optional)
      .filter(k => !resource.properties[k] && !resource.extras[k])
      .reduce((result, key) => {
        result[key] = this.rules[key];
        return result;
      }, {});
  }

  getDescription(key: any) {
    return (!this.rules.hasOwnProperty(key) ? "" : this.rules[key].description);
  }

  getRequired(key: any) {
    return (!this.rules.hasOwnProperty(key) ? false : this.rules[key].required);
  }

  getMimetype(key: any) {
    return (!this.rules.hasOwnProperty(key) ? "" : this.rules[key].mimetype);
  }

  getExample(key: any) {
      return (!this.rules.hasOwnProperty(key) ? "" : this.rules[key].example);
  }

  private _applyRule(key: string, resource: Resource) {
    let valid = { status: QualificationStatus.VALID, message: 'Property ' + key + ' is valid' };
    let rule = this.rules[key];

    // There is no rule
    if (!rule) return valid;

    // Rule only applies for specific mimetypes 
    if (rule.mimetype) {
      let regex = new RegExp(rule.mimetype);
      if (!regex.test(resource.mimetype)) return valid;
    }

    let property = resource.properties[key];
    let extra = resource.extras[key];

    // Property should be present
    if (!property && !extra) {
      if (rule.required) {
        return {
          status: QualificationStatus.INCOMPLETE,
          message: 'Property ' + key + ' must be present'
        };
      }
      if (!rule.optional) {
        return {
          status: QualificationStatus.SUFFICIENT,
          message: 'Property ' + key + ' should be present'
        };
      }
    } else {
      // Property should match
      if (rule.regex && (!new RegExp(rule.regex).test(extra) ) &&
        (!new RegExp(rule.regex).test(property))) {
        return {
          status: QualificationStatus.ERROR,
          message: 'Property ' + key + ' does not contain a valid value. ' + rule.example
        };
      }
    }
    return valid;
  }
}
