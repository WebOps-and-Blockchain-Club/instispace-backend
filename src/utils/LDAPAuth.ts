import ldap from "ldapjs";
import dotenv from "dotenv";

dotenv.config();

const client = ldap.createClient({ url: "ldap://ldap.iitm.ac.in:389" });

const LDAP_USERNAME = process.env.LDAP_USERNAME!;
const LDAP_PASSWORD = process.env.LDAP_PASSWORD!;

const maindn = "dc=ldap,dc=iitm,dc=ac,dc=in";
const rootdn = `uid=${LDAP_USERNAME},ou=bind,${maindn}`;

export const LDAPAuth = (roll: string, password: string) => {
  return new Promise((resolve, reject) => {
    client.bind(rootdn, LDAP_PASSWORD, function (err: any) {
      if (err) return reject(err);

      client.search(
        maindn,
        {
          filter: `(&(uid=${roll}))`,
          attributes: ["displayName"],
          scope: "sub",
        },
        (err: any, search: any) => {
          if (err) return reject(err);

          let found = false;
          search.once("searchEntry", (res: any) => {
            found = true;
            client.bind(res.dn, password, (err: any) => {
              if (err) return reject(err);

              const user = {
                roll,
                degree: res.dn.match(/ou=(?<degree>[a-z]+)/).groups.degree,
              };
              return resolve(user);
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
};
