// const dotenv = require("dotenv");
// dotenv.config({
//   path: "../.env",
// });

// let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
// if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
//   throw new Error("Incomplete PostgreSQL configuration");
// }
// // console.log(PGDATABASE);
// const configs = {
//   development: {
//     username: PGUSER,
//     password: PGPASSWORD,
//     database: PGDATABASE,
//     host: PGHOST,
//     dialect: "postgres",
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//       connection: {
//         options: `project=${ENDPOINT_ID}`,
//       },
//     },
//     sslmode: "require",
//     pool: {
//       max: 10,
//       min: 0,
//       idle: 10000,
//     },
//   },
// };

// module.exports = configs;
