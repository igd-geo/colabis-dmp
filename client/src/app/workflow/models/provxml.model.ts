import * as xml2js from 'xml2js';

import { Activity } from './activity.model';
import { Entity } from './entity.model';
import { Organization } from './organization.model';

export class ProvXML {

  private _text: string;
  private _xml: any;
  private _entities: Entity[];
  private _activities: Activity[];
  private _organizations: Organization[];

  constructor(text: string) {
    this.text = text;
  }

  public set text(text: string) {
    this._text = text.replace(/[\r\n]+\s*/, "");
    xml2js.parseString(text, {
      tagNameProcessors: [xml2js.processors.stripPrefix],
      attrNameProcessors: [xml2js.processors.stripPrefix]
    }, (err, res) => {
      if (!err) {
        this.parseXml(res);
      } else {
        console.error("Failed to parse ProvXML");
      }
    });
  }

  public get text(): string { return this._text; }

  private parseXml(xml: any) {
    this._xml = xml;
    this._entities = ProvXML.parseEntities(xml);
    this._activities = ProvXML.parseActivities(xml);
    this._organizations = ProvXML.parseOrganizations(xml);
  }

  public get xml(): any { return this._xml; }

  public get entities(): Entity[] { return this._entities; }
  public get activities(): Activity[] { return this._activities; }
  public get organizations(): Organization[] { return this._organizations; }

  private static parseEntities(xml: any): Entity[] {
    if (!xml || !xml['document']) return [];
    let doc = xml.document;
    // create entities
    return doc.entity.map(e => {
      return new Entity(
        e.$.id,
        // find attributedTo
        doc.wasAttributedTo
           .filter(x => x.entity[0].$.ref == e.$.id)
           .map(attr => attr.agent[0].$.ref),
         // find generatedBy
         doc.wasGeneratedBy
             .filter(x => x.entity[0].$.ref == e.$.id)
             .map(attr => attr.activity[0].$.ref));
    })
  }

  private static parseActivities(xml: any): Activity[] {
    if (!xml || !xml['document']) return [];
    let doc = xml.document;
    // create activities
    return doc.activity.map(a => {
      return new Activity(
        a.$.id,
        // find used
        doc.used
           .filter(x => x.activity[0].$.ref == a.$.id)
           .map(attr => attr.entity[0].$.ref),
         // find associatedWith
         doc.wasAssociatedWith
             .filter(x => x.activity[0].$.ref == a.$.id)
             .map(attr => attr.agent[0].$.ref));
    })
  }

  private static parseOrganizations(xml: any): Organization[] {
    if (!xml || !xml['document']) return [];
    let doc = xml.document;
    // create organizations
    return doc.organization.map(o => {
      return new Organization(o.$.id);
    })
  }
}
