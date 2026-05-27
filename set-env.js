const fs = require('fs');
const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `
export const environment = {
  production: true,
  api: '/api',
  apiUrl: '/api'
};
`;

fs.writeFile(targetPath, envConfigFile, function (err) {
   if (err) {
       throw console.error(err);
   }
   console.log('Environment configurado con rutas relativas de forma exitosa.');
});