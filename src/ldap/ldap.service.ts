import { Injectable } from '@nestjs/common';
import * as ldap from 'ldapjs';
import * as dotenv from 'dotenv';

dotenv.config();

const LDAP_ADMIN_USERNAME = process.env.LDAP_USERNAME!;
const LDAP_ADMIN_PASSWORD = process.env.LDAP_PASSWORD!;

const maindn = 'dc=ldap,dc=iitm,dc=ac,dc=in';
const rootdn = `cn=${LDAP_ADMIN_USERNAME},ou=bind,${maindn}`;

@Injectable()
export class LdapService {
  private ldapClient: ldap.Client | null;
  constructor() {
    this.ldapClient = null;
    if (this.ldapClient === null) this.connect();
  }

  // Connect to Ldap server
  connect() {
    try {
      if (process.env.NODE_ENV === 'production' && this.ldapClient === null) {
        this.ldapClient = ldap.createClient({
          url: 'ldap://ldap.iitm.ac.in:389',
          reconnect: true,
        });
      }
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  // Check LDAP athentication
  auth(roll: string, password: string) {
    try {
      this.connect();
      const client = this.ldapClient;
      return new Promise((resolve, reject) => {
        client!.bind(rootdn, LDAP_ADMIN_PASSWORD, function (err) {
          if (err) return reject(err);

          client!.search(
            maindn,
            {
              filter: `(&(uid=${roll}))`,
              scope: 'sub',
            },
            (err: ldap.Error | null, search: ldap.SearchCallbackResponse) => {
              if (err) return reject(err);

              let found = false;
              search.once('searchEntry', (res) => {
                found = true;
                client!.bind(res.dn, password, (err: ldap.Error | null) => {
                  if (err) return reject(err);
                  return resolve(res.object);
                });
              });

              search.once('end', () => {
                if (!found)
                  return reject({
                    name: 'DoesNotExistError',
                    message: "The roll number doesn't exist",
                  });
              });
            },
          );
        });
      });
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  // Search user in LDAP
  search(searchStr: string, _sizeLimit?: number | undefined) {
    try {
      this.connect();
      const client = this.ldapClient;
      return new Promise((resolve, reject) => {
        client!.bind(rootdn, LDAP_ADMIN_PASSWORD, function (err) {
          if (err) return reject(err);

          let filterStr: string = '';
          searchStr
            .split(' ')
            .map(
              (_str) =>
                (filterStr = `${filterStr}(|(uid=*${_str}*)(displayName=*${_str}*))`),
            );

          client!.search(
            `ou=student,${maindn}`,
            {
              filter: `(&${filterStr}(!(uid=*exp*))(!(uid=*cancel*)))`,
              scope: 'sub',
              paged: true,
              sizeLimit: 0,
            },
            (err: ldap.Error | null, res: ldap.SearchCallbackResponse) => {
              if (err) return reject(err);

              let users: any[] = [];

              res.on('searchEntry', (entry: ldap.SearchEntry) => {
                users.push(entry.object);
              });

              res.on('error', (err: ldap.Error) => {
                return reject(err);
              });

              res.on('end', (_result: ldap.LDAPResult | null) => {
                return resolve(users);
              });
            },
          );
        });
      });
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}
