const fs = require('fs');
const targetPath = './src/environments/environment.ts';

const envConfigFile = `
export const environment = {
  production: true,
  apiUrl: '${process.env.ANGULAR_API_URL || 'https://cursitu-api.onrender.com/api'}'
};
`;

fs.writeFile(targetPath, envConfigFile, function (err) {
   if (err) {
       throw console.error(err);
   }
   console.log(`Environment generado correctamente en ${targetPath}`);
});