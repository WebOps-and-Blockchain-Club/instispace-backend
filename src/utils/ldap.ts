import ldap from "ldapjs";
import dotenv from "dotenv";

dotenv.config();

const LDAP_ADMIN_USERNAME = process.env.LDAP_USERNAME!;
const LDAP_ADMIN_PASSWORD = process.env.LDAP_PASSWORD!;

const maindn = "dc=ldap,dc=iitm,dc=ac,dc=in";
const rootdn = `cn=${LDAP_ADMIN_USERNAME},ou=bind,${maindn}`;

class LDAPClient {
  ldapClient: ldap.Client | null;

  constructor() {
    this.ldapClient = null;
    if (this.ldapClient === null) this.connect();
  }

  // Connect to Ldap server
  connect() {
    if (process.env.NODE_ENV === "production" && this.ldapClient === null)
      this.ldapClient = ldap.createClient({
        url: "ldap://ldap.iitm.ac.in:389",
      });
  }

  // Check LDAP athentication
  auth(roll: string, password: string) {
    this.connect();
    const client = this.ldapClient;
    return new Promise((resolve, reject) => {
      client!.bind(rootdn, LDAP_ADMIN_PASSWORD, function (err) {
        if (err) return reject(err);

        client!.search(
          maindn,
          {
            filter: `(&(uid=${roll}))`,
            scope: "sub",
          },
          (err, search) => {
            if (err) return reject(err);

            let found = false;
            search.once("searchEntry", (res) => {
              found = true;
              client!.bind(res.dn, password, (err) => {
                if (err) return reject(err);
                return resolve(res.object);
              });
            });

            search.once("end", () => {
              if (!found)
                return reject({
                  name: "DoesNotExistError",
                  message: "The roll number doesn't exist",
                });
            });
          }
        );
      });
    });
  }

  // Search user in LDAP
  search(searchStr: string, sizeLimit?: number | undefined) {
    this.connect();
    const client = this.ldapClient;
    return new Promise((resolve, reject) => {
      client!.bind(rootdn, LDAP_ADMIN_PASSWORD, function (err) {
        if (err) return reject(err);

        client!.search(
          `ou=student,${maindn}`,
          {
            filter: `(&(|(uid=*${searchStr}*)(displayName=*${searchStr}*))(!(uid=*exp*)))`,
            scope: "sub",
            paged: true,
            sizeLimit: sizeLimit,
          },
          (err, res) => {
            if (err) return reject(err);

            let users: any[] = [];

            res.on("searchRequest", (searchRequest) => {
              console.log("searchRequest: ", searchRequest.messageID);
            });

            res.on("searchEntry", (entry) => {
              console.log("entry: " + JSON.stringify(entry.object));
              users.push(entry.object);
            });

            res.on("searchReference", (referral) => {
              console.log("referral: " + referral.uris.join());
            });

            res.on("error", (err) => {
              console.error("error: " + err.message);
              return reject(err);
            });

            res.on("end", (result) => {
              console.log("status: " + result?.status);
              return resolve(users);
            });
          }
        );
      });
    });
  }
}

const client = new LDAPClient();

export default client;
